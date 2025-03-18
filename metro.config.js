// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Increase the max workers to improve performance
config.maxWorkers = 2;

// Increase the transformer's memory limit
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer.minifierConfig,
    compress: {
      ...config.transformer.minifierConfig?.compress,
      reduce_vars: false, // Reduces memory usage
    },
  },
  // Disable source maps in development to reduce memory usage
  sourceMap: false,
};

// Optimize the resolver
config.resolver = {
  ...config.resolver,
  useWatchman: false, // Disable watchman to reduce memory usage
  // Add any specific module exclusions if needed
  blockList: [
    /\/\.git\/.*/,
    /\/node_modules\/.*\/node_modules\/.*/,
  ],
};

module.exports = config;