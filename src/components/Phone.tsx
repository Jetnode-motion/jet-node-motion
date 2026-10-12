import React from 'react';

export const PHONE = {w: 640, h: 1320, bezel: 18, r: 96};
export const SCREEN = {w: PHONE.w - 2 * PHONE.bezel, h: PHONE.h - 2 * PHONE.bezel, r: 80};

/** Phone mockup centred at (cx, cy). Children are drawn in screen-local coordinates (604 × 1284). */
export const Phone: React.FC<{cx: number; cy: number; rot?: number; children: React.ReactNode}> = ({cx, cy, rot = 0, children}) => (
  <div
    style={{
      position: 'absolute',
      left: cx - PHONE.w / 2,
      top: cy - PHONE.h / 2,
      width: PHONE.w,
      height: PHONE.h,
      borderRadius: PHONE.r,
      transform: `rotate(${rot}rad)`,
      background: 'linear-gradient(90deg, #2B2830, #121015 50%, #2B2830)',
      boxShadow: '0 0 90px rgba(97,115,244,0.22), 0 46px 90px rgba(59,46,64,0.30)',
    }}
  >
    {/* bezel edge highlight */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: PHONE.r,
        padding: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.25))',
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: PHONE.bezel,
        top: PHONE.bezel,
        width: SCREEN.w,
        height: SCREEN.h,
        borderRadius: SCREEN.r,
        overflow: 'hidden',
        isolation: 'isolate',
      }}
    >
      {children}
      {/* dynamic island */}
      <div style={{position: 'absolute', left: SCREEN.w / 2 - 64, top: 18, width: 128, height: 38, borderRadius: 19, background: '#000'}} />
      {/* glass reflection + inner glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: SCREEN.r,
          background: 'linear-gradient(150deg, rgba(255,255,255,0.07), rgba(255,255,255,0) 50%)',
          boxShadow: 'inset 0 0 14px rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }}
      />
    </div>
  </div>
);
