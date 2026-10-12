"""Soundtrack for JetnodeAd30: voiceover lines + ducked music bed + SFX on every action.
usage: python3 audio5.py <vo_dir> <out.wav>"""
import numpy as np, wave, sys, os
SR = 44100; D = 30.0; n = int(SR * D); out = np.zeros((n, 2), np.float32)
rng = np.random.default_rng(5)
VO = [(0.15, 1), (2.45, 2), (5.0, 3), (8.2, 4), (11.4, 5), (16.4, 6), (19.45, 7), (22.55, 8), (25.6, 9)]
def T(d): return np.arange(int(SR * d)) / SR
def add(sig, t, pan=0.0, g=1.0, buf=None):
    b = out if buf is None else buf
    i = int(t * SR)
    if i < 0: sig = sig[-i:]; i = 0
    s = sig[:max(0, n - i)] * g
    if b.ndim == 2:
        b[i:i + len(s), 0] += s * (1 - pan); b[i:i + len(s), 1] += s * (1 + pan)
    else:
        b[i:i + len(s)] += s
def lp(x, a):
    y = np.zeros_like(x); v = 0.0
    for i in range(len(x)): v += a * (x[i] - v); y[i] = v
    return y
def kick(d=0.35):
    tt = T(d); f = 48 + 80 * np.exp(-tt * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 10)
def hat():
    tt = T(0.035); return np.diff(rng.normal(0, 1, len(tt) + 1)) * np.exp(-tt * 160) * 0.16
def tap():
    tt = T(0.06); return (np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt * 140) + rng.normal(0, 1, len(tt)) * np.exp(-tt * 300) * 0.3) * 0.8
def tick(): return tap() * 0.28
def pop_sfx(f0=700, f1=1150):
    tt = T(0.14); f = np.where(tt < 0.05, f0, f1)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-((tt % 0.05) * 50)) * 0.45
def err(): return pop_sfx(520, 360) * 0.5
def chime(base=784):
    s = np.zeros(int(SR * 0.9))
    for k, m in enumerate([1, 1.25, 1.5, 2]):
        tt = T(0.9 - k * 0.07); x = (np.sin(2 * np.pi * base * m * tt) + 0.3 * np.sin(4 * np.pi * base * m * tt)) * np.exp(-tt * 5)
        i = int(k * 0.07 * SR); s[i:i + len(x)] += x[:len(s) - i]
    return s * 0.26
def whoosh(d=0.5, bright=0.25):
    m = int(SR * d); env = np.sin(np.pi * np.linspace(0, 1, m)) ** 2
    x = rng.normal(0, 1, m); y = np.zeros(m); v = 0
    for i in range(m): v += (0.01 + bright * env[i]) * (x[i] - v); y[i] = v
    return y * env * 2.0
def riser(d=1.05):
    tt = T(d); f = 220 * 2 ** (tt / d * 2)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * (tt / d) ** 1.5 * 0.22
def buzz():
    tt = T(0.32); x = np.sign(np.sin(2 * np.pi * 98 * tt)) * 0.25 + np.sin(2 * np.pi * 196 * tt) * 0.2
    return lp(x, 0.08) * np.exp(-tt * 6) * 1.4
def boom():
    tt = T(1.2); return np.sin(2 * np.pi * np.cumsum(40 + 30 * np.exp(-tt * 8)) / SR) * np.exp(-tt * 3) * 0.8
def read_mono(p):
    with wave.open(p) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        if w.getnchannels() == 2: a = a.reshape(-1, 2).mean(1)
    return a
# --- music bed
tt = np.arange(n) / SR
chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]]
bar = 60 / 110 * 4
music = np.zeros((n, 2), np.float32)
pad = np.zeros(n, np.float32)
for ci in range(int(D / bar) + 1):
    a, b = ci * bar, (ci + 1) * bar
    m = (tt >= a) & (tt < b + 0.3)
    env = np.clip((tt[m] - a) / 0.4, 0, 1) * np.clip((b + 0.3 - tt[m]) / 0.4, 0, 1)
    for f in chords[ci % 4]:
        pad[m] += (np.sin(2 * np.pi * f * tt[m]) + 0.3 * np.sin(2 * np.pi * f * 2.003 * tt[m])) * env * 0.05
