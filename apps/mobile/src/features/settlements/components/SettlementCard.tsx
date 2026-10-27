import { ActivityIndicator, Pressable, Text, View } from 'react-native'

import type { Settlement } from '@/types/api.types'

interface SettlementCardProps {
  settlement: Settlement
  isSettling: boolean
  /** Only the person who owes the money may mark it paid (the API enforces this). */
  canSettle: boolean
  onSettle: (id: number) => void
}

export const SettlementCard = ({
  settlement,
  isSettling,
  canSettle,
  onSettle,
}: SettlementCardProps) => {
  const isSettled = settlement.status === 'settled'

  return (
    <View
      className={`mx-4 mb-3 rounded-2xl border p-4 ${
        isSettled ? 'border-green-100 bg-green-50' : 'border-gray-100 bg-white'
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-base font-semibold text-gray-900">
            {settlement.from.name} <Text className="font-normal text-gray-400">owes</Text>{' '}
            {settlement.to.name}
          </Text>
          <Text className="mt-0.5 text-xl font-bold text-gray-900">
            PKR {settlement.amount.toFixed(2)}
          </Text>
          {isSettled && settlement.settled_at ? (
            <Text className="mt-1 text-xs text-green-600">
              Settled on{' '}
              {new Date(settlement.settled_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          ) : null}
        </View>

        {isSettled ? (
          <View className="rounded-full bg-green-100 px-3 py-1.5">
            <Text className="text-xs font-semibold text-green-700">Paid ✓</Text>
          </View>
        ) : !canSettle ? (
          <Text className="text-xs text-gray-400">Waiting for {settlement.from.name}</Text>
        ) : (
          <Pressable
            className="min-h-[36px] min-w-[80px] items-center justify-center rounded-xl bg-blue-600 px-4"
            onPress={() => onSettle(settlement.id)}
            disabled={isSettling}
            accessibilityRole="button"
            accessibilityLabel={`Mark settlement from ${settlement.from.name} to ${settlement.to.name} as paid`}
          >
            {isSettling ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-sm font-semibold text-white">Settle</Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  )
}
