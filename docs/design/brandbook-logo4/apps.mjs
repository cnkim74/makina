// 성원마끼나 MAKKINA 적용 예시 — 로고 시안 4 「발톱」 (A4 가로 297×210, 12쪽)
// node apps.mjs <logo-paths.ts> <글꼴 폴더(Pretendard)> <이미지 폴더> <출력 html>
// 장면은 모두 SVG(단위 mm). 반투명·필터는 쓰지 않는다(CMYK 변환에서 사라짐).
import fs from "node:fs";
import path from "node:path";

const [LOGO_TS, FONTS, IMG, OUT] = process.argv.slice(2);
const here = path.dirname(new URL(import.meta.url).pathname);
const src = fs.readFileSync(LOGO_TS, "utf8");
const grab = (n) => JSON.parse(src.match(new RegExp(`export const ${n} = (\\{.*?\\});`))[1]);
const MARK = grab("MARK");
const WORD = grab("WORDMARK");
const DRAGON = grab("DRAGON_WORD");
const img = (n) => `file://${path.join(IMG, n)}`;

const C = {
  gold: "#E0A526", soil: "#1C1A17", cream: "#F4EDDC", brown: "#4A3A2C", green: "#5B7340",
  steel: "#8C9196", white: "#FAFAF6", orange: "#E4572E", accent: "#8A5D00", line: "#D9CFB8",
  muted: "#6A6358", mutedDark: "#B9B09F", red: "#C8202A",
};
const f = (n) => +(+n).toFixed(2);
const K = MARK.w / MARK.h;

/* ── SVG 로고 조각 (장면 단위 mm) ── */
const sMark = (x, y, h, fill = C.gold) => `<path transform="translate(${f(x)} ${f(y)}) scale(${f(h / MARK.h)})" d="${MARK.d}" fill="${fill}"/>`;
const sWord = (x, y, h, fill = C.soil, g = WORD) => `<path transform="translate(${f(x)} ${f(y)}) scale(${f(h / 100)})" d="${g.d}" fill="${fill}"/>`;
const markW = (h) => h * K;
const wordW = (h, g = WORD) => (h * g.w) / 100;
// 가로 조합: 심볼 높이 1.6H, 간격 0.44H, 글자는 0.36H 아래에서 시작 (scripts/logo.mjs 와 같은 비율)
const lockW = (H) => 1.6 * H * K + 0.44 * H + wordW(H);
const sLock = (x, y, H, mf = C.gold, wf = C.soil) => sMark(x, y, 1.6 * H, mf) + sWord(x + 1.6 * H * K + 0.44 * H, y + 0.36 * H, H, wf);
const T = (x, y, size, t, o = {}) =>
  `<text x="${f(x)}" y="${f(y)}" font-size="${f(size)}" font-family="${o.ff || "Pretendard"}" font-weight="${o.w || 400}" fill="${o.fill || C.soil}"${o.ls ? ` letter-spacing="${o.ls}"` : ""}${o.a ? ` text-anchor="${o.a}"` : ""}>${t}</text>`;
const R = (x, y, w, h, fill, o = "") => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" ${o}/>`;
const ko = (x, y, size, fill, ls = 0.5, a = "start") => T(x, y, size, "성원마끼나", { ff: "GmarketSans", fill, ls: f(size * ls), a });

const W = 261, H = 138;
const scene = (body, defs = "") => `<svg viewBox="0 0 ${W} ${H}" style="width:${W}mm;height:${H}mm;display:block"><defs>${defs}</defs>${body}</svg>`;
const sky = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFD5E4"/><stop offset="1" stop-color="#EEF2EF"/></linearGradient>`;
const hills = (y) =>
  `<path d="M0 ${y} Q40 ${y - 14} 90 ${y - 5} T180 ${y - 10} T261 ${y - 6} L261 ${y + 24} L0 ${y + 24}Z" fill="#AEBB98"/><path d="M0 ${y + 9} Q60 ${y - 1} 120 ${y + 7} T261 ${y + 3} L261 ${y + 24} L0 ${y + 24}Z" fill="#97A882"/>`;
const tree = (x, y, r) => `${R(x - 0.8, y, 1.6, r * 1.6, "#5E4B3A")}<circle cx="${x}" cy="${y}" r="${r}" fill="#6F8A55"/><circle cx="${x - r * 0.45}" cy="${y + r * 0.3}" r="${r * 0.7}" fill="#647F4C"/>`;
const wheel = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#262522"/><circle cx="${cx}" cy="${cy}" r="${r * 0.52}" fill="#B9BCBE"/><circle cx="${cx}" cy="${cy}" r="${r * 0.18}" fill="#7D8184"/>`;
const shadow = (cx, cy, rx, ry = 2.4, c = "#D3CCBC") => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}"/>`;

/* ── 글꼴·스타일 ── */
const fontCss =
  [["Light", 300], ["Regular", 400], ["Medium", 500], ["SemiBold", 600], ["Bold", 700], ["ExtraBold", 800], ["Black", 900]]
    .map(([n, w]) => `@font-face{font-family:"Pretendard";font-weight:${w};src:url("file://${FONTS}/Pretendard-${n}.otf")}`)
    .join("\n") +
  `\n@font-face{font-family:"GmarketSans";src:url("file://${path.join(here, "../fontdl/npm/noonnu-gmarket-sans-medium-0.1.0/package/fonts/gmarketsansmedium-normal.woff")}")}` +
  `\n@font-face{font-family:"HSBombaram";src:url("file://${path.join(here, "../fontdl/v21/HSBombaram2.1.ttf")}")}`;

