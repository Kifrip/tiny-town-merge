export type AchievementStat =
  | "merges"
  | "tier"
  | "income"
  | "earned"
  | "purchases"
  | "coast"
  | "level"
  | "plots";
export const ACHIEVEMENTS: {
  id: string;
  title: string;
  description: string;
  stat: AchievementStat;
  target: number;
  reward: number;
}[] = [
  {
    id: "first",
    title: "A town begins",
    description: "Complete your first merge",
    stat: "merges",
    target: 1,
    reward: 30,
  },
  {
    id: "ten",
    title: "Better together",
    description: "Complete 10 merges",
    stat: "merges",
    target: 10,
    reward: 120,
  },
  {
    id: "hundred",
    title: "Master town planner",
    description: "Complete 100 merges",
    stat: "merges",
    target: 100,
    reward: 1500,
  },
  {
    id: "five",
    title: "Room to bloom",
    description: "Discover a tier 5 building",
    stat: "tier",
    target: 5,
    reward: 200,
  },
  {
    id: "tier10",
    title: "Sky’s the limit",
    description: "Discover a tier 10 building",
    stat: "tier",
    target: 10,
    reward: 5000,
  },
  {
    id: "income",
    title: "A bustling little town",
    description: "Generate 100 coins per second",
    stat: "income",
    target: 100,
    reward: 500,
  },
  {
    id: "earned",
    title: "Growing prosperity",
    description: "Earn 10,000 coins in total",
    stat: "earned",
    target: 10000,
    reward: 1000,
  },
  {
    id: "shop",
    title: "Local investor",
    description: "Purchase 10 buildings",
    stat: "purchases",
    target: 10,
    reward: 250,
  },
  {
    id: "coast",
    title: "Hello, sunshine",
    description: "Unlock Sunshore",
    stat: "coast",
    target: 1,
    reward: 750,
  },
  {
    id: "level",
    title: "Mayor material",
    description: "Reach level 10",
    stat: "level",
    target: 10,
    reward: 2000,
  },
  {
    id: "land",
    title: "Room for everyone",
    description: "Unlock all 25 plots",
    stat: "plots",
    target: 25,
    reward: 5000,
  },
];
