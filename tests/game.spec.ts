import { test, expect } from "@playwright/test";
import { newGame } from "../src/game/engine/core";
const saveKey = "tiny-town-merge:v1";
test("complete crate, merge, income, purchase and refresh loop", async ({
  page,
  isMobile,
}) => {
  const click = async (locator: import("@playwright/test").Locator) =>
    isMobile ? locator.tap() : locator.click();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Meadowville", exact: true }),
  ).toBeVisible();
  await expect(page.locator('[data-kind="crate"]')).toHaveCount(1, {
    timeout: 5000,
  });
  await click(page.locator('[data-kind="crate"]').first());
  await click(page.getByTestId("generate"));
  await click(page.locator('[data-kind="crate"]').first());
  const houses = page.locator('[data-kind="building"][data-tier="1"]');
  await expect(houses).toHaveCount(2);
  await click(houses.nth(0));
  await click(houses.nth(1));
  await expect(page.locator('[data-tier="2"]')).toHaveCount(1);
  const before = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).cities.meadowville.coins,
    saveKey,
  );
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).cities.meadowville.coins,
        saveKey,
      ),
    )
    .toBeGreaterThan(before);
  await page.getByRole("button", { name: "Shop", exact: true }).click();
  await page.getByTestId("buy-1").click();
  await expect(
    page.getByRole("dialog").getByText("Pocket Cottage", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close menu" }).click();
  await expect(page.locator('[data-kind="building"]')).toHaveCount(2);
  await page.reload();
  await expect(page.locator('[data-kind="building"]')).toHaveCount(2);
  await expect(page.locator('[data-tier="2"]')).toHaveCount(1);
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("pointer dragging merges and empty land supports tap movement", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTestId("generate").click();
  await page.locator('[data-kind="crate"]').first().click();
  await page.getByTestId("generate").click();
  await page.locator('[data-kind="crate"]').first().click();
  const houses = page.locator('[data-kind="building"]'),
    a = await houses.nth(0).boundingBox(),
    b = await houses.nth(1).boundingBox();
  expect(a && b).toBeTruthy();
  await page.mouse.move(a!.x + a!.width / 2, a!.y + a!.height / 2);
  await page.mouse.down();
  await page.mouse.move(b!.x + b!.width / 2, b!.y + b!.height / 2, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(page.locator('[data-tier="2"]')).toHaveCount(1);
  const house = page.locator('[data-tier="2"]'),
    target = page.locator('[data-kind="empty"]').first(),
    testid = await target.getAttribute("data-testid");
  await house.click();
  await target.click();
  await expect(page.getByTestId(testid!)).toHaveAttribute("data-tier", "2");
});
test("settings import validation, export and reset confirmation", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Settings", exact: true })
    .last()
    .click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":99}'),
  });
  await expect(page.getByRole("alert")).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export save" }).click();
  expect((await download).suggestedFilename()).toBe(
    "tiny-town-merge-save.json",
  );
  const s = newGame();
  s.cities.meadowville.coins = 9876;
  await page.locator('input[type="file"]').setInputFiles({
    name: "town.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(s)),
  });
  await expect(page.getByTestId("coins")).toHaveText("9.9K");
  await page
    .getByRole("button", { name: "Settings", exact: true })
    .last()
    .click();
  await page
    .getByRole("button", { name: "Reset progress", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Yes, reset everything" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keep my town" }).click();
  await expect(page.getByTestId("coins")).toHaveText("9.9K");
});
test("offline earnings are credited once and both cities work", async ({
  page,
}) => {
  const s = newGame(Date.now() - 60000);
  s.cities.meadowville.xp = 90;
  s.cities.meadowville.board[6] = { kind: "building", tier: 1, party: false };
  s.cities.meadowville.discovered = [1];
  s.cities.sunshore.board[6] = { kind: "building", tier: 4, party: false };
  s.cities.sunshore.discovered = [4];
  s.cities.sunshore.coins = 1000;
  await page.addInitScript(
    ({ s, key }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(s));
    },
    { s, key: saveKey },
  );
  await page.goto("/");
  await expect(page.getByRole("dialog")).toContainText("Your town missed you");
  await page.getByRole("button", { name: "Lovely.", exact: false }).click();
  await page.getByRole("button", { name: "Sunshore", exact: true }).click();
  await page.locator('[data-tier="4"]').click();
  await page.getByRole("button", { name: "Host party", exact: false }).click();
  await expect(page.locator(".party-tag")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Sunshore", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".party-tag")).toBeVisible();
});

