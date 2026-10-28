"""«Переписка», part 1 «Не открывай»: voiceover (ElevenLabs), timeline and soundtrack with a mood score.

usage: ELEVENLABS_API_KEY=... python3 messages1.py [--no-tts | --recording take.m4a]
Writes public/audio/messages1/*.mp3, public/audio/messages1.wav and src/compositions/Messages1/timeline.json.
--no-tts reuses the voice files already on disk (the free ElevenLabs plan has a small monthly quota).
--recording cuts Nazar's own take into lines (lNN.wav, used instead of the synthesized mp3s).
SFX come from the project sound library (SFX_DIR, default /mnt/project-files/sfx).
"""
import difflib, json, os, re, subprocess, sys, urllib.request
import numpy as np
from scipy.signal import lfilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
VO_DIR = os.path.join(ROOT, 'public', 'audio', 'messages1')
OUT_WAV = os.path.join(ROOT, 'public', 'audio', 'messages1.wav')
OUT_JSON = os.path.join(ROOT, 'src', 'compositions', 'Messages1', 'timeline.json')
SFX_DIR = os.environ.get('SFX_DIR', '/mnt/project-files/sfx')
SR = 44100
VOICE = 'nPczCjzI2devNBz1zQrb'  # ElevenLabs premade «Brian», picked by Nazar
MODEL = 'eleven_v3'
SPEED = None  # optional voice_settings.speed for faster episodes

# (scene, spoken text with v3 tags, caption with *accent*, gap before in s)
LINES = [
    ('phone', '[quietly] В час ночи мне написал мой же номер.', 'В час ночи мне написал мой же *номер.*', 0.25),
    ('phone', '[whispers] «Не открывай дверь. Это не я».', '«Не открывай дверь. *Это не я*»', 0.2),
    ('block', 'Я живу один. Девятый этаж, однушка на окраине.', 'Я живу *один.* Девятый этаж, однушка на окраине.', 0.3),
    ('block', 'Сначала решил — спам. Или друзья прикалываются.', 'Сначала решил — *спам.* Или друзья прикалываются.', 0.2),
    ('bed', 'Написал: «Кто это?»', 'Написал: «Кто *это?*»', 0.25),
    ('bed', 'Ответ пришёл сразу. «Ты. Только на десять минут позже».', 'Ответ пришёл сразу. «Ты. Только на *10 минут позже*»', 0.2),
    ('door', '[serious] И тут в дверь позвонили.', 'И тут в дверь *позвонили.*', 0.35),
    ('peep', 'Я посмотрел в глазок. На площадке стоял сосед, дядя Коля. В тапках, с пустой кружкой.', 'На площадке стоял сосед, *дядя Коля.* В тапках, с пустой кружкой.', 0.25),
    ('peep', '«Соль не одолжишь?» В час ночи.', '«Соль не одолжишь?» В *час ночи.*', 0.2),
    ('bed2', 'Телефон снова завибрировал. «Дядя Коля умер в прошлом году. Ты был на похоронах».', '«Дядя Коля умер в прошлом году. Ты был *на похоронах*»', 0.3),
    ('memory', 'Я правда был на похоронах. Помню венок. Помню дождь.', 'Я правда был на похоронах. Помню венок. Помню *дождь.*', 0.6),
    ('door2', 'А звонок всё звенел. Ровно. Без пауз.', 'А звонок всё звенел. Ровно. *Без пауз.*', 0.25),
    ('door2', 'Я написал: «Что мне делать?»', 'Я написал: «Что мне *делать?*»', 0.2),
    ('window', '«Выключи свет. Встань у окна. И не отвечай ему, что бы он ни говорил».', '«Выключи свет. Встань у окна. И *не отвечай* ему»', 0.25),
    ('voice', '[serious] Свет погас. И из-за двери заговорил голос. Мой собственный.', 'И из-за двери заговорил голос. *Мой собственный.*', 0.3),
    ('voice', '[whispers] «Открой. Это я. Я тебе писал».', '«Открой. Это я. *Я тебе писал*»', 0.3),
    ('last', 'Телефон в руке загорелся последним сообщением.', 'Телефон загорелся *последним* сообщением', 0.35),
    ('last', '[quietly] «Я не успел. Теперь твоя очередь писать».', '«Я не успел. Теперь *твоя очередь* писать»', 0.2),
    ('end', 'Продолжение — во второй части.', 'Продолжение — во *второй* части', 0.9),
]
# Scenes where the score adds the pulse (tension) or the music box (eerie).
TENSION = ['door', 'peep', 'bed2', 'door2', 'window']
EERIE = ['phone', 'bed', 'memory', 'last', 'end']
TAIL = 6.0  # the end card: «часть 2» title, then the JetnodeVPN banner

