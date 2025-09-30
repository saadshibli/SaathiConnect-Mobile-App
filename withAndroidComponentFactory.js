const {
  withAndroidManifest,
  withAppBuildGradle,
  withGradleProperties,
} = require('@expo/config-plugins');

module.exports = function withAndroidComponentFactory(config) {
  // AndroidX + Jetifier (redundant with expo-build-properties, but harmless)
  withGradleProperties(config, (c) => {
    const props = c.modResults;
    const setProp = (key, value) => {
      const found = props.find((p) => p.key === key);
      if (found) found.value = String(value);
      else props.push({ type: 'property', key, value: String(value) });
    };
    setProp('android.useAndroidX', true);
    setProp('android.enableJetifier', true);
    return c;
  });

  // Manifest: prefer AndroidX CoreComponentFactory and replace conflicts
  withAndroidManifest(config, (c) => {
    const manifest = c.modResults;
    if (!manifest.manifest.$) manifest.manifest.$ = {};
    manifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    const app =
      (manifest.manifest.application && manifest.manifest.application[0]) ||
      (manifest.manifest.application = [{ $: {} }])[0];

    if (!app.$) app.$ = {};
    app.$['android:appComponentFactory'] = 'androidx.core.app.CoreComponentFactory';

    const cur = app.$['tools:replace'] || '';
    const set = new Set(
      cur.split(',').map((s) => s.trim()).filter(Boolean)
    );
    set.add('android:appComponentFactory');
    app.$['tools:replace'] = Array.from(set).join(',');

    return c;
  });

  // Gradle: exclude legacy support libs to avoid duplicate classes
  withAppBuildGradle(config, (c) => {
    const marker = '/* auto-added by withAndroidComponentFactory */';
    if (!c.modResults.contents.includes(marker)) {
      c.modResults.contents += `

${marker}
configurations.all {
    exclude group: 'com.android.support'
}
`;
    }
    return c;
  });

  return config;
};