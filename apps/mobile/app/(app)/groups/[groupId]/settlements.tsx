import { useLocalSearchParams } from 'expo-router'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'

import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { useGroupQuery } from '@/features/groups/hooks/useGroupQuery'
import { useNotificationPermission } from '@/features/notifications/hooks/useNotificationPermission'
import { useScheduleReminder } from '@/features/notifications/hooks/useScheduleReminder'
import { SettlementCard } from '@/features/settlements/components/SettlementCard'
import { useSettlementsQuery } from '@/features/settlements/hooks/useSettlementsQuery'
import { useSettleMutation } from '@/features/settlements/hooks/useSettleMutation'

export default function SettlementsScreen() {
  const { groupId: groupIdParam } = useLocalSearchParams<{ groupId: string }>()
  const groupId = Number(groupIdParam)

  const { data, isLoading, isError, refetch } = useSettlementsQuery(groupId)
  const { data: group } = useGroupQuery(groupId)
  const { mutate: settle, isPending: isSettling } = useSettleMutation()
  const { schedule } = useScheduleReminder()
  const hasPermission = useNotificationPermission()

  const handleSetReminder = () => {
    if (!hasPermission) {
      Alert.alert(
        'Notifications disabled',
        'Enable notifications in Settings to receive settlement reminders.',
      )
      return
    }
    void schedule({ groupId, groupName: group?.name ?? 'Your group' })
    Alert.alert('Reminder set', "You'll be reminded weekly to settle up.")
  }

  if (isLoading) return <LoadingSkeleton />
  if (isError)
    return <ErrorState message="Couldn't load settlements." onRetry={() => void refetch()} />

  const pending = data?.settlements.filter((s) => s.status === 'pending') ?? []
  const settled = data?.settlements.filter((s) => s.status === 'settled') ?? []

  const handleSettle = (settlementId: number) => {
    settle({ settlementId, groupId })
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerClassName="pb-10">
      {/* Summary banner */}
      {(data?.total_unsettled ?? 0) > 0 ? (
        <View className="mx-4 mt-4 rounded-2xl bg-blue-600 p-5">
          <Text className="text-sm font-medium text-blue-100">Total unsettled</Text>
          <Text className="text-3xl font-bold text-white">
            PKR {data?.total_unsettled.toFixed(2)}
          </Text>
        </View>
      ) : (
        <View className="mx-4 mt-4 rounded-2xl bg-green-50 p-5">
          <Text className="text-center text-base font-semibold text-green-700">
            All settled up! 🎉
          </Text>
        </View>
      )}

      {/* Pending */}
      {pending.length > 0 ? (
        <>
          <Text className="bg-gray-50 px-4 pb-2 pt-5 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Pending
          </Text>
          {pending.map((s) => (
            <SettlementCard
              key={s.id}
              settlement={s}
              isSettling={isSettling}
              onSettle={handleSettle}
            />
          ))}
        </>
      ) : null}

      {/* Settled */}
      {settled.length > 0 ? (
        <>
          <Text className="bg-gray-50 px-4 pb-2 pt-5 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Settled
          </Text>
          {settled.map((s) => (
            <SettlementCard key={s.id} settlement={s} isSettling={false} onSettle={handleSettle} />
          ))}
        </>
      ) : null}

      {/* Completely empty */}
      {pending.length === 0 && settled.length === 0 ? (
        <EmptyState message="No settlements yet." hint="Add expenses and split items first." />
      ) : null}

      {/* Weekly reminder */}
      {pending.length > 0 ? (
        <Pressable
          className="mx-4 mb-6 mt-4 min-h-[44px] items-center justify-center rounded-xl border border-blue-200 bg-blue-50"
          onPress={handleSetReminder}
          accessibilityRole="button"
          accessibilityLabel="Set weekly settlement reminder"
        >
          <Text className="text-sm font-semibold text-blue-600">🔔 Remind me weekly</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  )
}
