import { describe, expect, it } from "vitest";
import {
  fitBoardCamera,
  PLOT_SIZE,
  PLOT_STEP,
} from "../components/Board/camera";
import { unlocked, threshold } from "../game/config/progression";

describe("town camera", () => {
  it("frames the initial six plots as three columns and two rows", () => {
    const camera = fitBoardCamera(unlocked(0), 900, 500);
    expect(camera.columns).toBe(3);
    expect(camera.rows).toBe(2);
    expect(camera.scale * PLOT_SIZE).toBeGreaterThan(180);
  });
  it("pulls back when an expansion needs another row", () => {
    const before = fitBoardCamera(unlocked(0), 900, 500);
    const after = fitBoardCamera(unlocked(threshold(2)), 900, 500);
    expect(after.rows).toBe(3);
    expect(after.scale).toBeLessThan(before.scale);
  });
  it.each([
    [312, 276],
    [950, 510],
  ])("keeps every expansion inside a %ix%i viewport", (width, height) => {
    for (let l = 1; l <= 15; l++) {
      const plots = unlocked(threshold(l));
      const camera = fitBoardCamera(plots, width, height);
      for (const index of plots) {
        const left = camera.x + (index % 5) * PLOT_STEP * camera.scale;
        const top = camera.y + Math.floor(index / 5) * PLOT_STEP * camera.scale;
        expect(left).toBeGreaterThanOrEqual(0);
        expect(top - 25 * camera.scale).toBeGreaterThanOrEqual(-0.001);
        expect(left + PLOT_SIZE * camera.scale).toBeLessThanOrEqual(
          width + 0.001,
        );
        expect(top + (PLOT_SIZE + 14) * camera.scale).toBeLessThanOrEqual(
          height + 0.001,
        );
      }
    }
  });
});
