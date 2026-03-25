import * as Notifications from 'expo-notifications'
import 'expo-router/entry'

// Notifications received while the app is foregrounded: show a banner.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})
