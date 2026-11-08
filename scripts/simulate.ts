import {
  newGame,
  advance,
  transition,
  emptyPlots,
  achievements,
  income,
} from "../src/game/engine/core";
import { level, unlocked } from "../src/game/config/progression";
import { upgradeCost, UPGRADES } from "../src/game/config/economy";
import { building } from "../src/game/config/buildings";
import type { GameState, UpgradeId } from "../src/game/types";
import { writeFileSync } from "node:fs";
const modes = [
  "Active",
  "Casual",
  "Mostly passive",
  "Aggressive purchases",
  "Full board",
] as const;
const rows: Record<string, unknown>[] = [];
for (const mode of modes) {
  let s = newGame(0, 22113),
    stuck = 0,
    upgrades = 0;
  const timeline: Record<string, number> = {};
  const snapshots: Record<string, unknown>[] = [];
  if (mode === "Full board") {
    for (let i = 0; i < 6; i++)
      s.cities.meadowville.board[[6, 7, 8, 11, 12, 13][i]] = {
        kind: "building",
        tier: i + 1,
        party: false,
      };
    s.cities.meadowville.discovered = [1, 2, 3, 4, 5, 6];
  }
  function act(a: Parameters<typeof transition>[1]) {
    s = transition(s, a);
  }
  function openAndMerge() {
    let c = s.cities.meadowville;
    for (let i = 0; i < 25; i++)
      if (c.board[i]?.kind === "crate") act({ type: "open", index: i });
    let changed = true;
    while (changed) {
      changed = false;
      c = s.cities.meadowville;
      for (let a = 0; a < 25 && !changed; a++)
        for (let b = a + 1; b < 25 && !changed; b++) {
          const x = c.board[a],
            y = c.board[b];
          if (
            x?.kind === "building" &&
            y?.kind === "building" &&
            x.tier === y.tier &&
            x.tier < 20
          ) {
            act({ type: "move", from: a, to: b });
            changed = true;
          }
        }
    }
  }
  for (let second = 1; second <= 900; second++) {
    s = advance(s, second * 1000);
    const active = mode === "Active" || mode === "Aggressive purchases";
    const interact =
      active ||
      (mode === "Casual" && second % 8 === 0) ||
      (mode === "Mostly passive" && second % 60 === 0) ||
      (mode === "Full board" && second % 15 === 0);
    if (interact) {
      if (mode === "Full board" && second < 180) {
        for (let k = 0; k < 4; k++) act({ type: "tap" });
        for (let i = 0; i < 25; i++)
          if (s.cities.meadowville.board[i]?.kind === "crate")
            act({ type: "open", index: i });
      } else {
        if (mode === "Full board" && second === 180) {
          act({ type: "recycle", index: 6 });
          act({ type: "buy", tier: 2 });
        }
        openAndMerge();
        for (let n = 0; n < (active ? 2 : mode === "Casual" ? 3 : 0); n++)
          act({ type: "tap" });
        openAndMerge();
        const c = s.cities.meadowville;
        if (mode !== "Mostly passive") {
          for (const key of ["quality", "speed", "income"] as UpgradeId[]) {
            if (
              c.coins >= upgradeCost(key, c.upgrades[key]) &&
              c.upgrades[key] < UPGRADES[key].max &&
              level(c.xp) >= UPGRADES[key].unlockLevel
            ) {
              act({ type: "upgrade", id: key });
              upgrades++;
              break;
            }
          }
        }
        if (
          mode === "Aggressive purchases" ||
          (mode === "Active" && second % 3 === 0) ||
          (mode === "Casual" && second % 24 === 0)
        ) {
          const c = s.cities.meadowville,
            tier = [...c.discovered]
              .sort((a, b) => b - a)
              .find((t) => c.coins >= building("meadowville", t).price);
          if (tier && emptyPlots(c).length) act({ type: "buy", tier });
          openAndMerge();
        }
        if (active) {
          for (const a of achievements(s))
            if (a.progress >= a.target && !s.claimed.includes(a.id))
              act({ type: "claim", id: a.id });
        }
        if (!emptyPlots(s.cities.meadowville).length) {
          const c = s.cities.meadowville,
            candidates = c.board
              .map((t, i) => ({ t, i }))
              .filter((v) => v.t?.kind === "building")
              .sort((a, b) => (a.t as any).tier - (b.t as any).tier);
          if (candidates.length)
            act({ type: "recycle", index: candidates[0].i });
        }
      }
    }
    const c = s.cities.meadowville;
    const canMerge = c.board.some(
      (a, i) =>
        a?.kind === "building" &&
        c.board.some(
          (b, j) =>
            j !== i &&
            b?.kind === "building" &&
            b.tier === a.tier &&
            a.tier < 20,
        ),
    );
    if (!emptyPlots(c).length && !canMerge) stuck++;
    for (const [name, reached] of Object.entries({
      firstMerge: c.merges > 0,
      tier3: c.discovered.some((t) => t >= 3),
      tier5: c.discovered.some((t) => t >= 5),
      sunshore: level(c.xp) >= 8,
      tier20: c.discovered.includes(20),
    })) {
      if (reached && timeline[name] === undefined) timeline[name] = second;
    }
    if ([15, 60, 180, 300, 900].includes(second))
      snapshots.push({
        seconds: second,
        earned: Math.round(c.earned),
        coins: Math.round(c.coins),
        income: Number(income(s, "meadowville").toFixed(1)),
        merges: c.merges,
        bestTier: Math.max(0, ...c.discovered),
        level: level(c.xp),
        plots: unlocked(c.xp).length,
        upgrades,
        blockedSeconds: stuck,
      });
  }
  rows.push({ mode, timeline, snapshots });
}
const output = {
  seed: 22113,
  durationSeconds: 900,
  notes:
    "Bots open all crates and merge all pairs at interaction times. Full board starts with six distinct building tiers and intentionally waits 180s before using the free recycle recovery. Blocked seconds means a full board without a matching pair; recycling remains available. Active bots tap twice/second. Casual bots interact every 8s; passive bots every 60s.",
  results: rows,
};
writeFileSync("balance-results.json", JSON.stringify(output, null, 2));
console.log(JSON.stringify(output, null, 2));
