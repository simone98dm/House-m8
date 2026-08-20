# Database

House M8 uses **PostgreSQL 16** with raw parameterized queries via the `pg` Node.js driver. There is no ORM.

---

## Schema Overview

```
users
  ├── house_members ──────────────────► houses
  │                                       ├── expenses ──► expense_shares
  │                                       ├── bills
  │                                       ├── bulletin_notes
  │                                       ├── house_invitations
  │                                       └── reports
  ├── email_verification_tokens
  ├── password_reset_tokens
  ├── oauth_tokens
  ├── subscriptions
  └── referrals
```

---

## Core Tables

### `users`

Primary user table. Authentication is handled by the app itself (bcrypt passwords + JWT), not delegated to a third-party auth service.

| Column                                 | Type         | Notes                                                    |
| -------------------------------------- | ------------ | -------------------------------------------------------- |
| `id`                                   | UUID PK      | `gen_random_uuid()`                                      |
| `email`                                | TEXT UNIQUE  |                                                          |
| `password_hash`                        | TEXT         | bcrypt hash; null for OAuth-only accounts                |
| `first_name`, `last_name`              | TEXT         |                                                          |
| `avatar_url`                           | TEXT         |                                                          |
| `email_confirmed_at`                   | TIMESTAMPTZ  | null until verified                                      |
| `preferred_currency`                   | TEXT         | added in migration 004                                   |
| `is_first_access`                      | BOOLEAN      | first-login onboarding flag                              |
| `terms_accepted_at`, `consent_version` |              | GDPR compliance                                          |
| Profile fields                         | TEXT/BOOLEAN | bio, is_smoker, gender, occupation_type, languages, etc. |

### `houses`

```sql
CREATE TABLE houses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    address     TEXT,
    currency    TEXT CHECK (currency IN ('USD', 'EUR')) DEFAULT 'EUR',
    max_members INTEGER DEFAULT 10,
    owner_id    UUID REFERENCES users(id) ON DELETE CASCADE
);
```

### `house_members`

Join table — a user can belong to multiple houses and rejoin after leaving (`left_at` column enables historical records while the unique constraint on `(house_id, user_id, left_at)` prevents duplicate active memberships).

### `expenses` and `expense_shares`

```sql
-- Parent record: who created it and the total
CREATE TABLE expenses (
    id             UUID PRIMARY KEY,
    house_id       UUID REFERENCES houses(id) ON DELETE CASCADE,
    created_by     UUID REFERENCES users(id) ON DELETE CASCADE,
    total_amount   NUMERIC(10,2) CHECK (total_amount > 0),
    currency       TEXT DEFAULT 'EUR',
    recurring      BOOLEAN DEFAULT FALSE,
    recurring_period TEXT CHECK (recurring_period IN ('weekly','monthly','yearly'))
);

-- One row per participant
CREATE TABLE expense_shares (
    id          UUID PRIMARY KEY,
    expense_id  UUID REFERENCES expenses(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    amount_due  NUMERIC(10,2) CHECK (amount_due >= 0),
    is_paid     BOOLEAN DEFAULT FALSE,
    paid_at     TIMESTAMPTZ,
    UNIQUE(expense_id, user_id)
);
```

When an expense is created the repository inserts the parent row and then one `expense_shares` row per `user_id` with `amount_due = total_amount / count(user_ids)`. All inserts run inside a single transaction.

### `bills`

Recurring fixed-cost bills (rent, internet, etc.) with a `payment_period` in months (1, 2, 6, or 12). `next_due_date` is advanced by the cron job after each payment cycle.

### `bulletin_notes`

House-scoped sticky notes with an optional `dismiss_date`.

### `reports`

Member-to-owner issue reports. Owners can mark them read/solved and upload images (stored URL in `report_images` table added in migration 005).

---

## Migrations

All migrations live in `supabase/migrations/` (source of truth for schema changes). The `database/` folder contains the original standalone PostgreSQL scripts for reference.

```
001_initial_schema.sql   — core tables
002_seed.sql             — development seed data
003_*                    — occupation type constraint fix
004_add_user_preferred_currency.sql
005_reports_schema.sql   — reports + images
005_subscriptions.sql    — Stripe subscription tables
006_bill_reminders.sql   — bill reminder tracking
007_referral_rewards.sql — referral system
008_monthly_reports.sql  — pre-aggregated monthly summaries
009_house_status.sql     — house active/archived status
010_gdpr.sql             — GDPR export/deletion tables
```

Apply locally:

```bash
supabase start      # applies all migrations automatically
# or
supabase db reset   # drop + reapply all migrations
```

---

## Connection Management

The server creates a singleton `pg.Pool` at startup via `getPostgresPool()`. The pool is initialized in the Nitro server plugin and injected into the repository factory:

```typescript
// server/plugins/postgres.ts (simplified)
const pool = getPostgresPool(config);
initializeRepositories(pool);
```

All queries go through `executeQuery()` which acquires a client from the pool, runs the query with parameters, and releases the client. Transactions use `executeTransaction()` which wraps multiple statements in `BEGIN` / `COMMIT` / `ROLLBACK`.

---

## Balance Calculation

The `PostgresBalanceRepository.getHouseBalance()` computes net balances in SQL:

1. Aggregate `SUM(amount_due)` per user where `is_paid = false` → what they owe.
2. Aggregate `SUM(amount_due)` per user from expenses they created and that others owe → what others owe them.
3. Compute `net_balance = owed_to_user - user_owes`.
4. Derive minimal settlement transactions: users with a negative net balance owe users with a positive net balance.

This runs as a single query with CTEs, not in application code.

---

## Switching the Database

Because all SQL is inside `server/repositories/postgres/Postgres*.ts` and every class implements a pure TypeScript interface:

1. Write `server/repositories/mysql/Mysql*.ts` implementing the same interfaces.
2. Add `createMysqlRepositories(pool)` in `factory.ts`.
3. Change the server plugin to create a MySQL pool and call `initializeRepositories(mysqlPool)`.

No endpoint, store, composable, or component changes. The interfaces (`server/repositories/interfaces/`) are the stable contract.
