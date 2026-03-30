import * as Notifications from 'expo-notifications'

const REMINDER_ID_PREFIX = 'divido-settlement-'
const REPEAT_INTERVAL_SECONDS = 7 * 24 * 60 * 60 // 1 week

interface ScheduleReminderPayload {
  groupId: number
  groupName: string
}

/**
 * Schedules (or replaces) a weekly local notification reminding the user
 * to settle up for a specific group. Cancelling removes the reminder entirely.
 */
export const useScheduleReminder = () => {
  const schedule = async ({ groupId, groupName }: ScheduleReminderPayload) => {
    const id = `${REMINDER_ID_PREFIX}${groupId}`

    // Cancel any existing reminder for this group before re-scheduling
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => null)

    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title: '💸 Settle up reminder',
        body: `${groupName} still has pending settlements. Tap to settle up!`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: REPEAT_INTERVAL_SECONDS,
        repeats: true,
      },
    })
  }

  const cancel = async (groupId: number) => {
    await Notifications.cancelScheduledNotificationAsync(`${REMINDER_ID_PREFIX}${groupId}`).catch(
      () => null,
    )
  }

  return { schedule, cancel }
}
