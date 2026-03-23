import { useMutation, useQueryClient } from '@tanstack/react-query'

import { settlementsApi } from '@/features/settlements/services/settlementsApi'
import type { ApiError, Settlement } from '@/types/api.types'

interface SettleVars {
  settlementId: number
  groupId: number
}

export const useSettleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<Settlement, ApiError, SettleVars>({
    mutationFn: ({ settlementId }) => settlementsApi.settle(settlementId),
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['settlements', vars.groupId] })
    },
  })
}
