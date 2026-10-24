// 성원마끼나 로고 (2026-10 확정: "발톱" 안) — 글자까지 도형으로 그린다.
// node scripts/logo.mjs  →  src/components/logo-paths.ts, public/brand/*.svg, src/app/icon.svg
// 모양을 고칠 때는 이 파일만 고치고 다시 실행한다. PNG·ICO 는 README "로고" 절의 명령으로 만든다.
import fs from "node:fs";
import path from "node:path";

const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const f = (n) => +n.toFixed(2);

const area = (pts) =>
  pts.reduce((a, [x, y], i) => {
    const [x2, y2] = pts[(i + 1) % pts.length];
    return a + x * y2 - x2 * y;
  }, 0);
// 바깥은 한 방향, 구멍은 반대 방향 → fill-rule nonzero 로 겹침이 지워지지 않는다
const solid = (pts) => (area(pts) >= 0 ? pts : [...pts].reverse());
const hole = (pts) => (area(pts) < 0 ? pts : [...pts].reverse());

/* ── 글자: 대문자 높이 100, 획 22, 모서리 깎기 ── */
const S = 22;
const C = 22;
const CI = C - S * 0.414;
const oct = (x0, y0, x1, y1, c) => [[x0 + c, y0], [x1 - c, y0], [x1, y0 + c], [x1, y1 - c], [x1 - c, y1], [x0 + c, y1], [x0, y1 - c], [x0, y0 + c]];

const glyphs = {
  M: { w: 108, polys: [solid([[0, 100], [0, 12], [12, 0], [S + 4, 0], [54, 46], [108 - S - 4, 0], [96, 0], [108, 12], [108, 100], [108 - S, 100], [108 - S, 40], [60, 76], [48, 76], [S, 40], [S, 100]])] },
  A: { w: 98, polys: [solid([[0, 100], [34, 0], [64, 0], [98, 100], [75, 100], [68, 79], [30, 79], [23, 100]]), hole([[36, 60], [62, 60], [52, 28], [46, 28]])] },
  K: { w: 90, polys: [solid([[0, 0], [S, 0], [S, 100], [0, 100]]), solid([[S, 42], [58, 0], [90, 0], [S, 74]]), solid([[40, 46], [90, 100], [60, 100], [26, 62]])] },
  I: { w: S, polys: [solid([[0, 0], [S, 0], [S, 100], [0, 100]])] },
  N: { w: 94, polys: [solid([[0, 100], [0, 12], [12, 0], [S + 2, 0], [94 - S, 62], [94 - S, 0], [94, 0], [94, 88], [82, 100], [94 - S - 2, 100], [S, 38], [S, 100]])] },
  D: { w: 96, polys: [solid([[0, 0], [96 - C, 0], [96, C], [96, 100 - C], [96 - C, 100], [0, 100]]), hole([[S, S], [96 - S - CI, S], [96 - S, S + CI], [96 - S, 100 - S - CI], [96 - S - CI, 100 - S], [S, 100 - S]])] },
  R: {
    w: 94,
    polys: [
      solid([[0, 0], [94 - C, 0], [94, C], [94, 62 - C], [94 - C, 62], [0, 62]]),
      hole([[S, S], [94 - S - CI, S], [94 - S, S + CI], [94 - S, 62 - S - CI], [94 - S - CI, 62 - S], [S, 62 - S]]),
      solid([[0, 40], [S, 40], [S, 100], [0, 100]]),
      solid([[40, 58], [66, 58], [94, 100], [66, 100]]),
    ],
  },
  O: { w: 100, polys: [solid(oct(0, 0, 100, 100, C)), hole(oct(S, S, 100 - S, 100 - S, CI))] },
  G: {
    w: 98,
    polys: [
      solid([[C, 0], [98 - C, 0], [98, C], [98, 34], [98 - S, 34], [98 - S, S + CI], [98 - S - CI, S], [S + CI, S]]),
      solid([[0, C], [C, 0], [S + CI, S], [S, S + CI], [S, 100 - S - CI], [S + CI, 100 - S], [C, 100], [0, 100 - C]]),
      solid([[S + CI, 100 - S], [98 - S - CI, 100 - S], [98 - S, 100 - S - CI], [98 - S, 60], [98, 60], [98, 100 - C], [98 - C, 100], [C, 100]]),
      solid([[50, 46], [98, 46], [98, 66], [50, 66]]),
    ],
  },
};
const GAP = 12;
const SKEW = Math.tan((10 * Math.PI) / 180); // 앞으로 10° 기울임

