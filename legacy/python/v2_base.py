import cairo, numpy as np, cv2, math, subprocess, sys, os
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
FPS = 30
DUR = 15.0
N = int(DUR * FPS)
WORK = sys.argv[1]
OUT = sys.argv[2]
ONLY = [float(x) for x in sys.argv[3].split(',')] if len(sys.argv) > 3 else None
pi = math.pi


def hexc(h, a=1.0):
    h = h.lstrip('#')
    return (int(h[0:2], 16) / 255, int(h[2:4], 16) / 255, int(h[4:6], 16) / 255, a)


SHELL = '#FCEFED'; PERI = '#6173F4'; CORAL = '#F35E3E'; PLUM = '#3B2E40'
NAVY = '#0A1E4A'; NAVY2 = '#2F6FD0'; MINT = '#86E8A8'; WHITE = '#FFFFFF'

FD = '/usr/share/fonts/opentype/inter/'
F_LIGHT = FD + 'InterDisplay-Light.otf'
F_REG = FD + 'InterDisplay-Regular.otf'
F_MED = FD + 'InterDisplay-Medium.otf'
F_SEMI = FD + 'InterDisplay-SemiBold.otf'
F_SCRIPT = os.path.expanduser('~/.fonts/MarckScript-Regular.ttf')


# ---------- easing ----------
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def prog(t, a, b): return clamp((t - a) / (b - a))
def eo3(x): return 1 - (1 - x) ** 3
def eoexpo(x): return 1.0 if x >= 1 else 1 - 2 ** (-10 * x)
def eio(x): return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
def eback(x, s=1.7):
    x -= 1
    return max(1e-3, 1 + (s + 1) * x ** 3 + s * x ** 2)
def lerp(a, b, x): return a + (b - a) * x


