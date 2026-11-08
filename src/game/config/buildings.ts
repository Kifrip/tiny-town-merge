import type { CityId } from "../types";
const early = [1.2, 4, 12, 30, 64, 130, 270, 550, 1120, 2400];
const meadow = [
  "Pocket Cottage",
  "Clove Cabin",
  "Willow House",
  "Garden Villa",
  "Maple Manor",
  "Rosewood Estate",
  "Orchard Mansion",
  "Parkside Flats",
  "Terrace Court",
  "Market Hall",
  "Foundry Lofts",
  "Glasshouse Offices",
  "Skyline Tower",
  "Emerald Heights",
  "Cloudspire",
  "Solar Arc",
  "Verdant Nexus",
  "Aurora Observatory",
  "The Living Landmark",
  "Crown of the Meadow",
];
const sun = [
  "Beach Bungalow",
  "Coral Casita",
  "Palm House",
  "Lagoon Villa",
  "Hibiscus Retreat",
  "Sunset Estate",
  "Marina Mansion",
  "Seabreeze Suites",
  "Coral Court",
  "Harbor Market",
  "Tidewater Lofts",
  "Azure Offices",
  "Reef Tower",
  "Golden Heights",
  "Ocean Spire",
  "Solstice Arc",
  "Pearl Nexus",
  "Starlight Observatory",
  "The Coastal Landmark",
  "Crown of the Coast",
];
export interface BuildingConfig {
  tier: number;
  name: string;
  income: number;
  price: number;
  color: string;
  roof: string;
}
export const BUILDINGS: Record<CityId, BuildingConfig[]> = Object.fromEntries(
  (["meadowville", "sunshore"] as const).map((city) => [
    city,
    Array.from({ length: 20 }, (_, i) => {
      const income = i < 10 ? early[i] : 2400 * 2.05 ** (i - 9);
      return {
        tier: i + 1,
        name: (city === "meadowville" ? meadow : sun)[i],
        income,
        price: Math.ceil(
          income *
            (i === 0 ? 16 : i === 1 ? 25 : i === 2 ? 35 : 40 * 1.55 ** (i - 3)),
        ),
        color: (city === "meadowville"
          ? ["#f6d7a0", "#e2c5a2", "#f3d3b5", "#c5d6bc", "#b9d2d1"]
          : ["#f9d2a2", "#f7c8bd", "#b9dfd8", "#f3d898", "#a9d6dd"])[i % 5],
        roof: (city === "meadowville"
          ? ["#bc6f4f", "#567b72", "#6a819a", "#a27970", "#456b65"]
          : ["#d97865", "#329e9f", "#ecad61", "#679ca5", "#dd8a73"])[i % 5],
      };
    }),
  ]),
) as Record<CityId, BuildingConfig[]>;
export const building = (city: CityId, tier: number) =>
  BUILDINGS[city][tier - 1];
