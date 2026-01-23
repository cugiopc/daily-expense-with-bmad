---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: 
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
workflowStatus: 'completed'
completedDate: '2026-01-15'
---

# simple-todo-app - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for simple-todo-app, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**FR1:** User can add a new expense with amount and optional note
**FR2:** User can specify the date for an expense (defaults to today)
**FR3:** User can view a list of all expenses grouped by day
**FR4:** User can view a list of expenses for the current month
**FR5:** User can edit an existing expense (amount, note, date)
**FR6:** User can delete an expense
**FR7:** User can see today's total spending in real-time
**FR8:** User can see current month's total spending in real-time
**FR9:** System can automatically focus on amount input field when add expense screen opens
**FR10:** System can display optimistic UI updates (show success immediately before server confirmation)

**FR11:** User can set a monthly budget amount
**FR12:** User can view remaining budget for current month
**FR13:** User can see budget progress visualization (progress bar or chart)
**FR14:** System can calculate and display daily spending average
**FR15:** System can project month-end spending based on current pace
**FR16:** System can alert user when spending reaches 80% of budget
**FR17:** System can alert user when spending exceeds budget
**FR18:** User can view budget status before making purchase decisions

**FR19:** User can set a savings goal with target amount and deadline
**FR20:** User can manually input current savings amount
**FR21:** System can calculate required monthly savings to reach goal
**FR22:** User can view savings goal progress (percentage complete)
**FR23:** User can see estimated completion date based on current savings rate
**FR24:** System can display status indicator (on track / behind / ahead)
**FR25:** System can celebrate milestone achievements (25%, 50%, 75%, 100%)
**FR26:** User can update savings goal target or deadline

**FR27:** System can automatically detect spending categories from expense notes
**FR28:** User can view spending breakdown by detected categories
**FR29:** User can view spending percentage distribution across categories
**FR30:** User can view week-over-week spending trends
**FR31:** User can view month-over-month spending comparisons
**FR32:** System can identify high-spending categories and patterns
**FR33:** User can view summary statistics (average daily spending, total by period)

**FR34:** System can persist all expense data reliably
**FR35:** System can sync data between offline and online states
**FR36:** System can ensure zero data loss during offline-to-online sync
**FR37:** User can access full functionality without internet connection
**FR38:** System can store data locally when offline (IndexedDB)
**FR39:** System can automatically sync when connection is restored
**FR40:** User data is isolated and secured (single-user MVP)

**FR41:** User can log into the application with credentials
**FR42:** System can authenticate user sessions securely (JWT)
**FR43:** User can maintain logged-in state across sessions
**FR44:** System can enforce HTTPS-only communication

**FR45:** User can install app to device home screen (Add to Home Screen)
**FR46:** App can launch instantly like a native application
**FR47:** System can cache static assets for fast repeat visits
**FR48:** User can access app icon from home screen with one tap
**FR49:** App can function fully in offline mode
**FR50:** System can provide fast load times (<2 seconds on 4G)

**FR51:** System can provide user-friendly error messages
**FR52:** System can display helpful guidance when no data exists (empty states)
**FR53:** System can show loading indicators during data operations
**FR54:** System can support keyboard navigation for accessibility
**FR55:** App interface can adapt to different screen sizes (responsive design)

### Non-Functional Requirements

**NFR1:** App initial load time must be <2 seconds on 4G connection
**NFR2:** Expense entry response must be <500ms for optimistic UI update
**NFR3:** Cached repeat visit must load in <1 second
**NFR4:** API GET requests must respond in <200ms
**NFR5:** API POST requests must complete in <100ms for database save
**NFR6:** Database queries must execute in <50ms for daily/monthly aggregations

**NFR7:** System uptime must be 99%+ availability
**NFR8:** Zero data loss during offline→online sync is required
**NFR9:** 100% of offline entries must sync successfully within 30 seconds of reconnection
**NFR10:** System must provide graceful degradation when backend is unavailable

**NFR11:** Authentication must use JWT with 7-day expiry
**NFR12:** Passwords must be minimum 8 characters for MVP
**NFR13:** All API communication must be over HTTPS/TLS
**NFR14:** System must use secure httpOnly cookies for refresh tokens
**NFR15:** User data must be private with no third-party sharing

**NFR16:** Primary browser support: iOS Safari (latest 2 versions)
**NFR17:** Secondary browser support: Chrome/Edge on desktop for testing
**NFR18:** PWA must support Add to Home Screen on iOS/Android
**NFR19:** Service Worker must cache static assets with <1s reload
**NFR20:** App must be fully functional offline

**NFR21:** Core expense CRUD operations must be covered by integration tests
**NFR22:** Production must have basic error logging
**NFR23:** Deployment must support one-command deploy with rollback capability
**NFR24:** Code must use TypeScript for type safety
**NFR25:** Bundle size must be optimized through code splitting and tree-shaking

**NFR26:** Expense entry target speed is 5-7 seconds (acceptable: <10 seconds)
**NFR27:** Touch targets must be minimum 44x44pt (Apple guidelines)
**NFR28:** Design must be mobile-first and responsive
**NFR29:** Interface must support one-handed thumb-friendly operation
**NFR30:** App must support keyboard navigation for accessibility

### Additional Requirements

#### Architecture Requirements

**ARCH1:** Project initialization using Vite + React + TypeScript starter template
- Command: `npm create vite@latest daily-expenses-web -- --template react-ts`
- This establishes the frontend foundation for the application

**ARCH2:** Backend initialization using .NET Core 10 Web API template
- Command: `dotnet new webapi -n DailyExpenses.Api --framework net10.0`
- Additional packages: Npgsql.EntityFrameworkCore.PostgreSQL, Microsoft.AspNetCore.Authentication.JwtBearer

**ARCH3:** Database schema must use PostgreSQL with proper indexing
- Tables: users, expenses, budgets, goals
- Composite indexes on (user_id, date) for fast queries
- UUID primary keys for global uniqueness

**ARCH4:** Entity Framework Core Code-First Migrations for database management
- C# models as source of truth
- Version controlled schema changes
- Rollback capability

**ARCH5:** Offline sync strategy using Last-Write-Wins with client timestamps
- IndexedDB for local persistence
- Sync queue for pending entries
- Batch sync endpoint: POST /api/expenses/sync

**ARCH6:** JWT authentication with access token in memory + refresh token in httpOnly cookie
- Access token: 1 hour expiry, stored in React state
- Refresh token: 7 days expiry, httpOnly cookie
- Token refresh flow on 401 responses

**ARCH7:** Password hashing using BCrypt with work factor 12
- Built-in salt generation
- Adaptive security (can increase work factor later)

**ARCH8:** Client-side caching using TanStack Query only (no server-side cache for MVP)
- StaleTime: 5 minutes
- CacheTime: 10 minutes
- RefetchOnWindowFocus and RefetchOnReconnect enabled

**ARCH9:** CORS configuration for frontend-backend communication
- Allow origins: localhost:5173 (dev) and production frontend URL
- AllowCredentials: true (for cookies)

**ARCH10:** PWA implementation using vite-plugin-pwa with Workbox
- Service Worker for offline functionality
- Asset caching strategy
- Background sync when possible

#### UX Design Requirements

