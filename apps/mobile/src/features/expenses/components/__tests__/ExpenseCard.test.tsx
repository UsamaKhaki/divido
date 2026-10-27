import { render, screen, fireEvent } from '@testing-library/react-native'
import { router } from 'expo-router'

import { factory } from '../../../../__test-utils__/factory'

import { ExpenseCard } from '@/features/expenses/components/ExpenseCard'

beforeEach(() => jest.clearAllMocks())

describe('ExpenseCard', () => {
  it('renders the expense title and amount', () => {
    const expense = factory.expenseSummary({ title: 'Hotel Stay', total_amount: 4500 })
    render(<ExpenseCard expense={expense} groupId={1} />)
    expect(screen.getByText('Hotel Stay')).toBeTruthy()
    expect(screen.getByText('PKR 4500.00')).toBeTruthy()
  })

  it('renders payer name', () => {
    const expense = factory.expenseSummary({ paid_by: { id: 1, name: 'Sara' } })
    render(<ExpenseCard expense={expense} groupId={1} />)
    expect(screen.getByText(/Paid by Sara/)).toBeTruthy()
  })

  it('renders category label when category is set', () => {
    const expense = factory.expenseSummary({ category: 'food' })
    render(<ExpenseCard expense={expense} groupId={1} />)
    expect(screen.getByText(/🍔 Food/)).toBeTruthy()
  })

  it('does not render category label when category is null', () => {
    const expense = factory.expenseSummary({ category: null })
    render(<ExpenseCard expense={expense} groupId={1} />)
    expect(screen.queryByText(/Food/)).toBeNull()
  })

  it('navigates to expense detail on press', () => {
    const expense = factory.expenseSummary({ id: 7 })
    render(<ExpenseCard expense={expense} groupId={3} />)
    fireEvent.press(screen.getByRole('button'))
    expect(router.push).toHaveBeenCalledWith('/(app)/groups/3/expenses/7')
  })

  it('has accessible label', () => {
    const expense = factory.expenseSummary({ title: 'Dinner' })
    render(<ExpenseCard expense={expense} groupId={1} />)
    expect(screen.getByLabelText('View expense Dinner')).toBeTruthy()
  })
})
