import { http, HttpResponse, server, apiUrl } from '../../__test-utils__/server'

// Import after mocks are in place
import { useAuthStore } from '@/features/auth/store/authStore'
import { api } from '@/services/api'

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null })
})

describe('api interceptors', () => {
  it('attaches Authorization header when token is set', async () => {
    useAuthStore.setState({ token: 'my-secret-token', user: null })

    let capturedAuth: string | undefined
    server.use(
      http.get(apiUrl('/auth/me'), ({ request }) => {
        capturedAuth = request.headers.get('Authorization') ?? undefined
        return HttpResponse.json({ data: { id: 1, name: 'Ali', email: 'ali@test.com' } })
      }),
    )

    await api.get('/auth/me')
    expect(capturedAuth).toBe('Bearer my-secret-token')
  })

  it('omits Authorization header when no token', async () => {
    let capturedAuth: string | null = null
    server.use(
      http.get(apiUrl('/auth/me'), ({ request }) => {
        capturedAuth = request.headers.get('Authorization')
        return HttpResponse.json({ data: { id: 1, name: 'Ali', email: 'ali@test.com' } })
      }),
    )

    await api.get('/auth/me')
    expect(capturedAuth).toBeNull()
  })

  it('calls clearAuth when API returns 401', async () => {
    useAuthStore.setState({ token: 'expired-token', user: null })

    server.use(
      http.get(apiUrl('/auth/me'), () =>
        HttpResponse.json({ message: 'Unauthenticated.' }, { status: 401 }),
      ),
    )

    await expect(api.get('/auth/me')).rejects.toMatchObject({ response: { status: 401 } })
    expect(useAuthStore.getState().token).toBeNull()
  })
})
