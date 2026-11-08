import type { GameState, CityId } from "../types";
import { newGame, offline } from "../engine/core";
import { CITIES } from "../config/cities";
import { threshold, unlocked } from "../config/progression";
export const SAVE_KEY = "tiny-town-merge:v1";
const numeric = (v: unknown, max = 1e100): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max;
const integer = (v: unknown, max: number) =>
  numeric(v, max) && Number.isInteger(v);
export function parseSave(raw: string, now = Date.now()): GameState {
  if (raw.length > 200000) throw new Error("This save file is too large.");
  const s = JSON.parse(raw);
  if (!s || s.version !== 1)
    throw new Error(
      "Unsupported save version. Please use a Tiny Town Merge v1 save.",
    );
  if (
    !numeric(s.lastTick, now + 60000) ||
    !integer(s.seed, 4294967295) ||
    !["meadowville", "sunshore"].includes(s.selectedCity)
  )
    throw new Error("Invalid save metadata.");
  if (
    !s.boosts ||
    !numeric(s.boosts.incomeUntil, now + 86400000) ||
    !numeric(s.boosts.speedUntil, now + 86400000) ||
    !integer(s.boosts.tokens, 1e9)
  )
    throw new Error("Invalid boosts.");
  if (
    !s.settings ||
    ["sound", "autoSave", "reducedMotion"].some(
      (k) => typeof s.settings[k] !== "boolean",
    ) ||
    !Array.isArray(s.claimed) ||
    s.claimed.length > 100 ||
    s.claimed.some((v: unknown) => typeof v !== "string")
  )
    throw new Error("Invalid preferences or achievements.");
  // Earlier v1 saves did not have an appearance setting. Keep their town intact.
  if (s.settings.theme === undefined) s.settings.theme = "system";
  if (!["system", "light", "dark"].includes(s.settings.theme))
    throw new Error("Invalid color theme.");
  for (const id of ["meadowville", "sunshore"] as CityId[]) {
    const c = s.cities?.[id];
    if (
      !c ||
      !Array.isArray(c.board) ||
      c.board.length !== 25 ||
      !numeric(c.coins) ||
      !integer(c.xp, 1e8) ||
      !numeric(c.crateProgress, 20) ||
      !integer(c.generated, 1e12) ||
      !integer(c.merges, 1e12) ||
      !integer(c.purchases, 1e12) ||
      !numeric(c.earned) ||
      !c.upgrades ||
      !integer(c.upgrades.speed, 5) ||
      !integer(c.upgrades.quality, 5) ||
      !integer(c.upgrades.income, 10)
    )
      throw new Error("Invalid city data.");
    if (
      !Array.isArray(c.discovered) ||
      c.discovered.length > 20 ||
      new Set(c.discovered).size !== c.discovered.length ||
      c.discovered.some((t: unknown) => !integer(t, 20) || Number(t) < 1)
    )
      throw new Error("Invalid collection.");
    c.board.forEach((t: any, i: number) => {
      if (t === null) return;
      if (
        !t ||
        !unlocked(c.xp).includes(i) ||
        !["crate", "building"].includes(t.kind)
      )
        throw new Error("Invalid board.");
      if (
        t.kind === "building" &&
        (!integer(t.tier, 20) ||
          t.tier < 1 ||
          typeof t.party !== "boolean" ||
          !c.discovered.includes(t.tier) ||
          (t.party && (id !== "sunshore" || t.tier < 4)))
      )
        throw new Error("Invalid building.");
    });
  }
  if (
    s.selectedCity === "sunshore" &&
    s.cities.meadowville.xp < threshold(CITIES.sunshore.unlock)
  )
    throw new Error("Sunshore has not been unlocked.");
  return s as GameState;
}
export function loadGame(now = Date.now()) {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { state: newGame(now), report: null, error: "" };
    const old = parseSave(raw, now),
      report = offline(old, now);
    return {
      state: report.state,
      report: report.seconds >= 30 ? report : null,
      error: "",
    };
  } catch {
    try {
      const damaged = localStorage.getItem(SAVE_KEY);
      if (damaged) localStorage.setItem(SAVE_KEY + ":recovery", damaged);
    } catch {
      /* Storage may be unavailable. */
    }
    return {
      state: newGame(now),
      report: null,
      error:
        "Your save could not be read. A fresh town is ready; export or import a backup in Settings. The unreadable save was retained as a recovery backup where storage permits.",
    };
  }
}
export function saveGame(s: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}
export function exportSave(s: GameState) {
  const blob = new Blob([JSON.stringify(s, null, 2)], {
      type: "application/json",
    }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = "tiny-town-merge-save.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
