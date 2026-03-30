/**
 * useSyncQueue — tests for the offline-to-online drain logic.
 *
 * Strategy: call `renderHook(useSyncQueue)`, then fire the captured NetInfo
 * listener callback manually to simulate going offline then online.
 */
import NetInfo from '@react-native-community/netinfo'
import type { NetInfoState } from '@react-native-community/netinfo'
import { renderHook } from '@testing-library/react-native'

import { createWrapper } from '../../../../__test-utils__/createWrapper'
import { factory } from '../../../../__test-utils__/factory'
import { apiUrl, http, HttpResponse, server } from '../../../../__test-utils__/server'

import { useSyncQueue } from '@/features/sync/hooks/useSyncQueue'
import { useSyncQueueStore } from '@/features/sync/store/syncQueueStore'

const mockedNetInfo = jest.mocked(NetInfo)

/** Captured listener from the mock so tests can call it directly */
type NetInfoListener = (state: NetInfoState) => void
let capturedListener: NetInfoListener | null = null

const onlineState: Partial<NetInfoState> = { isConnected: true, isInternetReachable: true }
const offlineState: Partial<NetInfoState> = { isConnected: false, isInternetReachable: false }

beforeEach(() => {
  capturedListener = null
  jest.clearAllMocks()
  useSyncQueueStore.setState({ queue: [] })

  mockedNetInfo.addEventListener.mockImplementation((listener) => {
    capturedListener = listener as NetInfoListener
    return jest.fn() // unsubscribe fn
  })
})

const fireNetInfo = (state: Partial<NetInfoState>) => {
  capturedListener?.(state as NetInfoState)
}

describe('useSyncQueue', () => {
  it('drains a create_expense op on reconnect', async () => {
    const expense = factory.expense()
    server.use(http.post(apiUrl('/expenses'), () => HttpResponse.json({ data: expense })))

    // Seed a pending op
    useSyncQueueStore.getState().enqueue({
      type: 'create_expense',
      payload: { group_id: 1, title: 'Queued', total_amount: 500 },
    })
    expect(useSyncQueueStore.getState().queue).toHaveLength(1)

    const { Wrapper, queryClient } = createWrapper()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    renderHook(() => useSyncQueue(), { wrapper: Wrapper })

    // Simulate: went offline, then came back online
    fireNetInfo(offlineState)
    fireNetInfo(onlineState)

    // Give async drain a moment
    await new Promise((r) => setTimeout(r, 100))

    expect(useSyncQueueStore.getState().queue).toHaveLength(0)
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['expenses', 1] }),
    )
  })

  it('dequeues and invalidates ALL on 4xx (conflict resolution)', async () => {
    server.use(
      http.post(apiUrl('/expenses'), () =>
        HttpResponse.json({ message: 'Conflict.' }, { status: 409 }),
      ),
    )

    useSyncQueueStore.getState().enqueue({
      type: 'create_expense',
      payload: { group_id: 1, title: 'Conflict Op', total_amount: 100 },
    })

    const { Wrapper, queryClient } = createWrapper()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    renderHook(() => useSyncQueue(), { wrapper: Wrapper })

    fireNetInfo(offlineState)
    fireNetInfo(onlineState)
    await new Promise((r) => setTimeout(r, 100))

    // 4xx → op dropped + full invalidation
    expect(useSyncQueueStore.getState().queue).toHaveLength(0)
    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('stops draining and leaves op in queue on 5xx (retry on next reconnect)', async () => {
    server.use(
      http.post(apiUrl('/expenses'), () =>
        HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
      ),
    )

    useSyncQueueStore.getState().enqueue({
      type: 'create_expense',
      payload: { group_id: 1, title: 'Retry Op', total_amount: 200 },
    })

    const { Wrapper } = createWrapper()
    renderHook(() => useSyncQueue(), { wrapper: Wrapper })

    fireNetInfo(offlineState)
    fireNetInfo(onlineState)
    await new Promise((r) => setTimeout(r, 100))

    // 5xx → op kept in queue to retry later
    expect(useSyncQueueStore.getState().queue).toHaveLength(1)
  })

  it('does nothing if queue is empty on reconnect', async () => {
    const { Wrapper, queryClient } = createWrapper()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    renderHook(() => useSyncQueue(), { wrapper: Wrapper })

    fireNetInfo(offlineState)
    fireNetInfo(onlineState)
    await new Promise((r) => setTimeout(r, 50))

    expect(invalidateSpy).not.toHaveBeenCalled()
  })
})
