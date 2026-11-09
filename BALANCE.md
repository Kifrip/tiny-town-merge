# Tiny Town Merge — balance and measurements

## Evidence and assumptions

The following first-city income values were supplied in the project brief as historical values attributed to the building guides below. They are implemented exactly; this project does **not** claim to have independently verified the current mobile game's economy.

| Tier | Base coins / second |
| ---- | ------------------: |
| 1    |                 1.2 |
| 2    |                   4 |
| 3    |                  12 |
| 4    |                  30 |
| 5    |                  64 |
| 6    |                 130 |
| 7    |                 270 |
| 8    |                 550 |
| 9    |                1120 |
| 10   |                2400 |

All later incomes, Sunshore incomes, prices, XP thresholds, land unlocks, rewards, upgrade costs and time caps are original balancing assumptions, not verified original-game formulas. Sunshore intentionally uses the same base income curve with slower deliveries and an additional proximity strategy.

References supplied with the brief:

- [Gram Games description](https://www.gram.gs/game-detail-merge-town.html)
- [Android listing](https://merge-town.en.uptodown.com/android)
- [Pocket Gamer gameplay tips](https://www.pocketgamer.com/merge-town/merge-town-tips-and-tricks-how-to-efficiently-grow-your-ever-expanding-city/)
- [Player.One building economy guide](https://www.player.one/merge-town-game-all-buildings-guide-tips-tricks-every-house-ios-android-119870)

## Formulas and configuration

Edit `src/game/config/` to rebalance; React does not own economy calculations.

- **Income tiers 11–20:** `2400 × 2.05^(tier − 10)`, retaining fractional values internally.
- **Building prices:** `ceil(baseIncome × multiplier)`. Multipliers are 16 at tier 1, 25 at tier 2, 35 at tier 3; from tier 4 onward, `40 × 1.55^(tier − 4)`.
- **Effective tile income:** `baseIncome × (1 + 0.25 × incomeUpgradeLevel) × partyFactor × temporaryIncomeFactor`.
- **Party factor:** 2 if at least one _other_ Sunshore party host is within one row and one column; otherwise 1. Overlaps never increase this factor beyond 2.
- **Temporary income factor:** 2 during an active spark, otherwise 1. Income boost and party bonus may combine for 4× before the permanent multiplier.
- **Crate threshold:** `cityBaseInterval × (1 − 0.14 × speedUpgradeLevel)`. Baselines: 10 seconds and 20 seconds. The maximum upgrade reduces these to 3 and 6 seconds.
- **Crate progress:** real elapsed seconds, doubled during a speed spark; normal taps add one second. First four deliveries accept a full-cycle welcome tap. Automatic generation stops at capacity without deleting crates.
- **Crate contents:** `1 + qualityUpgradeLevel`, plus one tier on a seeded 20% roll when quality is owned.
- **Upgrade cost:** `ceil(baseCost × growth^currentLevel)`. Speed: 35/×2.7/max 5. Quality: 120/×5/max 5. Income: 50/×3/max 10.
- **Merge XP:** source tier. **Merge coin reward:** six seconds of source-tier base income, independent of temporary multipliers.
- **Recycle refund:** 20% of configured shop price. **Party-host cost:** twelve seconds of that tier's base income.
- **Sparks:** one initially, one per five city merges, one per milestone claimed. Each activation lasts 120 seconds and applies in both cities.
- **Initial coins:** 20 per city. The first tier costs 20 coins, making the shop usable immediately after the first discovery.
- **Offline time:** first eight hours since the last accounted timestamp. Split at boost expirations; credit both unlocked cities; generate crates only to capacity. Advance the accounting timestamp all the way to the present to discard excess time and prevent duplicate claims.

Cumulative XP thresholds for levels 1–20:

`0, 2, 6, 13, 24, 40, 62, 90, 125, 168, 220, 282, 355, 440, 538, 650, 777, 920, 1080, 1260`

After level 20, every 160 XP grants another level. Sunshore unlocks at Meadowville level 8 (90 cumulative XP). Upgrades unlock at levels 2/3. Plot count is `min(25, 6 + floor((level − 1) × 1.4))`: 6 initially, 10 at level 4, 15 at level 8, 18 at level 10, 25 at level 15. Plot positions follow `PLOT_ORDER`, keeping the initial 2×3 neighborhood contiguous and expanding outward.

## Deterministic simulation

Reproduce with `npm run simulate`. Full machine-readable snapshots at 15, 60, 180, 300 and 900 seconds are committed in `balance-results.json`. The seed is **22113**; every scenario runs for **900 seconds**. The script uses the same immutable engine as the game, with one-second clock increments and no browser rendering.

Policies:

1. **Active:** two delivery taps per second, open all available crates and merge every pair at each interaction, buy the highest affordable discovered tier every three seconds, prioritize available quality/speed/income upgrades, and claim milestones.
2. **Casual:** interact every eight seconds, tap three times, open and merge, buy every 24 seconds and reinvest in upgrades. Does not claim milestones automatically.
3. **Mostly passive:** open and merge once per minute; no taps, purchases, upgrades or reward claiming. Between interactions all time and income advance normally.
4. **Aggressive purchases:** active policy with a purchase opportunity every second.
5. **Full board recovery:** synthetic initial board containing six distinct tiers (1–6), no legal merges, six unlocked plots and no special currency. Deliberately waits until second 180; then recycles tier 1, buys a discovered matching tier 2, merges the resulting chain and resumes periodic interaction. This is a targeted recovery stress test, not a normal new-game benchmark.

Bots merge and navigate instantly, without human decision or animation time. Active-policy timings are optimistic lower bounds, not promised human completion times. These scenarios use Meadowville only, do not spend sparks and do not model Sunshore party placements. Two-city income and party correctness are tested separately. Longer-term enjoyment still needs human playtesting; simulation establishes reachable pacing and catches runaway reinvestment or blocked states.

### Results at 15 minutes

| Policy               | Gross coins earned |    Balance |    Coins/sec | Merges | Best tier | Level | Plots | Upgrades | Blocked seconds |
| -------------------- | -----------------: | ---------: | -----------: | -----: | --------: | ----: | ----: | -------: | --------------: |
| Active               |      2,212,457,697 | 20,037,206 |    7,833,290 |  1,177 |        19 |    71 |    25 |       20 |               0 |
| Casual               |        310,367,799 | 17,908,909 |  1,100,395.4 |    426 |        16 |    31 |    25 |       20 |               0 |
| Mostly passive       |            148,757 |    148,777 |          364 |     85 |         7 |     9 |    17 |        0 |              29 |
| Aggressive purchases |      5,301,035,497 | 25,564,412 | 19,857,236.6 |  1,779 |        20 |   112 |    25 |       20 |               0 |
| Full board           |         43,195,107 | 41,622,171 |    150,956.5 |    217 |        14 |    21 |    25 |       20 |             179 |

"Gross coins earned" includes income, merge rewards, recycle refunds and claimed milestone rewards; it is not current spendable balance. Upgrades counts purchased levels, not upgrade categories. "Blocked seconds" counts a full board with no mergeable building pair. Opening crates or recycling still remains available; this metric does not mean a permanent softlock.

### Short-session snapshots

| Policy               | 15s best tier / level | 60s best tier / level | 3m best tier / level | 5m best tier / level |
| -------------------- | --------------------- | --------------------- | -------------------- | -------------------- |
| Active               | 5 / 4                 | 10 / 12               | 14 / 21              | 16 / 29              |
| Casual               | 3 / 2                 | 6 / 5                 | 11 / 13              | 13 / 17              |
| Mostly passive       | 0 / 1                 | 3 / 2                 | 5 / 5                | 5 / 6                |
| Aggressive purchases | 6 / 6                 | 11 / 14               | 15 / 27              | 17 / 40              |
| Full board           | 6 / 1                 | 6 / 1                 | 7 / 4                | 9 / 8                |

The casual policy reaches its first merge and tier 3 at eight seconds, tier 5 at 48 seconds, and Sunshore at 88 seconds. Actual players need additional navigation and decision time. Active and aggressive policies have zero measured blocked seconds. Mostly passive play reaches tier 7, level 9 and 364 coins/sec without spending its accumulated currency. The full-board stress test recovers at second 180 after 179 recorded blocked seconds, then continues to tier 14; it does not need ads, paid currency, or a reset.

## Adjustments made from simulation

The first run used approximately 16–25 seconds of base income as the purchase price at every tier. Aggressive reinvestment reached tier 20 by the three-minute snapshot and then stopped producing discoveries. This was too fast for repeat visits.

The final price curve keeps the entry tier affordable but escalates later-tier payback with `1.55^(tier − 4)`. In the final run, the active policy reaches tier 19 at 15 minutes; aggressive shopping reaches tier 20 at second 702. Both retain a second city to develop. The casual policy continues discovering buildings throughout the full 15-minute run. Perfect play can still progress very quickly: that is an explicit short-session tradeoff, not a claim of indefinite content.

The current economy favors active merging while allowing meaningful unattended income. No normal-play simulated policy remains blocked without a recovery interaction. The three-minute full-board waiting period is deliberately imposed by the stress test.

## Validation and limits

Engine tests cover merges, invalid operations, moves, swaps, crates, shared progress, full-board pause/resume/recycling, the documented income values, purchases, upgrades and caps, XP/land/city unlocks, deterministic nonstacking proximity, both-city income, timed boosts, eight-hour capped offline integration, repeated timestamps, save round trips, malformed save rejection, corruption backup and storage failures.

Playwright exercises desktop and 360px mobile Chromium, real touchscreen tapping in the mobile core journey, mouse Pointer Events dragging, keyboard selection, menu dismissal, imports/exports, save persistence, offline welcome-back accounting and Sunshore party persistence. These checks do not substitute for physical-device Safari/Firefox testing.

Currency uses IEEE-754 floating-point numbers (fractional coins are preserved; normal floating-point rounding applies). There is no prestige or third city in this release. Save data is local to an origin and simultaneous-tab editing is not coordinated. These limits do not prevent the complete single-tab gameplay loop.

Final execution: **62/62 unit tests**, **22/22 browser tests**, **2/2 production smoke viewport checks**, and the production build passed. Production checks verified the merge/save/refresh loop, integrated controls without page scrolling, bottom-menu viewport fit, zero runtime exceptions, and zero external runtime requests. All five simulation outputs reproduced exactly after the final configuration changes.
