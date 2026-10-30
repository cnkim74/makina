// 성원마끼나 MAKKINA 브랜드북 — 로고 시안 4 「발톱」 (A4 가로 297×210, 12쪽)
// node brandbook.mjs <logo-paths.ts> <글꼴 폴더(Pretendard)> <cmyk.json> <출력 html>
// 로고 도형은 scripts/logo.mjs 가 만든 logo-paths.ts 를 그대로 쓴다(글자까지 도형).
import fs from "node:fs";
import path from "node:path";

const [LOGO_TS, FONTS, CMYK_JSON, OUT] = process.argv.slice(2);
const here = path.dirname(new URL(import.meta.url).pathname);
const src = fs.readFileSync(LOGO_TS, "utf8");
const grab = (n) => JSON.parse(src.match(new RegExp(`export const ${n} = (\\{.*?\\});`))[1]);
const MARK = grab("MARK");
const WORD = grab("WORDMARK");
const DRAGON = grab("DRAGON_WORD");
const CMYK = JSON.parse(fs.readFileSync(CMYK_JSON, "utf8"));

const C = {
  gold: "#E0A526", soil: "#1C1A17", cream: "#F4EDDC", brown: "#4A3A2C", green: "#5B7340",
  steel: "#8C9196", white: "#FAFAF6", orange: "#E4572E", accent: "#8A5D00", line: "#D9CFB8",
  muted: "#6A6358", mutedDark: "#B9B09F", lineDark: "#4A443B",
};
const f = (n) => +n.toFixed(2);

/* ── 로고 조각 (단위 mm) ── */
const mark = (h, fill = C.gold) =>
  `<svg viewBox="0 0 ${MARK.w} ${MARK.h}" style="display:block;flex:none;height:${h}mm;width:${f((h * MARK.w) / MARK.h)}mm"><path d="${MARK.d}" fill="${fill}"/></svg>`;
const word = (h, fill = C.soil, g = WORD) =>
  `<svg viewBox="0 0 ${g.w} ${g.h}" style="display:block;flex:none;height:${h}mm;width:${f((h * g.w) / g.h)}mm"><path d="${g.d}" fill="${fill}"/></svg>`;
// 가로 조합 — scripts/logo.mjs 와 같은 비율: 심볼 높이 = 글자 높이 × 1.6, 간격 0.44H, 글자는 0.06H 아래로
const lockW = (H) => f((1.6 * H * MARK.w) / MARK.h + 0.44 * H + (H * WORD.w) / 100);
const lockup = (H, markFill = C.gold, wordFill = C.soil) => {
  const k = 160 / MARK.h;
  const mw = MARK.w * k;
  const W = mw + 44 + WORD.w;
  return `<svg viewBox="0 0 ${f(W)} 160" style="display:block;flex:none;height:${f(1.6 * H)}mm;width:${f((1.6 * H * W) / 160)}mm"><path transform="scale(${f(k)})" d="${MARK.d}" fill="${markFill}"/><path transform="translate(${f(mw + 44)} 36)" d="${WORD.d}" fill="${wordFill}"/></svg>`;
};
// 국문 병기 조합 — 영문 아래 국문을 작게, 자간을 넓혀 받친다
const lockupKo = (H, markFill = C.gold, wordFill = C.soil, koFill = wordFill) =>
  `<div style="display:flex;align-items:center;gap:${f(0.44 * H)}mm">${mark(1.6 * H, markFill)}<div style="display:flex;flex-direction:column;gap:${f(0.26 * H)}mm">${word(H, wordFill)}<p style="font-family:GmarketSans;font-size:${f(0.42 * H)}mm;line-height:1;letter-spacing:${f(0.62 * H)}mm;color:${koFill};margin:0">성원마끼나</p></div></div>`;
// 세로 조합
const lockupV = (H, markFill = C.gold, wordFill = C.soil) =>
  `<div style="display:flex;flex-direction:column;align-items:center;gap:${f(0.5 * H)}mm">${mark(2.2 * H, markFill)}${word(H, wordFill)}</div>`;
// 앱 아이콘 — 흙먹 둥근 타일 위 금색 발톱
const tile = (s) =>
  `<div style="width:${s}mm;height:${s}mm;border-radius:${f(s * 0.22)}mm;background:${C.soil};display:flex;align-items:center;justify-content:center;flex:none">${mark(f(s * 0.72 * (MARK.h / Math.max(MARK.w, MARK.h))), C.gold)}</div>`;

