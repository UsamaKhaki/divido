import { useMutation, useQueryClient } from '@tanstack/react-query'

import { expensesApi } from '@/features/expenses/services/expensesApi'
import type { ApiError } from '@/types/api.types'

interface DeleteExpenseVars {
  expenseId: number
  groupId: number
}

export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, DeleteExpenseVars>({
    mutationFn: ({ expenseId }) => expensesApi.delete(expenseId),
    onSuccess: (_, { groupId }) => {
      void queryClient.invalidateQueries({ queryKey: ['expenses', groupId] })
    },
  })
}
