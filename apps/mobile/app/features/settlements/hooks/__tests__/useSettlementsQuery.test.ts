import { renderHook, waitFor } from '@testing-library/react-native'

import { factory } from '../../../../__test-utils__/factory'
import { createWrapper } from '../../../../__test-utils__/createWrapper'
import { http, HttpResponse, server } from '../../../../__test-utils__/server'
import { apiUrl } from '../../../../__test-utils__/server'

import { useSettlementsQuery } from '@/features/settlements/hooks/useSettlementsQuery'

describe('useSettlementsQuery', () => {
  it('fetches settlements for a group', async () => {
    const response = factory.groupSettlementsResponse()
    server.use(
      http.get(apiUrl('/groups/3/settlements'), () =>
        HttpResponse.json({ data: response }),
      ),
    )

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useSettlementsQuery(3), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.settlements).toHaveLength(1)
    expect(result.current.data?.total_unsettled).toBe(600)
  })

  it('is disabled when groupId is 0', () => {
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useSettlementsQuery(0), { wrapper: Wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })
})
