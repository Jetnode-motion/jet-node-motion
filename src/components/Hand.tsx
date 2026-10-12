import React from 'react';
import {C} from '../style/tokens';
import {eo3, eio, lerp, prog, press} from '../style/ease';

/** Cartoon pointer hand. (x, y) is the fingertip. */
export const HandShape: React.FC<{x: number; y: number; scale?: number; pressed?: number}> = ({x, y, scale = 1, pressed = 0}) => {
  const s = 1.45 * scale * (1 - 0.1 * pressed);
  const parts = (
    <>
      <rect x={-14} y={0} width={28} height={100} rx={14} />
      <rect x={12} y={56} width={26} height={52} rx={13} />
      <rect x={36} y={64} width={24} height={46} rx={12} />
      <rect x={58} y={74} width={20} height={38} rx={10} />
      <rect x={-32} y={74} width={112} height={96} rx={30} />
      <rect x={-54} y={-14} width={62} height={28} rx={14} transform="translate(-30 112) rotate(-43)" />
    </>
  );
  return (
    <svg
      width={300}
      height={320}
      viewBox="-100 -20 300 320"
      style={{
        position: 'absolute',
        left: x - 100 * s,
        top: y - 20 * s,
        width: 300 * s,
        height: 320 * s,
        transform: `rotate(-18deg)`,
        transformOrigin: `${100 * s}px ${20 * s}px`,
        overflow: 'visible',
        filter: 'drop-shadow(8px 12px 10px rgba(0,0,0,0.18))',
      }}
    >
      <g stroke={C.plum} strokeWidth={11} strokeLinejoin="round" fill="none">
        {parts}
      </g>
      <g fill="#fff">{parts}</g>
    </svg>
  );
};

/** Hand that flies in from the bottom-right, taps at `tap`, and leaves. */
export const TapHand: React.FC<{t: number; tap: number; x: number; y: number; scale?: number}> = ({t, tap, x, y, scale = 0.85}) => {
  if (t < tap - 0.6 || t > tap + 0.9) return null;
  const pin = eo3(prog(t, tap - 0.55, tap - 0.05));
  const pout = eio(prog(t, tap + 0.2, tap + 0.7));
  const px = lerp(lerp(1150, x + 20, pin), 1200, pout);
  const py = lerp(lerp(1950, y + 10, pin), 2050, pout);
  return <HandShape x={px} y={py} scale={scale} pressed={press(t, tap)} />;
};

export const Ripple: React.FC<{x: number; y: number; p: number; color?: string; rmax?: number}> = ({x, y, p, color = C.peri, rmax = 150}) => {
  if (p <= 0 || p >= 1) return null;
  const r = 20 + rmax * eo3(p);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: 2 * r,
        height: 2 * r,
        borderRadius: '50%',
        border: `${10 * (1 - p) + 2}px solid ${color}`,
        opacity: 0.8 * (1 - p),
      }}
    />
  );
};
