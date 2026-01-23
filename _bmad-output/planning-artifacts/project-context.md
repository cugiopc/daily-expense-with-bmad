---
project_name: 'simple-todo-app'
user_name: 'HoanTran'
date: '2026-01-15'
sections_completed: ['language_rules', 'framework_rules', 'api_backend_rules', 'testing_rules', 'critical_rules']
existing_patterns_found: 15
architecture_document: '_bmad-output/planning-artifacts/architecture.md'
status: 'complete'
completedAt: '2026-01-15'
---

# Project Context for AI Agents: Daily Expenses PWA

_This file contains critical rules and patterns that AI agents must follow when implementing code for the Daily Expenses project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

**Frontend:**
- React 18.3.1 (use functional components with hooks only)
- TypeScript 5.3+ (strict mode enabled, no `any` without justification)
- Vite 7.x (build tool, NOT Create React App)
- Material-UI v5.15+ (component library, emotion styling)
- TanStack Query v5 (server state, replaces Redux)
- React Router v6.21+ (client-side routing)
- React Hook Form + Zod (form handling and validation)
- Workbox v7 + vite-plugin-pwa v0.20+ (PWA/offline support)
- date-fns (date utilities, NOT moment.js)
- Axios (HTTP client with interceptors)
- Vitest (testing framework, NOT Jest)