const fontCss = [
  ["Thin", 100], ["Light", 300], ["Regular", 400], ["Medium", 500], ["SemiBold", 600], ["Bold", 700], ["ExtraBold", 800], ["Black", 900],
]
  .map(([n, w]) => `@font-face{font-family:"Pretendard";font-weight:${w};src:url("file://${FONTS}/Pretendard-${n}.otf")}`)
  .join("\n") +
  `\n@font-face{font-family:"GmarketSans";src:url("file://${path.join(here, "../fontdl/npm/noonnu-gmarket-sans-medium-0.1.0/package/fonts/gmarketsansmedium-normal.woff")}")}` +
  `\n@font-face{font-family:"Cafe24Dongdong";src:url("file://${path.join(here, "../fontdl/npm/noonnu-cafe24-dongdong-0.1.0/package/fonts/cafe24dongdong-normal.woff")}")}` +
  `\n@font-face{font-family:"HSBombaram";src:url("file://${path.join(here, "../fontdl/v21/HSBombaram2.1.ttf")}")}`;

const css = `
${fontCss}
@page { size: 297mm 210mm; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { font-family: "Pretendard", sans-serif; color: ${C.soil}; -webkit-print-color-adjust: exact; print-color-adjust: exact; word-break: keep-all; }
.pg { position: relative; width: 297mm; height: 210mm; overflow: hidden; page-break-after: always; background: #fff; }
.pg:last-child { page-break-after: auto; }
.dk { background: ${C.soil}; color: ${C.cream}; }
.cr { background: ${C.cream}; }
.in { position: absolute; left: 18mm; right: 18mm; top: 16mm; bottom: 14mm; display: flex; flex-direction: column; }
.eb { font-size: 8pt; font-weight: 700; letter-spacing: 0.24em; color: ${C.accent}; display: flex; align-items: center; gap: 3mm; }
.eb::before { content: ""; width: 10mm; height: 0.3mm; background: currentColor; }
.dk .eb { color: ${C.gold}; }
h1 { font-weight: 300; font-size: 24pt; letter-spacing: -0.04em; line-height: 1.22; margin-top: 4mm; }
h1 b { font-weight: 800; }
.lead { font-size: 10pt; line-height: 1.75; color: #3B372F; }
.dk .lead { color: ${C.mutedDark}; }
.cap { font-size: 7.4pt; line-height: 1.55; color: ${C.muted}; }
.dk .cap { color: ${C.mutedDark}; }
.box { border: 0.25mm solid ${C.line}; display: flex; align-items: center; justify-content: center; position: relative; }
.lbl { position: absolute; left: 3mm; top: 2.4mm; font-size: 6.6pt; font-weight: 700; letter-spacing: 0.08em; color: ${C.muted}; }
.folio { position: absolute; left: 18mm; right: 18mm; bottom: 7mm; display: flex; justify-content: space-between; font-size: 6.6pt; letter-spacing: 0.16em; color: ${C.muted}; }
.dk .folio { color: ${C.mutedDark}; }
table { border-collapse: collapse; }
`;

const folio = (n, t) => `<div class="folio"><span>MAKKINA BRAND BOOK · 로고 시안 4 「발톱」</span><span>${t} · ${String(n).padStart(2, "0")}</span></div>`;
const page = (n, cls, body, t = "") => `<section class="pg ${cls}">${body}${n > 1 && n < 12 ? folio(n, t) : ""}</section>`;
const P = [];

/* 1 표지 */
P.push(
  page(1, "dk", `
  <div style="position:absolute; left:0; top:0; bottom:0; width:12mm; background:${C.gold}"></div>
  <div class="in" style="left:32mm">
    <p style="font-size:8pt; font-weight:700; letter-spacing:0.32em; color:${C.gold}">BRAND BOOK 2026</p>
    <div style="margin-top:auto">${lockup(26, C.gold, C.cream)}</div>
    <p style="font-family:GmarketSans; font-size:14pt; letter-spacing:0.9em; margin-top:9mm; color:${C.cream}">성원마끼나</p>
    <div style="margin-top:auto; display:flex; justify-content:space-between; align-items:flex-end">
      <div><p style="font-size:11pt; font-weight:800">로고 시안 4 「발톱」 브랜드북</p>
      <p class="cap" style="margin-top:1.5mm">로고 · 색 · 서체 · 적용 기준</p></div>
      <p class="cap" style="text-align:right">경북 안동시 서후면 풍산태사로 2780<br>054-843-4000</p>
    </div>
  </div>`),
);

