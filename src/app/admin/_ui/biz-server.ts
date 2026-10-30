import "server-only";
import type { D1Database } from "@/lib/cf";
import { all } from "@/lib/db";
import type { CustomerOpt } from "./biz-client";

/** 견적서·계약서·매출 화면의 고객 고르기 목록 */
export async function customerOptions(db: D1Database): Promise<CustomerOpt[]> {
  return all<CustomerOpt>(db, "SELECT id, name, phone, address FROM customers ORDER BY updated_at DESC LIMIT 2000");
}

/** "2026-10" 형식 확인 */
export function ym(v: string | undefined, fallback: string) {
  return v && /^\d{4}-\d{2}$/.test(v) ? v : fallback;
}