# Mid-roll (ad option C): a silent JetnodeVPN push notification, (line 1-based, offset, seconds on screen).
PUSH = (11, 0.3, 4.0)

# Messenger events: (line index 1-based, offset from line start, side, text). 'in' = from «Я», 'out' = the narrator.
CHAT = [
    (1, 1.6, 'in', 'Не открывай дверь.'),
    (2, 0.6, 'in', 'Это не я.'),
    (5, 0.5, 'out', 'Кто это?'),
    (6, 0.6, 'in', 'Ты. Только на 10 минут позже.'),
    (10, 0.9, 'in', 'Дядя Коля умер в прошлом году.'),
    (10, 2.8, 'in', 'Ты был на похоронах.'),
    (13, 0.6, 'out', 'Что мне делать?'),
    (14, 0.2, 'in', 'Выключи свет. Встань у окна.'),
    (14, 2.0, 'in', 'И не отвечай ему, что бы он ни говорил.'),
    (18, 0.4, 'in', 'Я не успел.'),
    (18, 1.4, 'in', 'Теперь твоя очередь писать.'),
]


def tts(text, path):
    req = urllib.request.Request(
        f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128',
        data=json.dumps({'text': text, 'model_id': MODEL, 'language_code': 'ru', **({'voice_settings': {'speed': SPEED}} if SPEED else {})}).encode(),
        headers={'xi-api-key': os.environ['ELEVENLABS_API_KEY'], 'Content-Type': 'application/json'},
    )
    with urllib.request.urlopen(req, timeout=120) as r, open(path, 'wb') as f:
        f.write(r.read())


def load(path, mono=True):
    """Any audio file -> float32 at SR via ffmpeg; leading/trailing silence trimmed for voice."""
    cmd = ['ffmpeg', '-v', 'error', '-i', path, '-ac', '1' if mono else '2', '-ar', str(SR), '-f', 'f32le', '-']
    a = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32)
    return a if mono else a.reshape(-1, 2).mean(1)


def trim(a, thr=0.01):
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0] - 400): idx[-1] + 2000] if len(idx) else a


def vo_path(i):
    # Nazar's own recording (cut by import_recording) wins over the synthesized take.
    own = os.path.join(VO_DIR, f'l{i + 1:02d}.wav')
    if os.path.exists(own):
        return own
    return os.path.join(VO_DIR, f'l{i + 1:02d}.mp3')



def build_voice():
    os.makedirs(VO_DIR, exist_ok=True)
    for i, (_, text, _, _) in enumerate(LINES):
        tts(text, vo_path(i))
        print('tts', i + 1)


