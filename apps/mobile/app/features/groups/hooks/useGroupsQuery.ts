import { useQuery } from '@tanstack/react-query'

import { groupsApi } from '@/features/groups/services/groupsApi'
import type { ApiError, GroupSummary } from '@/types/api.types'

export const useGroupsQuery = () =>
  useQuery<GroupSummary[], ApiError>({
    queryKey: ['groups'],
    queryFn: groupsApi.list,
    staleTime: 1000 * 60 * 2,
  })