test("keyboard board controls and modal escape work", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("generate").click();
  await page.locator('[data-kind="crate"]').first().focus();
  await page.keyboard.press("Enter");
  await page.getByTestId("generate").click();
  await page.locator('[data-kind="crate"]').first().focus();
  await page.keyboard.press("Space");
  const houses = page.locator('[data-tier="1"]');
  await houses.nth(0).focus();
  await page.keyboard.press("Enter");
  await houses.nth(1).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-tier="2"]')).toHaveCount(1);
  await page.getByRole("button", { name: "Upgrades", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("only unlocked land appears and the straight camera pulls back on expansion", async ({
  page,
}) => {
  const s = newGame();
  s.cities.meadowville.board[6] = { kind: "building", tier: 2, party: false };
  s.cities.meadowville.board[7] = { kind: "building", tier: 2, party: false };
  s.cities.meadowville.discovered = [2];
  await page.addInitScript(
    ({ s, key }) => localStorage.setItem(key, JSON.stringify(s)),
    { s, key: saveKey },
  );
  await page.goto("/");
  const board = page.getByTestId("board");
  await expect(page.locator("[data-plot]")).toHaveCount(6);
  await expect(page.locator('[data-kind="locked"]')).toHaveCount(0);
  await expect(board).toHaveAttribute("data-rows", "2");
  const initialScale = Number(await board.getAttribute("data-camera-scale"));
  await page.getByTestId("plot-6").click();
  await page.getByTestId("plot-7").click();
  await expect(page.locator("[data-plot]")).toHaveCount(7);
  await expect(page.getByTestId("plot-16")).toBeVisible();
  await expect(board).toHaveAttribute("data-rows", "3");
  expect(Number(await board.getAttribute("data-camera-scale"))).toBeLessThan(
    initialScale,
  );
  // Wait for the camera's transition; matrix off-diagonals must remain zero.
  await expect
    .poll(() =>
      board.evaluate((el) => {
        const m = new DOMMatrix(getComputedStyle(el).transform);
        return [m.b, m.c];
      }),
    )
    .toEqual([0, 0]);
  await expect
    .poll(() =>
      page.getByTestId("plot-16").evaluate((el) => {
        const plot = el.getBoundingClientRect();
        const canvas = el.closest(".landscape")!.getBoundingClientRect();
        return (
          plot.left >= canvas.left &&
          plot.right <= canvas.right &&
          plot.top >= canvas.top &&
          plot.bottom <= canvas.bottom
        );
      }),
    )
    .toBe(true);
});

test("a mature saved city keeps all 25 plots visible and usable", async ({
  page,
}) => {
  const s = newGame();
  s.cities.meadowville.xp = 538;
  s.cities.meadowville.board[24] = { kind: "building", tier: 20, party: false };
  s.cities.meadowville.discovered = [20];
  await page.addInitScript(
    ({ s, key }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(s));
    },
    { s, key: saveKey },
  );
  await page.goto("/");
  await expect(page.locator("[data-plot]")).toHaveCount(25);
  await expect(page.getByTestId("board")).toHaveAttribute("data-columns", "5");
  for (const index of [0, 4, 20, 24]) {
    expect(
      await page.getByTestId(`plot-${index}`).evaluate((el) => {
        const plot = el.getBoundingClientRect(),
          canvas = el.closest(".landscape")!.getBoundingClientRect();
        return (
          plot.left >= canvas.left &&
          plot.right <= canvas.right &&
          plot.top >= canvas.top &&
          plot.bottom <= canvas.bottom
        );
      }),
    ).toBe(true);
  }
  await page.getByTestId("plot-24").click();
  await expect(page.locator(".selection-info")).toContainText(
    "Crown of the Meadow",
  );
  await page.getByTestId("plot-0").click();
  await expect(page.getByTestId("plot-0")).toHaveAttribute("data-tier", "20");
  await page.reload();
  await expect(page.getByTestId("plot-0")).toHaveAttribute("data-tier", "20");
});
