import {SCENES, at} from './timeline';

/*
 * Sound design from the project library (/mnt/project-files/sfx, see its README for the rules).
 * The files are copied into public/sfx before rendering and are not committed.
 * `at` is when the hit should land; `peak` is where the hit sits inside the file, so the file starts at at − peak.
 * Volumes are linear: 0.25 ≈ −12 dB, 0.2 ≈ −14 dB, 0.125 ≈ −18 dB.
 */
export type Sfx = {file: string; at: number; peak: number; vol: number};

const s = (i: number) => SCENES[i].from;

export const SFX: Sfx[] = [
  // 1. hook: bars drop out one by one, a glitch when the last one goes
  {file: 'pop1.wav', at: at(0, 1.6), peak: 0.01, vol: 0.12},
  {file: 'pop1.wav', at: at(0, 2.4), peak: 0.01, vol: 0.12},
  {file: 'glitch3.wav', at: at(0, 3.2), peak: 0.18, vol: 0.9},
  // scene changes: a whoosh on every push, a heavier one into the punchline, one more into the CTA
  {file: 'swoosh.wav', at: s(1), peak: 0.25, vol: 0.2},
  {file: 'whoosh1.wav', at: s(2), peak: 0.36, vol: 0.55},
  {file: 'swoosh.wav', at: s(3), peak: 0.25, vol: 0.18},
  {file: 'whoosh1.wav', at: s(4), peak: 0.36, vol: 0.55},
  {file: 'whoosh-big.wav', at: s(5), peak: 0.62, vol: 0.22},
  {file: 'swoosh.wav', at: s(6), peak: 0.25, vol: 0.2},
  // 2. counter plate and quarter bars
  {file: 'pop1.wav', at: at(1, 1.4), peak: 0.01, vol: 0.14},
  {file: 'pop1.wav', at: at(1, 4.6), peak: 0.01, vol: 0.12},
  // 3. region grid, then the Ivanovo plate
  {file: 'pop1.wav', at: at(2, 0.6), peak: 0.01, vol: 0.12},
  {file: 'pop1.wav', at: at(2, 3.0), peak: 0.01, vol: 0.12},
  {file: 'pop2.mp3', at: at(2, 5.4), peak: 0.14, vol: 0.3},
  // 4. white list: tap on a blocked row, it refuses
  {file: 'pop1.wav', at: at(3, 0.4), peak: 0.01, vol: 0.12},
  {file: 'click.wav', at: at(3, 5.6), peak: 0.13, vol: 0.25},
  {file: 'glitch.wav', at: at(3, 5.7), peak: 0.14, vol: 0.8},
  // 5. Wi-Fi icon and the two counters
  {file: 'ping3.mp3', at: at(4, 1.4), peak: 0.02, vol: 0.16},
  {file: 'pop1.wav', at: at(4, 5.4), peak: 0.01, vol: 0.14},
  {file: 'pop1.wav', at: at(4, 7.9), peak: 0.01, vol: 0.14},
  // 6 → 7. riser under the punchline, landing on the CTA
  {file: 'rise-up.wav', at: at(6, 0.1), peak: 2.35, vol: 0.18},
  // 7. CTA: «3» pops, the bot button arrives, a tap and a small win
  {file: 'pop2.mp3', at: at(6, 7.0), peak: 0.14, vol: 0.3},
  {file: 'ping3.mp3', at: at(6, 8.6), peak: 0.02, vol: 0.18},
  {file: 'click.wav', at: at(6, 9.6), peak: 0.13, vol: 0.25},
  {file: 'win.wav', at: at(6, 9.75), peak: 0.13, vol: 0.4},
];
