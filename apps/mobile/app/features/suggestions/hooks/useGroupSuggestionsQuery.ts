import { useQuery } from '@tanstack/react-query'

import { suggestionsApi } from '../services/suggestionsApi'

import type { ApiError, ItemSuggestion } from '@/types/api.types'

export const useGroupSuggestionsQuery = (groupId: number, items: string[]) =>
  useQuery<ItemSuggestion[], ApiError>({
    queryKey: ['suggestions', groupId, items],
    queryFn: () => suggestionsApi.getForGroup(groupId, items),
    enabled: !!groupId && items.length > 0,
    staleTime: 1000 * 60 * 5,
  })
