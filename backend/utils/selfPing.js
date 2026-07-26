/**
 * selfPing.js — Self-ping service to keep host instance active (e.g. Render free tier)
 */

const https = require('https');
const http = require('http');

function startSelfPing() {
  const SELF_URL = process.env.RENDER_EXTERNAL_URL || `https://tution-back-43qq.onrender.com`;
  const PING_INTERVAL = 9 * 60 * 1000; // Every 9 minutes

  setInterval(() => {
    try {
      const url = new URL(`${SELF_URL}/api/health`);
      const client = url.protocol === 'https:' ? https : http;
      const req = client.get(url.href, (res) => {
        console.log(`🏓 Self-ping OK — Status: ${res.statusCode}`);
        res.resume();
      });
      req.on('error', (err) => console.warn(`⚠️ Self-ping failed: ${err.message}`));
      req.setTimeout(10000, () => { req.destroy(); });
    } catch (e) {
      console.warn('⚠️ Self-ping URL error:', e.message);
    }
  }, PING_INTERVAL);

  console.log('🏓 Self-ping service started (every 9 minutes)');
}

module.exports = startSelfPing;
