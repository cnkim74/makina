"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getBucket } from "@/lib/cf";
import type { D1Database } from "@/lib/cf";
import { clean, first, readyDb, run } from "@/lib/db";
import { setSetting, getSetting } from "@/lib/settings";
import { kstToday } from "@/lib/time";
import { LANDING_SECTIONS, type LandingSectionId } from "@/lib/types";
import {
  CONTRACT_STATUS,
  GRADE,
  QUOTE_STATUS,
  SALE_CATEGORY,
  parseItems,
  totals,
  type LineItem,
  type PriceItem,
  type VatMode,
} from "@/lib/biz";

/* 영업 관리 서버 동작: 고객 · 단가표 · 견적 · 계약 · 매출 · 목표 · 명함 · 랜딩페이지 */

async function db() {
  const d = await readyDb();
  if (!d) redirect("/admin");
  return d;
}

function back(path: string, msg: string): never {
  revalidatePath(path);
  redirect(`${path}${path.includes("?") ? "&" : "?"}msg=${encodeURIComponent(msg)}`);
}

const num = (v: FormDataEntryValue | null) => Number(v ?? NaN);
const int = (v: FormDataEntryValue | null) => Math.max(0, Math.round(Number(String(v ?? "").replace(/[^\d.-]/g, "")) || 0));
const day = (v: FormDataEntryValue | null) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "")) ? String(v) : "");
const oneOf = <T extends string>(v: FormDataEntryValue | null, keys: readonly T[], dflt: T): T =>
  keys.includes(String(v) as T) ? (String(v) as T) : dflt;
const VAT_MODES = ["exclusive", "inclusive", "none"] as const;

/** 문서 번호: Q-261030-01, C-261030-01 */
async function nextDocNo(d: D1Database, table: "quotes" | "contracts", prefix: "Q" | "C") {
  const ymd = kstToday().slice(2).replace(/-/g, "");
  const head = `${prefix}-${ymd}-`;
  const row = await first<{ n: number }>(d, `SELECT COUNT(*) AS n FROM ${table} WHERE doc_no LIKE ?`, head + "%");
  return head + String((row?.n ?? 0) + 1).padStart(2, "0");
}

function itemsFrom(fd: FormData): LineItem[] {
  return parseItems(String(fd.get("items") ?? "[]")).slice(0, 30);
}

/** 고객 칸에 이름만 적었고 "고객으로 등록"을 골랐으면 고객 표에 넣고 id 를 돌려준다 */
async function ensureCustomer(d: D1Database, fd: FormData): Promise<number | null> {
  const id = num(fd.get("customer_id"));
  if (id > 0) return id;
  if (fd.get("save_customer") !== "on") return null;
  const name = clean(fd.get("customer_name"), 60);
  if (!name) return null;
  const r = await run(
    d,
    "INSERT INTO customers (name, phone, address, grade) VALUES (?, ?, ?, 'prospect')",
    name,
    clean(fd.get("customer_phone"), 30),
    clean(fd.get("customer_addr"), 200),
  );
  return Number(r.meta.last_row_id) || null;
}

/* ───────────── 고객(회원) ───────────── */