**UX1:** Material-UI (MUI) component library for UI components
- Pre-built accessible components
- Customizable theming system
- Mobile-optimized touch targets

**UX2:** Bottom Tab Navigation for main sections
- Tab 1: Quick Add (home, default)
- Tab 2: History/List
- Tab 3: Stats/Insights
- Tab 4: Settings

**UX3:** Floating Action Button (FAB) for primary "Add Expense" action
- Position: Bottom-right (thumb reach zone)
- Always visible and accessible
- Material Design pattern

**UX4:** Optimistic UI pattern for instant feedback
- Show changes immediately
- Sync in background
- Rollback on failure with error message

**UX5:** Auto-focus amount input field when Add Expense screen opens
- Number keyboard auto-shows
- Zero tap to start entry
- Critical for 5-7 second entry goal

**UX6:** Smart suggestions for recent notes
- Display top 3-5 most recent expense notes as chips
- Above keyboard for quick selection
- Speeds up repeat entries

**UX7:** Color-coded budget status indicators
- Green: <80% of budget used
- Yellow/Orange: 80-100% of budget used
- Orange/Red: >100% over budget

**UX8:** Progress visualization for savings goal
- Linear progress bar for budget (concrete, finite)
- Circular or prominent bar for 300M goal
- Percentage and amount displayed

**UX9:** Swipe actions for expense list management
- Swipe left: Delete expense
- Tap: Edit expense
- iOS Mail pattern

**UX10:** Non-intrusive alert system for budget warnings
- Snackbar (bottom banner) for alerts
- Auto-dismiss after 5-7 seconds
- Friendly, helpful tone (not alarming)

**UX11:** Milestone celebrations for goal progress
- 25%: "Quarter of the way there!"
- 50%: "Halfway to your wedding goal!"
- 75%: "Almost there! Final push!"
- 100%: "Goal achieved! Time to celebrate!"
- Confetti or subtle animation

**UX12:** Empty states with helpful guidance
- No expenses: "Add your first expense to start tracking"
- No budget set: "Set a monthly budget to track progress"
- Clear call-to-action buttons

**UX13:** Loading states using skeleton screens
- Avoid spinners where possible
- Skeleton placeholder for list items
- Progressive loading for better perceived performance

**UX14:** Responsive mobile-first design
- Breakpoints: Mobile (<600px), Tablet (600-960px), Desktop (>960px)
- Touch-friendly on mobile, mouse-friendly on desktop
- One-handed operation priority on mobile

