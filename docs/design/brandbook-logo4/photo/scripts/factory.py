import numpy as np, cv2
from comp import *
img = load("src/factory.png")
board = np.float32([[180, 187], [1205, 357], [1205, 476], [180, 366]])
Wb, Hb = 620.0, 100.0
Hm = quad_h(Wb, Hb, board)
Hi = np.linalg.inv(Hm)
H, W = img.shape[:2]
# 판 평면 좌표 (u,v)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
P = np.stack([xx, yy, np.ones_like(xx)], -1) @ Hi.T
u, v = P[..., 0] / P[..., 2], P[..., 1] / P[..., 2]
inside = (u > 3) & (u < Wb - 3) & (v > 3) & (v < 84)
clean = (u > 4) & (u < 60) & (v > 3) & (v < 84)
# 깨끗한 왼쪽 판에서 v(높이)별 색을 뽑아 전체를 칠한다
prof = np.zeros((90, 3), np.float32)
for i in range(90):
    m = clean & (np.abs(v - i) < 1.5)
    prof[i] = np.median(img[m], axis=0) if m.any() else prof[i - 1]
prof = cv2.GaussianBlur(prof[None], (1, 0), 3)[0] if False else prof
vi = np.clip(v, 0, 89).astype(int)
fill = prof[vi] + np.random.default_rng(3).normal(0, 1.6, img.shape).astype(np.float32)
m = cv2.GaussianBlur(inside.astype(np.float32), (0, 0), 0.8)[..., None]
base = img * (1 - m) + fill * m
# 새 로고: 글자 높이 H = 0.40Hb, 심볼 1.6H, 판 안 세로 가운데(0~84)
Hc = 0.45 * Hb
rgb, al = logo("lock-light")
lw = Hc * 1.6 * al.shape[1] / al.shape[0]
u0, v0 = (Wb - lw) / 2, (84 - 1.6 * Hc) / 2 + 1
q = [plane_point(Hm, u0, v0), plane_point(Hm, u0 + lw, v0), plane_point(Hm, u0 + lw, v0 + 1.6 * Hc), plane_point(Hm, u0, v0 + 1.6 * Hc)]
out, _ = place(base, "lock-light", np.float32(q), shade_from=None, blur=0.5, extrude=(3.0, 4.0, 6, 0.45), shadow=(7, 9, 4, 0.55), gain=1.04)
save(out, "out/factory.jpg")
print("lockup width in board units", lw)
