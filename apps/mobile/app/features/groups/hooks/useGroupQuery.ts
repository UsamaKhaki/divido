import { useQuery } from '@tanstack/react-query'

import { groupsApi } from '@/features/groups/services/groupsApi'
import type { ApiError, Group } from '@/types/api.types'

export const useGroupQuery = (groupId: number) =>
  useQuery<Group, ApiError>({
    queryKey: ['groups', groupId],
    queryFn: () => groupsApi.get(groupId),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 2,
  })
