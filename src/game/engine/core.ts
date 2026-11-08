import { ACHIEVEMENTS, type AchievementStat } from "../config/achievements";
import type { GameState, CityState, CityId, Action, UpgradeId } from "../types";
import { building } from "../config/buildings";
import { CITY_IDS, CITIES } from "../config/cities";
import { ECONOMY, UPGRADES, upgradeCost } from "../config/economy";
import { level, unlocked } from "../config/progression";
export function newCity(): CityState {
  return {
    board: Array(25).fill(null),
    coins: ECONOMY.initialCoins,
    xp: 0,
    discovered: [],
    upgrades: { speed: 0, quality: 0, income: 0 },
    crateProgress: CITIES.meadowville.interval - 1,
    generated: 0,
    merges: 0,
    purchases: 0,
    earned: 0,
  };
}
export function newGame(now = Date.now(), seed = 78231): GameState {
  return {
    version: 1,
    cities: {
      meadowville: newCity(),
      sunshore: { ...newCity(), crateProgress: CITIES.sunshore.interval - 1 },
    },
    selectedCity: "meadowville",
    lastTick: now,
    seed,
    boosts: { incomeUntil: 0, speedUntil: 0, tokens: ECONOMY.initialSparks },
    claimed: [],
    settings: { sound: false, reducedMotion: false, autoSave: true },
  };
}
export const cityUnlocked = (s: GameState, id: CityId) =>
  id === "meadowville" ||
  level(s.cities.meadowville.xp) >= CITIES.sunshore.unlock;
export const emptyPlots = (c: CityState) =>
  unlocked(c.xp).filter((i) => c.board[i] === null);
export const interval = (s: GameState, id: CityId) =>
  CITIES[id].interval *
  (1 - ECONOMY.speedPerUpgrade * s.cities[id].upgrades.speed);
