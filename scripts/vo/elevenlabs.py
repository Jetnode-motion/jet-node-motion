"""Voice-over with ElevenLabs: one request per line, stitched with previous/next text so the
intonation runs on as one story instead of nine separate reads. Saves line WAVs plus character
timings (used to time captions word by word).

  ELEVENLABS_API_KEY=... python3 scripts/vo/elevenlabs.py scripts/vo/lines-yandex-dc.json public/audio/yandex-dc [voice_id]
"""
import base64, json, os, subprocess, sys, urllib.request

lines = json.load(open(sys.argv[1], encoding='utf-8'))
out = sys.argv[2]
voice = sys.argv[3] if len(sys.argv) > 3 else os.environ.get('ELEVENLABS_VOICE', 'JBFqnCBsd6RMkjVDRZzb')
key = os.environ['ELEVENLABS_API_KEY']
os.makedirs(out, exist_ok=True)

prev_ids = []
for i, text in enumerate(lines):
    body = {
        'text': text,
        'model_id': 'eleven_multilingual_v2',
        'language_code': 'ru',
        # lower stability = livelier, less "announcer" read; style kept low so it stays calm
        'voice_settings': {'stability': 0.38, 'similarity_boost': 0.8, 'style': 0.25, 'use_speaker_boost': True, 'speed': 1.0},
        'previous_text': ' '.join(lines[max(0, i - 2):i]) or None,
        'next_text': lines[i + 1] if i + 1 < len(lines) else None,
        'previous_request_ids': prev_ids[-3:],
    }
    req = urllib.request.Request(
        f'https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_192',
        data=json.dumps(body).encode(), headers={'xi-api-key': key, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        rid = r.headers.get('request-id')
        res = json.load(r)
    if rid:
        prev_ids.append(rid)
    mp3 = f'{out}/l{i + 1}.mp3'
    open(mp3, 'wb').write(base64.b64decode(res['audio_base64']))
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', mp3, '-ar', '48000', f'{out}/l{i + 1}.wav'], check=True)
    os.remove(mp3)
    json.dump({'text': text, 'alignment': res.get('normalized_alignment') or res['alignment']},
              open(f'{out}/l{i + 1}.json', 'w', encoding='utf-8'), ensure_ascii=False)
    print('line', i + 1, 'ok')
