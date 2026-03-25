import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { useEffect, useReducer } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ErrorState } from '@/components/ErrorState'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { useAuthStore } from '@/features/auth/store/authStore'
import { SplitItemRow } from '@/features/expenses/components/SplitItemRow'
import { useDeleteExpenseMutation } from '@/features/expenses/hooks/useDeleteExpenseMutation'
import { useExpenseQuery } from '@/features/expenses/hooks/useExpenseQuery'
import { useExpenseSummaryQuery } from '@/features/expenses/hooks/useExpenseSummaryQuery'
import { useUpdateSplitsMutation } from '@/features/expenses/hooks/useUpdateSplitsMutation'
import { useGroupQuery } from '@/features/groups/hooks/useGroupQuery'
import type { ExpenseCategory } from '@/types/api.types'

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: '🍔 Food',
  transport: '🚗 Transport',
  accommodation: '🏠 Accommodation',
  entertainment: '🎉 Entertainment',
  shopping: '🛍️ Shopping',
  other: '📦 Other',
}

// ─── Local state: { [itemId]: userId[] } ────────────────────────────────────

type SplitState = Record<number, number[]>

type SplitAction =
  | { type: 'INIT'; payload: SplitState }
  | { type: 'TOGGLE'; itemId: number; userId: number }

