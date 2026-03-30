import { useMutation } from '@tanstack/react-query'
import { router } from 'expo-router'

import { authApi } from '@/features/auth/services/authApi'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { ApiError, LoginRequest } from '@/types/api.types'

export const useLoginMutation = () => {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation<void, ApiError, LoginRequest>({
    mutationFn: async (payload) => {
      const data = await authApi.login(payload)
      setAuth(data.token, data.user)
    },
    onSuccess: () => {
      router.replace('/(app)')
    },
  })
}
