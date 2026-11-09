// Asset preparation only; no browser or image service is needed at runtime.
// Input: the cleaned, transparent 20-building sheet approved by the user.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { chromium } from "@playwright/test";

if (!process.argv[2]) throw new Error("Usage: node scripts/import-meadowville.mjs sheet.png");
const source = readFileSync(process.argv[2]);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage();
  const result = await page.evaluate(async (data) => {
    const image = new Image();
    image.src = data;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);
    const { width, height } = canvas;
    const source = context.getImageData(0, 0, width, height);
    const labels = new Int32Array(width * height);
    const components = [];
    let id = 0;
    for (let start = 0; start < labels.length; start++) {
      if (labels[start] || source.data[start * 4 + 3] <= 32) continue;
      id++;
      const stack = [start];
      labels[start] = id;
      let area = 0, left = width, right = 0, top = height, bottom = 0;
      while (stack.length) {
        const pixel = stack.pop();
        const x = pixel % width, y = Math.floor(pixel / width);
        area++;
        left = Math.min(left, x); right = Math.max(right, x + 1);
        top = Math.min(top, y); bottom = Math.max(bottom, y + 1);
        const neighbors = [pixel - width, pixel + width];
        if (x > 0) neighbors.push(pixel - 1);
        if (x < width - 1) neighbors.push(pixel + 1);
        for (const next of neighbors) {
          if (next >= 0 && next < labels.length && !labels[next] && source.data[next * 4 + 3] > 32) {
            labels[next] = id;
            stack.push(next);
          }
        }
      }
      if (area > 1000) components.push({ id, area, left, right, top, bottom });
    }
    if (components.length !== 20)
      throw new Error(`Expected 20 separate buildings, found ${components.length}`);
    // Five buildings per row; the source's rows need not be equally tall.
    components.sort((a, b) => a.top - b.top);
    const ordered = [];
    for (let row = 0; row < 4; row++)
      ordered.push(...components.slice(row * 5, row * 5 + 5).sort((a, b) => a.left - b.left));
    const cellWidth = 320, cellHeight = 352, padding = 12;
    const output = document.createElement("canvas");
    output.width = cellWidth * 5;
    output.height = cellHeight * 4;
    const outputContext = output.getContext("2d");
    const frames = ordered.map((part, tier) => {
      const w = part.right - part.left, h = part.bottom - part.top;
      if (w + padding * 2 > cellWidth || h + padding * 2 > cellHeight)
        throw new Error(`Building ${tier + 1} does not fit without cropping`);
      const pixels = new ImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const original = (part.top + y) * width + part.left + x;
        // Keep only this building's connected foreground. This discards detached
        // debris and the near-transparent colored matte left by generation.
        if (labels[original] === part.id)
          pixels.data.set(source.data.subarray(original * 4, original * 4 + 4), (y * w + x) * 4);
      }
      const x = (tier % 5) * cellWidth + Math.floor((cellWidth - w) / 2);
      const y = Math.floor(tier / 5) * cellHeight + cellHeight - padding - h;
      outputContext.putImageData(pixels, x, y);
      return { x: x - 3, y: y - 3, width: w + 6, height: h + 6 };
    });
    return { png: output.toDataURL("image/png").split(",")[1], frames,
      width: output.width, height: output.height };
  }, `data:image/png;base64,${source.toString("base64")}`);
  const png = Buffer.from(result.png, "base64");
  writeFileSync("src/assets/buildings/meadowville-atlas.png", png);
  writeFileSync("src/assets/buildings/meadowville-frames.json", JSON.stringify(result.frames, null, 2) + "\n");
  writeFileSync("src/assets/buildings/meadowville-atlas-size.json",
    JSON.stringify({ width: result.width, height: result.height }, null, 2) + "\n");
  const manifest = JSON.parse(readFileSync("spritecook-assets.json", "utf8"));
  manifest["meadowville-atlas"] = {
    source: "User-approved replacement sheet, cleaned with ChatGPT image editing and isolated into 20 padded frames",
    sha12: createHash("sha256").update(png).digest("hex").slice(0, 12),
    label: "Meadowville tiers 1–20: red 1–6, blue 7–12, emerald 13–20",
  };
  writeFileSync("spritecook-assets.json", JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Prepared ${result.frames.length} isolated RGBA frames in ${result.width}×${result.height}.`);
} finally {
  await browser.close();
}
