import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/*
 * Cloudflare 바인딩 접근. 쓰는 기능만 최소 타입으로 정의한다
 * (wrangler 가 만드는 거대한 런타임 타입 파일에 기대지 않기 위해).
 */

export interface D1Result<T> {
  results: T[];
  success: boolean;
  meta: { changes?: number; last_row_id?: number };
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result<unknown>>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result<unknown>[]>;
}

export interface R2ObjectBody {
  body: ReadableStream;
  size: number;
  etag: string;
  httpMetadata?: { contentType?: string };
  range?: { offset?: number; length?: number; suffix?: number };
}

export type R2Range = { offset: number; length?: number } | { suffix: number };

export interface R2Bucket {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | Blob | string,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } },
  ): Promise<unknown>;
  get(key: string, options?: { range?: R2Range }): Promise<R2ObjectBody | null>;
  head(key: string): Promise<{ size: number; etag: string; httpMetadata?: { contentType?: string } } | null>;
  delete(key: string): Promise<void>;
}

export interface AppEnv {
  DB?: D1Database;
  MEDIA?: R2Bucket;
  /** GA4 보고서용 서비스 계정 (wrangler secret put 으로 넣는 비밀 값. 저장소·DB 에 두지 않는다) */
  GA_SA_EMAIL?: string;
  GA_SA_KEY?: string;
}

/** Cloudflare 환경. `next build` 처럼 바인딩이 없는 곳에서는 null */
export async function getEnv(): Promise<AppEnv | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env as unknown as AppEnv;
  } catch {
    return null;
  }
}

export async function getDb(): Promise<D1Database | null> {
  return (await getEnv())?.DB ?? null;
}

export async function getBucket(): Promise<R2Bucket | null> {
  return (await getEnv())?.MEDIA ?? null;
}
