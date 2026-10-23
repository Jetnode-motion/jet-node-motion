import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {eback, eo3, prog} from '../../style/ease';

/*
 * 2D layers over the 3D scenes, in the reference's language: chunked caps captions with
 * one coloured word, paper notes that type themselves, small pills, stamps and readouts.
 */

export const FONT = '"SF Pro Display", "Inter Display", Inter, Arial, sans-serif';
export const MONO = '"JetBrains Mono", "DejaVu Sans Mono", monospace';
export const HAND = '"Marck Script", cursive';
export const YELLOW = '#FFD23F';
export const RED = '#FF3B30';

export type Line = {at: number; dur: number; scene: string; voice?: string; cap: string};

type Word = {w: string; acc: boolean; at: number};
type Chunk = {words: Word[]; from: number; to: number; red: boolean};

/** Words of a caption with the moment each one is spoken, spread over the line by length. */
const words = (ln: Line): Word[] => {
  const raw: {w: string; acc: boolean}[] = [];
  ln.cap.split(/\s+/).forEach((w) => {
    if (!w) return;
    raw.push({w: w.replace(/\*/g, ''), acc: w.includes('*')});
  });
  const weight = raw.map((r) => r.w.length + 2);
  const sum = weight.reduce((a, b) => a + b, 0);
  let acc = 0;
  return raw.map((r, i) => {
    const at = ln.at + (acc / sum) * ln.dur;
    acc += weight[i];
    return {...r, at};
  });
};

/** Split every line into chunks of at most 3 words / 18 letters, the way the reference cuts them. */
export const buildChunks = (lines: Line[], redScenes: string[]): Chunk[] => {
  const out: Chunk[] = [];
  lines.forEach((ln, li) => {
    const ws = words(ln);
    const end = li + 1 < lines.length ? Math.min(lines[li + 1].at, ln.at + ln.dur + 0.5) : ln.at + ln.dur + 0.6;
    let cur: Word[] = [];
    const flush = () => {
      if (cur.length) out.push({words: cur, from: cur[0].at, to: 0, red: redScenes.includes(ln.scene)});
      cur = [];
    };
    ws.forEach((w) => {
      const len = cur.reduce((a, c) => a + c.w.length + 1, 0) + w.w.length;
      if (cur.length >= 3 || (cur.length && len > 18)) flush();
      cur.push(w);
      if (/[.,!?:»—]$/.test(w.w) && cur.length >= 2) flush();
    });
    flush();
    const first = out.findIndex((c) => c.from >= ln.at - 1e-6 && c.words[0] === ws[0]);
    for (let i = first; i < out.length; i++) out[i].to = i + 1 < out.length ? out[i + 1].from : end;
  });
  return out;
};

