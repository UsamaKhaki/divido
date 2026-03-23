import { router } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import type { ExpenseSummary } from '@/types/api.types'

const CATEGORY_LABELS: Record<string, string> = {
  food: '🍔 Food',
  transport: '🚗 Transport',
  accommodation: '🏠 Accommodation',
  entertainment: '🎉 Entertainment',
  shopping: '🛍️ Shopping',
  other: '📦 Other',
}

interface ExpenseCardProps {
  expense: ExpenseSummary
  groupId: number
}

export const ExpenseCard = ({ expense, groupId }: ExpenseCardProps) => {
  const categoryLabel = expense.category
    ? (CATEGORY_LABELS[expense.category] ?? expense.category)
    : null

  const formattedDate = new Date(expense.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <Pressable
      className="mx-4 mb-3 min-h-[72px] rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm active:bg-gray-50"
      onPress={() => router.push(`/(app)/groups/${groupId}/expenses/${expense.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`View expense ${expense.title}`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-base font-semibold text-gray-900">{expense.title}</Text>
          <Text className="mt-0.5 text-sm text-gray-500">
            Paid by {expense.paid_by.name}
            {categoryLabel ? ` · ${categoryLabel}` : ''}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-base font-bold text-gray-900">
            ${expense.total_amount.toFixed(2)}
          </Text>
          <Text className="mt-0.5 text-xs text-gray-400">{formattedDate}</Text>
        </View>
      </View>
    </Pressable>
  )
}