const css = `
${fontCss}
@page { size: 297mm 210mm; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { font-family: "Pretendard", sans-serif; color: ${C.soil}; -webkit-print-color-adjust: exact; print-color-adjust: exact; word-break: keep-all; }
.pg { position: relative; width: 297mm; height: 210mm; overflow: hidden; page-break-after: always; background: #fff; }
.pg:last-child { page-break-after: auto; }
.dk { background: ${C.soil}; color: ${C.cream}; }
.in { position: absolute; left: 18mm; right: 18mm; top: 13mm; bottom: 13mm; display: flex; flex-direction: column; }
.eb { font-size: 8pt; font-weight: 700; letter-spacing: 0.24em; color: ${C.accent}; display: flex; align-items: center; gap: 3mm; }
.eb::before { content: ""; width: 10mm; height: 0.3mm; background: currentColor; }
.dk .eb { color: ${C.gold}; }
.hd { display: flex; align-items: flex-end; justify-content: space-between; gap: 10mm; }
h2 { font-weight: 300; font-size: 19pt; letter-spacing: -0.04em; line-height: 1.2; margin-top: 2.6mm; }
h2 b { font-weight: 800; }
.desc { font-size: 8.6pt; line-height: 1.6; color: #3B372F; max-width: 120mm; text-align: right; }
.sc { margin-top: 4mm; border: 0.25mm solid ${C.line}; }
.spec { margin-top: 3.4mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6mm; }
.spec div { border-top: 0.35mm solid ${C.soil}; padding-top: 1.8mm; }
.spec b { display: block; font-size: 8.2pt; font-weight: 800; }
.spec span { display: block; font-size: 7.2pt; line-height: 1.5; color: ${C.muted}; margin-top: 0.6mm; }
.folio { position: absolute; left: 18mm; right: 18mm; bottom: 6.5mm; display: flex; justify-content: space-between; font-size: 6.6pt; letter-spacing: 0.16em; color: ${C.muted}; }
`;

const folio = (n, t) => `<div class="folio"><span>MAKKINA 적용 예시 · 로고 시안 4 「발톱」</span><span>${t} · ${String(n).padStart(2, "0")}</span></div>`;
const P = [];
const sheet = (n, no, title, h, desc, svg, spec) =>
  P.push(`<section class="pg"><div class="in">
    <div class="hd"><div><p class="eb">${no} ${title}</p><h2>${h}</h2></div><p class="desc">${desc}</p></div>
    <div class="sc">${svg}</div>
    <div class="spec">${spec.map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join("")}</div>
  </div>${folio(n, title)}</section>`);

const ITEMS = ["사옥 간판", "지주 간판 · 안내판", "1톤 탑차", "탑차 뒷면 · 승합차", "명함", "레터헤드 · 봉투", "작업복 · 모자", "기계 명판 · 데칼", "박람회 부스", "판촉물", "디지털"];

/* 1 표지 */
P.push(`<section class="pg dk">
  <div style="position:absolute; left:0; top:0; bottom:0; width:12mm; background:${C.gold}"></div>
  <div class="in" style="left:32mm; flex-direction:row; gap:20mm">
    <div style="flex:1; display:flex; flex-direction:column">
      <p style="font-size:8pt; font-weight:700; letter-spacing:0.32em; color:${C.gold}">APPLICATIONS 2026</p>
      <div style="margin-top:auto">${`<svg viewBox="0 0 ${f(lockW(100))} 160" style="width:${f(lockW(15))}mm;display:block">${sLock(0, 0, 100, C.gold, C.cream)}</svg>`}</div>
      <h2 style="font-size:26pt; margin-top:10mm; color:${C.cream}">기계에서 간판까지,<br><b>같은 발톱.</b></h2>
      <p style="font-size:9pt; line-height:1.7; color:${C.mutedDark}; margin-top:6mm; max-width:120mm">로고 시안 4 「발톱」을 실제 자리에 놓아 본 적용 예시입니다. 간판·차량·명함·봉투·작업복·기계·부스·판촉물·디지털까지 11가지.</p>
      <p style="margin-top:auto; font-size:7.4pt; color:${C.mutedDark}">성원마끼나 · 경북 안동시 서후면 풍산태사로 2780 · 054-843-4000</p>
    </div>
    <div style="width:84mm; display:flex; flex-direction:column; justify-content:center">
      ${ITEMS.map((t, i) => `<div style="display:flex; align-items:baseline; gap:5mm; border-top:0.25mm solid #3A362F; padding:2.5mm 0"><span style="font-weight:200; font-size:13pt; color:${C.gold}; width:10mm">${String(i + 1).padStart(2, "0")}</span><span style="font-weight:600; font-size:10pt; color:${C.cream}">${t}</span></div>`).join("")}
    </div>
  </div></section>`);

/* 2 사옥 간판 */
{
  let s = R(0, 0, W, 104, "url(#sky)") + hills(84) + R(0, 104, W, 34, "#C9C3B6") + R(0, 122, W, 16, "#77736C");
  for (let x = 4; x < W; x += 16) s += R(x, 129.4, 8, 0.9, "#E8E1CF");
  s += tree(9, 78, 9) + tree(252, 80, 8);
  // 건물
  s += R(22, 44, 217, 60, "#E4E1DA");
  for (let x = 25; x < 239; x += 3.2) s += R(x, 44, 0.25, 60, "#D3CEC4");
  s += `<polygon points="18,44 243,44 236,35 25,35" fill="#6B6F73"/>` + R(18, 43, 225, 1.6, "#55595D");
  // 간판 띠
  s += R(44, 49, 173, 17, C.soil) + R(44, 66, 173, 0.8, C.gold);
  s += sLock(56, 51.9, 7, C.gold, C.cream) + ko(206, 60.6, 5.2, C.cream, 0.5, "end");
  // 셔터·문
  for (const x of [52, 134]) {
    s += R(x - 1, 73, 58, 2.6, "#8E9397") + R(x, 75.6, 56, 28.4, "#B4B8BB");
    for (let y = 77; y < 104; y += 1.5) s += R(x, y, 56, 0.3, "#9EA3A7");
  }
  s += R(198, 80, 15, 24, "#5F646A") + R(200, 82, 11, 9, "#2F3D47");
  // 돌출 간판
  s += R(222, 52, 2, 1.2, "#55595D") + R(222, 88, 2, 1.2, "#55595D") + R(224, 48, 10, 46, C.soil) + R(224, 48, 10, 0.8, C.gold);
  s += sMark(229 - markW(6) / 2, 52, 6, C.gold);
  [..."성원마끼나"].forEach((ch, i) => (s += T(229, 66 + i * 5.6, 4.4, ch, { ff: "GmarketSans", fill: C.cream, a: "middle" })));
  s += T(46, 118, 2.6, "축척 약 1/50", { fill: C.muted });
  sheet(2, "01", "사옥 간판", "멀리서도 <b>한눈에.</b>", "공장 전면 위쪽 띠에 흙먹 바탕 채널 간판. 밤에는 심볼은 금색, 글자는 크림색으로 빛납니다.", scene(s, sky), [
    ["외벽 채널 간판", "약 8.6 × 0.85m · 갈바 프레임 흙먹 도장 · 심볼 금색, 글자 크림 LED 채널"],
    ["돌출 간판", "0.5 × 2.3m 양면 · 위 심볼, 아래 세로 국문"],
    ["원칙", "간판 바탕은 흙먹 한 가지. 로고 둘레에 글자 높이 ½ 이상 여백"],
  ]);
}