/* 2 브랜드 한 줄 + 차례 */
const toc = ["로고 이야기", "로고 구성", "구조와 비율", "여백과 최소 크기", "색", "색 버전", "잘못된 사용", "서체", "적용 예"];
P.push(
  page(2, "cr", `
  <div class="in" style="flex-direction:row; gap:20mm">
    <div style="flex:1.2; display:flex; flex-direction:column">
      <p class="eb">BRAND</p>
      <h1>이름처럼<br><b>일하는 기계.</b></h1>
      <p class="lead" style="margin-top:8mm; max-width:120mm">성원마끼나(MAKKINA)는 경북 안동 서후면에서 조사료 작업기를 직접 만들고, 직접 고치는 제조사입니다. 주력 제품 DRAGON은 베면서 줄기를 파쇄하는 하이브리드 모우어 컨디셔너입니다.</p>
      <p class="lead" style="margin-top:4mm; max-width:120mm">이 책은 로고 시안 4 「발톱」을 쓰는 기준을 담았습니다. 홈페이지, 인쇄물, 기계 각인, 작업복 어디에서나 같은 모습으로 보이게 하는 것이 목적입니다.</p>
      <table style="margin-top:auto; font-size:8.4pt; width:120mm">
        ${[["한 줄", "베면서 부순다."], ["말투", "짧게, 동사로 끝낸다. 숫자는 글보다 크게."], ["인상", "묵직함 · 장인 제조사 · 현장"], ["피할 것", "꾸밈을 위한 장식, 귀여운 말투, 사진보다 큰 그래픽"]]
          .map(([k, v]) => `<tr style="border-top:0.25mm solid ${C.line}"><th style="text-align:left; padding:2.2mm 0; width:22mm; font-weight:800">${k}</th><td style="color:#3B372F">${v}</td></tr>`)
          .join("")}
      </table>
    </div>
    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:0">
      <p class="eb" style="margin-bottom:5mm">차례</p>
      ${toc.map((t, i) => `<div style="display:flex; align-items:baseline; gap:6mm; border-top:0.25mm solid ${C.line}; padding:3.2mm 0"><span style="font-weight:200; font-size:16pt; color:${C.accent}; width:12mm">${String(i + 1).padStart(2, "0")}</span><span style="font-weight:700; font-size:11pt">${t}</span></div>`).join("")}
    </div>
  </div>`),
);

/* 3 로고 이야기 */
P.push(
  page(3, "", `
  <div class="in" style="flex-direction:row; gap:16mm">
    <div style="flex:1; display:flex; flex-direction:column">
      <p class="eb">01 로고 이야기</p>
      <h1>드래곤의 발톱,<br><b>한 번에 베어 나가는 날.</b></h1>
      <p class="lead" style="margin-top:7mm"><b style="color:${C.soil}">심볼 「발톱」</b> — 비스듬한 칼날 세 개. 드래곤이 지나간 자리의 발톱 자국이자, 작물을 한 번에 베어 나가는 날입니다. 가운데 날이 가장 길어 앞으로 나아가는 힘을 보여 줍니다.</p>
      <p class="lead" style="margin-top:4mm"><b style="color:${C.soil}">워드마크 MAKKINA</b> — 중장비처럼 모서리를 깎은 굵은 산업용 글자를 앞으로 10° 기울였습니다. 같은 글자 체계로 제품명 DRAGON도 씁니다.</p>
      <p class="lead" style="margin-top:4mm"><b style="color:${C.soil}">단순한 형태</b> — 로고는 기계 본체에 각인되고 스티커로 붙습니다. 그래서 한 가지 색으로도 읽히는 단순한 도형만 썼고, 글자까지 도형으로 그려 글꼴 없이도 같은 모양이 나옵니다.</p>
      <div style="margin-top:auto; display:flex; gap:6mm; align-items:center">${lockup(7, C.gold, C.soil)}</div>
    </div>
    <div style="width:118mm; background:${C.soil}; display:flex; align-items:center; justify-content:center; position:relative">
      ${mark(86, C.gold)}
      <p class="cap" style="position:absolute; left:6mm; bottom:5mm; color:${C.mutedDark}">칼날 세 개 · 가운데가 가장 길다</p>
    </div>
  </div>`, "로고 이야기"),
);

/* 4 로고 구성 */
const variants = [
  ["A  가로 조합 (기본)", lockup(13), "대부분의 자리에 씁니다. 홈페이지 위 메뉴, 인쇄물 표지, 명함."],
  ["B  국문 병기 조합", lockupKo(11), "처음 보는 사람에게 회사 이름을 알릴 때. 박람회, 간판, 현수막."],
  ["C  세로 조합", lockupV(11), "정사각형에 가까운 자리. 작업복 가슴, 모자, SNS 프로필."],
  ["D  심볼 · 워드마크 단독", `<div style="display:flex; align-items:center; gap:14mm">${mark(30)}${word(12)}</div>`, "심볼은 아이콘·각인·작은 자리, 워드마크는 공간이 아주 좁고 긴 자리."],
];
P.push(
  page(4, "", `
  <div class="in">
    <p class="eb">02 로고 구성</p>
    <h1>네 가지 <b>조합.</b></h1>
    <div style="margin-top:7mm; flex:1; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:5mm">
      ${variants
        .map(
          ([t, l, c]) => `<div style="display:flex; flex-direction:column"><div class="box" style="flex:1">${l}<span class="lbl">${t}</span></div><p class="cap" style="margin-top:1.8mm">${c}</p></div>`,
        )
        .join("")}
    </div>
  </div>`, "로고 구성"),
);

