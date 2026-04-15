const { withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * Expo config plugin to add the local Maven repository required by
 * @react-native-async-storage/async-storage v3.x
 *
 * v3.x ships storage-android as a bundled AAR inside android/local_repo.
 * Without this, Gradle cannot resolve:
 *   org.asyncstorage.shared_storage:storage-android:1.0.0
 */
const withAsyncStorageMaven = (config) => {
  return withProjectBuildGradle(config, (gradleConfig) => {
    const contents = gradleConfig.modResults.contents;

    // Skip if already injected
    if (contents.includes('async-storage/android/local_repo')) {
      return gradleConfig;
    }

    const mavenBlock = `    maven {
      // Required by @react-native-async-storage/async-storage v3.x
      url = new File(rootDir, "../node_modules/@react-native-async-storage/async-storage/android/local_repo").toURI()
    }`;

    // Inject after the JitPack maven block inside allprojects > repositories
    gradleConfig.modResults.contents = contents.replace(
      /maven \{ url 'https:\/\/www\.jitpack\.io' \}/,
      `maven { url 'https://www.jitpack.io' }\n${mavenBlock}`
    );

    return gradleConfig;
  });
};

module.exports = withAsyncStorageMaven;
