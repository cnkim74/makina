from comp import *
img = load("src/wear.png")
H, W = img.shape[:2]
def stitch(phi_deg, period, amp=40):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    a = np.deg2rad(phi_deg)
    s = xx * np.cos(a) + yy * np.sin(a)
    n = np.random.default_rng(11).normal(0, 6, (H, W)).astype(np.float32)
    t = 128 + amp * np.sin(2 * np.pi * s / period) + n
    return np.repeat(t[..., None], 3, 2)
# 가슴 자수: 가로 조합
base, _ = erase(img, np.float32([[612, 394], [808, 394], [808, 432], [612, 432]]), thr=50, dilate=2, radius=4)
_, al = logo("lock-light"); la = al.shape[1] / al.shape[0]
h = 31; q = rect_quad(616 + h * la / 2, 414, h * la, h)
img, _ = place(base, "lock-light", q, blur=0.55, tex_from=stitch(-27, 1.6, 30), texture=0.35, shadow=(0.8, 1.2, 0.8, 0.5), gain=0.93)
# 모자: 심볼 금사 입체 자수 (칼날 축 방향 약 -63도, 땀은 축을 가로질러)
base, _ = erase(img, np.float32([[1158, 402], [1322, 402], [1322, 520], [1158, 520]]), thr=55, dilate=3, radius=5)
_, al = logo("mark-gold"); ma = al.shape[1] / al.shape[0]
h = 100; q = rect_quad(1236, 462, h * ma, h, -3)
img, _ = place(base, "mark-gold", q, blur=0.6, tex_from=stitch(-63, 2.2, 45), texture=0.55, shadow=(2.0, 3.0, 1.6, 0.65), extrude=(0.8, 1.4, 3, 0.55), shade_from=None, gain=0.98)
save(img, "out/wear.jpg")