def build_timeline():
    t = 0.0
    lines, scenes = [], []
    for i, (scene, _, cap, gap) in enumerate(LINES):
        t += gap
        dur = len(trim(load(vo_path(i)))) / SR
        lines.append(dict(at=round(t, 3), dur=round(dur, 3), scene=scene, cap=cap))
        if not scenes or scenes[-1]['id'] != scene:
            lead = min(gap, 0.2)
            if scenes:
                scenes[-1]['to'] = round(t - lead, 3)
            scenes.append(dict(id=scene, frm=round(t - lead, 3)))
        t += dur
    scenes[0]['frm'] = 0
    total = round(t + TAIL, 2)
    scenes[-1]['to'] = total
    pl, po, pd = PUSH
    push = dict(at=round(lines[pl - 1]['at'] + po, 3), dur=pd)
    chat = [dict(at=round(lines[li - 1]['at'] + off, 3), side=side, text=txt) for li, off, side, txt in CHAT]
    data = dict(duration=total, lines=lines, scenes=scenes, chat=chat, push=push)
    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    with open(OUT_JSON, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    return data


# ---------------- score and mix
rng = np.random.default_rng(11)
BPM = 92
BEAT = 60 / BPM


def T(d):
    return np.arange(int(SR * d)) / SR


def lp(x, a):
    return lfilter([a], [1, a - 1], x).astype(np.float32)


def reverb(x, wet=0.35):
    """Small Schroeder reverb: four combs into two allpasses."""
    y = np.zeros_like(x)
    for d, g in [(1557, 0.84), (1617, 0.83), (1491, 0.85), (1422, 0.84)]:
        a = np.zeros(d + 1); a[0] = 1; a[d] = -g
        y += lfilter([1], a, x)
    y /= 4
    for d, g in [(225, 0.5), (556, 0.5)]:
        b = np.zeros(d + 1); b[0] = -g; b[d] = 1
        a = np.zeros(d + 1); a[0] = 1; a[d] = -g
        y = lfilter(b, a, y)
    return (x * (1 - wet) + y * wet).astype(np.float32)


def win(n, a, b, fade):
    tt = np.arange(n) / SR
    return (np.clip((tt - a) / fade, 0, 1) * np.clip((b - tt) / fade, 0, 1)).astype(np.float32)


def note(f, d, kind='pluck'):
    tt = T(d)
    if kind == 'pluck':  # music box / soft piano
        s = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(4 * np.pi * f * tt) + 0.12 * np.sin(6 * np.pi * f * tt)
        return (s * np.exp(-tt * 3.2) * np.clip(tt / 0.004, 0, 1)).astype(np.float32)
    if kind == 'sub':
        f2 = f * (1 + 0.6 * np.exp(-tt * 25))
        return (np.sin(2 * np.pi * np.cumsum(f2) / SR) * np.exp(-tt * 5)).astype(np.float32)
    raise ValueError(kind)


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


# A minor: Am F C E (bars of 4 beats)
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [52, 56, 59]]
MOTIF = [69, 72, 76, 71, 69, 72, 77, 76]  # music-box line, one note per beat


