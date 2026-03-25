import { useAuthStore } from '@/features/auth/store/authStore'

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null })
})

describe('authStore', () => {
  it('initial state has null token and user', () => {
    const { token, user } = useAuthStore.getState()
    expect(token).toBeNull()
    expect(user).toBeNull()
  })

  it('setAuth stores token and user', () => {
    const user = { id: 1, name: 'Ali Khan', email: 'ali@test.com' }
    useAuthStore.getState().setAuth('my-token', user)

    const state = useAuthStore.getState()
    expect(state.token).toBe('my-token')
    expect(state.user).toEqual(user)
  })

  it('clearAuth wipes token and user', () => {
    useAuthStore.setState({ token: 'old-token', user: { id: 1, name: 'Ali', email: 'ali@test.com' } })
    useAuthStore.getState().clearAuth()

    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
  })
})
