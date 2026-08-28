# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Solo Flowers (`solo-shop`) — a flower shop storefront + admin panel. React 19 + TypeScript + Vite, styled with Tailwind CSS v4 and Ant Design. This is an early-stage scaffold: the feature-based folder structure is fully laid out, but most feature files (`api.ts`, `hooks.ts`, `store.ts`, most components) are currently **empty stubs** waiting to be implemented. Check whether a file has content before assuming a pattern is established — many "existing" files are placeholders, not working code.

Code comments and UI copy in this repo are written in Uzbek (Latin script) — follow that convention when adding comments/labels rather than switching to English.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) then production build via Vite
- `npm run lint` — run ESLint over the whole repo
- `npm run preview` — preview the production build locally

There is no test runner configured in this project (no test script, no test framework installed).

## Architecture

**Feature-based structure under `src/`:**
- `src/app/` — app-wide wiring: `providers/` (QueryProvider wraps React Query, AntdProvider wraps Ant Design's `ConfigProvider`, AuthProvider is a not-yet-implemented passthrough) and `layouts/` (`UserLayout` = public storefront shell with header/footer, `AdminLayout` = admin shell with a Menu-based `Sider`).
- `src/router/index.tsx` — single `createBrowserRouter` instance; routes are nested under `UserLayout` (public) and `AdminLayout` (`/admin/*`). Route paths are never hardcoded inline — they come from `src/shared/constants/routes.ts` (`ROUTES`), including nested admin paths under `ROUTES.ADMIN`.
- `src/features/<feature>/` — one folder per domain area (`products`, `admin-products`, `cart`, `orders`, `auth`), each following the same internal shape: `api.ts` (HTTP calls), `hooks.ts` (React Query hooks wrapping `api.ts`), `store.ts` (Zustand store, only where client-side state is needed — `cart`, `auth`), `types.ts` (domain types), `components/` (feature-scoped UI). Note `admin-products` is a separate feature from `products` (public catalog vs. admin CRUD), not a subfolder of it.
- `src/pages/` — route-level components split into `user/` and `admin/`, mirroring the two layouts. Pages compose feature hooks/components; they should stay thin.
- `src/shared/` — cross-feature code: `ui/` (generic components like `EmptyState`, `PageHeader`, `ConfirmDeleteModal`), `lib/` (`apiClient.ts` for the shared Axios instance, `queryClient.ts`, `utils.ts`), `hooks/` (e.g. `useDebounce`), `constants/routes.ts`.

**State management:** TanStack Query for server state (data fetching/caching), Zustand for client-only state (cart contents, auth session). Don't mix the two — server data goes through Query hooks in `features/*/hooks.ts`, not into a Zustand store.

**Path alias:** `@/*` maps to `src/*` (configured in both `vite.config.ts` and `tsconfig.app.json`) — use it instead of relative `../../` imports.

**Styling:** Tailwind v4 via `@tailwindcss/vite` plugin (no `tailwind.config.js` needed — v4 is CSS-first) alongside Ant Design components themed through `AntdProvider`'s `ConfigProvider` (see `src/app/providers/AntdProvider.tsx` for theme tokens, e.g. `colorPrimary` bound to the CSS var `--color-primary`).

**Domain model:** Products belong to one of four categories (`bouquet`, `potted`, `gift-set`, `wedding`) defined in `src/features/products/types.ts`, with Uzbek display labels in `CATEGORY_LABELS`.