/* 5 구조와 비율 */
const gridMark = (() => {
  // 심볼을 100 단위 격자 위에 크게 — 칼날 폭 15, 간격 25, 높이 72·90, 기울기 약 67°
  const s = 0.95; // mm per unit
  const W = 110, H = 100;
  let g = "";
  for (let x = 0; x <= W; x += 5) g += `<line x1="${x}" y1="-5" x2="${x}" y2="${H}" stroke="${x % 25 === 0 ? "#cfc6b2" : "#ece6d8"}" stroke-width="${x % 25 === 0 ? 0.3 : 0.2}"/>`;
  for (let y = -5; y <= H; y += 5) g += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${(y + 5) % 25 === 0 ? "#cfc6b2" : "#ece6d8"}" stroke-width="${(y + 5) % 25 === 0 ? 0.3 : 0.2}"/>`;
  const dim = (x1, y1, x2, y2, t, tx, ty) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.accent}" stroke-width="0.35"/><text x="${tx}" y="${ty}" font-size="3.2" font-family="Pretendard" font-weight="700" fill="${C.accent}">${t}</text>`;
  return `<svg viewBox="-12 -8 ${W + 20} ${H + 14}" style="width:${(W + 20) * s}mm;height:${(H + 14) * s}mm;display:block">${g}<path transform="translate(5 5)" d="${MARK.d}" fill="${C.gold}"/>
    ${dim(5, 98, 20, 98, "15", 10.5, 102.5)}${dim(5, 95, 30, 95, "", 0, 0)}<text x="17" y="93.6" font-size="3.2" font-family="Pretendard" font-weight="700" fill="${C.accent}">25</text>
    ${dim(-4, 23, -4, 95, "", 0, 0)}<text x="-11" y="62" font-size="3.2" font-family="Pretendard" font-weight="700" fill="${C.accent}">72</text>
    ${dim(-8, 5, -8, 95, "", 0, 0)}<text x="-11.5" y="10" font-size="3.2" font-family="Pretendard" font-weight="700" fill="${C.accent}">90</text></svg>`;
})();
const ratio = (() => {
  const H = 12;
  return `<div style="position:relative; display:inline-block">${lockup(H)}
    <div style="position:absolute; left:${f((1.6 * H * MARK.w) / MARK.h + 0.44 * H)}mm; top:${f(0.36 * H)}mm; width:${f((H * WORD.w) / 100)}mm; height:${H}mm; border-top:0.3mm dashed ${C.accent}; border-bottom:0.3mm dashed ${C.accent}"></div>
    <div style="position:absolute; left:-6mm; top:0; height:${f(1.6 * H)}mm; border-left:0.35mm solid ${C.accent}"></div></div>`;
})();
P.push(
  page(5, "", `
  <div class="in" style="flex-direction:row; gap:12mm">
    <div style="flex:1; min-width:0; display:flex; flex-direction:column">
      <p class="eb">03 구조와 비율</p>
      <h1>숫자로 정한 <b>모양.</b></h1>
      <table style="margin-top:7mm; font-size:8.6pt; width:100%">
        ${[
          ["칼날", "밑변 폭 15 · 간격 25 · 가운데 높이 90, 양옆 72 (심볼 높이 90 기준)"],
          ["기울기", "칼날 모두 같은 각도(약 67°)로 오른쪽 위를 향한다"],
          ["글자", "대문자 높이 H 기준, 획 0.22H · 모서리 깎기 0.22H · 앞으로 10° 기울임"],
          ["가로 조합", "심볼 높이 = 1.6H · 심볼과 글자 사이 0.44H · 글자는 가운데에서 0.06H 아래"],
          ["국문", "영문 아래 글자 크기 0.42H, 자간을 넓혀 영문 폭에 맞춘다"],
        ]
          .map(([k, v]) => `<tr style="border-top:0.25mm solid ${C.line}"><th style="text-align:left; padding:2.6mm 0; width:22mm; font-weight:800; vertical-align:top">${k}</th><td style="padding:2.6mm 0; line-height:1.55; color:#3B372F">${v}</td></tr>`)
          .join("")}
      </table>
      <div style="margin-top:auto; padding:6mm 0 2mm 8mm">${ratio}</div>
      <p class="cap">점선 사이가 글자 높이 H, 세로선이 심볼 높이 1.6H. 비율을 바꾸지 않는다 — 원본 파일을 키우거나 줄여서만 쓴다.</p>
    </div>
    <div style="width:128mm; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:${C.white}; border:0.25mm solid ${C.line}">${gridMark}</div>
  </div>`, "구조와 비율"),
);

