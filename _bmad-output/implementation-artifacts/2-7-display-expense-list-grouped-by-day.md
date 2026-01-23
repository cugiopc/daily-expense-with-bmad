# Story 2.7: Display Expense List Grouped by Day

Status: ready-for-dev

<!-- Ultimate Story Context Engine Analysis Completed -->

## Story

As a user,
I want to view my expenses grouped by day,
So that I can see my daily spending patterns.

## Acceptance Criteria

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

---

## Developer Context

### Story Overview & Why It Matters

This story builds on the **Expense Tracking Foundation** (Stories 2.1-2.6) to add **visual organization and spending pattern insights**. Users need to understand their spending behavior quickly—grouping expenses by day with subtotals helps them see which days were high-spending and identify patterns.

**Key Context:**
- This is the **first expense list display story** in Epic 2
- Subsequent stories (2.8-2.12) will add edit/delete functionality, offline sync, and recent notes
- The grouping logic and UI patterns you establish here will be reused in edit/delete features
- Performance is critical: lists may contain hundreds of expenses from past months

### Story Positioning

**Previous Stories (Completed):**
- 2.1-2.3: API foundation (Expense entity, create endpoint, get list endpoint)
- 2.4-2.5: Frontend entry form with optimistic UI
- 2.6: Real-time totals display (Today's & Monthly)

**This Story Enables:**
- 2.8: Edit functionality (tap expense to open edit form)
- 2.9: Delete with swipe (requires list structure)
- 2.10-2.12: Offline sync, caching, recent notes (all depend on list structure)

**Success Metrics:**
✅ List loads within 500ms for <500 expenses
✅ Scrolling smooth at 60 FPS (no jank on list render)
✅ Date headers are clearly visible and distinct
✅ Daily subtotals match manual calculation verification
✅ Empty state is encouraging and action-oriented

---

## Acceptance Criteria Analysis

### AC #1: Grouping by Date with Headers

**Requirement:** Expenses grouped by date with headers like "Today", "Yesterday", "Jan 13, 2026"

**Implementation Strategy:**
1. **Data Transformation**: Group expenses by their date (not timestamp)
   - Use `startOfDay()` from date-fns to normalize dates
   - Comparison: `isSameDay(expenseDate, referenceDate)`
   
2. **Date Header Labels** (in Vietnamese):
   - Today → "Hôm nay"
   - Yesterday → "Hôm qua"
   - Earlier dates → "d MMMM, yyyy" format (e.g., "13 tháng 1, 2026")
   - Use `format()` from date-fns with Vietnamese locale

3. **Component Structure**:
   - `ExpenseListByDay` component: Main container
   - `ExpenseGroup` component: Each day group (header + expense list)
   - `ExpenseItem` component: Individual expense (reuse/create for list display)

**Implementation Detail:**
```typescript
// Pseudo-code for grouping logic
const expenses = [...]; // From TanStack Query

const grouped = expenses.reduce((groups, expense) => {
  const key = startOfDay(new Date(expense.date)).toISOString();
  if (!groups[key]) groups[key] = [];
  groups[key].push(expense);
  return groups;
}, {});

// Convert to array sorted by date DESC (newest first)
const groupedArray = Object.entries(grouped)
  .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
  .map(([date, items]) => ({
    date,
    expenses: items.sort((a, b) => b.createdAt - a.createdAt) // Newest first
  }));
```

---

### AC #2: Expenses Sorted by Creation Time (Newest First)

**Requirement:** Within each date group, expenses sorted by creation time (newest first)

**Implementation Detail:**
- Backend returns expenses already sorted by `createdAt DESC` (from Story 2.3 GET /api/expenses)
- Frontend should maintain this sort order
- When user adds new expense optimistically, insert at beginning of that day's group
- When user edits expense date, move to new day group (or keep in same if date unchanged)

**Sorting Edge Case:**
- If multiple expenses created in same second, use `id` as tiebreaker (stable sort)
- In practice, server-side ordering is sufficient

---

### AC #3: Expense Display Format

**Requirement:** Each expense shows amount, note, and time (e.g., "45,000đ - cafe - 9:30 AM")

**Display Format:**
```
45,000₫ - cafe - 9:30 AM
```

**Component Implementation:**
```typescript
// ExpenseItem component
<Box display="flex" justifyContent="space-between" alignItems="center">
  <Box>
    <Typography variant="body1" fontWeight="bold">
      {formatCurrency(expense.amount)} {expense.note && `- ${expense.note}`}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {formatTime(new Date(expense.date))} {/* 9:30 AM */}
    </Typography>
  </Box>
</Box>
```

**Formatting Functions Required:**
- `formatCurrency(amount: number): string`
  - Vietnamese format: "45.000₫" (dots as thousands separators)
  - Use: `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`

- `formatTime(date: Date): string`
  - Format: "9:30 AM" or "21:30" (12-hour with AM/PM)
  - Use: `format(date, 'h:mm a', { locale: viLocale })`
  - Alternative: `format(date, 'HH:mm')` for 24-hour format if preferred

---

### AC #4: Daily Subtotal per Date Group

**Requirement:** Each date group shows a daily subtotal (e.g., "Day Total: 125,000đ")

**Implementation Strategy:**
1. Calculate sum of all expenses in that day group
2. Display as footer in each date group
3. Update in real-time when expenses change (add/edit/delete)

**Component Structure:**
```typescript
<Box>
  {/* Date Header */}
  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
    {getDateHeader(groupDate)}
  </Typography>

  {/* Expenses in group */}
  {expenses.map(expense => (
    <ExpenseItem key={expense.id} expense={expense} />
  ))}

  {/* Daily Subtotal */}
  <Box sx={{ backgroundColor: '#f5f5f5', p: 1, textAlign: 'right' }}>
    <Typography variant="body2" fontWeight="bold">
      Day Total: {formatCurrency(groupSum)}
    </Typography>
  </Box>
</Box>
```

**Calculation:**
- Use TanStack Query selector or useMemo to avoid recalculating on every render
- Selector: `useQuery((state) => calculateDayTotal(expenses, date))`

---

### AC #5: Scrollable List for Many Expenses

**Requirement:** List is scrollable for months with many expenses

**Implementation Strategy:**
1. Container component with fixed height
2. Overflow: auto for scrolling
3. Consider virtualization for >200 expenses (use `react-window` if needed)
4. For MVP, simple scroll should be sufficient

**Performance Consideration:**
- Test with 300-400 expenses (reasonable for 1 year of daily spending)
- If performance degrades, implement `FixedSizeList` from react-window
- Measure: render time should stay <100ms even with 500 expenses

---

### AC #6: Material-UI Card or List Components

**Requirement:** Expenses use Material-UI Card or List components

**Recommendation: Use List Components** (better for this use case)

**Component Structure:**
```typescript
<Box component="div" sx={{ bgcolor: 'background.paper' }}>
  {/* For each date group */}
  <Box>
    <ListSubheader>{getDateHeader(date)}</ListSubheader>
    <List dense>
      {expenses.map((expense) => (
        <ListItem
          key={expense.id}
          button // Makes it clickable for future edit functionality
          onClick={() => navigate(`/expense/${expense.id}`)} // Future story 2.8
          sx={{
            borderBottom: '1px solid #eee',
            '&:hover': { backgroundColor: '#fafafa' }
          }}
        >
          <ListItemText
            primary={`${formatCurrency(expense.amount)} - ${expense.note}`}
            secondary={formatTime(expense.date)}
          />
        </ListItem>
      ))}
    </List>
    {/* Daily subtotal */}
    <ListItem>
      <Typography variant="body2" fontWeight="bold" sx={{ ml: 'auto' }}>
        Day Total: {formatCurrency(dayTotal)}
      </Typography>
    </ListItem>
  </Box>
</Box>
```

**Why List Instead of Card:**
- ✅ Better for item-by-item interaction (future edit/delete)
- ✅ Native keyboard navigation support
- ✅ Cleaner visual hierarchy with ListSubheader
- ✅ ListItem provides built-in hover states and clickability

---

### AC #7: Visual Separation Between Date Groups

**Requirement:** List has good visual separation between date groups

**Implementation:**
```typescript
// Date group container
<Box sx={{
  backgroundColor: '#ffffff',
  marginBottom: 2,
  borderRadius: 1,
  elevation: 0,
  borderLeft: '4px solid #2196F3' // Blue accent for visual separation
}}>
  {/* Content */}
</Box>
```

**Visual Separation Techniques:**
- **Vertical spacing**: `mb: 2` between groups (16px)
- **Color contrast**: Subtle background shade change
- **Left border**: 4px colored accent (matches primary theme color)
- **Typography weight**: Date header in bold h6 variant
- **Divider line**: `<Divider />` between expense list and daily subtotal

---

### AC #8: Empty State

**Requirement:** If no expenses exist, shows "No expenses yet. Add your first!"

**Implementation:**
```typescript
if (expenses.length === 0) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center'
      }}
    >
      <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No expenses yet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add your first expense to start tracking
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => navigate('/add-expense')}
      >
        Add Expense
      </Button>
    </Box>
  );
}
```

---

## Technical Requirements & Implementation Details

### Data Source & State Management

**TanStack Query Hook (Existing from Story 2.3):**
```typescript
const { data: expenses, isLoading, isError } = useQuery({
  queryKey: ['expenses', { startDate, endDate }],
  queryFn: () => fetchExpenses(startDate, endDate),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000 // 10 minutes
});
```

**Data Grouping (Client-Side):**
- Group logic should be in a custom hook: `useExpensesGroupedByDay(expenses)`
- Input: Array of expenses from TanStack Query
- Output: Grouped array with metadata for rendering
- **Responsibility Separation**: Grouping logic is pure function (testable, reusable)

### Component Architecture

**Recommended Component Structure:**
```
ExpenseListPage (page component)
├── ExpenseListByDay (feature component - main logic)
│   ├── LoadingState (if isLoading)
│   ├── ErrorState (if isError)
│   └── GroupedExpensesList
│       ├── ExpenseGroup (for each date)
│       │   ├── DateHeader
│       │   ├── ExpenseItem[] (list of expenses)
│       │   └── DayTotalFooter
│       └── EmptyState
```

**File Structure:**
```
src/features/expenses/
├── components/
│   ├── ExpenseListByDay.tsx (main component)
│   ├── ExpenseGroup.tsx (single day group)
│   ├── ExpenseItem.tsx (individual expense)
│   ├── DayTotalFooter.tsx (day subtotal)
│   └── ExpenseListByDay.test.tsx (tests)
├── hooks/
│   ├── useExpensesGroupedByDay.ts (grouping logic)
│   └── useExpensesGroupedByDay.test.ts (unit tests)
└── index.ts
```

### Key Dependencies

**Already Installed (from previous stories):**
- ✅ TanStack Query v5 (data fetching)
- ✅ React Router v6 (navigation)
- ✅ Material-UI v5 (components)
- ✅ date-fns (date utilities)
- ✅ Axios (HTTP client)

**New Dependencies (if needed):**
- ⚠️ `react-window` (virtualization) - Only if >300 expenses cause performance issues
- ⚠️ `lodash-es` (grouping utilities) - Not needed, native JS sufficient

---

## Architecture Compliance

### Frontend Code Structure (From project-context.md)

✅ **Component Organization:**
- Feature-based structure: `src/features/expenses/components/`
- Colocated tests: `ExpenseListByDay.test.tsx`
- Component max size: <250 lines (split into smaller components)

✅ **TypeScript Compliance:**
- Strict mode enabled
- All function return types explicit
- Props interface: `ExpenseListByDayProps`
- Optional chaining `?.` and nullish coalescing `??`

✅ **React Patterns:**
- Functional components only
- Hooks at top level
- TanStack Query for server state (not useState)
- Material-UI sx prop for styling

✅ **State Management:**
- Server state: TanStack Query (useQuery hook)
- UI state: React Context for theme (none needed for this story)
- No Redux, no global state libraries

### Database & API Requirements (From Architecture.md)

✅ **Database Indexes (from Story 2.1):**
- `CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC)`
- `CREATE INDEX idx_expenses_user_created ON expenses(user_id, created_at DESC)`
- Ensures GET /api/expenses is fast (<200ms)

✅ **API Contract (from Story 2.3):**
- Endpoint: `GET /api/expenses?startDate=2026-01-01&endDate=2026-01-31`
- Response format: Expenses sorted by date DESC, then created_at DESC
- Each expense includes: id, amount, note, date, createdAt, updatedAt

✅ **Authentication:**
- All requests include JWT in Authorization header
- Backend filters by userId from token claims

---

## Previous Story Intelligence (Story 2.6)

### Key Learnings from Story 2.6

**What Was Implemented:**
- ✅ TodayTotal component (calculates sum of today's expenses)
- ✅ MonthlyTotal component (calculates sum of current month's expenses)
- ✅ Real-time updates using TanStack Query cache

**Patterns to Reuse in Story 2.7:**
1. **Date Filtering Logic**: Use same `startOfDay()` pattern from Story 2.6
2. **Currency Formatting**: `Intl.NumberFormat('vi-VN', { style: 'currency' })`
3. **TanStack Query Integration**: Use useQuery hook with same structure
4. **Real-time Updates**: Mutations invalidate queries automatically

**Code Patterns from Story 2.6 to Follow:**
```typescript
// From TodayTotal.tsx
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
};

// Use this same function in ExpenseItem for consistency!
```

**Testing Approach from Story 2.6:**
- Mock TanStack Query useQuery hook
- Test with sample expense data
- Verify calculations match expected totals
- Test with empty data

---

## Implementation Checklist

### Phase 1: Data Grouping & Logic (Testable, Core Logic)

- [ ] Create `useExpensesGroupedByDay` hook
  - Input: Array of expenses
  - Output: Grouped object with metadata
  - Handle empty array case
  - Sort groups by date DESC
  - Sort expenses within group by createdAt DESC
  - Add test: `useExpensesGroupedByDay.test.ts`

- [ ] Create helper functions
  - `getDateHeader(date: Date): string` → "Hôm nay" / "Hôm qua" / "13 tháng 1, 2026"
  - `formatCurrency(amount: number): string` → "45.000₫"
  - `formatTime(date: Date): string` → "9:30 AM"
  - Add tests for locale handling (Vietnamese)

### Phase 2: UI Components (Core Rendering)

- [ ] Create `ExpenseItem.tsx` component
  - Props: `{ expense: Expense, onClick?: () => void }`
  - Display: amount, note, time
  - Styles: ListItem with hover effect
  - Clickable for future edit functionality

- [ ] Create `DayTotalFooter.tsx` component
  - Props: `{ expenses: Expense[], dayTotal: number }`
  - Display: "Day Total: 125,000₫"
  - Styles: Subtle background (#f5f5f5), right-aligned

- [ ] Create `ExpenseGroup.tsx` component
  - Props: `{ groupDate: Date, expenses: Expense[] }`
  - Composition: DateHeader + ExpenseItem[] + DayTotalFooter
  - Styles: Left border accent, spacing

- [ ] Create `ExpenseListByDay.tsx` main component
  - Props: `{ expenses: Expense[] | undefined, isLoading: boolean, isError: boolean }`
  - Handle loading state: `<CircularProgress />`
  - Handle error state: `<Alert severity="error">`
  - Handle empty state: Icon + message + "Add Expense" button
  - Map grouped data to ExpenseGroup components
  - Container with scroll support

### Phase 3: Page Integration & Wiring

- [ ] Create/Update `src/pages/ExpenseListPage.tsx` (or existing history page)
  - Use useQuery hook to fetch expenses for current month
  - Pass to ExpenseListByDay component
  - Handle navigation to add-expense and edit-expense (future stories)

- [ ] Add route in App.tsx
  - Route: `/expenses` or `/history`
  - Component: ExpenseListPage
  - Protected: Yes (auth required)

- [ ] Update navigation
  - Add tab or menu item linking to expense list page
  - Could be part of bottom tab bar (Epic 6)

### Phase 4: Testing

- [ ] Unit tests for grouping hook
  - Test grouping by date
  - Test sorting by createdAt DESC
  - Test date header formatting
  - Test currency formatting
  - Test time formatting
  - Test empty array handling

- [ ] Component tests (Vitest)
  - Test ExpenseItem renders correctly
  - Test DayTotalFooter calculates sum correctly
  - Test ExpenseGroup displays header, items, footer
  - Test ExpenseListByDay renders all groups
  - Test empty state displays when no expenses

- [ ] Integration tests
  - Test full list renders with sample data
  - Test real-time updates when expense added/edited/deleted
  - Test performance with 300+ expenses

### Phase 5: Styling & Polish

- [ ] Verify date headers are visually distinct (bold, larger font)
- [ ] Verify date group separation (borders, spacing)
- [ ] Test responsive layout (mobile, tablet, desktop)
- [ ] Test touch interactions (tap to select, scroll smoothness)
- [ ] Test accessibility (keyboard navigation, screen readers)
- [ ] Verify Vietnamese locale formatting is correct

---

## Potential Implementation Challenges & Mitigations

### Challenge 1: Date Comparison Edge Cases

**Issue:** Comparing dates across timezone boundaries

**Mitigation:**
- Always use `startOfDay()` from date-fns to normalize dates
- Store dates as ISO strings in database
- Parse consistently: `new Date(expense.date)`
- Test across month/year boundaries (Jan 31 → Feb 1)

---

### Challenge 2: Real-Time Updates Consistency

**Issue:** When user adds expense, does it appear in the correct date group?

**Mitigation:**
- On optimistic update (mutate), insert new expense into correct date group
- Group logic is deterministic (same input = same output)
- TanStack Query cache invalidation re-groups data server-side
- Test: Add expense today, verify it appears in "Hôm nay" group

---

### Challenge 3: Performance with Large Lists

**Issue:** Rendering 500+ expenses might be slow on mobile

**Mitigation:**
- Phase 1: Implement simple rendering (should handle 300-400 without issues)
- Measure: Use React DevTools Profiler to check render time
- Phase 2 (if needed): Implement `react-window` virtualization
- Key metric: FPS should stay 60+ when scrolling

---

### Challenge 4: Locale Formatting (Vietnamese)

**Issue:** Date headers and times must be in Vietnamese

**Mitigation:**
- Import Vietnamese locale from date-fns: `import { vi } from 'date-fns/locale'`
- Pass locale to all date-fns functions: `format(date, 'dd MMMM yyyy', { locale: vi })`
- Test specific dates: Verify "Hôm qua", "Hôm nay" appear correctly
- Currency formatting: Use `Intl.NumberFormat('vi-VN')`

---

## Success Criteria & Validation

### Functional Validation

- ✅ Expenses display grouped by date
- ✅ Date headers show "Today", "Yesterday", or formatted date
- ✅ Expenses within group sorted by creation time (newest first)
- ✅ Each expense shows amount, note, and time
- ✅ Daily subtotal displayed for each date group
- ✅ Empty state message displays when no expenses
- ✅ List is scrollable

### Performance Validation

- ✅ List renders within 500ms for <500 expenses
- ✅ Scrolling is smooth (60 FPS maintained)
- ✅ Real-time updates (add/edit/delete) complete in <100ms

### Quality Validation

- ✅ All functions have explicit return types (TypeScript strict)
- ✅ 100% test coverage for grouping hook
- ✅ 80%+ test coverage for components
- ✅ No console.error or console.warn in tests
- ✅ Code follows project-context.md patterns
- ✅ Vietnamese locale formatting verified
- ✅ Material-UI components used correctly (sx prop, theme tokens)

---

## Files to Create/Modify

### New Files

```
src/features/expenses/
├── components/
│   ├── ExpenseListByDay.tsx
│   ├── ExpenseListByDay.test.tsx
│   ├── ExpenseGroup.tsx
│   ├── ExpenseItem.tsx
│   └── DayTotalFooter.tsx
├── hooks/
│   ├── useExpensesGroupedByDay.ts
│   └── useExpensesGroupedByDay.test.ts
└── index.ts (export public API)

src/pages/
└── ExpenseListPage.tsx (or update existing history page)
```

### Modified Files

```
src/App.tsx (add route)
src/pages/HomePage.tsx (add navigation link to expense list)
```

---

## Story Status & Next Steps

✅ **Story Status:** ready-for-dev

**Handoff to Dev Agent:**
The developer has everything needed:
1. **Complete UI specifications** with component structure
2. **Data transformation logic** for grouping expenses
3. **Material-UI patterns** for consistent styling
4. **Test scenarios** covering happy path and edge cases
5. **Performance considerations** for optimization
6. **Previous story patterns** to maintain consistency
7. **Locale requirements** for Vietnamese formatting

**Implementation Complexity:** Medium (core logic is grouping; UI is straightforward Material-UI components)

**Estimated Effort:** 4-6 hours (including testing and integration)

**Prerequisites:** All stories 2.1-2.6 must be completed and working
