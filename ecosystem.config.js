/**
 * PM2 config for Cloudways (or any bare Node.js host).
 *
 * Runs the Next.js standalone server bundle produced by `next build` with
 * `output: "standalone"` in next.config.mjs.
 *
 * On the Cloudways droplet:
 *   cd applications/<app-id>/public_html
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup   # copy the printed command and run as root
 *
 * The Apache .htaccess proxy in public_html/ must forward traffic to
 * http://127.0.0.1:3000/  (see docs/cloudways-setup.md if we add one).
 */
module.exports = {
  apps: [
    {
      name: "wmp",
      script: ".next/standalone/server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "900M",
      time: true,
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000,
        // Bind to localhost only — Apache/Nginx reverse-proxies public traffic.
        HOSTNAME: "127.0.0.1",
      },
    },
  ],
};