/** Captions: the chunk pops in, unspoken words wait in grey, the accent word gets colour. */
export const Captions: React.FC<{t: number; chunks: Chunk[]; y?: number}> = ({t, chunks, y = 1190}) => {
  const ch = chunks.find((c) => t >= c.from && t < c.to);
  if (!ch) return null;
  const k = eback(prog(t, ch.from, ch.from + 0.18), 2);
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        right: 90,
        top: y,
        transform: `translateY(-50%) scale(${0.9 + 0.1 * k})`,
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 72,
        lineHeight: 1.05,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        WebkitTextStroke: '2px rgba(0,0,0,0.35)',
        textShadow: '0 4px 0 rgba(0,0,0,0.55), 0 0 30px rgba(0,0,0,0.6)',
      }}
    >
      {ch.words.map((w, i) => {
        const said = t >= w.at - 0.05;
        const color = !said ? 'rgba(255,255,255,0.42)' : w.acc ? (ch.red ? RED : YELLOW) : '#FFFFFF';
        return (
          <span key={i} style={{color}}>
            {w.w}
            {i < ch.words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </div>
  );
};

/** Small rounded label, like «−20° НА СКЛАДЕ». */
export const Pill: React.FC<{t: number; at: number; until?: number; x: number; y: number; text: string; bg?: string; fg?: string; size?: number}> = ({
  t,
  at,
  until = 1e9,
  x,
  y,
  text,
  bg = '#3D6FD8',
  fg = '#fff',
  size = 30,
}) => {
  if (t < at || t > until) return null;
  const k = eback(prog(t, at, at + 0.3), 2);
  const o = 1 - prog(t, until - 0.2, until);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${k})`,
        opacity: o,
        background: bg,
        color: fg,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        textTransform: 'uppercase',
        padding: `${size * 0.28}px ${size * 0.7}px`,
        borderRadius: 999,
        whiteSpace: 'nowrap',
        boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
      }}
    >
      {text}
    </div>
  );
};

/** Rubber stamp that slams in at a slight angle. */
export const Stamp: React.FC<{t: number; at: number; x: number; y: number; text: string; color?: string; rot?: number; size?: number; until?: number}> = ({
  t,
  at,
  until = 1e9,
  x,
  y,
  text,
  color = RED,
  rot = -6,
  size = 52,
}) => {
  if (t < at || t >= until) return null;
  const k = prog(t, at, at + 0.16);
  const s = 1.8 - 0.8 * eo3(k);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`,
        opacity: k,
        border: `6px solid ${color}`,
        color,
        background: 'rgba(240,232,215,0.92)',
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        padding: '6px 26px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      }}
    >
      {text}
    </div>
  );
};

/** Torn paper tag at the top: «ПОЛЯРНАЯ-7 · ЧАСТЬ 1». */
export const TopTag: React.FC<{t: number; until: number; title: string; sub: string}> = ({t, until, title, sub}) => {
  if (t > until) return null;
  const k = eo3(prog(t, 0, 0.4));
  const o = 1 - prog(t, until - 0.3, until);
  return (
    <div
      style={{
        position: 'absolute',
        top: 210,
        left: '50%',
        transform: `translate(-50%, ${-30 * (1 - k)}px) rotate(-2deg)`,
        opacity: o,
        background: '#ECE4D2',
        padding: '14px 40px 10px',
        textAlign: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 54, color: '#222', letterSpacing: 2}}>{title}</div>
      <div style={{fontFamily: MONO, fontSize: 22, color: '#666', letterSpacing: 4}}>{sub}</div>
    </div>
  );
};

/** A paper card whose lines type themselves; `hand` lines are written in red ink. */
export type NoteLine = {at: number; text: string; hand?: boolean; red?: boolean; blur?: boolean};
export const PaperNote: React.FC<{t: number; at: number; x?: number; y: number; w?: number; header?: string; lines: NoteLine[]; cps?: number; rot?: number; scale?: number; until?: number}> = ({
  t,
  at,
  until = 1e9,
  x = 540,
  y,
  w = 860,
  header,
  lines,
  cps = 26,
  rot = -1,
  scale = 1,
}) => {
  if (t < at || t >= until) return null;
  const k = eo3(prog(t, at, at + 0.35)) * (1 - prog(t, until - 0.2, until));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        transform: `translate(-50%, ${-40 * (1 - k)}px) rotate(${rot}deg) scale(${scale})`,
        transformOrigin: 'top center',
        opacity: k,
        background: 'linear-gradient(180deg, #F1EADA, #E4DAC4)',
        padding: '22px 34px 26px',
        boxShadow: '0 14px 40px rgba(0,0,0,0.55)',
      }}
    >
      {header && (
        <div style={{fontFamily: MONO, fontSize: 22, color: '#8A7F6C', letterSpacing: 2, borderBottom: '2px solid #CFC3AA', paddingBottom: 8, marginBottom: 12}}>
          {header}
        </div>
      )}
      {lines.map((ln, i) => {
        if (t < ln.at) return null;
        const n = ln.hand ? Math.floor((t - ln.at) * cps * 0.6) : Math.floor((t - ln.at) * cps);
        const shown = Array.from(ln.text).slice(0, n).join('');
        return (
          <div
            key={i}
            style={{
              fontFamily: ln.hand ? HAND : MONO,
              fontSize: ln.hand ? 50 : 32,
              lineHeight: ln.hand ? 1.2 : 1.45,
              color: ln.red || ln.hand ? '#B3261E' : '#2A2622',
              transform: ln.hand ? 'rotate(-2deg)' : undefined,
              whiteSpace: 'pre-wrap',
              filter: ln.blur ? 'blur(9px)' : undefined,
            }}
          >
            {shown}
            {!ln.hand && n < ln.text.length && <span style={{opacity: Math.floor(t * 4) % 2 ? 1 : 0}}>▌</span>}
          </div>
        );
      })}
    </div>
  );
};