/* 3 지주 간판 · 안내판 */
{
  let s = R(0, 0, W, 104, "url(#sky)") + hills(82) + R(0, 102, W, 36, "#B9C49F") + R(0, 120, W, 18, "#77736C");
  for (let x = 4; x < W; x += 16) s += R(x, 128.6, 8, 0.9, "#E8E1CF");
  s += tree(18, 82, 10) + tree(34, 88, 7) + tree(150, 86, 6) + tree(186, 84, 7);
  // 뒤쪽 공장
  s += R(128, 76, 52, 26, "#E4E1DA") + `<polygon points="126,76 182,76 178,71 130,71" fill="#6B6F73"/>` + R(134, 79, 40, 5.2, C.soil) + sLock(136, 80.1, 1.9, C.gold, C.cream);
  s += R(136, 88, 14, 14, "#B4B8BB") + R(156, 88, 14, 14, "#B4B8BB");
  // 지주 간판
  const cx = 94;
  s += R(66, 104, 56, 8, "#9A958B") + R(69, 7, 50, 98, "#2C2A26");
  s += R(70, 8, 48, 46, C.soil);
  const mh = 10.4, wh = 4.6;
  s += sMark(cx - markW(mh) / 2, 14, mh, C.gold) + sWord(cx - wordW(wh) / 2, 28, wh, C.cream) + ko(cx, 44, 3.8, C.cream, 0.5, "middle");
  s += R(70, 55, 48, 27, C.gold) + sWord(cx - wordW(5.4, DRAGON) / 2, 60.5, 5.4, C.soil, DRAGON) + T(cx, 74, 2.9, "하이브리드 모우어 컨디셔너", { w: 700, a: "middle" });
  s += R(70, 83, 48, 21, C.cream) + T(cx, 90.2, 2.9, "농기계 제조 · 수리 · 부품", { w: 600, a: "middle" }) + T(cx, 99.4, 5.2, "054-843-4000", { w: 900, a: "middle" });
  // 방향 안내판
  s += R(221, 70, 2.4, 50, "#6C6F72") + R(194, 52, 56, 20, C.soil) + R(194, 52, 1.6, 20, C.gold);
  s += sMark(199, 56.6, 10.8, C.gold) + ko(213.6, 61.4, 4.2, C.cream, 0.25) + T(213.6, 68.4, 3.2, "공장 입구 300m →", { w: 700, fill: C.gold });
  sheet(3, "02", "지주 간판 · 안내판", "도로에서 <b>찾아오게.</b>", "공장 입구 지주 간판은 위에서부터 회사 → 제품 → 업종과 전화. 큰길 갈림목에는 방향 안내판을 세웁니다.", scene(s, sky), [
    ["지주 간판", "1.8 × 6.0m 양면 · 위: 세로 조합, 가운데: DRAGON, 아래: 업종·전화"],
    ["방향 안내판", "1.2 × 0.4m · 도로변 기둥형 · 흙먹 바탕 금색 심볼"],
    ["글자 크기", "전화번호는 지나가는 차에서 읽히게 판 높이의 ¼ 이상"],
  ]);
}

/* 4 1톤 탑차 */
const truckSide = (ox, oy, sc) => {
  let s = `<g transform="translate(${ox} ${oy}) scale(${sc})">`;
  s += shadow(130, 127, 120, 2.8);
  // 운전석
  s += `<path d="M14 120 L14 84 Q14 74 20 70 L34 52 Q36 48 42 48 L66 48 L66 120 Z" fill="#F1F1EE" stroke="#C9C9C4" stroke-width="0.4"/>`;
  s += `<path d="M22 71 L36 54 L50 54 L50 71 Z" fill="#2E3B45"/>` + R(52, 54, 11, 17, "#2E3B45");
  s += `<rect x="34" y="73" width="30" height="34" fill="none" stroke="#C9C9C4" stroke-width="0.4"/>` + R(58, 76, 4, 1, "#9A9A96");
  s += sLock(36.5, 86, 2.25, C.gold, C.soil);
  s += R(9, 112, 11, 8, "#4A4A48") + R(11, 98, 4, 6, "#F4E7B0") + R(11, 60, 3, 9, "#333");
  // 섀시·적재함
  s += R(60, 112, 188, 6, "#3B3B3B") + `<clipPath id="box"><rect x="68" y="40" width="180" height="72"/></clipPath>`;
  s += R(68, 40, 180, 72, C.soil) + `<g clip-path="url(#box)">${sMark(176, 24, 112, C.gold)}</g>`;
  s += R(68, 40, 180, 1.6, "#2C2A26") + R(68, 110, 180, 2, "#2C2A26");
  s += sLock(78, 50, 8.6, C.gold, C.cream);
  s += T(78, 82, 8.4, "베면서 부순다.", { ff: "HSBombaram", fill: C.cream });
  s += T(78, 90, 3.5, "DRAGON 하이브리드 모우어 컨디셔너 · 출장 A/S · 부품", { w: 600, fill: C.cream });
  s += T(78, 104.5, 8.6, "054-843-4000", { w: 900, fill: C.gold });
  s += wheel(38, 118, 9) + wheel(200, 118, 9) + wheel(222, 118, 9);
  return s + "</g>";
};
{
  const s = R(0, 0, W, H, "#EEEAE0") + R(0, 128, W, 10, "#E2DCCD") + truckSide(4, 0, 1);
  sheet(4, "03", "1톤 탑차", "달리는 <b>간판.</b>", "적재함 옆면을 흙먹으로 감싸고, 심볼을 크게 잘라 칼날이 지나가는 느낌을 줍니다. 운전석 문에는 가로 조합.", scene(s), [
    ["적재함 랩핑", "약 3.1 × 1.8m · 흙먹 바탕 · 심볼은 뒤쪽에 크게 잘라 씀"],
    ["운전석 문", "가로 조합 폭 400mm · 흰 차체에 기본 색"],
    ["글자", "회사 → 한 줄(베면서 부순다.) → 전화 순서. 전화는 금색"],
  ]);
}

