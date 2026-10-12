import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, F} from '../style/tokens';
import {lerp} from '../style/ease';

/** Text placed by its vertical centre; anchor 'l' = left edge at x, 'c' = centred on x. */
export const Txt: React.FC<{
  x: number;
  y: number;
  size: number;
  weight?: number;
  color?: string;
  anchor?: 'l' | 'c';
  opacity?: number;
  family?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({x, y, size, weight = 500, color = C.ink, anchor = 'l', opacity = 1, family = F.main, children, style}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(${anchor === 'c' ? '-50%' : '0'}, -50%)`,
      fontFamily: family,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 1,
      color,
      opacity,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Box: React.FC<{x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({
  x,
  y,
  w,
  h,
  style,
  children,
}) => <div style={{position: 'absolute', left: x, top: y, width: w, height: h, ...style}}>{children}</div>;

/** The glass plane from the logo, centred at (x, y). Optional glint sweep (0..1). */
export const Plane: React.FC<{x: number; y: number; width: number; rot?: number; opacity?: number; glint?: number}> = ({
  x,
  y,
  width,
  rot = 0,
  opacity = 1,
  glint,
}) => {
  if (width < 2) return null;
  const src = staticFile('brand/plane.png');
  const c = glint === undefined ? 0 : lerp(-30, 130, glint);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - width / 2,
        top: y - width / 2,
        width,
        height: width,
        transform: `rotate(${rot}rad)`,
        opacity,
      }}
    >
      <Img src={src} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      {glint !== undefined && glint > 0 && glint < 1 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, rgba(255,255,255,0) ${c - 18}%, rgba(255,255,255,0.65) ${c}%, rgba(255,255,255,0) ${c + 18}%)`,
            WebkitMaskImage: `url(${src})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
          }}
        />
      ) : null}
    </div>
  );
};

/** App icon tile: navy gradient from the logo + plane + bright edge. */
export const AppIcon: React.FC<{size: number; glint?: number}> = ({size, glint}) => (
  <div
    style={{
      position: 'relative',
      width: size,
      height: size,
      borderRadius: size * 0.24,
      background: 'linear-gradient(135deg, #0A1E4A 0%, #123C8C 60%, #3D7EDB 100%)',
      boxShadow: `0 ${size * 0.1}px ${size * 0.25}px rgba(20,40,110,0.30), inset 0 0 ${size * 0.06}px rgba(255,255,255,0.18)`,
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: size * 0.24,
        padding: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.1) 70%)',
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
      }}
    />
    <Plane x={size / 2} y={size / 2} width={size * 0.74} glint={glint} />
  </div>
);
