// JetnodeAd30 v5: ~30 s ad with voiceover. Timings follow the voiceover lines (public/audio/vo/l1..l9.wav).
export const DURATION = 30;

/** Voiceover: start time and spoken length of each line. */
export const VO: {at: number; dur: number}[] = [
  {at: 0.15, dur: 2.11},
  {at: 2.45, dur: 2.29},
  {at: 5.0, dur: 2.96},
  {at: 8.2, dur: 2.93},
  {at: 11.4, dur: 4.72},
  {at: 16.4, dur: 2.82},
  {at: 19.45, dur: 2.87},
  {at: 22.55, dur: 2.76},
  {at: 25.6, dur: 2.49},
];

/** On-screen subtitles: same words as the voiceover, *accent* in SignPainter. */
export const SUBS = [
  'Мобильный интернет по *белым спискам?*',
  'YouTube, Instagram и TikTok не грузятся?',
  'JetnodeVPN работает даже при *ограничениях*',
  'Открой бота в Telegram — 3 дня *бесплатно*',
  'Жмёшь «Подключиться» — подписка уже *внутри*',
  'Серверы в Европе: от Швейцарии до *Финляндии*',
  'Скорость до 10 Гбит/с и YouTube *без рекламы*',
  'Дальше — от *149 ₽* в месяц',
  'Попробуй свободный интернет в нашем *боте*',
];

/** Scene windows. */
export const S = {
  hook: [0, 4.85],
  logo: [4.9, 8.1],
  bot: [8.15, 16.25],
  servers: [16.3, 19.35],
  speed: [19.4, 22.45],
  price: [22.5, 25.5],
  end: [25.55, 30],
} as const;

// Hook
export const HOOK_FAIL = 1.15;

// Logo + apps coming back
export const LOGO_PULSE = 5.85;

// Bot chat
export const START_MSG = 8.6;
export const BOT_MSG = 9.15;
export const TAP_CONNECT = 12.1;
export const DEEPLINK = 12.25;
/** AppHome (from v3) has its own clock: splash at 6.85, toast 7.65, connect tap 9.05. Shift it so the splash lands here. */
export const APP_SPLASH = 12.75;
export const APP_SHIFT = APP_SPLASH - 6.85;
export const TAP_POWER = 9.05 + APP_SHIFT;

// Speed
export const SPEED_SWEEP = [19.65, 20.7] as const;
export const ADS_OFF = 21.25;

// Price
export const DEVICES_ON = 23.9;

// End
export const TAP_CTA = 28.3;
