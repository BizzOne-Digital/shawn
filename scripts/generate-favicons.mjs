/**
 * Regenerate tab icons from public/images/logo.png (run after logo changes).
 * Usage: node scripts/generate-favicons.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const logo = path.join(root, "public", "images", "logo.png");
const bg = { r: 10, g: 22, b: 40, alpha: 1 };

async function writeIcon(outPath, size) {
  await sharp(logo)
    .resize(size, size, { fit: "contain", background: bg })
    .png()
    .toFile(outPath);
}

await writeIcon(path.join(root, "src", "app", "icon.png"), 32);
await writeIcon(path.join(root, "src", "app", "apple-icon.png"), 180);
await writeIcon(path.join(root, "public", "favicon.png"), 48);

console.log("Favicons updated: src/app/icon.png, apple-icon.png, public/favicon.png");