export async function saveCustomer(fd: FormData) {
  await requireUser("editor");
  const d = await db();
  const id = num(fd.get("id"));
  const name = clean(fd.get("name"), 60);
  if (!name) back(id > 0 ? `/admin/customers/${id}` : "/admin/customers", "이름을 적어 주세요.");
  const vals = [
    name,
    clean(fd.get("phone"), 30),
    clean(fd.get("phone2"), 30),
    clean(fd.get("email"), 120),
    clean(fd.get("region"), 40),
    clean(fd.get("address"), 200),
    clean(fd.get("farm"), 200),
    clean(fd.get("tractor"), 120),
    clean(fd.get("machines"), 300),
    clean(fd.get("source"), 60),
    oneOf(fd.get("grade"), Object.keys(GRADE) as (keyof typeof GRADE)[], "normal"),
    clean(fd.get("memo"), 3000),
  ];
  if (id > 0) {
    await run(
      d,
      `UPDATE customers SET name = ?, phone = ?, phone2 = ?, email = ?, region = ?, address = ?, farm = ?, tractor = ?,
        machines = ?, source = ?, grade = ?, memo = ?, updated_at = datetime('now') WHERE id = ?`,
      ...vals,
      id,
    );
    back(`/admin/customers/${id}`, "고객 정보를 저장했습니다.");
  }
  const r = await run(
    d,
    `INSERT INTO customers (name, phone, phone2, email, region, address, farm, tractor, machines, source, grade, memo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ...vals,
  );
  back(`/admin/customers/${r.meta.last_row_id}`, `“${name}” 고객을 등록했습니다.`);
}

export async function deleteCustomer(fd: FormData) {
  await requireUser("admin");
  const d = await db();
  await run(d, "DELETE FROM customers WHERE id = ?", num(fd.get("id")));
  back("/admin/customers", "고객을 지웠습니다. 견적·계약·매출 기록은 이름만 남습니다.");
}

/* ───────────── 단가표 ───────────── */

/** 한 줄에 "품목 | 규격 | 단가" */
export async function savePricebook(fd: FormData) {
  await requireUser("admin");
  const d = await db();
  const items: PriceItem[] = String(fd.get("lines") ?? "")
    .split("\n")
    .map((l) => l.split("|").map((x) => x.trim()))
    .filter((p) => p[0])
    .slice(0, 100)
    .map(([name, spec = "", price = "0"]) => ({
      name: name.slice(0, 80),
      spec: spec.slice(0, 120),
      price: Math.max(0, Math.round(Number(price.replace(/[^\d]/g, "")) || 0)),
    }));
  await setSetting(d, "pricebook", { items });
  back("/admin/quotes", `단가표 ${items.length}개 품목을 저장했습니다.`);
}

/* ───────────── 견적서 ───────────── */

export async function saveQuote(fd: FormData) {
  const user = await requireUser("editor");
  const d = await db();
  const id = num(fd.get("id"));
  const name = clean(fd.get("customer_name"), 60);
  const items = itemsFrom(fd);
  if (!name) back(id > 0 ? `/admin/quotes/${id}` : "/admin/quotes/new", "받는 분(고객) 이름을 적어 주세요.");
  if (!items.length) back(id > 0 ? `/admin/quotes/${id}` : "/admin/quotes/new", "품목을 한 줄 이상 적어 주세요.");
  const customerId = await ensureCustomer(d, fd);
  const vals = [
    customerId,
    name,
    clean(fd.get("customer_phone"), 30),
    clean(fd.get("customer_addr"), 200),
    clean(fd.get("title"), 120),
    JSON.stringify(items),
    int(fd.get("discount")),
    oneOf(fd.get("vat_mode"), VAT_MODES, "exclusive"),
    day(fd.get("valid_until")),
    clean(fd.get("note"), 2000),
    oneOf(fd.get("status"), Object.keys(QUOTE_STATUS) as (keyof typeof QUOTE_STATUS)[], "draft"),
  ];
  if (id > 0) {
    await run(
      d,
      `UPDATE quotes SET customer_id = ?, customer_name = ?, customer_phone = ?, customer_addr = ?, title = ?, items = ?,
        discount = ?, vat_mode = ?, valid_until = ?, note = ?, status = ?, updated_at = datetime('now') WHERE id = ?`,
      ...vals,
      id,
    );
    back(`/admin/quotes/${id}`, "견적서를 저장했습니다.");
  }
  const docNo = await nextDocNo(d, "quotes", "Q");
  const r = await run(
    d,
    `INSERT INTO quotes (customer_id, customer_name, customer_phone, customer_addr, title, items, discount, vat_mode, valid_until, note, status, doc_no, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ...vals,
    docNo,
    user.name,
  );
  back(`/admin/quotes/${r.meta.last_row_id}`, `견적서 ${docNo} 를 만들었습니다.`);
}

export async function deleteQuote(fd: FormData) {
  await requireUser("admin");
  const d = await db();
  await run(d, "DELETE FROM quotes WHERE id = ?", num(fd.get("id")));
  back("/admin/quotes", "견적서를 지웠습니다.");
}

/** 견적서 내용으로 계약서 초안을 만든다 */
export async function quoteToContract(fd: FormData) {
  const user = await requireUser("editor");
  const d = await db();
  const q = await first<{
    id: number; customer_id: number | null; customer_name: string; customer_phone: string; customer_addr: string;
    items: string; discount: number; vat_mode: VatMode;
  }>(d, "SELECT * FROM quotes WHERE id = ?", num(fd.get("id")));
  if (!q) back("/admin/quotes", "견적서를 찾지 못했습니다.");
  const docNo = await nextDocNo(d, "contracts", "C");
  const r = await run(
    d,
    `INSERT INTO contracts (doc_no, quote_id, customer_id, customer_name, customer_phone, customer_addr, items, discount, vat_mode, warranty, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    docNo,
    q.id,
    q.customer_id,
    q.customer_name,
    q.customer_phone,
    q.customer_addr,
    q.items,
    q.discount,
    q.vat_mode,
    "출고일로부터 1년 (소모품 제외)",
    user.name,
  );
  await run(d, "UPDATE quotes SET status = 'won', updated_at = datetime('now') WHERE id = ?", q.id);
  back(`/admin/contracts/${r.meta.last_row_id}`, `견적서로 계약서 ${docNo} 초안을 만들었습니다. 빈 칸을 채워 주세요.`);
}

/* ───────────── 계약서 ───────────── */

export async function saveContract(fd: FormData) {
  const user = await requireUser("editor");
  const d = await db();
  const id = num(fd.get("id"));
  const name = clean(fd.get("customer_name"), 60);
  const items = itemsFrom(fd);
  const path = id > 0 ? `/admin/contracts/${id}` : "/admin/contracts/new";
  if (!name) back(path, "매수인(고객) 이름을 적어 주세요.");
  if (!items.length) back(path, "계약 품목을 한 줄 이상 적어 주세요.");
  const customerId = await ensureCustomer(d, fd);
  const vals = [
    customerId,
    name,
    clean(fd.get("customer_phone"), 30),
    clean(fd.get("customer_addr"), 200),
    clean(fd.get("customer_birth"), 20),
    JSON.stringify(items),
    int(fd.get("discount")),
    oneOf(fd.get("vat_mode"), VAT_MODES, "exclusive"),
    int(fd.get("deposit")),
    day(fd.get("deposit_date")),
    day(fd.get("balance_date")),
    day(fd.get("delivery_date")),
    clean(fd.get("delivery_place"), 200),
    clean(fd.get("warranty"), 200),
    clean(fd.get("special_terms"), 3000),
    oneOf(fd.get("status"), Object.keys(CONTRACT_STATUS) as (keyof typeof CONTRACT_STATUS)[], "draft"),
    day(fd.get("signed_on")),
  ];
  if (id > 0) {
    await run(
      d,
      `UPDATE contracts SET customer_id = ?, customer_name = ?, customer_phone = ?, customer_addr = ?, customer_birth = ?, items = ?,
        discount = ?, vat_mode = ?, deposit = ?, deposit_date = ?, balance_date = ?, delivery_date = ?, delivery_place = ?,
        warranty = ?, special_terms = ?, status = ?, signed_on = ?, updated_at = datetime('now') WHERE id = ?`,
      ...vals,
      id,
    );
    back(path, "계약서를 저장했습니다.");
  }
  const docNo = await nextDocNo(d, "contracts", "C");
  const r = await run(
    d,
    `INSERT INTO contracts (customer_id, customer_name, customer_phone, customer_addr, customer_birth, items, discount, vat_mode,
       deposit, deposit_date, balance_date, delivery_date, delivery_place, warranty, special_terms, status, signed_on, doc_no, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ...vals,
    docNo,
    user.name,
  );
  back(`/admin/contracts/${r.meta.last_row_id}`, `계약서 ${docNo} 를 만들었습니다.`);
}

export async function deleteContract(fd: FormData) {
  await requireUser("admin");
  const d = await db();
  await run(d, "DELETE FROM contracts WHERE id = ?", num(fd.get("id")));
  back("/admin/contracts", "계약서를 지웠습니다.");
}

/** 계약 품목을 매출 장부에 한 줄씩 옮긴다 (공급가·부가세·받은 계약금은 품목 금액 비율로 나눔) */
export async function contractToSales(fd: FormData) {
  await requireUser("admin");
  const d = await db();
  const c = await first<{
    id: number; customer_id: number | null; customer_name: string; customer_addr: string; items: string; discount: number;
    vat_mode: VatMode; deposit: number; signed_on: string; delivery_date: string;
  }>(d, "SELECT * FROM contracts WHERE id = ?", num(fd.get("id")));
  if (!c) back("/admin/contracts", "계약서를 찾지 못했습니다.");
  const dup = await first<{ n: number }>(d, "SELECT COUNT(*) AS n FROM sales WHERE contract_id = ?", c.id);
  if (dup?.n) back(`/admin/contracts/${c.id}`, "이미 매출에 올린 계약입니다. 매출 관리에서 고쳐 주세요.");
  const items = parseItems(c.items);
  const t = totals(items, c.discount, c.vat_mode);
  const lineSum = items.reduce((s, it) => s + it.qty * it.price, 0) || 1;
  const region = c.customer_addr.split(/\s+/).slice(0, 2).join(" ");
  const soldOn = c.delivery_date || c.signed_on || kstToday();
  let restSupply = t.supply;
  let restVat = t.vat;
  let restPaid = Math.min(c.deposit, t.total);
  const stmts = items.map((it, i) => {
    const last = i === items.length - 1;
    const share = (it.qty * it.price) / lineSum;
    const supply = last ? restSupply : Math.round(t.supply * share);
    const vat = last ? restVat : Math.round(t.vat * share);
    const paid = last ? restPaid : Math.min(restPaid, Math.round(Math.min(c.deposit, t.total) * share));
    restSupply -= supply;
    restVat -= vat;
    restPaid -= paid;
    const isParts = /칼날|벨트|부품|소모품/.test(it.name);
    return d
      .prepare(
        `INSERT INTO sales (sold_on, customer_id, customer_name, contract_id, category, item, qty, amount, vat, paid, region, memo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(soldOn, c.customer_id, c.customer_name, c.id, isParts ? "parts" : "machine", it.name, it.qty, supply, vat, paid, region, it.spec);
  });
  if (stmts.length) await d.batch(stmts);
  back("/admin/sales", `계약 품목 ${items.length}건을 매출에 올렸습니다.`);
}

/* ───────────── 매출 ───────────── */

export async function saveSale(fd: FormData) {
  await requireUser("admin");
  const d = await db();
  const id = num(fd.get("id"));
  const ret = clean(fd.get("return"), 120) || "/admin/sales";
  const sold = day(fd.get("sold_on")) || kstToday();
  const amount = int(fd.get("amount"));
  const vat = fd.get("auto_vat") === "on" ? Math.round(amount * 0.1) : int(fd.get("vat"));
  const customerId = num(fd.get("customer_id")) > 0 ? num(fd.get("customer_id")) : null;
  const vals = [
    sold,
    customerId,
    clean(fd.get("customer_name"), 60),
    oneOf(fd.get("category"), Object.keys(SALE_CATEGORY) as (keyof typeof SALE_CATEGORY)[], "machine"),
    clean(fd.get("item"), 80),
    Math.max(1, int(fd.get("qty"))),
    amount,
    vat,
    int(fd.get("paid")),
    clean(fd.get("method"), 20),
    clean(fd.get("region"), 40),
    clean(fd.get("memo"), 500),
  ];
  if (!vals[4]) back(ret, "품목을 적어 주세요.");
  if (id > 0) {
    await run(
      d,
      `UPDATE sales SET sold_on = ?, customer_id = ?, customer_name = ?, category = ?, item = ?, qty = ?, amount = ?, vat = ?,
        paid = ?, method = ?, region = ?, memo = ?, updated_at = datetime('now') WHERE id = ?`,
      ...vals,
      id,
    );
    back(ret, "매출을 저장했습니다.");
  }
  await run(
    d,
    `INSERT INTO sales (sold_on, customer_id, customer_name, category, item, qty, amount, vat, paid, method, region, memo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ...vals,
  );
  back(ret, "매출을 등록했습니다.");
}

export async function deleteSale(fd: FormData) {
  await requireUser("admin");
  const d = await db();
  const ret = clean(fd.get("return"), 120) || "/admin/sales";
  await run(d, "DELETE FROM sales WHERE id = ?", num(fd.get("id")));
  back(ret, "매출을 지웠습니다.");
}

/* ───────────── 목표 (실적) ───────────── */

/** 한 줄에 "품목 | 대수 | 금액" */
export async function saveTargets(fd: FormData) {
  await requireUser("admin");
  const d = await db();
  const year = Math.round(num(fd.get("year")));
  if (!(year >= 2020 && year <= 2100)) back("/admin/performance", "연도를 확인해 주세요.");
  const rows = String(fd.get("lines") ?? "")
    .split("\n")
    .map((l) => l.split("|").map((x) => x.trim()))
    .filter((p) => p[0])
    .slice(0, 50);
  const stmts = [d.prepare("DELETE FROM targets WHERE year = ?").bind(year)];
  for (const [item, qty = "0", amount = "0"] of rows) {
    stmts.push(
      d
        .prepare("INSERT OR REPLACE INTO targets (year, item, qty, amount) VALUES (?, ?, ?, ?)")
        .bind(year, item.slice(0, 80), int(qty), int(amount)),
    );
  }
  await d.batch(stmts);
  back(`/admin/performance?year=${year}`, `${year}년 목표 ${rows.length}줄을 저장했습니다.`);
}

/* ───────────── 명함 ───────────── */

const IMG: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic" };

async function putCardImage(file: FormDataEntryValue | null, side: "front" | "back"): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const ext = IMG[file.type];
  if (!ext) back("/admin/cards", "명함 사진은 jpg·png·webp 로 올려 주세요.");
  if (file.size > 8 * 1024 * 1024) back("/admin/cards", "명함 사진은 8MB 이하로 올려 주세요.");
  const bucket = await getBucket();
  if (!bucket) back("/admin/cards", "파일 저장소(R2)가 연결되지 않아 사진은 저장하지 못했습니다. 글자 정보만 저장해 주세요.");
  const key = `cards/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}-${side}.${ext}`;
  await bucket.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  return key;
}

export async function saveCard(fd: FormData) {
  await requireUser("editor");
  const d = await db();
  const id = num(fd.get("id"));
  const name = clean(fd.get("name"), 60);
  if (!name) back("/admin/cards", "이름을 적어 주세요.");
  const [front, backKey] = [await putCardImage(fd.get("front"), "front"), await putCardImage(fd.get("back"), "back")];
  const vals = [
    name,
    clean(fd.get("company"), 80),
    clean(fd.get("title"), 60),
    clean(fd.get("phone"), 30),
    clean(fd.get("mobile"), 30),
    clean(fd.get("email"), 120),
    clean(fd.get("address"), 200),
    clean(fd.get("tags"), 120),
    clean(fd.get("memo"), 2000),
    day(fd.get("met_on")),
  ];
  if (id > 0) {
    const old = await first<{ front_key: string; back_key: string }>(d, "SELECT front_key, back_key FROM name_cards WHERE id = ?", id);
    await run(
      d,
      `UPDATE name_cards SET name = ?, company = ?, title = ?, phone = ?, mobile = ?, email = ?, address = ?, tags = ?, memo = ?,
        met_on = ?, front_key = ?, back_key = ?, updated_at = datetime('now') WHERE id = ?`,
      ...vals,
      front ?? old?.front_key ?? "",
      backKey ?? old?.back_key ?? "",
      id,
    );
    const bucket = await getBucket();
    if (bucket && front && old?.front_key) await bucket.delete(old.front_key);
    if (bucket && backKey && old?.back_key) await bucket.delete(old.back_key);
    back("/admin/cards", `${name} 명함을 저장했습니다.`);
  }
  await run(
    d,
    `INSERT INTO name_cards (name, company, title, phone, mobile, email, address, tags, memo, met_on, front_key, back_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ...vals,
    front ?? "",
    backKey ?? "",
  );
  back("/admin/cards", `${name} 명함을 등록했습니다.`);
}

export async function deleteCard(fd: FormData) {
  await requireUser("admin");
  const d = await db();
  const id = num(fd.get("id"));
  const old = await first<{ front_key: string; back_key: string }>(d, "SELECT front_key, back_key FROM name_cards WHERE id = ?", id);
  await run(d, "DELETE FROM name_cards WHERE id = ?", id);
  const bucket = await getBucket();
  if (bucket && old) for (const k of [old.front_key, old.back_key]) if (k) await bucket.delete(k);
  back("/admin/cards", "명함을 지웠습니다.");
}

/** 명함 → 고객(회원)으로 옮기기 */
export async function cardToCustomer(fd: FormData) {
  await requireUser("editor");
  const d = await db();
  const c = await first<{ name: string; company: string; phone: string; mobile: string; email: string; address: string; memo: string }>(
    d,
    "SELECT * FROM name_cards WHERE id = ?",
    num(fd.get("id")),
  );
  if (!c) back("/admin/cards", "명함을 찾지 못했습니다.");
  const r = await run(
    d,
    "INSERT INTO customers (name, phone, phone2, email, address, farm, source, grade, memo) VALUES (?, ?, ?, ?, ?, ?, '명함', 'prospect', ?)",
    c.name,
    c.mobile || c.phone,
    c.mobile ? c.phone : "",
    c.email,
    c.address,
    c.company,
    c.memo,
  );
  back(`/admin/customers/${r.meta.last_row_id}`, `${c.name} 님을 고객으로 등록했습니다.`);
}

/* ───────────── 랜딩페이지 ───────────── */

export async function saveLanding(fd: FormData) {
  await requireUser("editor");
  const d = await db();
  const cur = await getSetting(d, "landing");
  const order = new Map(LANDING_SECTIONS.map((s, i) => [s.id, i]));
  const sections = LANDING_SECTIONS.map((s) => ({
    id: s.id as LandingSectionId,
    visible: fd.get(`vis_${s.id}`) === "on",
    pos: Number(fd.get(`pos_${s.id}`)) || (order.get(s.id) ?? 0) + 1,
  }))
    .sort((x, y) => x.pos - y.pos)
    .map(({ id, visible }) => ({ id, visible }));
  await setSetting(d, "landing", { ...cur, sections });
  revalidatePath("/");
  back("/admin/landing", "메인 페이지 구성을 저장했습니다. 홈페이지에 바로 반영됩니다.");
}

export async function moveLanding(fd: FormData) {
  await requireUser("editor");
  const d = await db();
  const cur = await getSetting(d, "landing");
  const list = [...cur.sections];
  const i = list.findIndex((s) => s.id === fd.get("id"));
  const j = i + (fd.get("dir") === "up" ? -1 : 1);
  if (i >= 0 && j >= 0 && j < list.length) [list[i], list[j]] = [list[j], list[i]];
  await setSetting(d, "landing", { ...cur, sections: list });
  revalidatePath("/");
  back("/admin/landing", "순서를 바꿨습니다.");
}
