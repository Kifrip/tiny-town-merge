import { existsSync } from "node:fs";
import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
for (const [name, width, height] of [
  ["desktop", 1440, 1050],
  ["mobile", 360, 800],
]) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  await page.goto("http://127.0.0.1:5173");
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `/tmp/tiny-town-${name}.png`, fullPage: true });
  await page.close();
}
await browser.close();