function random(s: GameState) {
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
export function proximity(c: CityState, index: number): boolean {
  return c.board.some(
    (tile, i) =>
      tile?.kind === "building" &&
      tile.party &&
      i !== index &&
      Math.abs((i % 5) - (index % 5)) <= 1 &&
      Math.abs(Math.floor(i / 5) - Math.floor(index / 5)) <= 1,
  );
}
export function tileIncome(
  s: GameState,
  id: CityId,
  index: number,
  boost = true,
) {
  const c = s.cities[id],
    t = c.board[index];
  return t?.kind === "building"
    ? building(id, t.tier).income *
        (1 + c.upgrades.income * ECONOMY.incomePerUpgrade) *
        (id === "sunshore" && proximity(c, index)
          ? ECONOMY.partyMultiplier
          : 1) *
        (boost && s.boosts.incomeUntil > s.lastTick
          ? ECONOMY.boostMultiplier
          : 1)
    : 0;
}
export const income = (s: GameState, id: CityId, boost = true) =>
  s.cities[id].board.reduce(
    (sum, _, i) => sum + tileIncome(s, id, i, boost),
    0,
  );
function generate(s: GameState, id: CityId) {
  const c = s.cities[id],
    empty = emptyPlots(c);
  if (!empty.length) return false;
  c.board[empty[Math.floor(random(s) * empty.length)]] = { kind: "crate" };
  c.generated++;
  return true;
}
function discover(c: CityState, tier: number) {
  if (!c.discovered.includes(tier)) c.discovered.push(tier);
}
function addCoins(c: CityState, n: number) {
  c.coins += n;
  c.earned += n;
}
function advanceSegment(s: GameState, from: number, to: number) {
  const secs = (to - from) / 1000;
  if (secs <= 0) return;
  for (const id of CITY_IDS) {
    if (!cityUnlocked(s, id)) continue;
    const c = s.cities[id];
    addCoins(
      c,
      income(s, id, false) *
        secs *
        (s.boosts.incomeUntil > from ? ECONOMY.boostMultiplier : 1),
    );
    if (emptyPlots(c).length) {
      c.crateProgress +=
        secs * (s.boosts.speedUntil > from ? ECONOMY.boostMultiplier : 1);
      const int = interval(s, id);
      while (c.crateProgress >= int && emptyPlots(c).length) {
        c.crateProgress -= int;
        generate(s, id);
      }
      c.crateProgress = Math.min(c.crateProgress, int);
    }
  }
}
export function advance(state: GameState, now: number): GameState {
  if (now <= state.lastTick) return state;
  const s = structuredClone(state);
  const start = s.lastTick,
    end = Math.min(now, start + ECONOMY.offlineCap * 1000);
  const cuts = [
    start,
    ...[s.boosts.incomeUntil, s.boosts.speedUntil].filter(
      (t) => t > start && t < end,
    ),
    end,
  ].sort((a, b) => a - b);
  for (let i = 1; i < cuts.length; i++) advanceSegment(s, cuts[i - 1], cuts[i]);
  s.lastTick = now;
  return s;
}
export function transition(
  state: GameState,
  action: Action,
  now = state.lastTick,
): GameState {
  const s = structuredClone(advance(state, now));
  const id = s.selectedCity,
    c = s.cities[id],
    empty = emptyPlots(c);
  const valid = (i: number) =>
    Number.isInteger(i) && unlocked(c.xp).includes(i);
  switch (action.type) {
    case "tap":
      if (empty.length) {
        c.crateProgress +=
          c.generated < ECONOMY.onboardingCrates
            ? interval(s, id)
            : ECONOMY.tapSeconds;
        while (c.crateProgress >= interval(s, id) && emptyPlots(c).length) {
          c.crateProgress -= interval(s, id);
          generate(s, id);
        }
        c.crateProgress = Math.min(c.crateProgress, interval(s, id));
      }
      break;
    case "open":
      if (valid(action.index) && c.board[action.index]?.kind === "crate") {
        const tier = Math.min(
          20,
          1 +
            c.upgrades.quality +
            (c.upgrades.quality > 0 &&
            random(s) < ECONOMY.betterCrateExtraChance
              ? 1
              : 0),
        );
        c.board[action.index] = { kind: "building", tier, party: false };
        discover(c, tier);
      }
      break;
    case "move": {
      const { from, to } = action;
      if (from === to || !valid(from) || !valid(to)) break;
      const a = c.board[from],
        b = c.board[to];
      if (a?.kind !== "building" || b?.kind === "crate") break;
      if (
        b?.kind === "building" &&
        a.tier === b.tier &&
        a.tier < ECONOMY.maxTier
      ) {
        c.board[to] = {
          kind: "building",
          tier: a.tier + 1,
          party: a.party || b.party,
        };
        c.board[from] = null;
        c.xp += a.tier * ECONOMY.xpPerSourceTier;
        c.merges++;
        addCoins(c, building(id, a.tier).income * ECONOMY.mergeRewardFactor);
        discover(c, a.tier + 1);
        if (c.merges % ECONOMY.sparkMergeInterval === 0) s.boosts.tokens++;
      } else {
        c.board[to] = a;
        c.board[from] = b;
      }
      break;
    }
    case "buy":
      if (
        Number.isInteger(action.tier) &&
        c.discovered.includes(action.tier) &&
        empty.length
      ) {
        const price = building(id, action.tier).price;
        if (c.coins >= price) {
          c.coins -= price;
          c.board[empty[Math.floor(random(s) * empty.length)]] = {
            kind: "building",
            tier: action.tier,
            party: false,
          };
          c.purchases++;
        }
      }
      break;
    case "upgrade": {
      const key: UpgradeId = action.id,
        config = UPGRADES[key],
        cost = upgradeCost(key, c.upgrades[key]);
      if (
        c.upgrades[key] < config.max &&
        c.coins >= cost &&
        level(c.xp) >= config.unlockLevel
      ) {
        c.coins -= cost;
        c.upgrades[key]++;
      }
      break;
    }
    case "recycle": {
      const t = c.board[action.index];
      if (valid(action.index) && t?.kind === "building") {
        c.board[action.index] = null;
        addCoins(c, building(id, t.tier).price * ECONOMY.recycleFactor);
      }
      break;
    }
    case "party": {
      const t = c.board[action.index];
      if (
        id === "sunshore" &&
        valid(action.index) &&
        t?.kind === "building" &&
        t.tier >= ECONOMY.partyMinimumTier &&
        !t.party &&
        c.coins >= building(id, t.tier).income * ECONOMY.partyCostFactor
      ) {
        c.coins -= building(id, t.tier).income * ECONOMY.partyCostFactor;
        t.party = true;
      }
      break;
    }
    case "switch":
      if (cityUnlocked(s, action.city)) s.selectedCity = action.city;
      break;
    case "boost": {
      const key = action.id === "income" ? "incomeUntil" : "speedUntil";
      if (s.boosts.tokens > 0 && s.boosts[key] <= s.lastTick) {
        s.boosts.tokens--;
        s.boosts[key] = s.lastTick + ECONOMY.boostDuration * 1000;
      }
      break;
    }
    case "claim": {
      const a = achievements(s).find((a) => a.id === action.id);
      if (a && a.progress >= a.target && !s.claimed.includes(a.id)) {
        s.claimed.push(a.id);
        addCoins(c, a.reward);
        s.boosts.tokens++;
      }
      break;
    }
    case "settings":
      s.settings = { ...s.settings, ...action.settings };
      break;
  }
  return s;
}
export function achievements(s: GameState) {
  const cs = Object.values(s.cities);
  const stats: Record<AchievementStat, number> = {
    merges: cs.reduce((n, c) => n + c.merges, 0),
    tier: Math.max(0, ...cs.flatMap((c) => c.discovered)),
    income: Math.max(...CITY_IDS.map((id) => income(s, id))),
    earned: cs.reduce((n, c) => n + c.earned, 0),
    purchases: cs.reduce((n, c) => n + c.purchases, 0),
    coast: cityUnlocked(s, "sunshore") ? 1 : 0,
    level: Math.max(...cs.map((c) => level(c.xp))),
    plots: Math.max(...cs.map((c) => unlocked(c.xp).length)),
  };
  return ACHIEVEMENTS.map((a) => ({ ...a, progress: stats[a.stat] }));
}
export function offline(state: GameState, now = Date.now()) {
  const next = advance(state, now);
  return {
    state: next,
    seconds: Math.min(
      ECONOMY.offlineCap,
      Math.max(0, (now - state.lastTick) / 1000),
    ),
    earnings: CITY_IDS.filter((id) => cityUnlocked(state, id)).map((id) => ({
      id,
      coins: next.cities[id].coins - state.cities[id].coins,
      crates: next.cities[id].generated - state.cities[id].generated,
    })),
  };
}
