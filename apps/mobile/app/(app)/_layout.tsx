import { Redirect, Stack } from 'expo-router'
import { Pressable, Text } from 'react-native'

import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation'
import { useAuthStore } from '@/features/auth/store/authStore'

export default function AppLayout() {
  const token = useAuthStore((s) => s.token)
  const { mutate: logout } = useLogoutMutation()

  if (!token) {
    return <Redirect href="/(auth)/login" />
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', color: '#111827' },
        contentStyle: { backgroundColor: '#f9fafb' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Groups',
          headerRight: () => (
            <Pressable
              onPress={() => logout()}
              className="min-h-[44px] min-w-[44px] items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Log out"
            >
              <Text className="text-sm font-medium text-red-500">Log out</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="groups/[groupId]" options={{ title: 'Group', headerShown: true }} />
      <Stack.Screen
        name="groups/[groupId]/add-expense"
        options={{ title: 'Add Expense', headerShown: true }}
      />
      <Stack.Screen
        name="groups/[groupId]/expenses/[expenseId]"
        options={{ title: 'Expense', headerShown: true }}
      />
      <Stack.Screen
        name="groups/[groupId]/settlements"
        options={{ title: 'Settlements', headerShown: true }}
      />
      <Stack.Screen
        name="groups/[groupId]/insights"
        options={{ title: 'Insights', headerShown: true }}
      />
      <Stack.Screen
        name="groups/[groupId]/scan-receipt"
        options={{ title: 'Scan Receipt', headerShown: true }}
      />
    </Stack>
  )
}
