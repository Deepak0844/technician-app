module.exports = function (api) {
  api.cache(true);

  return {
    presets: [['babel-preset-expo'], 'nativewind/babel'],

    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],

          alias: {
            '@': './src',
            '@components': './src/components',
            '@constants': './src/constants',
            '@hooks': './src/hooks',
            '@services': './src/services',
            '@store': './src/store',
            '@utils': './src/utils',
            '@navigation': './src/navigation',
            '@config': './src/config',
            '@screens': './src/screens',
            '@assets': './assets',
            '@db': './src/db',
            'tailwind.config': './tailwind.config.js',
          },
        },
      ],
      'react-native-worklets/plugin',
    ],
  };
};
