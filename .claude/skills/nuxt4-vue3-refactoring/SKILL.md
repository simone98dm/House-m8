---
name: nuxt4-vue3-refactoring
description: Expert guidance for refactoring Vue 3 / Nuxt 4 codebases — folder structure (app/, layers), TypeScript type-safety, data fetching with useFetch/useAsyncData, component and composable architecture, server-side Nitro/H3, performance and bundle size. Includes concrete criteria for deciding WHEN to extract a subcomponent (size, single responsibility, duplication, reactive-state isolation) and the Smart vs Dumb components pattern. Use this skill whenever the user asks to refactor, restructure, modernize, "clean up", or optimize Vue/Nuxt code, to split or merge components, to organize the components/ folder, or to migrate from Nuxt 2/3 to Nuxt 4 — even if they don't explicitly say "refactoring" or "Nuxt 4".
---

# Vue 3 / Nuxt 4 Refactoring

This skill guides a focused, incremental, future-proof refactor of Vue 3 / Nuxt 4 codebases. Nuxt 4 turns into stable standards what used to be optional or inconsistent in earlier versions (directory structure, type-safety, auto-import), so refactoring should be read as aligning with those standards, not as a rewrite from scratch.

## How to proceed

Don't rewrite everything in one pass. First take inventory of the problems (oversized components, leftover `any`, fetching in the wrong place, disorganized folders), then fix things starting from the most isolated, peripheral components and work inward toward the routing/fetching core. This order lowers the risk of cascading breakage, since peripheral components have fewer dependents to re-verify after a change. If the project is still on Nuxt 3, enable the future-compatibility flags in `nuxt.config.ts` before starting — the framework's own warnings will then point at what needs attention.

## 1. Directory structure

Nuxt 4 formalizes the structure that had already been emerging in earlier versions. Check that the project follows it:

- application logic lives in the standard location (e.g. `app/`, when the project's configuration expects it);
- a clean transition if the project uses a monorepo/layers approach.

For large codebases, don't settle for a flat structure: use **Nuxt Layers** to isolate entire features (components, composables, server routes dedicated to a single domain). A layer per domain makes that domain movable, testable, and understandable in isolation — it's the same single-responsibility principle applied at the module level instead of the component level.

## 2. Type-safety

Nuxt 4 is built to be strongly typed — lean into that instead of working around it.

- Remove leftover `any` types, relying on the type auto-imports Nuxt generates for components and composables.
- For server calls (`useFetch` and friends), type the returned data straight from the Nitro routes instead of redefining duplicate interfaces on the client.

## 3. Data fetching

Data fetching is one of the most common sources of refactoring in Nuxt, usually because of patterns inherited from Vue 2 or applied in the wrong place.

- Replace fetching done in `onMounted` (or other lifecycle hooks) with `useFetch`/`useAsyncData` at the `<script setup>` level, to regain correct server-side rendering — fetching in `onMounted` only runs client-side and loses SSR, SEO, and time-to-content.
- Use `useAsyncData` keys explicitly to control caching and deduplication.
- Apply `lazy: true` or `immediate: false` when the data isn't needed on first render, to improve time-to-interactive.

## 4. Component and composable architecture

### 4.1 When to extract a subcomponent

The Composition API makes it easy to slide into either extreme: "mega-components" or, at the opposite end, a maze of micro-components that's hard to track. Neither extreme is the goal — the goal is that every component has a clear responsibility boundary. Use these four signals: if you clearly recognize even one of them, it's time to split.

**A. Size.** A component that goes past 200-300 lines (across `<script>`, `<template>`, and `<style>`) is almost always a refactoring candidate: beyond that threshold the template stops being readable at a glance.

**B. Multiple responsibilities (Single Responsibility Principle).** A component should do one thing and do it well.

- _Bad example:_ `UserProfile.vue` handling data display, the avatar-edit form, the invoice list, and the activity chart, all at once.
- _Fix:_ `UserProfile.vue` becomes the orchestrator-agent that composes `UserCard.vue`, `AvatarForm.vue`, and `InvoiceList.vue`.

**C. Duplication.** If you find yourself copy-pasting the same HTML structure and its logic (a product card, a button with a loader, a formatted input) in two or more places in the app, that structure should become a standalone component in `components/`.

**D. Reactive-state isolation (performance).** Every state change causes the component that holds it — and its non-optimized children — to re-evaluate. If a complex form or a modal has a lot of internal state and opens/closes often, extract it into a separate component: that way the re-render cycles triggered by opening/closing the modal stay contained inside it, instead of weighing down the page that hosts it.

### 4.2 Mental checklist before splitting

Before extracting (or deciding to keep together) a block of code, ask these three questions in order:

1. **Does it have complex internal logic** (its own `ref`s, `computed`s, or dedicated validation methods)? → Yes: split it.
2. **Can you describe it in one word or a very short phrase** (e.g. "it's a table row", "it's the search bar")? → Yes: it's a great subcomponent candidate.
3. **Does the parent component need to know the formatting or calculation details of this specific piece of UI?** → No: the parent should only pass raw data via `props` and listen for events via `emits`; implementation details stay in the child.

If the answers point the other way (trivial logic, hard to describe briefly, the parent still needs every detail regardless), that's a sign that splitting would add indirection without real benefit — better to keep it together.

### 4.3 Folder organization (namespacing)

Nuxt 4 joins `components/` folder names to auto-generate the component name. Use this to organize by domain instead of dumping everything at the root:

```
components/
├── user/
│   ├── Card.vue         -> <UserCard />
│   ├── InvoiceList.vue  -> <UserInvoiceList />
│   └── ProfileForm.vue  -> <UserProfileForm />
└── ui/
    ├── Button.vue        -> <UiButton />
    └── Modal.vue         -> <UiModal />
```

### 4.4 Smart vs Dumb components pattern

Split components into two categories during refactoring:

- **Smart / Container** — typically the `pages/` or the top-level components. They talk to Nuxt endpoints (`useFetch`), manage global state or complex composables, and pass data downward.
- **Dumb / Presentational** — the extracted subcomponents. They don't know where the data comes from and never call `useFetch`. They only receive `props`, emit events via `defineEmits`, and handle pure visual presentation.

This separation is what makes Dumb Components easy to test, reuse, and move around: their dependency surface is reduced to props/emits, with no implicit ties to the rest of the app.

### 4.5 Composition API and macros

- Migrate components still on the Options API to the **Composition API** with `<script setup>`.
- Use `defineProps`, `defineEmits`, and `defineSlots` (with reactive props destructuring, standard since Vue 3.5+) for declarative, readable components.
- Before defaulting to Pinia, check whether the state can be handled with Nuxt's `useState()`, which shares state between server and client without extra boilerplate.

## 5. Server-side (Nitro)

- Refactor monolithic endpoints into smaller, reusable functions inside `server/utils/`.
- Use H3 utilities (`readBody`, `getQuery`, `createError`) for standardized error handling.

## 6. Performance and "bundle diet"

- Replace `<img>` tags and manual font loading with `@nuxt/image` and `@nuxt/fonts`: they drastically cut Cumulative Layout Shift and optimize assets automatically.
- Remove giant global CSS files in favor of scoped CSS in components, or bring in a utility framework (Tailwind CSS, Nuxt UI) to keep the final bundle minimal.

## Final checklist for a completed refactor

Before considering the refactor of an area of the codebase done, verify that:

- [ ] no component exceeds 200-300 lines without an explicit justification
- [ ] every component has a single, recognizable responsibility
- [ ] there's no duplicated markup/logic across different components
- [ ] `useFetch`/`useAsyncData` are used only in Smart Components, never nested inside `onMounted`
- [ ] there are no leftover `any` types in data interfaces
- [ ] `components/` is organized by domain (namespaced), not flat
- [ ] components with heavy internal state (modals, complex forms) are isolated from the component that hosts them