**Backend:**
- .NET Core 10 (C# 13)
- Entity Framework Core 10 (ORM)
- PostgreSQL 15+ (database)
- BCrypt.Net-Next 4.0.3 (password hashing, work factor 12)
- FluentValidation (input validation)
- Microsoft.AspNetCore.Authentication.JwtBearer (auth)
- Npgsql.EntityFrameworkCore.PostgreSQL (database driver)
- xUnit (testing framework)

**Deployment:**
- Frontend: Vercel or Netlify (static hosting)
- Backend: Railway, Render, or Azure (containerized API)
- Database: Managed PostgreSQL (Railway/Supabase/Azure)

---

## Critical Implementation Rules

### Language-Specific Rules (TypeScript/React)

**TypeScript Configuration:**
- ✅ Strict mode enabled - no `any` type without explicit justification comment explaining why
- ✅ Always use optional chaining `?.` and nullish coalescing `??` for null safety
- ✅ All functions must declare explicit return types (no implicit returns)
- ✅ Function parameters must have types - no implicit any
- ✅ Enable `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes` in tsconfig.json

**Import/Export Patterns:**
- ✅ Use named exports: `export function ComponentName()` NOT `export default`
- ✅ Each feature module exports public API through `index.ts` file
- ✅ No circular dependencies between features - features are independent
- ✅ No cross-feature imports - use public APIs only
- ✅ Import order: React → third-party → local components → types → utils

**React Component Rules:**
- ✅ Functional components ONLY - no class components ever
- ✅ Hooks must be called at top level - never conditionally or in loops
- ✅ Props interface naming: `{ComponentName}Props` pattern
- ✅ Component file structure order:
  1. Imports
  2. Type/Interface definitions
  3. Component function
  4. Colocated styles (if any)
- ✅ Use `React.FC` sparingly - prefer explicit function signature with props

**Error Handling:**
- ✅ All async operations must have try-catch blocks
- ✅ All route-level components wrapped in `<ErrorBoundary>`
- ✅ Use `toast.error(message)` for user-facing errors
- ✅ Use `console.error()` only in development (remove for production)
- ✅ Never silently catch errors - always log or show to user

**Type Safety:**
- ✅ Avoid type assertions (`as Type`) - use type guards instead
- ✅ Use `typeof`, `instanceof`, or custom type guards for narrowing
- ✅ All external data (API responses, form inputs) validated with Zod schemas
- ✅ Use discriminated unions for state machines and complex conditional types
- ✅ No `@ts-ignore` without detailed comment explaining why it's necessary

**Critical Anti-Patterns to AVOID:**
- ❌ NEVER use `any` without comment - use `unknown` and narrow with type guards
- ❌ NEVER use `export default` - breaks refactoring tools
- ❌ NEVER call hooks conditionally - React will break
- ❌ NEVER mutate state directly - always use setState/useState
- ❌ NEVER use class components - functional only

### Framework-Specific Rules (React + TanStack Query + Material-UI)

**React Hooks Patterns:**
- ✅ Use `useQuery` for GET requests, `useMutation` for POST/PUT/DELETE - NOT useState for server data
- ✅ All custom hooks must start with `use` prefix (e.g., `useExpenses`, `useCreateExpense`)
- ✅ Always include ALL dependencies in useEffect/useMemo/useCallback dependency arrays
- ✅ All mutations must implement `onMutate` for optimistic UI updates
- ✅ Use `queryClient.invalidateQueries()` after mutations to refetch data
- ✅ Set `retry: 3` for queries, `retryDelay: exponential` for network resilience

**TanStack Query Patterns:**
- ✅ Query keys format: `['resource', { filters }]` array (e.g., `['expenses', { categoryId }]`)
- ✅ Stale time: 5 minutes for most data, 1 minute for critical data
- ✅ Cache time: 10 minutes default
- ✅ Optimistic updates: Snapshot previous data in `onMutate`, rollback in `onError`
- ✅ Use `isLoading` for initial fetch, `isFetching` for background refetch
- ✅ Handle loading states: `if (isLoading) return <CircularProgress />`
- ✅ Handle error states: `if (isError) return <Alert severity="error">{error.message}</Alert>`

**Component Organization:**
- ✅ Feature-based structure: `features/expenses/components/`, NOT `components/expenses/`
- ✅ Colocate tests: `ExpenseForm.test.tsx` next to `ExpenseForm.tsx`
- ✅ Component max size: 250 lines - split into smaller components if larger
- ✅ Shared components: Pure presentational only (Button, Card) - no API calls or business logic
- ✅ Feature exports: Use `features/expenses/index.ts` to export public API

**State Management Rules:**
- ✅ Server state: TanStack Query ONLY - no Redux, no Context API for server data
- ✅ UI state: React Context for theme, toast notifications (non-server state only)
- ✅ Form state: React Hook Form + Zod validation - no manual useState for forms
- ✅ Local component state: useState for UI-only state (modals, toggles)
- ✅ No global state libraries (Redux, Zustand) - architecture uses TanStack Query + Context

**Material-UI Patterns:**
- ✅ Use `sx` prop for styling: `sx={{ padding: 2 }}` NOT inline styles or styled-components
- ✅ Always use theme tokens: `theme.palette.primary.main`, NEVER hardcoded colors like `#1976d2`
- ✅ Responsive design: `theme.breakpoints.down('sm')` for mobile, `up('md')` for desktop
- ✅ Typography component: Use `<Typography variant="h1">` NOT raw `<h1>` tags
- ✅ Spacing: Use theme spacing `sx={{ mt: 2, p: 3 }}` (1 unit = 8px)
- ✅ Icons: Import from `@mui/icons-material`, use consistent size prop

**Performance Optimization:**
- ✅ Code splitting: Lazy load routes with `const Page = React.lazy(() => import('./Page'))`
- ✅ Wrap lazy components in `<Suspense fallback={<CircularProgress />}>`
- ✅ Memo expensive components: `React.memo(ExpensiveComponent)` only when profiled
- ✅ Query staleTime: Set appropriate values (5min for expenses, 1min for budgets)
- ✅ List keys: Always use stable IDs (`expense.id`), NEVER array index
- ✅ Debounce search inputs: Use `useDebounce` hook for search/filter fields

**React Router Patterns:**
- ✅ Protected routes: Wrap with `<ProtectedRoute>` component that checks auth
- ✅ Use `useNavigate()` hook for navigation, NOT `<Navigate>` component
- ✅ Route params: Access with `useParams()` hook
- ✅ 404 handling: Catch-all route `path="*"` renders `<NotFoundPage />`
- ✅ No router loaders: Use TanStack Query in components instead

**Critical Anti-Patterns to AVOID:**
- ❌ NEVER use useState for server data - use TanStack Query
- ❌ NEVER use useEffect for data fetching - use useQuery
- ❌ NEVER forget to handle loading and error states in queries
- ❌ NEVER use array index as key in lists - use stable IDs
- ❌ NEVER hardcode colors - use theme tokens
- ❌ NEVER use inline styles - use sx prop or styled components
- ❌ NEVER mutate TanStack Query cache directly - use setQueryData/invalidateQueries

### API & Backend Rules (.NET Core + EF Core + PostgreSQL)

**API Response Format (CRITICAL - NEVER DEVIATE):**
- ✅ ALL endpoints return `ApiResponse<T>` wrapper: `{ data: T, success: bool }`
- ✅ Success response: `{ "data": { expense object }, "success": true }`
- ✅ Error response: `{ "data": { "message": "Error", "code": "ERROR_CODE" }, "success": false }`
- ✅ Implement as: `ApiResponse<Expense>.SuccessResult(expense)` or `ApiResponse<ErrorDto>.ErrorResult(msg, code)`
- ❌ NEVER return raw objects without wrapper
- ❌ NEVER use different response formats (consistency is critical)

**Naming Conventions (CRITICAL):**
- ✅ Database tables: `snake_case` plural (`users`, `expenses`, `categories`, `budgets`, `goals`)
- ✅ Database columns: `snake_case` (`user_id`, `created_at`, `email_address`, `password_hash`)
- ✅ Primary keys: `{table_singular}_id` pattern (`user_id`, `expense_id`, `category_id`)
- ✅ Foreign keys: Reference table name (`user_id` in expenses table)
- ✅ C# Entities: `PascalCase` properties (`UserId`, `CreatedAt`, `EmailAddress`)
- ✅ C# Controllers: `PascalCase` plural (`ExpensesController`, `UsersController`)
- ✅ API routes: lowercase plural (`/api/expenses`, `/api/budgets`)
- ✅ Route parameters: `camelCase` (`/api/expenses/{expenseId}`)

**Date/Time Handling (CRITICAL - AVOID TIMEZONE BUGS):**
- ✅ Always use ISO 8601 UTC format: `"2026-01-15T10:30:00Z"` (note the Z suffix)
- ✅ Database: Store as `TIMESTAMPTZ` type in PostgreSQL
- ✅ Backend: Use `DateTime.UtcNow` ALWAYS - NEVER `DateTime.Now`
- ✅ Entity properties: `public DateTime CreatedAt { get; set; }` (stored as UTC)
- ✅ API serialization: Automatic with System.Text.Json (adds Z suffix)
- ❌ NEVER use Unix timestamps (milliseconds since epoch)
- ❌ NEVER use local time - always UTC
- ❌ NEVER use date-only strings like "2026-01-15" - include time and Z

**Authentication & Security (CRITICAL):**
- ✅ JWT access tokens: Short-lived (15 minutes), stored in memory on frontend
- ✅ Refresh tokens: Long-lived (7 days), stored in httpOnly cookie
- ✅ Password hashing: `BCrypt.Net.HashPassword(password, workFactor: 12)` - NEVER lower work factor
- ✅ User data isolation: ALL queries must filter by authenticated `user_id`
- ✅ Authorization: Add `[Authorize]` attribute to all protected endpoints
- ✅ Token validation: JWT middleware validates on every request
- ❌ NEVER expose `password_hash` in API responses or logs
- ❌ NEVER store passwords in plaintext or use weak hashing (MD5, SHA1)
- ❌ NEVER skip user_id filtering - leads to data leaks

**Controller Layer (Keep Thin):**
- ✅ Responsibilities: Input validation → Call service → Format response → Return
- ✅ Use FluentValidation for DTO validation
- ✅ HTTP status codes: 200 OK (GET/PUT/DELETE), 201 Created (POST), 400 Bad Request (validation), 401 Unauthorized (no auth), 404 Not Found
- ✅ Return ActionResult types: `ActionResult<ApiResponse<Expense>>`
- ❌ NO business logic in controllers - move to service layer
- ❌ NO database access in controllers - use repositories via services

**Service Layer (Business Logic):**
- ✅ All business logic and domain rules live here
- ✅ Orchestrate multiple repository calls
- ✅ Implement transaction management for multi-table operations
- ✅ Return domain entities, not DTOs (controllers map to DTOs)
- ✅ Inject repositories via constructor dependency injection
- ❌ Services don't call other services directly - use repositories

**Repository Layer (Data Access Only):**
- ✅ Responsibilities: CRUD operations, queries, EF Core interaction ONLY
- ✅ Use async methods: `ToListAsync()`, `FirstOrDefaultAsync()`, `SaveChangesAsync()`
- ✅ User isolation: Add `.Where(e => e.UserId == userId)` to ALL user data queries
- ✅ Use LINQ for queries, avoid raw SQL unless performance-critical
- ✅ Implement interface (e.g., `IExpenseRepository`) for testability
- ❌ NO business logic in repositories
- ❌ NO validation in repositories - handle in service layer

**Entity Framework Core Patterns:**
- ✅ Code-First approach: Define entities, generate migrations
- ✅ Fluent API for configuration in `DbContext.OnModelCreating()`
- ✅ Create migration: `dotnet ef migrations add MigrationName`
- ✅ Apply migration: `dotnet ef database update`
- ✅ Use indexes for foreign keys and frequently queried columns
- ✅ Configure relationships: `.HasOne()`, `.WithMany()`, `.HasForeignKey()`
- ❌ NEVER edit generated migration files manually - regenerate if wrong
- ❌ NEVER use database-first or model-first approaches

**Database Schema Rules:**
- ✅ All tables have UUID primary keys: `user_id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- ✅ All tables have `created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`
- ✅ Update timestamps: `updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`
- ✅ Soft deletes: Add `deleted_at TIMESTAMPTZ` column (nullable)
- ✅ Foreign keys enforced: `user_id UUID NOT NULL REFERENCES users(user_id)`
- ✅ Indexes on foreign keys and commonly filtered columns

**Error Handling:**
- ✅ Global exception middleware: Catches all unhandled exceptions
- ✅ Custom exceptions: `NotFoundException`, `ValidationException`, `UnauthorizedException`
- ✅ Map exceptions to HTTP status codes in middleware
- ✅ Return standardized error response: `ApiResponse<ErrorDto>.ErrorResult(message, code)`
- ✅ Log errors with sufficient context
- ❌ NEVER expose stack traces or internal errors to clients
- ❌ NEVER return 500 errors without catching and logging

**Critical Anti-Patterns to AVOID:**
- ❌ NEVER return raw objects - always use ApiResponse<T> wrapper
- ❌ NEVER use DateTime.Now - always use DateTime.UtcNow
- ❌ NEVER skip user_id filtering - causes data leaks between users
- ❌ NEVER put business logic in controllers or repositories
- ❌ NEVER expose password_hash in any API response
- ❌ NEVER use weak password hashing (MD5, SHA1, plain SHA256)
- ❌ NEVER edit generated EF Core migrations manually

### Testing Rules (Frontend: Vitest + Backend: xUnit)

**Frontend Testing (Vitest + React Testing Library):**

**Test Organization:**
- ✅ Colocate tests: `ExpenseForm.test.tsx` next to `ExpenseForm.tsx` in same directory
- ✅ Test file naming: `{Component}.test.tsx` pattern (NOT `.spec.tsx`)
- ✅ Test structure: Arrange → Act → Assert (AAA pattern)
- ✅ Use `describe` blocks to group related tests
- ✅ Test naming: "should [expected behavior] when [condition]"
- ✅ Example: `it('should show error when amount is negative', ...)`

**Component Testing Patterns:**
- ✅ Always render with required providers: `<QueryClientProvider><ThemeProvider><Component /></ThemeProvider></QueryClientProvider>`
- ✅ Create test queryClient with `{ defaultOptions: { queries: { retry: false } } }`
- ✅ Use `screen.getByRole()` preferred over getByTestId
- ✅ Use `screen.getByLabelText()` for form inputs
- ✅ User interactions: `fireEvent.click()` or `userEvent.click()` from @testing-library/user-event
- ✅ Async assertions: Use `waitFor(() => expect(...).toBeInTheDocument())`
- ✅ Query for elements: `screen.queryBy*()` for elements that might not exist

**TanStack Query Testing:**
- ✅ Mock API calls with MSW (Mock Service Worker) or axios mock
- ✅ Test loading state: Check for loading spinner initially
- ✅ Test success state: Mock API response, verify data rendered
- ✅ Test error state: Mock API error, verify error message displayed
- ✅ Test optimistic updates: Verify UI updates before API completes

**Custom Hook Testing:**
- ✅ Use `renderHook` from @testing-library/react
- ✅ Wrap in providers: `{ wrapper: ({ children }) => <QueryClientProvider>{children}</QueryClientProvider> }`
- ✅ Access hook values: `result.current.isLoading`, `result.current.data`
- ✅ Test hook updates: Use `waitFor(() => expect(result.current.data).toBeDefined())`

**Backend Testing (xUnit + Moq):**

**Unit Tests (Services):**
- ✅ Test naming: `MethodName_Scenario_ExpectedBehavior`
- ✅ Example: `CreateExpense_ValidData_ReturnsExpense`
- ✅ Arrange-Act-Assert: Clear sections in test method
- ✅ Mock repositories: `var mockRepo = new Mock<IExpenseRepository>();`
- ✅ Setup mocks: `mockRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(expense);`
- ✅ Verify calls: `mockRepo.Verify(r => r.AddAsync(It.IsAny<Expense>()), Times.Once);`
- ✅ Assert results: `Assert.NotNull(result); Assert.Equal(expected, result.Amount);`

**Integration Tests (Controllers):**
- ✅ Use WebApplicationFactory for full HTTP pipeline testing
- ✅ Use in-memory database or test database
- ✅ Test full request/response cycle
- ✅ Include auth headers: `client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);`
- ✅ Test status codes and response format
- ✅ Verify database state after operations

**Repository Tests:**
- ✅ Use in-memory database: `UseInMemoryDatabase("TestDb")`
- ✅ Seed test data in arrange phase
- ✅ Test CRUD operations
- ✅ Verify user_id filtering works correctly

**Coverage Requirements:**
- ✅ Critical business logic: 80%+ coverage
- ✅ Happy path: Always test successful scenarios first
- ✅ Error cases: Test validation errors, not found, unauthorized
- ✅ Edge cases: Null inputs, empty lists, boundary values (negative amounts, dates)
- ✅ Run coverage: `npm run test:coverage` (frontend), `dotnet test --collect:"XPlat Code Coverage"` (backend)

**Test Data Patterns:**
- ✅ Use factories or builders for test data
- ✅ Example: `CreateTestExpense(amount: 50000, userId: testUserId)`
- ✅ Use realistic data, not "test" or "foo"
- ✅ Clean up test data after each test (integration tests)

**Critical Anti-Patterns to AVOID:**
- ❌ NEVER use `getByTestId` as first choice - use semantic queries
- ❌ NEVER test implementation details - test user-visible behavior
- ❌ NEVER use `waitFor` with fixed delays - use condition checking
- ❌ NEVER skip error case testing - always test failure paths
- ❌ NEVER share state between tests - each test must be independent

### Critical Don't-Miss Rules (Offline, Security, Performance)

**Offline & PWA Patterns (CRITICAL - Often Forgotten):**
- ✅ IndexedDB queue: Store ALL mutations when offline using `offlineQueue.ts` utility
- ✅ Last-Write-Wins conflict resolution: Include `clientTimestamp` in all mutations
- ✅ Service Worker: Cache static assets with Workbox, use NetworkFirst for API calls
- ✅ Online detection: `window.addEventListener('online', () => syncOfflineQueue())`
- ✅ Optimistic UI: ALWAYS show success immediately, rollback on error in `onError` callback
- ✅ Sync on reconnect: Automatically process offline queue when connection restored
- ✅ PWA manifest: Include all icon sizes (72, 96, 128, 144, 192, 384, 512)
- ✅ Install prompt: Detect `beforeinstallprompt` event for install button
- ❌ NEVER assume online - always check `navigator.onLine` before API calls
- ❌ NEVER lose data - queue mutations if offline

**Security Rules (CRITICAL - Security Vulnerabilities):**
- ✅ NEVER log sensitive data: No passwords, tokens, email addresses, or PII in console.log() or server logs
- ✅ CORS configuration: Whitelist specific frontend origin (`https://yourdomain.com`), NEVER use wildcard `*`
- ✅ Input validation: Validate ALL inputs on BOTH frontend (Zod) AND backend (FluentValidation)
- ✅ SQL injection: Use parameterized queries only (EF Core handles this automatically)
- ✅ XSS prevention: React escapes by default, but NEVER use `dangerouslySetInnerHTML` with user input
- ✅ HTTPS only: All production traffic MUST be HTTPS, redirect HTTP to HTTPS
- ✅ JWT secret: Use strong random secret (256-bit), store in environment variable NEVER in code
- ✅ Rate limiting: Rely on hosting platform rate limiting (Vercel/Railway provide this)
- ✅ httpOnly cookies: Refresh tokens MUST use `httpOnly: true, secure: true, sameSite: 'strict'`
- ❌ NEVER expose internal error details to frontend - use generic messages
- ❌ NEVER commit secrets to git - use .env files and .gitignore
- ❌ NEVER trust client input - always validate server-side

