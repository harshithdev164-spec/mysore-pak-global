#!/usr/bin/env bash
# Cloudways "Deploy after Pull" hook — run automatically by Cloudways after
# it pulls the latest commit from Git. Also runnable manually over SSH:
#   bash scripts/cloudways-deploy.sh
#
# Assumptions:
#   - Node 18+ is on PATH (raise a Cloudways support ticket if not)
#   - PM2 is installed globally under the master user
#   - Environment variables live in .env.production (Cloudways won't inject
#     Apache env vars into the Node process — see docs)

set -euo pipefail

echo "==> Installing dependencies (including devDeps for the build)"
npm ci --include=dev

echo "==> Building Next.js (produces .next/standalone/server.js)"
npm run build

echo "==> Reloading PM2 process"
if pm2 list | grep -q "wmp"; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
  pm2 save
fi

echo "==> Deploy complete. PM2 status:"
pm2 list
