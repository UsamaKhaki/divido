import { router } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { GroupCard } from '@/features/groups/components/GroupCard'
import { useCreateGroupMutation } from '@/features/groups/hooks/useCreateGroupMutation'
import { useGroupsQuery } from '@/features/groups/hooks/useGroupsQuery'
import type { GroupSummary } from '@/types/api.types'

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const [showCreate, setShowCreate] = useState(false)
  const [groupName, setGroupName] = useState('')

  const { data: groups, isLoading, isError, refetch } = useGroupsQuery()
  const { mutate: createGroup, isPending: isCreating } = useCreateGroupMutation()

  const handlePressGroup = (groupId: number) => {
    router.push(`/(app)/groups/${groupId}`)
  }

  const handleCreate = () => {
    const name = groupName.trim()
    if (!name) return
    createGroup(
      { name },
      {
        onSuccess: () => {
          setGroupName('')
          setShowCreate(false)
        },
      },
    )
  }

  if (isLoading) return <LoadingSkeleton />
  if (isError) return <ErrorState message="Couldn't load groups." onRetry={() => void refetch()} />

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList<GroupSummary>
        data={groups ?? []}
        keyExtractor={(g) => String(g.id)}
        renderItem={({ item }) => <GroupCard group={item} onPress={handlePressGroup} />}
        contentContainerClassName="px-4 pt-4 pb-32"
        ListEmptyComponent={
          <EmptyState message="No groups yet." hint="Tap + to create your first group." />
        }
      />

      {/* Create group sheet */}
      {showCreate ? (
        <View
          className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white px-6 py-6 shadow-xl"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <Text className="mb-4 text-lg font-bold text-gray-900">New group</Text>
          <TextInput
            className="min-h-[44px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
            placeholder="Group name"
            placeholderTextColor="#9ca3af"
            value={groupName}
            onChangeText={setGroupName}
            autoCapitalize="words"
            autoFocus
            accessible
            accessibilityLabel="Group name"
          />
          <View className="mt-4 flex-row gap-3">
            <Pressable
              className="flex-1 min-h-[44px] items-center justify-center rounded-xl border border-gray-200"
              onPress={() => {
                setShowCreate(false)
                setGroupName('')
              }}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text className="text-sm font-medium text-gray-600">Cancel</Text>
            </Pressable>
            <Pressable
              className="flex-1 min-h-[44px] items-center justify-center rounded-xl bg-blue-600"
              onPress={handleCreate}
              disabled={isCreating}
              accessibilityRole="button"
              accessibilityLabel="Create group"
            >
              {isCreating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-sm font-semibold text-white">Create</Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg"
          style={{ bottom: insets.bottom + 16 }}
          onPress={() => setShowCreate(true)}
          accessibilityRole="button"
          accessibilityLabel="Create new group"
        >
          <Text className="text-2xl font-light text-white">+</Text>
        </Pressable>
      )}
    </View>
  )
}