pad = lp(pad, 0.12)
music[:, 0] += pad; music[:, 1] += pad
beat = 60 / 110
for b in np.arange(4.9, 25.5, beat): add(kick(), b, g=0.6, buf=music)
for b in np.arange(4.9 + beat / 2, 25.5, beat): add(hat(), b, pan=0.25, buf=music)
for b in np.arange(0.2, 4.6, beat * 2): add(kick() * 0.5, b, buf=music)  # heartbeat in the hook
for b in np.arange(25.5, 29.0, beat * 2): add(kick() * 0.4, b, buf=music)
# --- voiceover, and a ducking envelope from it
vo = np.zeros(n, np.float32)
for at, k in VO: add(read_mono(os.path.join(sys.argv[1], f'l{k}.wav')), at, buf=vo)
vo /= np.abs(vo).max() + 1e-9
env = lp(np.abs(vo), 0.0008); env /= env.max() + 1e-9
duck = 1 - 0.6 * np.clip(env * 3, 0, 1)
fade = np.clip(tt / 0.3, 0, 1) * np.clip((D - tt) / 1.2, 0, 1)
out += music * (duck * fade)[:, None] * 0.9
# --- sfx
for i in range(9): add(tick(), 0.1 + i * 0.067, pan=(i % 3 - 1) * 0.3)
add(buzz(), 2.95, g=0.6)
for i in range(3): add(err(), 2.95 + i * 0.22, pan=(i - 1) * 0.3)
for i in range(6): add(err() * 0.6, 3.75 + i * 0.07, pan=(i % 3 - 1) * 0.3)
add(whoosh(0.45, 0.22), 4.65, g=0.6)
add(boom() * 0.6, 4.95)
add(whoosh(0.4, 0.3), 5.4, g=0.35)
for i, x in enumerate([150 + k * 156 for k in range(6)]): add(pop_sfx(900, 1300) * 0.45, 5.97 + 0.42 * abs(x - 540) / 390, pan=(i - 2.5) * 0.15)
add(chime(659), 6.6, g=0.5)
add(whoosh(0.5, 0.2), 7.95, g=0.6)
add(pop_sfx(), 8.6, g=0.6)
add(chime(988) * 0.6, 9.15)
add(whoosh(0.4, 0.12), 9.6, g=0.35)
add(whoosh(0.4, 0.12), 11.0, g=0.35)
add(tap(), 12.1)
add(whoosh(0.4, 0.28), 12.25, g=0.5)
add(pop_sfx(), 12.75, g=0.6)
add(chime(784), 13.55, g=0.8)
add(tap(), 14.9)
add(chime(1046), 14.95, g=0.7)
add(whoosh(0.45, 0.22), 16.1, g=0.6)
for i in range(6): add(tick(), 16.45 + i * 0.09, pan=(i % 2 - 0.5) * 0.4)
for at in [17.75, 18.75]: add(pop_sfx(900, 1300) * 0.5, at)
add(whoosh(0.45, 0.22), 19.2, g=0.6)
add(riser(), 19.65, g=0.8)
add(pop_sfx(1000, 1500), 20.7, g=0.6)
add(err() * 0.7, 21.15); add(chime(880) * 0.6, 21.3)
add(whoosh(0.45, 0.22), 22.3, g=0.6)
add(pop_sfx(), 22.95, g=0.7)
for i in range(3): add(pop_sfx(700 + i * 150, 1100 + i * 150) * 0.45, 23.9 + i * 0.18)
add(whoosh(0.5, 0.2), 25.35, g=0.6)
add(boom() * 0.8, 25.55)
add(tap(), 28.3); add(chime(1046), 28.35, g=0.5)
# voiceover on top
out[:, 0] += vo * 0.95; out[:, 1] += vo * 0.95
out /= np.abs(out).max(); out *= 0.89
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
