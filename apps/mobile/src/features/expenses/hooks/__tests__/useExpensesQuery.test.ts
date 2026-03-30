import { renderHook, waitFor } from '@testing-library/react-native'

import { createWrapper } from '../../../../__test-utils__/createWrapper'
import { factory } from '../../../../__test-utils__/factory'
import { apiUrl, http, HttpResponse, server } from '../../../../__test-utils__/server'

import { useExpensesQuery } from '@/features/expenses/hooks/useExpensesQuery'
import { localDb } from '@/features/sync/services/localDb'

const mockedLocalDb = jest.mocked(localDb)

beforeEach(() => {
  jest.clearAllMocks()
  mockedLocalDb.getExpensesByGroup.mockResolvedValue([])
  mockedLocalDb.upsertExpenses.mockResolvedValue(undefined)
})

describe('useExpensesQuery', () => {
  it('fetches expenses from API and returns them', async () => {
    const expenses = [factory.expenseSummary({ title: 'Dinner' })]
    server.use(
      http.get(apiUrl('/groups/1/expenses'), () =>
        HttpResponse.json({
          data: expenses,
          meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
        }),
      ),
    )

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useExpensesQuery(1), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(expenses)
  })

  it('upserts expenses into localDb after fetching', async () => {
    const expenses = [factory.expenseSummary()]
    server.use(
      http.get(apiUrl('/groups/1/expenses'), () =>
        HttpResponse.json({
          data: expenses,
          meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
        }),
      ),
    )

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useExpensesQuery(1), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedLocalDb.upsertExpenses).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: expenses[0].id, title: expenses[0].title, group_id: 1 }),
      ]),
    )
  })

  it('falls back to localDb when API fails', async () => {
    server.use(
      http.get(apiUrl('/groups/1/expenses'), () =>
        HttpResponse.json({ message: 'Server Error' }, { status: 500 }),
      ),
    )

    const localExpense = {
      id: 55,
      group_id: 1,
      title: 'Cached Lunch',
      total_amount: 800,
      category: 'food',
      paid_by: 1,
      updated_at: '2026-01-01T00:00:00Z',
    }
    mockedLocalDb.getExpensesByGroup.mockResolvedValue([localExpense])

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useExpensesQuery(1), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.[0]).toEqual(
      expect.objectContaining({ id: 55, title: 'Cached Lunch', total_amount: 800 }),
    )
  })

  it('is disabled when groupId is 0', () => {
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useExpensesQuery(0), { wrapper: Wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })
})
