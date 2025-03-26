const { withMainActivity } = require('@expo/config-plugins');

function addPermissionDelegateToMainActivity(javaSource) {
  if (javaSource.includes('HealthConnectPermissionDelegate.setPermissionDelegate(this)')) {
    return javaSource;
  }

  if (!javaSource.includes('import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate')) {
    const lines = javaSource.split('\n');
    const importIndex = lines.findIndex((line) => line.startsWith('import'));
    lines.splice(
      importIndex + 1,
      0,
      'import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate'
    );
    javaSource = lines.join('\n');
  }

  return javaSource.replace(
    'super.onCreate(null)',
    `HealthConnectPermissionDelegate.setPermissionDelegate(this);\n    super.onCreate(null)`
  );
}

module.exports = function withHealthConnectPermissionDelegate(config) {
  return withMainActivity(config, (config) => {
    if (config.modResults.language === 'java' || config.modResults.language === 'kt') {
      config.modResults.contents = addPermissionDelegateToMainActivity(config.modResults.contents);
    } else {
      throw new Error('MainActivity is not Java/Kotlin, cannot add HealthConnect delegate.');
    }
    return config;
  });
};