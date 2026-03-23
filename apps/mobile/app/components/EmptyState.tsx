import { Text, View } from 'react-native'

interface EmptyStateProps {
  message?: string
  hint?: string
}

export const EmptyState = ({ message = 'Nothing here yet.', hint }: EmptyStateProps) => (
  <View className="flex-1 items-center justify-center px-8">
    <Text className="mb-2 text-5xl">📭</Text>
    <Text className="mb-1 text-base font-semibold text-gray-800">{message}</Text>
    {hint ? <Text className="text-center text-sm text-gray-500">{hint}</Text> : null}
  </View>
)
