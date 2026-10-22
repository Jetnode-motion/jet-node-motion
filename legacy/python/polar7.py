"""Polar7, part 1: voiceover lines (RHVoice), the timeline and the soundtrack.

usage: python3 polar7.py            # all steps
Writes public/audio/polar7/*.wav, public/audio/polar7.wav and src/compositions/Polar7/timeline.json.
Needs: apt install rhvoice rhvoice-russian, ffmpeg.
"""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
VO_DIR = os.path.join(ROOT, 'public', 'audio', 'polar7')
OUT_WAV = os.path.join(ROOT, 'public', 'audio', 'polar7.wav')
OUT_JSON = os.path.join(ROOT, 'src', 'compositions', 'Polar7', 'timeline.json')
SR = 44100

# Voices: the narrator, the mainland on the radio, the whisper behind his back.
VOICES = {
    'nar': dict(p='aleksandr-hq', r=96, t=88),
    'radio': dict(p='mikhail', r=100, t=95),
    'whisper': dict(p='aleksandr-hq', r=82, t=72),
}

# (scene, voice, spoken text, caption with *accent*, gap before in s)
# Scene 'banner' is the mid-roll banner, 'end' the last card. Their spoken line plays over the banner.
LINES = [
    ('mugs', 'nar', 'Нас на станции трое.', 'Нас на станции *трое.*', 0.35),
    ('mugs', 'nar', 'Но утром на столе стояли четыре кружки.', 'Но утром на столе стояли *четыре* кружки.', 0.45),
    ('outside', 'nar', 'До ближайшего посёлка — четыреста километров льда.', 'До ближайшего посёлка — 400 км *льда.*', 0.6),
    ('outside', 'nar', 'Вертолёт прилетит только в марте.', 'Вертолёт прилетит только в *марте.*', 0.35),
    ('radio', 'nar', 'Связь — одна рация. Раз в сутки, в девять вечера.', 'Связь — одна рация. Раз в сутки, в *девять* вечера.', 0.55),
    ('gena', 'nar', 'Сначала я подумал на Гену. Он у нас механик, и любит пошутить.', 'Сначала я подумал на *Гену.* Он у нас механик и любит пошутить.', 0.55),
    ('gena', 'nar', 'Но Гена клянётся, что спал.', 'Но Гена клянётся, что *спал.*', 0.35),
    ('mug', 'nar', 'А четвёртая кружка была ещё тёплой.', 'А четвёртая кружка была ещё *тёплой.*', 0.5),
    ('journal', 'nar', 'Я веду журнал. Каждый вечер пишу: сколько нас, сколько топлива, сколько еды.', 'Я веду журнал. Каждый вечер пишу: сколько нас, сколько топлива, сколько *еды.*', 0.6),
    ('journal', 'nar', 'Вчера в журнале появилась новая строчка.', 'Вчера в журнале появилась *новая* строчка.', 0.4),
    ('journal', 'nar', 'Не моим почерком.', 'Не *моим* почерком.', 0.45),
    ('banner', 'nar', 'Пауза на секунду. Интернет по белым спискам? Джетноуд ВПН работает даже там. Три дня бесплатно, ссылка в профиле.', 'Если у вас интернет по белым спискам — *JetnodeVPN* работает даже там', 0.9),
    ('note', 'nar', 'Там было написано: «Нас четверо. Не говорите материку».', 'Там было написано: «Нас *четверо.* Не говорите материку»', 1.0),
    ('bunks', 'nar', 'Ночью я пересчитал спальники. Три.', 'Ночью я пересчитал спальники. *Три.*', 0.6),
    ('coats', 'nar', 'Пересчитал куртки на вешалке. Четыре.', 'Пересчитал куртки на вешалке. *Четыре.*', 0.5),
    ('coats', 'nar', 'Одна мокрая. Будто кто-то только что пришёл с мороза.', 'Одна *мокрая.* Будто кто-то только что пришёл с мороза.', 0.45),
    ('radio2', 'nar', 'Ровно в девять рация ожила.', 'Ровно в девять рация *ожила.*', 0.6),
    ('radio2', 'radio', 'Полярная-семь, это материк. Как обстановка?', '«Полярная-7, это материк. Как *обстановка?*»', 0.35),
    ('radio2', 'nar', 'Я нажал кнопку, чтобы ответить.', 'Я нажал кнопку, чтобы *ответить.*', 0.5),
    ('behind', 'nar', 'И за спиной кто-то тихо сказал:', 'И за спиной кто-то *тихо* сказал:', 0.5),
    ('behind', 'whisper', 'Скажи, что всё хорошо.', '«Скажи, что всё *хорошо.*»', 0.6),
    ('end', 'nar', 'Продолжение — во второй части. А пока — Джетноуд ВПН, три дня бесплатно.', 'Продолжение — во *второй* части', 1.6),
]
TAIL = 3.0  # end card holds after the last line


