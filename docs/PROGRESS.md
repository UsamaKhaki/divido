# Divido — Progress Tracker

> **How to use this file**
> - Check off items as they are completed: `[ ]` → `[x]`
> - Link each item to a GitHub Issue using `#<issue-number>` when one exists
> - Update this file in the same commit as the code change
> - Copilot reads this file as context — keeping it accurate makes AI assistance smarter
>
> **GitHub Issues**: Free for all repos (public & private). Use issues for bugs, blockers, and discussion.
> Create an issue → reference it here → close it with `fixes #N` in your commit message.

---

## Phase 1 — Auth, Groups, Basic Expenses

### Backend
- [x] Database migrations (users, groups, group_user, expenses, expense_items, item_splits, settlements)
- [x] Models: User, Group, Expense, ExpenseItem, ItemSplit, Settlement
- [x] Auth — register, login, logout, me (`POST /api/v1/auth/register|login|logout`, `GET /api/v1/auth/me`)
- [x] Groups CRUD — list, create, show, delete (`GET|POST /api/v1/groups`, `GET|DELETE /api/v1/groups/{id}`)
- [x] Group members — add, remove (`POST|DELETE /api/v1/groups/{id}/members/{userId}`)
- [x] Form Requests: RegisterRequest, LoginRequest, StoreGroupRequest, AddMemberRequest
- [x] DTOs: RegisterData, GroupData, AddMemberData
- [x] Resources: UserResource, GroupResource, GroupListResource
- [x] Repositories: GroupRepository
- [x] Custom exceptions: GroupNotFoundException, NotGroupMemberException, NotGroupCreatorException, UserAlreadyMemberException
- [x] Pest tests: RegisterTest, LoginTest, LogoutMeTest, GroupTest, GroupMemberTest

### Mobile
- [x] Axios client with interceptors (`app/services/api.ts`)
- [x] API types (`app/types/api.types.ts`)
- [x] Auth screens: login, register
- [x] Auth service + hooks: `useLoginMutation`, `useRegisterMutation`, `useLogoutMutation`
- [x] Auth component: `AuthTextInput`
- [x] Home screen — groups list (`app/(app)/index.tsx`)
- [x] Groups service + hooks: `useGroupsQuery`, `useGroupQuery`, `useCreateGroupMutation`, `useDeleteGroupMutation`, `useAddMemberMutation`, `useRemoveMemberMutation`
- [x] Group Detail screen (`app/(app)/groups/[groupId].tsx`)
- [x] Shared components: `EmptyState`, `ErrorState`, `LoadingSkeleton`

---

## Phase 2 — Item Splitting & Settlement Logic

### Backend
- [x] Expenses CRUD — list (by group), create, show, delete (`GET|POST /api/v1/groups/{id}/expenses`, `GET|DELETE /api/v1/expenses/{id}`)
- [x] Item splits — update (`PUT /api/v1/expenses/{id}/items/{itemId}/splits`)
- [x] Settlement logic — list, mark paid (`GET /api/v1/groups/{id}/settlements`, `POST /api/v1/settlements/{id}/settle`)
- [x] Expense summary (`GET /api/v1/expenses/{id}/summary`)
- [x] Form Requests: StoreExpenseRequest, UpdateItemSplitsRequest
- [x] DTOs: ExpenseData, SplitData
- [x] Resources: ExpenseResource, ExpenseListResource, ExpenseItemResource, ItemSplitResource, SettlementResource
- [x] Repositories: ExpenseRepository, ItemSplitRepository, SettlementRepository
- [x] Actions: CreateExpenseAction, DeleteExpenseAction, UpdateItemSplitsAction, RegenerateGroupSettlementsAction, MarkSettlementPaidAction, GenerateExpenseSummaryAction
- [x] Custom exceptions: ExpenseNotFoundException, ExpenseItemNotFoundException, SettlementNotFoundException, InvalidSplitAmountException, AlreadySettledException, NotSettlementPayerException, NotExpenseCreatorException
- [x] Pest tests: ExpenseTest, ItemSplitTest, SettlementTest, ExpenseSummaryTest

### Mobile
- [x] Expenses service + hooks: `useExpensesQuery`, `useExpenseQuery`, `useCreateExpenseMutation`, `useDeleteExpenseMutation`, `useUpdateSplitsMutation`, `useExpenseSummaryQuery`
- [x] Expense components: `ExpenseCard`, `SplitItemRow`
- [x] Add Expense screen (`app/(app)/groups/[groupId]/add-expense.tsx`)
- [x] Expense Detail screen (`app/(app)/groups/[groupId]/expenses/[expenseId].tsx`)
- [x] Settlements service + hooks: `useSettlementsQuery`, `useSettleMutation`
- [x] Settlement component: `SettlementCard`
- [x] Settlements screen (`app/(app)/groups/[groupId]/settlements.tsx`)

