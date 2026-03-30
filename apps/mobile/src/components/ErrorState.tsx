import { Pressable, Text, View } from 'react-native'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export const ErrorState = ({ message = 'Something went wrong.', onRetry }: ErrorStateProps) => (
  <View className="flex-1 items-center justify-center px-8">
    <Text className="mb-2 text-4xl">⚠️</Text>
    <Text className="mb-1 text-base font-semibold text-gray-800">{message}</Text>
    {onRetry ? (
      <Pressable
        className="mt-4 min-h-[44px] rounded-xl bg-blue-600 px-6 py-2.5"
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry"
      >
        <Text className="text-sm font-semibold text-white">Try again</Text>
      </Pressable>
    ) : null}
  </View>
)
