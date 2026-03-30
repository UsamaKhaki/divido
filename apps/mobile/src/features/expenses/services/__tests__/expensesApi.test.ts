import { factory } from '../../../../__test-utils__/factory'
import { apiUrl, http, HttpResponse, server } from '../../../../__test-utils__/server'

import { expensesApi } from '@/features/expenses/services/expensesApi'

describe('expensesApi', () => {
  it('listByGroup returns ExpenseSummary array', async () => {
    const expenses = [factory.expenseSummary(), factory.expenseSummary({ title: 'Lunch' })]
    server.use(
      http.get(apiUrl('/groups/1/expenses'), () =>
        HttpResponse.json({
          data: expenses,
          meta: { current_page: 1, last_page: 1, per_page: 15, total: 2 },
        }),
      ),
    )

    const result = await expensesApi.listByGroup(1)
    expect(result).toEqual(expenses)
  })

  it('getById returns full Expense with items', async () => {
    const expense = factory.expense()
    server.use(
      http.get(apiUrl(`/expenses/${expense.id}`), () => HttpResponse.json({ data: expense })),
    )

    const result = await expensesApi.getById(expense.id)
    expect(result).toEqual(expense)
  })

  it('create posts payload and returns Expense', async () => {
    const expense = factory.expense({ title: 'Hotel' })
    server.use(http.post(apiUrl('/expenses'), () => HttpResponse.json({ data: expense })))

    const result = await expensesApi.create({
      group_id: 1,
      title: 'Hotel',
      total_amount: 5000,
    })
    expect(result.title).toBe('Hotel')
  })

  it('delete sends DELETE request and returns void', async () => {
    server.use(http.delete(apiUrl('/expenses/1'), () => new HttpResponse(null, { status: 204 })))

    await expect(expensesApi.delete(1)).resolves.toBeUndefined()
  })

  it('updateSplits PUT to splits endpoint', async () => {
    const response = { item_id: 1, splits: [{ user: { id: 1, name: 'Ali' }, amount: 500 }] }
    server.use(
      http.put(apiUrl('/expenses/1/items/2/splits'), () => HttpResponse.json({ data: response })),
    )

    const result = await expensesApi.updateSplits(1, 2, { splits: [{ user_id: 1, amount: 500 }] })
    expect(result.item_id).toBe(1)
  })

  it('getSummary returns summary string', async () => {
    const response = { summary: 'Ali paid PKR 1200 for Dinner' }
    server.use(http.get(apiUrl('/expenses/1/summary'), () => HttpResponse.json({ data: response })))

    const result = await expensesApi.getSummary(1)
    expect(result.summary).toContain('Ali')
  })
})
