/*
 * D1 은 datetime('now') 로 UTC 시각을 "YYYY-MM-DD HH:MM:SS" 로 저장한다.
 * 관리자 화면에는 한국 시각(UTC+9)으로 바꿔 보여 준다.
 */
const KST = 9 * 60 * 60 * 1000;

function toKst(utc: string): string {
  const t = Date.parse(utc.replace(" ", "T") + "Z");
  if (Number.isNaN(t)) return utc;
  return new Date(t + KST).toISOString().replace("T", " ");
}

/** "2026-10-22 12:37" */
export function kstMinute(utc: string) {
  return toKst(utc).slice(0, 16);
}

/** "2026-10-22" */
export function kstDate(utc: string) {
  return toKst(utc).slice(0, 10);
}

/** "10-22 12:37" */
export function kstShort(utc: string) {
  return toKst(utc).slice(5, 16);
}

/** 오늘(한국 날짜) "YYYY-MM-DD" */
export function kstToday() {
  return new Date(Date.now() + KST).toISOString().slice(0, 10);
}