// 빗금 무늬: CSS 그라디언트는 CMYK 변환에서 빠지므로 SVG 도형으로 그린다 (단위 mm)
const hatch = (c1, c2, w) => {
  let d = "";
  for (let i = -400; i < 400; i += 2 * w) d += `M${i} 0L${i + w} 0L${i + w + 400} 400L${i + 400} 400Z`;
  return `<div style="position:absolute; inset:0; overflow:hidden"><svg style="position:absolute; left:0; top:0; width:400mm; height:400mm" viewBox="0 0 400 400"><rect width="400" height="400" fill="${c1}"/><path d="${d}" fill="${c2}"/></svg></div>`;
};
/* 6 여백과 최소 크기 */
const clear = (() => {
  const H = 14; // 글자 높이
  const x = H / 2; // 여백 단위 = 글자 높이의 ½
  const w = lockW(H), h = 1.6 * H;
  return `<div style="position:relative; padding:${x}mm; border:0.3mm dashed ${C.accent}">${hatch("#fff", "#f6efe0", 1.4)}
    <div style="position:relative; background:#fff; padding:0">${lockup(H)}</div>
    ${[["left:0; top:50%; transform:translate(-50%,-50%)"], ["right:0; top:50%; transform:translate(50%,-50%)"], ["top:0; left:50%; transform:translate(-50%,-50%)"], ["bottom:0; left:50%; transform:translate(-50%,50%)"]]
      .map(([pos]) => `<span style="position:absolute; ${pos}; background:${C.accent}; color:#fff; font-size:7pt; font-weight:800; padding:0.6mm 1.6mm">x</span>`)
      .join("")}</div>`;
})();
P.push(
  page(6, "", `
  <div class="in" style="flex-direction:row; gap:14mm">
    <div style="flex:1.15; display:flex; flex-direction:column">
      <p class="eb">04 여백과 최소 크기</p>
      <h1>숨 쉴 자리를 <b>남긴다.</b></h1>
      <p class="lead" style="margin-top:6mm">로고 둘레에는 다른 글자·그림·테두리를 두지 않는다. 최소 여백 x 는 <b style="color:${C.soil}">워드마크 글자 높이의 ½</b> 이다.</p>
      <div style="margin-top:auto; margin-bottom:auto; align-self:flex-start; margin-left:6mm">${clear}</div>
    </div>
    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:7mm">
      ${[
        ["가로 조합", lockup(3.1), "인쇄 25mm · 화면 100px 이상"],
        ["국문 병기 조합", lockupKo(3.4), "인쇄 35mm · 화면 140px 이상 (국문이 읽히는 크기)"],
        ["심볼 단독", mark(6), "인쇄 6mm · 화면 16px 이상 (파비콘)"],
        ["기계 각인·스티커", word(4, C.soil), "워드마크 폭 40mm 이상, 단색"],
      ]
        .map(
          ([t, l, c]) => `<div style="display:grid; grid-template-columns:44mm 1fr; gap:6mm; align-items:center; border-top:0.25mm solid ${C.line}; padding-top:4mm"><div style="height:12mm; display:flex; align-items:center">${l}</div><div><p style="font-weight:800; font-size:9pt">${t}</p><p class="cap" style="margin-top:0.8mm">${c}</p></div></div>`,
        )
        .join("")}
    </div>
  </div>`, "여백과 최소 크기"),
);

