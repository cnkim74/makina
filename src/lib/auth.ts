import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { D1Database } from "./cf";
import { first, readyDb, run } from "./db";

/*
 * 관리자 인증.
 * - 비밀번호: PBKDF2-SHA256 (10만 회, 솔트 16바이트) — Workers 의 Web Crypto 로 계산
 * - 세션: 무작위 토큰을 httpOnly 쿠키로, DB 에는 토큰의 SHA-256 만 저장
 * - 역할: owner > admin > editor. 첫 가입자는 owner, 이후 가입자는 승인 대기(pending)
 */

export type Role = "owner" | "admin" | "editor";
export type User = {
  id: number;
  email: string;
  name: string;
  role: Role;
  status: "pending" | "active" | "disabled";
};

const COOKIE = "mk_session";
const SESSION_DAYS = 30;
const PBKDF2_ITER = 100_000;
const RANK: Record<Role, number> = { editor: 1, admin: 2, owner: 3 };

const enc = new TextEncoder();

function b64(bytes: ArrayBuffer | Uint8Array): string {
  const u = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of u) s += String.fromCharCode(b);
  return btoa(s);
}

function fromB64(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function randomBytes(n: number): Uint8Array<ArrayBuffer> {
  const a = new Uint8Array(new ArrayBuffer(n));
  crypto.getRandomValues(a);
  return a;
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITER },
    key,
    256,
  );
  return b64(bits);
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  return { hash: await derive(password, salt), salt: b64(salt) };
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function verifyPassword(password: string, hash: string, salt: string) {
  return safeEqual(await derive(password, fromB64(salt)), hash);
}

async function sha256(s: string) {
  return b64(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}

export function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return "비밀번호는 8자 이상으로 정해 주세요.";
  if (pw.length > 200) return "비밀번호가 너무 깁니다.";
  return null;
}

/* ── 세션 ── */

export async function createSession(db: D1Database, userId: number) {
  const token = b64(randomBytes(32)).replace(/[+/=]/g, (c) => ({ "+": "-", "/": "_", "=": "" })[c] ?? "");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await run(
    db,
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    await sha256(token),
    userId,
    expires.toISOString(),
  );
  await run(db, "UPDATE users SET last_login_at = datetime('now') WHERE id = ?", userId);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  const db = await readyDb();
  if (token && db) await run(db, "DELETE FROM sessions WHERE id = ?", await sha256(token));
  jar.delete(COOKIE);
}

/** 지금 로그인한 사용자 (활성 상태만) */
export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const db = await readyDb();
  if (!db) return null;
  const row = await first<User & { expires_at: string }>(
    db,
    `SELECT u.id, u.email, u.name, u.role, u.status, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id = ?`,
    await sha256(token),
  );
  if (!row || row.status !== "active" || new Date(row.expires_at) < new Date()) return null;
  return { id: row.id, email: row.email, name: row.name, role: row.role, status: row.status };
}

export function hasRole(user: User, min: Role) {
  return RANK[user.role] >= RANK[min];
}

/** 관리자 화면·서버 액션 맨 앞에서 부른다. 권한이 없으면 로그인 화면으로 */
export async function requireUser(min: Role = "editor"): Promise<User> {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  if (!hasRole(user, min)) redirect("/admin?denied=1");
  return user;
}

/* ── 로그인 시도 제한: 15분 안에 5번 틀리면 15분 잠금 ── */

export async function isLocked(db: D1Database, email: string) {
  const r = await first<{ n: number }>(
    db,
    "SELECT COUNT(*) AS n FROM login_failures WHERE email = ? AND created_at > datetime('now', '-15 minutes')",
    email,
  );
  return (r?.n ?? 0) >= 5;
}

export async function recordFailure(db: D1Database, email: string) {
  await run(db, "INSERT INTO login_failures (email) VALUES (?)", email);
  await run(db, "DELETE FROM login_failures WHERE created_at < datetime('now', '-1 day')");
}

export async function clearFailures(db: D1Database, email: string) {
  await run(db, "DELETE FROM login_failures WHERE email = ?", email);
}
