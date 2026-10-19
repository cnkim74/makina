import "server-only";
import { getDb, type D1Database } from "./cf";

/** DB 가 연결되어 있고 스키마(마이그레이션)까지 적용되어 있는지 */
export type DbState = { ok: true; db: D1Database } | { ok: false; reason: "no-binding" | "no-schema" };

export async function dbState(): Promise<DbState> {
  const db = await getDb();
  if (!db) return { ok: false, reason: "no-binding" };
  try {
    const row = await db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'")
      .first<{ name: string }>();
    if (!row) return { ok: false, reason: "no-schema" };
    return { ok: true, db };
  } catch {
    return { ok: false, reason: "no-schema" };
  }
}

/** DB 가 준비되어 있으면 반환, 아니면 null */
export async function readyDb(): Promise<D1Database | null> {
  const st = await dbState();
  return st.ok ? st.db : null;
}

export async function all<T>(db: D1Database, sql: string, ...params: unknown[]): Promise<T[]> {
  const r = await db.prepare(sql).bind(...params).all<T>();
  return r.results ?? [];
}

export async function first<T>(db: D1Database, sql: string, ...params: unknown[]): Promise<T | null> {
  return db.prepare(sql).bind(...params).first<T>();
}

export async function run(db: D1Database, sql: string, ...params: unknown[]) {
  return db.prepare(sql).bind(...params).run();
}

/** 문자열 길이 자르기 + 공백 정리 */
export function clean(v: unknown, max = 500): string {
  return String(v ?? "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, max);
}
