/**
 * useSyncQueue — drains pending offline operations when the device reconnects.
 *
 * Subscribes to NetInfo. When the connection state changes from offline to
 * online, all queued operations are replayed against the live API in
 * creation order. Successfully replayed operations are dequeued; failures
 * are left in place for the next reconnect.
 */

import NetInfo from '@react-native-community/netinfo'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { useSyncQueueStore } from '../store/syncQueueStore'

import { expensesApi } from '@/features/expenses/services/expensesApi'
import { settlementsApi } from '@/features/settlements/services/settlementsApi'
import type { CreateExpenseRequest, UpdateSplitsRequest } from '@/types/api.types'

export const useSyncQueue = () => {
  const { queue, dequeue } = useSyncQueueStore()
  const queryClient = useQueryClient()
  const wasOfflineRef = useRef(false)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const isOnline = state.isConnected === true && state.isInternetReachable !== false

      if (!isOnline) {
        wasOfflineRef.current = true
        return
      }

      if (!wasOfflineRef.current || queue.length === 0) {
        wasOfflineRef.current = false
        return
      }

      wasOfflineRef.current = false

      // Drain queue in order, stop on first failure to preserve ordering
      for (const op of [...queue]) {
        try {
          if (op.type === 'create_expense') {
            const payload = op.payload as CreateExpenseRequest
            await expensesApi.create(payload)
            void queryClient.invalidateQueries({ queryKey: ['expenses', payload.group_id] })
          } else if (op.type === 'update_splits') {
            const { expenseId, itemId, payload } = op.payload as {
              expenseId: number
              itemId: number
              payload: UpdateSplitsRequest
            }
            await expensesApi.updateSplits(expenseId, itemId, payload)
            void queryClient.invalidateQueries({ queryKey: ['expense', expenseId] })
          } else if (op.type === 'settle') {
            const { settlementId, groupId } = op.payload as {
              settlementId: number
              groupId: number
            }
            await settlementsApi.settle(settlementId)
            void queryClient.invalidateQueries({ queryKey: ['settlements', groupId] })
          }
          dequeue(op.id)
        } catch (error) {
          const status = (error as { response?: { status?: number } })?.response?.status
          if (status !== undefined && status >= 400 && status < 500) {
            // 4xx: server rejected the op (conflict / already settled / deleted)
            // Server wins — drop this operation and refresh all stale data.
            dequeue(op.id)
            void queryClient.invalidateQueries()
          } else {
            // Network or 5xx error — stop draining, retry on next reconnect.
            break
          }
        }
      }
    })

    return unsubscribe
  }, [queue, dequeue, queryClient])
}
