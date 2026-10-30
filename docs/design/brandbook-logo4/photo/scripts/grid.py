import sys
from PIL import Image, ImageDraw
src, out, x0, y0, x1, y1, step, sc = sys.argv[1], sys.argv[2], *map(int, sys.argv[3:9])
im = Image.open(src).convert("RGB").crop((x0, y0, x1, y1))
im = im.resize((im.width * sc, im.height * sc), Image.LANCZOS)
d = ImageDraw.Draw(im)
for x in range((x0 // step + 1) * step, x1, step):
    d.line([((x - x0) * sc, 0), ((x - x0) * sc, im.height)], fill=(0, 255, 255), width=1); d.text(((x - x0) * sc + 2, 2), str(x), fill=(255, 0, 255))
for y in range((y0 // step + 1) * step, y1, step):
    d.line([(0, (y - y0) * sc), (im.width, (y - y0) * sc)], fill=(0, 255, 255), width=1); d.text((2, (y - y0) * sc + 2), str(y), fill=(255, 0, 255))
im.save(out)
