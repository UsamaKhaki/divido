import { renderHook, act, waitFor } from '@testing-library/react-native'

import { createWrapper } from '../../../../__test-utils__/createWrapper'
import { factory } from '../../../../__test-utils__/factory'
import { apiUrl, http, HttpResponse, server } from '../../../../__test-utils__/server'

import { useSettleMutation } from '@/features/settlements/hooks/useSettleMutation'

describe('useSettleMutation', () => {
  it('marks a settlement as settled and invalidates settlements cache', async () => {
    const settled = factory.settlement({ id: 10, status: 'settled' })
    server.use(
      http.post(apiUrl('/settlements/10/settle'), () => HttpResponse.json({ data: settled })),
    )

    const { Wrapper, queryClient } = createWrapper()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useSettleMutation(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ settlementId: 10, groupId: 5 })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.status).toBe('settled')
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['settlements', 5] }),
    )
  })

  it('surfaces API error on failure', async () => {
    server.use(
      http.post(apiUrl('/settlements/99/settle'), () =>
        HttpResponse.json({ message: 'Already settled.' }, { status: 422 }),
      ),
    )

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useSettleMutation(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ settlementId: 99, groupId: 1 })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
