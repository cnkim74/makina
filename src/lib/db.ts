import "server-only";
import { getDb, type D1Database } from "./cf";
import { SCHEMA_STATEMENTS } from "./schema.generated";

/** DB 가 연결되어 있고 스키마(마이그레이션)까지 적용되어 있는지 */
export type DbState =
  | { ok: true; db: D1Database }
  | { ok: false; reason: "no-binding" | "no-schema"; detail?: string };

async function hasSchema(db: D1Database) {
  const row = await db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'")
    .first<{ name: string }>();
  return !!row;
}

export async function dbState(): Promise<DbState> {
  const db = await getDb();
  if (!db) return { ok: false, reason: "no-binding" };
  try {
    if (await hasSchema(db)) return { ok: true, db };
    // 배포 명령에서 마이그레이션이 빠졌어도 첫 실행에 표를 만든다 (모두 IF NOT EXISTS 라 여러 번 돌아도 안전)
    await db.batch(SCHEMA_STATEMENTS.map((sql) => db.prepare(sql)));
    if (await hasSchema(db)) return { ok: true, db };
    return { ok: false, reason: "no-schema" };
  } catch (e) {
    return { ok: false, reason: "no-schema", detail: e instanceof Error ? e.message : String(e) };
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
