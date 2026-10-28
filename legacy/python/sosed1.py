"""«Сосед сверху», part 1: the «Переписка» pipeline (messages1.py), its own script and cues.

Nazar asked for it as short as possible, no pauses, pressure from the first second: lines follow
each other with ~0.05 s gaps, the voice is sped up, the end card is short.

usage: ELEVENLABS_API_KEY=... python3 sosed1.py [--no-tts | --recording take.m4a]
Writes public/audio/sosed1/*, public/audio/sosed1.wav and src/compositions/Sosed1/timeline.json.
"""
import importlib.util
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('messages1', os.path.join(HERE, 'messages1.py'))
m = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(m)

m.VO_DIR = os.path.join(m.ROOT, 'public', 'audio', 'sosed1')
m.OUT_WAV = os.path.join(m.ROOT, 'public', 'audio', 'sosed1.wav')
m.OUT_JSON = os.path.join(m.ROOT, 'src', 'compositions', 'Sosed1', 'timeline.json')
m.SPEED = 1.1
m.TAIL = 4.2  # «часть 2» title, then the banner

# (scene, spoken text with v3 tags, caption with *accent*, gap before in s)
m.LINES = [
    ('knock', '[tense] Каждую ночь мне стучат по батарее. Азбукой Морзе. Сверху.', 'Стучат по батарее. *Сверху.*', 0.0),
    ('roof', 'Я живу на последнем этаже. Над нами только крыша.', 'Над нами *только крыша.*', 0.05),
    ('sofa', 'Ровно в два. Каждую ночь.', 'Ровно *в два.*', 0.05),
    ('chat', 'Я записал стук и скинул Диме — он служил связистом.', 'Скинул Диме — он *связист.*', 0.05),
    ('chat', '[serious] Дима ответил: «Это буквы. Холодно. Пусти».', '«*Холодно. Пусти*»', 0.05),
    ('chat2', '«Только не отвечай ему. Слышишь? Не отвечай».', '«*Не отвечай ему*»', 0.05),
    ('answer', 'Но я уже постучал в ответ.', 'Но я уже *постучал в ответ.*', 0.05),
    ('silence', '[whispers] Стук прекратился.', 'Стук *прекратился.*', 0.1),
    ('window', '[whispers] И тут постучали в окно. Девятый этаж.', 'Постучали *в окно.* Девятый этаж.', 0.25),
    ('end', 'Вторая часть — уже скоро.', 'Вторая часть — *скоро*', 0.3),
]
m.CHAT = [
    (4, 1.2, 'out', '🎤 Голосовое · 0:14'),
    (5, 0.6, 'in', 'Это буквы'),
    (5, 1.5, 'in', 'ХОЛОДНО. ПУСТИ'),
    (6, 0.0, 'in', 'Только не отвечай ему'),
]
m.PUSH = (4, 1.77, 3.2)  # ~12 s in, as Nazar asked
m.TENSION = ['knock', 'roof', 'chat2', 'answer', 'silence', 'window']
m.EERIE = ['sofa', 'chat', 'end']


def clank(seed=0, g=1.0):
    """One knock on a cast-iron radiator: inharmonic ring plus a click."""
    tt = m.T(0.5)
    rng = np.random.default_rng(seed)
    ring = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, a, d in [(410, 0.5, 9), (1130, 0.35, 14), (2270, 0.2, 22), (3350, 0.1, 30)])
    click = rng.standard_normal(len(tt)) * np.exp(-tt * 180) * 0.6
    return ((ring + click) * g).astype(np.float32)


# morse of «ХОЛОДНО» as knock gaps: dot = quick pair spacing, dash = long gap
MORSE = '.... --- .-.. --- -.. -. ---'


def morse_knocks(add, t0, gain):
    t = t0
    for i, ch in enumerate(MORSE):
        if ch == ' ':
            t += 0.22
            continue
        add(clank(i, 1.0 if ch == '-' else 0.75), t, gain)
        t += 0.13 if ch == '.' else 0.3
    return t


def cues(data, sc, add, out, n):
    lines = data['lines']
    # cold open: the knocks start on frame one under the voice
    morse_knocks(add, 0.0, 0.5)
    add(m.sfx('riser-drop/Drop.wav'), 0.0, 0.3)
    add(m.sfx('whoosh/Swoosh.wav'), sc['roof'][0] - 0.05, 0.25)
    morse_knocks(add, sc['sofa'][0] + 0.2, 0.35)
    add(m.sfx('ping-notify/Ping 3.mp3'), data['push']['at'], 0.3)
    # his answer: three knocks
    for k in range(3):
        add(clank(20 + k, 1.0), lines[6]['at'] + 0.9 + k * 0.32, 0.6)
    # the silence: the score drops out, only a low hum
    a, b = sc['silence']
    out[int(a * m.SR):int(b * m.SR)] *= 0.35
    # knocks on glass: higher, drier
    for k in range(3):
        tt = m.T(0.25)
        glass = (np.sin(2 * np.pi * 2600 * tt) * np.exp(-tt * 40) + np.random.default_rng(k).standard_normal(len(tt)) * np.exp(-tt * 120) * 0.8).astype(np.float32)
        add(glass, lines[8]['at'] + 1.05 + k * 0.28, 0.7)
    add(m.sfx('riser-drop/Drop.wav'), lines[8]['at'] + 1.0, 0.5)
    add(m.sfx('glitch/Glitch 3.wav'), sc['end'][0], 0.45)
    add(m.sfx('ping-notify/Ping.wav'), sc['end'][0] + 2.0, 0.25)


m.episode_cues = cues

if __name__ == '__main__':
    if '--recording' in sys.argv:
        m.import_recording(sys.argv[sys.argv.index('--recording') + 1])
    elif '--no-tts' not in sys.argv:
        m.build_voice()
    d = m.build_timeline()
    m.build_words(d)
    m.build_mix(d)
    print('duration', d['duration'], 'push', d['push'])
    for i, ln in enumerate(d['lines']):
        print(i + 1, ln['at'], ln['dur'], ln['scene'])
