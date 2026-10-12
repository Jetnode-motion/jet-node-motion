import React from 'react';
import {C} from '../style/tokens';

type Props = {
  width: number;
  height: number;
  radius?: number;
  from?: string;
  to?: string;
  /** outer glow colour, e.g. 'rgba(255,255,255,0.35)' or a brand tint on light backgrounds */
  glow?: string;
  glowSize?: number;
  shadow?: number;
  /** 0..1 strength of the bright top-left edge */
  edge?: number;
  /** 0..1 strength of the light corner */
  corner?: number;
  /** 0..1 strength of the inner glow */
  inner?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

/**
 * Nazar's AE banner plate: gradient fill, light top-left corner, inner glow,
 * a stroke that is bright at the top-left and fades towards the bottom-right,
 * and a soft outer glow.
 */
export const Plate: React.FC<Props> = ({
  width,
  height,
  radius = 24,
  from = C.peri,
  to = C.sky,
  glow = 'rgba(97,115,244,0.45)',
  glowSize = 26,
  shadow = 0.22,
  edge = 0.95,
  corner = 0.32,
  inner = 1,
  style,
  children,
}) => (
  <div
    style={{
      position: 'relative',
      width,
      height,
      borderRadius: radius,
      background: `linear-gradient(100deg, ${from}, ${to})`,
      boxShadow: [
        `0 0 ${glowSize}px ${glow}`,
        `0 ${height * 0.18}px ${height * 0.45}px rgba(20,25,60,${shadow})`,
        `inset 0 0 22px rgba(255,255,255,${0.12 * inner})`,
        `inset 0 0 8px rgba(255,255,255,${0.14 * inner})`,
      ].join(','),
      overflow: 'hidden',
      ...style,
    }}
  >
    {/* light corner */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at 0% 0%, rgba(255,255,255,${corner}) 0%, rgba(255,255,255,0) ${Math.max(width, height) * 0.55}px)`,
      }}
    />
    {/* gradient edge stroke */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: radius,
        padding: 2.4,
        background: `linear-gradient(135deg, rgba(255,255,255,${edge}) 0%, rgba(255,255,255,${edge * 0.18}) 70%)`,
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      }}
    />
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {children}
    </div>
  </div>
);
