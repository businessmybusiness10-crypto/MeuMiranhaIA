const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Keep Metro from watching pnpm's ephemeral task state outside the app.
config.watchFolders = [__dirname];
config.resolver.blockList = [
	/node_modules[\\/]\.pnpm-task-run-state-v1[\\/]/,
];

module.exports = config;
