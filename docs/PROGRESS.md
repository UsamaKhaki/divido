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
- [x] Settlement logic — list, mark paid (`GET /api/v1/groups/{id}/settlements`, `POST /api/v1/settlements/{id}/settle`); regeneration nets out paid settlements and runs on expense delete
- [x] Expense summary (`GET /api/v1/expenses/{id}/summary`)
- [x] Form Requests: StoreExpenseRequest, UpdateItemSplitsRequest
- [x] DTOs: ExpenseData, SplitData
- [x] Resources: ExpenseResource, ExpenseListResource, ExpenseItemResource, ItemSplitResource, SettlementResource
- [x] Repositories: ExpenseRepository, ItemSplitRepository, SettlementRepository
- [x] Actions: CreateExpenseAction, DeleteExpenseAction, UpdateItemSplitsAction, RegenerateGroupSettlementsAction, MarkSettlementPaidAction, GenerateExpenseSummaryAction
- [x] Custom exceptions: ExpenseNotFoundException, ExpenseItemNotFoundException, SettlementNotFoundException, InvalidSplitAmountException, AlreadySettledException, NotSettlementPayerException, NotExpenseCreatorException
- [x] Pest tests: ExpenseTest, ItemSplitTest, SettlementTest, ExpenseSummaryTest, SettlementRegenerationTest

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
- [x] Pest tests: `OcrTest`, `AnalyzeReceiptActionTest`

### Mobile
- [ ] OCR service: `ocrService.ts` (Apple Vision, on-device). Currently a stub that returns confidence 0, so every scan uses the Google Vision fallback. Needs a native module.
- [x] OCR fallback service: `ocrFallbackService.ts` (Google Vision via API proxy)
- [x] `useOcrScan` hook
- [x] Scan Receipt screen — real camera capture via `CameraCapture` component (`app/(app)/groups/[groupId]/scan-receipt.tsx`)
- [x] Review Receipt screen — editable item rows with inline name/price/quantity inputs (`app/(app)/groups/[groupId]/review-receipt.tsx`)
- [ ] Camera capture — end-to-end real device test <!-- #TODO: open GitHub Issue -->
- [x] Low-confidence fallback flow — threshold, fallback and error paths covered by `useOcrScan.test.ts` (still needs a real-device check once Apple Vision is wired)

---

## Phase 4 — Smart Suggestions, Reminders, WhatsApp Sharing

### Backend
- [x] Smart suggestions (`GET /api/v1/groups/{id}/suggestions`)
- [x] `GetItemSuggestionsAction` + `SuggestionsRepository`
- [x] Pest test: `SuggestionTest`
- [x] Push notification reminders — `expo-notifications`, `useScheduleReminder`, weekly reminders from Settlements screen
- [x] WhatsApp share text generation endpoint <!-- Phase 4 — summary text generated by GenerateExpenseSummaryAction -->

### Mobile
- [x] Suggestions service + hook: `useGroupSuggestionsQuery`
- [x] Suggestions UI — wired to Add Expense screen; shows `"Usually: Ali, Zara"` hints inline per item
- [x] Reminder scheduling (push notifications) — `expo-notifications`, `useScheduleReminder`, weekly reminders from Settlements screen
- [x] WhatsApp share button on settlement/summary screen — deep-link via `Linking.openURL('whatsapp://...')` with native Share fallback

---

## Phase 5 — Offline Sync, Insights, UI Polish

### Backend
- [x] Insights (`GET /api/v1/groups/{id}/insights`)
- [x] `GetGroupInsightsAction` + `InsightsRepository`
- [x] Pest test: `InsightsTest`

### Mobile
- [x] Insights service + hook: `useGroupInsightsQuery`
- [x] Insights screen — functional with text + custom `PercentBar` progress bars (`app/(app)/groups/[groupId]/insights.tsx`)
- [x] Sync queue store — real Zustand + `immer` + `persist` implementation with `enqueue/dequeue` (`features/sync/store/syncQueueStore.ts`)
- [x] `useSyncQueue` hook implemented
- [x] Local DB service — real `expo-sqlite` implementation with `upsertGroups`, `upsertExpenses`, `getGroups` using INSERT ON CONFLICT (`features/sync/services/localDb.ts`)
- [x] SQLite — wire offline DB to all screens (replace API calls with local reads when offline) — wired in `useGroupsQuery` + `useExpensesQuery`
- [x] Sync queue — process pending actions on reconnect — `useSyncQueue` drains on reconnect, handles create_expense / update_splits / settle
- [x] Conflict resolution logic — "server wins": 4xx errors drop the queued op + invalidate all queries; 5xx retries next reconnect
- [x] Insights charts — animated `PercentBar` using `Animated.timing` (smooth entrance animation) in `insights.tsx`
- [x] UI polish pass — animated `PercentBar` bars, WhatsApp green button, consistent footer layout across Group Detail + Expense Detail screens

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
- [x] Swagger/OpenAPI annotations — all controllers annotated (`#[OA\Post]`, `#[OA\Get]`, etc.) with security scheme
- [x] Model factories for all models (User, Group, Expense, ExpenseItem, ItemSplit, Settlement)
- [x] `.env.example` — backend (`apps/api/.env.example`)
- [x] `.env.example` — mobile (`apps/mobile/.env.example` with `EXPO_PUBLIC_API_URL`)
- [x] CI — single `ci.yml`: mobile lint, Prettier, typecheck, Jest, `expo export` bundle; API Pint + Pest on PHP 8.4
- [x] Frontend test suite — Jest + jest-expo + MSW v2 + RNTL: 90 tests, 23 suites — API services, hooks, stores, components, screens all covered (`apps/mobile/src/**/__tests__/`, `apps/mobile/app/**/__tests__/`)
- [x] Non-route code moved from `app/` to `src/` — eliminates Expo Router "missing default export" warnings
- [x] pnpm `node-linker=hoisted` — required for NativeWind/Metro module resolution
- [x] `react-native-reanimated/plugin` added to babel.config.js

---

## Quick Stats

| Phase | Backend | Mobile |
|---|---|---|
| Phase 1 (Auth + Groups) | ✅ Done | ✅ Done |
| Phase 2 (Expenses + Settlements) | ✅ Done | ✅ Done |
| Phase 3 (OCR) | ✅ Done | Partial (Apple Vision stubbed; needs real-device test) |
| Phase 4 (Suggestions + Sharing) | ✅ Done | ✅ Done |
| Phase 5 (Offline + Insights) | ✅ Done | ✅ Done |

---

## Known gaps

- Apple Vision on-device OCR is not implemented (see Phase 3).
- Jest reports a worker that does not exit cleanly (open handle from the sync queue tests). Tests pass; teardown needs a look.
