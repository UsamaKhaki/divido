import { useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'

import { authApi } from '@/features/auth/services/authApi'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { ApiError } from '@/types/api.types'

export const useLogoutMutation = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, void>({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuth()
      queryClient.clear()
      router.replace('/(auth)/login')
    },
  })
}
