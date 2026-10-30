// 로고 조각을 투명 PNG로: node logos.mjs <logo-paths.ts> <출력 폴더>
import fs from "node:fs";
import { chromium } from "/opt/node-tools/node_modules/playwright/index.mjs";
const [TS, OUT] = process.argv.slice(2);
const s = fs.readFileSync(TS, "utf8");
const g = (n) => JSON.parse(s.match(new RegExp(`export const ${n} = (\\{.*?\\});`))[1]);
const M = g("MARK"), W = g("WORDMARK"), D = g("DRAGON_WORD");
const K = M.w / M.h;
const gold = "#E0A526", soil = "#1C1A17", cream = "#F4EDDC";
// 가로 조합: H=100 기준 단위
const lock = (mf, wf) => { const mw = 160 * K; const w = mw + 44 + W.w; return [w, 160, `<path transform="scale(${160 / M.h})" d="${M.d}" fill="${mf}"/><path transform="translate(${mw + 44} 36)" d="${W.d}" fill="${wf}"/>`]; };
const mark = (f) => [M.w, M.h, `<path d="${M.d}" fill="${f}"/>`];
const word = (f) => [W.w, W.h, `<path d="${W.d}" fill="${f}"/>`];
// 세로 조합: 심볼 높이 2.2H, 간격 0.5H, 글자 H
const vert = (mf, wf) => { const mh = 220, mw = mh * K, w = Math.max(mw, W.w); return [w, mh + 50 + 100, `<path transform="translate(${(w - mw) / 2} 0) scale(${mh / M.h})" d="${M.d}" fill="${mf}"/><path transform="translate(${(w - W.w) / 2} ${mh + 50})" d="${W.d}" fill="${wf}"/>`]; };
const items = {
  "lock-dark": lock(gold, soil), "lock-light": lock(gold, cream), "lock-white": lock("#FFFFFF", "#FFFFFF"),
  "mark-gold": mark(gold), "mark-soil": mark(soil), "word-cream": word(cream), "word-soil": word(soil),
  "vert-light": vert(gold, cream), "dragon-soil": [D.w, D.h, `<path d="${D.d}" fill="${soil}"/>`],
};
const b = await chromium.launch();
const p = await b.newPage();
for (const [n, [w, h, body]] of Object.entries(items)) {
  const H = 1200, Wd = Math.round((H * w) / h);
  await p.setViewportSize({ width: Wd, height: H });
  await p.setContent(`<html><body style="margin:0;background:transparent"><svg width="${Wd}" height="${H}" viewBox="0 0 ${w} ${h}" style="display:block">${body}</svg></body></html>`);
  await p.screenshot({ path: `${OUT}/${n}.png`, omitBackground: true });
}
await b.close();
console.log("ok");
