"""«Переписка», part 2 «Твоя очередь»: same pipeline as part 1 (messages1.py), its own script and cues.

usage: ELEVENLABS_API_KEY=... python3 messages2.py [--no-tts | --recording take.m4a]
Writes public/audio/messages2/*, public/audio/messages2.wav and src/compositions/Messages2/timeline.json.
"""
import importlib.util
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('messages1', os.path.join(HERE, 'messages1.py'))
m = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(m)

m.VO_DIR = os.path.join(m.ROOT, 'public', 'audio', 'messages2')
m.OUT_WAV = os.path.join(m.ROOT, 'public', 'audio', 'messages2.wav')
m.OUT_JSON = os.path.join(m.ROOT, 'src', 'compositions', 'Messages2', 'timeline.json')

# (scene, spoken text with v3 tags, caption with *accent*, gap before in s)
m.LINES = [
    ('reread', '[quietly] «Я не успел. Теперь твоя очередь писать». Я перечитал это раз десять.', 'Я перечитал это *раз десять.*', 0.25),
    ('quiet', 'За дверью стало тихо. Слишком тихо.', 'За дверью стало тихо. *Слишком тихо.*', 0.3),
    ('chat', 'Под сообщением появилась серая строчка: «Ответ уйдёт на десять минут назад».', '«Ответ уйдёт *на 10 минут назад*»', 0.3),
    ('chat', 'Десять минут назад я ещё спал.', 'Десять минут назад я ещё *спал.*', 0.2),
    ('chat', 'Я начал печатать — и остановился.', 'Я начал печатать — и *остановился.*', 0.2),
    ('chat', '[serious] Я ведь не открыл дверь. Значит, тот, кто писал мне, — открыл.', 'Я не открыл дверь. Значит, тот, кто писал мне, — *открыл.*', 0.25),
    ('prints', 'И тут я увидел на полу мокрые следы. От двери — в мою комнату.', 'Мокрые следы. От двери — *в мою комнату.*', 0.35),
    ('prints', 'Босые. А тапки дяди Коли стояли у порога.', 'Босые. А тапки дяди Коли *стояли у порога.*', 0.25),
    ('roomdoor', 'Из комнаты донеслась вибрация. Мой телефон. Но он был у меня в руке.', 'Мой телефон. Но он был *у меня в руке.*', 0.3),
    ('bedroom', '[whispers] Я заглянул. На кровати спал я. А рядом светился телефон.', 'На кровати *спал я.* А рядом светился телефон.', 0.3),
    ('bedroom', 'Строчка в чате мигала: одна минута.', 'Строчка в чате мигала: *одна минута.*', 0.25),
    ('send', 'Я напечатал то самое: «Не открывай дверь. Это не я». И нажал «отправить».', '«Не открывай дверь. *Это не я*»', 0.3),
    ('wake', 'Телефон на кровати завибрировал. Тот я открыл глаза.', 'Тот я *открыл глаза.*', 0.3),
    ('behind', '[whispers] А за моей спиной кто-то тихо спросил: «Соль не одолжишь?»', '«Соль *не одолжишь?*»', 0.45),
    ('end', 'Продолжение — в третьей части.', 'Продолжение — в *третьей* части', 0.9),
]
# Messenger: the end of part 1 is already on screen, then the «10 minutes back» notice and his reply.
m.CHAT = [
    (1, -0.25, 'in', 'Я не успел.'),
    (1, -0.24, 'in', 'Теперь твоя очередь писать.'),
    (3, 0.5, 'sys', 'Ответ уйдёт на 10 минут назад'),
    (11, 0.3, 'sys', 'Осталось 00:01'),
    (12, 1.4, 'out', 'Не открывай дверь.'),
    (12, 2.1, 'out', 'Это не я.'),
]
m.PUSH = (9, 0.3, 4.0)
m.TENSION = ['quiet', 'prints', 'roomdoor', 'bedroom', 'wake']
m.EERIE = ['reread', 'chat', 'send', 'end']


def cues(data, sc, add, out, n):
    lines = data['lines']
    add(m.sfx('whoosh/Swoosh.wav'), sc['chat'][0] - 0.2, 0.3)
    # vibration from the other room, muffled
    buzz = (np.sign(np.sin(2 * np.pi * 150 * m.T(0.6))) * 0.15 * (np.sin(2 * np.pi * 9 * m.T(0.6)) > 0)).astype(np.float32)
    buzz = m.lp(m.lp(buzz, 0.05), 0.05) * 6
    for k in range(3):
        add(buzz, lines[8]['at'] + 0.2 + k * 0.9, 0.5)
    # drips on the wet prints
    drip = m.note(1800, 0.25) * 0.2
    a, b = sc['prints']
    for x in np.arange(a + 0.4, b, 0.9):
        add(drip, x, 0.6)
    add(m.sfx('glitch/Glitch.wav'), sc['bedroom'][0], 0.5)
    add(m.sfx('ping-notify/Ping 3.mp3'), data['push']['at'], 0.3)
    add(m.sfx('riser-drop/Rise Up.wav'), sc['behind'][0] - 2.35, 0.35)
    add(m.sfx('riser-drop/Drop.wav'), sc['behind'][0], 0.5)
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
