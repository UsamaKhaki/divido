import * as Notifications from 'expo-notifications'
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'

/**
 * Requests notification permission on mount (iOS/Android only).
 * Returns null while the request is in flight, then true/false.
 */
export const useNotificationPermission = () => {
  const [granted, setGranted] = useState<boolean | null>(null)

  useEffect(() => {
    if (Platform.OS === 'web') {
      setGranted(false)
      return
    }

    Notifications.requestPermissionsAsync()
      .then(({ status }) => setGranted(status === 'granted'))
      .catch(() => setGranted(false))
  }, [])

  return granted
}
