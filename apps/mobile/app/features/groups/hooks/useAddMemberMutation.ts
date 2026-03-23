import { useMutation, useQueryClient } from '@tanstack/react-query'

import { groupsApi } from '@/features/groups/services/groupsApi'
import type { AddMemberRequest, ApiError, GroupMember } from '@/types/api.types'

interface AddMemberVars {
  groupId: number
  payload: AddMemberRequest
}

export const useAddMemberMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<GroupMember, ApiError, AddMemberVars>({
    mutationFn: ({ groupId, payload }) => groupsApi.addMember(groupId, payload),
    onSuccess: (_, { groupId }) => {
      void queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
    },
  })
}
