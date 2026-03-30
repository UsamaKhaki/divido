import { useQuery } from '@tanstack/react-query'

import { expensesApi } from '@/features/expenses/services/expensesApi'
import type { ApiError, Expense } from '@/types/api.types'

export const useExpenseQuery = (expenseId: number) =>
  useQuery<Expense, ApiError>({
    queryKey: ['expense', expenseId],
    queryFn: () => expensesApi.getById(expenseId),
    enabled: !!expenseId,
    staleTime: 1000 * 60 * 2,
  })
