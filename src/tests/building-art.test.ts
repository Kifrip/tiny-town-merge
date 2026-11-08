import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BuildingArt } from "../components/Building/BuildingArt";
import { CITY_IDS } from "../game/config/cities";

describe("building illustrations", () => {
  it.each(CITY_IDS)(
    "renders 20 different geometries in %s, independent of color or tier labels",
    (city) => {
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
    },
  );
  it("keeps both city palettes and the original coastal details", () => {
    for (let tier = 1; tier <= 20; tier++) {
      const shape = (city: "meadowville" | "sunshore") =>
        renderToStaticMarkup(
          createElement(BuildingArt, { city, tier }),
        ).replace(/data-art="[^"]*"/g, "");
      expect(shape("meadowville")).not.toEqual(shape("sunshore"));
    }
  });
});
