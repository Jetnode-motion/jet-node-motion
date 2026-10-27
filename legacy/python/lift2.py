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
m.LINES = [
    ('mirror', '[whispers] Я не обернулся. Я смотрел только в зеркало.', 'Я смотрел только *в зеркало.*', 0.25),
    ('mirror', 'Он стоял прямо за мной. С поднятой рукой.', 'С *поднятой рукой.*', 0.25),
    ('panel', 'Двери так и не закрылись. Табло показывало тринадцать.', 'Табло показывало *тринадцать.*', 0.3),
    ('chat', 'Ольга написала: «Он вышел. На камере ты теперь один».', '«На камере ты *теперь один*»', 0.3),
    ('chat', 'Я выдохнул.', 'Я *выдохнул.*', 0.2),
    ('floor', '[serious] Но на полу так и лежали две тени. А человек был один.', 'Две тени. А человек *был один.*', 0.3),
    ('corridor', 'И тогда я увидел: дверь моей квартиры приоткрыта. Там горит свет.', 'Дверь *приоткрыта.* Там горит свет.', 0.35),
    ('corridor', 'Хотя утром я его выключал.', 'Хотя утром я его *выключал.*', 0.2),
    ('chat2', 'Ольга: «Не иди туда. Это не твой этаж».', '«Это *не твой* этаж»', 0.3),
    ('chat2', '[quietly] А потом я вспомнил. В сорок седьмой никто не живёт. Уже три года.', 'В сорок седьмой *никто не живёт.*', 0.3),
    ('cctv', 'Я открыл её профиль. На аватарке — наш лифт. Снято сверху, из угла. Сегодня.', 'На аватарке — *наш лифт.* Сегодня.', 0.35),
    ('cctv', 'На фото я. И он. Совсем рядом.', 'На фото я. *И он.*', 0.25),
    ('chat3', '[whispers] «Ольга печатает…» Одно слово: «Обернись».', '«*Обернись*»', 0.35),
    ('dark', 'И свет в кабине погас.', 'И свет *погас.*', 0.45),
    ('end', 'Продолжение — в третьей части.', 'Продолжение — в *третьей* части', 0.9),
]
m.CHAT = [
    (4, 0.9, 'in', 'Ольга, кв. 47|Он вышел. На камере ты теперь один'),
    (9, 0.6, 'in', 'Ольга, кв. 47|Не иди туда. Это не твой этаж'),
    (13, 1.6, 'in', 'Ольга, кв. 47|Обернись'),
]
# Nazar wants the push about 12 s in (set to land on 12.0 after the voice is built)
m.PUSH = (4, 1.49, 4.0)
m.TENSION = ['panel', 'floor', 'corridor', 'cctv', 'dark']
m.EERIE = ['mirror', 'chat', 'chat2', 'chat3', 'end']


def cues(data, sc, add, out, n):
    lines = data['lines']
    for sid in ['mirror', 'panel', 'chat', 'floor', 'chat2', 'cctv', 'chat3']:
        a, b = sc[sid]
        tt = m.T(b - a)
        hum = (np.sin(2 * np.pi * 55 * tt) * 0.5 + np.sin(2 * np.pi * 110 * tt) * 0.25).astype(np.float32)
        add(hum * m.win(len(hum), 0, b - a, 0.3), a, 0.06)
    # the 13th floor ding still blinking, a door creak down the corridor
    add(m.note(988, 1.4) * 0.3, sc['panel'][0] + 0.3, 0.5)
    creak = m.lp(np.random.default_rng(5).standard_normal(int(m.SR * 1.2)).astype(np.float32), 0.02) * np.sin(2 * np.pi * 3 * m.T(1.2)) * 2
    add(creak.astype(np.float32), lines[6]['at'] + 0.6, 0.35)
    add(m.sfx('camera/Camera Shot.wav'), sc['cctv'][0] + 0.1, 0.4)
    add(m.sfx('whoosh/Swoosh.wav'), sc['mirror'][0], 0.25)
    add(m.sfx('ping-notify/Ping 3.mp3'), data['push']['at'], 0.3)
    add(m.sfx('glitch/Glitch.wav'), sc['floor'][0], 0.45)
    add(m.sfx('riser-drop/Rise Up.wav'), sc['dark'][0] - 2.35, 0.35)
    add(m.sfx('click-pop/Щелчок 3.wav'), sc['dark'][0] + 0.4, 0.6)
    add(m.sfx('riser-drop/Drop.wav'), sc['dark'][0] + 0.45, 0.5)
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
