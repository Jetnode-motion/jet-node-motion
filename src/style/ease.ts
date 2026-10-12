// Same curves as the original Python renderer, so timings carry over 1:1.
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const eo3 = (x: number) => 1 - (1 - x) ** 3;
export const eoexpo = (x: number) => (x >= 1 ? 1 : 1 - 2 ** (-10 * x));
export const eio = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
export const eq5 = (x: number) => (x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2);
export const eback = (x: number, s = 1.7) => {
  const y = x - 1;
  return Math.max(1e-3, 1 + (s + 1) * y ** 3 + s * y ** 2);
};
/** Pop-in with overshoot that starts at t0 (0 before). */
export const pop = (t: number, t0: number, d = 0.28) => (t >= t0 ? eback(prog(t, t0, t0 + d), 1.5) : 0);
/** 0→1→0 over ±w around a tap moment: drives button press scale. */
export const press = (t: number, tap: number, w = 0.08) =>
  Math.abs(t - tap) < w ? 1 - Math.abs(prog(t, tap - w, tap + w) * 2 - 1) : 0;
