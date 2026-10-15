const { spawn } = require('child_process');
const path = require('path');

console.log('=========================================');
console.log('🚀 Starting NexVps Fullstack Development');
console.log('📡 Backend (Express): http://localhost:5000');
console.log('💻 Frontend (Vite):   http://localhost:3000');
console.log('=========================================');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const rootDir = path.resolve(__dirname, '..');

const server = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'server'),
  stdio: 'inherit',
  shell: true
});

const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'client'),
  stdio: 'inherit',
  shell: true
});

const cleanup = (code = 0) => {
  try {
    if (isWindows) {
      if (server.pid) spawn('taskkill', ['/pid', server.pid.toString(), '/f', '/t']);
      if (client.pid) spawn('taskkill', ['/pid', client.pid.toString(), '/f', '/t']);
    } else {
      server.kill();
      client.kill();
    }
  } catch {}
  process.exit(code);
};

process.on('SIGINT', () => cleanup(0));
process.on('SIGTERM', () => cleanup(0));
server.on('exit', (code) => { if (code !== 0) console.log(`[server] exited with code ${code}`); });
client.on('exit', (code) => { if (code !== 0) console.log(`[client] exited with code ${code}`); });