/* 5 탑차 뒷면 · 승합차 */
{
  let s = R(0, 0, W, H, "#EEEAE0") + R(0, 128, W, 10, "#E2DCCD");
  // 탑차 뒷면
  s += shadow(62, 127, 50, 2.6) + R(26, 114, 14, 13, "#262522") + R(84, 114, 14, 13, "#262522");
  s += R(18, 18, 88, 94, C.soil) + R(18, 18, 88, 2, "#2C2A26") + R(61.6, 20, 0.8, 92, "#3A3732");
  for (const y of [30, 60, 92]) s += R(19.5, y, 3, 6, "#55524C") + R(101.5, y, 3, 6, "#55524C");
  s += sMark(62 - markW(26) / 2, 28, 26, C.gold) + sWord(62 - wordW(6.8) / 2, 62, 6.8, C.cream);
  s += ko(62, 80, 4, C.cream, 0.5, "middle") + T(62, 94, 6.6, "054-843-4000", { w: 900, fill: C.gold, a: "middle" });
  s += R(14, 112, 96, 5, "#444") + R(16, 104, 7, 5, "#B3261E") + R(101, 104, 7, 5, "#B3261E") + R(52, 113, 20, 3.4, "#F2F0E8");
  // 승합차
  s += shadow(186, 127, 66, 2.6);
  s += `<path d="M122 118 L122 76 Q124 56 142 52 L234 50 Q248 50 250 62 L252 118 Z" fill="#F3F3F0" stroke="#C9C9C4" stroke-width="0.4"/>`;
  s += `<path d="M142 56 L232 54 Q242 54 244 62 L244 72 L134 72 Q134 60 142 56Z" fill="#2E3B45"/>` + R(170, 54, 0.8, 18, "#F3F3F0") + R(206, 53, 0.8, 19, "#F3F3F0");
  s += `<rect x="170" y="74" width="36" height="40" fill="none" stroke="#C9C9C4" stroke-width="0.4"/>`;
  s += R(122, 100, 130, 2.6, C.gold) + R(122, 102.6, 130, 1, C.soil);
  s += sLock(140, 79, 4.4, C.gold, C.soil) + T(140, 95.5, 3, "출장 A/S · 부품 · 상담", { w: 600 }) + T(246, 95.5, 4.6, "054-843-4000", { w: 900, a: "end" });
  s += R(118, 106, 8, 8, "#4A4A48") + R(122, 88, 3, 6, "#F4E7B0");
  s += wheel(148, 118, 8.5) + wheel(226, 118, 8.5);
  sheet(5, "04", "탑차 뒷면 · 승합차", "뒤따라오는 차에도 <b>보이게.</b>", "탑차 뒷문에는 심볼을 크게, 아래에 워드마크와 전화. 출장 A/S 승합차는 흰 차체에 금색 띠와 가로 조합.", scene(s), [
    ["탑차 뒷문", "심볼 높이 약 550mm · 워드마크 · 국문 · 전화"],
    ["출장 A/S 승합차", "흰 차체 · 허리선 금색 띠 50mm + 흙먹 선 20mm"],
    ["주의", "브레이크등·번호판 둘레 100mm 안에는 그래픽을 두지 않음"],
  ]);
}

/* 6 명함 */
const card = (side) => {
  if (side === "back")
    return R(0, 0, 90, 50, C.soil) + sMark(45 - markW(16) / 2, 9, 16, C.gold) + sWord(45 - wordW(3.4) / 2, 30.5, 3.4, C.cream) + T(45, 41.5, 2.1, "이름처럼 일하는 기계.", { fill: C.mutedDark, a: "middle", ls: 0.3 });
  return (
    R(0, 0, 90, 50, "#FBFAF6") + R(87, 0, 3, 50, C.gold) +
    sLock(7, 7, 3.3, C.gold, C.soil) +
    T(7, 29, 4.4, "박석민", { w: 800 }) + T(22, 29, 2.3, "대표", { fill: C.muted, w: 600 }) +
    T(7, 37.6, 2.05, "T 054-843-4000~1", { fill: "#3B372F" }) +
    T(7, 41.2, 2.05, "경북 안동시 서후면 풍산태사로 2780", { fill: "#3B372F" }) +
    T(7, 44.8, 2.05, "유튜브 @성원마끼나", { fill: "#3B372F" })
  );
};
{
  const sc = 1.25;
  const put = (x, y, side, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})">${R(1, 1.4, 90, 50, "#CFC6B2")}${card(side)}</g>`;
  let s = R(0, 0, W, H, "#E7E0CF");
  s += put(18, 30, "front") + put(142, 36, "back", 5);
  s += `<g transform="translate(18 ${30 + 50 * sc + 5})">${R(0, 0, 90 * sc, 0.3, C.muted)}${R(0, -1.2, 0.3, 2.4, C.muted)}${R(90 * sc - 0.3, -1.2, 0.3, 2.4, C.muted)}${T((90 * sc) / 2, 4.6, 2.8, "90mm", { fill: C.muted, a: "middle" })}</g>`;
  sheet(6, "05", "명함", "손에 쥐는 <b>첫인상.</b>", "앞면은 흰 종이에 가로 조합과 연락처, 오른쪽 끝에 금색 띠. 뒷면은 흙먹 바탕에 금색 심볼 하나.", scene(s), [
    ["크기·종이", "90 × 50mm · 랑데뷰 내추럴 240g 또는 아르떼 230g"],
    ["후가공", "뒷면 흙먹 별색 + 심볼 금박(유광) 제안"],
    ["글자", "이름 프리텐다드 ExtraBold, 연락처 Regular 7pt 이상"],
  ]);
}

