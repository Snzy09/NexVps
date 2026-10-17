const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../client/dist');
const dest = path.resolve(__dirname, '../public');

if (fs.existsSync(src)) {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log('✅ Copied client/dist to public for Vercel static serving');
}
