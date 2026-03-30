import { Pressable, Text, View } from 'react-native'

import type { ExpenseItem, GroupMember } from '@/types/api.types'

interface SplitItemRowProps {
  item: ExpenseItem
  members: GroupMember[]
  /** Set of user IDs currently assigned to this item */
  selectedUserIds: number[]
  onToggleUser: (itemId: number, userId: number) => void
}

export const SplitItemRow = ({
  item,
  members,
  selectedUserIds,
  onToggleUser,
}: SplitItemRowProps) => (
  <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
      <Text className="text-sm font-medium text-gray-500">
        PKR {(item.price * item.quantity).toFixed(2)}
        {item.quantity > 1 ? (
          <Text className="font-normal text-gray-400"> ×{item.quantity}</Text>
        ) : null}
      </Text>
    </View>

    <View className="flex-row flex-wrap gap-2">
      {members.map((member) => {
        const selected = selectedUserIds.includes(member.id)
        return (
          <Pressable
            key={member.id}
            className={`min-h-[36px] rounded-full border px-4 py-1.5 ${
              selected ? 'border-blue-600 bg-blue-600' : 'border-gray-200 bg-gray-50'
            }`}
            onPress={() => onToggleUser(item.id, member.id)}
            accessibilityRole="checkbox"
            accessibilityLabel={`Assign ${member.name} to ${item.name}`}
            accessibilityState={{ checked: selected }}
          >
            <Text className={`text-sm font-medium ${selected ? 'text-white' : 'text-gray-700'}`}>
              {member.name}
            </Text>
          </Pressable>
        )
      })}
    </View>

    {selectedUserIds.length > 0 ? (
      <Text className="mt-2 text-xs text-gray-400">
        Each pays PKR {((item.price * item.quantity) / selectedUserIds.length).toFixed(2)}
      </Text>
    ) : null}
  </View>
)
