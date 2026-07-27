/**
 * selfPing.js — Keeps free-tier Render backend awake by sending self ping every 14 minutes.
 */

const https = require('https');

function startSelfPing() {
  const SELF_URL = process.env.RENDER_EXTERNAL_URL || `https://new-perfect-tution-classes.onrender.com`;

  setInterval(() => {
    https.get(`${SELF_URL}/api/health`, (res) => {
      console.log(`[SelfPing] Pinged ${SELF_URL} — status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('[SelfPing] Error:', err.message);
    });
  }, 14 * 60 * 1000); // 14 mins
}

module.exports = startSelfPing;
