import React from 'react';
import {C, F} from '../style/tokens';
import {eback, eo3, prog} from '../style/ease';

export type Phrase = {from: number; to: number; text: string; size: number};

/** Split "Обходим их в *1 клик*" into words; *…* is one accent group (never wraps inside). */
const tokens = (txt: string) =>
  txt.split('*').flatMap((part, i) =>
    i % 2 === 1 ? [{w: part.trim(), acc: true}] : part.split(/\s+/).filter(Boolean).map((w) => ({w, acc: false}))
  );

/**
 * Kinetic subtitles: words rise in one after another, accent words are set in
 * Marck Script (periwinkle, soft glow) with a small overshoot.
 */
export const Subtitles: React.FC<{t: number; phrases: Phrase[]; y?: number}> = ({t, phrases, y = 330}) => {
  const ph = phrases.find((p) => t >= p.from && t < p.to);
  if (!ph) return null;
  const outk = eo3(prog(t, ph.to - 0.16, ph.to));
  const toks = tokens(ph.text);
  return (
    <div
      style={{
        position: 'absolute',
        left: 75,
        width: 930,
        top: y,
        transform: 'translateY(-50%)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'baseline',
        columnGap: ph.size * 0.27,
        rowGap: ph.size * 0.12,
      }}
    >
      {toks.map((tk, j) => {
        const st = ph.from + 0.055 * j + (tk.acc ? 0.05 : 0);
        const e = eo3(prog(t, st, st + 0.32));
        const sc = tk.acc ? eback(prog(t, st, st + 0.35), 2.2) : 1;
        return (
          <span
            key={j}
            style={{
              display: 'inline-block',
              fontFamily: tk.acc ? F.accent : F.main,
              fontWeight: tk.acc ? 400 : 600,
              fontSize: tk.acc ? ph.size * 1.42 : ph.size,
              lineHeight: 1.15,
              color: tk.acc ? C.peri : C.ink,
              textShadow: tk.acc ? '0 0 18px rgba(97,115,244,0.45)' : undefined,
              opacity: e * (1 - outk),
              transform: `translateY(${24 * (1 - e) - 18 * outk}px) scale(${sc})`,
              marginLeft: tk.acc ? 8 : 0,
              whiteSpace: 'nowrap',
            }}
          >
            {tk.w}
          </span>
        );
      })}
    </div>
  );
};
