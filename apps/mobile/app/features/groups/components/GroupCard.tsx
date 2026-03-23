import { Pressable, Text, View } from 'react-native'

import type { GroupSummary } from '@/types/api.types'

interface GroupCardProps {
  group: GroupSummary
  onPress: (groupId: number) => void
}

export const GroupCard = ({ group, onPress }: GroupCardProps) => (
  <Pressable
    className="mb-3 min-h-[72px] flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm active:bg-gray-50"
    onPress={() => onPress(group.id)}
    accessibilityRole="button"
    accessibilityLabel={`Open group ${group.name}`}
  >
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-900">{group.name}</Text>
      <Text className="mt-0.5 text-sm text-gray-500">
        {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
      </Text>
    </View>
    <Text className="text-gray-400">›</Text>
  </Pressable>
)
