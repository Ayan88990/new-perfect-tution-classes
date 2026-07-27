const https = require('https');
const url = 'https://new-perfect-tution-classes.netlify.app';

https.get(url, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    const matches = html.match(/\/_next\/static\/chunks\/[a-zA-Z0-9_-]+\.js/g) || [];
    const scripts = [...new Set(matches)];
    console.log('Found scripts:', scripts.length);
    scripts.forEach(s => {
      https.get(url + s, r => {
        let code = '';
        r.on('data', c => code += c);
        r.on('end', () => {
          if (code.includes('onrender') || code.includes('5000')) {
            console.log('Found in script:', s);
            const m1 = code.match(/https?:\/\/[a-zA-Z0-9.-]*onrender\.com[^\s"'`)]*/g);
            const m2 = code.match(/http:\/\/localhost:5000[^\s"'`)]*/g);
            console.log('onrender:', m1);
            console.log('localhost:5000:', m2);
          }
        });
      });
    });
  });
});
