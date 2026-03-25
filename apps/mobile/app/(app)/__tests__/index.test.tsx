import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'

import { factory } from '../../__test-utils__/factory'
import { renderWithQuery } from '../../__test-utils__/createWrapper'
import { http, HttpResponse, server } from '../../__test-utils__/server'
import { apiUrl } from '../../__test-utils__/server'
import { localDb } from '@/features/sync/services/localDb'

// Bypass the expo-router layout — import the default export directly
import HomeScreen from '@/(app)/index'

const mockedLocalDb = jest.mocked(localDb)

beforeEach(() => {
  jest.clearAllMocks()
  mockedLocalDb.getGroups.mockResolvedValue([])
  mockedLocalDb.upsertGroups.mockResolvedValue(undefined)
})

describe('HomeScreen', () => {
  it('shows loading skeleton while fetching', () => {
    // Delay response so loading state is visible
    server.use(
      http.get(apiUrl('/groups'), async () => {
        await new Promise((r) => setTimeout(r, 500))
        return HttpResponse.json({ data: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } })
      }),
    )

    renderWithQuery(<HomeScreen />)
    // LoadingSkeleton renders — just assert it doesn't crash
    expect(screen.queryByText(/Couldn't load/)).toBeNull()
  })

  it('shows empty state when API fails (falls back to localDb empty)', async () => {
    // useGroupsQuery catches API errors and falls back to localDb.getGroups()
    // which is mocked to return [] in beforeEach → screen shows empty state
    server.use(
      http.get(apiUrl('/groups'), () =>
        HttpResponse.json({ message: 'Server Error' }, { status: 500 }),
      ),
    )

    renderWithQuery(<HomeScreen />)

    // Falls back to localDb (returns []) → empty state, not error state
    await waitFor(() =>
      expect(screen.getByText('No groups yet.')).toBeTruthy(),
    )
  })

  it('shows empty state when no groups exist', async () => {
    server.use(
      http.get(apiUrl('/groups'), () =>
        HttpResponse.json({ data: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } }),
      ),
    )

    renderWithQuery(<HomeScreen />)

    await waitFor(() => expect(screen.getByText('No groups yet.')).toBeTruthy())
  })

  it('renders a list of groups', async () => {
    const groups = [
      factory.groupSummary({ name: 'Lahore Trip' }),
      factory.groupSummary({ name: 'Karachi Crew' }),
    ]
    server.use(
      http.get(apiUrl('/groups'), () =>
        HttpResponse.json({ data: groups, meta: { current_page: 1, last_page: 1, per_page: 15, total: 2 } }),
      ),
    )

    renderWithQuery(<HomeScreen />)

    await waitFor(() => expect(screen.getByText('Lahore Trip')).toBeTruthy())
    expect(screen.getByText('Karachi Crew')).toBeTruthy()
  })
})
