import { api } from '@/services/api'
import type {
  ApiResponse,
  CreateExpenseRequest,
  Expense,
  ExpenseSummary,
  PaginatedResponse,
} from '@/types/api.types'

export const expensesApi = {
  listByGroup: (groupId: number): Promise<ExpenseSummary[]> =>
    api
      .get<PaginatedResponse<ExpenseSummary>>(`/groups/${groupId}/expenses`)
      .then((r) => r.data.data),

  create: (payload: CreateExpenseRequest): Promise<Expense> =>
    api.post<ApiResponse<Expense>>('/expenses', payload).then((r) => r.data.data),
}
