/**
 * syncQueueStore — Zustand store for pending offline operations.
 *
 * When the device is offline, mutations are enqueued here.
 * useSyncQueue drains the queue automatically when connectivity returns.
 *
 * Persisted to AsyncStorage so the queue survives app restarts.
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export type SyncOperationType = 'create_expense' | 'update_splits' | 'settle'

export interface SyncOperation {
  id: string
  type: SyncOperationType
  payload: unknown
  createdAt: number
}

interface SyncQueueState {
  queue: SyncOperation[]
  enqueue: (op: Omit<SyncOperation, 'id' | 'createdAt'>) => void
  dequeue: (id: string) => void
  clear: () => void
}

export const useSyncQueueStore = create<SyncQueueState>()(
  persist(
    immer((set) => ({
      queue: [],

      enqueue: (op) =>
        set((state) => {
          state.queue.push({
            ...op,
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            createdAt: Date.now(),
          })
        }),

      dequeue: (id) =>
        set((state) => {
          state.queue = state.queue.filter((op) => op.id !== id)
        }),

      clear: () =>
        set((state) => {
          state.queue = []
        }),
    })),
    {
      name: 'divido_sync_queue',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
