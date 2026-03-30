/**
 * Divido — Shared API Types
 *
 * These types are derived directly from docs/API_CONTRACTS.md.
 * Every service file in apps/mobile/ imports from here.
 * Do NOT define API types inline in service files.
 *
 * Update this file and API_CONTRACTS.md together — never one without the other.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Envelope
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth — POST /auth/register, POST /auth/login, GET /auth/me
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: number
  name: string
  email: string
}

export interface AuthPayload {
  token: string
  user: User
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface LoginRequest {
  email: string
  password: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Groups — /groups
// ─────────────────────────────────────────────────────────────────────────────

export interface GroupMember {
  id: number
  name: string
  email: string
}

/** Returned in list — no members array */
export interface GroupSummary {
  id: number
  name: string
  created_by: number
  member_count: number
  created_at: string
}

/** Returned on create / GET /groups/:id */
export interface Group {
  id: number
  name: string
  created_by: number
  members: GroupMember[]
  created_at: string
}

export interface CreateGroupRequest {
  name: string
}

export interface AddMemberRequest {
  email: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Expenses — /expenses, /groups/:id/expenses
// ─────────────────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'entertainment'
  | 'shopping'
  | 'other'

export interface ExpenseItemSplit {
  user: Pick<User, 'id' | 'name'>
  amount: number
}

export interface ExpenseItem {
  id: number
  name: string
  price: number
  quantity: number
  splits?: ExpenseItemSplit[] // present only in GET /expenses/:id
}

/** Returned in list — no items array */
export interface ExpenseSummary {
  id: number
  title: string
  total_amount: number
  category: ExpenseCategory | null
  paid_by: Pick<User, 'id' | 'name'>
  created_at: string
}

/** Returned on create / GET /expenses/:id */
export interface Expense {
  id: number
  title: string
  total_amount: number
  category: ExpenseCategory | null
  paid_by: Pick<User, 'id' | 'name'>
  items: ExpenseItem[]
  created_at: string
}

export interface CreateExpenseItemRequest {
  name: string
  price: number
  quantity: number
}

export interface CreateExpenseRequest {
  group_id: number
  title: string
  total_amount: number
  category?: ExpenseCategory
  items?: CreateExpenseItemRequest[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Item Splits — PUT /expenses/:id/items/:itemId/splits
// ─────────────────────────────────────────────────────────────────────────────

export interface SplitEntry {
  user_id: number
  amount: number
}

export interface UpdateSplitsRequest {
  splits: SplitEntry[]
}

export interface UpdateSplitsResponse {
  item_id: number
  splits: ExpenseItemSplit[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Settlements — /groups/:id/settlements, /settlements/:id/settle
// ─────────────────────────────────────────────────────────────────────────────

export type SettlementStatus = 'pending' | 'settled'

export interface Settlement {
  id: number
  from: Pick<User, 'id' | 'name'>
  to: Pick<User, 'id' | 'name'>
  amount: number
  status: SettlementStatus
  settled_at?: string
}

export interface GroupSettlementsResponse {
  settlements: Settlement[]
  total_unsettled: number
}

// ─────────────────────────────────────────────────────────────────────────────
// OCR — POST /ocr/analyze
// ─────────────────────────────────────────────────────────────────────────────

export interface OcrAnalyzeRequest {
  image: string // base64-encoded JPEG, max 10MB
}

export interface OcrAnalyzeResponse {
  text: string
  confidence: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Smart Suggestions — GET /groups/:id/suggestions
// ─────────────────────────────────────────────────────────────────────────────

export interface UserSuggestion {
  user: Pick<User, 'id' | 'name'>
  confidence: number
}

export interface ItemSuggestion {
  item_name: string
  suggested_users: UserSuggestion[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Expense Summary — GET /expenses/:id/summary
// ─────────────────────────────────────────────────────────────────────────────

export interface ExpenseSummaryShareResponse {
  summary: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Insights — GET /groups/:id/insights
// ─────────────────────────────────────────────────────────────────────────────

export interface SpentPerUser {
  user: Pick<User, 'id' | 'name'>
  total: number
}

export interface CategoryBreakdown {
  category: string
  total: number
}

export interface GroupInsightsResponse {
  total_group_spend: number
  spent_per_user: SpentPerUser[]
  category_breakdown: CategoryBreakdown[]
}
