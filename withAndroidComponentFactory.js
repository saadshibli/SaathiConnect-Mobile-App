const {
  withAndroidManifest,
  withAppBuildGradle,
  withGradleProperties,
} = require('@expo/config-plugins');

module.exports = function withAndroidComponentFactory(config) {
  // Ensure AndroidX + Jetifier
  withGradleProperties(config, (c) => {
    const props = c.modResults;
    const setProp = (key, value) => {
      const existing = props.find((p) => p.key === key);
      if (existing) existing.value = String(value);
      else props.push({ type: 'property', key, value: String(value) });
    };
    setProp('android.useAndroidX', true);
    setProp('android.enableJetifier', true);
    return c;
  });

  // Manifest: prefer AndroidX factory
  withAndroidManifest(config, (c) => {
    const manifest = c.modResults;
    if (!manifest.manifest.$) manifest.manifest.$ = {};
    manifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    const appEl =
      (manifest.manifest.application && manifest.manifest.application[0]) ||
      (manifest.manifest.application = [{ $: {} }])[0];

    if (!appEl.$) appEl.$ = {};
    appEl.$['android:appComponentFactory'] = 'androidx.core.app.CoreComponentFactory';
    const currentReplace = appEl.$['tools:replace'] || '';
    const parts = new Set(
      currentReplace
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    );
    parts.add('android:appComponentFactory');
    appEl.$['tools:replace'] = Array.from(parts).join(',');

    return c;
  });

  // Exclude legacy support libs that cause duplicate classes
  withAppBuildGradle(config, (c) => {
    const needle = "exclude group: 'com.android.support'";
    if (!c.modResults.contents.includes(needle)) {
      c.modResults.contents += `

/* auto-added by withAndroidComponentFactory */
configurations.all {
    ${needle}
}
`;
    }
    return c;
  });

  return config;
};