const splitReducer = (state: SplitState, action: SplitAction): SplitState => {
  switch (action.type) {
    case 'INIT':
      return action.payload
    case 'TOGGLE': {
      const current = state[action.itemId] ?? []
      const idx = current.indexOf(action.userId)
      return {
        ...state,
        [action.itemId]:
          idx === -1 ? [...current, action.userId] : current.filter((id) => id !== action.userId),
      }
    }
    default:
      return state
  }
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function ExpenseDetailScreen() {
  const { groupId: groupIdParam, expenseId: expenseIdParam } = useLocalSearchParams<{
    groupId: string
    expenseId: string
  }>()

  const groupId = Number(groupIdParam)
  const expenseId = Number(expenseIdParam)
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  const {
    data: expense,
    isLoading: expenseLoading,
    isError: expenseError,
    refetch: refetchExpense,
  } = useExpenseQuery(expenseId)

  const {
    data: group,
    isLoading: groupLoading,
    isError: groupError,
    refetch: refetchGroup,
  } = useGroupQuery(groupId)

  const currentUserId = useAuthStore((s) => s.user?.id)

  const { mutate: updateSplits, isPending: isSaving } = useUpdateSplitsMutation()
  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteExpenseMutation()
  const { data: summary } = useExpenseSummaryQuery(expenseId)

  const [splitState, dispatch] = useReducer(splitReducer, {})

  const isCreator = expense?.paid_by.id === currentUserId

  // Initialise split state from existing data once expense loads
  useEffect(() => {
    if (!expense) return
    const initial: SplitState = {}
    for (const item of expense.items) {
      initial[item.id] = item.splits?.map((s) => s.user.id) ?? []
    }
    dispatch({ type: 'INIT', payload: initial })
  }, [expense])

  useEffect(() => {
    if (expense) navigation.setOptions({ title: expense.title })
  }, [expense, navigation])

  if (expenseLoading || groupLoading) return <LoadingSkeleton />
  if (expenseError || groupError)
    return (
      <ErrorState
        message="Couldn't load expense."
        onRetry={() => {
          void refetchExpense()
          void refetchGroup()
        }}
      />
    )

  const handleToggle = (itemId: number, userId: number) => {
    dispatch({ type: 'TOGGLE', itemId, userId })
  }

  const handleSaveSplits = (itemId: number) => {
    const userIds = splitState[itemId] ?? []
    if (userIds.length === 0) return

    const item = expense?.items.find((i) => i.id === itemId)
    if (!item) return

    const perUser = (item.price * item.quantity) / userIds.length
    updateSplits({
      expenseId,
      itemId,
      payload: {
        splits: userIds.map((userId) => ({ user_id: userId, amount: perUser })),
      },
    })
  }

  const handleShare = async () => {
    if (!summary) return
    await Share.share({ message: summary.summary })
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete expense',
      'This will permanently delete this expense and all its splits. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExpense({ expenseId, groupId }, { onSuccess: () => router.back() }),
        },
      ],
    )
  }

  const categoryLabel = expense?.category ? CATEGORY_LABELS[expense.category] : null
  const formattedDate = expense
    ? new Date(expense.created_at).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : ''

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerClassName="pb-32">
        {/* Expense header */}
        <View className="mx-4 mt-4 rounded-2xl bg-white p-5 shadow-sm">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-xl font-bold text-gray-900">{expense?.title}</Text>
              <Text className="mt-1 text-sm text-gray-500">Paid by {expense?.paid_by.name}</Text>
              <Text className="mt-0.5 text-xs text-gray-400">{formattedDate}</Text>
            </View>
            <View className="items-end">
              <Text className="text-2xl font-bold text-gray-900">
                PKR {expense?.total_amount.toFixed(2)}
              </Text>
              {categoryLabel ? (
                <Text className="mt-1 text-xs text-gray-400">{categoryLabel}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Items + Split Assignment */}
        {expense && expense.items.length > 0 ? (
          <>
            <Text className="bg-gray-50 px-4 pb-2 pt-5 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Split Items
            </Text>
            <View className="px-4">
              {expense.items.map((item) => (
                <View key={item.id}>
                  <SplitItemRow
                    item={item}
                    members={group?.members ?? []}
                    selectedUserIds={splitState[item.id] ?? []}
                    onToggleUser={handleToggle}
                  />
                  <Pressable
                    className={`-mt-2 mb-5 min-h-[40px] items-center justify-center rounded-xl ${
                      (splitState[item.id] ?? []).length === 0 ? 'bg-gray-200' : 'bg-blue-600'
                    }`}
                    onPress={() => handleSaveSplits(item.id)}
                    disabled={isSaving || (splitState[item.id] ?? []).length === 0}
                    accessibilityRole="button"
                    accessibilityLabel={`Save splits for ${item.name}`}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-sm font-semibold text-white">Save split</Text>
                    )}
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View className="mx-4 mt-4 rounded-2xl bg-white p-5">
            <Text className="text-center text-sm text-gray-400">No items on this expense.</Text>
          </View>
        )}

        {/* Current splits summary */}
        {expense && expense.items.some((i) => (i.splits?.length ?? 0) > 0) ? (
          <>
            <Text className="bg-gray-50 px-4 pb-2 pt-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Current Splits
            </Text>
            {expense.items
              .filter((i) => (i.splits?.length ?? 0) > 0)
              .map((item) => (
                <View
                  key={item.id}
                  className="mx-4 mb-3 rounded-2xl border border-gray-100 bg-white p-4"
                >
                  <Text className="mb-2 text-sm font-semibold text-gray-800">{item.name}</Text>
                  {item.splits?.map((split) => (
                    <View
                      key={split.user.id}
                      className="flex-row items-center justify-between py-1"
                    >
                      <Text className="text-sm text-gray-600">{split.user.name}</Text>
                      <Text className="text-sm font-medium text-gray-900">
                        PKR {split.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
          </>
        ) : null}
      </ScrollView>

      {/* Footer */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-4 py-3"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <View className="flex-row gap-2">
          <Pressable
            className="flex-1 min-h-[44px] items-center justify-center rounded-xl bg-blue-600"
            onPress={() => router.push(`/(app)/groups/${groupId}/settlements`)}
            accessibilityRole="button"
            accessibilityLabel="View group settlements"
          >
            <Text className="text-sm font-semibold text-white">Settlements</Text>
          </Pressable>
          {summary ? (
            <Pressable
              className="flex-1 min-h-[44px] items-center justify-center rounded-xl bg-gray-900"
              onPress={() => void handleShare()}
              accessibilityRole="button"
              accessibilityLabel="Share expense summary"
            >
              <Text className="text-sm font-semibold text-white">Share</Text>
            </Pressable>
          ) : null}
        </View>
        {isCreator ? (
          <Pressable
            className="mt-2 min-h-[44px] items-center justify-center rounded-xl border border-red-200 bg-red-50"
            onPress={handleDelete}
            disabled={isDeleting}
            accessibilityRole="button"
            accessibilityLabel="Delete expense"
          >
            {isDeleting ? (
              <ActivityIndicator color="#ef4444" />
            ) : (
              <Text className="text-sm font-semibold text-red-500">Delete expense</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}
