"""«Лифт», part 1 «13 этаж»: a new series on the «Переписка» pipeline (messages1.py), its own script and cues.

usage: ELEVENLABS_API_KEY=... python3 lift1.py [--no-tts | --recording take.m4a]
Writes public/audio/lift1/*, public/audio/lift1.wav and src/compositions/Lift1/timeline.json.
"""
import importlib.util
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('messages1', os.path.join(HERE, 'messages1.py'))
m = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(m)

m.VO_DIR = os.path.join(m.ROOT, 'public', 'audio', 'lift1')
m.OUT_WAV = os.path.join(m.ROOT, 'public', 'audio', 'lift1.wav')
m.OUT_JSON = os.path.join(m.ROOT, 'src', 'compositions', 'Lift1', 'timeline.json')

# (scene, spoken text with v3 tags, caption with *accent*, gap before in s)
m.LINES = [
    ('lift', 'В час ночи я зашёл в лифт и нажал девятый.', 'В час ночи я зашёл в лифт и нажал *девятый.*', 0.25),
    ('lift', 'Двери закрылись. И тут завибрировал телефон.', 'И тут завибрировал *телефон.*', 0.25),
    ('chat', 'Чат нашего дома. Соседка с сорок седьмой: «Кто сейчас в лифте? На камере двое».', '«Кто сейчас в лифте? *На камере двое*»', 0.3),
    ('chat', '[serious] Я был один.', 'Я был *один.*', 0.25),
    ('mirror', 'Я посмотрел в зеркало. Только я. И пустая кабина за спиной.', 'Только я. И *пустая кабина* за спиной.', 0.3),
    ('chat2', '[whispers] Новое сообщение: «Второй стоит прямо за ним. Пусть не оборачивается».', '«Пусть *не оборачивается*»', 0.3),
    ('panel', 'Табло мигнуло. Девять. Десять. Одиннадцать. Лифт ехал выше.', 'Лифт ехал *выше.*', 0.3),
    ('panel', 'Я жал на «стоп». Кнопки не нажимались.', 'Кнопки *не нажимались.*', 0.2),
    ('panel', 'Тринадцать. В нашем доме двенадцать этажей.', 'В нашем доме *двенадцать этажей.*', 0.35),
    ('doors', 'Двери открылись. За ними был тёмный коридор.', 'За ними был *тёмный коридор.*', 0.35),
    ('doors', 'А в конце — мой коврик. Моя дверь. С номером моей квартиры.', 'С номером *моей квартиры.*', 0.25),
    ('chat3', '[quietly] Соседка написала: «Не выходи. Он хочет, чтобы ты вышел первым».', '«Он хочет, чтобы ты *вышел первым*»', 0.3),
    ('shadow', 'Я нажал «закрыть». А на полу, рядом с моей тенью, лежала вторая.', 'Рядом с моей тенью — *вторая.*', 0.35),
    ('last', '[whispers] Она медленно подняла руку. Хотя я свою не поднимал.', 'Хотя я свою *не поднимал.*', 0.4),
    ('end', 'Продолжение — во второй части.', 'Продолжение — во *второй* части', 0.9),
]
# House chat: 'in' messages are «sender|text», shown with the neighbour's name above the bubble.
m.CHAT = [
    (3, 1.2, 'in', 'Ольга, кв. 47|Кто сейчас в лифте? На камере двое'),
    (6, 0.9, 'in', 'Ольга, кв. 47|Второй стоит прямо за ним. Пусть не оборачивается'),
    (12, 1.0, 'in', 'Ольга, кв. 47|Не выходи. Он хочет, чтобы ты вышел первым'),
]
m.PUSH = (3, 5.12, 4.0)  # ~12 s in, Nazar asked for the ad earlier
m.TENSION = ['panel', 'doors', 'chat3', 'shadow', 'last']
m.EERIE = ['lift', 'chat', 'chat2', 'mirror', 'end']


def cues(data, sc, add, out, n):
    lines = data['lines']
    # cabin hum under every scene inside the lift, a door rumble at start and at the 13th floor
    for sid in ['lift', 'mirror', 'panel', 'shadow', 'last']:
        a, b = sc[sid]
        tt = m.T(b - a)
        hum = (np.sin(2 * np.pi * 55 * tt) * 0.5 + np.sin(2 * np.pi * 110 * tt) * 0.25).astype(np.float32)
        add(hum * m.win(len(hum), 0, b - a, 0.3), a, 0.06)
    rumble = m.lp(np.random.default_rng(3).standard_normal(int(m.SR * 1.6)).astype(np.float32), 0.01) * 3
    add(rumble, lines[1]['at'], 0.4)
    add(rumble, lines[9]['at'] - 0.2, 0.5)
    # floor ticks while the display runs past 9, 10, 11 and the ding at 13
    for k in range(3):
        add(m.note(1320, 0.4) * 0.3, lines[6]['at'] + 1.0 + k * 0.75, 0.5)
    add(m.note(988, 1.4) * 0.4, lines[8]['at'] + 0.1, 0.6)
    add(m.note(784, 1.4) * 0.3, lines[8]['at'] + 0.45, 0.6)
    # dead button clicks
    for k in range(4):
        add(m.sfx('click-pop/Щелчок 2.wav'), lines[7]['at'] + 0.9 + k * 0.28, 0.35)
    add(m.sfx('whoosh/Swoosh.wav'), sc['mirror'][0] - 0.2, 0.3)
    add(m.sfx('ping-notify/Ping 3.mp3'), data['push']['at'], 0.3)
    add(m.sfx('glitch/Glitch.wav'), sc['shadow'][0], 0.5)
    add(m.sfx('riser-drop/Rise Up.wav'), sc['last'][0] - 2.35, 0.35)
    add(m.sfx('riser-drop/Drop.wav'), sc['last'][0] + 1.6, 0.5)
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
    print('duration', d['duration'])
    for s in d['scenes']:
        print(f"{s['id']:8s} {s['frm']:6.2f} → {s['to']:6.2f}")
