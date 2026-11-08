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
// Each tier has its own facade/roof pairing as well as a different silhouette.
const meadowPalette = [
  ["#f4d395", "#c77148"],
  ["#bc9068", "#4b6861"],
  ["#b7d4e3", "#5e779c"],
  ["#e5e5c8", "#6b9a83"],
  ["#d9aaa7", "#8c5262"],
  ["#d5c5e4", "#6b5c95"],
  ["#e6c284", "#a35c44"],
  ["#e7bda8", "#42827f"],
  ["#c2d4a5", "#567c60"],
  ["#f2d8a1", "#b3634f"],
  ["#be8373", "#435865"],
  ["#9ccfdc", "#3d7e9e"],
  ["#b9dbe0", "#4d6e95"],
  ["#9dc6ae", "#388476"],
  ["#c9badc", "#756398"],
  ["#e8dbaf", "#bd9455"],
  ["#bdd2a1", "#3c8263"],
  ["#acc1ce", "#576c95"],
  ["#b1dbbb", "#448d80"],
  ["#e9e0c1", "#c6a14f"],
];
const coastPalette = [
  ["#edcf9c", "#bd9155"],
  ["#f2ead3", "#4b9fb5"],
  ["#f1b4aa", "#cf7058"],
  ["#b5dfcc", "#319d9a"],
  ["#f3cfac", "#c56f8d"],
  ["#e9b995", "#a47594"],
  ["#e8ebd6", "#3c7e99"],
  ["#d2c9e7", "#559fb3"],
  ["#efb5aa", "#b86662"],
  ["#eee2bd", "#c96859"],
  ["#c8ae87", "#438f91"],
  ["#a6d8dc", "#3486ad"],
  ["#f0bcac", "#c97e70"],
  ["#ead7ac", "#c6a15b"],
  ["#b4ddd8", "#428ba4"],
  ["#f0e3bd", "#c5a15d"],
  ["#ded7e8", "#8a86b4"],
  ["#c5ccdf", "#6e82ad"],
  ["#eee5cf", "#a6a26e"],
  ["#cbe3de", "#c8a34f"],
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
        color: (city === "meadowville" ? meadowPalette : coastPalette)[i][0],
        roof: (city === "meadowville" ? meadowPalette : coastPalette)[i][1],
      };
    }),
  ]),
) as Record<CityId, BuildingConfig[]>;
export const building = (city: CityId, tier: number) =>
  BUILDINGS[city][tier - 1];
