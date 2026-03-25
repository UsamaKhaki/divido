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
            const expense = await expensesApi.create(op.payload as CreateExpenseRequest)
            void queryClient.invalidateQueries({ queryKey: ['expenses', expense.group_id] })
          } else if (op.type === 'update_splits') {
            const { expenseId, itemId, payload } = op.payload as {
              expenseId: number
              itemId: number
              payload: UpdateSplitsRequest
            }
            await expensesApi.updateSplits(expenseId, itemId, payload)
            void queryClient.invalidateQueries({ queryKey: ['expense', expenseId] })
          }
          dequeue(op.id)
        } catch {
          // Leave the op in the queue — it will be retried on next reconnect
          break
        }
      }
    })

    return unsubscribe
  }, [queue, dequeue, queryClient])
}
