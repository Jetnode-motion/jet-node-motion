import {VO_END, VO_LINES, VO_OFFSET, VO_SUBS} from './vo';

/*
 * Story, explained to a friend (news: Vedomosti from Ministry of Digital Development data, 06.10.2026):
 * for the first time mobile traffic in Russia went down → −6% in Q2, second quarter in a row (Q1 −7.8%) →
 * down in three regions out of four, Ivanovo −31% → the reason: restrictions and white lists →
 * people moved to Wi-Fi and calls: fixed traffic +55%, calls +27% → mobile internet is less and less mobile →
 * Jetnode VPN, 3 days free in the bot.
 *
 * Mixed style (style-guide.md → «Пересечение стилей»): blue glass for the hook and the CTA,
 * Shell for the explanation, one Night scene for the punchline.
 */

export type Bg = 'glass' | 'shell' | 'night';
type Zoom = {t: number; s: number; x: number; y: number; d?: number};
export type Scene = {from: number; to: number; bg: Bg; zooms: Zoom[]; out?: 'blur' | 'zoom'};

const BG: Bg[] = ['glass', 'shell', 'shell', 'shell', 'shell', 'night', 'glass'];
const ZOOMS: Zoom[][] = [
  [{t: 1.0, s: 1.08, x: 540, y: 980, d: 2.4}],
  [
    {t: 1.3, s: 1.12, x: 540, y: 640},
    {t: 4.4, s: 1, x: 540, y: 900, d: 0.5},
  ],
  [{t: 3.3, s: 1.1, x: 540, y: 1000}],
  [{t: 6.6, s: 1.12, x: 540, y: 760, d: 0.5}],
  [
    {t: 5.4, s: 1.1, x: 300, y: 1030},
    {t: 8.6, s: 1.1, x: 780, y: 1030, d: 0.5},
  ],
  [],
  [{t: 6.6, s: 1.06, x: 540, y: 1000, d: 0.6}],
];
const OUT: (Scene['out'] | undefined)[] = [undefined, undefined, undefined, undefined, 'zoom', undefined, undefined];

/** Scenes start a breath before their spoken line and run until the next one. */
export const SCENES: Scene[] = VO_LINES.map((l, i) => ({
  from: i === 0 ? 0 : l.from - 0.2,
  to: i + 1 < VO_LINES.length ? VO_LINES[i + 1].from - 0.2 : VO_END,
  bg: BG[i],
  zooms: ZOOMS[i],
  out: OUT[i],
}));

/*
 * Pace matched to the bot welcome video (design/jetnodevpn-bot-menu/welcome-video, v4): the narration is
 * sped up 1.12× (atempo) and scene animations are designed in "design seconds" that run SPEED× faster,
 * scenes change with an expo push (like its scroll transitions), elements fly in with expo/back eases and
 * a glow flashes on the key beats.
 */
export const SPEED = 1.12;
/** half-length of the push transition between scenes */
export const XF = 0.45;
/** design time inside scene i → composition time */
export const at = (i: number, lt: number) => SCENES[i].from + lt / SPEED;
/** glow flashes on key beats: [scene, design time] */
export const BEATS: [number, number][] = [
  [0, 3.2],
  [1, 2.5],
  [2, 5.45],
  [3, 5.65],
  [4, 6.2],
  [4, 8.7],
  [5, 0.4],
  [6, 7.05],
  [6, 9.65],
];
export const DURATION = VO_END;
export {VO_OFFSET};
export const SUBS = VO_SUBS;

/** Scene index at composition time t. */
export const sceneAt = (t: number) => {
  let i = 0;
  while (i < SCENES.length - 1 && t >= SCENES[i + 1].from) i++;
  return i;
};
