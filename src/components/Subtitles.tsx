import React from 'react';
import {C, F} from '../style/tokens';
import {eback, eo3, prog} from '../style/ease';

export type Phrase = {from: number; to: number; text: string; size: number};

/** Split "Обходим их в *1 клик*" into words; *…* is one accent group (never wraps inside). */
const tokens = (txt: string) =>
  txt.split('*').flatMap((part, i) =>
    i % 2 === 1 ? [{w: part.trim(), acc: true}] : part.split(/\s+/).filter(Boolean).map((w) => ({w, acc: false}))
  );

const CHAR_STEP = 0.018; // s between letters
const CHAR_DUR = 0.32;

/**
 * Kinetic subtitles. Letters come in one by one from blur to sharp, the
 * freshest letters carry a periwinkle tint (Spotify-concept reference).
 * Accent words are Marck Script with a soft glow and a small overshoot.
 * Exit: the whole phrase blurs out and drifts up.
 */
export const Subtitles: React.FC<{t: number; phrases: Phrase[]; y?: number}> = ({t, phrases, y = 330}) => {
  const ph = phrases.find((p) => t >= p.from && t < p.to);
  if (!ph) return null;
  const outk = eo3(prog(t, ph.to - 0.2, ph.to));
  const toks = tokens(ph.text);
  let ci = 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 75,
        width: 930,
        top: y,
        transform: `translateY(calc(-50% - ${18 * outk}px))`,
        filter: outk > 0 ? `blur(${10 * outk}px)` : undefined,
        opacity: 1 - outk,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'baseline',
        columnGap: ph.size * 0.27,
        rowGap: ph.size * 0.12,
      }}
    >
      {toks.map((tk, j) => {
        if (tk.acc) {
          const st = ph.from + ci * CHAR_STEP + 0.05;
          ci += tk.w.length;
          const e = eo3(prog(t, st, st + 0.4));
          const sc = eback(prog(t, st, st + 0.4), 2.2);
          return (
            <span
              key={j}
              style={{
                display: 'inline-block',
                fontFamily: F.accent,
                fontSize: ph.size * 1.42,
                lineHeight: 1.15,
                color: C.peri,
                textShadow: '0 0 18px rgba(97,115,244,0.45)',
                opacity: e,
                filter: `blur(${8 * (1 - e)}px)`,
                transform: `translateY(${16 * (1 - e)}px) scale(${sc})`,
                marginLeft: 8,
                whiteSpace: 'nowrap',
              }}
            >
              {tk.w}
            </span>
          );
        }
        const chars = Array.from(tk.w);
        return (
          <span key={j} style={{display: 'inline-block', whiteSpace: 'nowrap', fontFamily: F.main, fontWeight: 600, fontSize: ph.size, lineHeight: 1.15}}>
            {chars.map((ch, k) => {
              const st = ph.from + ci * CHAR_STEP;
              ci += 1;
              const e = eo3(prog(t, st, st + CHAR_DUR));
              const tint = 1 - prog(t, st + 0.05, st + 0.45);
              return (
                <span
                  key={k}
                  style={{
                    display: 'inline-block',
                    opacity: e,
                    filter: e < 1 ? `blur(${7 * (1 - e)}px)` : undefined,
                    transform: `translateX(${6 * (1 - e)}px)`,
                    color: tint > 0.01 ? `color-mix(in srgb, ${C.peri} ${Math.round(tint * 100)}%, ${C.ink})` : C.ink,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
};
