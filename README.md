# Tiny Town Merge

A complete, original, browser-based merge town game built with React, TypeScript and Vite. Open crates, combine matching buildings, grow a passive economy and discover 40 buildings across leafy Meadowville and tropical Sunshore. No accounts, ads, backend, external runtime requests or paid services.

## Run locally

Requires Node.js 20.19+ (22.12+ recommended) and npm.

```sh
npm install
npm run dev
```

Open the URL printed by Vite, normally http://localhost:5173.

```sh
npm run build
npm run preview
```

The production site is in `dist/`.

## Play

The game fills the browser viewport with a single canvas: a compact top HUD, the town in the middle, and a bottom dock for crates and menus. The enlarged, straight board starts with only six visible plots. New plots appear as levels unlock them; the camera smoothly pulls back to fit the growing town. Existing save positions and neighborhood bonuses retain the same coordinates.

- Your first automatic crate arrives after one second. Tap the large delivery button for instant welcome crates; after the first four, time and taps share the normal delivery counter.
- Tap a crate to open it. Drag identical buildings together, or tap a building and then a matching target, to merge. Selected buildings highlight their matches.
- Drag onto empty land to move; onto a different building tier to swap. Keyboard users can focus plots and press Enter or Space to select and target.
- Every building earns coins, including buildings in the other unlocked city. Shop for discovered buildings; buy permanent city upgrades or spend earned sparks on two-minute global boosts.
- Merges award XP, coins and new land. Sunshore unlocks at Meadowville level 8. In Sunshore, select a tier 4+ building and choose **Host party** to double surrounding buildings' income.
- Full board? Open crates, merge, or select a building and recycle it for coins. No confirmations interrupt ordinary play.
- Milestones grant coins and a spark. The collection shows your discoveries and future silhouettes.

## Saving

LocalStorage stores a versioned, validated save after every gameplay action and every two seconds. Page hiding and page exit also save. Both cities advance from real timestamps; offline progress is capped at eight hours. Timed bonuses expire precisely, and repeated return events cannot claim the same time twice.

Settings includes Light, Dark and System appearance modes, manual saving, JSON export/import, sound, reduced motion, an autosave toggle, and confirmed reset. Theme choices persist across reloads and cities; System follows device appearance changes. Older saves migrate to System without changing town progress. Imports replace the current game: export first to keep another town. Disabling autosave still saves the preference itself. Unsupported or damaged saves recover to a new game and retain the original under `tiny-town-merge:v1:recovery` when storage permits. Storage failures show an export reminder.

Browser storage can be removed by clearing site data, private browsing, or browser eviction. Export saves for durable backups and device transfers. Use one active tab per town; simultaneous-tab editing is not coordinated. There is no cloud synchronization.

## Tests and balance simulation

```sh
npm test
npx playwright install chromium
npm run test:e2e
npm run simulate
```

Playwright uses `/usr/bin/chromium` when available, otherwise its installed Chromium. Override with `CHROMIUM_PATH=/path/to/chromium`. It starts a local Vite server automatically unless one is already running. Both 1440px desktop and 360px mobile projects cover the crate → merge → earn → buy → refresh flow, pointer dragging, moving, imports, exports, offline credit, city switching and party persistence. Unit tests exercise the independently testable engine and save validation.

`npm run simulate` runs five deterministic 15-minute policies and rewrites `balance-results.json`. See [BALANCE.md](BALANCE.md) for the policies, measured results, assumptions and limitations. For a production runtime check, run `npm run preview -- --port 4173` in one terminal and `npm run test:production` in another. This checks merging, reload persistence, viewport fit, runtime errors and absence of external requests against the built files. Browser screenshots can be captured with `node scripts/screenshots.mjs` while the dev server is running (outputs to `/tmp`).

## Deploy

GitHub Pages is deployed automatically by `.github/workflows/deploy-pages.yml` whenever `main` changes. The workflow runs unit tests, builds for `/tiny-town-merge/`, and publishes the artifact using GitHub Pages. The repository Pages source must be set to **GitHub Actions**.

For other hosts, run `npm ci && npm run build`, then upload the contents of `dist/` to any static host: GitHub Pages, Netlify, Cloudflare Pages or a plain web server. No environment variables or server functions are required. For a GitHub Pages project subpath, run `npm run build -- --base=/tiny-town-merge/` and deploy `dist/`. The app uses no route rewrites. Save data is scoped to the site's origin; use export/import when moving hosts.

## Structure

- `src/game/config/`: all buildings, incomes, prices, city parameters, upgrades, progression and economy settings.
- `src/game/engine/core.ts`: immutable, deterministic actions; board rules; RNG; income; bonuses; clock integration; offline reports; achievements. It has no React or browser dependencies.
- `src/game/persistence/saves.ts`: JSON validation, recovery and LocalStorage/file operations.
- `src/components/Building/BuildingArt.tsx`: city-aware renderer for the two user-approved building atlases.
- `src/components/Building/MeadowvilleArt.tsx`: displays the user-selected Meadowville atlas as 20 individually framed, transparent sprites.
- `src/components/Building/SunshoreArt.tsx`: displays the approved tropical atlas for Sunshore with the same row-aware depth ordering.
- `src/assets/buildings/`: local PNG atlases and per-tier frame coordinates. `spritecook-assets.json` records source information and file hashes. No image service is called at runtime.
- `src/components/Art.tsx`: shared crates and original interface icons; no extracted assets or external fonts.
- `src/App.tsx`: game UI, Pointer Events, feedback, menus and optional synthesized audio.
- `src/styles/game.css`: SVG presentation, shared menus, city themes, animations and reduced-motion support.
- `src/styles/play-screen.css`: viewport-filling game canvas, integrated HUD and bottom dock, safe-area spacing and compact phone layouts.
- `src/styles/theme.css`: complete night palettes for both cities, building lighting, menus and accessible appearance controls.
- `src/tests/`, `tests/`, `scripts/`: unit tests, browser tests, reproducible balance simulations and screenshot capture.

See [GAME_DESIGN.md](GAME_DESIGN.md) for rules and [BALANCE.md](BALANCE.md) for economy details. This game is an original interpretation, with its own artwork, names and interface; it is not affiliated with Gram Games.

## Meadowville artwork

Meadowville uses the user's updated 20-building progression: red roofs at tiers 1–6,
blue at 7–12, and emerald glass at 13–20. The local RGBA atlas is 1600×1408;
its dimensions are stored beside the per-tier frame coordinates. Sunshore retains
its separate tropical artwork. Artwork changes do not alter save data or income.

After an approved source sheet has been cleaned, prepare its 20 connected sprites
with `node scripts/import-meadowville.mjs /path/to/sheet.png`. This development-only
tool uses Playwright/Chromium to discard detached debris and near-transparent
matte pixels, isolate the buildings, and pack them into padded cells without
cropping or resizing them. It updates the atlas, frame metadata and source hash.
It fails if the input does not contain 20 separate buildings or a building cannot
fit without cropping. Review the mobile board and collection after importing.

## Verified release checks

The completed implementation passed 62 Vitest cases, 22 Playwright tests across desktop and mobile, production-build smoke checks at both viewport sizes, and `npm run build`. All five deterministic 15-minute simulations reproduced their committed results. Browser automation used Chromium; physical-device Safari and Firefox testing remains outside this verification.
