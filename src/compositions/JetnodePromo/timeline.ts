// All times in seconds. Ported 1:1 from legacy/python/v2.py.
export const DURATION = 15;

export const TAP1 = 4.4; // «Попробовать бесплатно»
export const TAP2 = 6.45; // «Подключиться в 1 клик» (deeplink)
export const TAP3 = 9.05; // connect button in the app
export const TAP4 = 13.7; // end-card CTA

// Bot inline buttons in screen-local coords: x, y, w, h
export const B1 = {x: 24, y: 440, w: 470, h: 72};
export const B2 = {x: 24, y: 700, w: 470, h: 84};

// Phone in world space, and the screen origin
export const PCX = 540;
export const PCY = 1180;
export const SX0 = PCX - 302;
export const SY0 = PCY - 642;
export const s2w = (x: number, y: number) => ({x: SX0 + x, y: SY0 + y});

// Camera keys: [time, scale, centreX, centreY]; (cx, cy) lands on screen point (540, FOCUS_Y)
export const FOCUS_Y = 1150;
export const CAM_KEYS: [number, number, number, number][] = [
  [0.0, 2.25, 540, 690],
  [0.95, 2.0, 540, 740],
  [1.55, 1.0, 540, 1180],
  [2.9, 1.0, 540, 1180],
  [3.4, 1.6, 480, 1040],
  [4.85, 1.6, 480, 1120],
  [5.3, 1.9, 480, 1320],
  [6.5, 1.9, 480, 1320],
  [6.95, 1.0, 540, 1180],
  [7.55, 1.0, 540, 1180],
  [7.9, 1.8, 540, 790],
  [8.5, 1.8, 540, 790],
  [8.85, 1.4, 540, 1180],
  [9.55, 1.4, 540, 1180],
  [9.95, 1.0, 540, 1180],
  [10.25, 1.32, 540, 1120],
  [11.8, 1.36, 540, 1100],
  [12.0, 1.0, 540, 1150],
  [15.1, 1.0, 540, 1150],
];

export const PHRASES = [
  {from: -0.12, to: 1.75, text: 'Интернет по *белым спискам?*', size: 76},
  {from: 1.85, to: 3.15, text: 'Обходим их в *1 клик*', size: 66},
  {from: 3.2, to: 5.35, text: 'Открой бота и получи 3 дня *бесплатно*', size: 62},
  {from: 5.4, to: 8.05, text: 'Жми «Подключиться» — приложение откроется *само*', size: 60},
  {from: 8.12, to: 9.72, text: 'Подписка уже *внутри*', size: 66},
  {from: 9.8, to: 11.95, text: 'Быстрые серверы на *любой вкус*', size: 64},
  {from: 12.0, to: 15.2, text: 'Ссылка на бота в *профиле*', size: 58},
];