def score(D, sc):
    """Mood score per scene: pad always, pulse and ticks for tension, music box for the eerie beats."""
    n = int(SR * D)
    tt = np.arange(n) / SR
    pad = np.zeros(n, np.float32)
    bar = BEAT * 4
    for ci in range(int(D / bar) + 1):
        a = ci * bar
        e = win(n, a, a + bar + 0.6, 0.5)
        m = e > 0
        for k, md in enumerate(CHORDS[ci % 4]):
            f = mtof(md - 12)
            ph = 2 * np.pi * f * tt[m]
            pad[m] += (np.sin(ph) + 0.5 * np.sin(ph * 2.002) + 0.25 * np.sign(np.sin(ph * 0.999)) * 0.3) * e[m] * 0.05
    pad = lp(pad, 0.05)

    def mask(ids, fade=0.6):
        m = np.zeros(n, np.float32)
        for i in ids:
            if i in sc:
                m = np.maximum(m, win(n, sc[i][0], sc[i][1], fade))
        return m

    tension = mask(TENSION)
    eerie = mask(EERIE)
    calm = np.zeros(n, np.float32)
    silent = mask(['voice'], 0.3)

    pulse = np.zeros(n, np.float32)
    ticks = np.zeros(n, np.float32)
    box = np.zeros(n, np.float32)
    tick = (np.diff(rng.normal(0, 1, int(SR * 0.03) + 1)) * np.exp(-T(0.03) * 180)).astype(np.float32)
    for bi in range(int(D / BEAT)):
        t0 = bi * BEAT
        i = int(t0 * SR)
        s = note(55 if (bi // 8) % 2 == 0 else 43.65, BEAT)
        pulse[i:i + len(s)] += s[: n - i] * 0.55
        for h in (0, 0.5):
            j = int((t0 + h * BEAT) * SR)
            ticks[j:j + len(tick)] += tick[: n - j] * (0.10 if h == 0 else 0.06)
        b = note(mtof(MOTIF[bi % 8]), 1.6)
        box[i:i + len(b)] += b[: n - i] * 0.09
    box = reverb(box, 0.5)
    music = pad * (1 - 0.7 * silent) + pulse * tension * (1 - silent) + ticks * np.maximum(tension, eerie * 0.5) * (1 - silent) + box * eerie
    music = music * (1 - 0.6 * calm)
    return reverb(music, 0.18)


def sfx(name):
    return load(os.path.join(SFX_DIR, name))


def dingdong():
    s = np.zeros(int(SR * 1.6), np.float32)
    for k, f in enumerate([659.3, 523.3]):
        x = note(f, 1.2) * 0.6
        j = int(k * 0.42 * SR)
        s[j:j + len(x)] += x[: len(s) - j]
    return reverb(s, 0.3)


def episode_cues(data, sc, add, out, n):
    """Sound design tied to this episode's scenes (another episode swaps this function)."""
    dd = dingdong()
    add(dd, sc['door'][0] + 0.15, 0.55)
    a, b = sc['door2']
    for x in np.arange(a + 0.1, b, 1.25):
        add(dd, x, 0.32)
    # rain under the memory
    a, b = sc['memory']
    rain = lp(rng.normal(0, 1, n).astype(np.float32), 0.3) * win(n, a - 0.3, b + 0.3, 0.6)
    out += rain * 0.05
    # whooshes and glitches on the turns
    add(sfx('whoosh/Swoosh.wav'), sc['block'][0] - 0.2, 0.35)
    add(sfx('glitch/Glitch.wav'), sc['bed2'][0], 0.5)
    add(sfx('glitch/Glitch 3.wav'), sc['voice'][0], 0.6)
    add(sfx('ping-notify/Ping 3.mp3'), data['push']['at'], 0.3)
    add(sfx('whoosh/Whoosh.wav'), sc['memory'][0] - 0.5, 0.3)
    add(sfx('riser-drop/Rise Up.wav'), sc['last'][0] - 2.35, 0.35)
    add(sfx('riser-drop/Drop.wav'), sc['last'][0], 0.45)
    add(sfx('ping-notify/Ping.wav'), sc['end'][0] + 3.4, 0.25)
    # light switch at «Свет погас»
    add(sfx('click-pop/Click.wav'), data['lines'][14]['at'] + 0.6, 0.6)


def build_mix(data):
    D = data['duration']
    n = int(SR * D)
    out = np.zeros(n, np.float32)
    sc = {s['id']: (s['frm'], s['to']) for s in data['scenes']}

    def add(sig, t, g=1.0):
        i = int(t * SR)
        if i >= n:
            return
        s = sig[: n - i] * g
        out[i:i + len(s)] += s

    # voice and a ducking envelope
    vo = np.zeros(n, np.float32)
    for i, ln in enumerate(data['lines']):
        v = trim(load(vo_path(i)))
        v = v / (np.abs(v).max() + 1e-9) * 0.9
        j = int(ln['at'] * SR)
        vo[j:j + len(v)] += v[: n - j]
    duck = lp(np.abs(vo), 0.0006)
    duck = 1 - 0.5 * np.clip(duck / (duck.max() + 1e-9) * 3, 0, 1)

    music = score(D, sc)
    out += music * duck * 0.9

    # sound design
    ping = sfx('ping-notify/Ping 3.mp3')
    buzz = (np.sign(np.sin(2 * np.pi * 150 * T(0.5))) * 0.15 * (np.sin(2 * np.pi * 9 * T(0.5)) > 0)).astype(np.float32)
    buzz = lp(buzz, 0.15) * 3
    for c in data['chat']:
        if c['at'] < 0.3:  # already on screen when the episode opens
            continue
        if c['side'] == 'in':
            add(ping, c['at'], 0.28)
            add(buzz, c['at'] + 0.05, 0.35)
        else:
            add(sfx('click-pop/Pop 2.mp3'), c['at'], 0.4)

    episode_cues(data, sc, add, out, n)

    out += vo
    out /= max(1.0, np.abs(out).max() / 0.95)
    st = np.stack([out, out], 1)
    pcm = (st * 32767).astype(np.int16)
    import wave
    with wave.open(OUT_WAV, 'w') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())


# ---------------- Nazar's own recording
def _norm(w):
    return re.sub(r'[^а-яa-z0-9]', '', w.lower().replace('ё', 'е'))


def _stt(audio_bytes, filename='take.wav'):
    """ElevenLabs speech-to-text with word timings (seconds from the start of the audio)."""
    req = urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text', method='POST')
    boundary = 'polar7boundary'
    parts = []
    for k, v in (('model_id', 'scribe_v1'), ('language_code', 'rus')):
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{filename}"\r\nContent-Type: application/octet-stream\r\n\r\n'.encode() + audio_bytes + b'\r\n')
    parts.append(f'--{boundary}--\r\n'.encode())
    req.data = b''.join(parts)
    req.add_header('xi-api-key', os.environ['ELEVENLABS_API_KEY'])
    req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
    with urllib.request.urlopen(req, timeout=600) as r:
        return json.loads(r.read())


def build_words(data):
    """Exact captions: every spoken word with the moment it is said, from STT of the trimmed take.

    The caption is the spoken text itself (audio tags removed), so subtitles match the voice word for
    word. Words that appear *starred* in the line's caption keep the accent colour. STT results are
    cached next to the voice files as lNN.words.json.
    """
    import io, wave
    for i, ln in enumerate(data['lines']):
        spoken = re.sub(r'\[[a-z ]+\]\s*', '', LINES[i][1]).strip()
        acc = {_norm(w) for w in re.findall(r'\*([^*]+)\*', ln['cap']) for w in w.split()}
        cache = vo_path(i).rsplit('.', 1)[0] + '.words.json'
        if os.path.exists(cache):
            stt = json.load(open(cache))
        else:
            a = trim(load(vo_path(i)))
            buf = io.BytesIO()
            with wave.open(buf, 'wb') as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(SR)
                w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())
            stt = _stt(buf.getvalue())
            json.dump(stt, open(cache, 'w'), ensure_ascii=False)
        heard = [w for w in stt['words'] if w['type'] == 'word' and _norm(w['text'])]
        script = [w for w in spoken.split() if _norm(w)]
        sm = difflib.SequenceMatcher(None, [_norm(w) for w in script], [_norm(w['text']) for w in heard])
        at = [None] * len(script)
        for tag, a0, a1, b0, b1 in sm.get_opcodes():
            if tag == 'equal' or (tag == 'replace' and a1 - a0 == b1 - b0):
                for k in range(a1 - a0):
                    at[a0 + k] = heard[b0 + k]['start']
            elif tag == 'replace':
                # STT split or merged words here: spread the script words over the heard span
                t0, t1 = heard[b0]['start'], heard[b1 - 1]['end']
                for k in range(a1 - a0):
                    at[a0 + k] = t0 + (t1 - t0) * k / (a1 - a0)
        # words STT missed: spread between their neighbours
        for k in range(len(at)):
            if at[k] is None:
                prev = next((at[j] for j in range(k - 1, -1, -1) if at[j] is not None), 0.0)
                nxt = next((at[j] for j in range(k + 1, len(at)) if at[j] is not None), ln['dur'])
                at[k] = prev + (nxt - prev) * 0.5
        ln['words'] = [dict(w=w, at=round(ln['at'] + t, 3), acc=_norm(w) in acc) for w, t in zip(script, at)]
    with open(OUT_JSON, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    return data


def import_recording(path):
    """One continuous take with all lines (numbers said between them, retakes allowed) -> l01.wav … lNN.wav.

    ElevenLabs speech-to-text gives word timings; each script line is matched to the last good take of it
    (a retake comes right after the bad one), then cut, de-noised, EQ'd and compressed.
    """
    req = urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text', method='POST')
    boundary = 'polar7boundary'
    with open(path, 'rb') as f:
        audio = f.read()
    parts = []
    for k, v in (('model_id', 'scribe_v1'), ('language_code', 'rus')):
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="take"\r\nContent-Type: application/octet-stream\r\n\r\n'.encode() + audio + b'\r\n')
    parts.append(f'--{boundary}--\r\n'.encode())
    req.data = b''.join(parts)
    req.add_header('xi-api-key', os.environ['ELEVENLABS_API_KEY'])
    req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
    with urllib.request.urlopen(req, timeout=600) as r:
        stt = json.loads(r.read())
    words = [w for w in stt['words'] if w['type'] == 'word' and _norm(w['text'])]
    toks = [_norm(w['text']) for w in words]

    def matches(line, frm):
        target = [_norm(w) for w in re.sub(r'\[[a-z ]+\]', '', line).split() if _norm(w)]
        n = len(target)
        out = []
        for i in range(frm, len(toks) - max(1, n // 2) + 1):
            for m in (n - 1, n, n + 1):
                if m < 1 or i + m > len(toks):
                    continue
                r = difflib.SequenceMatcher(None, target, toks[i:i + m]).ratio()
                if r >= 0.6:
                    out.append((i, i + m, r))
        return out

    cuts, pos = [], 0
    for li, (_, text, _, _) in enumerate(LINES):
        cand = matches(text, pos)
        if not cand:
            raise SystemExit(f'line {li + 1} not found in the recording: {text}')
        best = max(c[2] for c in cand)
        good = [c for c in cand if c[2] >= best - 0.1]
        # the next line's first good take bounds the retakes of this one
        nxt = matches(LINES[li + 1][1], good[0][1]) if li + 1 < len(LINES) else []
        limit = min((c[0] for c in nxt if c[2] >= 0.75), default=len(toks))
        good = [c for c in good if c[0] < limit] or good[:1]
        a, b, r = max(good, key=lambda c: (c[0], c[2]))
        cuts.append((words[a]['start'], words[b - 1]['end']))
        pos = b
        print(f'line {li + 1:2d}  {words[a]["start"]:7.2f}–{words[b - 1]["end"]:7.2f}  match {r:.2f}')
    os.makedirs(VO_DIR, exist_ok=True)
    chain = 'highpass=f=80,afftdn=nf=-28,lowpass=f=12000,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=3,alimiter=limit=0.9'
    for li, (a, b) in enumerate(cuts):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', path, '-ss', f'{max(0, a - 0.12):.3f}', '-to', f'{b + 0.3:.3f}',
                        '-af', chain, '-ac', '1', '-ar', str(SR), os.path.join(VO_DIR, f'l{li + 1:02d}.wav')], check=True)


if __name__ == '__main__':
    if '--recording' in sys.argv:
        import_recording(sys.argv[sys.argv.index('--recording') + 1])
    elif '--no-tts' not in sys.argv:
        build_voice()
    d = build_timeline()
    build_mix(d)
    print('duration', d['duration'])
    for s in d['scenes']:
        print(f"{s['id']:8s} {s['frm']:6.2f} → {s['to']:6.2f}")
