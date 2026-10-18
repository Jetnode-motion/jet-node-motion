// Project style guide: knowledge-base/style-guide.md («Дизайн и Монтаж»)
export const C = {
  shell: '#FCEFED', // background
  peri: '#6173F4', // main accent
  coral: '#F35E3E', // highlights, hand-drawn underline/arrow
  plum: '#3B2E40', // text
  ink: '#1D1D1F', // Apple-like UI text
  gray: '#8A8A8E',
  mint: '#86E8A8', // glow from the logo
  green: '#2BB673',
  sky: '#8FC9F6', // plate gradient end
  navy: '#0A1E4A',
  navy2: '#1D55B5',
  white: '#FFFFFF',
};

// Glass style from the bot menu banners (style-guide.md, «Меню бота: стеклянный стиль»)
export const GLASS = {
  bgFrom: '#2970F7', // top-left of the background gradient
  bgMid: '#4787F3',
  bgTo: '#B1DBFF', // light corner, bottom-right / top-right
  solid: '#2262EC', // solid back layer of an icon
  darkBg: '#050B1E', // dark variant background
  darkGlow: '#4B81F3', // glow behind the icon on the dark variant
  pill: 'rgba(255,255,255,0.18)', // caption pill fill, with a thin white stroke
};

// SF Pro Display must be installed on the machine (Apple licence, not in the repo).
// Inter Display is the open-source fallback with nearly the same metrics.
export const F = {
  main: '"SF Pro Display", "Inter Display", Inter, -apple-system, Helvetica, Arial, sans-serif',
  // Accent words: SignPainter HouseScript (has Cyrillic); Marck Script if the file is missing.
  accent: '"SignPainter", "Marck Script", cursive',
};

export const FPS = 30;
export const W = 1080;
export const H = 1920;
