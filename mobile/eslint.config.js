// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "brighten_more.js", "fix_contrast.js", "scale_down_screens.js"],
  },
  {
    settings: {
      "import/resolver": {
        "babel-module": {},
      },
    },
  },
]);
