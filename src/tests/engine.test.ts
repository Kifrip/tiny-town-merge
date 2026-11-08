import { describe, it, expect, vi } from "vitest";
import {
  newGame,
  transition,
  advance,
  income,
  emptyPlots,
  offline,
  proximity,
  tileIncome,
  cityUnlocked,
  interval,
  achievements,
} from "../game/engine/core";
import {
  parseSave,
  loadGame,
  saveGame,
  SAVE_KEY,
} from "../game/persistence/saves";
import {
  level,
  threshold,
  unlocked,
  plotCount,
} from "../game/config/progression";
import { building, BUILDINGS } from "../game/config/buildings";
import { upgradeCost } from "../game/config/economy";
import type { GameState, CityId } from "../game/types";
const start = 1_700_000_000_000;
const house = (tier = 1, party = false) => ({
  kind: "building" as const,
  tier,
  party,
});
function two(tier = 1) {
  const s = newGame(start);
  s.cities.meadowville.board[6] = house(tier);
  s.cities.meadowville.board[7] = house(tier);
  s.cities.meadowville.discovered = [tier];
  return s;
}
function coast() {
  const s = newGame(start);
  s.cities.meadowville.xp = 90;
  s.selectedCity = "sunshore";
  return s;
}
describe("town interactions", () => {
  it("starts with six empty plots in a 2 by 3 layout", () => {
    const s = newGame(start);
    expect(emptyPlots(s.cities.meadowville)).toEqual([6, 7, 8, 11, 12, 13]);
    expect(s.cities.meadowville.board.every((t) => t === null)).toBe(true);
  });
  it("generates deterministic random crates without mutating input", () => {
    const s = newGame(start);
    expect(transition(s, { type: "tap" })).toEqual(
      transition(s, { type: "tap" }),
    );
    expect(s.cities.meadowville.generated).toBe(0);
    expect(transition(s, { type: "tap" }).cities.meadowville.generated).toBe(1);
  });
  it("shares waiting and tapping progress", () => {
    let s = newGame(start);
    s.cities.meadowville.generated = 5;
    s.cities.meadowville.crateProgress = 0;
    s = advance(s, start + 5000);
    for (let i = 0; i < 5; i++) s = transition(s, { type: "tap" });
    expect(s.cities.meadowville.generated).toBe(6);
    expect(s.cities.meadowville.crateProgress).toBe(0);
  });
  it("opens a crate and records a discovery", () => {
    let s = transition(newGame(start), { type: "tap" });
    const index = s.cities.meadowville.board.findIndex(
      (t) => t?.kind === "crate",
    );
    s = transition(s, { type: "open", index });
    expect(s.cities.meadowville.board[index]).toEqual(house());
    expect(s.cities.meadowville.discovered).toEqual([1]);
  });
  it("merges identical nonadjacent buildings into target", () => {
    const s = two(3);
    s.cities.meadowville.board[13] = s.cities.meadowville.board[7];
    s.cities.meadowville.board[7] = null;
    const n = transition(s, { type: "move", from: 6, to: 13 });
    expect(n.cities.meadowville.board[6]).toBeNull();
    expect(n.cities.meadowville.board[13]).toEqual(house(4));
    expect(n.cities.meadowville.xp).toBe(3);
    expect(s.cities.meadowville.board[6]).toEqual(house(3));
  });
  it("moves onto empty land", () => {
    const n = transition(two(), { type: "move", from: 6, to: 8 });
    expect(n.cities.meadowville.board[6]).toBeNull();
    expect(n.cities.meadowville.board[8]).toEqual(house());
  });
  it("swaps different tiers", () => {
    const s = two();
    s.cities.meadowville.board[7] = house(3);
    const n = transition(s, { type: "move", from: 6, to: 7 });
    expect(n.cities.meadowville.board[6]).toEqual(house(3));
    expect(n.cities.meadowville.board[7]).toEqual(house());
  });
  it.each([
    { from: 6, to: 0 },
    { from: 6, to: 6 },
    { from: 8, to: 6 },
    { from: -1, to: 6 },
    { from: 6, to: 99 },
  ])("rejects invalid move %j", (move) => {
    const s = two();
    expect(transition(s, { type: "move", ...move })).toEqual(s);
  });
  it("does not move buildings onto crates", () => {
    const s = two();
    s.cities.meadowville.board[8] = { kind: "crate" };
    expect(transition(s, { type: "move", from: 6, to: 8 })).toEqual(s);
  });
  it("does not merge beyond tier 20", () => {
    const s = two(20),
      n = transition(s, { type: "move", from: 6, to: 7 });
    expect(n.cities.meadowville.board[7]).toEqual(house(20));
    expect(n.cities.meadowville.xp).toBe(0);
  });
  it("pauses a full board, preserves progress and resumes after recycling", () => {
    let s = newGame(start);
    for (const i of unlocked(0)) s.cities.meadowville.board[i] = house();
    s.cities.meadowville.crateProgress = 4;
    s = advance(s, start + 20000);
    expect(s.cities.meadowville.crateProgress).toBe(4);
    expect(s.cities.meadowville.generated).toBe(0);
    s = transition(s, { type: "recycle", index: 6 });
    s = advance(s, start + 26000);
    expect(s.cities.meadowville.generated).toBe(1);
  });
  it("recycles without a currency requirement", () => {
    const s = two();
    s.cities.meadowville.coins = 0;
    const n = transition(s, { type: "recycle", index: 6 });
    expect(n.cities.meadowville.board[6]).toBeNull();
    expect(n.cities.meadowville.coins).toBeGreaterThan(0);
  });
});
describe("economy and progression", () => {
  it("uses documented early incomes and configured late progression", () => {
    expect(BUILDINGS.meadowville.slice(0, 10).map((b) => b.income)).toEqual([
      1.2, 4, 12, 30, 64, 130, 270, 550, 1120, 2400,
    ]);
    expect(building("meadowville", 11).income).toBeCloseTo(4920);
    expect(BUILDINGS.sunshore).toHaveLength(20);
  });
  it("counts only buildings and integrates fractional real time", () => {
    const s = two();
    s.cities.meadowville.board[8] = { kind: "crate" };
    expect(income(s, "meadowville")).toBe(2.4);
    expect(advance(s, start + 1250).cities.meadowville.coins).toBeCloseTo(23);
  });
  it("purchases discovered buildings and charges correct prices", () => {
    const s = two(),
      n = transition(s, { type: "buy", tier: 1 });
    expect(n.cities.meadowville.coins).toBe(
      20 - building("meadowville", 1).price,
    );
    expect(n.cities.meadowville.purchases).toBe(1);
  });
  it("rejects unaffordable, undiscovered, and full-board purchases", () => {
    const s = two();
    expect(transition(s, { type: "buy", tier: 20 })).toEqual(s);
    s.cities.meadowville.coins = 0;
    expect(transition(s, { type: "buy", tier: 1 })).toEqual(s);
    s.cities.meadowville.coins = 100;
    for (const i of unlocked(0)) s.cities.meadowville.board[i] = house();
    expect(transition(s, { type: "buy", tier: 1 })).toEqual(s);
  });
  it("awards source-tier XP, levels up, and unlocks land gradually", () => {
    const s = two(2),
      n = transition(s, { type: "move", from: 6, to: 7 });
    expect(n.cities.meadowville.xp).toBe(2);
    expect(level(2)).toBe(2);
    expect(emptyPlots(n.cities.meadowville).length).toBe(6);
    expect(plotCount(0)).toBe(6);
    expect(plotCount(threshold(15))).toBe(25);
  });
  it("unlocks second city only at Meadowville level eight", () => {
    let s = newGame(start);
    expect(cityUnlocked(s, "sunshore")).toBe(false);
    expect(
      transition(s, { type: "switch", city: "sunshore" }).selectedCity,
    ).toBe("meadowville");
    s.cities.meadowville.xp = 90;
    s = transition(s, { type: "switch", city: "sunshore" });
    expect(s.selectedCity).toBe("sunshore");
    expect(s.cities.sunshore.coins).toBe(20);
  });
  it("upgrades income and speed using increasing costs", () => {
    let s = two();
    s.cities.meadowville.xp = 13;
    s.cities.meadowville.coins = 1000;
    expect(upgradeCost("speed", 1)).toBeGreaterThan(upgradeCost("speed", 0));
    s = transition(s, { type: "upgrade", id: "income" });
    expect(income(s, "meadowville")).toBe(3);
    s = transition(s, { type: "upgrade", id: "speed" });
    expect(interval(s, "meadowville")).toBeCloseTo(8.6);
  });
  it("better crates raise the minimum tier and discover it", () => {
    let s = newGame(start);
    s.cities.meadowville.upgrades.quality = 2;
    s = transition(s, { type: "tap" });
    const index = s.cities.meadowville.board.findIndex(
      (t) => t?.kind === "crate",
    );
    s = transition(s, { type: "open", index });
    expect(
      (s.cities.meadowville.board[index] as any).tier,
    ).toBeGreaterThanOrEqual(3);
  });
  it("tracks achievements and claims each reward once", () => {
    let s = transition(two(), { type: "move", from: 6, to: 7 });
    expect(achievements(s).find((a) => a.id === "first")?.progress).toBe(1);
    s = transition(s, { type: "claim", id: "first" });
    expect(s.claimed).toEqual(["first"]);
    expect(transition(s, { type: "claim", id: "first" })).toEqual(s);
  });
});
describe("Sunshore neighborhoods", () => {
  it("doubles 3x3 neighbor income with deterministic nonstacking overlaps", () => {
    const s = coast(),
      c = s.cities.sunshore;
    c.xp = 13;
    c.board[6] = house(4, true);
    c.board[7] = house(4, true);
    c.board[12] = house(1);
    c.board[18] = house(1);
    expect(proximity(c, 12)).toBe(true);
    expect(tileIncome(s, "sunshore", 12)).toBe(2.4);
    expect(tileIncome(s, "sunshore", 18)).toBe(1.2);
    expect(tileIncome(s, "sunshore", 6)).toBe(60);
  });
  it("does not wrap bonus across board rows", () => {
    const s = coast(),
      c = s.cities.sunshore;
    c.xp = 1260;
    c.board[4] = house(4, true);
    c.board[5] = house();
    expect(proximity(c, 5)).toBe(false);
  });
  it("party upgrade costs coins and requires tier four", () => {
    let s = coast(),
      c = s.cities.sunshore;
    c.board[6] = house(4);
    c.coins = 500;
    s = transition(s, { type: "party", index: 6 });
    expect(s.cities.sunshore.board[6]).toEqual(house(4, true));
    expect(s.cities.sunshore.coins).toBe(140);
  });
  it("continues income in both cities while switching", () => {
    let s = coast();
    s.cities.meadowville.board[6] = house();
    s.cities.sunshore.board[6] = house(2);
    s = advance(s, start + 10000);
    expect(s.cities.meadowville.coins).toBeCloseTo(32);
    expect(s.cities.sunshore.coins).toBeCloseTo(60);
  });
});
describe("clock and persistence", () => {
  it("calculates capped offline income and crates only to capacity", () => {
    const s = two(),
      r = offline(s, start + 12 * 3600 * 1000);
    expect(r.seconds).toBe(28800);
    expect(r.earnings[0].coins).toBeCloseTo(2.4 * 28800);
    expect(r.state.cities.meadowville.generated).toBe(4);
    expect(emptyPlots(r.state.cities.meadowville)).toHaveLength(0);
  });
  it("does not duplicate income on repeated timestamp or visibility events", () => {
    const s = two(),
      a = advance(s, start + 20000),
      b = advance(a, start + 20000);
    expect(b).toEqual(a);
    expect(advance(a, start - 1000)).toEqual(a);
  });
  it("integrates boost expiration precisely and preserves it on city switch", () => {
    let s = two();
    s = transition(s, { type: "boost", id: "income" });
    const coins = s.cities.meadowville.coins;
    s = advance(s, start + 130000);
    expect(s.cities.meadowville.coins - coins).toBeCloseTo(
      2.4 * (120 * 2 + 10),
    );
    expect(s.boosts.tokens).toBe(0);
    expect(transition(s, { type: "boost", id: "income" })).toEqual(s);
  });
  it("handles speed boost expiration and full capacity", () => {
    let s = newGame(start);
    s.cities.meadowville.crateProgress = 0;
    s.cities.meadowville.generated = 5;
    s = transition(s, { type: "boost", id: "speed" });
    s = advance(s, start + 5000);
    expect(s.cities.meadowville.generated).toBe(6);
  });
  it("round-trips the complete save state", () => {
    const s = advance(
      transition(two(), { type: "move", from: 6, to: 7 }),
      start + 2000,
    );
    expect(parseSave(JSON.stringify(s), start + 2000)).toEqual(s);
  });
  it.each(["{", "null", "{}", '{"version":99}'])(
    "rejects malformed or outdated saves %s",
    (raw) => expect(() => parseSave(raw, start)).toThrow(),
  );
  it("rejects invalid boards, values and undiscovered tiers", () => {
    const s = two();
    s.cities.meadowville.coins = -1;
    expect(() => parseSave(JSON.stringify(s), start)).toThrow();
    s.cities.meadowville.coins = 20;
    s.cities.meadowville.board[0] = house();
    expect(() => parseSave(JSON.stringify(s), start)).toThrow();
    s.cities.meadowville.board[0] = null;
    s.cities.meadowville.discovered = [];
    expect(() => parseSave(JSON.stringify(s), start)).toThrow();
  });
  it("has equivalent one-step and segmented advancement including expiring boosts", () => {
    let s = two();
    s = transition(s, { type: "boost", id: "income" });
    const once = advance(s, start + 300000);
    for (let i = 1; i <= 300; i++) s = advance(s, start + i * 1000);
    expect(s.cities.meadowville.coins).toBeCloseTo(
      once.cities.meadowville.coins,
    );
    expect(s.cities.meadowville.board).toEqual(once.cities.meadowville.board);
  });
});
describe("recovery and edge cases", () => {
  it("allows recovery from a full board of entirely different tiers", () => {
    let s = newGame(start);
    unlocked(0).forEach((index, i) => {
      s.cities.meadowville.board[index] = house(i + 1);
    });
    s.cities.meadowville.coins = 0;
    s = transition(s, { type: "recycle", index: 6 });
    expect(emptyPlots(s.cities.meadowville)).toHaveLength(1);
    s = transition(s, { type: "tap" });
    expect(emptyPlots(s.cities.meadowville)).toHaveLength(0);
    expect(s.cities.meadowville.coins).toBeGreaterThan(0);
  });
  it("integrates boosts in the first eight offline hours, not the final eight", () => {
    let s = two();
    s = transition(s, { type: "boost", id: "income" });
    const next = advance(s, start + 12 * 3600000);
    expect(next.cities.meadowville.coins - 20).toBeCloseTo(2.4 * (28800 + 120));
    expect(next.lastTick).toBe(start + 12 * 3600000);
    expect(advance(next, next.lastTick)).toEqual(next);
  });
  it("computes large levels without an unbounded loop", () => {
    expect(level(1e8)).toBe(20 + Math.floor((1e8 - 1260) / 160));
  });
  it("rejects locked upgrades and respects upgrade caps", () => {
    const s = newGame(start);
    s.cities.meadowville.coins = 1e8;
    expect(transition(s, { type: "upgrade", id: "quality" })).toEqual(s);
    s.cities.meadowville.xp = 100;
    s.cities.meadowville.upgrades.speed = 5;
    expect(transition(s, { type: "upgrade", id: "speed" })).toEqual(s);
  });
});

describe("browser storage adapter", () => {
  it("recovers corrupted saves and retains a backup", () => {
    const storage = new Map([[SAVE_KEY, "broken json"]]);
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => storage.set(k, v),
    });
    try {
      const r = loadGame(start);
      expect(r.error).toContain("could not be read");
      expect(r.state).toEqual(newGame(start));
      expect(storage.get(SAVE_KEY + ":recovery")).toBe("broken json");
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it("reports a failed storage write without throwing", () => {
    vi.stubGlobal("localStorage", {
      setItem: () => {
        throw new Error("Quota exceeded");
      },
    });
    try {
      expect(saveGame(newGame(start))).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
