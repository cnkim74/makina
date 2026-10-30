from comp import *
img = load("src/merch.png")
# 머그
base, _ = erase(img, np.float32([[330, 300], [540, 300], [540, 480], [330, 480]]), thr=45, dilate=4)
_, al = logo("mark-gold"); ma = al.shape[1] / al.shape[0]
h = 150; img, _ = place(base, "mark-gold", rect_quad(437, 392, h * ma, h, -2), blur=0.6, tex_from=base, texture=0.12)
# 수건 띠 (원근)
band = np.float32([[690, 340], [1402, 490], [1366, 632], [628, 482]])
Hb = quad_h(100.0, 20.0, band)
reg = np.float32([plane_point(Hb, 8.5, 3), plane_point(Hb, 90.5, 3), plane_point(Hb, 90.5, 17.2), plane_point(Hb, 8.5, 17.2)])
base, m = erase(img, reg, thr=40, dilate=5, radius=6)
base = base + np.random.default_rng(9).normal(0, 4.0, base.shape).astype(np.float32) * m[..., None]
_, al = logo("lock-light"); la = al.shape[1] / al.shape[0]
mh = 11.5; lw = mh * la; u0 = 50 - lw / 2; v0 = 10 - mh / 2
q = np.float32([plane_point(Hb, u0, v0), plane_point(Hb, u0 + lw, v0), plane_point(Hb, u0 + lw, v0 + mh), plane_point(Hb, u0, v0 + mh)])
img, _ = place(base, "lock-light", q, blur=0.8, tex_from=base, texture=0.5, gain=0.95)
# 스티커 (타원 안만 지운다)
def sticker(img, cx, cy, rx, ry, name, ang, s=0.95):
    t = np.linspace(0, 2 * np.pi, 72); a = np.deg2rad(ang)
    ex, ey = rx * 0.86 * np.cos(t), ry * 0.86 * np.sin(t)
    reg = np.stack([cx + ex * np.cos(a) - ey * np.sin(a), cy + ex * np.sin(a) + ey * np.cos(a)], 1).astype(np.float32)
    base, _ = erase(img, reg, thr=50, dilate=3)
    _, al = logo(name); r = al.shape[1] / al.shape[0]
    hp = rx * s; return place(base, name, rect_quad(cx, cy, hp * r, hp * ry / rx, ang), blur=0.6)[0]
img = sticker(img, 552, 752, 128, 80, "mark-gold", -6)
img = sticker(img, 828, 845, 138, 92, "mark-soil", -8)
save(img, "out/merch.jpg")
