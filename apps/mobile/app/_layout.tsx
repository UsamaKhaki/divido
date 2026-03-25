import '../global.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { useNotificationPermission } from '@/features/notifications/hooks/useNotificationPermission'
import { useSyncQueue } from '@/features/sync/hooks/useSyncQueue'
import { localDb } from '@/features/sync/services/localDb'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Mounts the sync queue drainer and initialises the SQLite database.
// Must be inside QueryClientProvider (useSyncQueue uses useQueryClient).
const AppBootstrap = () => {
  useSyncQueue()
  useNotificationPermission()

  useEffect(() => {
    void localDb.init()
  }, [])

  return null
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppBootstrap />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
