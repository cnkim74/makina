/* 영업 관리(고객·견적·계약·매출·실적·명함)에서 서버·클라이언트가 함께 쓰는 모양과 계산 */

export type LineItem = { name: string; spec: string; qty: number; price: number };
export type VatMode = "exclusive" | "inclusive" | "none";

export const VAT_MODE: Record<VatMode, string> = {
  exclusive: "부가세 별도",
  inclusive: "부가세 포함",
  none: "부가세 없음",
};

export const GRADE = {
  prospect: "상담 고객",
  normal: "구매 고객",
  vip: "우수 고객",
  dealer: "대리점",
} as const;
export type Grade = keyof typeof GRADE;

export const QUOTE_STATUS = { draft: "작성 중", sent: "보냄", won: "계약됨", lost: "놓침" } as const;
export type QuoteStatus = keyof typeof QUOTE_STATUS;

export const CONTRACT_STATUS = {
  draft: "작성 중",
  signed: "계약 체결",
  delivered: "출고 완료",
  done: "잔금 완료",
  cancelled: "해지",
} as const;
export type ContractStatus = keyof typeof CONTRACT_STATUS;

export const SALE_CATEGORY = { machine: "본기", parts: "소모품·부품", service: "A/S·정비", etc: "기타" } as const;
export type SaleCategory = keyof typeof SALE_CATEGORY;

export const PAY_METHODS = ["계좌이체", "현금", "카드", "농협 융자", "할부", "기타"] as const;

/** 원 단위 금액: 12345678 → "12,345,678" */
export function won(n: number) {
  return Math.round(n || 0).toLocaleString("ko-KR");
}

/** 금액을 한글로 (견적서·계약서 "일금 ○○원정") */
export function wonHangul(n: number) {
  n = Math.round(Math.abs(n || 0));
  if (n === 0) return "영";
  const digits = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
  const small = ["", "십", "백", "천"];
  const big = ["", "만", "억", "조"];
  let out = "";
  let g = 0;
  while (n > 0) {
    const chunk = n % 10000;
    if (chunk) {
      let s = "";
      let c = chunk;
      for (let i = 0; i < 4 && c > 0; i++) {
        const d = c % 10;
        if (d) s = digits[d] + small[i] + s;
        c = Math.floor(c / 10);
      }
      out = s + big[g] + out;
    }
    n = Math.floor(n / 10000);
    g++;
  }
  return out;
}

export function parseItems(json: string | null | undefined): LineItem[] {
  try {
    const arr = JSON.parse(json || "[]");
    if (!Array.isArray(arr)) return [];
    return arr
      .map((x) => ({
        name: String(x?.name ?? "").slice(0, 80),
        spec: String(x?.spec ?? "").slice(0, 120),
        qty: Math.max(0, Math.round(Number(x?.qty) || 0)),
        price: Math.max(0, Math.round(Number(x?.price) || 0)),
      }))
      .filter((x) => x.name);
  } catch {
    return [];
  }
}

/** 품목 합계 → 공급가액·부가세·합계 */
export function totals(items: LineItem[], discount: number, mode: VatMode) {
  const gross = items.reduce((s, it) => s + it.qty * it.price, 0) - Math.max(0, discount || 0);
  const base = Math.max(0, gross);
  if (mode === "none") return { supply: base, vat: 0, total: base };
  if (mode === "inclusive") {
    const supply = Math.round(base / 1.1);
    return { supply, vat: base - supply, total: base };
  }
  const vat = Math.round(base * 0.1);
  return { supply: base, vat, total: base + vat };
}

/** 단가표 (견적서 품목 자동 채우기) */
export type PriceItem = { name: string; spec: string; price: number };
