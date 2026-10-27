import { useLocalSearchParams } from 'expo-router'
import { useEffect, useRef } from 'react'
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native'

import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { useGroupInsightsQuery } from '@/features/insights/hooks/useGroupInsightsQuery'

const BAR_COLOR = '#3b82f6' // Tailwind blue-500, matching the rest of the screen

const formatAmount = (amount: number) => `PKR ${amount.toFixed(2)}`

const PercentBar = ({ percent }: { percent: number }) => {
  const widthAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percent,
      duration: 600,
      useNativeDriver: false,
    }).start()
  }, [percent, widthAnim])

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  })

  return (
    <View className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      {/* StyleSheet, not className: NativeWind does not style Animated.View on web. */}
      <Animated.View style={[styles.barFill, { width: animatedWidth }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  barFill: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: BAR_COLOR,
  },
})

export default function InsightsScreen() {
  const { groupId: groupIdParam } = useLocalSearchParams<{ groupId: string }>()
  const groupId = Number(groupIdParam)

  const { data, isLoading, isError, refetch } = useGroupInsightsQuery(groupId)

  if (isLoading) return <LoadingSkeleton />
  if (isError)
    return <ErrorState message="Couldn't load insights." onRetry={() => void refetch()} />

  const isEmpty =
    !data ||
    (data.total_group_spend === 0 &&
      data.spent_per_user.length === 0 &&
      data.category_breakdown.length === 0)

  if (isEmpty)
    return (
      <EmptyState
        message="No insights yet."
        hint="Add expenses and split items to see analytics here."
      />
    )

  const total = data.total_group_spend

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerClassName="pb-10">
      {/* Total spend hero */}
      <View className="mx-4 mt-4 rounded-2xl bg-blue-600 p-5">
        <Text className="text-sm font-medium text-blue-100">Total group spend</Text>
        <Text className="mt-1 text-3xl font-bold text-white">{formatAmount(total)}</Text>
      </View>

      {/* Spent per user */}
      {data.spent_per_user.length > 0 && (
        <>
          <Text className="bg-gray-50 px-4 pb-2 pt-5 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Spent per person
          </Text>
          <View className="mx-4 overflow-hidden rounded-2xl bg-white">
            {data.spent_per_user.map((row, i) => {
              const percent = total > 0 ? Math.round((row.total / total) * 100) : 0
              return (
                <View
                  key={row.user.id}
                  className={`px-4 py-3 ${i < data.spent_per_user.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-medium text-gray-900">{row.user.name}</Text>
                    <View className="items-end">
                      <Text className="text-sm font-semibold text-gray-900">
                        {formatAmount(row.total)}
                      </Text>
                      <Text className="text-xs text-gray-400">{percent}%</Text>
                    </View>
                  </View>
                  <PercentBar percent={percent} />
                </View>
              )
            })}
          </View>
        </>
      )}

      {/* Category breakdown */}
      {data.category_breakdown.length > 0 && (
        <>
          <Text className="bg-gray-50 px-4 pb-2 pt-5 text-xs font-semibold uppercase tracking-widest text-gray-500">
            By category
          </Text>
          <View className="mx-4 overflow-hidden rounded-2xl bg-white">
            {data.category_breakdown.map((row, i) => {
              const percent = total > 0 ? Math.round((row.total / total) * 100) : 0
              return (
                <View
                  key={row.category}
                  className={`px-4 py-3 ${i < data.category_breakdown.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-medium capitalize text-gray-900">
                      {row.category}
                    </Text>
                    <View className="items-end">
                      <Text className="text-sm font-semibold text-gray-900">
                        {formatAmount(row.total)}
                      </Text>
                      <Text className="text-xs text-gray-400">{percent}%</Text>
                    </View>
                  </View>
                  <PercentBar percent={percent} />
                </View>
              )
            })}
          </View>
        </>
      )}
    </ScrollView>
  )
}
