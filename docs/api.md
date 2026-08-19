# API Reference

All endpoints live under `/api/` and are served by the Nitro server embedded in the Nuxt 4 app. There is no separate API service.

A machine-readable spec is at [`openapi.yaml`](../openapi.yaml). A Postman collection is at [`postman-collection.json`](../postman-collection.json).

---

## Conventions

### Authentication

All protected endpoints require a valid JWT access token in the `access_token` HTTP-only cookie (set automatically by the sign-in/OAuth flows). Endpoints call `verifyAuthCompat(event)` as the first step and return `401` if no valid token is present.

### Input Validation

Every mutating endpoint uses `readValidatedBody(event, zodSchema.parse)`. Invalid input returns `400` with a Zod error message before any business logic runs.

### Authorization Guards

| Guard                   | Function                                  | HTTP error |
| ----------------------- | ----------------------------------------- | ---------- |
| Must be logged in       | `verifyAuthCompat()`                      | 401        |
| Must be house member    | `ensureHouseMember(houseId, userId)`      | 403        |
| Must be house owner     | `ensureHouseOwner(houseId, userId)`       | 403        |
| Must be expense creator | `ensureExpenseCreator(expenseId, userId)` | 403        |
| Must be bill creator    | `ensureBillCreator(billId, userId)`       | 403        |

### Response Shape

Success:

```json
{ "data": { ... } }
```

Paginated:

```json
{
  "data": [...],
  "pagination": { "page": 1, "limit": 20, "total": 42, "total_pages": 3 }
}
```

Error (Nitro `createError`):

```json
{ "statusCode": 400, "statusMessage": "Description" }
```

---

## Auth — `/api/auth/`

| Method | Path                               | Auth        | Description                              |
| ------ | ---------------------------------- | ----------- | ---------------------------------------- |
| POST   | `/api/auth/register`               | public      | Register with email + password           |
| POST   | `/api/auth/signin`                 | public      | Email/password login → sets JWT cookies  |
| POST   | `/api/auth/signout`                | public      | Clears JWT cookies                       |
| POST   | `/api/auth/refresh`                | cookie      | Rotates access token using refresh token |
| GET    | `/api/auth/verify-email`           | token param | Confirms email address via link          |
| POST   | `/api/auth/confirm`                | public      | Alternative email confirmation           |
| POST   | `/api/auth/password-reset/request` | public      | Sends reset email                        |
| POST   | `/api/auth/password-reset/confirm` | token param | Sets new password                        |
| GET    | `/api/auth/google`                 | public      | Redirects to Google OAuth consent        |
| GET    | `/api/auth/google/callback`        | OAuth       | Completes OAuth, sets JWT cookies        |
| POST   | `/api/auth/oauth/refresh`          | public      | Refreshes Google OAuth tokens            |

**Register body:**

```json
{
  "email": "user@example.com",
  "password": "min8chars",
  "first_name": "Jane",
  "last_name": "Doe"
}
```

**Sign-in body:**

```json
{ "email": "user@example.com", "password": "..." }
```

---

## Users — `/api/users/`

| Method | Path                             | Auth | Description                        |
| ------ | -------------------------------- | ---- | ---------------------------------- |
| GET    | `/api/users/me`                  | JWT  | Current user profile               |
| PUT    | `/api/users/me`                  | JWT  | Update profile fields              |
| GET    | `/api/users/[id]`                | JWT  | Public profile of another user     |
| POST   | `/api/users/me/pictures`         | JWT  | Upload profile picture (multipart) |
| DELETE | `/api/users/me/pictures/[index]` | JWT  | Remove profile picture by index    |

---

## Houses — `/api/houses/`

| Method | Path                                   | Auth   | Description                        |
| ------ | -------------------------------------- | ------ | ---------------------------------- |
| GET    | `/api/houses`                          | JWT    | All houses the user belongs to     |
| POST   | `/api/houses`                          | JWT    | Create a new house                 |
| GET    | `/api/houses/[id]`                     | member | House details                      |
| PUT    | `/api/houses/[id]`                     | owner  | Update house name/address/currency |
| GET    | `/api/houses/[id]/members`             | member | List members                       |
| DELETE | `/api/houses/[id]/members/[user_id]`   | owner  | Remove a member                    |
| POST   | `/api/houses/[id]/leave`               | member | Leave the house                    |
| POST   | `/api/houses/[id]/invitation/generate` | owner  | Generate invite token              |
| POST   | `/api/houses/[id]/invitation/accept`   | JWT    | Accept an invite by token          |

---

## Expenses — `/api/expenses/`

| Method | Path                                   | Auth    | Description                                  |
| ------ | -------------------------------------- | ------- | -------------------------------------------- |
| GET    | `/api/expenses?house_id=&page=&limit=` | member  | Paginated expense list with optional filters |
| POST   | `/api/expenses`                        | member  | Create expense + split shares                |
| GET    | `/api/expenses/[id]`                   | member  | Single expense with shares                   |
| PUT    | `/api/expenses/[id]`                   | creator | Update description/amount/dates              |
| DELETE | `/api/expenses/[id]`                   | creator | Delete expense and all shares                |
| GET    | `/api/expenses/summary`                | member  | Aggregated totals per user                   |
| POST   | `/api/expenses/shares/[id]/pay`        | JWT     | Mark share as paid                           |
| POST   | `/api/expenses/shares/[id]/unpay`      | JWT     | Mark share as unpaid                         |

