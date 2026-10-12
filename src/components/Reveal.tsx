import React from 'react';
import {C, F} from '../style/tokens';
import {clamp, eback, eo3, lerp, prog} from '../style/ease';

/*
 * Plate animations taken from the Privata VPN reference and moved into our light style
 * (knowledge-base/style-guide.md → «Референсы»):
 *  - plates come in one by one in reading order, 2–3 frames apart, from a translucent grey to full colour;
 *  - after they land they keep living: graphs draw, status lights blink, pulses run along lines;
 *  - state changes recolour the plate and swap the status label together, badges pop with a small overshoot;
 *  - headlines slide up line by line from under a mask, a short accent dash draws first.
 */

/** Start time of item i in a cascade. Default step = 2 frames at 30 fps. */
export const cascade = (t0: number, i: number, step = 0.067) => t0 + i * step;

/** Light card in our style: white → faint periwinkle, tinted edge stroke, light corner, soft shadow. */
export const Card: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  t: number;
  t0: number;
  radius?: number;
  /** 0..1 how "alive" the card is; below 1 it greys out (used for blocked or inactive states) */
  live?: number;
  glow?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({x, y, w, h, t, t0, radius = 30, live = 1, glow = 0, style, children}) => {
  if (t < t0) return null;
  const k = eo3(prog(t, t0, t0 + 0.18));
  const grey = 1 - k;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: radius,
        opacity: lerp(0.35, 1, k),
        transform: `scale(${lerp(0.975, 1, k)})`,
        filter: grey > 0.02 ? `grayscale(${grey}) blur(${3 * grey}px)` : undefined,
        background: grey > 0.02 ? `color-mix(in srgb, #C9C9D2 ${Math.round(grey * 100)}%, #FFFFFF)` : 'linear-gradient(160deg, #FFFFFF 0%, #F7F7FF 100%)',
        boxShadow: [
          `0 ${h * 0.1}px ${h * 0.3}px rgba(40,40,90,${0.09 * k})`,
          `0 2px 6px rgba(40,40,90,${0.05 * k})`,
          `0 0 ${28 * glow}px rgba(97,115,244,${0.35 * glow})`,
          'inset 0 0 18px rgba(255,255,255,0.9)',
        ].join(','),
        ...style,
      }}
    >
      {/* light corner */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          background: `radial-gradient(circle at 0% 0%, rgba(97,115,244,${0.07 * k}) 0%, rgba(97,115,244,0) ${Math.max(w, h) * 0.6}px)`,
        }}
      />
      {/* tinted edge: bright top-left, fading bottom-right */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          padding: 2,
          background: `linear-gradient(135deg, rgba(97,115,244,${0.32 * k + 0.25 * glow}) 0%, rgba(97,115,244,0.04) 65%)`,
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: lerp(0.45, 1, live),
          filter: live < 0.98 ? `grayscale(${0.7 * (1 - live)})` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Text with *accent* groups set in Marck Script. */
export const RichLine: React.FC<{text: string; size: number; weight: number; color?: string}> = ({text, size, weight, color = C.ink}) => {
  const parts = text.split('*');
  return (
    <span style={{display: 'inline-flex', alignItems: 'baseline', gap: size * 0.26, whiteSpace: 'nowrap', fontFamily: F.main, fontSize: size, fontWeight: weight, color, letterSpacing: -0.5}}>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} style={{fontFamily: F.accent, fontWeight: 400, fontSize: size * 1.36, color: C.peri, textShadow: '0 0 20px rgba(97,115,244,0.40)', letterSpacing: 0, lineHeight: 1}}>
            {p}
          </span>
        ) : p.trim() ? (
          <span key={i}>{p.trim()}</span>
        ) : null
      )}
    </span>
  );
};

export type HeadLine = {text: string; size: number; weight: number; color?: string};

/**
 * Eyebrow + accent dash + headline lines sliding up from under a mask, one after another.
 * Placed left-aligned at x, with the eyebrow at y.
 */
