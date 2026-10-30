from comp import *
img = load("src/cards.png")
# 흰 명함: 약 -5.3도 기울기
reg = rect_quad(565, 326, 480, 120, -5.3)
base, _ = erase(img, reg, thr=45, dilate=3)
rgb, al = logo("lock-dark"); asp = al.shape[1] / al.shape[0]
h = 74; q = rect_quad(560, 330, h * asp, h, -5.3)
img, _ = place(base, "lock-dark", q, shade_from=base, texture=0.15)
# 검은 명함: 약 -7도
reg = rect_quad(870, 715, 230, 230, -7)
base, _ = erase(img, reg, thr=45, dilate=4)
rgb, al = logo("vert-light"); asp = al.shape[1] / al.shape[0]
h = 150; q = rect_quad(872, 712, h * asp, h, -7)
img, _ = place(base, "vert-light", q, shade_from=base, texture=0.2)
save(img, "out/cards.jpg")
