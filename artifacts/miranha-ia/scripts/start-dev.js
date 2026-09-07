const { spawn } = require('node:child_process');

const port = process.env.PORT || '8081';
const connection = process.env.EXPO_CONNECTION || 'lan';
const env = { ...process.env };

if (process.env.REPLIT_EXPO_DEV_DOMAIN) {
  env.EXPO_PACKAGER_PROXY_URL = `https://${process.env.REPLIT_EXPO_DEV_DOMAIN}`;
}

if (process.env.REPLIT_DEV_DOMAIN) {
  env.EXPO_PUBLIC_DOMAIN = process.env.REPLIT_DEV_DOMAIN;
  env.REACT_NATIVE_PACKAGER_HOSTNAME = process.env.REPLIT_DEV_DOMAIN;
}

if (process.env.REPL_ID) {
  env.EXPO_PUBLIC_REPL_ID = process.env.REPL_ID;
}

const isWindows = process.platform === 'win32';
const command = isWindows ? process.env.ComSpec || 'cmd.exe' : 'pnpm';

function startExpo(mode) {
  const args = isWindows
    ? ['/d', '/s', '/c', `corepack pnpm exec expo start --${mode} --port ${port}`]
    : ['exec', 'expo', 'start', `--${mode}`, '--port', port];
  const child = spawn(command, args, {
    cwd: __dirname + '/..',
    env,
    stdio: 'inherit',
  });

  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    if (mode === 'tunnel' && code !== 0) {
      console.warn('\nExpo tunnel failed (Ngrok may need configuration). Retrying with LAN...');
      startExpo('lan');
      return;
    }
    process.exit(code ?? 1);
  });
}

startExpo(connection);