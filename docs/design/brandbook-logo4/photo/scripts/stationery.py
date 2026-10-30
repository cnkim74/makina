from comp import *
img = load("src/stationery.png")
img, b1 = swap(img, (130, 160, 500, 225), "lock-dark", k=1.25)
img, b2 = swap(img, (700, 490, 990, 545), "lock-light", k=1.25)
img, b3 = swap(img, (700, 665, 925, 708), "lock-dark", k=1.25)
print(b1, b2, b3)
save(img, "out/stationery.jpg")
