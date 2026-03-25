import { renderHook, waitFor } from '@testing-library/react-native'

import { factory } from '../../../../__test-utils__/factory'
import { createWrapper } from '../../../../__test-utils__/createWrapper'
import { http, HttpResponse, server } from '../../../../__test-utils__/server'
import { apiUrl } from '../../../../__test-utils__/server'
import { localDb } from '@/features/sync/services/localDb'
import { useGroupsQuery } from '@/features/groups/hooks/useGroupsQuery'

const mockedLocalDb = jest.mocked(localDb)

beforeEach(() => {
  jest.clearAllMocks()
  mockedLocalDb.getGroups.mockResolvedValue([])
  mockedLocalDb.upsertGroups.mockResolvedValue(undefined)
})

describe('useGroupsQuery', () => {
  it('fetches groups from API and returns them', async () => {
    const groups = [factory.groupSummary({ name: 'Lahore Trip' })]
    server.use(
      http.get(apiUrl('/groups'), () =>
        HttpResponse.json({ data: groups, meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 } }),
      ),
    )

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useGroupsQuery(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(groups)
  })

  it('upserts groups into localDb after fetching', async () => {
    const groups = [factory.groupSummary()]
    server.use(
      http.get(apiUrl('/groups'), () =>
        HttpResponse.json({ data: groups, meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 } }),
      ),
    )

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useGroupsQuery(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedLocalDb.upsertGroups).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: groups[0].id, name: groups[0].name })]),
    )
  })

  it('falls back to localDb when API fails', async () => {
    server.use(
      http.get(apiUrl('/groups'), () =>
        HttpResponse.json({ message: 'Server Error' }, { status: 500 }),
      ),
    )

    const localGroup = { id: 99, name: 'Cached Group', created_by: 1, updated_at: '2026-01-01T00:00:00Z' }
    mockedLocalDb.getGroups.mockResolvedValue([localGroup])

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useGroupsQuery(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([
      { id: 99, name: 'Cached Group', created_by: 1, member_count: 0, created_at: '2026-01-01T00:00:00Z' },
    ])
  })
})
