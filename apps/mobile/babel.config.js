module.exports = function (api) {
  api.cache(true)
  const isTest = process.env.NODE_ENV === 'test'
  return {
    presets: [
      [
        'babel-preset-expo',
        // zustand's ESM middleware reads import.meta.env, which a classic
        // (non-module) web bundle cannot parse, so it must be transformed.
        ...(isTest ? [] : [{ jsxImportSource: 'nativewind', unstable_transformImportMeta: true }]),
      ],
      ...(isTest ? [] : ['nativewind/babel']),
    ],
    plugins: ['react-native-reanimated/plugin'],
  }
}