export const Headline: React.FC<{
  t: number;
  t0: number;
  y: number;
  x?: number;
  eyebrow?: React.ReactNode;
  lines: HeadLine[];
  align?: 'l' | 'c';
}> = ({t, t0, y, x = 75, eyebrow, lines, align = 'l'}) => {
  const dash = eo3(prog(t, t0, t0 + 0.3));
  const eb = eo3(prog(t, t0 + 0.04, t0 + 0.3));
  let top = y + (eyebrow ? 86 : 30);
  return (
    <div style={{position: 'absolute', left: align === 'c' ? 0 : x, top: 0, width: align === 'c' ? 1080 : 1080 - x * 2}}>
      {eyebrow && (
        <div
          style={{
            position: 'absolute',
            top: y,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: align === 'c' ? 'center' : 'flex-start',
            alignItems: 'center',
            gap: 14,
            fontFamily: F.main,
            fontSize: 30,
            fontWeight: 500,
            color: C.gray,
            opacity: eb,
            transform: `translateY(${10 * (1 - eb)}px)`,
          }}
        >
          {eyebrow}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          top: y + (eyebrow ? 56 : 0),
          left: align === 'c' ? 540 - 36 : 0,
          width: 72 * dash,
          height: 6,
          borderRadius: 3,
          background: `linear-gradient(90deg, ${C.peri}, ${C.sky})`,
          boxShadow: '0 0 12px rgba(97,115,244,0.45)',
        }}
      />
      {lines.map((ln, i) => {
        const st = t0 + 0.1 + i * 0.13;
        const e = eo3(prog(t, st, st + 0.42));
        const lh = Math.round(ln.size * (ln.text.includes('*') ? 1.38 : 1.18));
        const block = (
          <div
            key={i}
            style={{
              position: 'absolute',
              top,
              left: 0,
              right: 0,
              height: lh,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: align === 'c' ? 'center' : 'flex-start',
            }}
          >
            <div style={{transform: `translateY(${(1 - e) * lh * 1.05}px)`, filter: e < 1 ? `blur(${4 * (1 - e)}px)` : undefined, paddingBottom: ln.size * 0.12}}>
              <RichLine text={ln.text} size={ln.size} weight={ln.weight} color={ln.color} />
            </div>
          </div>
        );
        top += lh;
        return block;
      })}
    </div>
  );
};

/** Status chip: dot + label; colour and label swap together on state change. */
export const Status: React.FC<{label: string; color: string; t: number; blink?: boolean; size?: number}> = ({label, color, t, blink, size = 24}) => {
  const b = blink ? 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 9)) : 1;
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.4, fontFamily: F.main, fontSize: size, fontWeight: 500, color, whiteSpace: 'nowrap'}}>
      <span style={{width: size * 0.42, height: size * 0.42, borderRadius: '50%', background: color, opacity: b, boxShadow: `0 0 ${size * 0.5}px ${color}`}} />
      {label}
    </span>
  );
};

/** Round badge ("!" or a check) that pops in with a small overshoot. */
export const Badge: React.FC<{t: number; t0: number; color: string; size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({t, t0, color, size = 38, children, style}) => {
  if (t < t0) return null;
  const s = eback(prog(t, t0, t0 + 0.28), 2);
  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        fontFamily: F.main,
        fontWeight: 700,
        fontSize: size * 0.62,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${s})`,
        boxShadow: `0 4px 14px ${color}66, 0 0 0 4px #fff`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

type Pt = [number, number];

/** Point at fraction u (0..1) along a polyline. */
export const along = (pts: Pt[], u: number): Pt => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = clamp(u) * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? d / seg[i] : 0;
      return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};

/** A line that draws itself (p: 0..1). */
export const DrawLine: React.FC<{pts: Pt[]; p: number; color?: string; width?: number; opacity?: number}> = ({pts, p, color = C.peri, width = 4, opacity = 1}) => (
  <polyline
    points={pts.map((q) => q.join(',')).join(' ')}
    fill="none"
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    pathLength={1}
    strokeDasharray={1}
    strokeDashoffset={1 - clamp(p)}
    opacity={opacity}
  />
);

/** Glowing pulse travelling along a polyline with a short tail (u: 0..1, hidden outside). */
export const Pulse: React.FC<{pts: Pt[]; u: number; color?: string; r?: number}> = ({pts, u, color = C.peri, r = 9}) => {
  if (u <= 0 || u >= 1) return null;
  return (
    <>
      {[0.06, 0.04, 0.02, 0].map((d, i) => {
        const [x, y] = along(pts, u - d);
        const rr = r * (0.45 + 0.18 * i);
        return <circle key={i} cx={x} cy={y} r={rr} fill={color} opacity={0.25 + 0.25 * i} style={{filter: `drop-shadow(0 0 ${6 + 3 * i}px ${color})`}} />;
      })}
    </>
  );
};
