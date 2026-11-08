// Cumulative XP, followed by a continuing 160-XP cadence after level 20.
export const LEVEL_XP = [
  0, 2, 6, 13, 24, 40, 62, 90, 125, 168, 220, 282, 355, 440, 538, 650, 777, 920,
  1080, 1260,
];
export const PLOT_ORDER = [
  6, 7, 8, 11, 12, 13, 16, 17, 18, 5, 10, 15, 9, 14, 19, 1, 2, 3, 21, 22, 23, 0,
  4, 20, 24,
];
export function level(xp: number) {
  if (xp >= LEVEL_XP[19]) return 20 + Math.floor((xp - LEVEL_XP[19]) / 160);
  return LEVEL_XP.findIndex((t) => t > xp);
}
export function threshold(l: number): number {
  return l <= 20 ? LEVEL_XP[l - 1] : 1260 + (l - 20) * 160;
}
export const plotCount = (xp: number) =>
  Math.min(25, 6 + Math.floor((level(xp) - 1) * 1.4));
export const unlocked = (xp: number) => PLOT_ORDER.slice(0, plotCount(xp));
