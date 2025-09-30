// /mobile-app/withAndroidComponentFactory.js

const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidComponentFactory(config) {
  return withAndroidManifest(config, async (config) => {
    // Get the main <application> tag
    const mainApplication = config.modResults.manifest.application[0];

    // Ensure the attributes object ($) exists
    if (!mainApplication.$) {
      mainApplication.$ = {};
    }
    
    // Add the 'tools:replace' attribute to the <application> tag
    mainApplication.$['tools:replace'] = 'android:appComponentFactory';
    
    // Also add the tools namespace to the root <manifest> tag
    if (!config.modResults.manifest.$) {
      config.modResults.manifest.$ = {};
    }
    if (!config.modResults.manifest.$['xmlns:tools']) {
        config.modResults.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    return config;
  });
};