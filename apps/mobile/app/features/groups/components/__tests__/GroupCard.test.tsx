import { render, screen, fireEvent } from '@testing-library/react-native'
import { router } from 'expo-router'

import { factory } from '../../../../__test-utils__/factory'
import { GroupCard } from '@/features/groups/components/GroupCard'

const onPress = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('GroupCard', () => {
  it('renders the group name', () => {
    const group = factory.groupSummary({ name: 'Lahore Trip', member_count: 3 })
    render(<GroupCard group={group} onPress={onPress} />)
    expect(screen.getByText('Lahore Trip')).toBeTruthy()
  })

  it('renders member count with correct plural', () => {
    const group = factory.groupSummary({ member_count: 1 })
    render(<GroupCard group={group} onPress={onPress} />)
    expect(screen.getByText('1 member')).toBeTruthy()
  })

  it('renders plural members when count > 1', () => {
    const group = factory.groupSummary({ member_count: 4 })
    render(<GroupCard group={group} onPress={onPress} />)
    expect(screen.getByText('4 members')).toBeTruthy()
  })

  it('calls onPress with the group id when pressed', () => {
    const group = factory.groupSummary({ id: 42, name: 'My Group' })
    render(<GroupCard group={group} onPress={onPress} />)
    fireEvent.press(screen.getByRole('button'))
    expect(onPress).toHaveBeenCalledWith(42)
  })

  it('has accessible label', () => {
    const group = factory.groupSummary({ name: 'Islamabad Crew' })
    render(<GroupCard group={group} onPress={onPress} />)
    expect(screen.getByLabelText('Open group Islamabad Crew')).toBeTruthy()
  })
})
