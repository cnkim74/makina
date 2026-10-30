from comp import *
img = load("src/truck.png")
H, W = img.shape[:2]
bx0, by0, bx1, by1 = 454, 283, 1471, 682
# 줄별 바탕색: 글자·빗금 없는 띠(x 460~520)에서
prof = np.array([np.median(img[y, 460:520], axis=0) for y in range(H)], np.float32)
# 가로 방향 밝기 차이(조명)를 열별 보정으로 맞춘다
ref = np.median(prof[300:420], axis=0)
col = np.array([np.median(img[300:420, x], axis=0) for x in range(W)], np.float32) / np.maximum(ref, 1)
col[1100:] = col[1080:1100].mean(axis=0)
col = cv2.GaussianBlur(col[None], (0, 0), 6)[0]
fill = prof[:, None, :].repeat(W, 1) * col[None] + np.random.default_rng(2).normal(0, 1.5, img.shape).astype(np.float32)
# 오른쪽(옛 빗금 자리)은 바로 왼쪽 띠(x 1086~1099)의 줄별 색을 그대로 잇는다
pr = np.array([np.median(img[y, 1086:1100], axis=0) for y in range(H)], np.float32)
pr[425:515] = (prof * col[1092])[425:515]
fill[:, 1100:] = pr[:, None, :] + np.random.default_rng(4).normal(0, 1.5, (H, W - 1100, 3)).astype(np.float32)
def paint(img, x0, y0, x1, y1):
    m = np.zeros((H, W), np.float32); m[y0:y1, x0:x1] = 1
    m = cv2.GaussianBlur(m, (0, 0), 1.0)[..., None]
    return img * (1 - m) + fill * m
base = paint(img, 1100, by0 + 2, bx1 - 1, 693)   # 큰 빗금
base = paint(base, 520, 430, 1112, 510)            # 옛 가로 조합
# 큰 심볼(적재함 뒤쪽, 잘라서)
rgb, al = logo("mark-gold"); asp = al.shape[1] / al.shape[0]
mh = 540; mw = mh * asp
q = np.float32([[1080, 700 - mh], [1080 + mw, 700 - mh], [1080 + mw, 700], [1080, 700]])
big, _ = place(base, "mark-gold", q, shade_from=None, blur=0.6)
box = np.zeros((H, W), np.float32); box[by0 + 2:by1, bx0:bx1 - 1] = 1
box = cv2.GaussianBlur(box, (0, 0), 0.8)[..., None]
base = big * box + base * (1 - box)
# 가로 조합
rgb, al = logo("lock-light"); asp = al.shape[1] / al.shape[0]
h = 84; q = rect_quad(530 + h * asp / 2, 468, h * asp, h)
out, _ = place(base, "lock-light", q, shade_from=None, blur=0.6)
save(out, "out/truck.jpg")