**UX15:** Theme customization for brand identity
- Primary color: Calm blue (#2196F3) for trust/finance
- Secondary color: Green (#4CAF50) for success/savings
- Warning: Orange (#FF9800) for budget warnings
- Error: Red (#F44336) for over budget

### FR Coverage Map

**Epic 1: Project Foundation & Authentication**
- FR41: User can log into the application with credentials
- FR42: System can authenticate user sessions securely (JWT)
- FR43: User can maintain logged-in state across sessions
- FR44: System can enforce HTTPS-only communication

**Epic 2: Ultra-Fast Expense Tracking**
- FR1: User can add a new expense with amount and optional note
- FR2: User can specify the date for an expense (defaults to today)
- FR3: User can view a list of all expenses grouped by day
- FR4: User can view a list of expenses for the current month
- FR5: User can edit an existing expense (amount, note, date)
- FR6: User can delete an expense
- FR7: User can see today's total spending in real-time
- FR8: User can see current month's total spending in real-time
- FR9: System can automatically focus on amount input field when add expense screen opens
- FR10: System can display optimistic UI updates (show success immediately before server confirmation)
- FR34: System can persist all expense data reliably
- FR35: System can sync data between offline and online states
- FR36: System can ensure zero data loss during offline-to-online sync
- FR37: User can access full functionality without internet connection
- FR38: System can store data locally when offline (IndexedDB)
- FR39: System can automatically sync when connection is restored
- FR40: User data is isolated and secured (single-user MVP)

**Epic 3: Budget Management & Alerts**
- FR11: User can set a monthly budget amount
- FR12: User can view remaining budget for current month
- FR13: User can see budget progress visualization (progress bar or chart)
- FR14: System can calculate and display daily spending average
- FR15: System can project month-end spending based on current pace
- FR16: System can alert user when spending reaches 80% of budget
- FR17: System can alert user when spending exceeds budget
- FR18: User can view budget status before making purchase decisions

**Epic 4: Savings Goal Tracking**
- FR19: User can set a savings goal with target amount and deadline
- FR20: User can manually input current savings amount
- FR21: System can calculate required monthly savings to reach goal
- FR22: User can view savings goal progress (percentage complete)
- FR23: User can see estimated completion date based on current savings rate
- FR24: System can display status indicator (on track / behind / ahead)
- FR25: System can celebrate milestone achievements (25%, 50%, 75%, 100%)
- FR26: User can update savings goal target or deadline

**Epic 5: Spending Analytics & Insights**
- FR27: System can automatically detect spending categories from expense notes
- FR28: User can view spending breakdown by detected categories
- FR29: User can view spending percentage distribution across categories
- FR30: User can view week-over-week spending trends
- FR31: User can view month-over-month spending comparisons
- FR32: System can identify high-spending categories and patterns
- FR33: User can view summary statistics (average daily spending, total by period)

**Epic 6: Progressive Web App Experience**
- FR45: User can install app to device home screen (Add to Home Screen)
- FR46: App can launch instantly like a native application
- FR47: System can cache static assets for fast repeat visits
- FR48: User can access app icon from home screen with one tap
- FR49: App can function fully in offline mode
- FR50: System can provide fast load times (<2 seconds on 4G)
- FR51: System can provide user-friendly error messages
- FR52: System can display helpful guidance when no data exists (empty states)
- FR53: System can show loading indicators during data operations
- FR54: System can support keyboard navigation for accessibility
- FR55: App interface can adapt to different screen sizes (responsive design)

## Epic List

### Epic 1: Project Foundation & Authentication
Developers can initialize the application infrastructure and users can securely register/login to access their personal expense tracking.

**User Outcome:** Project is set up with frontend and backend, database schema is created, and users can create accounts and log in securely with authentication persisting across sessions.

**FRs covered:** FR41, FR42, FR43, FR44

**Additional Requirements:** ARCH1, ARCH2, ARCH3, ARCH4, ARCH6, ARCH7, ARCH9

**Technical Notes:**
- Vite + React + TypeScript initialization
- .NET Web API initialization
- PostgreSQL database setup with EF Core migrations
- JWT authentication with BCrypt password hashing
- CORS configuration

---

### Epic 2: Ultra-Fast Expense Tracking
Users can add, view, edit, and delete expenses with ultra-fast entry workflow (<10 seconds per entry), with data persisting reliably even offline.

**User Outcome:** Users can add expenses in 5-7 seconds (amount + note), view today's and month's expenses, edit or delete existing expenses, see real-time spending totals, and have everything work offline with automatic sync.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR34, FR35, FR36, FR37, FR38, FR39, FR40

**Additional Requirements:** ARCH5, ARCH8, UX3, UX4, UX5, UX6, UX9

**Technical Notes:**
- Auto-focus amount field with number keyboard
- Optimistic UI for instant feedback
- IndexedDB for offline storage
- Last-Write-Wins sync strategy
- TanStack Query for caching
- Material-UI components with FAB button
- Swipe actions for list management

---

### Epic 3: Budget Management & Alerts
Users can set monthly budgets, track spending against budget in real-time, and receive helpful alerts to prevent overspending.

**User Outcome:** Users can set monthly budget amounts, see remaining budget at all times, view budget progress visualization, receive alerts at 80% threshold and when over budget, and make informed purchase decisions.

**FRs covered:** FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18

**Additional Requirements:** UX7, UX10

**Technical Notes:**
- Linear progress bar for budget visualization
- Color-coded status (green/yellow/orange)
- Non-intrusive snackbar alerts
- Daily spending average calculation
- Month-end spending projection

---

### Epic 4: Savings Goal Tracking
Users can set long-term savings goals (e.g., 300M for marriage), track progress, and stay motivated with milestone celebrations.

**User Outcome:** Users can set savings goals with target amount and deadline, manually update current savings, see required monthly savings calculation, view progress percentage and status, celebrate milestones (25%, 50%, 75%, 100%), and know if on track, behind, or ahead.

**FRs covered:** FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26

**Additional Requirements:** UX8, UX11

**Technical Notes:**
- Prominent progress visualization
- Status indicators (on track/behind/ahead)
- Milestone celebration animations
- Estimated completion date calculation

---

### Epic 5: Spending Analytics & Insights
Users can understand their spending patterns through automatic categorization, breakdowns, and trend analysis.

**User Outcome:** Users can see spending breakdown by auto-detected categories, view percentage distribution, compare week-over-week and month-over-month spending, identify high-spending categories, and view summary statistics.

**FRs covered:** FR27, FR28, FR29, FR30, FR31, FR32, FR33

**Technical Notes:**
- AI category detection from free-text notes
- Visualization charts/graphs
- Pattern identification algorithms
- Trend analysis calculations

---

### Epic 6: Progressive Web App Experience
Users can install the app to their home screen, use it like a native app, and enjoy fast performance with full offline functionality.

**User Outcome:** Users can install app to device home screen, launch app instantly from home screen icon, use app fully offline, experience fast load times (<2 seconds), navigate with bottom tab bar, and enjoy mobile-optimized responsive design.

**FRs covered:** FR45, FR46, FR47, FR48, FR49, FR50, FR51, FR52, FR53, FR54, FR55

**Additional Requirements:** ARCH10, UX1, UX2, UX12, UX13, UX14, UX15, NFR1-NFR30

**Technical Notes:**
- vite-plugin-pwa with Workbox
- Service Worker for caching
- Material-UI theming and components
- Bottom Tab Navigation
- Empty states and loading states
- Responsive breakpoints
- Performance optimizations

---

## Epic 1: Project Foundation & Authentication

Developers can initialize the application infrastructure and users can securely register/login to access their personal expense tracking.

### Story 1.1: Initialize Frontend Project

As a developer,
I want to initialize the React frontend project with Vite and TypeScript,
So that I have a working development environment with proper tooling and dependencies.

**Acceptance Criteria:**

**Given** I have Node.js installed on my machine
**When** I run `npm create vite@latest daily-expenses-web -- --template react-ts`
**Then** a new React + TypeScript project is created with Vite configuration
**And** the project includes package.json with React 18 and TypeScript dependencies
**And** I can run `npm install` to install all dependencies successfully
**And** I can run `npm run dev` and the development server starts on localhost:5173
**And** Material-UI packages are installed (@mui/material, @emotion/react, @emotion/styled)
**And** TanStack Query is installed (@tanstack/react-query)
**And** React Router is installed (react-router-dom)
**And** PWA plugin is installed (vite-plugin-pwa, workbox-window)
**And** the project builds successfully with `npm run build`

### Story 1.2: Initialize Backend API Project

As a developer,
I want to initialize the .NET Core backend API with PostgreSQL support,
So that I have a working API foundation with database connectivity.

**Acceptance Criteria:**

**Given** I have .NET 10 SDK installed on my machine
**When** I run `dotnet new webapi -n DailyExpenses.Api --framework net10.0`
**Then** a new .NET Web API project is created with Program.cs and default structure
**And** I add Npgsql.EntityFrameworkCore.PostgreSQL package successfully
**And** I add Microsoft.EntityFrameworkCore.Design package for migrations
**And** I add Microsoft.AspNetCore.Authentication.JwtBearer package for JWT support
**And** I create AppDbContext class inheriting from DbContext
**And** I configure PostgreSQL connection string in appsettings.json
**And** I can run `dotnet build` and the project compiles without errors
**And** I can run `dotnet run` and the API starts on localhost:5000 (or configured port)
**And** Swagger UI is accessible at /swagger endpoint

### Story 1.3: User Registration with BCrypt Password Hashing

As a new user,
I want to register an account with email and password,
So that I can create a personal account to track my expenses.

**Acceptance Criteria:**

**Given** the database has a Users table with id, email, password_hash, created_at columns
**When** I send POST /api/auth/register with { "email": "user@example.com", "password": "SecurePass123" }
**Then** the system validates the email format is valid
**And** the system validates the password is at least 8 characters
**And** the system checks if the email already exists in the database
**And** if email exists, returns 409 Conflict with message "Email already registered"
**And** if email is new, the password is hashed using BCrypt with work factor 12
**And** a new User record is created with email and password_hash
**And** the system returns 201 Created with user id and email (no password in response)
**And** the password_hash in database is a valid BCrypt hash (starts with $2a$ or $2b$)
**And** BCrypt.Net-Next package is installed and used for hashing

### Story 1.4: User Login with JWT Authentication

As a registered user,
I want to log in with my email and password,
So that I can access my personal expense data securely.

**Acceptance Criteria:**

**Given** I have a registered account in the database
**When** I send POST /api/auth/login with { "email": "user@example.com", "password": "SecurePass123" }
**Then** the system retrieves the user by email from the database
**And** if user not found, returns 401 Unauthorized with message "Invalid credentials"
**And** the system verifies the password using BCrypt.Verify against stored password_hash
**And** if password is incorrect, returns 401 Unauthorized with message "Invalid credentials"
**And** if credentials are valid, generates a JWT access token with 1-hour expiry
**And** the access token payload includes { userId, email, exp }
**And** the system generates a JWT refresh token with 7-day expiry
**And** the refresh token is set as an httpOnly cookie with Secure and SameSite=Strict flags
**And** the response returns 200 OK with { "accessToken": "eyJ..." } in body
**And** CORS is configured to allow frontend origin (localhost:5173 and production URL)
**And** CORS allows credentials for cookie transmission

### Story 1.5: Token Refresh Mechanism

As a logged-in user,
I want my access token to be automatically refreshed when it expires,
So that I can stay logged in without re-entering credentials every hour.

**Acceptance Criteria:**

**Given** I have a valid refresh token stored in httpOnly cookie
**When** my access token expires (after 1 hour)
**And** I make an API request that returns 401 Unauthorized
**Then** the frontend automatically sends POST /api/auth/refresh with the refresh cookie
**And** the backend validates the refresh token from the cookie
**And** if refresh token is invalid or expired, returns 401 Unauthorized
**And** if refresh token is valid, generates a new access token with 1-hour expiry
**And** the response returns 200 OK with { "accessToken": "eyJ..." }
**And** the frontend stores the new access token in memory
**And** the frontend retries the original failed request with the new token
**And** if refresh fails, the user is redirected to login page

---

## Epic 2: Ultra-Fast Expense Tracking

Users can add, view, edit, and delete expenses with ultra-fast entry workflow (<10 seconds per entry), with data persisting reliably even offline.

### Story 2.1: Create Expense Entity and Database Table

As a developer,
I want to create the Expense entity and database table,
So that the system can store expense data persistently.

**Acceptance Criteria:**

**Given** Entity Framework Core is configured in the project
**When** I create an Expense model class with properties: Id (Guid), UserId (Guid), Amount (decimal), Note (string), Date (DateTime), CreatedAt (DateTime), UpdatedAt (DateTime)
**Then** the model includes a navigation property to User entity
**And** I configure the DbSet<Expense> in AppDbContext
**And** I create an index on (UserId, Date DESC) for fast queries
**And** I create an index on (UserId, CreatedAt DESC) for recent expenses
**And** I run `dotnet ef migrations add CreateExpensesTable`
**And** the migration creates expenses table with all columns and indexes
**And** I run `dotnet ef database update` successfully
**And** the table is created in PostgreSQL database
**And** I can insert a test expense record directly in the database

### Story 2.2: Add Expense API Endpoint with Validation

As a user,
I want to create a new expense via API,
So that my expense data is saved to the server.

**Acceptance Criteria:**

**Given** the Expenses table exists in the database
**When** I send POST /api/expenses with { "amount": 45000, "note": "cafe", "date": "2026-01-15" }
**Then** the system validates that amount is greater than 0
**And** if amount is invalid, returns 400 Bad Request with error message
**And** the system defaults date to today if not provided
**And** the system gets userId from JWT token claims
**And** a new Expense record is created with a generated Guid ID
**And** CreatedAt and UpdatedAt are set to current UTC timestamp
**And** the expense is saved to the database
**And** the response returns 201 Created with the complete expense object including ID
**And** the response includes Location header with /api/expenses/{id}
**And** the API requires authentication (401 if no valid token)

### Story 2.3: Get Expenses List API with Filtering

As a user,
I want to retrieve my expenses filtered by date range,
So that I can view my spending history.

**Acceptance Criteria:**

**Given** I have expenses saved in the database
**When** I send GET /api/expenses?startDate=2026-01-01&endDate=2026-01-31
**Then** the system retrieves only my expenses (filtered by userId from token)
**And** expenses are filtered by date range (inclusive)
**And** if no date range provided, defaults to current month
**And** results are ordered by date DESC, then createdAt DESC
**And** the response returns 200 OK with array of expense objects
**And** each expense includes id, amount, note, date, createdAt, updatedAt
**And** the query uses the (userId, date) index for performance
**And** response time is under 200ms for up to 1000 expenses
**And** the API requires authentication (401 if no valid token)

### Story 2.4: Add Expense Form with Auto-focus and FAB

As a user,
I want a fast expense entry form with auto-focus,
So that I can add expenses in 5-7 seconds.

**Acceptance Criteria:**

**Given** I am on the home screen of the app
**When** the Add Expense screen loads
**Then** the amount input field is automatically focused
**And** the number keyboard appears automatically on mobile
**And** the form has only 2 fields: Amount (required) and Note (optional)
**And** the Date field defaults to today and is hidden unless user wants to change it
**And** there is a Floating Action Button (FAB) in bottom-right for quick access
**And** the FAB uses Material-UI Fab component with "+" icon
**And** tapping FAB opens the Add Expense form
**And** pressing Tab moves focus from Amount to Note field
**And** the form has a prominent "Add Expense" button
**And** pressing Enter key in Note field submits the form
**And** the form validates amount is a positive number before submission

### Story 2.5: Optimistic UI for Instant Expense Entry

As a user,
I want to see my expense appear immediately after submission,
So that I get instant feedback without waiting for server response.

**Acceptance Criteria:**

**Given** I am on the Add Expense form
**When** I submit a new expense with amount 45000 and note "cafe"
**Then** the expense appears in the expense list immediately (optimistic update)
**And** a temporary ID is assigned to the expense locally
**And** the today's total updates immediately to include the new expense
**And** the form is cleared and ready for next entry
**And** a success message appears briefly (e.g., "Expense added!")
**And** the API request is sent in the background
**And** when API responds successfully, the temporary ID is replaced with server ID
**And** if API fails, the optimistic entry is removed and error message shown
**And** user can add another expense immediately without waiting
**And** the entire flow from submit to ready-for-next-entry takes <500ms perceived time

### Story 2.6: Display Today's and Monthly Totals

As a user,
I want to see today's total and monthly total spending,
So that I know how much I've spent at a glance.

**Acceptance Criteria:**

**Given** I have expenses saved for the current day and month
**When** I view the home screen
**Then** today's total is displayed prominently at the top (e.g., "Today: 125,000đ")
**And** the monthly total is displayed below (e.g., "This Month: 3,450,000đ")
**And** totals update in real-time when I add, edit, or delete an expense
**And** the totals use number formatting with thousands separator
**And** today's total calculation includes only expenses with date = today
**And** monthly total includes all expenses in current month (month and year match)
**And** totals are calculated on the client side from cached data
**And** totals recalculate automatically when data changes
**And** if no expenses exist, displays "Today: 0đ" and "This Month: 0đ"

### Story 2.7: Display Expense List Grouped by Day

As a user,
I want to view my expenses grouped by day,
So that I can see my daily spending patterns.

**Acceptance Criteria:**

**Given** I have expenses for multiple days in the current month
**When** I view the expense list
**Then** expenses are grouped by date with date headers (e.g., "Today", "Yesterday", "Jan 13, 2026")
**And** within each date group, expenses are sorted by creation time (newest first)
**And** each expense shows: amount, note, and time (e.g., "45,000đ - cafe - 9:30 AM")
**And** each date group shows a daily subtotal (e.g., "Day Total: 125,000đ")
**And** the list is scrollable for months with many expenses
**And** expenses use Material-UI Card or List components
**And** the list has good visual separation between date groups
**And** if no expenses exist, shows empty state: "No expenses yet. Add your first!"

### Story 2.8: Edit Expense Functionality

As a user,
I want to edit an existing expense,
So that I can correct mistakes or update information.

**Acceptance Criteria:**

**Given** I have an expense in my expense list
**When** I tap on an expense
**Then** the expense opens in edit mode with current values pre-filled
**And** I can modify the amount, note, and date fields
**And** there is a "Save" button to confirm changes
**And** there is a "Cancel" button to discard changes
**And** when I save, PUT /api/expenses/{id} is called with updated data
**And** the system validates the updated data (amount > 0)
**And** UpdatedAt timestamp is updated on the server
**And** the expense list updates with new values using optimistic UI
**And** today's and monthly totals recalculate if amount or date changed
**And** if API call fails, changes are reverted and error message shown
**And** only the expense owner can edit (userId check on backend)

### Story 2.9: Delete Expense with Swipe Action

As a user,
I want to delete an expense by swiping left,
So that I can quickly remove incorrect entries.

**Acceptance Criteria:**

**Given** I have an expense in my expense list
**When** I swipe left on an expense item
**Then** a red "Delete" button appears on the right side
**And** when I tap the Delete button, a confirmation dialog appears
**And** the dialog says "Delete this expense?" with "Cancel" and "Delete" buttons
**And** if I tap Cancel, the expense remains and swipe closes
**And** if I tap Delete, the expense disappears immediately (optimistic UI)
**And** DELETE /api/expenses/{id} is called in the background
**And** today's and monthly totals update to exclude the deleted expense
**And** if API call fails, the expense reappears and error message shown
**And** only the expense owner can delete (userId check on backend)
**And** swipe gesture follows iOS Mail pattern

### Story 2.10: IndexedDB Offline Storage

As a user,
I want my expenses to be saved locally,
So that I can add and view expenses even without internet connection.

**Acceptance Criteria:**

**Given** the app has IndexedDB configured
**When** I add a new expense while offline
**Then** the expense is saved to IndexedDB with a temporary UUID
**And** the expense is marked as "pending sync" with a flag
**And** the expense appears in my list immediately
**And** today's and monthly totals include the offline expense
**And** when I view expenses while offline, they are loaded from IndexedDB
**And** when I come back online, the app detects connection restored
**And** all "pending sync" expenses are sent to POST /api/expenses/sync endpoint in a batch
**And** the server returns mapping of temporary IDs to server-generated IDs
**And** IndexedDB is updated with server IDs and sync flag is removed
**And** if sync fails, expenses remain in "pending sync" state for next retry
**And** no data loss occurs during offline-to-online transition

### Story 2.11: TanStack Query Integration for Caching

As a user,
I want my expense data to load instantly from cache,
So that the app feels fast even with slow network.

**Acceptance Criteria:**

**Given** TanStack Query is installed and configured
**When** I fetch expenses using useQuery hook
**Then** the query key includes userId and date range for proper cache isolation
**And** staleTime is set to 5 minutes (data considered fresh)
**And** cacheTime is set to 10 minutes (cache retained in memory)
**And** refetchOnWindowFocus is enabled to sync when tab regains focus
**And** refetchOnReconnect is enabled to sync when connection restored
**And** on successful fetch, expenses are cached in TanStack Query cache
**And** subsequent requests for same data are served from cache instantly
**And** when I add/edit/delete expense, relevant queries are invalidated
**And** invalidation triggers automatic refetch in the background
**And** the app shows cached data while refetching (no loading spinner for user)

### Story 2.12: Recent Notes Quick Selection

As a user,
I want to see my recent expense notes as quick-select chips,
So that I can reuse common notes without typing.

**Acceptance Criteria:**

**Given** I have added expenses with various notes previously
**When** I open the Add Expense form
**Then** the top 3-5 most recent unique notes appear as chips above the keyboard
**And** chips show note text (e.g., "cafe", "lunch", "grab")
**And** when I tap a chip, it fills the Note field automatically
**And** I can still type custom notes if my expense isn't in recent list
**And** the chips are retrieved from local IndexedDB for instant display
**And** chips update after each new expense is added
**And** duplicate notes are deduplicated in the recent list
**And** chips use Material-UI Chip component with clickable styling

---

## Epic 3: Budget Management & Alerts

Users can set monthly budgets, track spending against budget in real-time, and receive helpful alerts to prevent overspending.

### Story 3.1: Create Budget Entity and Database Table

As a developer,
I want to create the Budget entity and database table,
So that users can store their monthly budget settings.

**Acceptance Criteria:**

**Given** Entity Framework Core is configured
**When** I create a Budget model class with properties: Id (Guid), UserId (Guid), Month (DateTime), Amount (decimal), CreatedAt (DateTime)
**Then** the model includes a navigation property to User entity
**And** Month stores the first day of the month (e.g., 2026-01-01)
**And** I add a unique constraint on (UserId, Month) to prevent duplicate budgets
**And** I configure DbSet<Budget> in AppDbContext
**And** I run `dotnet ef migrations add CreateBudgetsTable`
**And** the migration creates budgets table with unique index
**And** I run `dotnet ef database update` successfully
**And** the table is created in PostgreSQL database

### Story 3.2: Set Monthly Budget API and UI

As a user,
I want to set a monthly budget amount,
So that I can track my spending against my budget goal.

**Acceptance Criteria:**

**Given** I am logged in to the app
**When** I navigate to Budget settings
**Then** I see a form to set monthly budget with an amount input field
**And** I enter 15000000 (15 million VND) as my monthly budget
**And** when I submit, POST /api/budgets is called with { "month": "2026-01-01", "amount": 15000000 }
**And** the system validates amount is greater than 0
**And** the system checks if budget for this month already exists
**And** if budget exists, PUT /api/budgets/{id} updates the existing budget
**And** if budget is new, a new Budget record is created
**And** the response returns 200 OK with the budget object
**And** the UI shows success message "Budget set for January 2026"
**And** the budget persists for the current month

### Story 3.3: Display Remaining Budget

As a user,
I want to see my remaining budget for the current month,
So that I know how much I can still spend.

**Acceptance Criteria:**

**Given** I have set a monthly budget of 15,000,000đ
**And** I have spent 3,000,000đ this month
**When** I view the home screen
**Then** I see "Budget: 12,000,000đ remaining of 15,000,000đ"
**And** the remaining budget is calculated as: budget amount - monthly total spent
**And** the calculation updates in real-time when I add/edit/delete expenses
**And** if remaining is negative, shows "Over Budget: 2,000,000đ" in warning color
**And** the display uses number formatting with thousands separator
**And** if no budget is set, shows "Set a budget to track spending"
**And** budget data is fetched via GET /api/budgets/current

### Story 3.4: Budget Progress Visualization

As a user,
I want to see a visual progress bar for my budget,
So that I can quickly understand how much of my budget I've used.

**Acceptance Criteria:**

**Given** I have a monthly budget of 15,000,000đ and have spent 3,000,000đ
**When** I view the home screen
**Then** I see a linear progress bar showing budget usage
**And** the progress bar shows 20% filled (3M / 15M = 20%)
**And** the bar is color-coded: green when <80%, yellow when 80-100%, orange/red when >100%
**And** below the bar shows "3,000,000đ of 15,000,000đ used"
**And** the progress bar updates in real-time as expenses change
**And** the progress bar uses Material-UI LinearProgress component
**And** the visualization is prominent on the home screen
**And** if no budget set, the progress bar is hidden

### Story 3.5: Calculate and Display Daily Spending Average

As a user,
I want to see my daily spending average,
So that I understand my spending pace.

**Acceptance Criteria:**

**Given** I have spent 6,000,000đ over 15 days this month
**When** I view budget statistics
**Then** I see "Daily Average: 400,000đ"
**And** the calculation is: total monthly spending / days elapsed in month
**And** days elapsed is calculated from day 1 to current day of month
**And** if it's January 15, days elapsed = 15
**And** the average updates daily automatically
**And** the average is displayed with number formatting
**And** this helps me understand if my pace is sustainable for the month

### Story 3.6: Project Month-End Spending

As a user,
I want to see a projection of my month-end spending,
So that I can adjust my behavior if I'm on track to overspend.

**Acceptance Criteria:**

**Given** I have spent 6,000,000đ over 15 days (daily average: 400,000đ)
**And** the current month has 31 days
**When** I view budget statistics
**Then** I see "Projected Month-End: 12,400,000đ"
**And** the calculation is: daily average × total days in month
**And** if projection exceeds budget, shows warning: "On pace to exceed budget by 2,400,000đ"
**And** if projection is under budget, shows success: "On track! Projected to be 2,600,000đ under budget"
**And** the projection updates as spending patterns change
**And** this provides early warning if spending pace is unsustainable

### Story 3.7: Budget Alert at 80% Threshold

As a user,
I want to receive an alert when I reach 80% of my budget,
So that I can be more careful with my remaining spending.

**Acceptance Criteria:**

**Given** I have a monthly budget of 15,000,000đ
**When** my total spending reaches 12,000,000đ (80% of budget)
**Then** a non-intrusive snackbar alert appears at the bottom of the screen
**And** the message says "Budget Alert: You've used 80% of your monthly budget (12M of 15M)"
**And** the snackbar has a warning icon and yellow/orange color
**And** the alert auto-dismisses after 7 seconds
**And** user can manually dismiss by tapping X button
**And** the alert only shows once when crossing the 80% threshold
**And** if I add an expense that pushes me from 79% to 81%, the alert triggers
**And** the tone is helpful and informative, not alarming
**And** the snackbar uses Material-UI Snackbar component

### Story 3.8: Budget Alert When Over Budget

As a user,
I want to receive an alert when I exceed my budget,
So that I'm aware I've overspent and can adjust accordingly.

**Acceptance Criteria:**

**Given** I have a monthly budget of 15,000,000đ
**When** my total spending exceeds 15,000,000đ
**Then** a non-intrusive snackbar alert appears at the bottom
**And** the message says "Over Budget: You've exceeded your monthly budget by 500,000đ"
**And** the snackbar has orange/red color indicating overspend
**And** the alert auto-dismisses after 7 seconds
**And** user can manually dismiss by tapping X button
**And** the alert shows the first time I go over budget
**And** subsequent expenses don't re-trigger the alert (only once per crossing)
**And** the home screen shows remaining budget as negative: "-500,000đ over budget"
**And** the progress bar shows >100% with red color
**And** the tone is informative, not shaming

---

## Epic 4: Savings Goal Tracking

Users can set long-term savings goals, track progress, and stay motivated with milestone celebrations.

### Story 4.1: Create Goal Entity and Database Table

As a developer,
I want to create the Goal entity and database table,
So that users can store their savings goal settings.

**Acceptance Criteria:**

**Given** Entity Framework Core is configured
**When** I create a Goal model class with properties: Id (Guid), UserId (Guid), TargetAmount (decimal), CurrentAmount (decimal), Deadline (DateTime), CreatedAt (DateTime), UpdatedAt (DateTime)
**Then** the model includes a navigation property to User entity
**And** I configure DbSet<Goal> in AppDbContext
**And** I run `dotnet ef migrations add CreateGoalsTable`
**And** the migration creates goals table
**And** I run `dotnet ef database update` successfully
**And** the table is created in PostgreSQL database

### Story 4.2: Set Savings Goal API and UI

As a user,
I want to set a savings goal with target amount and deadline,
So that I can work towards my long-term financial goal (e.g., 300M for marriage).

**Acceptance Criteria:**

**Given** I am logged in to the app
**When** I navigate to Goals section and tap "Set Savings Goal"
**Then** I see a form with fields: Target Amount, Current Savings, and Deadline
**And** I enter 300,000,000đ as target amount
**And** I enter 0đ as current savings (starting from zero)
**And** I select a deadline date (e.g., January 15, 2028 - 2 years from now)
**And** when I submit, POST /api/goals is called with the data
**And** the system validates target amount > 0
**And** the system validates deadline is in the future
**And** a new Goal record is created in the database
**And** the response returns 200 OK with the goal object
**And** the UI shows success message "Goal created: Save 300M by Jan 2028"

### Story 4.3: Calculate Required Monthly Savings

As a user,
I want to see how much I need to save per month to reach my goal,
So that I know if my goal is realistic and what pace I need.

**Acceptance Criteria:**

**Given** I have a goal of 300,000,000đ with deadline in 24 months
**And** my current savings is 0đ
**When** I view my goal details
**Then** I see "Required Monthly Savings: 12,500,000đ"
**And** the calculation is: (target - current) / months remaining
**And** months remaining is calculated from today to deadline
**And** the calculation updates automatically as time passes
**And** if current savings is 60M and 18 months remain: (300M - 60M) / 18 = 13,333,333đ per month
**And** the display uses number formatting with thousands separator
**And** this helps me understand the commitment needed

### Story 4.4: Display Goal Progress Percentage

As a user,
I want to see my savings goal progress as a percentage,
So that I can quickly understand how far along I am.

**Acceptance Criteria:**

**Given** I have a goal of 300,000,000đ and current savings of 60,000,000đ
**When** I view the goal widget on home screen
**Then** I see "20% Complete" displayed prominently
**And** the calculation is: (current / target) × 100
**And** I see a circular or linear progress indicator showing 20%
**And** below shows "60M of 300M saved"
**And** the progress updates when I manually update current savings
**And** the visualization uses Material-UI progress component
**And** the progress is color-coded: blue/green for normal progress
**And** if no goal set, this widget is hidden

### Story 4.5: Update Current Savings Amount

As a user,
I want to manually update my current savings amount,
So that my progress reflects my actual savings balance.

**Acceptance Criteria:**

**Given** I have a savings goal with current amount of 60,000,000đ
**When** I tap "Update Savings" button
**Then** a dialog opens with input field pre-filled with 60,000,000
**And** I can edit the amount to my actual current savings (e.g., 75,000,000)
**And** when I save, PUT /api/goals/{id} is called with updated currentAmount
**And** the system validates amount >= 0
**And** UpdatedAt timestamp is updated
**And** the goal progress percentage recalculates immediately
**And** the UI updates with new progress (75M / 300M = 25%)
**And** required monthly savings recalculates with new remaining amount
**And** success message shows "Savings updated to 75M"

### Story 4.6: Display Goal Status Indicator

As a user,
I want to see if I'm on track, behind, or ahead of my savings goal,
So that I know if I need to adjust my savings rate.

**Acceptance Criteria:**

**Given** I have a goal with deadline and required monthly savings
**When** the system calculates my current savings pace
**Then** it compares actual progress vs expected progress
**And** expected progress = (months elapsed / total months) × target amount
**And** if I'm within 10% of expected: shows "✓ On Track" in green
**And** if I'm more than 10% behind: shows "⚠ Behind Schedule" in yellow
**And** if I'm ahead of pace: shows "★ Ahead of Schedule" in blue
**And** the status indicator is prominent on the goal widget
**And** example: After 6 months, expected = 75M, actual = 60M → "Behind" (20% behind)
**And** the indicator motivates without shaming

### Story 4.7: Estimated Completion Date

As a user,
I want to see my estimated goal completion date based on current pace,
So that I know if I'll meet my deadline.

**Acceptance Criteria:**

**Given** I have saved 60M in 6 months (10M per month average)
**And** my goal is 300M
**When** I view goal statistics
**Then** I see "Estimated Completion: June 2028"
**And** the calculation is: current date + (remaining amount / monthly pace)
**And** monthly pace = current savings / months elapsed
**And** remaining amount = target - current
**And** if estimated date is before deadline, shows "You'll reach your goal 7 months early!"
**And** if estimated date is after deadline, shows "At current pace, you'll be 7 months late"
**And** if pace is too slow, suggests "Increase monthly savings to 12.5M to meet deadline"
**And** this provides realistic expectation management

### Story 4.8: Milestone Celebrations

As a user,
I want to celebrate when I reach savings milestones,
So that I stay motivated throughout my long journey.

**Acceptance Criteria:**

**Given** I have a savings goal of 300,000,000đ
**When** my current savings reaches 75,000,000đ (25% milestone)
**Then** a celebration modal appears with confetti animation
**And** the message says "🎉 Milestone Reached! You've saved 25% of your goal!"
**And** subtext: "Quarter of the way there! Keep up the great work!"
**And** there's a "Continue" button to dismiss
**And** the celebration triggers at 25%, 50%, 75%, and 100% milestones
**And** at 50%: "🎉 Halfway to your wedding goal!"
**And** at 75%: "🎉 Almost there! Final push!"
**And** at 100%: "🎊 GOAL ACHIEVED! Time to celebrate your success!"
**And** each milestone celebration shows only once
**And** the animations are delightful but not annoying
**And** milestone state is persisted so it doesn't re-trigger on reload

---

## Epic 5: Spending Analytics & Insights

Users understand their spending patterns through automatic categorization, breakdowns, and trend analysis.

### Story 5.1: Auto-Detect Categories from Notes

As a user,
I want the system to automatically categorize my expenses from note text,
So that I can see spending breakdown without manual categorization.

**Acceptance Criteria:**

**Given** I have expenses with various notes like "cafe", "lunch grab", "mua đồ tech"
**When** the analytics system processes my expenses
**Then** it detects categories based on keyword matching
**And** "cafe", "coffee", "cà phê" → Food & Drink category
**And** "lunch", "dinner", "breakfast", "ăn" → Food & Drink category
**And** "grab", "uber", "taxi" → Transportation category
**And** "tech", "laptop", "phone", "công nghệ" → Tech & Electronics category
**And** "shopping", "clothes", "mua sắm" → Shopping category
**And** if no match found → Other category
**And** the categorization algorithm runs on client-side for speed
**And** categories are not stored, only computed on-demand
**And** category detection is case-insensitive
**And** supports both English and Vietnamese keywords

### Story 5.2: Display Spending Breakdown by Category

As a user,
I want to see my spending breakdown by category,
So that I understand where my money is going.

**Acceptance Criteria:**

**Given** I have expenses across multiple categories this month
**When** I navigate to the Analytics/Insights tab
**Then** I see a list of categories with amounts spent
**And** example display: "Food & Drink: 8,000,000đ | Tech: 5,000,000đ | Transportation: 2,000,000đ | Other: 3,000,000đ"
**And** categories are sorted by amount (highest first)
**And** each category shows both amount and percentage of total
**And** the breakdown can be toggled between current month and custom date range
**And** the UI uses Material-UI cards or list items
**And** if no expenses, shows empty state: "Add expenses to see spending breakdown"

### Story 5.3: Spending Percentage Distribution Chart

As a user,
I want to see a visual chart of my spending distribution,
So that I can quickly identify my highest spending categories.

**Acceptance Criteria:**

**Given** I have spending across Food (40%), Tech (30%), Transport (15%), Other (15%)
**When** I view the analytics page
**Then** I see a pie chart or donut chart showing the distribution
**And** each category slice is color-coded consistently
**And** hovering/tapping a slice shows details: "Food & Drink: 8M (40%)"
**And** the chart uses a charting library (e.g., Recharts, Chart.js)
**And** the chart is responsive and works on mobile
**And** colors are visually distinct and accessible
**And** the chart provides at-a-glance understanding of spending patterns

### Story 5.4: Week-over-Week Spending Trends

As a user,
I want to compare my spending week-over-week,
So that I can see if my spending is increasing or decreasing.

**Acceptance Criteria:**

**Given** I have expenses over multiple weeks
**When** I view trend analysis
**Then** I see a comparison: "This Week: 1.2M | Last Week: 1.5M"
**And** the display shows change: "↓ 300k (20% decrease) vs last week"
**And** if spending increased, shows upward arrow and percentage
**And** if spending decreased, shows downward arrow and percentage
**And** a line chart shows weekly spending over the last 4-8 weeks
**And** each data point shows the week's total
**And** I can hover/tap points to see exact amounts
**And** this helps me identify spending trends over time

### Story 5.5: Month-over-Month Spending Comparison

As a user,
I want to compare my spending month-over-month,
So that I can see longer-term spending patterns.

**Acceptance Criteria:**

**Given** I have expenses over multiple months
**When** I view monthly comparison
**Then** I see "This Month: 18M | Last Month: 15M"
**And** the display shows change: "↑ 3M (20% increase) vs last month"
**And** a bar chart shows monthly spending over the last 6-12 months
**And** each bar represents a month's total
**And** the current month may show projected total based on pace
**And** I can tap bars to see monthly breakdown
**And** this provides long-term spending awareness

### Story 5.6: Identify High-Spending Categories

As a user,
I want the system to highlight my highest spending categories,
So that I can focus on reducing spending in those areas.

**Acceptance Criteria:**

**Given** I have spending data across multiple categories
**When** I view insights
**Then** I see "Top Spending: Tech & Electronics (5M - 30% of total)"
**And** the system identifies the top 3 highest spending categories
**And** each is shown with amount, percentage, and an insight
**And** example insights: "You spent 48% on Tech - consider if these purchases align with your savings goal"
**And** "Food spending is 35% - this is typical for most users"
**And** insights are informative and non-judgmental
**And** this guides user attention to areas for potential savings

### Story 5.7: Summary Statistics Dashboard

As a user,
I want to see summary statistics about my spending,
So that I have a complete overview of my financial behavior.

**Acceptance Criteria:**

**Given** I have expense history
**When** I view the statistics dashboard
**Then** I see multiple summary metrics displayed
**And** "Average Daily Spending: 400,000đ"
**And** "Total This Month: 12,000,000đ"
**And** "Total This Year: 48,000,000đ"
**And** "Most Expensive Day: Jan 12 (1.5M)"
**And** "Most Common Category: Food & Drink"
**And** "Longest Tracking Streak: 28 days"
**And** all statistics update in real-time as data changes
**And** the dashboard is visually organized with cards/sections
**And** this provides comprehensive financial awareness

---

## Epic 6: Progressive Web App Experience

Users can install the app to their home screen, use it like a native app, and enjoy fast performance with full offline functionality.

### Story 6.1: Configure PWA with vite-plugin-pwa

As a developer,
I want to configure the PWA setup with Service Worker,
So that the app can be installed and work offline.

**Acceptance Criteria:**

**Given** vite-plugin-pwa is installed
**When** I configure vite.config.ts with PWA plugin
**Then** the plugin generates a Service Worker automatically
**And** the manifest.json is generated with app metadata
**And** manifest includes: name, short_name, icons, theme_color, background_color
**And** Workbox is configured for caching strategies
**And** static assets (JS, CSS) use CacheFirst strategy
**And** API calls use NetworkFirst strategy
**And** the Service Worker is registered in main.tsx
**And** I can build the app and Service Worker is in dist/
**And** the app passes PWA audit in Lighthouse

### Story 6.2: Add to Home Screen Functionality

As a user,
I want to install the app to my iPhone home screen,
So that I can access it quickly like a native app.

**Acceptance Criteria:**

**Given** I open the app in iOS Safari
**When** the app loads
**Then** Safari recognizes it as a PWA (manifest.json present)
**And** I tap the Share button in Safari
**And** I see "Add to Home Screen" option
**And** when I tap it, I can edit the app name and confirm
**And** the app icon appears on my home screen
**And** the icon uses the correct image from manifest
**And** tapping the icon launches the app in standalone mode (no Safari UI)
**And** the app fills the full screen
**And** the status bar matches the theme color
**And** the app behaves like a native application

### Story 6.3: Service Worker Asset Caching

As a user,
I want the app to load instantly on repeat visits,
So that I have a fast, native-like experience.

**Acceptance Criteria:**

**Given** I have visited the app once and assets are cached
**When** I close and reopen the app
**Then** the app loads in under 1 second
**And** static assets (HTML, CSS, JS) are served from Service Worker cache
**And** no network request is made for cached assets
**And** the Service Worker uses precaching for critical assets
**And** runtime caching for dynamic content
**And** cache size stays under iOS 50MB limit
**And** cache invalidation happens when new app version is deployed
**And** users get prompted to update when new version available

### Story 6.4: Offline Functionality

As a user,
I want the app to work fully offline,
So that I can track expenses even without internet.

**Acceptance Criteria:**

**Given** the app is installed as PWA
**When** I turn off Wi-Fi and cellular data (airplane mode)
**Then** I can still open the app and see the UI
**And** I can view all my previously loaded expenses from IndexedDB
**And** I can add new expenses which save to IndexedDB
**And** I can edit and delete expenses locally
**And** today's and monthly totals calculate correctly from local data
**And** when I go back online, all offline changes sync automatically
**And** the app shows a subtle offline indicator if needed
**And** no functionality is blocked due to offline state

### Story 6.5: Material-UI Theme Configuration

As a developer,
I want to configure Material-UI theme with custom colors,
So that the app has a consistent, professional look aligned with brand.

**Acceptance Criteria:**

**Given** Material-UI is installed
**When** I create a theme using createTheme()
**Then** primary color is set to calm blue (#2196F3)
**And** secondary color is set to green (#4CAF50) for success/savings
**And** warning color is orange (#FF9800) for budget warnings
**And** error color is red (#F44336) for over budget
**And** typography uses Roboto font family
**And** spacing is set to 8px base unit
**And** border radius is 8px for rounded corners
**And** the theme is wrapped around the app with ThemeProvider
**And** all MUI components use the theme automatically

### Story 6.6: Bottom Tab Navigation

As a user,
I want to navigate between main sections using bottom tabs,
So that I can easily access all features with my thumb.

**Acceptance Criteria:**

**Given** I am on the app
**When** I look at the bottom of the screen
**Then** I see a bottom navigation bar with 4 tabs
**And** Tab 1: "Add" (home icon) - Quick Add expense page
**And** Tab 2: "History" (list icon) - Expense list page
**And** Tab 3: "Insights" (chart icon) - Analytics page
**And** Tab 4: "Settings" (settings icon) - Settings page
**And** the active tab is highlighted with primary color
**And** tapping a tab navigates to that page instantly
**And** the bottom nav uses Material-UI BottomNavigation component
**And** icons are clear and recognizable
**And** the nav is fixed at the bottom, always accessible

### Story 6.7: Empty States with Helpful Guidance

As a user,
I want to see helpful guidance when I have no data,
So that I know what to do next.

**Acceptance Criteria:**

**Given** I am a new user with no expenses
**When** I view the expense list
**Then** I see an empty state illustration or icon
**And** the message says "No expenses yet. Add your first expense to start tracking!"
**And** there's a clear call-to-action button "Add Expense"
**And** tapping the button navigates to Add Expense form
**And** similar empty states exist for: no budget set, no goal set, no analytics data
**And** each empty state has context-specific messaging
**And** the design is friendly and encouraging, not sterile
**And** empty states use Material-UI components for consistency

### Story 6.8: Loading States with Skeleton Screens

As a user,
I want to see skeleton loading placeholders,
So that the app feels fast even while data is loading.

**Acceptance Criteria:**

**Given** the app is fetching expense data
**When** the data hasn't loaded yet
**Then** I see skeleton placeholders in the list
**And** skeletons have the same shape as actual expense cards
**And** skeletons animate with a shimmer effect
**And** once data loads, skeletons are replaced smoothly
**And** loading spinners are avoided in favor of skeletons
**And** skeleton screens use Material-UI Skeleton component
**And** this provides better perceived performance

### Story 6.9: Responsive Mobile-First Design

As a user,
I want the app to work perfectly on my iPhone and any screen size,
So that I have a great experience on all devices.

**Acceptance Criteria:**

**Given** the app is designed mobile-first
**When** I use the app on iPhone (375px width)
**Then** all content is readable and accessible
**And** touch targets are minimum 44x44pt
**And** one-handed thumb operation is comfortable
**And** when I use on iPad (768px), layout adapts to use more space
**And** when I use on desktop (1200px+), content is centered with max-width
**And** responsive breakpoints: mobile <600px, tablet 600-960px, desktop >960px
**And** all forms, buttons, and interactions work on touch and mouse
**And** the app never requires horizontal scrolling
**And** Material-UI responsive utilities are used (Grid, Container, Box)

### Story 6.10: Performance Optimization

As a user,
I want the app to load and respond quickly,
So that tracking expenses is never slow or frustrating.

**Acceptance Criteria:**

**Given** the app is deployed to production
**When** I measure performance with Lighthouse
**Then** performance score is 90+
**And** First Contentful Paint is under 1.5 seconds
**And** Time to Interactive is under 3 seconds on 4G
**And** bundle size is optimized through code splitting
**And** lazy loading is used for non-critical routes
**And** images are optimized and properly sized
**And** tree-shaking removes unused code
**And** the app meets all NFR performance targets (NFR1-NFR6)
**And** perceived performance is instant due to optimistic UI

### Story 6.11: Error Handling and User-Friendly Messages

As a user,
I want to see clear, helpful error messages when something goes wrong,
So that I understand what happened and what to do next.

**Acceptance Criteria:**

**Given** an error occurs in the app
**When** the error is displayed to me
**Then** the message is in plain language, not technical jargon
**And** network error: "Unable to connect. Your expense is saved locally and will sync when you're online."
**And** validation error: "Please enter an amount greater than 0"
**And** auth error: "Your session expired. Please log in again."
**And** each error suggests a next action
**And** errors use Material-UI Snackbar or Alert components
**And** errors are color-coded (red for errors, orange for warnings)
**And** errors auto-dismiss or have a dismiss button
**And** critical errors don't crash the app (error boundaries)
