"""Voice-over with ElevenLabs as ONE take: the whole script goes in a single eleven_v3 request, so
intonation and breathing run on like a person telling a story instead of nine stitched reads.
Saves story.wav plus story.json: per line, its start/end in the audio and word timings
(from the character alignment), used to time scenes and captions.

  ELEVENLABS_API_KEY=... python3 scripts/vo/elevenlabs_story.py scripts/vo/lines-yandex-dc.json public/audio/yandex-dc [voice_id]
"""
import base64, json, os, re, subprocess, sys, urllib.request

lines = json.load(open(sys.argv[1], encoding='utf-8'))
out = sys.argv[2]
voice = sys.argv[3] if len(sys.argv) > 3 else os.environ.get('ELEVENLABS_VOICE', 'nPczCjzI2devNBz1zQrb')  # Brian: calm, low
key = os.environ['ELEVENLABS_API_KEY']
os.makedirs(out, exist_ok=True)

SEP = '\n\n'  # a paragraph break gives a natural breath between scenes
text = SEP.join(lines)
body = {
    'text': text,
    'model_id': 'eleven_v3',
    'language_code': 'ru',
    'voice_settings': {'stability': 0.5, 'similarity_boost': 0.8, 'style': 0.0, 'use_speaker_boost': True},
}
req = urllib.request.Request(
    f'https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128',
    data=json.dumps(body).encode(), headers={'xi-api-key': key, 'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as r:
    res = json.load(r)
mp3 = f'{out}/story.mp3'
open(mp3, 'wb').write(base64.b64decode(res['audio_base64']))
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', mp3, '-ar', '48000', f'{out}/story.wav'], check=True)
os.remove(mp3)

al = res['alignment']  # timings for the exact text we sent
chars, st, en = al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']
assert ''.join(chars) == text, 'alignment does not match the sent text'

result, pos = [], 0
for line in lines:
    words = [{'text': m.group(), 'from': st[pos + m.start()], 'to': en[pos + m.end() - 1]}
             for m in re.finditer(r'\S+', line)]
    result.append({'text': line, 'from': words[0]['from'], 'to': words[-1]['to'], 'words': words})
    pos += len(line) + len(SEP)
json.dump(result, open(f'{out}/story.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for i, l in enumerate(result):
    print(f"line {i + 1}: {l['from']:.2f}–{l['to']:.2f}")