function toPath(polys) {
  return polys.map((pts) => "M" + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L") + " Z").join(" ");
}

/** 글자 줄 → 기울임까지 구운 path 와 딱 맞는 viewBox */
function word(text) {
  let x = 0;
  const polys = [];
  for (const ch of text) {
    const g = glyphs[ch];
    for (const p of g.polys) polys.push(p.map(([px, py]) => [px + x, py]));
    x += g.w + GAP;
  }
  // 위로 갈수록 오른쪽으로: x' = x + (100 - y) * tan10°
  const sk = polys.map((p) => p.map(([px, py]) => [px + (100 - py) * SKEW, py]));
  const xs = sk.flat().map(([px]) => px);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const moved = sk.map((p) => p.map(([px, py]) => [px - minX, py]));
  return { d: toPath(moved), w: f(maxX - minX), h: 100 };
}

/* ── 심볼 "발톱": 비스듬한 칼날 세 개 ── */
const knife = (x, top, bottom) => solid([[x, bottom], [x + 15, bottom], [x + 15 + (bottom - top) * 0.42, top + 8], [x + 6 + (bottom - top) * 0.42, top]]);
const blades = [knife(0, 18, 90), knife(25, 0, 90), knife(50, 18, 90)];
const bx = blades.flat().map(([x]) => x);
const by = blades.flat().map(([, y]) => y);
const mark = {
  d: toPath(blades),
  w: f(Math.max(...bx) - Math.min(...bx)),
  h: f(Math.max(...by) - Math.min(...by)),
};

const makkina = word("MAKKINA");
const dragon = word("DRAGON");

/* ── 사이트 컴포넌트용 데이터 ── */
fs.writeFileSync(
  path.join(root, "src/components/logo-paths.ts"),
  `// 자동 생성 — 고치지 마세요. node scripts/logo.mjs
/** 심볼 "발톱" — 비스듬한 칼날 세 개 */
export const MARK = ${JSON.stringify(mark)};
/** 워드마크 MAKKINA — 모서리를 깎은 산업용 글자, 10° 기울임 */
export const WORDMARK = ${JSON.stringify(makkina)};
/** 같은 글자 체계의 제품명 DRAGON */
export const DRAGON_WORD = ${JSON.stringify(dragon)};
`,
);

/* ── 파일 (인쇄·각인·문서용) ── */
const GOLD = "#E0A526";
const SOIL = "#1C1A17";
const CREAM = "#F4EDDC";
const out = path.join(root, "public/brand");
fs.mkdirSync(out, { recursive: true });

const svg = (w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(w)} ${f(h)}" width="${f(w)}" height="${f(h)}"><title>${title}</title>${body}</svg>\n`;

// 심볼 단독 (여백 10%)
const pad = 10;
const markSvg = (fill) => svg(mark.w + pad * 2, mark.h + pad * 2, `<path transform="translate(${pad} ${pad})" d="${mark.d}" fill="${fill}"/>`, "MAKKINA");
fs.writeFileSync(path.join(out, "makkina-mark.svg"), markSvg(GOLD));
fs.writeFileSync(path.join(out, "makkina-mark-black.svg"), markSvg("#000000"));
fs.writeFileSync(path.join(out, "makkina-mark-white.svg"), markSvg("#FFFFFF"));

// 가로 조합: 심볼 높이 = 글자 높이 × 1.6
const lockup = (markFill, wordFill) => {
  const k = 160 / mark.h; // 심볼 높이 160
  const mw = mark.w * k;
  const gapX = 44;
  const wy = (160 - 100) / 2 + 6;
  const W = mw + gapX + makkina.w;
  return svg(
    W,
    160,
    `<path transform="scale(${f(k)})" d="${mark.d}" fill="${markFill}"/><path transform="translate(${f(mw + gapX)} ${f(wy)})" d="${makkina.d}" fill="${wordFill}"/>`,
    "MAKKINA 성원마끼나",
  );
};
fs.writeFileSync(path.join(out, "makkina-logo.svg"), lockup(GOLD, SOIL));
fs.writeFileSync(path.join(out, "makkina-logo-reverse.svg"), lockup(GOLD, CREAM));
fs.writeFileSync(path.join(out, "makkina-logo-black.svg"), lockup("#000000", "#000000"));
fs.writeFileSync(path.join(out, "makkina-logo-white.svg"), lockup("#FFFFFF", "#FFFFFF"));
fs.writeFileSync(path.join(out, "makkina-wordmark.svg"), svg(makkina.w, 100, `<path d="${makkina.d}" fill="${SOIL}"/>`, "MAKKINA"));
fs.writeFileSync(path.join(out, "dragon-wordmark.svg"), svg(dragon.w, 100, `<path d="${dragon.d}" fill="${SOIL}"/>`, "DRAGON"));

// 브라우저 탭 아이콘: 흙먹 둥근 타일 위 금색 발톱 (밝은·어두운 탭 모두에서 보인다)
const tile = (size) => {
  const inner = size * 0.72;
  const k = inner / Math.max(mark.w, mark.h);
  const ox = (size - mark.w * k) / 2;
  const oy = (size - mark.h * k) / 2;
  return svg(
    size,
    size,
    `<rect width="${size}" height="${size}" rx="${f(size * 0.22)}" fill="${SOIL}"/><path transform="translate(${f(ox)} ${f(oy)}) scale(${f(k)})" d="${mark.d}" fill="${GOLD}"/>`,
    "MAKKINA",
  );
};
fs.writeFileSync(path.join(root, "src/app/icon.svg"), tile(64));
fs.writeFileSync(path.join(out, "makkina-app-icon.svg"), tile(512));

console.log("mark", mark.w, "x", mark.h, "| MAKKINA", makkina.w, "| DRAGON", dragon.w);
