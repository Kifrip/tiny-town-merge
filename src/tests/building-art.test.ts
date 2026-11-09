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
  it("keeps the two approved city atlases separate", () => {
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
import sunFrames from "../assets/buildings/sunshore-frames.json";
import { readFileSync } from "node:fs";
it.each(CITY_IDS)("maps twenty non-overlapping RGBA frames for %s", (city) => {
  const activeFrames = city === "meadowville" ? frames : sunFrames;
  const png = readFileSync(
    new URL(`../assets/buildings/${city}-atlas.png`, import.meta.url),
  );
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  expect(width).toBeGreaterThanOrEqual(1024);
  expect(height).toBeGreaterThanOrEqual(1024);
  const markup = renderToStaticMarkup(createElement(BuildingArt, { city, tier: 1 }));
  expect(markup).toContain(`width="${width}" height="${height}"`);
  expect(png[25]).toBe(6);
  expect(activeFrames).toHaveLength(20);
  activeFrames.forEach((f, i) => {
    expect(f.width).toBeGreaterThan(100);
    expect(f.height).toBeGreaterThan(100);
    expect(f.x).toBeGreaterThanOrEqual(0);
    expect(f.y).toBeGreaterThanOrEqual(0);
    expect(f.x + f.width).toBeLessThanOrEqual(width);
    expect(f.y + f.height).toBeLessThanOrEqual(height);
    activeFrames
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