def tts(text, voice, path):
    v = VOICES[voice]
    raw = path + '.raw.wav'
    subprocess.run(['RHVoice-test', '-p', v['p'], '-r', str(v['r']), '-t', str(v['t']), '-R', str(SR), '-o', raw],
                   input=text.encode(), check=True)
    af = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
    if voice == 'radio':
        af += ',highpass=f=450,lowpass=f=2800,acrusher=bits=10:mix=0.25,volume=1.4'
    if voice == 'whisper':
        af += ',highpass=f=180,aecho=0.6:0.5:40:0.25,volume=0.9'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', af, '-ac', '1', '-ar', str(SR), path], check=True)
    os.remove(raw)


def read_mono(p):
    with wave.open(p) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        if w.getnchannels() == 2:
            a = a.reshape(-1, 2).mean(1)
    return a


def build_voice():
    os.makedirs(VO_DIR, exist_ok=True)
    for i, (_, voice, text, _, _) in enumerate(LINES):
        tts(text, voice, os.path.join(VO_DIR, f'l{i + 1:02d}.wav'))


def build_timeline():
    t = 0.0
    lines, scenes = [], []
    for i, (scene, voice, _, cap, gap) in enumerate(LINES):
        t += gap
        dur = len(read_mono(os.path.join(VO_DIR, f'l{i + 1:02d}.wav'))) / SR
        lines.append(dict(at=round(t, 3), dur=round(dur, 3), scene=scene, voice=voice, cap=cap))
        if not scenes or scenes[-1]['id'] != scene:
            if scenes:
                scenes[-1]['to'] = round(t - min(gap, 0.25), 3)
            scenes.append(dict(id=scene, frm=round(t - min(gap, 0.25), 3)))
        t += dur
    scenes[0]['frm'] = 0
    total = round(t + TAIL, 2)
    scenes[-1]['to'] = total
    # Banner beats get a little air after their line before the story resumes.
    data = dict(duration=total, lines=lines, scenes=scenes)
    with open(OUT_JSON, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    return data


# ---------------- soundtrack
rng = np.random.default_rng(7)


def T(d):
    return np.arange(int(SR * d)) / SR


def lp(x, a):
    from scipy.signal import lfilter
    return lfilter([a], [1, a - 1], x).astype(np.float32)


def env_window(n, a, b, fade):
    tt = np.arange(n) / SR
    return np.clip((tt - a) / fade, 0, 1) * np.clip((b - tt) / fade, 0, 1)


def build_mix(data):
    D = data['duration']
    n = int(SR * D)
    out = np.zeros((n, 2), np.float32)
    tt = np.arange(n) / SR

    def add(sig, t, pan=0.0, g=1.0):
        i = int(t * SR)
        s = sig[:max(0, n - i)] * g
        out[i:i + len(s), 0] += s * (1 - pan)
        out[i:i + len(s), 1] += s * (1 + pan)

    sc = {s['id']: (s['frm'], s['to']) for s in data['scenes']}
    story = np.ones(n, np.float32)
    for k in ('banner',):
        a, b = sc[k]
        story *= 1 - 0.75 * env_window(n, a, b, 0.4)

    # Drone bed: low detuned fifths, slowly breathing, plus filtered air.
    drone = np.zeros(n, np.float32)
    for f, g in [(55, 0.5), (55.4, 0.4), (82.4, 0.25), (110.3, 0.12)]:
        drone += np.sin(2 * np.pi * f * tt + rng.uniform(0, 6)) * g
    drone *= 0.55 + 0.45 * np.sin(2 * np.pi * tt / 9.0) ** 2
    air = lp(rng.normal(0, 1, n).astype(np.float32), 0.004) * 6
    bed = (drone * 0.05 + air * 0.05) * story
    # Lift the drone in the last scene.
    a, b = sc['behind']
    bed *= 1 + 0.8 * env_window(n, a, b + 0.5, 1.5)
    out[:, 0] += bed
    out[:, 1] += bed

    # Wind outside.
    a, b = sc['outside']
    wind = lp(rng.normal(0, 1, n).astype(np.float32), 0.02) * 2.2
    wind *= (0.6 + 0.4 * np.sin(2 * np.pi * tt / 2.7) ** 2) * env_window(n, a - 0.3, b + 0.3, 0.6)
    out[:, 0] += wind * 0.12
    out[:, 1] += wind * 0.09

    # Radio static under both radio scenes.
    for k in ('radio', 'radio2'):
        a, b = sc[k]
        st = rng.normal(0, 1, n).astype(np.float32)
        st = (st - lp(st, 0.2)) * env_window(n, a, b, 0.3) * 0.022
        out[:, 0] += st
        out[:, 1] += st

    # Clock tick through the journal and note scenes.
    tick = np.sin(2 * np.pi * 2400 * T(0.03)) * np.exp(-T(0.03) * 220) * 0.07
    for k in ('journal', 'note'):
        a, b = sc[k]
        for x in np.arange(a + 0.2, b, 1.0):
            add(tick, x, pan=0.3)

    # Low hits on the cuts that turn the story, a heartbeat at the end.
    def hit():
        t2 = T(1.4)
        return np.sin(2 * np.pi * np.cumsum(38 + 40 * np.exp(-t2 * 9)) / SR) * np.exp(-t2 * 2.6) * 0.5

    for k in ('mugs', 'note', 'coats', 'behind', 'end'):
        add(hit(), sc[k][0] + 0.05)
    thump = np.sin(2 * np.pi * np.cumsum(50 + 20 * np.exp(-T(0.25) * 30)) / SR) * np.exp(-T(0.25) * 14) * 0.45
    a, b = sc['behind']
    for x in np.arange(a + 0.3, b, 0.85):
        add(thump, x)
        add(thump * 0.6, x + 0.22)

    # Banner: a soft two-note chime in and out.
    def chime(f):
        t2 = T(1.0)
        return (np.sin(2 * np.pi * f * t2) + 0.3 * np.sin(4 * np.pi * f * t2)) * np.exp(-t2 * 4) * 0.12

    for k in ('banner', 'end'):
        a, _ = sc[k]
        add(chime(659), a + 0.1, pan=-0.2)
        add(chime(988), a + 0.22, pan=0.2)

    # Voice on top.
    for i, ln in enumerate(data['lines']):
        v = read_mono(os.path.join(VO_DIR, f'l{i + 1:02d}.wav'))
        v = v / (np.abs(v).max() + 1e-9) * 0.82
        add(v, ln['at'], pan=0.0, g=0.9)

    out /= max(1.0, np.abs(out).max() / 0.95)
    pcm = (out * 32767).astype(np.int16)
    with wave.open(OUT_WAV, 'w') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    build_voice()
    d = build_timeline()
    build_mix(d)
    print('duration', d['duration'])
    for s in d['scenes']:
        print(f"{s['id']:8s} {s['frm']:6.2f} → {s['to']:6.2f}")
