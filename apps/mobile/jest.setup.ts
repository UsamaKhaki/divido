import type React from 'react'

// Set API base URL to match .env (includes /api/v1 prefix)
process.env.EXPO_PUBLIC_API_URL = 'http://localhost:8000/api/v1'

// ─── Mock native modules that don't run in Jest's Node environment ──────────

// expo/src/winter sets up lazy globals including __ExpoImportMetaRegistry.
// Mocking it prevents the "import outside scope" error in component tests.
jest.mock('expo/src/winter/ImportMetaRegistry', () => ({
  ImportMetaRegistry: { url: null },
}))

// expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}))

// expo-sqlite — localDb calls are mocked at the service level, but stub
// the underlying module so imports don't throw.
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue(undefined),
    getAllAsync: jest.fn().mockResolvedValue([]),
    withTransactionAsync: jest.fn().mockImplementation((fn: () => Promise<void>) => fn()),
  }),
}))

// expo-notifications
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notification-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  setNotificationHandler: jest.fn(),
}))

// expo-router — mock navigation primitives
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: jest.fn().mockReturnValue({}),
  useNavigation: jest.fn().mockReturnValue({ setOptions: jest.fn() }),
  Link: ({ children }: { children: React.ReactNode }) => children,
  Stack: { Screen: () => null },
}))

// expo-linking
jest.mock('expo-linking', () => ({
  canOpenURL: jest.fn().mockResolvedValue(false),
  openURL: jest.fn().mockResolvedValue(undefined),
}))

// @react-native-community/netinfo — default: online
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
}))

// @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  getAllKeys: jest.fn().mockResolvedValue([]),
  multiGet: jest.fn().mockResolvedValue([]),
  multiSet: jest.fn().mockResolvedValue(undefined),
}))

// react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn().mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// localDb — always return empty by default; override per-test as needed
jest.mock('@/features/sync/services/localDb', () => ({
  localDb: {
    init: jest.fn().mockResolvedValue(undefined),
    upsertGroups: jest.fn().mockResolvedValue(undefined),
    getGroups: jest.fn().mockResolvedValue([]),
    upsertExpenses: jest.fn().mockResolvedValue(undefined),
    getExpensesByGroup: jest.fn().mockResolvedValue([]),
  },
}))
