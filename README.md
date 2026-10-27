# Divido

Divido is a group expense-splitting app. Members of a group log shared expenses, split them item by item (or scan a receipt to fill the items in), and get a minimal set of "who pays whom" settlements. It is a pnpm monorepo with an Expo (React Native) client and a Laravel API.

## Features

- Email and password auth with Laravel Sanctum tokens, stored on the device with `expo-secure-store`.
- Groups with members; only the creator can delete a group or remove other members.
- Expenses with line items, and per-item splits between group members.
- Settlement plan per group, recalculated whenever splits change or an expense is deleted. Payments marked as settled are netted out, and a greedy creditor/debtor match keeps the number of transfers small.
- Receipt scanning: camera capture, OCR, a text parser that turns lines into editable items, and a review screen before saving.
- "Usually split with" suggestions based on past splits for the same item name.
- Group spending insights (by category and by member).
- Shareable expense summaries via WhatsApp, with the native share sheet as fallback.
- Weekly settlement reminders with `expo-notifications`.
- Offline support: groups and expenses are cached in SQLite, and writes made offline are queued and replayed on reconnect. The server wins on conflict: a 4xx drops the queued write, a 5xx keeps it for the next attempt.

## Stack

| Area | Choices |
| --- | --- |
| Mobile | Expo SDK 55, React Native 0.83, Expo Router, TypeScript (strict), TanStack Query, Zustand + immer, NativeWind, expo-sqlite |
| API | Laravel 13, PHP 8.4, Sanctum, L5-Swagger (OpenAPI 3) |
| Tests | Jest + jest-expo, React Native Testing Library, MSW v2; Pest 4 on SQLite in memory |
| Tooling | pnpm workspaces, ESLint 9 + Prettier, Laravel Pint, GitHub Actions |

## Architecture

```
apps/
  mobile/          Expo app
    app/           Expo Router routes only: (auth) and (app) stacks
    src/features/  one folder per domain: auth, groups, expenses, settlements,
                   ocr, suggestions, insights, notifications, sync
                   each with services/ (HTTP), hooks/ (React Query), components/
    src/services/  shared Axios client with auth and error interceptors
  api/             Laravel API
    app/Http/      thin controllers, Form Requests (validation + authorisation),
                   API Resources (response shape)
    app/Actions/   one class per use case (CreateExpenseAction,
                   RegenerateGroupSettlementsAction, ...)
    app/DTOs/      typed input passed from requests to actions
    app/Repositories/  Eloquent queries
docs/
  API_CONTRACTS.md request and response shapes for every endpoint
  PLAN.md          original product plan
  PROGRESS.md      feature checklist and known gaps
```

All endpoints are under `/api/v1`. Responses use a `{ data, message }` envelope; see `docs/API_CONTRACTS.md`. With the API running, Swagger UI is served at `/api/documentation`.

OCR is designed as hybrid: on-device Apple Vision first, and the backend's Google Vision proxy (`POST /api/v1/ocr/analyze`) when on-device confidence is below 0.75. The on-device step is not implemented yet (see Status).

## Getting started

Requirements: Node 22, pnpm 10 (`corepack enable` picks up the pinned version), PHP 8.4 with `pdo_sqlite`, Composer, and Xcode or Android Studio for native builds.

```bash
pnpm install

# API
cd apps/api
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan serve              # http://localhost:8000

# Mobile (new terminal)
cd apps/mobile
cp .env.example .env
pnpm ios                       # or: pnpm android, pnpm start
```

The app uses native modules (camera, SQLite, notifications), so it needs a development build (`expo run:ios` / `expo run:android`) rather than Expo Go.

### Environment variables

| App | Variable | Purpose |
| --- | --- | --- |
| mobile | `EXPO_PUBLIC_API_URL` | API base URL including the `/api/v1` prefix, e.g. `http://localhost:8000/api/v1` |
| api | `APP_KEY`, `APP_URL`, `DB_*` | Standard Laravel settings; SQLite works out of the box |
| api | `GOOGLE_VISION_API_KEY` | Google Cloud Vision key for receipt OCR |

`.env` files are gitignored; only the `.env.example` templates are committed.

## Scripts

Run from the repository root:

| Command | What it does |
| --- | --- |
| `pnpm lint` | ESLint and Prettier check (mobile), Pint check (API) |
| `pnpm typecheck` | `tsc --noEmit` for the mobile app |
| `pnpm test` | Jest (mobile) then Pest (API) |
| `pnpm build` | `expo export` JS bundles for iOS and Android |
| `pnpm mobile:*`, `pnpm api:*` | Individual steps, e.g. `pnpm mobile:test`, `pnpm api:lint:fix` |

## Testing

- Mobile: 23 Jest suites covering API services against MSW handlers, React Query hooks, Zustand stores, the offline sync queue, the receipt parser, the OCR fallback flow, components and screens.
- API: Pest feature tests for every endpoint (auth, authorisation, validation, settlements, OCR proxy with `Http::fake`).

CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests and the bundle build for mobile, and Pint plus Pest for the API, on pushes to `main` and on pull requests.

## Status and limitations

- On-device Apple Vision OCR is a stub that always reports low confidence, so every scan currently goes through the Google Vision proxy. Camera capture has not been tested end to end on a physical device.
- Money is stored as decimals with 2 places and compared with a 0.01 tolerance. There is no multi-currency support.
- Offline mode covers reading groups and expenses and queuing expense creation, split updates and settlements. Other writes need a connection.
- No password reset, email verification or invitations; members are added by email of an existing account.
