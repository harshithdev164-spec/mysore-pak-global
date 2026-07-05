#!/usr/bin/env node
/**
 * Postbuild step for Next.js `output: "standalone"`.
 *
 * The standalone build at `.next/standalone/server.js` is intentionally minimal
 * — it does NOT include the `public/` folder or the client-side static chunks
 * under `.next/static/`. We copy both in so `node .next/standalone/server.js`
 * serves the site correctly on Cloudways / any bare Node host.
 *
 * Cross-platform (no shell `cp -R`) — works on Windows dev machines and Linux
 * production servers alike.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");

if (!fs.existsSync(standaloneDir)) {
  console.warn("[postbuild] .next/standalone missing — skipping asset copy. Did `next build` finish?");
  process.exit(0);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// 1. public/  →  .next/standalone/public/
copyDir(path.join(root, "public"), path.join(standaloneDir, "public"));

// 2. .next/static/  →  .next/standalone/.next/static/
copyDir(
  path.join(root, ".next", "static"),
  path.join(standaloneDir, ".next", "static")
);

console.log("[postbuild] copied public/ and .next/static/ into .next/standalone/");
