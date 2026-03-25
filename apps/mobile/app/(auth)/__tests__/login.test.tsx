import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'

import { factory } from '../../__test-utils__/factory'
import { renderWithQuery } from '../../__test-utils__/createWrapper'
import { http, HttpResponse, server } from '../../__test-utils__/server'
import { apiUrl } from '../../__test-utils__/server'

import { useAuthStore } from '@/features/auth/store/authStore'

// Import the default export directly
import LoginScreen from '@/(auth)/login'

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null })
  jest.clearAllMocks()
})

describe('LoginScreen', () => {
  it('renders email and password fields and a sign in button', () => {
    renderWithQuery(<LoginScreen />)
    expect(screen.getByLabelText('Email')).toBeTruthy()
    expect(screen.getByLabelText('Password')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy()
  })

  it('submits credentials when the sign in button is pressed', async () => {
    const payload = factory.authPayload()
    let receivedBody: unknown
    server.use(
      http.post(apiUrl('/auth/login'), async ({ request }) => {
        receivedBody = await request.json()
        return HttpResponse.json({ data: payload })
      }),
    )

    renderWithQuery(<LoginScreen />)

    fireEvent.changeText(screen.getByLabelText('Email'), 'ali@test.com')
    fireEvent.changeText(screen.getByLabelText('Password'), 'secret123')
    fireEvent.press(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(useAuthStore.getState().token).toBe(payload.token))

    expect(receivedBody).toMatchObject({ email: 'ali@test.com', password: 'secret123' })
  })

  it('displays a general error message on API failure', async () => {
    server.use(
      http.post(apiUrl('/auth/login'), () =>
        HttpResponse.json({ message: 'Invalid credentials.' }, { status: 422 }),
      ),
    )

    renderWithQuery(<LoginScreen />)

    fireEvent.changeText(screen.getByLabelText('Email'), 'bad@test.com')
    fireEvent.changeText(screen.getByLabelText('Password'), 'wrong')
    fireEvent.press(screen.getByRole('button', { name: 'Sign in' }))

    // The mutation error is an AxiosError; the screen shows error.message
    await waitFor(() =>
      expect(screen.getByText(/Request failed with status code 422/i)).toBeTruthy(),
    )
  })

  it('renders a link to the register screen', () => {
    renderWithQuery(<LoginScreen />)
    expect(screen.getByText(/Don't have an account/i)).toBeTruthy()
  })
})