**Performance Rules (CRITICAL - User Experience):**
- ✅ Lazy load routes: `const ExpensesPage = React.lazy(() => import('./ExpensesPage'))`
- ✅ Code splitting: Vite handles this automatically by route, ensure dynamic imports used
- ✅ Image optimization: Use WebP format, lazy load with `loading="lazy"` attribute
- ✅ Database indexes: Index ALL foreign keys (`user_id`) and frequently queried columns (`date`, `created_at`)
- ✅ Query optimization: Use `.Select()` in EF Core to return only needed columns
- ✅ Debounce search: 300ms delay for search/filter inputs using `useDebounce` hook
- ✅ TanStack Query staleTime: Set to 5 minutes for most data to reduce refetches
- ✅ Pagination: Implement for lists over 100 items (not needed for MVP but plan for it)
- ✅ Memoization: Use `React.memo()` only for expensive components identified by profiling
- ❌ NEVER fetch all data at once - use pagination or infinite scroll
- ❌ NEVER use setTimeout for loading states - use proper async handling
- ❌ NEVER block the main thread with heavy computations - use Web Workers if needed

**Form Handling Rules (CRITICAL - Data Integrity):**
- ✅ React Hook Form + Zod: ALWAYS use for all forms, NEVER manual useState for form state
- ✅ Validation mode: Use `mode: 'onBlur'` or `mode: 'onSubmit'`, NOT `onChange` (too aggressive)
- ✅ Error display: Show field errors with Material-UI `helperText` prop
- ✅ Disable submit: `disabled={isSubmitting || mutation.isPending}` prevents double submission
- ✅ Reset after success: Call `reset()` after successful form submission
- ✅ Default values: Always provide defaultValues in useForm for controlled inputs
- ✅ Schema validation: Zod schema validates types AND business rules (positive amounts, etc.)
- ❌ NEVER use uncontrolled inputs - always controlled with React Hook Form
- ❌ NEVER validate on every keystroke - degrades UX
- ❌ NEVER allow form submission without validation

