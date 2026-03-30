import type {
  AuthPayload,
  Expense,
  ExpenseItem,
  ExpenseItemSplit,
  ExpenseSummary,
  Group,
  GroupMember,
  GroupSettlementsResponse,
  GroupSummary,
  Settlement,
  User,
} from '@/types/api.types'

let idSeq = 1
const nextId = () => idSeq++

export const factory = {
  reset: () => {
    idSeq = 1
  },

  user: (overrides?: Partial<User>): User => ({
    id: nextId(),
    name: 'Ali Khan',
    email: 'ali@test.com',
    ...overrides,
  }),

  authPayload: (overrides?: Partial<AuthPayload>): AuthPayload => ({
    token: 'fake-token-abc123',
    user: factory.user(),
    ...overrides,
  }),

  groupMember: (overrides?: Partial<GroupMember>): GroupMember => ({
    id: nextId(),
    name: 'Ali Khan',
    email: 'ali@test.com',
    ...overrides,
  }),

  groupSummary: (overrides?: Partial<GroupSummary>): GroupSummary => ({
    id: nextId(),
    name: 'Trip to Murree',
    created_by: 1,
    member_count: 2,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }),

  group: (overrides?: Partial<Group>): Group => ({
    id: nextId(),
    name: 'Trip to Murree',
    created_by: 1,
    members: [factory.groupMember()],
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }),

  expenseItemSplit: (overrides?: Partial<ExpenseItemSplit>): ExpenseItemSplit => ({
    user: factory.user(),
    amount: 500,
    ...overrides,
  }),

  expenseItem: (overrides?: Partial<ExpenseItem>): ExpenseItem => ({
    id: nextId(),
    name: 'Biryani',
    price: 1000,
    quantity: 1,
    splits: [],
    ...overrides,
  }),

  expenseSummary: (overrides?: Partial<ExpenseSummary>): ExpenseSummary => ({
    id: nextId(),
    title: 'Dinner',
    total_amount: 1200,
    paid_by: factory.user(),
    category: 'food',
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }),

  expense: (overrides?: Partial<Expense>): Expense => ({
    id: nextId(),
    title: 'Dinner',
    total_amount: 1200,
    paid_by: factory.user(),
    category: 'food',
    items: [factory.expenseItem()],
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }),

  settlement: (overrides?: Partial<Settlement>): Settlement => ({
    id: nextId(),
    from: factory.user({ id: 1, name: 'Ali', email: 'ali@test.com' }),
    to: factory.user({ id: 2, name: 'Sara', email: 'sara@test.com' }),
    amount: 600,
    status: 'pending',
    ...overrides,
  }),

  groupSettlementsResponse: (
    overrides?: Partial<GroupSettlementsResponse>,
  ): GroupSettlementsResponse => ({
    settlements: [factory.settlement()],
    total_unsettled: 600,
    ...overrides,
  }),
}
