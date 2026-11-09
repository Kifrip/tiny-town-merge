import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BuildingArt } from "../components/Building/BuildingArt";
import { CITY_IDS } from "../game/config/cities";

describe("building illustrations", () => {
  it.each(CITY_IDS)("renders 20 distinct tier illustrations in %s", (city) => {
    const shapes = Array.from({ length: 20 }, (_, i) =>
      renderToStaticMarkup(createElement(BuildingArt, { city, tier: i + 1 }))
        .replace(/data-art="[^"]*"/g, "")
        .replace(/(?:fill|stroke)="[^"]*"/g, ""),
    );
    expect(new Set(shapes).size).toBe(20);
    for (const svg of shapes) {
      expect(svg).toContain('viewBox="0 0 120 124"');
      expect(svg).not.toMatch(/NaN|undefined/);
    }
  });
  it("keeps the approved Meadowville images separate from the original coastal artwork", () => {
    for (let tier = 1; tier <= 20; tier++) {
      const shape = (city: "meadowville" | "sunshore") =>
        renderToStaticMarkup(
          createElement(BuildingArt, { city, tier }),
        ).replace(/data-art="[^"]*"/g, "");
      expect(shape("meadowville")).not.toEqual(shape("sunshore"));
    }
  });
});

import frames from "../assets/buildings/meadowville-frames.json";
import { readFileSync } from "node:fs";
it("maps exactly twenty non-overlapping frames inside the approved RGBA atlas", () => {
  const png = readFileSync(
    new URL("../assets/buildings/meadowville-atlas.png", import.meta.url),
  );
  expect(png.readUInt32BE(16)).toBe(1024);
  expect(png.readUInt32BE(20)).toBe(1024);
  expect(png[25]).toBe(6);
  expect(frames).toHaveLength(20);
  frames.forEach((f, i) => {
    expect(f.width).toBeGreaterThan(100);
    expect(f.height).toBeGreaterThan(100);
    expect(f.x).toBeGreaterThanOrEqual(0);
    expect(f.y).toBeGreaterThanOrEqual(0);
    expect(f.x + f.width).toBeLessThanOrEqual(1024);
    expect(f.y + f.height).toBeLessThanOrEqual(1024);
    frames
      .slice(i + 1)
      .forEach((g) =>
        expect(
          f.x + f.width <= g.x ||
            g.x + g.width <= f.x ||
            f.y + f.height <= g.y ||
            g.y + g.height <= f.y,
        ).toBe(true),
      );
  });
});
