import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import type { User } from '@/types/api.types'

const SECURE_STORE_KEY = 'divido_auth'

const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

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
      // expo-secure-store has no web implementation. The web build is for
      // local development, so it falls back to AsyncStorage (localStorage).
      storage: createJSONStorage(() => (Platform.OS === 'web' ? AsyncStorage : secureStorage)),
    },
  ),
)
