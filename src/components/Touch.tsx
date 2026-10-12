import React from 'react';
import {clamp, eo3, lerp, prog} from '../style/ease';

/**
 * iOS-style touch indicator (from the UpdatesVPN reference): a soft ring lands
 * on the target, compresses on the tap, flashes, then expands and fades.
 */
export const TouchTap: React.FC<{t: number; tap: number; x: number; y: number; color?: string; size?: number}> = ({
  t,
  tap,
  x,
  y,
  color = '97,115,244',
  size = 96,
}) => {
  if (t < tap - 0.35 || t > tap + 0.55) return null;
  const pin = eo3(prog(t, tap - 0.35, tap - 0.08)); // land
  const down = clamp(1 - Math.abs(t - tap) / 0.09); // press
  const out = eo3(prog(t, tap + 0.08, tap + 0.55)); // release
  const s = lerp(1.35, 1, pin) * (1 - 0.18 * down) * lerp(1, 1.7, out);
  const a = pin * (1 - out);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        transform: `scale(${s})`,
        opacity: a,
        border: `3px solid rgba(${color},0.9)`,
        background: `rgba(${color},${0.16 + 0.3 * down})`,
        boxShadow: `0 0 24px rgba(${color},${0.35 + 0.4 * down}), inset 0 0 12px rgba(255,255,255,0.35)`,
        boxSizing: 'border-box',
      }}
    />
  );
};
