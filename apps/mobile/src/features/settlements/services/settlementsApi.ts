import { api } from '@/services/api'
import type { ApiResponse, GroupSettlementsResponse, Settlement } from '@/types/api.types'

export const settlementsApi = {
  getByGroup: (groupId: number): Promise<GroupSettlementsResponse> =>
    api
      .get<ApiResponse<GroupSettlementsResponse>>(`/groups/${groupId}/settlements`)
      .then((r) => r.data.data),

  settle: (settlementId: number): Promise<Settlement> =>
    api
      .post<ApiResponse<Settlement>>(`/settlements/${settlementId}/settle`)
      .then((r) => r.data.data),
}