/** Little dark chip with a number, like the reference's «31,0». */
export const Readout: React.FC<{t: number; at: number; x: number; y: number; label: string; value: string; color?: string; until?: number}> = ({t, at, x, y, label, value, color = '#FF6B4A', until = 1e9}) => {
  if (t < at || t >= until) return null;
  const k = eo3(prog(t, at, at + 0.3));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity: k,
        transform: `translateY(${12 * (1 - k)}px)`,
        background: 'rgba(10,10,14,0.82)',
        border: '2px solid rgba(255,255,255,0.18)',
        borderRadius: 12,
        padding: '8px 18px',
        fontFamily: MONO,
        fontSize: 30,
        color: '#ddd',
      }}
    >
      <span style={{color: '#888', fontSize: 22, marginRight: 10}}>{label}</span>
      <span style={{color, fontWeight: 700}}>{value}</span>
    </div>
  );
};

/** Vignette and a light flicker, over everything 3D. */
export const Vignette: React.FC<{strength?: number}> = ({strength = 0.75}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

/** RGB-split glitch bars for hard cuts (the reference uses them on the radio lines). */
export const Glitch: React.FC<{t: number; at: number; dur?: number}> = ({t, at, dur = 0.25}) => {
  if (t < at || t > at + dur) return null;
  const f = Math.floor((t - at) * 30);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {[0, 1, 2].map((i) => {
        const y = ((f * 37 + i * 211) % 1600) + 100;
        return <div key={i} style={{position: 'absolute', left: 0, right: 0, top: y, height: 6 + ((f + i) % 3) * 6, background: i % 2 ? 'rgba(255,40,60,0.55)' : 'rgba(40,200,255,0.5)'}} />;
      })}
    </AbsoluteFill>
  );
};

/**
 * The JetnodeVPN banner: the real bot banner on a dark card with the «Реклама» mark.
 * `variant="end"` adds the call to subscribe for part 2.
 */
export const BannerCard: React.FC<{t: number; d: number; variant: 'mid' | 'end'; series?: string; next?: number}> = ({t, d, variant, series = 'ПОЛЯРНАЯ-7', next = 2}) => {
  const k = eback(prog(t, 0.05, 0.6), 1.4);
  const o = 1 - prog(t, d - 0.3, d);
  const glow = 0.5 + 0.5 * Math.sin(t * 2.4);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #0E1E46 0%, #050B1E 70%)', opacity: o}}>
      <div style={{position: 'absolute', top: 250, width: '100%', textAlign: 'center', fontFamily: MONO, fontSize: 26, letterSpacing: 6, color: '#7F93C8'}}>
        {variant === 'mid' ? `ПАУЗА · ${series} ВЕРНЁТСЯ` : `${series} · ЧАСТЬ ${next} СКОРО`}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          top: 420,
          transform: `scale(${k}) rotate(${-1.5 + 1.5 * eo3(prog(t, 0, 0.8))}deg)`,
          borderRadius: 34,
          overflow: 'hidden',
          boxShadow: `0 30px 90px rgba(0,0,0,0.6), 0 0 ${60 + 40 * glow}px rgba(75,129,243,${0.35 + 0.2 * glow})`,
        }}
      >
        <Img src={staticFile('bot/banner-trial.png')} style={{width: '100%', display: 'block'}} />
      </div>
      <div style={{position: 'absolute', top: 990, width: '100%', textAlign: 'center', opacity: eo3(prog(t, 0.5, 0.9))}}>
        <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 64, color: '#fff'}}>JetnodeVPN</div>
        <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 38, color: '#B1DBFF', marginTop: 10}}>работает даже по белым спискам</div>
        <div
          style={{
            display: 'inline-block',
            marginTop: 34,
            background: 'linear-gradient(90deg, #2970F7, #4787F3)',
            color: '#fff',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 40,
            padding: '20px 54px',
            borderRadius: 999,
            transform: `scale(${1 + 0.03 * glow})`,
            boxShadow: '0 10px 40px rgba(41,112,247,0.5)',
          }}
        >
          3 дня бесплатно · ссылка в профиле
        </div>
        {variant === 'end' && (
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 36, color: '#fff', marginTop: 46, opacity: eo3(prog(t, 1.2, 1.6))}}>
            Подпишись, чтобы не пропустить {next} часть
          </div>
        )}
      </div>
      <div style={{position: 'absolute', right: 90, top: 380, fontFamily: FONT, fontSize: 22, color: 'rgba(255,255,255,0.55)'}}>Реклама</div>
    </AbsoluteFill>
  );
};
