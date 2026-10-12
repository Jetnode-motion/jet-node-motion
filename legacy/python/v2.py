import os, sys
sys.argv = sys.argv[:1] + sys.argv[1:]
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'v2_base.py')).read())
import multiprocessing as mp

TSS = 2.2  # text supersampling (camera zooms up to ~2.2x)

# ---- fonts: SF Pro Display if supplied in WORK/fonts, otherwise Inter Display ----
def pick(sf_name, inter_name):
    p = os.path.join(WORK, 'fonts', sf_name)
    return p if os.path.exists(p) else FD + inter_name
M_REG = pick('SF-Pro-Display-Regular.otf', 'InterDisplay-Regular.otf')
M_MED = pick('SF-Pro-Display-Medium.otf', 'InterDisplay-Medium.otf')
M_SEMI = pick('SF-Pro-Display-Semibold.otf', 'InterDisplay-SemiBold.otf')
M_BOLD = pick('SF-Pro-Display-Bold.otf', 'InterDisplay-Bold.otf')
ACC = F_SCRIPT
INK = '#1D1D1F'   # Apple-like near-black for UI text
GRAY = '#8A8A8E'
TGBLUE = '#5B8DEF'
SUBS_ON = True

SUBFRAMES = 5
FOCUS_Y = 1150

# ---------------- world layout ----------------
PCX, PCY, PW, PH = 540, 1180, 640, 1320
SW, SH = PW - 36, PH - 36
SX0, SY0 = PCX - SW / 2, PCY - SH / 2

def s2w(x, y): return SX0 + x, SY0 + y

T_TAP1, T_TAP2, T_TAP3, T_TAP4 = 4.40, 6.45, 9.05, 13.70
B1 = (24, 440, 470, 72)
B2 = (24, 700, 470, 84)

CAM_KEYS = [
    (0.00, 2.25, 540, 690), (0.95, 2.0, 540, 740), (1.55, 1.0, 540, 1180),
    (2.90, 1.0, 540, 1180), (3.40, 1.6, 480, 1040), (4.85, 1.6, 480, 1120),
    (5.30, 1.9, 480, 1320), (6.50, 1.9, 480, 1320), (6.95, 1.0, 540, 1180),
    (7.55, 1.0, 540, 1180), (7.90, 1.8, 540, 790), (8.50, 1.8, 540, 790),
    (8.85, 1.4, 540, 1180), (9.55, 1.4, 540, 1180), (9.95, 1.0, 540, 1180), (10.25, 1.32, 540, 1120),
    (11.80, 1.36, 540, 1100), (12.0, 1.0, 540, 1150), (15.1, 1.0, 540, 1150)]

def eq5(x): return 16 * x ** 5 if x < .5 else 1 - (-2 * x + 2) ** 5 / 2

def camera(t):
    for i in range(len(CAM_KEYS) - 1):
        a, b = CAM_KEYS[i], CAM_KEYS[i + 1]
        if a[0] <= t < b[0]:
            k = eq5(prog(t, a[0], b[0]))
            s = math.exp(lerp(math.log(a[1]), math.log(b[1]), k))
            cx = lerp(a[2], b[2], k); cy = lerp(a[3], b[3], k)
            break
    else:
        s, cx, cy = CAM_KEYS[-1][1:]
    # hook shake
    sh = 9 * (1 - prog(t, 0, 0.5)) ** 2
    if sh > 0.3:
        cx += sh * math.sin(t * 91); cy += sh * math.cos(t * 77)
    # gentle float
    cy += 6 * math.sin(t * 1.3)
    return s, cx, cy

def w2s(cam, x, y):
    s, cx, cy = cam
    return (x - cx) * s + W / 2, (y - cy) * s + FOCUS_Y


# ---------------- small UI helpers ----------------
def status_bar(ctx, dark=False):
    c = WHITE if dark else INK
    draw_text(ctx, [('9:41', c)], M_SEMI, 26, 56, 40, anchor='l')
    ctx.set_source_rgba(*hexc(c))
    for i in range(4):
        h = 8 + i * 5; ctx.rectangle(470 + i * 10, 50 - h, 6, h)
    ctx.fill()
    rrect(ctx, 520, 30, 44, 22, 6); ctx.set_line_width(2); ctx.stroke()
    rrect(ctx, 524, 34, 32, 14, 3); ctx.fill()


def wrow_text(ctx, segs, font_, size, x, y, alpha=1.0, anchor='l'):
    draw_text(ctx, segs, font_, size, x, y, alpha=alpha, anchor=anchor)


def pop(t, t0, d=0.28):
    return eback(prog(t, t0, t0 + d), 1.5) if t >= t0 else 0.0


def check_mark(ctx, x, y, s, p, col, lw=6):
    check(ctx, x, y, s, p, col, lw)


def xmark(ctx, x, y, s, p, col, lw=6):
    if p <= 0: return
    ctx.set_line_width(lw); ctx.set_line_cap(cairo.LINE_CAP_ROUND); ctx.set_source_rgba(*col)
    q1 = clamp(p * 2); q2 = clamp(p * 2 - 1)
    ctx.move_to(x - s, y - s); ctx.line_to(x - s + 2 * s * q1, y - s + 2 * s * q1); ctx.stroke()
    if q2 > 0:
        ctx.move_to(x + s, y - s); ctx.line_to(x + s - 2 * s * q2, y - s + 2 * s * q2); ctx.stroke()


