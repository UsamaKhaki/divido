import { useMutation, useQueryClient } from '@tanstack/react-query'

import { groupsApi } from '@/features/groups/services/groupsApi'
import type { ApiError } from '@/types/api.types'

export const useDeleteGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, number>({
    mutationFn: (groupId) => groupsApi.deleteGroup(groupId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