# ---------- sprites ----------
class Sprite:
    def __init__(self, rgba, ox=None, oy=None):
        h, w = rgba.shape[:2]
        a = rgba[:, :, 3:4].astype(np.float32) / 255
        pre = (rgba[:, :, :3].astype(np.float32) * a + 0.5).astype(np.uint8)
        stride = cairo.ImageSurface.format_stride_for_width(cairo.FORMAT_ARGB32, w)
        buf = np.zeros((h, stride // 4, 4), np.uint8)
        buf[:, :w, 0] = pre[:, :, 2]; buf[:, :w, 1] = pre[:, :, 1]; buf[:, :w, 2] = pre[:, :, 0]
        buf[:, :w, 3] = rgba[:, :, 3]
        self.buf = buf
        self.surf = cairo.ImageSurface.create_for_data(memoryview(buf), cairo.FORMAT_ARGB32, w, h, stride)
        self.w, self.h = w, h
        self.ox = w / 2 if ox is None else ox
        self.oy = h / 2 if oy is None else oy


_fc = {}
def font(path, size):
    k = (path, size)
    if k not in _fc: _fc[k] = ImageFont.truetype(path, size)
    return _fc[k]

TSS = 1.5
_tc = {}
def text_sprite(segs, path, size, tracking=0.0):
    if isinstance(segs, str): segs = [(segs, PLUM)]
    k = (tuple(segs), path, size, tracking)
    if k in _tc: return _tc[k]
    px = int(size * TSS)
    f = font(path, px)
    asc, desc = f.getmetrics()
    tr = tracking * px
    def seglen(s): return f.getlength(s) + tr * len(s) if tr else f.getlength(s)
    total = sum(seglen(s) for s, _ in segs)
    pad = int(px * 0.35)
    img = Image.new('RGBA', (int(total + 2 * pad) + 2, asc + desc + 2 * pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x = pad
    for s, c in segs:
        col = tuple(int(v * 255) for v in hexc(c)[:3]) + (255,)
        if tr:
            for ch in s:
                d.text((x, pad + asc), ch, font=f, fill=col, anchor='ls'); x += f.getlength(ch) + tr
        else:
            d.text((x, pad + asc), s, font=f, fill=col, anchor='ls'); x += f.getlength(s)
    sp = Sprite(np.array(img), ox=pad + total / 2, oy=pad + asc)
    sp.tw = total / TSS; sp.pad = pad; sp.cap = px * 0.72
    _tc[k] = sp
    return sp


def text_width(segs, path, size, tracking=0.0):
    return text_sprite(segs, path, size, tracking).tw


def draw_text(ctx, segs, path, size, x, y, alpha=1.0, scale=1.0, anchor='c', rot=0.0, tracking=0.0):
    """y is the visual vertical center of the cap height"""
    if alpha <= 0.001: return
    sp = text_sprite(segs, path, size, tracking)
    ctx.save()
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale / TSS, scale / TSS)
    ox = sp.pad if anchor == 'l' else sp.ox
    ctx.set_source_surface(sp.surf, -ox, -sp.oy + sp.cap / 2)
    ctx.get_source().set_filter(cairo.FILTER_GOOD)
    ctx.paint_with_alpha(alpha)
    ctx.restore()


def draw_sprite(ctx, sp, x, y, width=None, rot=0.0, alpha=1.0, scale=1.0):
    s = (width / sp.w if width else 1.0) * scale
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s)
    ctx.set_source_surface(sp.surf, -sp.ox, -sp.oy)
    ctx.get_source().set_filter(cairo.FILTER_GOOD)
    ctx.paint_with_alpha(alpha)
    ctx.restore()


_sc = {}
def shadow_sprite(w, h, r, blur, alpha=0.22, color=(59, 46, 64)):
    k = (int(w), int(h), int(r), blur, alpha, color)
    if k in _sc: return _sc[k]
    pad = int(blur * 3)
    img = Image.new('L', (int(w) + 2 * pad, int(h) + 2 * pad), 0)
    ImageDraw.Draw(img).rounded_rectangle([pad, pad, pad + w, pad + h], radius=r, fill=255)
    a = cv2.GaussianBlur(np.array(img), (0, 0), blur).astype(np.float32) * alpha
    rgba = np.zeros(a.shape + (4,), np.uint8)
    rgba[:, :, 0], rgba[:, :, 1], rgba[:, :, 2] = color
    rgba[:, :, 3] = a.astype(np.uint8)
    _sc[k] = Sprite(rgba)
    return _sc[k]


def rrect(ctx, x, y, w, h, r):
    r = min(r, w / 2, h / 2)
    ctx.new_sub_path()
    ctx.arc(x + w - r, y + r, r, -pi / 2, 0)
    ctx.arc(x + w - r, y + h - r, r, 0, pi / 2)
    ctx.arc(x + r, y + h - r, r, pi / 2, pi)
    ctx.arc(x + r, y + r, r, pi, 3 * pi / 2)
    ctx.close_path()


def card(ctx, cx, cy, w, h, r, alpha=1.0, scale=1.0, dark=False):
    if alpha <= 0: return
    ctx.save(); ctx.translate(cx, cy); ctx.scale(scale, scale)
    if not dark:
        draw_sprite(ctx, shadow_sprite(w, h, r, 40, 0.20), 0, h * 0.07, alpha=alpha)
    rrect(ctx, -w / 2, -h / 2, w, h, r)
    if dark:
        ctx.set_source_rgba(1, 1, 1, 0.09 * alpha); ctx.fill_preserve()
        ctx.set_source_rgba(1, 1, 1, 0.22 * alpha)
    else:
        g = cairo.LinearGradient(0, -h / 2, 0, h / 2)
        g.add_color_stop_rgba(0, 1, 1, 1, 0.95 * alpha); g.add_color_stop_rgba(1, 1, 1, 1, 0.80 * alpha)
        ctx.set_source(g); ctx.fill_preserve()
        ctx.set_source_rgba(1, 1, 1, alpha)
    ctx.set_line_width(3); ctx.stroke()
    ctx.restore()


# ---------- assets ----------
plane_rgba = np.array(Image.open(os.path.join(WORK, 'plane.png')).convert('RGBA'))
PLANE = Sprite(plane_rgba)
big = cv2.resize(plane_rgba, (plane_rgba.shape[1] * 4, plane_rgba.shape[0] * 4), interpolation=cv2.INTER_LANCZOS4)
rgb = big[:, :, :3].astype(np.float32)
blur = cv2.GaussianBlur(rgb, (0, 0), 3)
big[:, :, :3] = np.clip(rgb + 0.6 * (rgb - blur), 0, 255).astype(np.uint8)
PLANE_BIG = Sprite(big)

rng = np.random.default_rng(7)
GRAIN = [rng.normal(0, 3.2, (H, W, 1)).astype(np.float32) for _ in range(6)]


def draw_plane(ctx, x, y, width, rot=0.0, alpha=1.0, glint=None):
    if width < 2: return
    sp = PLANE_BIG if width > 380 else PLANE
    s = width / sp.w
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s)
    ctx.set_source_surface(sp.surf, -sp.w / 2, -sp.h / 2)
    ctx.get_source().set_filter(cairo.FILTER_GOOD)
    ctx.paint_with_alpha(alpha)
    if glint is not None and 0 < glint < 1:
        c = lerp(-1.3, 1.3, glint) * sp.w / 2
        bw = sp.w * 0.22
        d = 1 / math.sqrt(2)
        g = cairo.LinearGradient((c - bw) * d, (c - bw) * d, (c + bw) * d, (c + bw) * d)
        g.add_color_stop_rgba(0, 1, 1, 1, 0); g.add_color_stop_rgba(0.5, 1, 1, 1, 0.65 * alpha)
        g.add_color_stop_rgba(1, 1, 1, 1, 0)
        ctx.set_source(g); ctx.mask_surface(sp.surf, -sp.w / 2, -sp.h / 2)
    ctx.restore()


# ---------- backgrounds ----------
def bg_shell(ctx, t, dots=True):
    ctx.set_source_rgba(*hexc(SHELL)); ctx.paint()
    for (cx, cy, r, col, a) in [(880 + 60 * math.sin(t * .7), 260, 760, PERI, .20),
                                (160, 1650 + 50 * math.cos(t * .6), 700, MINT, .22)]:
        g = cairo.RadialGradient(cx, cy, 0, cx, cy, r)
        c = hexc(col)
        g.add_color_stop_rgba(0, c[0], c[1], c[2], a); g.add_color_stop_rgba(1, c[0], c[1], c[2], 0)
        ctx.set_source(g); ctx.paint()
    if dots:
        ctx.set_source_rgba(*hexc(PLUM, 0.07))
        for yy in range(-200, H + 240, 60):
            for xx in range(-200, W + 240, 60):
                ctx.rectangle(xx - 2, yy - 2, 4, 4)
        ctx.fill()


def bg_navy(ctx, t, glow=(540, 900), glow_a=0.35):
    g = cairo.LinearGradient(-400, -300, W + 400, H + 300)
    g.add_color_stop_rgba(0, *hexc('#061538')); g.add_color_stop_rgba(0.55, *hexc('#0E3277'))
    g.add_color_stop_rgba(1, *hexc(NAVY2))
    ctx.set_source(g); ctx.paint()
    cx, cy = glow
    r = cairo.RadialGradient(cx, cy, 0, cx, cy, 800)
    c = hexc('#4F8BF0')
    r.add_color_stop_rgba(0, c[0], c[1], c[2], glow_a); r.add_color_stop_rgba(1, c[0], c[1], c[2], 0)
    ctx.set_source(r); ctx.paint()


def bg_flat(ctx, col):
    ctx.set_source_rgba(*hexc(col)); ctx.paint()


# ---------- UI bits ----------
def hand(ctx, x, y, scale=1.0, alpha=1.0, press=0.0):
    if alpha <= 0: return
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.32); s = 1.45 * scale * (1 - 0.1 * press); ctx.scale(s, s)
    shapes = [(-14, 0, 28, 100, 14), (12, 56, 26, 52, 13), (36, 64, 24, 46, 12), (58, 74, 20, 38, 10),
              (-32, 74, 112, 96, 30)]
    def path():
        for (a, b, c, d, r) in shapes: rrect(ctx, a, b, c, d, r)
        ctx.save(); ctx.translate(-30, 112); ctx.rotate(-0.75); rrect(ctx, -54, -14, 62, 28, 14); ctx.restore()
    # soft shadow
    ctx.save(); ctx.translate(8, 12); path(); ctx.set_source_rgba(0, 0, 0, 0.18 * alpha); ctx.fill(); ctx.restore()
    path(); ctx.set_source_rgba(*hexc(PLUM, alpha)); ctx.set_line_width(11); ctx.set_line_join(cairo.LINE_JOIN_ROUND); ctx.stroke()
    path(); ctx.set_source_rgba(1, 1, 1, alpha); ctx.fill()
    ctx.restore()


