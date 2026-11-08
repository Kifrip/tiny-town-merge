export type CityId = "meadowville" | "sunshore";
export type UpgradeId = "speed" | "quality" | "income";
export type Tile =
  | null
  | { kind: "crate" }
  | { kind: "building"; tier: number; party: boolean };
export interface CityState {
  board: Tile[];
  coins: number;
  xp: number;
  discovered: number[];
  upgrades: Record<UpgradeId, number>;
  crateProgress: number;
  generated: number;
  merges: number;
  purchases: number;
  earned: number;
}
export interface GameState {
  version: 1;
  cities: Record<CityId, CityState>;
  selectedCity: CityId;
  lastTick: number;
  seed: number;
  boosts: { incomeUntil: number; speedUntil: number; tokens: number };
  claimed: string[];
  settings: { sound: boolean; reducedMotion: boolean; autoSave: boolean };
}
export type Action =
  | { type: "tap" }
  | { type: "open"; index: number }
  | { type: "move"; from: number; to: number }
  | { type: "buy"; tier: number }
  | { type: "upgrade"; id: UpgradeId }
  | { type: "recycle"; index: number }
  | { type: "party"; index: number }
  | { type: "switch"; city: CityId }
  | { type: "boost"; id: "income" | "speed" }
  | { type: "claim"; id: string }
  | { type: "settings"; settings: Partial<GameState["settings"]> };
