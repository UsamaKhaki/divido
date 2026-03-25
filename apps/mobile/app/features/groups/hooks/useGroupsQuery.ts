import { useQuery } from '@tanstack/react-query'

import { groupsApi } from '@/features/groups/services/groupsApi'
import { localDb } from '@/features/sync/services/localDb'
import type { ApiError, GroupSummary } from '@/types/api.types'

export const useGroupsQuery = () =>
  useQuery<GroupSummary[], ApiError>({
    queryKey: ['groups'],
    queryFn: async () => {
      try {
        const groups = await groupsApi.list()
        void localDb.upsertGroups(
          groups.map((g) => ({
            id: g.id,
            name: g.name,
            created_by: g.created_by,
            updated_at: g.created_at,
          })),
        )
        return groups
      } catch {
        const rows = await localDb.getGroups()
        return rows.map((r) => ({
          id: r.id,
          name: r.name,
          created_by: r.created_by,
          member_count: 0,
          created_at: r.updated_at,
        })) satisfies GroupSummary[]
      }
    },
    staleTime: 1000 * 60 * 2,
  })
