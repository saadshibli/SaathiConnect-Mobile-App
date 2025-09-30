// /withAppComponentFactoryFix.js
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAppComponentFactoryFix(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    // Ensure the tools namespace exists on <manifest>
    if (!manifest.manifest.$) manifest.manifest.$ = {};
    manifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    // Find the <application> element
    const app = manifest.manifest.application?.[0];
    if (!app) return config;

    if (!app.$) app.$ = {};

    // Prefer AndroidX factory and tell merger to replace
    app.$['android:appComponentFactory'] = 'androidx.core.app.CoreComponentFactory';
    app.$['tools:replace'] = [
      app.$['tools:replace'],
      'android:appComponentFactory',
    ].filter(Boolean).join(',');

    return config;
  });
};