**Create expense body:**

```json
{
  "house_id": "uuid",
  "description": "Groceries",
  "total_amount": 45.5,
  "currency": "EUR",
  "user_ids": ["uuid1", "uuid2"],
  "due_date": "2026-06-01T00:00:00Z",
  "recurring": false,
  "recurring_period": null
}
```

The server splits `total_amount` equally across all `user_ids` and inserts one `expense_shares` row per user in a single transaction.

---

## Bills — `/api/bills/`

| Method | Path                   | Auth    | Description             |
| ------ | ---------------------- | ------- | ----------------------- |
| GET    | `/api/bills?house_id=` | member  | All bills for the house |
| POST   | `/api/bills`           | member  | Create a recurring bill |
| GET    | `/api/bills/[id]`      | member  | Bill details            |
| PUT    | `/api/bills/[id]`      | creator | Update bill             |
| DELETE | `/api/bills/[id]`      | creator | Deactivate/delete bill  |

**Create bill body:**

```json
{
  "house_id": "uuid",
  "description": "Internet",
  "monthly_cost": 30.0,
  "payment_period": 1,
  "next_due_date": "2026-06-01"
}
```

`payment_period` is in months; allowed values: `1`, `2`, `6`, `12`.

---

## Balance — `/api/balance/`

| Method | Path                      | Auth   | Description                             |
| ------ | ------------------------- | ------ | --------------------------------------- |
| GET    | `/api/balance/[house_id]` | member | Computed net balances + settlement plan |

Response includes:

- `user_balances[]` — per-user `total_paid`, `total_owed`, `net_balance`
- `settlement_transactions[]` — minimal set of transfers to settle debts (who pays whom)
- `total_expenses` — sum of all unpaid shares
- `is_balanced` — true if all net balances are within €0.01

---

## Bulletin Notes — `/api/bulletin-notes/`

| Method | Path                            | Auth    | Description          |
| ------ | ------------------------------- | ------- | -------------------- |
| GET    | `/api/bulletin-notes?house_id=` | member  | All active notes     |
| POST   | `/api/bulletin-notes`           | member  | Create note          |
| DELETE | `/api/bulletin-notes/[id]`      | creator | Delete note          |
| POST   | `/api/bulletin-notes/cleanup`   | cron    | Remove expired notes |

---

## Reports — `/api/reports/`

| Method | Path                       | Auth    | Description                              |
| ------ | -------------------------- | ------- | ---------------------------------------- |
| GET    | `/api/reports/user`        | JWT     | Reports submitted by current user        |
| GET    | `/api/reports/owner`       | JWT     | Reports for houses owned by current user |
| POST   | `/api/reports`             | member  | Submit a report to house owner           |
| GET    | `/api/reports/[id]`        | JWT     | Report details                           |
| DELETE | `/api/reports/[id]`        | creator | Delete report                            |
| PATCH  | `/api/reports/[id]/read`   | owner   | Mark report as read                      |
| PATCH  | `/api/reports/[id]/solved` | owner   | Mark report as solved                    |
| POST   | `/api/reports/[id]/images` | JWT     | Attach images to report                  |

---

## Stripe — `/api/stripe/`

| Method | Path                       | Auth             | Description                    |
| ------ | -------------------------- | ---------------- | ------------------------------ |
| POST   | `/api/stripe/checkout`     | JWT              | Create Stripe checkout session |
| POST   | `/api/stripe/portal`       | JWT              | Open Stripe customer portal    |
| GET    | `/api/stripe/subscription` | JWT              | Current subscription status    |
| POST   | `/api/stripe/webhook`      | Stripe signature | Handle Stripe events           |

Webhook events handled: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

---

## GDPR — `/api/gdpr/`

| Method | Path               | Auth | Description                |
| ------ | ------------------ | ---- | -------------------------- |
| POST   | `/api/gdpr/export` | JWT  | Queue personal data export |
| POST   | `/api/gdpr/delete` | JWT  | Schedule account deletion  |

---

## Cron — `/api/cron/`

Protected by `CRON_SECRET` header, not JWT cookies. Intended for Vercel cron jobs or external schedulers.

| Method | Path                        | Description                             |
| ------ | --------------------------- | --------------------------------------- |
| POST   | `/api/cron/bill-reminders`  | Send upcoming bill reminders            |
| POST   | `/api/cron/monthly-reports` | Generate pre-aggregated monthly reports |

---

## Error Codes

| Code | Meaning                                             |
| ---- | --------------------------------------------------- |
| 400  | Bad request / Zod validation failed                 |
| 401  | Missing or expired JWT                              |
| 403  | Authenticated but not authorized (wrong house/role) |
| 404  | Resource not found                                  |
| 409  | Conflict (e.g. duplicate email)                     |
| 500  | Unexpected server error                             |
