const { withAndroidManifest } = require('@expo/config-plugins');

function withGoogleMapsKey(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    if (!manifest.manifest.application || !manifest.manifest.application[0]) {
      throw new Error('No <application> element found in AndroidManifest.xml');
    }
    const application = manifest.manifest.application[0];

    if (!application['meta-data']) {
      application['meta-data'] = [];
    }

    const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!googleMapsKey) {
      throw new Error('GOOGLE_MAPS_API_KEY environment variable is not set');
    }

    const metaDataIndex = application['meta-data'].findIndex(
      (meta) => meta.$['android:name'] === 'com.google.android.geo.API_KEY'
    );

    if (metaDataIndex >= 0) {
      application['meta-data'][metaDataIndex].$['android:value'] = googleMapsKey;
    } else {
      application['meta-data'].push({
        $: {
          'android:name': 'com.google.android.geo.API_KEY',
          'android:value': googleMapsKey,
        },
      });
    }
    return config;
  });
}

module.exports = withGoogleMapsKey;
