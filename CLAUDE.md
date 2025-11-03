# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js 15.1.2** application using the **Pages Router** architecture. It's a personal finance management application ("My Account") that integrates with Firebase for data persistence and next-auth for authentication. The project uses Yarn 4 (Berry) with PnP mode.

**Recent Migration (Nov 2025)**: The project has been migrated to Next.js 15, React 19, and @tanstack/react-query v5 (formerly react-query v3).

## Development Commands

```bash
# Install dependencies (use Yarn 4)
yarn install

# Start development server (runs on http://localhost:3000)
yarn dev

# Production build
yarn build

# Start production server
yarn start

# Run linter
yarn lint
```

## Environment Variables

Required environment variables (configure in `.env.local`):

- **Firebase**: `NEXT_PUBLIC_API_KEY`, `NEXT_PUBLIC_AUTO_DOMAIN`, `NEXT_PUBLIC_PROJECT_ID`, `NEXT_PUBLIC_STORAGE_BUCKET`, `NEXT_PUBLIC_MESSAGEING_SENDER_ID`, `NEXT_PUBLIC_APP_ID`, `NEXT_PUBLIC_MEASUREMENT_ID`
- **NextAuth**: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_ID`, `GOOGLE_CLIENT_SECRET`

## Architecture & Key Patterns

### Project Structure

```
src/
├── components/       # Feature-based components (account, auth, credit, home, etc.)
│   ├── shared/      # Reusable UI components (Button, Input, Layout, etc.)
│   └── [feature]/   # Feature-specific components with co-located hooks
├── pages/           # Next.js Pages Router routes
│   ├── api/         # API routes (next-auth configuration)
│   └── [routes]     # Page components (index, account, credit, etc.)
├── remote/          # Firebase/API data fetching functions
├── models/          # TypeScript type definitions
├── contexts/        # React Context providers (AlertContext)
├── hooks/           # Global custom hooks and HOCs
├── styles/          # Global styles (Emotion)
├── constants/       # Application constants
├── utils/           # Utility functions
└── mock/            # Mock data for development
```

### Path Aliases

The project uses extensive TypeScript path aliases (see tsconfig.json):
- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@shared/*` → `src/components/shared/*`
- `@pages/*` → `src/pages/*`
- `@remote/*` → `src/remote/*`
- `@models/*` → `src/models/*`
- `@utils/*` → `src/utils/*`
- `@contexts/*` → `src/contexts/*`
- `@hooks/*` → `src/hooks/*`
- `@styles/*` → `src/styles/*`
- `@constants` or `@constants/*` → `src/constants/*`

Always use these aliases instead of relative imports.

### Authentication Flow

1. **NextAuth Configuration**: Located at `src/pages/api/auth/[...nextauth].tsx`
   - Uses Google OAuth provider
   - JWT session strategy
   - Custom session callback adds user ID from token
   - Custom sign-in page at `/auth/signin`

2. **Session Management**:
   - App wrapped with `SessionProvider` in `_app.tsx`
   - Use `useSession()` hook to access session data
   - `AuthGuard` component prevents rendering during loading state

3. **User Model**: User interface extends NextAuth's default with `id` field (src/models/user.ts)

### Data Fetching & State Management

1. **@tanstack/react-query v5**: Primary data fetching library (migrated from react-query v3)
   - Configured in `_app.tsx` with `QueryClientProvider`
   - Supports SSR hydration via `dehydrate`/`HydrationBoundary`
   - Feature-specific hooks typically live in `components/[feature]/hooks/`
   - **IMPORTANT**: v5 uses object syntax for all query hooks

2. **Server-Side Data Prefetching Pattern** (React Query v5):
   ```typescript
   // Example from src/pages/index.tsx
   export async function getServerSideProps(context) {
     const session = await getSession(context)
     const client = new QueryClient()

     // useQuery pattern - object syntax
     await client.prefetchQuery({
       queryKey: ['key', id],
       queryFn: () => fetchFunction(id)
     })

     // useInfiniteQuery pattern - requires initialPageParam
     await client.prefetchInfiniteQuery({
       queryKey: ['items'],
       queryFn: () => fetchItems(),
       initialPageParam: null
     })

     return {
       props: {
         dehydratedState: JSON.parse(JSON.stringify(dehydrate(client)))
       }
     }
   }
   ```

3. **React Query v5 Migration Notes**:
   - `useQuery(['key'], fn, options)` → `useQuery({ queryKey: ['key'], queryFn: fn, ...options })`
   - `useMutation(fn, { onSuccess, onError })` → `useMutation({ mutationFn: fn })` + move callbacks to mutate() call or useEffect
   - `useInfiniteQuery` requires `initialPageParam` property
   - `isLoading` → `isPending` for mutations
   - `Hydrate` → `HydrationBoundary`
   - Import from `@tanstack/react-query` instead of `react-query`

