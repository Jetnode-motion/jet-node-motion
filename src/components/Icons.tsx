import React from 'react';

/** Check mark drawn progressively (p: 0..1). */
export const Check: React.FC<{size: number; p: number; color: string; stroke?: number}> = ({size, p, color, stroke = 6}) => {
  const L = 100;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{overflow: 'visible'}}>
      <path
        d="M8 21 L16.5 29 L32 12"
        fill="none"
        stroke={color}
        strokeWidth={(stroke * 40) / size}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={L}
        strokeDasharray={L}
        strokeDashoffset={L * (1 - p)}
      />
    </svg>
  );
};

/** X mark drawn progressively. */
export const XMark: React.FC<{size: number; p: number; color: string; stroke?: number}> = ({size, p, color, stroke = 6}) => {
  const q1 = Math.min(1, p * 2);
  const q2 = Math.max(0, p * 2 - 1);
  const sw = (stroke * 40) / size;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <path d="M8 8 L32 32" stroke={color} strokeWidth={sw} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - q1} />
      <path d="M32 8 L8 32" stroke={color} strokeWidth={sw} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - q2} />
    </svg>
  );
};

export const Power: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M12.5 10.5 A13 13 0 1 0 27.5 10.5" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" />
    <path d="M20 5 L20 19" stroke={color} strokeWidth={3.4} strokeLinecap="round" />
  </svg>
);

export const Lock: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M13 18 V13 A7 7 0 0 1 27 13 V18" fill="none" stroke={color} strokeWidth={3.6} strokeLinecap="round" />
    <rect x={9} y={17} width={22} height={18} rx={4.5} fill={color} />
  </svg>
);
