import { api } from '@/services/api'
import type { ApiResponse, GroupInsightsResponse } from '@/types/api.types'

export const insightsApi = {
  getForGroup: (groupId: number): Promise<GroupInsightsResponse> =>
    api
      .get<ApiResponse<GroupInsightsResponse>>(`/groups/${groupId}/insights`)
      .then((r) => r.data.data),
}
