# Tiny Town Merge — game design

## Core loop

Generate a crate → open a building → match two identical tiers → earn XP and a small coin reward → grow income → reinvest in buildings and upgrades → unlock land and Sunshore.

The first city begins with six empty plots in a centered 2×3 rectangle. Locked plots stay hidden. Only usable land is visible; the camera starts close to the six plots and smoothly pulls back as new plots unlock. Crate progress begins one second from completion, and each of the first four crates can be delivered with a single tap. There is no mandatory tutorial or input lock.

## Board rules

Each city can grow to 25 plots in a 5×5 board. The straight, enlarged canvas renders only unlocked plots and fits its camera to their current bounds. Decorative trees and scenery gutters are removed; the mobile canvas grows with its width so a mature town uses over 90% of the canvas width even with browser toolbars visible. Configured plot order grows outward from the starting neighborhood. An unlocked plot contains nothing, a crate, or a building.

- Two equal tiers below 20 merge into exactly the next tier in the target plot. Source becomes empty; source tier determines XP. Party status survives a merge.
- Any building can move to any empty unlocked plot, irrespective of adjacency.
- Different tiers swap. Tier 20 pairs swap without merging or awarding XP.
- Crates cannot be dragged, moved onto, or merged. Locked plots, empty sources and self-targeting leave the board unchanged.
- Mouse/touch Pointer Events and tap-to-select/target support the same rules. Keyboard Enter/Space also selects and targets. Matching targets highlight while selected.
- Recycling is always available on a selected building, pays 20% of its shop price, and needs no currency. It provides a recovery route from a full board with no matching tiers.

## Crates

Meadowville's base cycle is 10 seconds; Sunshore's is 20. Waiting adds elapsed seconds and a normal tap adds one second to the same counter. Speed upgrades shorten the threshold; a speed spark doubles automatic progress for two minutes. Manual taps continue to add one second.

Generation chooses a random empty unlocked plot with a persisted seeded linear congruential generator. Opening produces tier `1 + Better beginnings level`, with a 20% chance of one additional tier when that upgrade is owned. Full boards pause generation, preserve bounded cycle progress and show FULL. Opening crates alone does not create empty land. Automatic crates generate during offline advancement until capacity is filled; they do not open or merge themselves.

## Income and progression

Every opened building contributes its configured coins per second. Permanent income upgrades add 25% of base income per level. Party bonuses and temporary income boosts multiply the effective rate. Crates and empty land earn nothing. Currency uses unrounded JavaScript numbers internally; only display values are compacted.

Merging source tier `t` awards `t` XP and six seconds of that tier's base income. The first level-up occurs at two cumulative XP. Cumulative XP thresholds and outward plot order are configured separately. Plot count is `min(25, 6 + floor((level − 1) × 1.4))`. All land is available at level 15. Levels continue after 20 on a 160-XP cadence. Level-ups highlight new plots and show a brief notification.

## Building collection

Both cities have 20 original names and procedurally authored SVG architectural designs. Each tier has its own configured color/roof, income and price; silhouette variations include cottage roofs, wings, turrets, apartments, podiums, setbacks, spires, solar arcs and landmark crowns. Tropical artwork adds coastal palettes and palms. No emoji are used as building art.

| Tier | Meadowville         | Sunshore              |
| ---- | ------------------- | --------------------- |
| 1    | Pocket Cottage      | Beach Bungalow        |
| 2    | Clove Cabin         | Coral Casita          |
| 3    | Willow House        | Palm House            |
| 4    | Garden Villa        | Lagoon Villa          |
| 5    | Maple Manor         | Hibiscus Retreat      |
| 6    | Rosewood Estate     | Sunset Estate         |
| 7    | Orchard Mansion     | Marina Mansion        |
| 8    | Parkside Flats      | Seabreeze Suites      |
| 9    | Terrace Court       | Coral Court           |
| 10   | Market Hall         | Harbor Market         |
| 11   | Foundry Lofts       | Tidewater Lofts       |
| 12   | Glasshouse Offices  | Azure Offices         |
| 13   | Skyline Tower       | Reef Tower            |
| 14   | Emerald Heights     | Golden Heights        |
| 15   | Cloudspire          | Ocean Spire           |
| 16   | Solar Arc           | Solstice Arc          |
| 17   | Verdant Nexus       | Pearl Nexus           |
| 18   | Aurora Observatory  | Starlight Observatory |
| 19   | The Living Landmark | The Coastal Landmark  |
| 20   | Crown of the Meadow | Crown of the Coast    |

Discovery is recorded when a crate opens or a merge creates a tier, never merely by previewing the collection. Shops offer only discovered tiers. Collection silhouettes keep the next discovery visible without opening blocking celebrations.

