import { render, screen, fireEvent } from '@testing-library/react-native'

import { factory } from '../../../../__test-utils__/factory'

import { SettlementCard } from '@/features/settlements/components/SettlementCard'

const onSettle = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('SettlementCard', () => {
  it('renders from/to names and amount', () => {
    const settlement = factory.settlement({
      from: { id: 1, name: 'Ali' },
      to: { id: 2, name: 'Sara' },
      amount: 750,
    })
    render(
      <SettlementCard settlement={settlement} isSettling={false} canSettle onSettle={onSettle} />,
    )
    expect(screen.getByText(/Ali/)).toBeTruthy()
    expect(screen.getByText(/Sara/)).toBeTruthy()
    expect(screen.getByText(/750\.00/)).toBeTruthy()
  })

  it('shows Settle button for pending settlement', () => {
    const settlement = factory.settlement({ status: 'pending' })
    render(
      <SettlementCard settlement={settlement} isSettling={false} canSettle onSettle={onSettle} />,
    )
    expect(screen.getByText('Settle')).toBeTruthy()
  })

  it('shows who it is waiting for instead of Settle when the user is not the payer', () => {
    const settlement = factory.settlement({ status: 'pending', from: { id: 1, name: 'Ali' } })
    render(
      <SettlementCard
        settlement={settlement}
        isSettling={false}
        canSettle={false}
        onSettle={onSettle}
      />,
    )
    expect(screen.queryByText('Settle')).toBeNull()
    expect(screen.getByText('Waiting for Ali')).toBeTruthy()
  })

  it('calls onSettle with settlement id when Settle is pressed', () => {
    const settlement = factory.settlement({ id: 7, status: 'pending' })
    render(
      <SettlementCard settlement={settlement} isSettling={false} canSettle onSettle={onSettle} />,
    )
    fireEvent.press(screen.getByRole('button'))
    expect(onSettle).toHaveBeenCalledWith(7)
  })

  it('shows loading indicator when isSettling is true', () => {
    const settlement = factory.settlement({ status: 'pending' })
    render(
      <SettlementCard settlement={settlement} isSettling={true} canSettle onSettle={onSettle} />,
    )
    // ActivityIndicator rendered instead of "Settle" text
    expect(screen.queryByText('Settle')).toBeNull()
  })

  it('shows Paid badge for settled settlement', () => {
    const settlement = factory.settlement({ status: 'settled', settled_at: '2026-01-15T10:00:00Z' })
    render(
      <SettlementCard settlement={settlement} isSettling={false} canSettle onSettle={onSettle} />,
    )
    expect(screen.getByText(/Paid ✓/)).toBeTruthy()
  })

  it('does not show Settle button for settled settlement', () => {
    const settlement = factory.settlement({ status: 'settled' })
    render(
      <SettlementCard settlement={settlement} isSettling={false} canSettle onSettle={onSettle} />,
    )
    expect(screen.queryByText('Settle')).toBeNull()
  })
})
