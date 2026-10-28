"""DRAGON 워드마크 윤곽을 HS봄바람체 글꼴 파일에서 뽑아 src/components/dragon-word.ts 로 쓴다.

python3 scripts/dragon-word.py <HS봄바람체 .woff/.ttf/.otf>   (pip install fonttools)

글꼴 파일은 저장소에 넣지 않는다(웹에는 public/fonts/HSBombaram-sub.woff2 부분 글꼴만 둔다).
"""
import json
import pathlib
import sys

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

TEXT = "DRAGON"
TRACK = 40  # 자간(1/1000 em)

font = TTFont(sys.argv[1])
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
hmtx = font["hmtx"]

placed, x = [], 0
for ch in TEXT:
    g = cmap[ord(ch)]
    placed.append((g, x))
    x += hmtx[g][0] + TRACK

bounds = BoundsPen(glyphs)
for g, ox in placed:
    glyphs[g].draw(TransformPen(bounds, (1, 0, 0, 1, ox, 0)))
xmin, ymin, xmax, ymax = bounds.bounds

pen = SVGPathPen(glyphs, ntos=lambda v: ("%.1f" % v).rstrip("0").rstrip("."))
for g, ox in placed:
    glyphs[g].draw(TransformPen(pen, (1, 0, 0, -1, ox - xmin, ymax)))

word = {"d": pen.getCommands(), "w": round(xmax - xmin, 1), "h": round(ymax - ymin, 1)}
name = font["name"].getDebugName(4) or "HS봄바람체"
out = pathlib.Path(__file__).resolve().parent.parent / "src/components/dragon-word.ts"
out.write_text(
    "// 자동 생성 — 고치지 마세요. python3 scripts/dragon-word.py <HS봄바람체 글꼴 파일>\n"
    f"/** DRAGON 워드마크 — {name} 글자 윤곽(자간 {TRACK}/1000). 2026-10-28 교정: DRAGON 글꼴은 HS봄바람체 */\n"
    f"export const DRAGON_WORD = {json.dumps(word)};\n",
    encoding="utf-8",
)
print(out, word["w"], "x", word["h"])
