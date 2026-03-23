import { useQuery } from '@tanstack/react-query'

import { settlementsApi } from '@/features/settlements/services/settlementsApi'
import type { ApiError, GroupSettlementsResponse } from '@/types/api.types'

export const useSettlementsQuery = (groupId: number) =>
  useQuery<GroupSettlementsResponse, ApiError>({
    queryKey: ['settlements', groupId],
    queryFn: () => settlementsApi.getByGroup(groupId),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 2,
  })