---

## Phase 3 — OCR Integration

### Backend
- [x] OCR endpoint — analyze receipt (`POST /api/v1/ocr/analyze`, throttled 30/min)
- [x] `AnalyzeReceiptAction` — routes to Apple Vision or Google Vision proxy
- [x] `AnalyzeReceiptRequest` form validation
- [x] `OcrResultResource` response shaping
- [x] Custom exception: `GoogleVisionException`
- [x] Pest test: `OcrTest`

### Mobile
- [x] OCR service: `ocrService.ts` (Apple Vision, on-device)
- [x] OCR fallback service: `ocrFallbackService.ts` (Google Vision via API proxy)
- [x] `useOcrScan` hook
- [x] Scan Receipt screen (`app/(app)/groups/[groupId]/scan-receipt.tsx`)
- [x] Review Receipt screen (`app/(app)/groups/[groupId]/review-receipt.tsx`)
- [ ] Camera capture UI — verify end-to-end real device test <!-- #TODO: open GitHub Issue -->
- [ ] Low-confidence fallback flow — verify Google Vision fallback triggers correctly <!-- #TODO: open GitHub Issue -->

---

## Phase 4 — Smart Suggestions, Reminders, WhatsApp Sharing

### Backend
- [x] Smart suggestions (`GET /api/v1/groups/{id}/suggestions`)
- [x] `GetItemSuggestionsAction` + `SuggestionsRepository`
- [x] Pest test: `SuggestionTest`
- [ ] Push notification reminders (monthly settlement reminders) <!-- #TODO: open GitHub Issue -->
- [ ] WhatsApp share text generation endpoint <!-- #TODO: open GitHub Issue -->

### Mobile
- [x] Suggestions service + hook: `useGroupSuggestionsQuery`
- [ ] Suggestions UI — wire up to Add Expense screen (auto-suggest users per item) <!-- #TODO: open GitHub Issue -->
- [ ] Reminder scheduling (push notifications) <!-- #TODO: open GitHub Issue -->
- [ ] WhatsApp share button on settlement/summary screen <!-- #TODO: open GitHub Issue -->

---

## Phase 5 — Offline Sync, Insights, UI Polish

### Backend
- [x] Insights (`GET /api/v1/groups/{id}/insights`)
- [x] `GetGroupInsightsAction` + `InsightsRepository`
- [x] Pest test: `InsightsTest`

### Mobile
- [x] Insights service + hook: `useGroupInsightsQuery`
- [x] Insights screen (`app/(app)/groups/[groupId]/insights.tsx`)
- [x] Sync queue store (`features/sync/store/syncQueueStore.ts`)
- [x] `useSyncQueue` hook scaffolded
- [x] Local DB service scaffolded (`features/sync/services/localDb.ts`)
- [ ] SQLite — full offline read/write integration <!-- #TODO: open GitHub Issue -->
- [ ] Sync queue — process pending actions on reconnect <!-- #TODO: open GitHub Issue -->
- [ ] Conflict resolution logic <!-- #TODO: open GitHub Issue -->
- [ ] Insights charts — wire up chart library to InsightsScreen data <!-- #TODO: open GitHub Issue -->
- [ ] UI polish pass — consistent spacing, typography, transitions <!-- #TODO: open GitHub Issue -->

---

## Cross-Cutting / Infrastructure

- [x] Monorepo structure (`apps/mobile/`, `apps/api/`)
- [x] Laravel Sanctum auth
- [x] L5-Swagger OpenAPI 3.0 docs configured
- [x] API contracts documented (`docs/API_CONTRACTS.md`)
- [x] ESLint + Prettier configured (mobile)
- [x] Laravel Pint configured (backend)
- [x] All routes versioned under `/api/v1/`
- [x] 4-state screen pattern (loading → error → empty → data) via shared components
- [ ] Swagger annotations — verify all endpoints are annotated <!-- #TODO: open GitHub Issue -->
- [ ] CI — GitHub Actions: run Pest tests + lint on every push <!-- #TODO: open GitHub Issue -->
- [ ] Environment setup docs (`.env.example` for both apps) <!-- #TODO: open GitHub Issue -->

---

## Quick Stats

| Phase | Backend | Mobile |
|---|---|---|
| Phase 1 (Auth + Groups) | ✅ Done | ✅ Done |
| Phase 2 (Expenses + Settlements) | ✅ Done | ✅ Done |
| Phase 3 (OCR) | ✅ Done | ⚠️ Needs real-device verification |
| Phase 4 (Suggestions + Sharing) | ⚠️ Partial | ⚠️ Partial |
| Phase 5 (Offline + Insights) | ✅ Done | ⚠️ Scaffolded, not complete |
