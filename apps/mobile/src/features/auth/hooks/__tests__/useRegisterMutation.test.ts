import { renderHook, act, waitFor } from '@testing-library/react-native'
import { router } from 'expo-router'

import { createWrapper } from '../../../../__test-utils__/createWrapper'
import { factory } from '../../../../__test-utils__/factory'
import { apiUrl, http, HttpResponse, server } from '../../../../__test-utils__/server'

import { useRegisterMutation } from '@/features/auth/hooks/useRegisterMutation'
import { useAuthStore } from '@/features/auth/store/authStore'

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null })
  jest.clearAllMocks()
})

describe('useRegisterMutation', () => {
  it('on success: stores auth and navigates to /(app)', async () => {
    const payload = factory.authPayload()
    server.use(http.post(apiUrl('/auth/register'), () => HttpResponse.json({ data: payload })))

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useRegisterMutation(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({
        name: 'Ali Khan',
        email: 'ali@test.com',
        password: 'secret123',
        password_confirmation: 'secret123',
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(useAuthStore.getState().token).toBe(payload.token)
    expect(useAuthStore.getState().user).toEqual(payload.user)
    expect(router.replace).toHaveBeenCalledWith('/(app)')
  })

  it('on validation error: surfaces error and does not navigate', async () => {
    server.use(
      http.post(apiUrl('/auth/register'), () =>
        HttpResponse.json(
          { message: 'Validation failed.', errors: { email: ['Email already taken.'] } },
          { status: 422 },
        ),
      ),
    )

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useRegisterMutation(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({
        name: 'Dup User',
        email: 'taken@test.com',
        password: 'secret123',
        password_confirmation: 'secret123',
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(router.replace).not.toHaveBeenCalled()
  })
})
