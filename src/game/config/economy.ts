import type { UpgradeId } from "../types";
export const ECONOMY = {
  initialCoins: 20,
  initialSparks: 1,
  sparkMergeInterval: 5,
  betterCrateExtraChance: 0.2,
  partyMinimumTier: 4,
  xpPerSourceTier: 1,
  offlineCap: 8 * 60 * 60,
  tapSeconds: 1,
  incomePerUpgrade: 0.25,
  speedPerUpgrade: 0.14,
  partyMultiplier: 2,
  partyCostFactor: 12,
  boostDuration: 120,
  boostMultiplier: 2,
  mergeRewardFactor: 6,
  recycleFactor: 0.2,
  onboardingCrates: 4,
  maxTier: 20,
};
export const UPGRADES: Record<
  UpgradeId,
  {
    name: string;
    description: string;
    baseCost: number;
    growth: number;
    max: number;
    unlockLevel: number;
  }
> = {
  speed: {
    name: "Express deliveries",
    description: "14% faster automatic crates per level",
    baseCost: 35,
    growth: 2.7,
    max: 5,
    unlockLevel: 2,
  },
  quality: {
    name: "Better beginnings",
    description: "Raise the minimum building tier in every crate",
    baseCost: 120,
    growth: 5,
    max: 5,
    unlockLevel: 3,
  },
  income: {
    name: "Happy neighborhoods",
    description: "+25% permanent building income per level",
    baseCost: 50,
    growth: 3,
    max: 10,
    unlockLevel: 2,
  },
};
export const upgradeCost = (id: UpgradeId, l: number) =>
  Math.ceil(UPGRADES[id].baseCost * UPGRADES[id].growth ** l);
