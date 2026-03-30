import NetInfo from '@react-native-community/netinfo'
import { renderHook, act, waitFor } from '@testing-library/react-native'

import { createWrapper } from '../../../../__test-utils__/createWrapper'
import { factory } from '../../../../__test-utils__/factory'
import { apiUrl, http, HttpResponse, server } from '../../../../__test-utils__/server'

import { useCreateExpenseMutation } from '@/features/expenses/hooks/useCreateExpenseMutation'
import { useSyncQueueStore } from '@/features/sync/store/syncQueueStore'

const mockedNetInfo = jest.mocked(NetInfo)

beforeEach(() => {
  jest.clearAllMocks()
  useSyncQueueStore.setState({ queue: [] })
  mockedNetInfo.fetch.mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
  } as ReturnType<typeof NetInfo.fetch> extends Promise<infer T> ? T : never)
})

describe('useCreateExpenseMutation — online', () => {
  it('calls API and invalidates expenses cache', async () => {
    const expense = factory.expense({ title: 'Hotel', total_amount: 5000 })
    server.use(http.post(apiUrl('/expenses'), () => HttpResponse.json({ data: expense })))

    const { Wrapper, queryClient } = createWrapper()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateExpenseMutation(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ group_id: 1, title: 'Hotel', total_amount: 5000 })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['expenses', 1] }),
    )
    expect(useSyncQueueStore.getState().queue).toHaveLength(0)
  })
})

describe('useCreateExpenseMutation — offline', () => {
  it('enqueues operation and returns sentinel id -1 without calling API', async () => {
    mockedNetInfo.fetch.mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
    } as ReturnType<typeof NetInfo.fetch> extends Promise<infer T> ? T : never)

    let apiCalled = false
    server.use(
      http.post(apiUrl('/expenses'), () => {
        apiCalled = true
        return HttpResponse.json({ data: factory.expense() })
      }),
    )

    const { Wrapper, queryClient } = createWrapper()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateExpenseMutation(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ group_id: 1, title: 'Offline Dinner', total_amount: 1200 })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiCalled).toBe(false)
    expect(invalidateSpy).not.toHaveBeenCalled()

    const queue = useSyncQueueStore.getState().queue
    expect(queue).toHaveLength(1)
    expect(queue[0].type).toBe('create_expense')
    expect(queue[0].payload).toMatchObject({ group_id: 1, title: 'Offline Dinner' })
  })
})
