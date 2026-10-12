import React from 'react';

export type GlyphName =
  | 'play'
  | 'chat'
  | 'music'
  | 'game'
  | 'news'
  | 'mail'
  | 'cloud'
  | 'people'
  | 'pin'
  | 'phone'
  | 'link'
  | 'check'
  | 'shield'
  | 'bolt';

/** Simple 24×24 line glyphs for service tiles and step icons (no third-party brand marks). */
const paths: Record<GlyphName, React.ReactNode> = {
  play: <path d="M9 6.5 L17.5 12 L9 17.5 Z" fill="currentColor" stroke="none" />,
  chat: <path d="M5 5.5 h14 a2 2 0 0 1 2 2 v7.5 a2 2 0 0 1 -2 2 h-8 l-4.5 3.2 v-3.2 h-1.5 a2 2 0 0 1 -2 -2 v-7.5 a2 2 0 0 1 2 -2z" />,
  music: (
    <>
      <path d="M10 17 V6 L19 4 V15" />
      <circle cx={7.6} cy={17} r={2.4} />
      <circle cx={16.6} cy={15} r={2.4} />
    </>
  ),
  game: (
    <>
      <path d="M6 8.5 h12 a4 4 0 0 1 4 4 v0.5 a4 4 0 0 1 -4 4 h-12 a4 4 0 0 1 -4 -4 v-0.5 a4 4 0 0 1 4 -4z" />
      <path d="M7.5 10.8 v4 M5.5 12.8 h4" />
      <circle cx={16.5} cy={12.8} r={0.9} fill="currentColor" />
    </>
  ),
  news: (
    <>
      <rect x={4} y={4.5} width={16} height={15} rx={2.5} />
      <path d="M7.5 9 h9 M7.5 12.5 h9 M7.5 16 h5" />
    </>
  ),
  mail: (
    <>
      <rect x={3.5} y={6} width={17} height={12.5} rx={2.5} />
      <path d="M4.5 7.5 l7.5 5.5 l7.5 -5.5" />
    </>
  ),
  cloud: <path d="M7.5 18.5 h9.5 a4 4 0 0 0 0.6 -7.95 a6 6 0 0 0 -11.4 1.2 a3.4 3.4 0 0 0 1.3 6.75z" />,
  people: (
    <>
      <circle cx={9} cy={8.5} r={3.2} />
      <path d="M3 19.5 a6 6 0 0 1 12 0" />
      <circle cx={17} cy={9.5} r={2.5} />
      <path d="M15.5 14.4 a5 5 0 0 1 6 5.1" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21 c0 0 -6.5 -6 -6.5 -11 a6.5 6.5 0 0 1 13 0 c0 5 -6.5 11 -6.5 11z" />
      <circle cx={12} cy={10} r={2.3} />
    </>
  ),
  phone: (
    <>
      <rect x={6.5} y={2.5} width={11} height={19} rx={2.8} />
      <path d="M10.5 18.3 h3" />
    </>
  ),
  link: (
    <>
      <path d="M10 14 a4 4 0 0 0 5.7 0 l3 -3 a4 4 0 0 0 -5.7 -5.7 l-1.2 1.2" />
      <path d="M14 10 a4 4 0 0 0 -5.7 0 l-3 3 a4 4 0 0 0 5.7 5.7 l1.2 -1.2" />
    </>
  ),
  check: <path d="M5.5 12.5 l4.2 4.2 l8.8 -9.2" />,
  shield: (
    <>
      <path d="M12 3 l7.5 3 v5.5 c0 4.6 -3.2 8.2 -7.5 9.5 c-4.3 -1.3 -7.5 -4.9 -7.5 -9.5 v-5.5z" />
      <path d="M8.8 12 l2.3 2.3 l4.3 -4.5" />
    </>
  ),
  bolt: <path d="M13 3 L5.5 13.5 h5.5 l-1 7.5 L17.5 10.5 h-5.5z" />,
};

export const Glyph: React.FC<{name: GlyphName; size: number; color?: string; stroke?: number}> = ({name, size, color = '#fff', stroke = 2}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{color, display: 'block'}}
  >
    {paths[name]}
  </svg>
);
