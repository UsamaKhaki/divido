import { renderHook, waitFor } from '@testing-library/react-native'

import { factory } from '../../../../__test-utils__/factory'
import { createWrapper } from '../../../../__test-utils__/createWrapper'
import { http, HttpResponse, server } from '../../../../__test-utils__/server'
import { apiUrl } from '../../../../__test-utils__/server'

import { useGroupQuery } from '@/features/groups/hooks/useGroupQuery'

describe('useGroupQuery', () => {
  it('fetches and returns a group by id', async () => {
    const group = factory.group({ id: 7, name: 'Karachi Crew' })
    server.use(
      http.get(apiUrl('/groups/7'), () => HttpResponse.json({ data: group })),
    )

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useGroupQuery(7), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(group)
  })

  it('is disabled when groupId is 0', () => {
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useGroupQuery(0), { wrapper: Wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })
})