# ---------------- plate (style of Nazar's AE banner) ----------------
def plate(ctx, x, y, w, h, r, c0=PERI, c1='#8FC9F6', glow=(255, 255, 255), glow_a=0.30, shadow=0.22,
          edge=0.95, corner=0.30, inner=1.0):
    if shadow > 0:
        draw_sprite(ctx, shadow_sprite(int(w), int(h), r, 18, shadow, (20, 25, 60)), x + w / 2, y + h / 2 + h * 0.18)
    if glow_a > 0:
        draw_sprite(ctx, shadow_sprite(int(w), int(h), r, 14, glow_a, glow), x + w / 2, y + h / 2)
    rrect(ctx, x, y, w, h, r)
    g = cairo.LinearGradient(x, y, x + w, y + h * 0.3)
    g.add_color_stop_rgba(0, *hexc(c0)); g.add_color_stop_rgba(1, *hexc(c1))
    ctx.set_source(g); ctx.fill()
    ctx.save(); rrect(ctx, x, y, w, h, r); ctx.clip()
    # light corner
    rg = cairo.RadialGradient(x, y, 0, x, y, max(w, h) * 0.55)
    rg.add_color_stop_rgba(0, 1, 1, 1, corner); rg.add_color_stop_rgba(1, 1, 1, 1, 0)
    ctx.set_source(rg); ctx.paint()
    # inner glow
    for lw, a in ((22, 0.07), (10, 0.10)):
        rrect(ctx, x, y, w, h, r); ctx.set_line_width(lw); ctx.set_source_rgba(1, 1, 1, a * inner); ctx.stroke()
    ctx.restore()
    # gradient edge stroke: bright top-left -> faint bottom-right
    eg = cairo.LinearGradient(x, y, x + w * 0.7, y + h)
    eg.add_color_stop_rgba(0, 1, 1, 1, edge); eg.add_color_stop_rgba(1, 1, 1, 1, edge * 0.18)
    rrect(ctx, x + 1.2, y + 1.2, w - 2.4, h - 2.4, r - 1); ctx.set_line_width(2.4); ctx.set_source(eg); ctx.stroke()


_gl = {}
def glow_sprite(wd, f, fs, col, blur=10, a=0.45):
    k = (wd, f, fs, col, blur, a)
    if k in _gl: return _gl[k]
    sp = text_sprite([(wd, col)], f, fs)
    al = sp.buf[:, :sp.w, 3].astype(np.float32)
    al = cv2.GaussianBlur(al, (0, 0), blur * TSS) * a
    rgba = np.zeros((sp.h, sp.w, 4), np.uint8)
    c = hexc(col)
    rgba[:, :, 0], rgba[:, :, 1], rgba[:, :, 2] = int(c[0] * 255), int(c[1] * 255), int(c[2] * 255)
    rgba[:, :, 3] = np.clip(al, 0, 255).astype(np.uint8)
    g = Sprite(rgba, ox=sp.ox, oy=sp.oy); g.tw = sp.tw
    _gl[k] = g
    return g


# ---------------- screens (screen-local coords, 604 x 1284) ----------------
def scr_whitelist(ctx, t):
    ctx.set_source_rgba(*hexc('#F2F2F7')); ctx.paint()
    status_bar(ctx)
    # banner
    k = pop(t, -0.05, 0.3)
    ctx.save(); ctx.translate(302, 165); ctx.scale(k, k)
    rrect(ctx, -278, -82, 556, 164, 34); ctx.set_source_rgba(*hexc('#FFE5E0')); ctx.fill()
    # lock
    ctx.set_source_rgba(*hexc(CORAL)); ctx.set_line_width(7)
    ctx.arc(-206, -18, 18, pi, 2 * pi); ctx.stroke()
    rrect(ctx, -232, -18, 52, 42, 10); ctx.fill()
    draw_text(ctx, [('Доступ ограничен', '#C8381B')], M_SEMI, 34, -150, -22, anchor='l')
    draw_text(ctx, [('Сайта нет в белом списке', INK)], M_REG, 24, -150, 24, anchor='l', alpha=0.6)
    ctx.restore()
    allowed = {0, 3}
    widths = [300, 240, 330, 210, 280, 350, 260, 300]
    for i in range(8):
        y = 280 + i * 100
        ap = eo3(prog(t, -0.1 + i * 0.03, 0.2 + i * 0.03))
        bad = i not in allowed
        xp = prog(t, 0.18 + i * 0.09, 0.32 + i * 0.09)
        dim = 1 - 0.5 * xp if bad else 1
        ctx.save(); ctx.translate(0, 20 * (1 - ap))
        rrect(ctx, 24, y, 556, 84, 22); ctx.set_source_rgba(1, 1, 1, ap); ctx.fill()
        ctx.arc(76, y + 42, 22, 0, 2 * pi)
        ctx.set_source_rgba(*hexc(['#6173F4', '#F3A43E', '#43B581', '#E05D8B', '#4AA3DF', '#9B6CF0', '#E07A3E', '#3EC1B5'][i], ap * dim)); ctx.fill()
        rrect(ctx, 116, y + 26, widths[i], 14, 7); ctx.set_source_rgba(*hexc(INK, 0.75 * ap * dim)); ctx.fill()
        rrect(ctx, 116, y + 50, widths[i] * 0.55, 10, 5); ctx.set_source_rgba(*hexc(GRAY, 0.5 * ap * dim)); ctx.fill()
        if bad:
            if xp > 0:
                ctx.move_to(110, y + 40); ctx.line_to(110 + (widths[i] + 16) * eo3(xp), y + 40)
                ctx.set_source_rgba(*hexc(CORAL, 0.8)); ctx.set_line_width(4); ctx.stroke()
            xmark(ctx, 540, y + 42, 13, xp, hexc(CORAL), 6)
        else:
            check_mark(ctx, 540, y + 42, 30, prog(t, 0.1, 0.35), hexc('#2BB673'), 6)
        ctx.restore()


def bubble(ctx, x, y, w, h, col, k, origin='l', tail=True):
    if k <= 0: return False
    ox = x if origin == 'l' else x + w
    ctx.save(); ctx.translate(ox, y + h); ctx.scale(k, k); ctx.translate(-ox, -(y + h))
    draw_sprite(ctx, shadow_sprite(int(w), int(h), 26, 10, 0.10, (40, 60, 90)), x + w / 2, y + h / 2 + 4)
    rrect(ctx, x, y, w, h, 26); ctx.set_source_rgba(*hexc(col)); ctx.fill()
    return True


