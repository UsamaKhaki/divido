import Constants, { ExecutionEnvironment } from 'expo-constants'
import * as Notifications from 'expo-notifications'
import 'expo-router/entry'

// Notifications received while the app is foregrounded: show a banner.
// expo-notifications is not supported in Expo Go — skip in that environment.
if (Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
}