def ripple(ctx, x, y, p, col=PERI, rmax=150):
    if p <= 0 or p >= 1: return
    ctx.arc(x, y, 20 + rmax * eo3(p), 0, 2 * pi)
    ctx.set_source_rgba(*hexc(col, 0.8 * (1 - p))); ctx.set_line_width(10 * (1 - p) + 2); ctx.stroke()


def power_icon(ctx, x, y, r, col):
    ctx.save(); ctx.set_line_cap(cairo.LINE_CAP_ROUND); ctx.set_line_width(r * 0.16)
    ctx.set_source_rgba(*col)
    ctx.arc(x, y, r, -pi / 2 + 0.6, -pi / 2 - 0.6 + 2 * pi); ctx.stroke()
    ctx.move_to(x, y - r * 1.15); ctx.line_to(x, y - r * 0.25); ctx.stroke()
    ctx.restore()


def check(ctx, x, y, s, p, col, lw=10):
    if p <= 0: return
    pts = [(-0.5, 0.0), (-0.12, 0.38), (0.55, -0.4)]
    l1 = math.dist(pts[0], pts[1]); l2 = math.dist(pts[1], pts[2]); L = (l1 + l2) * p
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s)
    ctx.move_to(*pts[0])
    if L <= l1:
        q = L / l1; ctx.line_to(lerp(pts[0][0], pts[1][0], q), lerp(pts[0][1], pts[1][1], q))
    else:
        ctx.line_to(*pts[1]); q = (L - l1) / l2
        ctx.line_to(lerp(pts[1][0], pts[2][0], q), lerp(pts[1][1], pts[2][1], q))
    ctx.restore()
    ctx.set_source_rgba(*col); ctx.set_line_width(lw); ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    ctx.set_line_join(cairo.LINE_JOIN_ROUND); ctx.stroke()


def speed_lines(ctx, t, col, n=26, alpha=0.5, seed=3, direction=1):
    r = np.random.default_rng(seed)
    ys = r.uniform(0, H, n); ln = r.uniform(200, 700, n); sp = r.uniform(2500, 5000, n); ph = r.uniform(0, 3000, n)
    ww = r.uniform(2, 7, n)
    for i in range(n):
        x = ((ph[i] + sp[i] * t) % (W + 1400)) - 700
        if direction < 0: x = W - x
        ctx.rectangle(x, ys[i], ln[i] * direction, ww[i])
        ctx.set_source_rgba(*hexc(col, alpha * (0.4 + 0.6 * (i % 3) / 2))); ctx.fill()


def fit_size(segs, path, size, maxw):
    w = text_width(segs, path, size)
    return int(size * min(1.0, maxw / w))