/* 7 레터헤드 · 봉투 */
const letterhead = () => {
  let s = R(0, 0, 210, 297, "#FFFFFF") + sLock(20, 20, 7, C.gold, C.soil);
  s += T(190, 25, 3.1, "경북 안동시 서후면 풍산태사로 2780", { a: "end", fill: "#3B372F" }) + T(190, 30.4, 3.1, "T 054-843-4000~1 · 유튜브 @성원마끼나", { a: "end", fill: "#3B372F" });
  s += R(20, 40, 170, 0.6, C.gold);
  const wd = [120, 168, 162, 170, 150, 0, 166, 170, 158, 164, 92, 0, 170, 160, 168, 140, 0, 60];
  wd.forEach((w, i) => w && (s += R(20, 58 + i * 9, w, 2.6, "#E6E2D8")));
  s += R(20, 236, 40, 2.6, "#E6E2D8") + R(20, 246, 60, 3.4, "#CFC6B2");
  s += R(0, 284, 210, 13, C.soil) + T(20, 292.4, 3.6, "이름처럼 일하는 기계.", { fill: C.cream, w: 600 }) + sMark(184, 287, 7, C.gold);
  return s;
};
const envBig = () => {
  let s = R(0, 0, 330, 245, "#FBFAF6") + R(0, 0, 7, 205, C.gold);
  s += `<rect x="285" y="16" width="28" height="34" fill="none" stroke="${C.line}" stroke-width="0.8" stroke-dasharray="3 2"/>` + T(299, 35, 4, "우표", { fill: C.mutedDark, a: "middle" });
  for (const y of [110, 128, 146]) s += R(120, y, 170, 0.6, C.line);
  s += R(0, 205, 330, 40, C.soil) + sLock(22, 213, 10, C.gold, C.cream);
  s += T(310, 222, 5, "경북 안동시 서후면 풍산태사로 2780", { fill: C.cream, a: "end" }) + T(310, 232, 5, "054-843-4000~1", { fill: C.gold, a: "end", w: 700 });
  return s;
};
const envSmall = () => {
  let s = R(0, 0, 220, 105, "#FBFAF6") + sLock(14, 12, 6.4, C.gold, C.soil);
  for (let i = 0; i < 5; i++) s += `<rect x="${150 + i * 11}" y="14" width="9" height="11" fill="none" stroke="${C.line}" stroke-width="0.6"/>`;
  s += T(14, 82, 3.8, "경북 안동시 서후면 풍산태사로 2780", { fill: "#3B372F" }) + T(14, 88.5, 3.8, "054-843-4000~1", { fill: "#3B372F", w: 700 });
  s += R(0, 98, 220, 7, C.gold);
  return s;
};
{
  const k = 0.36;
  const put = (x, y, w, h, body) => `<g transform="translate(${x} ${y})">${R(1.2, 1.6, w * k, h * k, "#CFC6B2")}<g transform="scale(${k})">${body}</g></g>`;
  let s = R(0, 0, W, H, "#E7E0CF");
  s += put(14, 15, 210, 297, letterhead()) + put(102, 6, 330, 245, envBig()) + put(166, 97, 220, 105, envSmall());
  sheet(7, "06", "레터헤드 · 봉투", "보내는 것마다 <b>같은 얼굴.</b>", "레터헤드는 위에 가로 조합과 주소, 아래에 흙먹 띠. 대봉투는 아래 흙먹 띠에 반전 로고, 소봉투는 금색 아래 띠.", scene(s), [
    ["레터헤드", "A4 · 모조지 100g · 위 가로 조합 폭 60mm"],
    ["대봉투", "330 × 245mm · 아래 흙먹 띠 40mm에 반전 가로 조합"],
    ["소봉투", "220 × 105mm · 가로 조합 + 금색 아래 띠 7mm"],
  ]);
}

/* 8 작업복 · 모자 */
const jacket = (back) => {
  const J = "#2B2A27";
  let s = `<path d="M27 4 L43 4 L58 10 L68 62 L60 64 L52 28 L52 82 L18 82 L18 28 L10 64 L2 62 L12 10 Z" fill="${J}" stroke="#151412" stroke-width="0.35"/>`;
  s += R(18, 76, 34, 6, "#22211E") + `<path d="M2 62 L10 64 L9.4 67 L1.4 65 Z" fill="#22211E"/><path d="M68 62 L60 64 L60.6 67 L68.6 65 Z" fill="#22211E"/>`;
  if (back) {
    s += `<path d="M27 4 L43 4 L44 8 Q35 10 26 8 Z" fill="#1F1D1A"/>`;
    s += sMark(35 - markW(19) / 2, 18, 19, C.gold) + sWord(35 - wordW(4.4) / 2, 42, 4.4, C.cream) + ko(35, 54, 2.6, C.cream, 0.5, "middle");
  } else {
    s += `<path d="M27 4 L35 13 L43 4 L41 1 L29 1 Z" fill="#1F1D1A"/>` + R(34.8, 13, 0.5, 63, "#5A5650") + R(34.2, 14, 1.6, 3, C.gold);
    s += `<rect x="21" y="52" width="10" height="11" fill="none" stroke="#45423C" stroke-width="0.35"/><rect x="39" y="52" width="10" height="11" fill="none" stroke="#45423C" stroke-width="0.35"/>`;
    s += sLock(37.6, 19, 1.6, C.gold, C.cream);
  }
  return s;
};
{
  let s = R(0, 0, W, H, "#ECE8DF");
  s += shadow(68, 132, 46, 2.4) + `<g transform="translate(17 10) scale(1.45)">${jacket(false)}</g>`;
  s += shadow(165, 132, 46, 2.4) + `<g transform="translate(114 10) scale(1.45)">${jacket(true)}</g>`;
  const cap = `<path d="M0 34 Q0 2 32 2 Q64 2 64 34 Z" fill="${C.soil}"/><path d="M32 2 L16 34 M32 2 L48 34" stroke="#2E2B27" stroke-width="0.5" fill="none"/><circle cx="32" cy="2.6" r="1.6" fill="#2E2B27"/><path d="M-5 33 Q32 52 69 33 Q32 41 -5 33 Z" fill="#151412"/>${sMark(32 - markW(13) / 2, 13, 13, C.gold)}`;
  s += shadow(233, 112, 26, 2) + `<g transform="translate(205 64) scale(0.88)">${cap}</g>`;
  s += T(68, 7, 3, "앞", { fill: C.muted, a: "middle", w: 700 }) + T(165, 7, 3, "뒤", { fill: C.muted, a: "middle", w: 700 }) + T(233, 58, 3, "모자", { fill: C.muted, a: "middle", w: 700 });
  sheet(8, "07", "작업복 · 모자", "현장에서 <b>알아보게.</b>", "차콜 작업복 가슴에는 가로 조합 자수, 등에는 심볼과 워드마크를 크게. 모자 앞에는 금사 심볼 하나.", scene(s), [
    ["작업복 가슴", "가로 조합 폭 90mm · 심볼 금사, 글자 크림사 자수"],
    ["작업복 등", "심볼 높이 220mm + 워드마크 · 실크 인쇄"],
    ["모자", "앞 가운데 심볼 높이 45mm · 금사 입체 자수"],
  ]);
}