4. **Firebase Firestore**: All data persistence functions in `src/remote/`
   - `account.ts` - Account and terms management
   - `transaction.ts` - Transaction operations
   - `card.ts` - Card data
   - `credit.ts` - Credit score data
   - `banner.ts` / `event.ts` - Event and banner data
   - `piggybank.ts` - Savings goals

5. **Firebase Setup**: `src/remote/firebase.ts` initializes Firebase with singleton pattern

### Styling

- **Emotion**: CSS-in-JS library (`@emotion/react`, `@emotion/styled`)
- `jsxImportSource` set to `@emotion/react` in tsconfig.json for automatic JSX pragma
- Global styles defined in `src/styles/globalStyles`
- Shared components use Emotion for styling

### UI Patterns

1. **Alert System**: Global alert via React Context (`src/contexts/AlertContext.tsx`)
   - Access with `useAlertContext()` hook
   - Renders alerts via React Portal to `#root-portal`

2. **Error Handling**:
   - `ErrorBoundary` component wraps the entire app
   - Custom error page at `src/pages/_error.tsx`
   - Custom 404 page at `src/pages/404.tsx`

3. **Dynamic Imports**: Home page uses `next/dynamic` for code-splitting major components with loading skeletons

4. **Layout**: Common layout structure in `src/components/shared/Layout.tsx` and `Navbar.tsx`

### Performance

- **Web Vitals**: Monitored via `useReportWebVitals` hook in `_app.tsx`
- **Next.js Image Optimization**: Configured remote patterns for iconfinder.com, googleusercontent.com, pixabay.com
- **Code Splitting**: Dynamic imports used for heavy components (EventBanners, CreditScore, CardList)

## Code Style

- **Linting**: ESLint with Next.js config + Prettier integration
- **Formatting**: Prettier enforces:
  - No semicolons
  - Single quotes
  - 2-space indentation
  - Trailing commas
  - LF line endings
- **TypeScript**: Strict mode enabled, ES5 target

## Data Models

Key TypeScript interfaces in `src/models/`:
- `user.ts` - User (with id field)
- `account.ts` - Account (userId, balance, terms)
- `transaction.ts` - Transaction records
- `card.ts` - Credit card data
- `credit.ts` - Credit score data
- `piggybank.ts` - Savings goals
- `banner.ts` / `event.ts` - Marketing content

## Important Notes

1. **Pages Router**: This project uses Next.js Pages Router, NOT App Router. All routing is file-based under `src/pages/`.

2. **Yarn Berry (v4)**: The project uses Yarn 4 with Plug'n'Play. The `.pnp.cjs` file should not be modified.

3. **Babel Configuration**: The project uses a custom `.babelrc` for Emotion JSX pragma. This is required and should not be removed.

4. **@babel/runtime**: Required dependency for Next.js 15 with custom Babel config. Must be included in dependencies.

5. **next-auth v4**: The project uses next-auth v4.24.11 (not v5) for compatibility with the existing Pages Router architecture.
   - Use `getSession(context)` in `getServerSideProps` for SSR authentication
   - Use `useSession()` hook for client-side authentication

6. **Firebase Collections**: Collection names are centralized in `src/constants/collection.ts`

7. **Component Co-location**: Feature-specific hooks often live alongside their components in feature directories (e.g., `src/components/account/hooks/`)

8. **Visualization Libraries**:
   - `@visx/*` - Data visualization primitives
   - `framer-motion` - Animations
   - `swiper` - Carousels
   - `react-markdown` - Markdown rendering

9. **Forms**: Uses `react-hook-form` for form management

10. **Infinite Scroll**: Uses `react-infinite-scroll-component` for paginated lists

## Migration History

### November 2025 - Next.js 15 & React 19 Migration

**Updated Dependencies:**
- Next.js: 13.4.19 → 15.1.2
- React: 18.x → 19.0.0
- React DOM: 18.x → 19.0.0
- react-query → @tanstack/react-query: 3.39.3 → 5.62.11
- TypeScript: 4.9.5 → 5.7.2
- date-fns: 2.30.0 → 4.1.0
- Firebase: 10.5.2 → 11.1.0
- Emotion: 11.11.x → 11.13.5+
- framer-motion: 10.16.4 → 11.15.0

**Key Changes:**
1. All React Query hooks migrated to v5 object syntax
2. Added `@babel/runtime` as required dependency
3. Updated all prefetch calls to use object syntax with `initialPageParam` for infinite queries
4. Mutation callbacks moved from hook options to mutate() calls or useEffect hooks
5. React 19 compatibility ensured across all components
