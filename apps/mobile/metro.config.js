const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

// Monorepo root — one level up from apps/mobile
const monorepoRoot = path.resolve(__dirname, '../..')

const config = getDefaultConfig(__dirname)

// Allow Metro to watch and resolve packages hoisted to the monorepo root
config.watchFolders = [monorepoRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

// Exclude test-only files from the production bundle.
// __test-utils__ imports msw/node which uses Node's async_hooks — not available in RN.
config.resolver.blockList = [
  /src[\\/]__test-utils__[\\/].*/,
  /.*[\\/]__tests__[\\/].*/,
  /.*\.test\.[jt]sx?$/,
  /.*\.spec\.[jt]sx?$/,
]

module.exports = withNativeWind(config, {
  input: './global.css',
})