## Cities

**Meadowville:** grassy platforms, a suburban palette, ten-second deliveries.

**Sunshore:** unlocked at Meadowville level 8; sandy platforms, coastal architecture and colors and twenty-second deliveries. It starts with its own six plots and independent coins, XP, collection, upgrades and board. Both unlocked economies keep running regardless of the active city.

Select a Sunshore tier 4+ building and pay twelve times its base income to host a permanent party. Each host doubles other buildings in its surrounding 3×3 neighborhood, including diagonals. Hosts do not boost themselves. Hosts may receive a bonus from another host. Multiple neighboring hosts grant exactly one 2× bonus, never unlimited stacking. Row/column distance prevents wrapping across board edges.

City state is keyed by city ID, with shared rules and configuration. A later city can extend IDs, configuration, state initialization and art theme without duplicating the engine. A third city is intentionally absent.

## Shop, permanent upgrades and sparks

Purchased buildings appear on a random empty plot immediately. No credit, overspending or purchasing on a full board is allowed. Late-tier shop prices grow more steeply than income so merging remains useful.

| Upgrade             | Maximum | Base cost | Cost growth | Benefit                                   |
| ------------------- | ------- | --------- | ----------- | ----------------------------------------- |
| Express deliveries  | 5       | 35        | ×2.7        | Reduce base interval by 14% per level     |
| Better beginnings   | 5       | 120       | ×5          | Raise minimum crate tier by one per level |
| Happy neighborhoods | 10      | 50        | ×3          | Add 25% base income per level             |

Express deliveries and income upgrades unlock at level 2; Better beginnings unlocks at level 3. Each menu shows current level, next benefit, price and availability.

Players start with one shared spark. Every five merges in either city earns another; claiming any milestone also grants one. A spark activates either 2× income or 2× automatic crate speed for 120 seconds across both cities. The two effects may overlap; an already-active effect cannot be reactivated or stacked. Expiration timestamps persist across reloads and city changes.

## Milestones

Eleven tracked milestones cover 1/10/100 merges, tier 5/10 discovery, 100 coins/sec, 10,000 earned coins, ten purchases, Sunshore unlock, level 10 and all 25 plots. Progress is derived from persisted city statistics. A reward can be claimed once, goes to the selected city's treasury, and includes a spark. No automatic popup blocks play.

## Time and saves

The engine advances from `lastTick` to a real timestamp, rather than relying on timer counts. Both cities integrate income over elapsed seconds. Boost expiration timestamps split integration into deterministic segments. Offline advancement uses the first eight hours after the last accounted timestamp, then moves the timestamp to the present; excess elapsed time is discarded. Crates stop at capacity. Refreshes and repeated visibility events use the same timestamp transition and cannot re-credit elapsed time.

LocalStorage schema v1 includes all city data, RNG seed, selected city, achievements, settings, boosts and the accounting timestamp. Loads/imports reject bad types, invalid boards, impossible upgrade levels, negative/nonfinite balances and unsupported versions. Corrupted saves recover gracefully and retain the unreadable data as a recovery backup when possible. There are no older released schemas to migrate.

Settings offers JSON export/import, manual save, autosave preferences, Light/Dark/System appearance, and a two-step reset. The optional appearance field is migrated into older v1 saves as System, preserving all city progress. The welcome-back report lists already-credited earnings and new crates for every unlocked city.

## Presentation and accessibility

The interface is a single viewport-filling game canvas with a warm cream/green palette, elevated grassy plots, original scalable SVG buildings, separate coastal theming, clear full-board indicators and hidden future land. The city selector, coins, income, XP and sparks form a compact HUD at the top of the same canvas; the delivery crate, shop and four utility buttons form the bottom dock. The town uses all remaining space. There are no website headers, sidebars, footers or page scrolling; menus scroll independently in accessible modal dialogs. Merge bursts, floating XP, opening bounces, plot unlocks, city fades and optional synthesized chimes provide fast feedback. System and in-game reduced-motion preferences suppress animation. Dark mode has separate meadow and coastal night palettes, warm window lighting, dark menus and cards, and native browser color-scheme support. System appearance follows the device; an explicit Light or Dark choice persists across reloads and cities and is applied before the first app paint. All menus are available in the integrated bottom dock; sparks are available from the HUD and Upgrades.

## Differences from the reference

These are design choices, not claims about the original game: instant welcome tapping, faster progression, merge coin rewards, original building names/art, a more expensive later shop, earned sparks without ads, explicit recycling, shared timed boosts, exact offline accounting capped at eight hours, a browser-first interface and transferable JSON saves. See BALANCE.md for historical values and assumptions.
