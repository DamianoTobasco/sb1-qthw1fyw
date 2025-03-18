module.exports = {
  name: "Evolve Health App",
  slug: "evolve-health-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "evolve",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.evolvehealth.app",
    buildNumber: "1",
    infoPlist: {
      UIBackgroundModes: ["audio"]
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/icon.png",
      backgroundColor: "#000000"
    },
    package: "com.evolvehealth.app",
    versionCode: 1
  },
  web: {
    bundler: "metro",
    output: "single",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    [
      "expo-av",
      {
        microphonePermission: false
      }
    ]
  ],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true
  },
  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: "0408a7cb-aae9-4ea3-a0dd-60af10cf7403"
    }
  },
  owner: "evolveai",
  runtimeVersion: {
    policy: "appVersion"
  },
  updates: {
    url: "https://u.expo.dev/evolve-health-app"
  }
};