import { factory } from '../../../../__test-utils__/factory'
import { apiUrl, http, HttpResponse, server } from '../../../../__test-utils__/server'

import { authApi } from '@/features/auth/services/authApi'

describe('authApi', () => {
  it('login posts credentials and returns AuthPayload', async () => {
    const payload = factory.authPayload()
    server.use(http.post(apiUrl('/auth/login'), () => HttpResponse.json({ data: payload })))

    const result = await authApi.login({ email: 'ali@test.com', password: 'secret' })
    expect(result).toEqual(payload)
  })

  it('register posts registration data and returns AuthPayload', async () => {
    const payload = factory.authPayload()
    server.use(http.post(apiUrl('/auth/register'), () => HttpResponse.json({ data: payload })))

    const result = await authApi.register({
      name: 'Ali Khan',
      email: 'ali@test.com',
      password: 'secret',
      password_confirmation: 'secret',
    })
    expect(result).toEqual(payload)
  })

  it('me returns current user', async () => {
    const user = factory.user()
    server.use(http.get(apiUrl('/auth/me'), () => HttpResponse.json({ data: user })))

    const result = await authApi.me()
    expect(result).toEqual(user)
  })

  it('logout calls POST /auth/logout and returns void', async () => {
    server.use(
      http.post(apiUrl('/auth/logout'), () => HttpResponse.json({ message: 'Logged out.' })),
    )

    await expect(authApi.logout()).resolves.toBeUndefined()
  })
})
