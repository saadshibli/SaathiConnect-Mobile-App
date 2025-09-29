const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'bin' to the list of asset extensions Metro will recognize.
config.resolver.assetExts.push('bin');

module.exports = config;