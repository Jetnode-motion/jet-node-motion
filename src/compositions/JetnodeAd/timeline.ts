// JetnodeAd v4: 15 s, scenes rebuilt with the Privata-style plate animations.
export const DURATION = 15;

/** Scene windows [start, end] in seconds. Each scene fades out with blur in its last 0.22 s. */
export const S = {
  hook: [0, 3.2],
  bypass: [3.25, 6.45],
  flow: [6.5, 10.45],
  servers: [10.5, 12.75],
  end: [12.8, 15],
} as const;

// Hook: cards cascade in, then flip to «заблокирован».
export const HOOK_IN = 0.25;
export const HOOK_BLOCK = 1.35;

// Bypass diagram.
export const BY_DRAW = 3.55;
export const BY_PULSE = 4.15;
export const BY_SPREAD = 4.55;

// Bot → deeplink → app.
export const FLOW_IN = 6.75;
export const STEP1_DONE = 7.5;
export const STEP2_ON = 7.85;
export const TAP_CONNECT = 8.45;
export const STEP3_ON = 8.85;
export const STEP3_DONE = 9.1;

// Servers.
export const SRV_IN = 10.75;
export const TAB_TIMES = [10.6, 11.35, 11.8, 12.25];

// End card.
export const TRIAL_FILL = [13.45, 14.05] as const;
export const TAP_CTA = 14.35;
