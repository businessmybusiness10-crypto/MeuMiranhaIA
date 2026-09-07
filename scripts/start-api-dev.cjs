const { spawn } = require('node:child_process');

const cwd = __dirname + '/../artifacts/api-server';
const env = { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' };
const build = spawn(process.execPath, ['build.mjs'], { cwd, env, stdio: 'inherit' });

build.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  if (code) process.exit(code);
  const start = spawn(process.execPath, ['--enable-source-maps', 'dist/index.mjs'], {
    cwd,
    env,
    stdio: 'inherit',
  });
  start.on('exit', (startCode, startSignal) => {
    if (startSignal) process.kill(process.pid, startSignal);
    process.exit(startCode ?? 1);
  });
});