const path = require('path')

// Monorepo root — packages are hoisted here by pnpm (node-linker=hoisted)
const monorepoRoot = path.resolve(__dirname, '../..')

module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/*.test.ts?(x)'],
  setupFiles: ['./jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Route msw/node to its ESM bundle so Babel can transpile it (react-native env resolves to null)
    '^msw/node$': path.join(monorepoRoot, 'node_modules/msw/lib/node/index.mjs'),
  },
  // Extend transform to handle .mjs files (e.g. msw/node ESM bundle)
  transform: {
    '\\.mjs$': ['babel-jest', { caller: { name: 'metro', bundler: 'metro', platform: 'ios' } }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|nativewind|zustand|immer|msw|until-async|@bundled-es-modules|strict-event-emitter|path-to-regexp|@open-draft|@mswjs|outvariant|is-node-process|@ungap))',
    '/node_modules/react-native-reanimated/plugin/',
  ],
}
