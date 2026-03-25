import { useQuery } from '@tanstack/react-query'

import { expensesApi } from '@/features/expenses/services/expensesApi'
import { localDb } from '@/features/sync/services/localDb'
import type { ApiError, ExpenseCategory, ExpenseSummary } from '@/types/api.types'

export const useExpensesQuery = (groupId: number) =>
  useQuery<ExpenseSummary[], ApiError>({
    queryKey: ['expenses', groupId],
    queryFn: async () => {
      try {
        const expenses = await expensesApi.listByGroup(groupId)
        void localDb.upsertExpenses(
          expenses.map((e) => ({
            id: e.id,
            group_id: groupId,
            title: e.title,
            total_amount: e.total_amount,
            category: e.category,
            paid_by: e.paid_by.id,
            updated_at: e.created_at,
          })),
        )
        return expenses
      } catch {
        const rows = await localDb.getExpensesByGroup(groupId)
        return rows.map((r) => ({
          id: r.id,
          title: r.title,
          total_amount: r.total_amount,
          category: r.category as ExpenseCategory | null,
          paid_by: { id: r.paid_by, name: 'Unknown' },
          created_at: r.updated_at,
        })) satisfies ExpenseSummary[]
      }
    },
    enabled: !!groupId,
    staleTime: 1000 * 60 * 2,
  })
