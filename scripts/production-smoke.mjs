import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
try {
  for (const [width, height] of [
    [1440, 1050],
    [360, 800],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [],
      external = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (!r.url().startsWith("http://127.0.0.1:4173/")) external.push(r.url());
    });
    await page.goto("http://127.0.0.1:4173");
    await page.locator('[data-kind="crate"]').first().waitFor();
    await page.locator('[data-kind="crate"]').first().click();
    await page.getByTestId("generate").click();
    await page.locator('[data-kind="crate"]').first().click();
    await page.locator('[data-tier="1"]').nth(0).click();
    await page.locator('[data-tier="1"]').nth(1).click();
    assert.equal(await page.locator('[data-tier="2"]').count(), 1);
    await page.reload();
    await page.locator('[data-tier="2"]').waitFor();
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    const rect = await page
      .getByRole("button", { name: "Shop", exact: true })
      .boundingBox();
    assert(
      rect && rect.y + rect.height <= height,
      "Bottom navigation should fit the viewport",
    );
    console.log(
      `Production smoke passed at ${width}×${height}: merge, save/refresh, layout, no runtime errors or external requests.`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}