/* 9 기계 명판 · 데칼 */
{
  let s = R(0, 0, W, H, "#ECE8DF");
  // 명판 120×80 실물을 1.05배
  const pl = (() => {
    let p = `<rect x="0" y="0" width="120" height="80" rx="2.4" fill="#D3D6D7" stroke="#A9ACAE" stroke-width="0.5"/>`;
    for (const [x, y] of [[5, 5], [115, 5], [5, 75], [115, 75]]) p += `<circle cx="${x}" cy="${y}" r="1.8" fill="#B0B3B5" stroke="#8E9193" stroke-width="0.35"/>`;
    p += R(10, 10, 100, 15, C.soil) + sLock(13.4, 13.1, 5.6, C.gold, C.cream) + T(106.6, 19.4, 2.8, "농업기계 명판", { fill: C.cream, a: "end", w: 600 });
    [["모델명", "DRAGON 230"], ["제조번호", ""], ["제조연월", ""], ["적용 마력", ""], ["작업 폭", ""], ["무게", ""]].forEach(([k, v], i) => {
      const y = 31.5 + i * 5.7;
      p += T(12, y, 2.6, k, { w: 700 }) + R(34, y + 1, 74, 0.3, "#9EA2A4") + (v ? T(36, y, 2.8, v, { w: 800 }) : "");
    });
    p += T(60, 72.6, 2.1, "제조 성원마끼나 · 경북 안동시 서후면 풍산태사로 2780 · 054-843-4000", { a: "middle", fill: "#3B372F" });
    return p;
  })();
  s += `<g transform="translate(12 26) scale(1.05)">${R(1, 1.4, 120, 80, "#CFC8B8")}${pl}</g>`;
  s += T(75, 20, 3, "명판 (실물 120 × 80mm)", { fill: C.muted, a: "middle", w: 700 });
  // 기계 끝판(빨간 차체)
  s += `<path d="M152 18 L222 18 Q238 18 241 34 L250 120 L152 120 Z" fill="${C.red}"/><path d="M152 114 L250 114 L250 120 L152 120 Z" fill="#9E1820"/>`;
  for (const [x, y] of [[158, 24], [234, 30], [158, 108], [244, 108]]) s += `<circle cx="${x}" cy="${y}" r="1.4" fill="#9E1820"/>`;
  s += sWord(160, 34, 10, "#FFFFFF", DRAGON) + T(160, 64, 13, "230", { w: 900, fill: "#FFFFFF" }) + T(160, 71, 3, "HYBRID MOWER CONDITIONER", { w: 700, fill: "#FFFFFF", ls: 0.4 });
  s += sLock(160, 90, 4.6, "#FFFFFF", "#FFFFFF");
  s += `<circle cx="232" cy="96" r="9" fill="${C.soil}"/>` + sMark(232 - markW(9) / 2, 91.5, 9, C.gold);
  s += T(201, 13, 3, "기계 데칼 (끝판 예)", { fill: C.muted, a: "middle", w: 700 });
  sheet(9, "08", "기계 명판 · 데칼", "기계에 <b>새긴다.</b>", "명판은 알루미늄에 흙먹 띠와 각인. 빨간 차체에는 흰색 단색 데칼만 씁니다(금색은 빨강 위에서 묻힘).", scene(s), [
    ["명판", "120 × 80mm 알루미늄 부식 · 칸은 비워 두고 출고 때 각인"],
    ["기계 데칼", "빨간 차체에는 흰색 단색 커팅 시트 · DRAGON + 모델 + 가로 조합"],
    ["원형 스티커", "∅60mm · 흙먹 바탕 금색 심볼 · 정품 표시용"],
  ]);
}

