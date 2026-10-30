from comp import *
img = load("src/booth.png")
img, b1 = swap(img, (200, 225, 830, 365), "lock-light", thr=55, k=1.06, pad=6, shade=False)
img, b2 = swap(img, (150, 695, 360, 850), "mark-gold", thr=55, k=0.95, align="center", pad=6, shade=False)
print(b1, b2)
save(img, "out/booth.jpg")
