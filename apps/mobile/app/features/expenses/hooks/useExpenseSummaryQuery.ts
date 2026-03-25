import { useQuery } from '@tanstack/react-query'

import { expensesApi } from '../services/expensesApi'

import type { ApiError, ExpenseSummaryShareResponse } from '@/types/api.types'

export const useExpenseSummaryQuery = (expenseId: number) =>
  useQuery<ExpenseSummaryShareResponse, ApiError>({
    queryKey: ['expense-summary', expenseId],
    queryFn: () => expensesApi.getSummary(expenseId),
    enabled: !!expenseId,
    staleTime: 1000 * 60 * 5,
  })