/* 7 색 */
const sw = (name, token, hex, use, big = false) => {
  const [c, m, y, k] = CMYK[hex];
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  const dark = (r * 299 + g * 587 + b * 114) / 1000 < 128;
  const ink = hex === C.gold || !dark ? C.soil : C.cream;
  return `<div style="display:flex; flex-direction:column; ${big ? "" : ""}">
    <div style="height:${big ? 46 : 26}mm; background:${hex}; ${hex === C.white ? `border:0.25mm solid ${C.line};` : ""} padding:3mm; color:${ink}; display:flex; flex-direction:column; justify-content:flex-end">
      <p style="font-weight:800; font-size:${big ? 12 : 9}pt">${name}</p><p style="font-size:7pt; letter-spacing:0.06em; margin-top:0.6mm">${token}</p></div>
    <p style="font-size:7.2pt; line-height:1.6; margin-top:2mm; font-variant-numeric:tabular-nums"><b>${hex}</b> · RGB ${r} ${g} ${b}<br>CMYK ${c} ${m} ${y} ${k}</p>
    <p class="cap" style="margin-top:0.6mm">${use}</p></div>`;
};
P.push(
  page(7, "", `
  <div class="in">
    <p class="eb">05 색</p>
    <h1>들판과 흙에서 <b>가져온 색.</b></h1>
    <div style="margin-top:6mm; display:grid; grid-template-columns:repeat(3, 1fr); gap:6mm">
      ${sw("건초금", "HAY GOLD", C.gold, "브랜드 대표색. 심볼, 핵심 강조, 큰 숫자.", true)}
      ${sw("흙먹", "SOIL BLACK", C.soil, "글자와 어두운 바탕. 워드마크 기본색.", true)}
      ${sw("볏짚", "STRAW CREAM", C.cream, "밝은 바탕, 어두운 바탕 위 글자.", true)}
    </div>
    <div style="margin-top:6mm; display:grid; grid-template-columns:repeat(6, 1fr); gap:4mm">
      ${sw("논흙", "FIELD BROWN", C.brown, "어두운 카드 바탕")}
      ${sw("사일리지", "SILAGE GREEN", C.green, "면으로만")}
      ${sw("강철", "STEEL GRAY", C.steel, "보조 글자")}
      ${sw("랩필름", "WRAP WHITE", C.white, "밝은 카드")}
      ${sw("진한 금", "ACCENT", C.accent, "흰 바탕 위 금색 글자")}
      ${sw("신호", "SIGNAL ORANGE", C.orange, "전화 상담 버튼 전용")}
    </div>
    <p class="cap" style="margin-top:auto">CMYK는 이 책과 박람회 인쇄물에 쓴 변환 값입니다. 별색(팬톤)이 필요하면 인쇄소 색 견본으로 맞춥니다. 건초금 위 글자는 흙먹만 쓰고(흰 글자 금지), 신호 주황은 전화 상담 버튼에만 씁니다.</p>
  </div>`, "색"),
);

/* 8 색 버전 */
const RED = "#C8202A"; // 드래곤 본체 빨강(기계 옆판 예시용, 브랜드 색 아님)
const cv = [
  ["기본 · 밝은 바탕", "#fff", lockup(9, C.gold, C.soil), `border:0.25mm solid ${C.line}`],
  ["반전 · 어두운 바탕", C.soil, lockup(9, C.gold, C.cream), ""],
  ["볏짚 바탕", C.cream, lockup(9, C.gold, C.soil), ""],
  ["건초금 바탕 · 흙먹 단색", C.gold, lockup(9, C.soil, C.soil), ""],
  ["흑백 단색 · 신문·팩스·도장", "#fff", lockup(9, "#000", "#000"), `border:0.25mm solid ${C.line}`],
  ["흰색 단색 · 기계 옆판·각인", RED, lockup(9, "#fff", "#fff"), ""],
];
P.push(
  page(8, "", `
  <div class="in">
    <p class="eb">06 색 버전</p>
    <h1>바탕에 따라 <b>여섯 가지.</b></h1>
    <div style="margin-top:6mm; flex:1; display:grid; grid-template-columns:repeat(3, 1fr); grid-template-rows:1fr 1fr; gap:5mm">
      ${cv.map(([t, bg, l, ex]) => `<div style="display:flex; flex-direction:column"><div style="flex:1; background:${bg}; ${ex}; display:flex; align-items:center; justify-content:center">${l}</div><p style="font-size:7.6pt; font-weight:700; margin-top:1.8mm">${t}</p></div>`).join("")}
    </div>
    <p class="cap" style="margin-top:3mm">사진 위에 올릴 때는 사진의 어두운 부분(하늘·그늘)을 골라 반전 버전을 쓴다. 바탕이 복잡하면 흙먹 띠를 깔고 그 위에 올린다. 빨간 기계 옆판 색은 예시이며 브랜드 색이 아니다.</p>
  </div>`, "색 버전"),
);

