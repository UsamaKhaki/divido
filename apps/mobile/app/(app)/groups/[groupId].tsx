import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { useState, useEffect } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { useAuthStore } from '@/features/auth/store/authStore'
import { ExpenseCard } from '@/features/expenses/components/ExpenseCard'
import { useExpensesQuery } from '@/features/expenses/hooks/useExpensesQuery'
import { GroupMemberRow } from '@/features/groups/components/GroupMemberRow'
import { useAddMemberMutation } from '@/features/groups/hooks/useAddMemberMutation'
import { useGroupQuery } from '@/features/groups/hooks/useGroupQuery'

export default function GroupDetailScreen() {
  const { groupId: groupIdParam } = useLocalSearchParams<{ groupId: string }>()
  const groupId = Number(groupIdParam)
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  const currentUserId = useAuthStore((s) => s.user?.id)

  const [showAddMember, setShowAddMember] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')

  const {
    data: group,
    isLoading: groupLoading,
    isError: groupError,
    refetch: refetchGroup,
  } = useGroupQuery(groupId)

  const {
    data: expenses,
    isLoading: expensesLoading,
    isError: expensesError,
    refetch: refetchExpenses,
  } = useExpensesQuery(groupId)

  const { mutate: addMember, isPending: isAddingMember } = useAddMemberMutation()

  useEffect(() => {
    if (group) {
      navigation.setOptions({ title: group.name })
    }
  }, [group, navigation])

  if (groupLoading || expensesLoading) return <LoadingSkeleton />
  if (groupError || expensesError)
    return (
      <ErrorState
        message="Couldn't load group."
        onRetry={() => {
          void refetchGroup()
          void refetchExpenses()
        }}
      />
    )

  const isCreator = group?.created_by === currentUserId

  const handleAddMember = () => {
    const email = memberEmail.trim()
    if (!email) return
    addMember(
      { groupId, payload: { email } },
      {
        onSuccess: () => {
          setMemberEmail('')
          setShowAddMember(false)
        },
      },
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerClassName="pb-32">
        {/* Members section */}
        <Text className="bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Members
        </Text>
        <View className="mx-4 mb-4 overflow-hidden rounded-2xl bg-white">
          {group?.members.map((member) => (
            <GroupMemberRow
              key={member.id}
              member={member}
              canRemove={isCreator && member.id !== currentUserId}
            />
          ))}
        </View>

        {/* Expenses section */}
        <Text className="bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Expenses
        </Text>
        {expenses && expenses.length > 0 ? (
          expenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} groupId={groupId} />
          ))
        ) : (
          <EmptyState message="No expenses yet." hint="Add the first one below." />
        )}
      </ScrollView>

      {/* Add member sheet */}
      {showAddMember ? (
        <View
          className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white px-6 py-6 shadow-xl"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <Text className="mb-4 text-lg font-bold text-gray-900">Add member</Text>
          <TextInput
            className="min-h-[44px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
            placeholder="member@example.com"
            placeholderTextColor="#9ca3af"
            value={memberEmail}
            onChangeText={setMemberEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
            accessible
            accessibilityLabel="Member email"
          />
          <View className="mt-4 flex-row gap-3">
            <Pressable
              className="flex-1 min-h-[44px] items-center justify-center rounded-xl border border-gray-200"
              onPress={() => {
                setShowAddMember(false)
                setMemberEmail('')
              }}
              accessibilityRole="button"
              accessibilityLabel="Cancel add member"
            >
              <Text className="text-sm font-medium text-gray-600">Cancel</Text>
            </Pressable>
            <Pressable
              className="flex-1 min-h-[44px] items-center justify-center rounded-xl bg-blue-600"
              onPress={handleAddMember}
              disabled={isAddingMember}
              accessibilityRole="button"
              accessibilityLabel="Add member"
            >
              {isAddingMember ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-sm font-semibold text-white">Add</Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : (
        <View
          className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-4 py-3"
          style={{ paddingBottom: insets.bottom + 8 }}
        >
          <View className="mb-2 flex-row gap-2">
            <Pressable
              className="flex-1 min-h-[44px] items-center justify-center rounded-xl border border-gray-200"
              onPress={() => setShowAddMember(true)}
              accessibilityRole="button"
              accessibilityLabel="Add member to group"
            >
              <Text className="text-sm font-medium text-gray-700">+ Add member</Text>
            </Pressable>
            <Pressable
              className="flex-1 min-h-[44px] items-center justify-center rounded-xl bg-blue-600"
              onPress={() => router.push(`/(app)/groups/${groupId}/add-expense`)}
              accessibilityRole="button"
              accessibilityLabel="Add expense"
            >
              <Text className="text-sm font-semibold text-white">+ Add expense</Text>
            </Pressable>
          </View>
          <Pressable
            className="min-h-[44px] items-center justify-center rounded-xl bg-gray-900"
            onPress={() => router.push(`/(app)/groups/${groupId}/settlements`)}
            accessibilityRole="button"
            accessibilityLabel="View settlements"
          >
            <Text className="text-sm font-semibold text-white">View Settlements</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
