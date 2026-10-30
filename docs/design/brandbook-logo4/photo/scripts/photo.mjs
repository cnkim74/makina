// 실사 적용 예시 PDF (A4 가로): node photo.mjs <logo-paths.ts> <Pretendard 폴더> <사진 폴더> <출력 html>
import fs from "node:fs";
import path from "node:path";
const [TS, FONTS, PH, OUT] = process.argv.slice(2);
const s = fs.readFileSync(TS, "utf8");
const g = (n) => JSON.parse(s.match(new RegExp(`export const ${n} = (\\{.*?\\});`))[1]);
const M = g("MARK"), W = g("WORDMARK"); const K = M.w / M.h;
const C = { gold: "#E0A526", soil: "#1C1A17", cream: "#F4EDDC", accent: "#8A5D00", muted: "#6A6358", mutedDark: "#B9B09F", line: "#D9CFB8" };
const lock = (hmm, mf, wf) => { const mw = 160 * K, w = mw + 44 + W.w; return `<svg viewBox="0 0 ${w} 160" style="height:${hmm}mm;display:block"><path transform="scale(${160 / M.h})" d="${M.d}" fill="${mf}"/><path transform="translate(${mw + 44} 36)" d="${W.d}" fill="${wf}"/></svg>`; };
const font = [["Light", 300], ["Regular", 400], ["SemiBold", 600], ["Bold", 700], ["ExtraBold", 800]].map(([n, w]) => `@font-face{font-family:"Pretendard";font-weight:${w};src:url("file://${FONTS}/Pretendard-${n}.otf")}`).join("\n");
const css = `${font}
@page{size:297mm 210mm;margin:0}*{box-sizing:border-box;margin:0;padding:0}
html,body{font-family:Pretendard,sans-serif;color:${C.soil};-webkit-print-color-adjust:exact;print-color-adjust:exact;word-break:keep-all}
.pg{position:relative;width:297mm;height:210mm;overflow:hidden;page-break-after:always;background:#fff}.pg:last-child{page-break-after:auto}
.dk{background:${C.soil};color:${C.cream}}
.ph{position:absolute;left:14mm;top:12mm;width:269mm;height:179.3mm;object-fit:cover;display:block}
.cap{position:absolute;left:14mm;right:14mm;bottom:6.5mm;display:flex;align-items:baseline;gap:6mm;font-size:8pt;color:${C.muted}}
.cap b{font-size:11pt;font-weight:800;color:${C.soil};letter-spacing:-0.02em}.cap .n{font-weight:300;font-size:11pt;color:${C.accent}}
.cap .r{margin-left:auto;font-size:6.6pt;letter-spacing:0.14em}`;
const items = [
  ["factory", "사옥 간판", "흙먹 바탕 띠 간판 · 심볼 금색, 글자 크림 입체 채널(LED)"],
  ["pylon", "지주 간판", "위: 심볼 + 워드마크 / 가운데: DRAGON / 아래: 전화"],
  ["truck", "1톤 탑차", "흙먹 랩핑 · 가로 조합 반전 · 뒤쪽에 심볼을 크게 잘라 씀"],
  ["cards", "명함", "앞: 흰 종이 가로 조합 + 금색 선 / 뒤: 흙먹 바탕 세로 배치"],
  ["stationery", "레터헤드 · 봉투", "레터헤드 · 대봉투(흙먹 띠 반전) · 소봉투(금색 띠)"],
  ["wear", "작업복 · 모자", "가슴: 가로 조합 자수 / 모자: 심볼 금사 입체 자수"],
  ["booth", "박람회 부스", "흙먹 뒷벽 가로 조합 반전 · 상담 카운터 심볼"],
  ["merch", "판촉물", "머그 · 수건 · 볼펜 · 원형 스티커"],
];
const P = [];
P.push(`<section class="pg dk"><div style="position:absolute;left:0;top:0;bottom:0;width:12mm;background:${C.gold}"></div>
<div style="position:absolute;left:32mm;top:18mm;font-size:8pt;font-weight:700;letter-spacing:0.32em;color:${C.gold}">10 실사 적용 예</div>
<div style="position:absolute;left:32mm;top:70mm">${lock(36, C.gold, C.cream)}</div>
<div style="position:absolute;left:32mm;top:122mm;font-size:24pt;font-weight:300;letter-spacing:-0.04em;line-height:1.25">실제 자리에서 본<br><b style="font-weight:800">발톱.</b></div>
<div style="position:absolute;left:32mm;bottom:16mm;right:24mm;font-size:7.6pt;line-height:1.7;color:${C.mutedDark}">로고 시안 4 「발톱」 실사 적용 예시 · 사옥 간판, 지주 간판, 탑차, 명함, 레터헤드·봉투, 작업복·모자, 박람회 부스, 판촉물<br>장면은 AI로 만든 사진이고, 로고는 실제 로고 도형(logo-paths)을 원근에 맞춰 합성했습니다. 실제 시공·인쇄 결과와 다를 수 있습니다.</div></section>`);
items.forEach(([f, t, d], i) => {
  const no = String(i + 1).padStart(2, "0");
  const cap = `<div class="cap"><span class="n">${no}</span><b>${t}</b><span>${d}</span><span class="r">MAKKINA · 로고 시안 4 「발톱」</span></div>`;
  if (f === "pylon")
    P.push(`<section class="pg"><img src="file://${PH}/${f}.jpg" style="position:absolute;left:14mm;top:12mm;height:179.3mm;width:134mm;object-fit:cover;display:block">
    <div style="position:absolute;left:160mm;right:14mm;top:12mm;bottom:20mm;display:flex;flex-direction:column;justify-content:flex-end">
    <p style="font-size:8pt;font-weight:700;letter-spacing:0.24em;color:${C.accent}">${no} ${t}</p>
    <p style="font-size:20pt;font-weight:300;letter-spacing:-0.04em;margin-top:3mm;line-height:1.25">도로에서<br><b style="font-weight:800">찾아오게.</b></p>
    <p style="font-size:9pt;line-height:1.7;color:#3B372F;margin-top:5mm">${d}. 공장 입구 큰길 쪽에 세웁니다. 전화번호는 지나가는 차에서도 읽히게 크게.</p></div>${cap}</section>`);
  else P.push(`<section class="pg"><img class="ph" src="file://${PH}/${f}.jpg">${cap}</section>`);
});
fs.writeFileSync(OUT, `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${css}</style></head><body>${P.join("\n")}</body></html>`);
console.log("photo html", P.length);
