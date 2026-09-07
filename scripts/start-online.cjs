const { spawn } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const apiPort = process.env.API_PORT || '5001';
const publicPort = process.env.PORT || '3000';
const children = [];

function start(script, env) {
  const child = spawn(process.execPath, [path.join(root, script)], {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  });
  children.push(child);
  child.on('exit', (code) => {
    if (code && code !== 0) shutdown(code);
  });
}

function shutdown(code = 0) {
  for (const child of children) child.kill();
  process.exit(code);
}

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());

start('artifacts/api-server/dist/index.mjs', { PORT: apiPort });
start('artifacts/miranha-ia/server/serve.js', { PORT: publicPort, API_PORT: apiPort });