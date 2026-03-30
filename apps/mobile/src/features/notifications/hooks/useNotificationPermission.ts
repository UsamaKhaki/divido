import Constants, { ExecutionEnvironment } from 'expo-constants'
import * as Notifications from 'expo-notifications'
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient

/**
 * Requests notification permission on mount (iOS/Android only).
 * Returns null while the request is in flight, then true/false.
 * No-ops in Expo Go (expo-notifications is not fully supported there).
 */
export const useNotificationPermission = () => {
  const [granted, setGranted] = useState<boolean | null>(null)

  useEffect(() => {
    if (Platform.OS === 'web' || isExpoGo) {
      setGranted(false)
      return
    }

    Notifications.requestPermissionsAsync()
      .then(({ status }) => setGranted(status === 'granted'))
      .catch(() => setGranted(false))
  }, [])

  return granted
}
