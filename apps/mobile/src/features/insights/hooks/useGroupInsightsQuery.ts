import { useQuery } from '@tanstack/react-query'

import { insightsApi } from '../services/insightsApi'

import type { ApiError, GroupInsightsResponse } from '@/types/api.types'

export const useGroupInsightsQuery = (groupId: number) =>
  useQuery<GroupInsightsResponse, ApiError>({
    queryKey: ['insights', groupId],
    queryFn: () => insightsApi.getForGroup(groupId),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 5,
  })
