import { api } from '@/services/api'
import type { ApiResponse, ItemSuggestion } from '@/types/api.types'

export const suggestionsApi = {
  getForGroup: (groupId: number, items: string[]): Promise<ItemSuggestion[]> =>
    api
      .get<ApiResponse<ItemSuggestion[]>>(`/groups/${groupId}/suggestions`, {
        params: { items: items.join(',') },
      })
      .then((r) => r.data.data),
}
