import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export const apiUrl = (path: string) => `${BASE}${path}`

/**
 * A shared MSW server instance for all tests.
 * Import this, add handlers per-test with server.use(…), and reset between tests.
 *
 * Usage:
 *   server.use(http.get(apiUrl('/groups'), () => HttpResponse.json({ data: [] })))
 */
export const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

export { http, HttpResponse }