**Error Handling Rules (CRITICAL - User Experience):**
- ✅ Global ErrorBoundary: Wrap entire app in `<ErrorBoundary>` component
- ✅ Toast notifications: Use `toast.error(message)` for all user-facing errors
- ✅ Automatic retry: TanStack Query retries failed requests 3 times with exponential backoff
- ✅ Meaningful error messages: "Failed to save expense" NOT "Error 500" or "Something went wrong"
- ✅ Backend error logging: Log ALL errors with context (user_id, request details, stack trace)
- ✅ Error codes: Use specific error codes ("EXPENSE_NOT_FOUND", "BUDGET_EXCEEDED") for client handling
- ✅ Fallback UI: Show retry button, not just error message
- ❌ NEVER show stack traces to users - log server-side only
- ❌ NEVER silently catch errors without user notification
- ❌ NEVER use generic error messages - be specific about what failed

**Date Handling Edge Cases (CRITICAL - Common Bug Source):**
- ✅ Timezone consistency: ALWAYS use UTC everywhere, convert to local only for display
- ✅ Date comparison: Use `date-fns` comparison functions, not direct string/number comparison
- ✅ Month boundaries: Test expense queries at month start/end dates
- ✅ Budget month: Store as first day of month (YYYY-MM-01) for consistent querying
- ✅ Goal deadlines: Compare dates at midnight UTC to avoid timezone issues
- ❌ NEVER use JavaScript Date constructor with string - use `parseISO()` from date-fns
- ❌ NEVER compare dates with `>` operator on strings - parse first
- ❌ NEVER forget timezone when filtering by date range

