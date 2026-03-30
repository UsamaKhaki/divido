import { api } from '@/services/api'
import type {
  ApiResponse,
  CreateExpenseRequest,
  Expense,
  ExpenseSummary,
  ExpenseSummaryShareResponse,
  PaginatedResponse,
  UpdateSplitsRequest,
  UpdateSplitsResponse,
} from '@/types/api.types'

export const expensesApi = {
  listByGroup: (groupId: number): Promise<ExpenseSummary[]> =>
    api
      .get<PaginatedResponse<ExpenseSummary>>(`/groups/${groupId}/expenses`)
      .then((r) => r.data.data),

  getById: (expenseId: number): Promise<Expense> =>
    api.get<ApiResponse<Expense>>(`/expenses/${expenseId}`).then((r) => r.data.data),

  create: (payload: CreateExpenseRequest): Promise<Expense> =>
    api.post<ApiResponse<Expense>>('/expenses', payload).then((r) => r.data.data),

  updateSplits: (
    expenseId: number,
    itemId: number,
    payload: UpdateSplitsRequest,
  ): Promise<UpdateSplitsResponse> =>
    api
      .put<
        ApiResponse<UpdateSplitsResponse>
      >(`/expenses/${expenseId}/items/${itemId}/splits`, payload)
      .then((r) => r.data.data),

  getSummary: (expenseId: number): Promise<ExpenseSummaryShareResponse> =>
    api
      .get<ApiResponse<ExpenseSummaryShareResponse>>(`/expenses/${expenseId}/summary`)
      .then((r) => r.data.data),

  delete: (expenseId: number): Promise<void> =>
    api.delete(`/expenses/${expenseId}`).then(() => undefined),
}
