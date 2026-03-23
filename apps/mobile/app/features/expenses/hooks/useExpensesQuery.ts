import { useQuery } from '@tanstack/react-query'

import { expensesApi } from '@/features/expenses/services/expensesApi'
import type { ApiError, ExpenseSummary } from '@/types/api.types'

export const useExpensesQuery = (groupId: number) =>
  useQuery<ExpenseSummary[], ApiError>({
    queryKey: ['expenses', groupId],
    queryFn: () => expensesApi.listByGroup(groupId),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 2,
  })
