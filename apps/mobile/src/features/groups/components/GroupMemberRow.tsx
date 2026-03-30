import { Pressable, Text, View } from 'react-native'

import type { GroupMember } from '@/types/api.types'

interface GroupMemberRowProps {
  member: GroupMember
  canRemove: boolean
  onRemove?: (userId: number) => void
}

export const GroupMemberRow = ({ member, canRemove, onRemove }: GroupMemberRowProps) => (
  <View className="flex-row min-h-[52px] items-center justify-between px-4 py-3 border-b border-gray-50">
    <View className="flex-1">
      <Text className="text-sm font-medium text-gray-900">{member.name}</Text>
      <Text className="text-xs text-gray-500">{member.email}</Text>
    </View>
    {canRemove && onRemove ? (
      <Pressable
        className="min-h-[44px] min-w-[44px] items-center justify-center rounded-lg"
        onPress={() => onRemove(member.id)}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${member.name}`}
      >
        <Text className="text-sm font-medium text-red-500">Remove</Text>
      </Pressable>
    ) : null}
  </View>
)