**User Data Isolation (CRITICAL - Data Leak Prevention):**
- ✅ EVERY database query MUST filter by `user_id` from authenticated JWT token
- ✅ Extract user_id: `var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value`
- ✅ Repository pattern: All repository methods take `userId` parameter
- ✅ Test isolation: Write tests that verify users can't access other users' data
- ❌ NEVER trust client-provided user_id - always use authenticated token
- ❌ NEVER write queries without WHERE user_id = clause
- ❌ NEVER skip authorization checks in controllers

---

## Implementation Checklist for AI Agents

Before considering ANY file/feature complete, verify:

- [ ] TypeScript strict mode enabled, no `any` types without justification comment
- [ ] All API responses use `ApiResponse<T>` wrapper format
- [ ] All dates are ISO 8601 UTC strings with Z suffix
- [ ] All database queries filter by authenticated `user_id`
- [ ] Error handling implemented (try-catch, error boundaries, toasts)
- [ ] Loading states handled with proper UI feedback
- [ ] Offline behavior considered (queue if mutation, cache if query)
- [ ] Tests colocated with implementation and passing
- [ ] No console.log in production code
- [ ] No sensitive data logged or exposed
- [ ] Form validation with React Hook Form + Zod
- [ ] Material-UI theme tokens used, no hardcoded colors
- [ ] TanStack Query used for all server state
- [ ] Component follows feature-based structure
- [ ] Named exports used (no default exports)

---

## Quick Reference

**Most Common Mistakes to Avoid:**
1. Using `any` type in TypeScript
2. Returning raw objects without `ApiResponse<T>` wrapper
3. Using `DateTime.Now` instead of `DateTime.UtcNow`
4. Forgetting `user_id` filter in database queries
5. Not handling loading/error states in queries
6. Using useState for server data instead of TanStack Query
7. Hardcoding colors instead of theme tokens
8. Not implementing offline queue for mutations
9. Exposing sensitive data in logs or API responses
10. Not colocating tests with implementation

**When In Doubt:**
- Refer to architecture document at `_bmad-output/planning-artifacts/architecture.md`
- Check implementation patterns section for code examples
- Follow existing code patterns in the feature you're working on
- Ask for clarification rather than making assumptions

---

**Document Status:** ✅ COMPLETE AND READY FOR AI AGENT USE

**Last Updated:** 2026-01-15

**Maintenance:** Update this document when new patterns emerge or critical issues are discovered during implementation.

