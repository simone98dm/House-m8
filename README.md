# 🏠 House M8

> **Stop fighting over who owes what.** House M8 is a shared-living finance app for roommates — split expenses, track recurring bills, check the house balance, and keep everyone in the loop, all in one place.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Nuxt 4](https://img.shields.io/badge/Nuxt-4.4.5-00DC82?logo=nuxt.js)](https://nuxt.com)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org)

---

## ✨ Features

### 💸 Expenses
- Log any shared expense and split it equally across selected housemates
- Track who has paid their share and who still owes
- Recurring expenses with weekly / monthly / yearly periods
- Filter by status, user, date range

### 📋 Bills
- Manage recurring fixed costs (rent, internet, utilities)
- Configurable payment periods (monthly, bi-monthly, semi-annual, annual)
- Due-date tracking and reminders via cron job

### ⚖️ Balance
- Real-time net balance per user — who owes whom and how much
- Minimal settlement plan: the least number of transfers to clear all debts
- One-click settlement between two users

### 🏘️ Houses
- Create and switch between multiple houses
- Role-based access: **owner** vs. **member**
- Invite members via shareable token links
- Configurable member capacity

### 📌 Bulletin Board
- Post sticky notes visible to all housemates
- Optional expiry date per note

### 📄 Reports
- Members can submit issue reports to the house owner
- Attach images, mark as read/solved
- Export expense/balance summaries as **PDF** (generated client-side)

### 👤 Profile & Settings
- Full profile: name, avatar, bio, occupation, languages, social links
- GDPR controls: data export and account deletion
- Per-user currency preference (EUR, USD)

### 🔐 Auth
- Email + password registration with email verification
- Google OAuth one-click sign-in
- JWT access + refresh token pair (HTTP-only cookies)

### 🌍 Platform
- 🌙 Full dark mode via `@nuxtjs/color-mode`
- 🌐 English and Italian (`@nuxtjs/i18n`)
- 💳 Stripe-powered subscription plans
- 🚩 Feature flags (env-based or Vercel Edge Config)

---

## 📸 Screenshots

### Dashboard
![App dashboard](screenshots/dashboard.png)

### Expenses
![Expenses page](screenshots/expenses.png)

### Bills
![Bills page](screenshots/bills.png)

### Balance
![Balance page](screenshots/balance.png)

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/simone98dm/house-m8-fe.git
cd house-m8-fe

# 2. Install
yarn

# 3. Start the database
docker compose up -d

# 4. Configure environment
cp .env.example .env
# edit .env — at minimum set POSTGRES_URL and JWT_SECRET

# 5. Run
yarn dev
# → http://localhost:3000
```

For full environment setup, migrations, and optional services (Google OAuth, Stripe, email) see **[docs/setup.md](docs/setup.md)**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Nuxt 4 (Vue 3.5 + Nitro) |
| Language | TypeScript 5.7 |
| State | Pinia 3.x |
| Database | PostgreSQL 16 (`pg`, no ORM) |
| Styling | Tailwind CSS 3.x |
| Auth | JWT (`jose`) + bcrypt + Google OAuth |
| Email | Resend |
| Payments | Stripe |
| PDF | jspdf + pdf-lib |
| Testing | Vitest + Vue Test Utils + Cypress |
| Deployment | Vercel |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | 4-layer pattern, repository design, request lifecycle |
| [API Reference](docs/api.md) | All endpoints, request/response shapes, auth guards |
| [Database](docs/database.md) | Schema, migrations, balance calculation, portability |
| [Frontend](docs/frontend.md) | Component model, stores, API client, i18n, dark mode |
| [Setup Guide](docs/setup.md) | Prerequisites, env vars, migrations, scripts, deployment |
| [Design System](DESIGN.md) | Kinetic Gallery — colors, typography, elevation, motion |
| [Contributing](CONTRIBUTING.md) | Branch conventions, commit format, PR process |
| [Changelog](CHANGELOG.md) | Release history |
| [OpenAPI spec](openapi.yaml) | Machine-readable API spec |
| [Postman collection](postman-collection.json) | API request collection |

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/amazing-feature`
3. Commit using [conventional commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `docs:`
4. Open a pull request

Husky + commitlint enforce the commit format automatically.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---

## 🙋 Contact

**GitHub**: [@simone98dm](https://github.com/simone98dm) · **Project**: [github.com/simone98dm/house-m8-fe](https://github.com/simone98dm/house-m8-fe)
