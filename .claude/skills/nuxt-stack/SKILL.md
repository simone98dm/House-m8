---
name: nuxt-stack
description: Conventions and patterns for the Nuxt 4 + Vue 3 + Nitro + TypeScript stack. Use when creating or modifying pages, components, composables, stores, server routes, or project structure in a Nuxt project — triggers on Nuxt, Vue, Nitro, composable, Pinia, useFetch, server route, defineEventHandler.
---

# Nuxt Stack Conventions

## Directory Structure (Nuxt 4)

```
app/                    # client app (Nuxt 4 srcDir)
├── assets/             # main.css with Tailwind @theme tokens
├── components/         # auto-imported; PascalCase; folder = name prefix
├── composables/        # auto-imported; useXxx naming
├── layouts/
├── middleware/         # route middleware (.global suffix for global)
├── pages/              # file-based routing
├── plugins/            # .client/.server suffix when one-sided
└── stores/             # Pinia stores, useXxxStore naming
server/                 # Nitro
├── api/                # endpoints: index.get.ts, [id].delete.ts
├── middleware/
├── plugins/
├── repositories/       # data access layer
└── utils/              # auto-imported server-side
shared/                 # types/utils shared client+server (auto-imported)
```

## Components

- `<script setup lang="ts">` exclusively; SFC order: script → template → style
- Props typed inline: `const { count = 0 } = defineProps<{ count?: number }>()`
- Emits typed: `const emit = defineEmits<{ save: [id: string] }>()`
- Descriptive event names (`save`, `delete`), never `click`
- Always handle loading / error / empty states in data-driven components
- `<NuxtLink>` for navigation, never `<a>` for internal routes

## Data Fetching

- `useFetch`/`useAsyncData` in pages/components (SSR-aware, deduplicated); `$fetch` only for user-triggered actions (form submit)
- Never `$fetch` in setup for initial data — it double-fetches on hydration
- Key every `useAsyncData` explicitly when params vary: `useAsyncData(`item-${id}`, ...)`
- API calls live in composables (`composables/useItemsApi.ts`), not inline in components
- Stores call composables; components call stores. Components never call `$fetch` directly.

## State

- Pinia setup-style stores: `defineStore('items', () => { ... })`
- Store state: `items`, `loading`, `error` triple for every async collection
- `computed` for derived state; `watch` sparingly
- `useState` only for trivial SSR-safe shared state, not domain data

## Nitro Server

- File-based routing with method suffix: `server/api/items/[id].put.ts`
- Every endpoint: auth → validate (Zod) → authorize → operate → return DTO (see `nitro-api-agent` agent for the full pattern)
- Repository pattern: no raw queries in handlers
- `createError({ statusCode, message })` for all errors; never leak internals

## TypeScript

- `strict: true`; no `any` — `unknown` + narrowing
- Shared domain types in `shared/types/`; server-only types stay in `server/`
- `satisfies` for config objects
- Zod schemas are the source of truth at boundaries: `z.infer<typeof schema>`

## Anti-patterns

- ❌ Mutating props
- ❌ Business logic in components (belongs in composables/stores)
- ❌ `process.client` (use `import.meta.client`)
- ❌ Browser APIs without `import.meta.client` guard
- ❌ Missing `:key` on `v-for`; index as key on mutable lists
- ❌ Giant composables — one concern per composable

## Checklist for Every Change

- [ ] Correct directory per the structure above
- [ ] SSR-safe (no window/document at top level)
- [ ] Loading/error/empty states present
- [ ] Types explicit at module boundaries
- [ ] i18n for all user-facing text (`$t()`)
