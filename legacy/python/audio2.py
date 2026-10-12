import numpy as np, wave, sys
SR = 44100; D = 15.0; n = int(SR * D); out = np.zeros((n, 2), np.float32)
rng = np.random.default_rng(2)
def T(d): return np.arange(int(SR * d)) / SR
def add(sig, t, pan=0.0, g=1.0):
    i = int(t * SR)
    if i < 0: sig = sig[-i:]; i = 0
    s = sig[:max(0, n - i)] * g
    out[i:i + len(s), 0] += s * (1 - pan); out[i:i + len(s), 1] += s * (1 + pan)
def lp(x, a):
    y = np.zeros_like(x); v = 0.0
    for i in range(len(x)): v += a * (x[i] - v); y[i] = v
    return y
def kick(d=0.35):
    tt = T(d); f = 48 + 80 * np.exp(-tt * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 10)
def hat():
    tt = T(0.035); return np.diff(rng.normal(0, 1, len(tt) + 1)) * np.exp(-tt * 160) * 0.18
def tap():
    tt = T(0.06); return (np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt * 140) + rng.normal(0, 1, len(tt)) * np.exp(-tt * 300) * 0.3) * 0.8
def pop_sfx(f0=700, f1=1150):
    tt = T(0.14); f = np.where(tt < 0.05, f0, f1)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-((tt % 0.05) * 50)) * 0.45
def chime(base=784):
    s = np.zeros(int(SR * 0.9))
    for k, m in enumerate([1, 1.25, 1.5, 2]):
        tt = T(0.9 - k * 0.07); x = (np.sin(2 * np.pi * base * m * tt) + 0.3 * np.sin(4 * np.pi * base * m * tt)) * np.exp(-tt * 5)
        i = int(k * 0.07 * SR); s[i:i + len(x)] += x[:len(s) - i]
    return s * 0.28
def whoosh(d=0.5, bright=0.25):
    m = int(SR * d); env = np.sin(np.pi * np.linspace(0, 1, m)) ** 2
    x = rng.normal(0, 1, m); y = np.zeros(m); v = 0
    for i in range(m): v += (0.01 + bright * env[i]) * (x[i] - v); y[i] = v
    return y * env * 2.2
def buzz():
    tt = T(0.32); x = np.sign(np.sin(2 * np.pi * 98 * tt)) * 0.25 + np.sin(2 * np.pi * 196 * tt) * 0.2
    return lp(x, 0.08) * np.exp(-tt * 6) * 1.6
def boom():
    tt = T(1.2); return np.sin(2 * np.pi * np.cumsum(40 + 30 * np.exp(-tt * 8)) / SR) * np.exp(-tt * 3) * 0.9
# pad: soft chord bed (Am - F - C - G), sidechained by kick
chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]]
pad = np.zeros(n, np.float32); tt = np.arange(n) / SR
for ci in range(8):
    a, b = ci * 1.875, (ci + 1) * 1.875
    m = (tt >= a) & (tt < b + 0.3)
    env = np.clip((tt[m] - a) / 0.4, 0, 1) * np.clip((b + 0.3 - tt[m]) / 0.4, 0, 1)
    for f in chords[ci % 4]:
        pad[m] += (np.sin(2 * np.pi * f * tt[m]) + 0.3 * np.sin(2 * np.pi * f * 2.003 * tt[m])) * env * 0.05
pad = lp(pad, 0.12)
beat = 60 / 128
duck = np.ones(n, np.float32)
for b in np.arange(1.75, 11.8, beat):
    i = int(b * SR); L = int(0.25 * SR); duck[i:i + L] = np.minimum(duck[i:i + L], 0.35 + 0.65 * np.linspace(0, 1, L) ** 0.5)
fade = np.clip(tt / 0.3, 0, 1) * np.clip((15 - tt) / 0.8, 0, 1)
out[:, 0] += pad * duck * fade; out[:, 1] += pad * duck * fade
# rhythm from the solution onward (hook is sparse = tension)
for b in np.arange(1.75, 11.8, beat): add(kick(), b, g=0.75)
for b in np.arange(1.75 + beat / 2, 11.8, beat): add(hat(), b, pan=0.25)
# hook: error buzz + X ticks
add(buzz(), 0.0, g=0.8)
for i in [1, 2, 4, 5, 6, 7]: add(tap() * 0.5, 0.18 + i * 0.09, pan=0.2)
add(whoosh(0.55, 0.3), 1.6, g=1.0)
for tt0 in [2.55, 2.95, 4.75]: add(pop_sfx(), tt0, g=0.8)
for tt0 in [4.40, 6.45, 9.05, 13.70]: add(tap(), tt0, g=0.9)
add(whoosh(0.4, 0.2), 6.45, g=0.7)
add(chime(784), 7.65); add(chime(1046), 9.1)
for tt0 in [10.25, 10.65, 11.05]: add(tap() * 0.6, tt0, pan=-0.2)
add(whoosh(0.45, 0.25), 9.65, g=0.6)
add(whoosh(0.5, 0.2), 11.7, g=0.8)
add(boom(), 12.0, g=0.9)
add(chime(659), 12.6, g=0.6)
out /= np.abs(out).max(); out *= 0.5
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