/* 10 박람회 부스 */
{
  let s = R(0, 0, W, H, "#F1EEE7") + R(0, 104, W, 34, "#E2DDD2");
  s += `<polygon points="60,104 201,104 233,130 28,130" fill="#6E6A63"/>`;
  s += `<polygon points="60,18 30,4 30,130 60,104" fill="${C.cream}"/><polygon points="30,4 35,6.4 35,125.9 30,130" fill="${C.gold}"/>`;
  s += R(60, 18, 141, 86, C.soil);
  s += `<clipPath id="bw"><rect x="150" y="18" width="51" height="86"/></clipPath><image href="${img("flyer-cover-clear.jpg")}" x="110" y="18" width="130" height="86" preserveAspectRatio="xMidYMid slice" clip-path="url(#bw)"/>`;
  s += sLock(68, 27, 6.6, C.gold, C.cream) + ko(68, 50, 3.6, C.cream, 0.6);
  s += T(68, 72, 9, "베면서 부순다.", { ff: "HSBombaram", fill: C.gold }) + T(68, 80, 3.1, "DRAGON 하이브리드 모우어 컨디셔너", { fill: C.cream, w: 600 });
  // 기계
  s += shadow(184, 127, 36, 2.4, "#5C5853") + `<image href="${img("booth-machine.png")}" x="134" y="62" width="96" height="72" preserveAspectRatio="xMidYMid meet"/>`;
  // 상담 카운터
  s += R(70, 98, 56, 28, C.soil) + R(68, 95.6, 60, 2.6, "#2C2A26") + R(68, 98.2, 60, 0.6, C.gold) + sLock(98 - lockW(3.6) / 2, 105, 3.6, C.gold, C.cream);
  // X배너
  s += R(238, 26, 16, 96, C.soil) + sMark(246 - markW(8) / 2, 32, 8, C.gold) + sWord(246 - wordW(2.2, DRAGON) / 2, 46, 2.2, C.cream, DRAGON);
  s += `<image href="${img("dragon-render.jpg")}" x="239" y="62" width="14" height="10" preserveAspectRatio="xMidYMid slice"/>` + T(246, 84, 1.9, "054-843-4000", { fill: C.gold, a: "middle", w: 800 });
  s += R(245.4, 122, 1.2, 6, "#555") + R(240, 127.4, 12, 0.8, "#555");
  sheet(10, "09", "박람회 부스", "들어오고 싶은 <b>자리.</b>", "3 × 3m 부스. 뒷벽은 흙먹 바탕에 가로 조합과 한 줄, 오른쪽은 현장 사진. 앞에는 흙먹 상담 카운터와 실제 기계.", scene(s), [
    ["뒷벽", "3.0 × 2.5m · 흙먹 + 현장 사진 · 로고는 눈높이 위"],
    ["옆벽·카운터", "옆벽 크림 + 금색 기둥 띠 · 카운터 흙먹에 반전 가로 조합"],
    ["X배너", "600 × 1,800mm · 지금 인쇄물과 같은 구성"],
  ]);
}

/* 11 판촉물 */
{
  let s = R(0, 0, W, H, "#ECE8DF");
  // 수건 40×80cm
  s += `<g transform="translate(14 10)">${R(1.2, 1.6, 44, 110, "#CFC8B8")}${R(0, 0, 44, 110, "#FBFAF6")}`;
  for (let x = 1; x < 44; x += 1.6) s += R(x, 110, 0.5, 2.4, "#E9E4D8") + R(x, -2.4, 0.5, 2.4, "#E9E4D8");
  s += R(0, 72, 44, 22, C.soil) + R(0, 74, 44, 0.5, C.gold) + R(0, 91.5, 44, 0.5, C.gold) + sLock(22 - lockW(3.4) / 2, 77, 3.4, C.gold, C.cream) + T(22, 89, 2.2, "054-843-4000", { fill: C.cream, a: "middle", w: 700 }) + "</g>";
  // 벽걸이 달력
  s += `<g transform="translate(72 10)">${R(1.2, 1.6, 70, 104, "#CFC8B8")}${R(0, 0, 70, 104, "#FFFFFF")}<circle cx="35" cy="-1" r="2" fill="none" stroke="#777" stroke-width="0.6"/>`;
  s += `<clipPath id="cal"><rect x="0" y="0" width="70" height="50"/></clipPath><image href="${img("site-314-yard.jpg")}" x="0" y="0" width="70" height="50" preserveAspectRatio="xMidYMid slice" clip-path="url(#cal)"/>`;
  s += T(5, 59, 5, "3", { w: 900 }) + T(11, 59, 2.4, "2027 · MARCH", { fill: C.muted, w: 600 });
  for (let i = 0; i < 35; i++) {
    const d = i - 0;
    if (d >= 0 && d < 31) s += T(6 + (i % 7) * 9.4, 66 + Math.floor(i / 7) * 5.2, 2.2, String(d + 1), { fill: i % 7 === 0 ? C.red : "#3B372F", a: "middle" });
  }
  s += R(0, 93, 70, 11, C.soil) + sLock(4, 95.6, 3.6, C.gold, C.cream) + T(66, 100.4, 2, "054-843-4000", { fill: C.cream, a: "end" }) + "</g>";
  // 머그
  s += shadow(172, 116, 20, 2) + `<path d="M188 74 Q200 74 200 88 Q200 100 188 100" fill="none" stroke="${C.soil}" stroke-width="3.6"/>`;
  s += `<path d="M154 66 L190 66 L189 112 Q189 116 185 116 L159 116 Q155 116 155 112 Z" fill="${C.soil}"/><ellipse cx="172" cy="66" rx="18" ry="2.4" fill="#2C2A26"/>` + sMark(172 - markW(20) / 2, 78, 20, C.gold);
  // 볼펜
  s += `<g transform="translate(208 18) rotate(62)"><rect x="0" y="0" width="84" height="5" rx="2.5" fill="${C.soil}"/><rect x="74" y="0" width="10" height="5" rx="1.5" fill="#B9BCBE"/><path d="M84 1 L90 2.5 L84 4 Z" fill="#8C9196"/><rect x="6" y="-1.6" width="16" height="1.6" fill="${C.gold}"/>${sWord(30, 1.2, 2.6, C.cream)}</g>`;
  // 원형 스티커
  s += `<circle cx="214" cy="112" r="10" fill="${C.soil}"/>${sMark(214 - markW(10) / 2, 107, 10, C.gold)}<circle cx="240" cy="112" r="10" fill="${C.gold}"/>${sMark(240 - markW(10) / 2, 107, 10, C.soil)}`;
  sheet(11, "10", "판촉물", "농가에 <b>남는 물건.</b>", "박람회와 출고 때 나눠 드리는 물건. 수건·달력처럼 오래 쓰는 물건에는 전화번호를 함께 넣습니다.", scene(s), [
    ["수건", "40 × 80cm 흰 수건 · 흙먹 띠에 가로 조합 + 전화"],
    ["벽걸이 달력", "현장 사진 + 아래 흙먹 띠 · 1년 내내 축사에 걸림"],
    ["머그 · 볼펜 · 스티커", "심볼만 크게. 작은 물건에는 글자를 넣지 않음"],
  ]);
}

