import { useMutation } from '@tanstack/react-query'
import { router } from 'expo-router'

import { authApi } from '@/features/auth/services/authApi'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { ApiError, RegisterRequest } from '@/types/api.types'

export const useRegisterMutation = () => {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation<void, ApiError, RegisterRequest>({
    mutationFn: async (payload) => {
      const data = await authApi.register(payload)
      setAuth(data.token, data.user)
    },
    onSuccess: () => {
      router.replace('/(app)')
    },
  })
}
