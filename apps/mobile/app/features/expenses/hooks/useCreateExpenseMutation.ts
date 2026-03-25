import NetInfo from '@react-native-community/netinfo'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { expensesApi } from '@/features/expenses/services/expensesApi'
import { useSyncQueueStore } from '@/features/sync/store/syncQueueStore'
import type { ApiError, CreateExpenseRequest, Expense } from '@/types/api.types'

export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient()
  const enqueue = useSyncQueueStore((s) => s.enqueue)

  return useMutation<Expense, ApiError, CreateExpenseRequest>({
    mutationFn: async (payload) => {
      const netState = await NetInfo.fetch()
      if (!netState.isConnected) {
        enqueue({ type: 'create_expense', payload })
        // Return a sentinel — onSuccess will skip cache invalidation
        return { id: -1 } as unknown as Expense
      }
      return expensesApi.create(payload)
    },
    onSuccess: (expense, vars) => {
      if (expense.id === -1) return // queued for offline sync — nothing to invalidate yet
      void queryClient.invalidateQueries({
        queryKey: ['expenses', vars.group_id],
      })
    },
  })
}
