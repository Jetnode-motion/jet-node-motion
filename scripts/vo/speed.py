#!/usr/bin/env python3
"""Speed up a one-take narration and its word alignment together.

usage: python3 scripts/vo/speed.py <in.wav> <in.json> <out.wav> <out.json> <factor>
Pitch is kept (ffmpeg atempo); every from/to in the alignment is divided by the factor.
TrafficNews uses 1.12 to match the pace of the bot welcome video.
"""
import json
import subprocess
import sys

src_wav, src_json, out_wav, out_json, factor = sys.argv[1:6]
f = float(factor)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src_wav, '-filter:a', f'atempo={f}', '-ar', '48000', out_wav], check=True)
lines = json.load(open(src_json))
for line in lines:
    line['from'] /= f
    line['to'] /= f
    for w in line['words']:
        w['from'] /= f
        w['to'] /= f
json.dump(lines, open(out_json, 'w'), ensure_ascii=False, indent=1)