/* 9 잘못된 사용 */
const bad = [
  ["늘이거나 찌그러뜨리지 않는다", `<div style="transform:scaleX(1.4)">${lockup(4.2)}</div>`],
  ["기울이거나 돌리지 않는다", `<div style="transform:rotate(-12deg)">${lockup(6)}</div>`],
  ["정한 색 밖으로 바꾸지 않는다", lockup(6, C.green, C.orange)],
  ["심볼과 글자 자리를 바꾸지 않는다", `<div style="display:flex; align-items:center; gap:3mm">${word(6)}${mark(9.6)}</div>`],
  ["테두리·그림자를 넣지 않는다", `<div style="outline:0.6mm solid ${C.soil}; outline-offset:2mm; box-shadow:1.4mm 1.4mm 0 ${C.steel}">${lockup(6)}</div>`],
  ["건초금 위에 흰 글자를 쓰지 않는다", `<div style="background:${C.gold}; padding:4mm 6mm">${lockup(6, "#fff", "#fff")}</div>`],
  ["복잡한 무늬·사진 위에 바로 올리지 않는다", `<div style="position:relative; overflow:hidden; padding:4mm 6mm">${hatch(C.green, C.gold, 2)}<div style="position:relative">${lockup(6)}</div></div>`],
  ["글꼴로 다시 쓰지 않는다", `<p style="font-weight:900; font-size:22pt; letter-spacing:0.02em">MAKKINA</p>`],
];
P.push(
  page(9, "cr", `
  <div class="in">
    <p class="eb">07 잘못된 사용</p>
    <h1>이렇게는 <b>쓰지 않는다.</b></h1>
    <div style="margin-top:6mm; flex:1; display:grid; grid-template-columns:repeat(4, 1fr); grid-template-rows:1fr 1fr; gap:5mm">
      ${bad
        .map(
          ([t, l]) => `<div style="display:flex; flex-direction:column"><div style="flex:1; background:#fff; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden">${l}
          <svg viewBox="0 0 10 10" style="position:absolute; right:2.5mm; top:2.5mm; width:5mm; height:5mm"><circle cx="5" cy="5" r="5" fill="${C.soil}"/><path d="M3 3 L7 7 M7 3 L3 7" stroke="#fff" stroke-width="1.2"/></svg></div>
          <p style="font-size:7.6pt; font-weight:700; margin-top:1.8mm">${t}</p></div>`,
        )
        .join("")}
    </div>
  </div>`, "잘못된 사용"),
);

/* 10 서체 */
const ty = [
  ["제목", "지마켓 산스 Bold", "GmarketSans", 400, "이름처럼 일하는 기계", "섹션 제목, 제품명, 메뉴·버튼. 단단하고 묵직하게, 자간 -3%. (견본은 Medium)"],
  ["본문", "프리텐다드", "Pretendard", 500, "아래에서 치고 올라오는 칼날이 작물을 베면서 파쇄합니다.", "본문·숫자·전화번호. 화면 18px, 인쇄 9pt 이상, 줄간 1.65."],
  ["목소리", "카페24 동동", "Cafe24Dongdong", 400, "한 번에, 세 가지.", "슬로건·영상 자막·배지에만. 한 화면에 한두 군데."],
  ["제품", "HS봄바람체 2.1", "HSBombaram", 400, "베면서 부순다.", "제품 캐치프레이즈. 무료·상업 사용 가능(글꼴 판매만 금지)."],
];
P.push(
  page(10, "", `
  <div class="in" style="flex-direction:row; gap:14mm">
    <div style="flex:1.35; display:flex; flex-direction:column">
      <p class="eb">08 서체</p>
      <h1>뼈대, 살, <b>목소리.</b></h1>
      <div style="margin-top:6mm; display:flex; flex-direction:column">
        ${ty
          .map(
            ([r, n, fam, w, s, d]) => `<div style="display:grid; grid-template-columns:24mm 1fr; gap:5mm; border-top:0.25mm solid ${C.line}; padding:3.4mm 0">
            <div><p style="font-weight:800; font-size:9pt">${r}</p><p class="cap" style="margin-top:0.6mm">${n}</p></div>
            <div><p style="font-family:${fam}; font-weight:${w}; font-size:17pt; line-height:1.2; letter-spacing:${fam === "GmarketSans" ? "-0.03em" : "-0.01em"}">${s}</p><p class="cap" style="margin-top:1.2mm">${d}</p></div></div>`,
          )
          .join("")}
      </div>
    </div>
    <div style="flex:1; background:${C.soil}; color:${C.cream}; padding:10mm; display:flex; flex-direction:column">
      <p class="eb" style="color:${C.gold}">같은 글자 체계 · 제품명</p>
      <div style="margin-top:8mm">${word(15, C.cream, DRAGON)}</div>
      <p class="cap" style="margin-top:4mm; color:${C.mutedDark}">워드마크와 같은 규칙(모서리 깎기 · 10° 기울임)으로 그린 제품명. 기계 옆판과 제품 사진 위에 쓴다.</p>
      <div style="margin-top:auto; display:flex; align-items:baseline; gap:3mm"><span style="font-weight:900; font-size:44pt; color:${C.gold}; letter-spacing:-0.03em">150</span><span style="font-weight:600; font-size:12pt">마력</span></div>
      <p class="cap" style="margin-top:2mm; color:${C.mutedDark}">숫자는 글보다 크게, 단위는 옆에 작게 — 프리텐다드 Black</p>
    </div>
  </div>`, "서체"),
);

