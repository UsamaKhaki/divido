import * as SecureStore from 'expo-secure-store'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import type { User } from '@/types/api.types'

const SECURE_STORE_KEY = 'divido_auth'

interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      token: null,
      user: null,
      setAuth: (token, user) =>
        set((state) => {
          state.token = token
          state.user = user
        }),
      clearAuth: () =>
        set((state) => {
          state.token = null
          state.user = null
        }),
    })),
    {
      name: SECURE_STORE_KEY,
      storage: createJSONStorage(() => ({
        getItem: (key) => SecureStore.getItemAsync(key),
        setItem: (key, value) => SecureStore.setItemAsync(key, value),
        removeItem: (key) => SecureStore.deleteItemAsync(key),
      })),
    },
  ),
)
