"""실사 목업 합성 도구: AI가 그린 로고를 지우고(inpaint) 실제 로고를 원근에 맞춰 얹는다."""
import cv2
import numpy as np
from PIL import Image

LOGO = "/tmp/claude-0/-home-user-makina/61e18ae4-4575-5bbf-8a11-77080ed9bd03/scratchpad/mock/logo"


def load(p):
    return cv2.cvtColor(np.asarray(Image.open(p).convert("RGB")), cv2.COLOR_RGB2BGR).astype(np.float32)


def save(img, p):
    Image.fromarray(cv2.cvtColor(np.clip(img, 0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB)).save(p, quality=95)


def logo(name):
    a = np.asarray(Image.open(f"{LOGO}/{name}.png").convert("RGBA")).astype(np.float32)
    # 테두리 여백을 잘라 도형에 딱 맞게
    ys, xs = np.where(a[..., 3] > 8)
    a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    rgb = cv2.cvtColor(a[..., :3], cv2.COLOR_RGB2BGR)
    return rgb, a[..., 3] / 255.0


def poly_mask(shape, pts):
    m = np.zeros(shape[:2], np.uint8)
    cv2.fillPoly(m, [np.int32(np.round(pts))], 255)
    return m > 0


def erase(img, region, ref=None, thr=40, dilate=5, radius=7, extra=None):
    """region 다각형 안에서 바탕색(ref)과 다른 픽셀(옛 로고)을 지우고 주변으로 채운다."""
    reg = poly_mask(img.shape, region)
    if ref is None:
        ring = cv2.dilate(reg.astype(np.uint8), np.ones((15, 15), np.uint8)) > 0
        ring &= ~reg
        ref = np.median(img[ring], axis=0)
    d = np.linalg.norm(img - np.array(ref, np.float32), axis=2)
    m = (d > thr) & reg
    if extra is not None:
        m |= extra
    m = cv2.dilate(m.astype(np.uint8) * 255, np.ones((dilate * 2 + 1, dilate * 2 + 1), np.uint8))
    m &= reg.astype(np.uint8) * 255
    out = cv2.inpaint(np.clip(img, 0, 255).astype(np.uint8), m, radius, cv2.INPAINT_TELEA).astype(np.float32)
    # 넓은 칠은 매끈해지므로 원래 바탕의 결(노이즈)을 조금 되살린다
    noise = np.random.default_rng(1).normal(0, 2.0, img.shape).astype(np.float32)
    mm = (m > 0)[..., None]
    return np.where(mm, out + noise, out), m > 0


def quad_h(w, h, quad):
    src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    return cv2.getPerspectiveTransform(src, np.float32(quad))


def rect_quad(cx, cy, w, h, ang=0.0):
    """가운데·크기·회전(도)으로 네 꼭짓점."""
    a = np.deg2rad(ang)
    ux, uy = np.cos(a), np.sin(a)
    vx, vy = -np.sin(a), np.cos(a)
    pts = []
    for sx, sy in [(-1, -1), (1, -1), (1, 1), (-1, 1)]:
        pts.append([cx + sx * w / 2 * ux + sy * h / 2 * vx, cy + sx * w / 2 * uy + sy * h / 2 * vy])
    return np.float32(pts)


def plane_point(Hm, u, v):
    p = Hm @ np.array([u, v, 1.0])
    return p[:2] / p[2]


def place(img, name, quad, shade_from=None, tex_from=None, texture=0.0, blur=0.6, opacity=1.0, extrude=None, shadow=None, color=None, gain=1.0):
    """name 로고를 quad(TL,TR,BR,BL)에 원근 변환해 얹는다.
    shade_from: 조명 추정용 바탕 이미지(지운 뒤 이미지). texture: 바탕 결을 로고에 비치게(0~1).
    extrude: (dx,dy,steps,darken) 채널 간판 두께. shadow: (dx,dy,blur,alpha)."""
    rgb, al = logo(name)
    if color is not None:
        rgb = np.zeros_like(rgb) + np.array(color[::-1], np.float32)
    h, w = al.shape
    Hm = quad_h(w, h, quad)
    H, W = img.shape[:2]
    wr = cv2.warpPerspective(rgb, Hm, (W, H), flags=cv2.INTER_AREA if False else cv2.INTER_LINEAR)
    wa = cv2.warpPerspective(al, Hm, (W, H), flags=cv2.INTER_LINEAR)
    # 축소가 크면 계단이 생기므로 큰 원본을 미리 줄이는 대신 약하게 흐린다
    if blur > 0:
        wa = cv2.GaussianBlur(wa, (0, 0), blur)
        wr = cv2.GaussianBlur(wr, (0, 0), blur * 0.5)
    out = img.copy()
    if shadow:
        dx, dy, sb, sa = shadow
        M = np.float32([[1, 0, dx], [0, 1, dy]])
        s = cv2.GaussianBlur(cv2.warpAffine(wa, M, (W, H)), (0, 0), sb) * sa
        out = out * (1 - s[..., None])
    if extrude:
        dx, dy, steps, dk = extrude
        for i in range(steps, 0, -1):
            M = np.float32([[1, 0, dx * i / steps], [0, 1, dy * i / steps]])
            ea = cv2.warpAffine(wa, M, (W, H))[..., None]
            er = cv2.warpAffine(wr, M, (W, H)) * dk
            out = out * (1 - ea) + er * ea
    face = wr * gain
    if shade_from is not None:
        L = cv2.cvtColor(np.clip(shade_from, 0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)
        Lb = cv2.GaussianBlur(L, (0, 0), 25)
        ref = np.median(Lb[wa > 0.5]) if (wa > 0.5).any() else Lb.mean()
        sh = np.clip(Lb / max(ref, 1), 0.7, 1.3)
        face = face * sh[..., None]
    src_t = tex_from if tex_from is not None else shade_from
    if texture and src_t is not None:
        Lt = cv2.cvtColor(np.clip(src_t, 0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)
        hp = (Lt - cv2.GaussianBlur(Lt, (0, 0), 3)) / 255.0
        face = face * (1 + texture * hp[..., None] * 4)
    a = wa[..., None] * opacity
    return out * (1 - a) + face * a, Hm


def grain(img, s=2.2):
    return img + np.random.default_rng(7).normal(0, s, img.shape).astype(np.float32)


def find(img, box, ref=None, thr=60):
    """box 안에서 바탕(ref)과 다른 픽셀의 꼭 맞는 사각형."""
    x0, y0, x1, y1 = box
    c = img[y0:y1, x0:x1]
    if ref is None:
        edge = np.concatenate([c[0], c[-1], c[:, 0], c[:, -1]])
        ref = np.median(edge, axis=0)
    d = np.linalg.norm(c - np.array(ref, np.float32), axis=2) > thr
    d = cv2.morphologyEx(d.astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8)) > 0
    ys, xs = np.where(d)
    return (x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1), ref


def swap(img, box, name, ref=None, thr=60, k=1.0, align="left", ang=0.0, pad=4, dx=0, dy=0, shade=True, **kw):
    """box 안의 옛 로고를 지우고 같은 자리에 새 로고(name)를 얹는다. k: 높이 배율(옛 높이 기준)."""
    (x0, y0, x1, y1), ref = find(img, box, ref, thr)
    region = np.float32([[x0 - pad, y0 - pad], [x1 + pad, y0 - pad], [x1 + pad, y1 + pad], [x0 - pad, y1 + pad]])
    base, _ = erase(img, region, ref=ref, thr=thr * 0.5, dilate=3)
    rgb, al = logo(name)
    h = (y1 - y0) * k
    w = h * al.shape[1] / al.shape[0]
    cy = (y0 + y1) / 2 + dy
    cx = {"left": x0 + w / 2, "center": (x0 + x1) / 2, "right": x1 - w / 2}[align] + dx
    q = rect_quad(cx, cy, w, h, ang)
    out, _ = place(base, name, q, shade_from=base if shade else None, **kw)
    return out, (x0, y0, x1, y1)