/* 11 적용 예 */
P.push(
  page(11, "", `
  <div class="in">
    <p class="eb">09 적용 예</p>
    <h1>기계에서 <b>화면까지.</b></h1>
    <div style="margin-top:6mm; flex:1; display:grid; grid-template-columns:1.25fr 1fr 1fr; grid-template-rows:1fr 1fr; gap:5mm">
      <div style="grid-row:1 / 3; background:${RED}; position:relative; display:flex; flex-direction:column; justify-content:center; padding:0 10mm">
        <span class="lbl" style="color:#fff">기계 옆판 · 흰색 단색</span>
        ${lockup(11, "#fff", "#fff")}
        <div style="margin-top:9mm">${word(11, "#fff", DRAGON)}</div>
        <p style="color:#fff; font-weight:800; font-size:9pt; letter-spacing:0.2em; margin-top:4mm">HYBRID MOWER CONDITIONER · 280</p>
      </div>
      <div style="display:flex; flex-direction:column"><span style="font-size:6.6pt; font-weight:700; letter-spacing:0.08em; color:${C.muted}; margin-bottom:1.6mm">명함 앞 · 90×50mm</span>
        <div style="flex:1; background:${C.soil}; display:flex; align-items:center; justify-content:center">${lockup(6.5, C.gold, C.cream)}</div></div>
      <div style="display:flex; flex-direction:column"><span style="font-size:6.6pt; font-weight:700; letter-spacing:0.08em; color:${C.muted}; margin-bottom:1.6mm">명함 뒤</span>
        <div style="flex:1; background:#fff; border:0.25mm solid ${C.line}; padding:5mm; display:flex; flex-direction:column">
          ${mark(7)}
          <p style="font-weight:800; font-size:9pt; margin-top:auto">이름 <span style="font-weight:400; color:${C.muted}; font-size:7pt">직함</span></p>
          <p style="font-size:6.6pt; line-height:1.55; margin-top:1mm; color:#3B372F">성원마끼나 · 054-843-4000<br>경북 안동시 서후면 풍산태사로 2780</p></div></div>
      <div style="display:flex; flex-direction:column"><span style="font-size:6.6pt; font-weight:700; letter-spacing:0.08em; color:${C.muted}; margin-bottom:1.6mm">홈페이지 위 메뉴</span>
        <div style="flex:1; background:${C.soil}; display:flex; flex-direction:column; gap:5mm; padding:6mm 6mm"><div style="flex-shrink:0">${lockup(4, C.gold, C.cream)}</div>
          <span style="display:flex; gap:5mm; font-size:7pt; color:${C.cream}; border-top:0.25mm solid #3a362e; padding-top:4mm"><span>DRAGON</span><span>라인업</span><span>영상</span><span>고객지원</span></span></div></div>
      <div style="display:flex; flex-direction:column"><span style="font-size:6.6pt; font-weight:700; letter-spacing:0.08em; color:${C.muted}; margin-bottom:1.6mm">앱 아이콘 · 파비콘</span>
        <div style="flex:1; background:${C.white}; border:0.25mm solid ${C.line}; display:flex; align-items:flex-end; justify-content:center; gap:7mm; padding-bottom:6mm">
          ${[22, 12, 7, 4].map((s) => `<div style="display:flex; flex-direction:column; align-items:center; gap:1.6mm">${tile(s)}<span class="cap">${s}mm</span></div>`).join("")}</div></div>
    </div>
  </div>`, "적용 예"),
);

/* 12 뒷표지 */
P.push(
  page(12, "dk", `
  <div class="in" style="justify-content:space-between">
    <div style="display:flex; justify-content:space-between; align-items:flex-start">
      ${mark(22, C.gold)}
      <div style="text-align:right">
        <p class="eb" style="justify-content:flex-end">FILES</p>
        <p class="cap" style="margin-top:3mm; line-height:1.8">원본 도형 scripts/logo.mjs<br>SVG·PNG public/brand/makkina-*<br>(logo · logo-reverse · logo-black · logo-white · mark · wordmark · app-icon)</p>
      </div>
    </div>
    <div>
      ${lockupKo(9, C.gold, C.cream, C.mutedDark)}
      <p class="lead" style="margin-top:9mm">경상북도 안동시 서후면 풍산태사로 2780 · 054-843-4000</p>
      <p class="cap" style="margin-top:2mm">이 책은 로고 시안 4 「발톱」의 사용 기준입니다. 2026-10-28 교정으로 홈페이지·박람회 인쇄물에는 회사 기존 로고(삼색 심볼 + 붓글씨 성원마끼나)를 쓰고 있습니다.</p>
    </div>
  </div>`),
);

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>MAKKINA 브랜드북 — 로고 시안 4 발톱</title><style>${css}</style></head><body>${P.join("\n")}</body></html>`;
fs.writeFileSync(OUT, html);
console.log("brandbook html", OUT, P.length, "pages");
