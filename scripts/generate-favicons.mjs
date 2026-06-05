// Generate a full cross-device favicon set from public/logo.svg.
//
// Outputs:
//   app/favicon.ico               16/32/48 multi-frame ICO (legacy browsers)
//   app/icon.png                  512x512 full-logo (browser tabs, modern UAs)
//   app/apple-icon.png            180x180 (iOS home screen)
//   public/icon-192.png           192x192 (Android Chrome / general PWA)
//   public/icon-512.png           512x512 (Android Chrome high-res)
//   public/icon-maskable-192.png  192x192 with safe-zone padding (Android adaptive)
//   public/icon-maskable-512.png  512x512 with safe-zone padding (Android adaptive)
//
// The full logo (elephant + WORLD OF MYSORE PAK wordmark) is used for sizes
// >= 180px where the wordmark is legible. Below that (favicon.ico variants,
// when only 16-48 px is rendered), we crop to the elephant motif since
// the wordmark turns to mush at that size.

import sharp from "sharp";
import fs from "node:fs";

const svg = fs.readFileSync("public/logo.svg");
const VIEWBOX = { w: 528.39, h: 615 };

// ── Render the full logo into a transparent square of given size ──
async function renderFull(size, pad = 0.08) {
  const inner = Math.round(size * (1 - pad * 2));
  const rendered = await sharp(svg, { density: 1200 })
    .resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 0 } },
  })
    .composite([{ input: rendered, gravity: "center" }])
    .png()
    .toBuffer();
}

// ── Render just the elephant (top 62% of the logo) ──
async function renderElephant(size, pad = 0.08) {
  const baseW = 2048;
  const baseH = Math.round(baseW * (VIEWBOX.h / VIEWBOX.w));
  const full = await sharp(svg, { density: 1200 })
    .resize({ width: baseW, height: baseH, fit: "fill" })
    .png()
    .toBuffer();
  const cropH = Math.round(baseH * 0.62);
  const cropY = Math.round(baseH * 0.02);
  const cropped = await sharp(full).extract({ left: 0, top: cropY, width: baseW, height: cropH }).toBuffer();
  const trimmed = await sharp(cropped).trim().toBuffer();
  const meta = await sharp(trimmed).metadata();
  const inner = Math.round(size * (1 - pad * 2));
  const fitW = meta.width >= meta.height ? inner : Math.round((inner * meta.width) / meta.height);
  const fitH = meta.height >= meta.width ? inner : Math.round((inner * meta.height) / meta.width);
  const sized = await sharp(trimmed)
    .resize({ width: fitW, height: fitH, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 0 } },
  })
    .composite([{ input: sized, gravity: "center" }])
    .png()
    .toBuffer();
}

// ── Maskable icon: Android adaptive icons crop edges, so the logo must
// fit inside a ~40% safe zone (very generous padding) ──
async function renderMaskable(size) {
  // 80% padding means the icon occupies only 40% diameter centrally.
  // Brand-coloured background so it doesn't show transparency.
  const inner = Math.round(size * 0.4);
  const rendered = await sharp(svg, { density: 1200 })
    .resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 27, g: 58, b: 45, alpha: 1 } }, // #1B3A2D brand green
  })
    .composite([{ input: rendered, gravity: "center" }])
    .png()
    .toBuffer();
}

// ── ICO container builder ──
function makeIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const dirs = [], imgs = [];
  let offset = 6 + pngs.length * 16;
  for (const { size, data } of pngs) {
    const d = Buffer.alloc(16);
    d.writeUInt8(size === 256 ? 0 : size, 0);
    d.writeUInt8(size === 256 ? 0 : size, 1);
    d.writeUInt8(0, 2);
    d.writeUInt8(0, 3);
    d.writeUInt16LE(1, 4);
    d.writeUInt16LE(32, 6);
    d.writeUInt32LE(data.length, 8);
    d.writeUInt32LE(offset, 12);
    dirs.push(d);
    imgs.push(data);
    offset += data.length;
  }
  return Buffer.concat([header, ...dirs, ...imgs]);
}

// ── Generate everything ──
console.log("Rendering icons…");
const fav16 = await renderElephant(16, 0.04);
const fav32 = await renderElephant(32, 0.06);
const fav48 = await renderElephant(48, 0.06);
const icon512 = await renderFull(512, 0.08);
const apple180 = await renderFull(180, 0.08);
const icon192 = await renderElephant(192, 0.10);
const iconBig512 = await renderFull(512, 0.08); // alias of icon.png; explicit for manifest clarity
const maskable192 = await renderMaskable(192);
const maskable512 = await renderMaskable(512);

const ico = makeIco([
  { size: 16, data: fav16 },
  { size: 32, data: fav32 },
  { size: 48, data: fav48 },
]);

fs.writeFileSync("app/favicon.ico", ico);
fs.writeFileSync("app/icon.png", icon512);
fs.writeFileSync("app/apple-icon.png", apple180);
fs.writeFileSync("public/icon-192.png", icon192);
fs.writeFileSync("public/icon-512.png", iconBig512);
fs.writeFileSync("public/icon-maskable-192.png", maskable192);
fs.writeFileSync("public/icon-maskable-512.png", maskable512);

console.log(`
  app/favicon.ico              ${ico.length.toString().padStart(8)} B   (16/32/48 elephant ICO)
  app/icon.png                 ${icon512.length.toString().padStart(8)} B   (512 full logo)
  app/apple-icon.png           ${apple180.length.toString().padStart(8)} B   (180 iOS)
  public/icon-192.png          ${icon192.length.toString().padStart(8)} B   (192 elephant — Android)
  public/icon-512.png          ${iconBig512.length.toString().padStart(8)} B   (512 full — PWA hi-res)
  public/icon-maskable-192.png ${maskable192.length.toString().padStart(8)} B   (192 maskable — adaptive)
  public/icon-maskable-512.png ${maskable512.length.toString().padStart(8)} B   (512 maskable — adaptive)
`);
