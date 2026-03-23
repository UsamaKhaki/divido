import { useMutation, useQueryClient } from '@tanstack/react-query'

import { expensesApi } from '@/features/expenses/services/expensesApi'
import type { ApiError, UpdateSplitsRequest, UpdateSplitsResponse } from '@/types/api.types'

interface UpdateSplitsVars {
  expenseId: number
  itemId: number
  payload: UpdateSplitsRequest
}

export const useUpdateSplitsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<UpdateSplitsResponse, ApiError, UpdateSplitsVars>({
    mutationFn: ({ expenseId, itemId, payload }) =>
      expensesApi.updateSplits(expenseId, itemId, payload),
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['expense', vars.expenseId] })
    },
  })
}
