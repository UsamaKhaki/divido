import { render, screen, fireEvent } from '@testing-library/react-native'

import { factory } from '../../../../__test-utils__/factory'
import { SplitItemRow } from '@/features/expenses/components/SplitItemRow'

const onToggleUser = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('SplitItemRow', () => {
  const item = factory.expenseItem({ id: 1, name: 'Biryani', price: 1000, quantity: 2 })
  const members = [
    factory.groupMember({ id: 10, name: 'Ali' }),
    factory.groupMember({ id: 11, name: 'Sara' }),
  ]

  it('renders item name', () => {
    render(<SplitItemRow item={item} members={members} selectedUserIds={[]} onToggleUser={onToggleUser} />)
    expect(screen.getByText('Biryani')).toBeTruthy()
  })

  it('renders total price (price × quantity)', () => {
    render(<SplitItemRow item={item} members={members} selectedUserIds={[]} onToggleUser={onToggleUser} />)
    // 1000 × 2 = 2000
    expect(screen.getByText(/2000\.00/)).toBeTruthy()
  })

  it('renders all member names as toggle options', () => {
    render(<SplitItemRow item={item} members={members} selectedUserIds={[]} onToggleUser={onToggleUser} />)
    expect(screen.getByText('Ali')).toBeTruthy()
    expect(screen.getByText('Sara')).toBeTruthy()
  })

  it('calls onToggleUser with item id and member id when a member is pressed', () => {
    render(<SplitItemRow item={item} members={members} selectedUserIds={[]} onToggleUser={onToggleUser} />)
    fireEvent.press(screen.getByLabelText('Assign Ali to Biryani'))
    expect(onToggleUser).toHaveBeenCalledWith(1, 10)
  })

  it('shows per-person share when users are selected', () => {
    render(<SplitItemRow item={item} members={members} selectedUserIds={[10, 11]} onToggleUser={onToggleUser} />)
    // 2000 / 2 = 1000
    expect(screen.getByText(/Each pays PKR 1000\.00/)).toBeTruthy()
  })

  it('does not show per-person share when no users are selected', () => {
    render(<SplitItemRow item={item} members={members} selectedUserIds={[]} onToggleUser={onToggleUser} />)
    expect(screen.queryByText(/Each pays/)).toBeNull()
  })
})
