from comp import *
img = load("src/pylon.png")
H, W = img.shape[:2]
face = np.float32([[383, 154], [686, 67], [686, 721], [372, 743]])
Wf, Hf = 100.0, 205.0
Hm = quad_h(Wf, Hf, face); Hi = np.linalg.inv(Hm)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
P = np.stack([xx, yy, np.ones_like(xx)], -1) @ Hi.T
u, v = P[..., 0] / P[..., 2], P[..., 1] / P[..., 2]
def strip(u0, u1):
    out = np.zeros((206, 3), np.float32)
    for i in range(206):
        m = (u > u0) & (u < u1) & (np.abs(v - i) < 1.2)
        out[i] = np.median(img[m], axis=0) if m.any() else out[i - 1]
    return out
L, Rr = strip(1.0, 3.5), strip(94, 98)
vi = np.clip(v, 0, 205).astype(int); t = np.clip(u / 100, 0, 1)[..., None]
fill = L[vi] * (1 - t) + Rr[vi] * t + np.random.default_rng(5).normal(0, 1.4, img.shape).astype(np.float32)
inside = ((u > 0.6) & (u < 99.4) & (v > 0.6) & (v < 203.5)).astype(np.float32)
m = cv2.GaussianBlur(inside, (0, 0), 0.7)[..., None]
base = img * (1 - m) + fill * m
def put(base, name, u0, v0, wu, hv, **kw):
    q = np.float32([plane_point(Hm, u0, v0), plane_point(Hm, u0 + wu, v0), plane_point(Hm, u0 + wu, v0 + hv), plane_point(Hm, u0, v0 + hv)])
    return place(base, name, q, **kw)[0]
_, al = logo("mark-gold"); ma = al.shape[1] / al.shape[0]
_, al = logo("word-cream"); wa = al.shape[1] / al.shape[0]
mh = 66; ww = 78; wh = ww / wa
v0 = 52
base = put(base, "mark-gold", 50 - mh * ma / 2, v0, mh * ma, mh, blur=0.5)
base = put(base, "word-cream", 50 - ww / 2, v0 + mh + 9, ww, wh, blur=0.5)
save(base, "out/pylon.jpg")
# 가운데 금색 판: DRAGON
gold = np.float32([[372, 744], [686, 722], [686, 1102], [369, 1099]])
Hg = quad_h(100.0, 120.0, gold)
_, al = logo("dragon-soil"); da = al.shape[1] / al.shape[0]
dw = 70; dh = dw / da
q = np.float32([plane_point(Hg, 50 - dw / 2, 60 - dh / 2), plane_point(Hg, 50 + dw / 2, 60 - dh / 2), plane_point(Hg, 50 + dw / 2, 60 + dh / 2), plane_point(Hg, 50 - dw / 2, 60 + dh / 2)])
base, _ = place(base, "dragon-soil", q, blur=0.5)
save(base, "out/pylon.jpg")