/* 12 디지털 */
{
  let s = R(0, 0, W, H, "#ECE8DF");
  // 유튜브 채널 아트 2560×1440 → 150×84.4
  const bw = 150, bh = (150 * 1440) / 2560;
  s += `<g transform="translate(10 12)">${R(0, 0, bw, bh, C.soil)}<clipPath id="yt"><rect x="${bw * 0.58}" y="0" width="${bw * 0.42}" height="${bh}"/></clipPath><image href="${img("flyer-cover-clear.jpg")}" x="${bw * 0.4}" y="0" width="${bw * 0.6}" height="${bh}" preserveAspectRatio="xMidYMid slice" clip-path="url(#yt)"/>`;
  s += R(bw * 0.58, 0, 1, bh, C.gold);
  const sx = (bw * (2560 - 1546)) / 2 / 2560, sy = (bh * (1440 - 423)) / 2 / 1440;
  s += `<rect x="${f(sx)}" y="${f(sy)}" width="${f((bw * 1546) / 2560)}" height="${f((bh * 423) / 1440)}" fill="none" stroke="${C.mutedDark}" stroke-width="0.3" stroke-dasharray="1.4 1"/>`;
  s += sLock(sx + 3, sy + 4, 4.6, C.gold, C.cream) + T(sx + 3, sy + 22, 4.6, "베면서 부순다.", { ff: "HSBombaram", fill: C.cream });
  s += T(2, bh + 4.6, 2.6, "유튜브 채널 아트 2560 × 1440 · 점선 안이 모든 기기에서 보이는 자리", { fill: C.muted, w: 600 }) + "</g>";
  // 프로필
  s += `<circle cx="26" cy="118" r="11" fill="${C.soil}"/>${sMark(26 - markW(11) / 2, 112.5, 11, C.gold)}<circle cx="56" cy="118" r="11" fill="${C.gold}"/>${sMark(56 - markW(11) / 2, 112.5, 11, C.soil)}`;
  s += T(41, 134, 2.4, "SNS 프로필", { fill: C.muted, a: "middle", w: 600 });
  // 메일 서명
  s += `<g transform="translate(78 106)">${R(0, 0, 82, 24, "#FFFFFF")}${R(0, 0, 1.2, 24, C.gold)}${sLock(5, 4, 2.6, C.gold, C.soil)}${T(5, 15, 2.8, "박석민 대표", { w: 800 })}${T(5, 19.6, 2.2, "054-843-4000~1 · 경북 안동시 서후면 풍산태사로 2780", { fill: "#3B372F" })}</g>`;
  s += T(119, 134, 2.4, "메일 서명", { fill: C.muted, a: "middle", w: 600 });
  // 휴대폰
  s += `<g transform="translate(184 6)"><rect x="0" y="0" width="64" height="128" rx="8" fill="#151412"/><clipPath id="ph"><rect x="2.4" y="2.4" width="59.2" height="123.2" rx="6"/></clipPath><g clip-path="url(#ph)">`;
  s += R(0, 0, 64, 128, "#FFFFFF") + `<image href="${img("flyer-cover-clear.jpg")}" x="-30" y="12" width="124" height="70" preserveAspectRatio="xMidYMid slice"/>`;
  s += R(0, 0, 64, 12, "#FFFFFF") + sLock(5, 4.4, 2.2, C.gold, C.soil);
  s += R(0, 62, 64, 20, C.soil) + T(5, 72, 6.4, "베면서 부순다.", { ff: "HSBombaram", fill: C.cream }) + T(5, 78, 2.3, "DRAGON 하이브리드 모우어 컨디셔너", { fill: C.mutedDark });
  s += R(5, 86, 54, 5, "#F2EEE4") + R(5, 94, 40, 3, "#F2EEE4") + R(5, 100, 48, 3, "#F2EEE4");
  s += `<rect x="5" y="110" width="54" height="10" rx="5" fill="${C.orange}"/>` + T(32, 116.6, 2.9, "전화 상담 054-843-4000", { fill: "#FFFFFF", a: "middle", w: 800 });
  s += "</g></g>";
  sheet(12, "11", "디지털", "화면에서도 <b>같은 날.</b>", "유튜브 채널 아트, SNS 프로필, 메일 서명, 모바일 홈페이지. 주황 버튼은 전화 상담에만 씁니다.", scene(s), [
    ["유튜브 채널 아트", "2560 × 1440px · 가운데 1546 × 423px 안에 로고와 한 줄"],
    ["SNS 프로필", "심볼만 · 흙먹 또는 건초금 바탕 원형"],
    ["홈페이지", "위 메뉴 가로 조합 · 전화 버튼만 신호 주황"],
  ]);
}

/* 13 뒤표지 */
P.push(`<section class="pg dk"><div class="in" style="left:24mm; right:24mm; top:20mm; bottom:18mm">
  <div style="margin-top:auto"><svg viewBox="0 0 ${f(lockW(100))} 160" style="width:${f(lockW(9))}mm;display:block">${sLock(0, 0, 100, C.gold, C.cream)}</svg></div>
  <p style="font-size:8.6pt; color:${C.mutedDark}; margin-top:7mm">경상북도 안동시 서후면 풍산태사로 2780 · 054-843-4000</p>
  <p style="font-size:7.2pt; line-height:1.7; color:${C.mutedDark}; margin-top:3mm; max-width:200mm">이 적용 예시는 로고 시안 4 「발톱」을 채택할 경우의 제안입니다. 크기·재질은 시공사·인쇄소와 확인한 뒤 확정합니다. 2026-10-28 교정으로 지금 홈페이지·인쇄물에는 회사 기존 로고(삼색 심볼 + 붓글씨 성원마끼나)를 쓰고 있습니다.</p>
</div></section>`);

fs.writeFileSync(OUT, `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${css}</style></head><body>${P.join("\n")}</body></html>`);
console.log("apps html", OUT, P.length, "pages");