def tg_button(ctx, rect, label, k, t_tap, solid=False, glow=0.0):
    x, y, w, h = rect
    if k <= 0: return
    press = 1 - abs(prog(ctx_time[0], t_tap - 0.08, t_tap + 0.08) * 2 - 1) if abs(ctx_time[0] - t_tap) < 0.08 else 0
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); s = k * (1 - 0.06 * press); ctx.scale(s, s)
    rrect(ctx, -w / 2, -h / 2, w, h, 20)
    flash = clamp(1 - (ctx_time[0] - t_tap) / 0.3) if ctx_time[0] >= t_tap else 0
    if solid:
        ctx.new_path()
        plate(ctx, -w / 2, -h / 2, w, h, 20, glow=(97, 115, 244), glow_a=0.35 + 0.3 * glow, shadow=0.18, corner=0.35)
        rrect(ctx, -w / 2, -h / 2, w, h, 20); ctx.set_source_rgba(1, 1, 1, 0.25 * flash); ctx.fill()
        draw_text(ctx, [(label, WHITE)], M_SEMI, 28, 0, 0)
    else:
        ctx.set_source_rgba(*hexc('#7E9CC4', 0.55)); ctx.fill_preserve()
        ctx.set_source_rgba(1, 1, 1, 0.35 * flash); ctx.fill()
        draw_text(ctx, [(label, WHITE)], M_MED, 28, 0, 0)
    ctx.restore()

ctx_time = [0.0]


