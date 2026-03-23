import { useMutation, useQueryClient } from '@tanstack/react-query'

import { expensesApi } from '@/features/expenses/services/expensesApi'
import type { ApiError, CreateExpenseRequest, Expense } from '@/types/api.types'

export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<Expense, ApiError, CreateExpenseRequest>({
    mutationFn: expensesApi.create,
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ['expenses', vars.group_id],
      })
    },
  })
}
