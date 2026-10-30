"""재단 크기(도련 없음) PDF 쪽마다 사방 B mm 도련을 붙인다: 가장자리 1px 줄을 늘려 도련 칸을 채운다.
python3 -I bleed.py <입력 pdf> <가장자리 png 폴더(pdftoppm -r 150 결과, 접두어 e)> <B mm> <출력 pdf>"""
import sys, glob
import numpy as np
import pikepdf
from PIL import Image
src, edir, B, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
MM = 72 / 25.4
pdf = pikepdf.open(src)
new = pikepdf.new()
pngs = sorted(glob.glob(f"{edir}/e-*.png"))
assert len(pngs) == len(pdf.pages)
def img(dst, a):
    a = np.ascontiguousarray(a.astype(np.uint8))
    return pikepdf.Stream(dst, a.tobytes(), Type=pikepdf.Name.XObject, Subtype=pikepdf.Name.Image, Width=a.shape[1], Height=a.shape[0], ColorSpace=pikepdf.Name.DeviceRGB, BitsPerComponent=8)
for page, pf in zip(pdf.pages, pngs):
    mb = [float(v) for v in page.mediabox]
    w, h = mb[2] - mb[0], mb[3] - mb[1]
    b = B * MM
    a = np.asarray(Image.open(pf).convert("RGB"))
    L, R = a[:, :1], a[:, -1:]           # 세로 1px
    T, Bo = a[:1, :], a[-1:, :]          # 가로 1px
    corners = [a[:1, :1], a[:1, -1:], a[-1:, :1], a[-1:, -1:]]
    np_ = new.add_blank_page(page_size=(w + 2 * b, h + 2 * b))
    xo = new.copy_foreign(page.as_form_xobject())
    res = {"/P0": xo}
    ops = []
    # PDF 좌표는 아래에서 위로: 그림의 첫 줄(위) = 높은 y
    items = [
        ("L", L, 0, b, b, h), ("R", R, w + b, b, b, h),
        ("T", T, b, h + b, w, b), ("B", Bo, b, 0, w, b),
        ("TL", corners[0], 0, h + b, b, b), ("TR", corners[1], w + b, h + b, b, b),
        ("BL", corners[2], 0, 0, b, b), ("BR", corners[3], w + b, 0, b, b),
    ]
    for n, arr, x, y, sw, sh in items:
        res[f"/E{n}"] = img(new, arr)
        ops.append(f"q {sw:.4f} 0 0 {sh:.4f} {x:.4f} {y:.4f} cm /E{n} Do Q")
    ops.append(f"q 1 0 0 1 {b:.4f} {b:.4f} cm /P0 Do Q")
    np_.obj.Resources = pikepdf.Dictionary(XObject=pikepdf.Dictionary(res))
    np_.obj.Contents = new.make_stream("\n".join(ops).encode())
new.save(out)
print("ok", len(new.pages))
