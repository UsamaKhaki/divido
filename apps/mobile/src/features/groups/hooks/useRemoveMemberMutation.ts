import { useMutation, useQueryClient } from '@tanstack/react-query'

import { groupsApi } from '@/features/groups/services/groupsApi'
import type { ApiError } from '@/types/api.types'

interface RemoveMemberVars {
  groupId: number
  userId: number
}

export const useRemoveMemberMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, RemoveMemberVars>({
    mutationFn: ({ groupId, userId }) => groupsApi.removeMember(groupId, userId),
    onSuccess: (_, { groupId }) => {
      void queryClient.invalidateQueries({ queryKey: ['group', groupId] })
    },
  })
}
