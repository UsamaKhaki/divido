import { renderHook, act, waitFor } from '@testing-library/react-native'
import { router } from 'expo-router'

import { createWrapper } from '../../../../__test-utils__/createWrapper'
import { factory } from '../../../../__test-utils__/factory'
import { apiUrl, http, HttpResponse, server } from '../../../../__test-utils__/server'

import { useLoginMutation } from '@/features/auth/hooks/useLoginMutation'
import { useAuthStore } from '@/features/auth/store/authStore'

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null })
  jest.clearAllMocks()
})

describe('useLoginMutation', () => {
  it('on success: stores auth and navigates to /(app)', async () => {
    const payload = factory.authPayload()
    server.use(http.post(apiUrl('/auth/login'), () => HttpResponse.json({ data: payload })))

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useLoginMutation(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ email: 'ali@test.com', password: 'secret' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(useAuthStore.getState().token).toBe(payload.token)
    expect(useAuthStore.getState().user).toEqual(payload.user)
    expect(router.replace).toHaveBeenCalledWith('/(app)')
  })

  it('on API error: surfaces error and does not navigate', async () => {
    server.use(
      http.post(apiUrl('/auth/login'), () =>
        HttpResponse.json({ message: 'Invalid credentials.' }, { status: 422 }),
      ),
    )

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useLoginMutation(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ email: 'bad@test.com', password: 'wrong' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(router.replace).not.toHaveBeenCalled()
    expect(useAuthStore.getState().token).toBeNull()
  })
})
