"""«Лифт», part 2 «Вторая тень»: the «Переписка» pipeline (messages1.py) with this episode's script and cues.

usage: ELEVENLABS_API_KEY=... python3 lift2.py [--no-tts | --recording take.m4a]
Writes public/audio/lift2/*, public/audio/lift2.wav and src/compositions/Lift2/timeline.json.
"""
import importlib.util
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('messages1', os.path.join(HERE, 'messages1.py'))
m = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(m)

m.VO_DIR = os.path.join(m.ROOT, 'public', 'audio', 'lift2')
m.OUT_WAV = os.path.join(m.ROOT, 'public', 'audio', 'lift2.wav')
m.OUT_JSON = os.path.join(m.ROOT, 'src', 'compositions', 'Lift2', 'timeline.json')

# (scene, spoken text with v3 tags, caption with *accent*, gap before in s)
# v2: cold open on the scariest fact (Nazar: retention was 50%, avg 39 s), voice from the first frame,
# one shot per line, ~45 s.
m.LINES = [
    ('cctv', 'Эту фотку мне прислала соседка из сорок седьмой. Только в сорок седьмой никто не живёт.', 'В сорок седьмой *никто не живёт.*', 0.0),
    ('mirror', 'Час ночи. Лифт застрял на тринадцатом. В нашем доме их двенадцать.', 'В нашем доме *их двенадцать.*', 0.2),
    ('mirror2', '[whispers] В зеркале за моей спиной стоял он. С поднятой рукой.', 'За моей спиной *стоял он.*', 0.2),
    ('chat', 'Соседка пишет: «Он вышел. На камере ты один».', '«На камере *ты один*»', 0.2),
    ('floor', '[serious] Но на полу — две тени. А человек один.', 'Две тени. А человек *один.*', 0.2),
    ('corridor', 'В конце коридора — моя квартира. Дверь открыта. Горит свет.', 'Дверь открыта. *Горит свет.*', 0.25),
    ('wide', 'Хотя утром я его выключал.', 'Хотя утром я его *выключал.*', 0.15),
    ('chat2', '«Не иди туда. Это не твой этаж».', '«Это *не твой* этаж»', 0.2),
    ('close', '[quietly] Я открыл её профиль. На аватарке — наш лифт. Снято сегодня.', 'На аватарке — *наш лифт.*', 0.2),
    ('cctv2', 'На фото я. И он. Вплотную.', 'На фото я. *И он.*', 0.2),
    ('chat3', '[whispers] Новое сообщение. Одно слово: «Обернись».', '«*Обернись*»', 0.25),
    ('dark', 'И свет погас.', 'И свет *погас.*', 0.35),
    ('end', 'Что было дальше — в третьей части.', 'Дальше — в *третьей* части', 0.8),
]
m.CHAT = [
    (4, 0.7, 'in', 'Ольга, кв. 47|Он вышел. На камере ты один'),
    (8, 0.1, 'in', 'Ольга, кв. 47|Не иди туда. Это не твой этаж'),
    (11, 1.4, 'in', 'Ольга, кв. 47|Обернись'),
]
# Nazar wants the push about 12 s in (offset set after the voice is built)
m.PUSH = (3, 1.44, 4.0)
m.TENSION = ['mirror2', 'floor', 'corridor', 'cctv2', 'dark']
m.EERIE = ['cctv', 'mirror', 'chat', 'wide', 'chat2', 'close', 'chat3', 'end']


def cues(data, sc, add, out, n):
    lines = data['lines']
    for sid in ['mirror', 'mirror2', 'chat', 'floor', 'wide', 'chat2', 'close', 'chat3']:
        a, b = sc[sid]
        tt = m.T(b - a)
        hum = (np.sin(2 * np.pi * 55 * tt) * 0.5 + np.sin(2 * np.pi * 110 * tt) * 0.25).astype(np.float32)
        add(hum * m.win(len(hum), 0, b - a, 0.3), a, 0.06)
    # cold open: a shutter and a low hit on frame one
    add(m.sfx('camera/Camera Shot.wav'), 0.0, 0.45)
    add(m.sfx('riser-drop/Drop.wav'), 0.05, 0.3)
    add(m.note(988, 1.4) * 0.3, sc['mirror'][0] + 0.3, 0.5)
    creak = m.lp(np.random.default_rng(5).standard_normal(int(m.SR * 1.2)).astype(np.float32), 0.02) * np.sin(2 * np.pi * 3 * m.T(1.2)) * 2
    add(creak.astype(np.float32), lines[5]['at'] + 0.6, 0.35)
    add(m.sfx('camera/Camera Shot.wav'), sc['cctv2'][0] + 0.05, 0.4)
    for sid in ['mirror2', 'corridor', 'close']:
        add(m.sfx('whoosh/Swoosh.wav'), sc[sid][0] - 0.1, 0.22)
    add(m.sfx('ping-notify/Ping 3.mp3'), data['push']['at'], 0.3)
    add(m.sfx('glitch/Glitch.wav'), sc['floor'][0], 0.45)
    add(m.sfx('riser-drop/Rise Up.wav'), sc['dark'][0] - 2.35, 0.35)
    add(m.sfx('click-pop/Щелчок 3.wav'), sc['dark'][0] + 0.3, 0.6)
    add(m.sfx('riser-drop/Drop.wav'), sc['dark'][0] + 0.35, 0.5)
    add(m.sfx('glitch/Glitch 3.wav'), sc['end'][0], 0.5)
    add(m.sfx('ping-notify/Ping.wav'), sc['end'][0] + 3.4, 0.25)


m.episode_cues = cues

if __name__ == '__main__':
    if '--recording' in sys.argv:
        m.import_recording(sys.argv[sys.argv.index('--recording') + 1])
    elif '--no-tts' not in sys.argv:
        m.build_voice()
    d = m.build_timeline()
    m.build_mix(d)
    print('duration', d['duration'], 'push', d['push'])
    for i, ln in enumerate(d['lines'][:5]):
        print(i + 1, ln['at'], ln['dur'])
    for s in d['scenes']:
        print(f"{s['id']:8s} {s['frm']:6.2f} → {s['to']:6.2f}")
