import { useMutation, useQueryClient } from '@tanstack/react-query'

import { groupsApi } from '@/features/groups/services/groupsApi'
import type { ApiError, CreateGroupRequest, Group } from '@/types/api.types'

export const useCreateGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<Group, ApiError, CreateGroupRequest>({
    mutationFn: groupsApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