def scr_chat(ctx, t):
    g = cairo.LinearGradient(0, 0, SW, SH)
    g.add_color_stop_rgba(0, *hexc('#C9DCEC')); g.add_color_stop_rgba(1, *hexc('#DCE8D2'))
    ctx.set_source(g); ctx.paint()
    # faint doodle dots
    ctx.set_source_rgba(1, 1, 1, 0.35)
    for yy in range(180, SH, 70):
        for xx in range(20 + (yy // 70 % 2) * 35, SW, 70):
            ctx.arc(xx, yy, 3, 0, 2 * pi); ctx.fill()
    # header
    ctx.rectangle(0, 0, SW, 150); ctx.set_source_rgba(1, 1, 1, 0.96); ctx.fill()
    status_bar(ctx)
    ctx.set_source_rgba(*hexc(TGBLUE)); ctx.set_line_width(5); ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    ctx.move_to(46, 92); ctx.line_to(32, 108); ctx.line_to(46, 124); ctx.stroke()
    ctx.arc(110, 108, 32, 0, 2 * pi)
    gg = cairo.LinearGradient(78, 76, 142, 140); gg.add_color_stop_rgba(0, *hexc('#0A1E4A')); gg.add_color_stop_rgba(1, *hexc('#3D7EDB'))
    ctx.set_source(gg); ctx.fill()
    draw_plane(ctx, 110, 108, 44)
    draw_text(ctx, [('JetnodeVPN', INK)], M_SEMI, 28, 158, 94, anchor='l')
    draw_text(ctx, [('бот', GRAY)], M_REG, 22, 158, 126, anchor='l')
    # messages
    k1 = pop(t, 2.55)
    if bubble(ctx, 430, 190, 150, 66, '#E1F7CB', k1, 'r'):
        draw_text(ctx, [('/start', INK)], M_MED, 26, 505, 223); ctx.restore()
    k2 = pop(t, 2.95)
    if bubble(ctx, 24, 280, 470, 150, '#FFFFFF', k2):
        draw_text(ctx, [('Привет! Это JetnodeVPN', INK)], M_SEMI, 27, 50, 326, anchor='l')
        draw_text(ctx, [('Дарим ', INK), ('3 дня бесплатно', PERI)], M_REG, 27, 50, 372, anchor='l')
        draw_text(ctx, [('12:01', GRAY)], M_REG, 18, 440, 408, anchor='l')
        ctx.restore()
    tg_button(ctx, B1, 'Попробовать бесплатно', pop(t, 3.2), T_TAP1)
    k3 = pop(t, 4.75)
    if bubble(ctx, 24, 540, 470, 150, '#FFFFFF', k3):
        draw_text(ctx, [('Подписка активна', INK)], M_SEMI, 27, 50, 586, anchor='l')
        check_mark(ctx, 330, 586, 26, prog(t, 4.9, 5.2), hexc('#2BB673'), 5)
        draw_text(ctx, [('Осталось: 3 дня', INK)], M_REG, 27, 50, 632, anchor='l', alpha=0.7)
        draw_text(ctx, [('12:01', GRAY)], M_REG, 18, 440, 668, anchor='l')
        ctx.restore()
    glow = (0.6 + 0.4 * math.sin(t * 9)) * prog(t, 5.2, 5.5) * (1 - prog(t, T_TAP2, T_TAP2 + 0.1))
    tg_button(ctx, B2, 'Подключиться в 1 клик', pop(t, 4.95), T_TAP2, solid=True, glow=glow)
    # input bar
    ctx.rectangle(0, SH - 110, SW, 110); ctx.set_source_rgba(1, 1, 1, 0.96); ctx.fill()
    rrect(ctx, 24, SH - 90, 470, 60, 30); ctx.set_source_rgba(*hexc('#F2F2F7')); ctx.fill()
    draw_text(ctx, [('Сообщение', GRAY)], M_REG, 24, 52, SH - 60, anchor='l')
    ctx.arc(540, SH - 60, 30, 0, 2 * pi); ctx.set_source_rgba(*hexc(TGBLUE)); ctx.fill()


def scr_app(ctx, t):
    g = cairo.LinearGradient(0, 0, 0, SH)
    g.add_color_stop_rgba(0, *hexc('#081A42')); g.add_color_stop_rgba(1, *hexc('#1D55B5'))
    ctx.set_source(g); ctx.paint()
    status_bar(ctx, dark=True)
    # splash plane -> header
    sp = eback(prog(t, 6.85, 7.2), 1.4); mv = eio(prog(t, 7.25, 7.6))
    px = lerp(302, 70, mv); py = lerp(560, 110, mv); pw = lerp(240, 52, mv) * sp
    ui = eo3(prog(t, 7.35, 7.7))
    draw_text(ctx, [('Jetnode', WHITE), ('VPN', MINT)], M_SEMI, 32, 110, 110, anchor='l', alpha=ui)
    con = eo3(prog(t, T_TAP3 + 0.05, T_TAP3 + 0.35))
    by = 640
    if ui > 0:
        ctx.save(); ctx.translate(302, by); ctx.scale(lerp(0.85, 1, ui), lerp(0.85, 1, ui))
        for i in range(3):
            if con > 0:
                q = ((t - T_TAP3) * 0.8 + i / 3) % 1
                ctx.arc(0, 0, 160 + 140 * q, 0, 2 * pi)
                ctx.set_source_rgba(*hexc(MINT, 0.35 * (1 - q) * con)); ctx.set_line_width(3); ctx.stroke()
        if con > 0:
            rg = cairo.RadialGradient(0, 0, 100, 0, 0, 300); c = hexc(MINT)
            rg.add_color_stop_rgba(0, c[0], c[1], c[2], 0.45 * con); rg.add_color_stop_rgba(1, c[0], c[1], c[2], 0)
            ctx.set_source(rg); ctx.arc(0, 0, 300, 0, 2 * pi); ctx.fill()
        ctx.arc(0, 0, 180, 0, 2 * pi); ctx.set_source_rgba(1, 1, 1, 0.10 * ui); ctx.set_line_width(5); ctx.stroke()
        press = 1 - abs(prog(t, T_TAP3 - 0.08, T_TAP3 + 0.08) * 2 - 1) if abs(t - T_TAP3) < 0.08 else 0
        ctx.arc(0, 0, 140 * (1 - 0.06 * press), 0, 2 * pi)
        off = hexc('#FFFFFF', 0.12); on = hexc(MINT)
        ctx.set_source_rgba(*[lerp(off[i], on[i], con) * (ui if i == 3 else 1) for i in range(4)]); ctx.fill()
        ctx.save(); ctx.arc(0, 0, 140, 0, 2 * pi); ctx.clip()
        rg = cairo.RadialGradient(-70, -70, 0, -70, -70, 200)
        rg.add_color_stop_rgba(0, 1, 1, 1, 0.35 * ui); rg.add_color_stop_rgba(1, 1, 1, 1, 0)
        ctx.set_source(rg); ctx.paint(); ctx.restore()
        ctx.arc(0, 0, 138, 0, 2 * pi); ctx.set_source_rgba(1, 1, 1, 0.5 * ui); ctx.set_line_width(2.5); ctx.stroke()
        power_icon(ctx, 0, 0, 52, [lerp(1, hexc(NAVY)[i], con) for i in range(3)] + [ui])
        ctx.restore()
        draw_text(ctx, [('Не подключено', WHITE)], M_MED, 34, 302, by + 250, alpha=0.6 * ui * (1 - con))
        draw_text(ctx, [('Подключено', MINT)], M_SEMI, 34, 302, by + 250, alpha=con)
        if con > 0:
            secs = int(max(0, t - T_TAP3) * 1)
            draw_text(ctx, [(f'00:00:{secs:02d}', WHITE)], M_REG, 26, 302, by + 300, alpha=0.6 * con)
        rrect(ctx, 60, SH - 210, 484, 100, 50); ctx.set_source_rgba(1, 1, 1, 0.10 * ui); ctx.fill()
        ctx.arc(116, SH - 160, 24, 0, 2 * pi); ctx.set_source_rgba(*hexc(MINT, ui)); ctx.fill()
        draw_text(ctx, [('Лучший сервер', WHITE)], M_MED, 28, 156, SH - 160, anchor='l', alpha=ui)
        draw_text(ctx, [('авто', MINT)], M_REG, 24, 500, SH - 160, anchor='c', alpha=ui)
    draw_plane(ctx, px, py, pw)
    # toast
    tk = eback(prog(t, 7.65, 8.0), 1.3) * (1 - eio(prog(t, 9.4, 9.7)))
    if tk > 0.001:
        ty = lerp(-160, 190, tk)
        plate(ctx, 24, ty, 556, 130, 30, c0='#FFFFFF', c1='#E9F0FF', glow=(255, 255, 255), glow_a=0.28,
              shadow=0.35, edge=1.0, corner=0.0, inner=0.0)
        ctx.arc(92, ty + 65, 34, 0, 2 * pi); ctx.set_source_rgba(*hexc(MINT)); ctx.fill()
        check_mark(ctx, 92, ty + 65, 36, prog(t, 7.8, 8.1), hexc(NAVY), 6)
        draw_text(ctx, [('Подписка добавлена', INK)], M_SEMI, 28, 146, ty + 46, anchor='l')
        draw_text(ctx, [('JetnodeVPN · пробный период 3 дня', GRAY)], M_REG, 22, 146, ty + 88, anchor='l')


SERVERS = [('NL', 'Нидерланды', '#FF7A45', 18), ('DE', 'Германия', '#F3C43E', 24), ('FI', 'Финляндия', '#4AA3DF', 31),
           ('SE', 'Швеция', '#3E7BE0', 35), ('PL', 'Польша', '#E05D6F', 29), ('TR', 'Турция', '#E0453E', 47),
           ('US', 'США', '#6173F4', 96), ('JP', 'Япония', '#E05D8B', 140)]
CATS = ['Все', 'Стриминг', 'Игры', 'Обход']
CAT_T = [9.75, 10.25, 10.65, 11.05]
CAT_ORDER = [[0, 1, 2, 3, 4, 5, 6, 7], [6, 0, 1, 3, 7, 2, 4, 5], [1, 0, 4, 2, 5, 3, 6, 7], [0, 2, 3, 1, 5, 4, 6, 7]]
CAT_TAG = ['', 'Стриминг 4K', 'Низкий пинг', 'Обход белых списков']


def scr_servers(ctx, t):
    ctx.set_source_rgba(*hexc('#F2F2F7')); ctx.paint()
    status_bar(ctx)
    draw_text(ctx, [('Серверы', INK)], M_BOLD, 44, 36, 130, anchor='l')
    ci = max(i for i in range(4) if t >= CAT_T[i])
    # segmented control
    rrect(ctx, 24, 190, 556, 64, 18); ctx.set_source_rgba(*hexc('#E3E3E8')); ctx.fill()
    segw = 556 / 4
    prev = max(0, ci - 1)
    hx = lerp(24 + prev * segw, 24 + ci * segw, eo3(prog(t, CAT_T[ci], CAT_T[ci] + 0.22)))
    rrect(ctx, hx + 4, 194, segw - 8, 56, 15); ctx.set_source_rgba(1, 1, 1, 1); ctx.fill()
    for i, c in enumerate(CATS):
        draw_text(ctx, [(c, INK)], M_MED if i == ci else M_REG, 23, 24 + segw * (i + 0.5), 222)
    order = CAT_ORDER[ci]
    for j, si in enumerate(order[:8]):
        code, name, col, ping = SERVERS[si]
        y = 290 + j * 112
        a = eo3(prog(t, CAT_T[ci] + 0.03 * j, CAT_T[ci] + 0.03 * j + 0.3))
        ctx.save(); ctx.translate(0, 26 * (1 - a))
        rrect(ctx, 24, y, 556, 96, 22); ctx.set_source_rgba(1, 1, 1, a); ctx.fill()
        ctx.arc(80, y + 48, 26, 0, 2 * pi); ctx.set_source_rgba(*hexc(col, a)); ctx.fill()
        draw_text(ctx, [(code, WHITE)], M_SEMI, 20, 80, y + 48, alpha=a)
        tag = CAT_TAG[ci]
        if tag:
            draw_text(ctx, [(name, INK)], M_MED, 27, 124, y + 34, anchor='l', alpha=a)
            draw_text(ctx, [(tag, GRAY)], M_REG, 20, 124, y + 66, anchor='l', alpha=a)
        else:
            draw_text(ctx, [(name, INK)], M_MED, 27, 124, y + 48, anchor='l', alpha=a)
        for b in range(4):
            on = b < (4 if ping < 30 else 3 if ping < 60 else 2)
            ctx.rectangle(480 + b * 11, y + 60 - 8 - b * 7, 7, 8 + b * 7)
            ctx.set_source_rgba(*hexc('#2BB673' if on else '#D1D1D6', a)); ctx.fill()
        draw_text(ctx, [(f'{ping} мс', GRAY)], M_REG, 20, 470, y + 48, anchor='l', alpha=0) if False else None
        if j == 0:
            sel = prog(t, CAT_T[ci] + 0.2, CAT_T[ci] + 0.4)
            rrect(ctx, 24, y, 556, 96, 22); ctx.set_source_rgba(*hexc(PERI, sel)); ctx.set_line_width(4); ctx.stroke()
        ctx.restore()


def draw_screen(ctx, t):
    # base layer by time
    if t < 2.45:
        px = plane_x(t) - SX0
        if t >= 1.8:
            ctx.save(); ctx.rectangle(-10, -10, px + 10, SH + 20); ctx.clip(); scr_chat(ctx, t); ctx.restore()
            ctx.save(); ctx.rectangle(px, -10, SW + 20, SH + 20); ctx.clip(); scr_whitelist(ctx, t); ctx.restore()
        else:
            scr_whitelist(ctx, t)
    elif t < 6.9:
        scr_chat(ctx, t)
        k = eq5(prog(t, 6.52, 6.92))
        if t >= 6.52:
            x, y, w, h = B2
            rx = lerp(x, 0, k); ry = lerp(y, 0, k); rw = lerp(w, SW, k); rh = lerp(h, SH, k)
            rrect(ctx, rx, ry, rw, rh, lerp(20, 80, k))
            c0 = hexc(PERI); c1 = hexc('#0E2A66')
            ctx.set_source_rgba(*[lerp(c0[i], c1[i], k) for i in range(4)]); ctx.fill()
    elif t < 9.75:
        scr_app(ctx, t)
    else:
        k = eq5(prog(t, 9.75, 10.08))
        if k < 1:
            ctx.save(); ctx.translate(-SW * 0.35 * k, 0); scr_app(ctx, t); ctx.restore()
        ctx.save(); ctx.translate(SW * (1 - k), 0)
        draw_sprite(ctx, shadow_sprite(SW, SH, 10, 30, 0.35, (0, 0, 0)), SW / 2 - 10, SH / 2)
        ctx.rectangle(0, 0, SW, SH); ctx.clip()
        scr_servers(ctx, t); ctx.restore()


def plane_x(t):
    return lerp(-420, 1500, eio(prog(t, 1.72, 2.42)))


def draw_phone(ctx, t):
    drop = prog(t, 11.78, 12.12) ** 2 * 1900
    if drop > 1800: return
    ctx.save(); ctx.translate(0, drop)
    ctx.translate(PCX, PCY); ctx.rotate(0.012 * math.sin(t * 1.1)); ctx.translate(-PCX, -PCY)
    draw_sprite(ctx, shadow_sprite(PW, PH, 96, 70, 0.22, (97, 115, 244)), PCX, PCY)
    draw_sprite(ctx, shadow_sprite(PW, PH, 96, 46, 0.30), PCX, PCY + 46)
    rrect(ctx, PCX - PW / 2, PCY - PH / 2, PW, PH, 96)
    g = cairo.LinearGradient(PCX - PW / 2, 0, PCX + PW / 2, 0)
    g.add_color_stop_rgba(0, *hexc('#2B2830')); g.add_color_stop_rgba(0.5, *hexc('#121015')); g.add_color_stop_rgba(1, *hexc('#2B2830'))
    ctx.set_source(g); ctx.fill()
    eg = cairo.LinearGradient(PCX - PW / 2, PCY - PH / 2, PCX + PW / 2, PCY + PH / 2)
    eg.add_color_stop_rgba(0, 1, 1, 1, 0.55); eg.add_color_stop_rgba(0.5, 1, 1, 1, 0.08); eg.add_color_stop_rgba(1, 1, 1, 1, 0.25)
    rrect(ctx, PCX - PW / 2 + 2, PCY - PH / 2 + 2, PW - 4, PH - 4, 94); ctx.set_line_width(3); ctx.set_source(eg); ctx.stroke()
    ctx.save(); ctx.translate(SX0, SY0)
    rrect(ctx, 0, 0, SW, SH, 80); ctx.clip()
    draw_screen(ctx, t)
    # dynamic island
    rrect(ctx, SW / 2 - 64, 18, 128, 38, 19); ctx.set_source_rgba(0, 0, 0, 1); ctx.fill()
    # glass reflection
    gr = cairo.LinearGradient(0, 0, SW, SH * 0.6)
    gr.add_color_stop_rgba(0, 1, 1, 1, 0.07); gr.add_color_stop_rgba(0.5, 1, 1, 1, 0.0)
    ctx.set_source(gr); ctx.paint()
    rrect(ctx, 0, 0, SW, SH, 80); ctx.set_line_width(14); ctx.set_source_rgba(1, 1, 1, 0.06); ctx.stroke()
    ctx.restore()
    ctx.restore()


# ---------------- callout (world) ----------------
def callout(ctx, t):
    a = eo3(prog(t, 5.35, 5.6)) * (1 - prog(t, 6.45, 6.6))
    if a <= 0: return
    # arrow drawn progressively from pill to button
    p = eo3(prog(t, 5.45, 5.85))
    x0, y0 = 600, 1418; x1, y1 = 640, 1338
    ctx.save(); ctx.set_line_width(5); ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    pts = []
    for i in range(31):
        s = i / 30 * p
        bx = (1 - s) ** 2 * x0 + 2 * (1 - s) * s * 700 + s * s * x1
        byy = (1 - s) ** 2 * y0 + 2 * (1 - s) * s * 1400 + s * s * y1
        pts.append((bx, byy))
    ctx.move_to(*pts[0])
    for q in pts[1:]: ctx.line_to(*q)
    ctx.set_source_rgba(*hexc(CORAL, a)); ctx.stroke()
    if p > 0.95:
        (ax, ay), (bx2, by2) = pts[-2], pts[-1]
        ang = math.atan2(by2 - ay, bx2 - ax)
        for d in (2.5, -2.5):
            ctx.move_to(bx2, by2); ctx.line_to(bx2 + 18 * math.cos(ang + d), by2 + 18 * math.sin(ang + d))
        ctx.stroke()
    ctx.restore()
    k = eback(prog(t, 5.35, 5.65), 1.4)
    ctx.save(); ctx.translate(470, 1450); ctx.scale(k, k)
    w = text_width([('Диплинк: подписка добавится сама', WHITE)], M_MED, 21) + 44
    ctx.push_group()
    plate(ctx, -w / 2, -26, w, 52, 26, c0='#1D1D1F', c1='#3A3A48', glow=(97, 115, 244), glow_a=0.25, shadow=0.2,
          edge=0.7, corner=0.15, inner=0.6)
    ctx.pop_group_to_source(); ctx.paint_with_alpha(a)
    draw_text(ctx, [('Диплинк: ', MINT), ('подписка добавится сама', WHITE)], M_MED, 21, 0, 0, alpha=a)
    ctx.restore()


def plane_wipe(ctx, t):
    if not (1.72 <= t <= 2.42): return
    x = plane_x(t)
    y = lerp(1330, 1030, prog(t, 1.72, 2.42))
    # trail
    g = cairo.LinearGradient(x - 700, 0, x, 0)
    g.add_color_stop_rgba(0, 1, 1, 1, 0); g.add_color_stop_rgba(1, 1, 1, 1, 0.55)
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.16); ctx.translate(-x, -y)
    rrect(ctx, x - 700, y - 30, 700, 60, 30); ctx.set_source(g); ctx.fill(); ctx.restore()
    draw_plane(ctx, x, y, 470, rot=pi / 4 - 0.16 + pi / 4 - pi / 4)


# ---------------- end card (screen space) ----------------
def end_card(ctx, t):
    u = t - 12.0
    if u < 0: return
    ip = eback(prog(u, 0.05, 0.5), 1.4)
    S = 300
    if ip > 0.001:
        ctx.save(); ctx.translate(540, 720); ctx.scale(ip, ip)
        draw_sprite(ctx, shadow_sprite(S, S, 72, 36, 0.28, (20, 40, 110)), 0, 30)
        rrect(ctx, -S / 2, -S / 2, S, S, 72)
        g = cairo.LinearGradient(-S / 2, -S / 2, S / 2, S / 2)
        g.add_color_stop_rgba(0, *hexc('#0A1E4A')); g.add_color_stop_rgba(0.6, *hexc('#123C8C')); g.add_color_stop_rgba(1, *hexc('#3D7EDB'))
        ctx.set_source(g); ctx.fill()
        eg = cairo.LinearGradient(-S / 2, -S / 2, S * 0.2, S / 2)
        eg.add_color_stop_rgba(0, 1, 1, 1, 0.9); eg.add_color_stop_rgba(1, 1, 1, 1, 0.1)
        rrect(ctx, -S / 2 + 1.5, -S / 2 + 1.5, S - 3, S - 3, 71); ctx.set_line_width(3); ctx.set_source(eg); ctx.stroke()
        draw_plane(ctx, 0, 0, S * 0.74, glint=prog(u, 0.6, 1.3))
        ctx.restore()
    a = eo3(prog(u, 0.25, 0.6))
    draw_text(ctx, [('JetnodeVPN', INK)], M_SEMI, 92, 540, 980 + 30 * (1 - a), alpha=a)
    b = eo3(prog(u, 0.4, 0.75))
    draw_text(ctx, [('Попробуй 3 дня', INK)], M_REG, 54, 540, 1085 + 20 * (1 - b), alpha=0.75 * b)
    c = eback(prog(u, 0.55, 0.9), 1.6)
    if c > 0.001:
        g = glow_sprite('бесплатно', ACC, 130, PERI, 12, 0.5)
        ctx.save(); ctx.translate(540, 1200 + 130 * 0.36); ctx.scale(c / TSS, c / TSS)
        ctx.set_source_surface(g.surf, -g.ox, -g.oy); ctx.paint(); ctx.restore()
        draw_text(ctx, [('бесплатно', PERI)], ACC, 130, 540, 1200, scale=c)
    d = eback(prog(u, 0.8, 1.15))
    press = 1 - abs(prog(t, T_TAP4 - 0.08, T_TAP4 + 0.08) * 2 - 1) if abs(t - T_TAP4) < 0.08 else 0
    if d > 0.001:
        bw, bh = 520, 128
        ctx.save(); ctx.translate(540, 1420); s = d * (1 - 0.05 * press); ctx.scale(s, s)
        plate(ctx, -bw / 2, -bh / 2, bw, bh, 40, glow=(97, 115, 244), glow_a=0.45, shadow=0.25, corner=0.35)
        fl = clamp(1 - (t - T_TAP4) / 0.3) if t >= T_TAP4 else 0
        rrect(ctx, -bw / 2, -bh / 2, bw, bh, 40); ctx.set_source_rgba(1, 1, 1, 0.18 * fl); ctx.fill()
        draw_text(ctx, [('Открыть бота', WHITE)], M_SEMI, 48, 30, 0)
        draw_plane(ctx, -165, 0, 56)
        ctx.restore()


# ---------------- subtitles (screen space) ----------------
PHRASES = [
    (-0.12, 1.75, 'Интернет по *белым спискам?*', 76),
    (1.85, 3.15, 'Обходим их в *1 клик*', 66),
    (3.20, 5.35, 'Открой бота и получи 3 дня *бесплатно*', 62),
    (5.40, 8.05, 'Жми «Подключиться» — приложение откроется *само*', 60),
    (8.12, 9.72, 'Подписка уже *внутри*', 66),
    (9.80, 11.95, 'Быстрые серверы на *любой вкус*', 64),
    (12.00, 15.20, 'Ссылка на бота в *профиле*', 58),
]


def tokens(txt):
    out = []
    for i, part in enumerate(txt.split('*')):
        if i % 2 == 1:
            out.append((part.strip(), True))
        else:
            for wd in part.split():
                out.append((wd, False))
    return out


_lay = {}
def layout(txt, size):
    k = (txt, size)
    if k in _lay: return _lay[k]
    toks = tokens(txt)
    items = []
    for wd, acc in toks:
        f = ACC if acc else M_SEMI
        fs = int(size * 1.42) if acc else size
        col = PERI if acc else INK
        w = text_width([(wd, col)], f, fs)
        items.append((wd, acc, f, fs, col, w))
    sp = size * 0.27
    lines = [[]]; lw = [0]
    for it in items:
        add = it[5] + ((sp + (14 if it[1] else 0)) if lines[-1] else 0)
        if lines[-1] and lw[-1] + add > 930:
            lines.append([]); lw.append(0); add = it[5]
        lines[-1].append(it); lw[-1] += add
    _lay[k] = (lines, lw, sp)
    return _lay[k]


def draw_word(ctx, wd, f, fs, col, x, base, alpha, scale=1.0, glow=False):
    sp = text_sprite([(wd, col)], f, fs)
    if glow:
        g = glow_sprite(wd, f, fs, col, 9, 0.45)
        ctx.save(); ctx.translate(x + sp.tw / 2, base); ctx.scale(scale / TSS, scale / TSS)
        ctx.set_source_surface(g.surf, -g.ox, -g.oy); ctx.paint_with_alpha(alpha); ctx.restore()
    ctx.save(); ctx.translate(x + sp.tw / 2, base); ctx.scale(scale / TSS, scale / TSS)
    ctx.set_source_surface(sp.surf, -sp.ox, -sp.oy)
    ctx.get_source().set_filter(cairo.FILTER_GOOD)
    ctx.paint_with_alpha(alpha); ctx.restore()


def subtitles(ctx, t):
    for (p0, p1, txt, size) in PHRASES:
        if not (p0 <= t < p1): continue
        lines, lw, sp = layout(txt, size)
        lh = size * 1.42
        top = 330 - lh * (len(lines) - 1) / 2
        outk = eo3(prog(t, p1 - 0.16, p1))
        j = 0
        for li, line in enumerate(lines):
            x = 540 - lw[li] / 2
            base = top + li * lh + size * 0.36
            for (wd, acc, f, fs, col, w) in line:
                st = p0 + 0.055 * j
                e = eo3(prog(t, st, st + 0.32))
                sc = 1.0
                if acc:
                    e = eo3(prog(t, st + 0.05, st + 0.37))
                    sc = eback(prog(t, st + 0.05, st + 0.4), 2.2)
                draw_word(ctx, wd, f, fs, col, x, base + 24 * (1 - e) - 18 * outk, e * (1 - outk), sc, glow=acc)
                nxt = line[line.index((wd, acc, f, fs, col, w)) + 1] if line.index((wd, acc, f, fs, col, w)) + 1 < len(line) else None
                x += w + sp + (14 if nxt is not None and nxt[1] else 0); j += 1


# ---------------- frame ----------------
def scene(t):
    surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H)
    ctx = cairo.Context(surf)
    ctx_time[0] = t
    bg_shell(ctx, t, dots=False)
    cam = camera(t)
    s, cx, cy = cam
    ctx.save()
    ctx.translate(W / 2, FOCUS_Y); ctx.scale(s, s); ctx.translate(-cx, -cy)
    # world dot grid (parallax with camera)
    ctx.set_source_rgba(*hexc(PLUM, 0.06))
    for yy in range(-400, 2600, 64):
        for xx in range(-600, 1700, 64):
            ctx.rectangle(xx - 2, yy - 2, 4, 4)
    ctx.fill()
    draw_phone(ctx, t)
    callout(ctx, t)
    plane_wipe(ctx, t)
    ctx.restore()
    # ripples + hand (screen space, constant size)
    for (tt, wx, wy) in [(T_TAP1, *s2w(B1[0] + B1[2] / 2, B1[1] + B1[3] / 2)), (T_TAP2, *s2w(B2[0] + B2[2] / 2, B2[1] + B2[3] / 2)),
                         (T_TAP3, *s2w(302, 640))]:
        if tt - 0.6 < t < tt + 0.9:
            hx, hy = w2s(cam, wx, wy)
            ripple(ctx, hx, hy, prog(t, tt, tt + 0.5), PERI if tt != T_TAP3 else MINT, 170)
            pin = eo3(prog(t, tt - 0.55, tt - 0.05)); pout = eio(prog(t, tt + 0.2, tt + 0.7))
            px = lerp(lerp(1150, hx + 20, pin), 1200, pout); py = lerp(lerp(1950, hy + 10, pin), 2050, pout)
            press = 1 - abs(prog(t, tt - 0.08, tt + 0.08) * 2 - 1) if abs(t - tt) < 0.08 else 0
            hand(ctx, px, py, scale=0.85, press=press)
    # end card
    if t >= 11.95:
        a = eo3(prog(t, 11.95, 12.2))
        if a < 1:
            ctx.save(); ctx.push_group()
        end_card(ctx, t)
        if a < 1:
            ctx.pop_group_to_source(); ctx.paint_with_alpha(a); ctx.restore()
        if T_TAP4 - 0.6 < t < T_TAP4 + 1.2:
            hx, hy = 600, 1440
            ripple(ctx, hx, hy, prog(t, T_TAP4, T_TAP4 + 0.55), PERI, 240)
            pin = eo3(prog(t, T_TAP4 - 0.55, T_TAP4 - 0.05)); pout = eio(prog(t, T_TAP4 + 0.3, T_TAP4 + 0.9))
            px = lerp(lerp(1150, hx, pin), 1250, pout); py = lerp(lerp(1950, hy, pin), 2100, pout)
            press = 1 - abs(prog(t, T_TAP4 - 0.08, T_TAP4 + 0.08) * 2 - 1) if abs(t - T_TAP4) < 0.08 else 0
            hand(ctx, px, py, scale=0.9, press=press)
    # top fade for text legibility
    g = cairo.LinearGradient(0, 0, 0, 660)
    c = hexc(SHELL)
    g.add_color_stop_rgba(0, c[0], c[1], c[2], 1.0); g.add_color_stop_rgba(0.68, c[0], c[1], c[2], 0.97)
    g.add_color_stop_rgba(1, c[0], c[1], c[2], 0)
    ctx.rectangle(0, 0, W, 660); ctx.set_source(g); ctx.fill()
    if SUBS_ON: subtitles(ctx, t)
    surf.flush()
    arr = np.ndarray((H, surf.get_stride() // 4, 4), np.uint8, surf.get_data())[:, :W, :3].astype(np.float32)
    return arr


VIG = None
def frame(i):
    global VIG
    if VIG is None:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.hypot((xx - W / 2) / (W / 2), (yy - H / 2) / (H / 2))
        VIG = (1 - 0.10 * np.clip(r - 0.55, 0, 1) ** 1.5)[..., None]
    t0 = i / FPS
    acc = None
    for k in range(SUBFRAMES):
        tt = t0 + (k / SUBFRAMES) * (0.5 / FPS)
        a = scene(tt)
        acc = a if acc is None else acc + a
    f = acc / SUBFRAMES
    # hook glitch: RGB split on first frames
    g = int(7 * (1 - prog(t0, 0, 0.25)) ** 2)
    if g > 0:
        f[:, :, 2] = np.roll(f[:, :, 2], g, axis=1); f[:, :, 0] = np.roll(f[:, :, 0], -g, axis=1)
    f = f * VIG + GRAIN[i % len(GRAIN)] * 0.8
    out = np.empty((H, W, 4), np.uint8)
    out[:, :, :3] = np.clip(f, 0, 255).astype(np.uint8); out[:, :, 3] = 255
    return out.tobytes()


if __name__ == '__main__':
    if ONLY:
        for tt in ONLY:
            b = np.frombuffer(frame(int(round(tt * FPS))), np.uint8).reshape(H, W, 4)
            cv2.imwrite(os.path.join(OUT, f'f_{tt:05.2f}.png'), b[:, :, :3])
        sys.exit(0)
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', f'{W}x{H}',
                          '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
                          '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)
    with mp.get_context('fork').Pool(4) as pool:
        for i, b in enumerate(pool.imap(frame, range(N), chunksize=2)):
            p.stdin.write(b)
            if i % 60 == 0: print('frame', i, flush=True)
    p.stdin.close(); p.wait(); print('done')
