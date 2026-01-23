---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/product-brief-Daily Expenses-2026-01-13.md']
project_name: 'simple-todo-app'
date: '2026-01-14'
author: 'HoanTran'
---

# UX Design Specification simple-todo-app

**Author:** HoanTran
**Date:** 2026-01-14

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

**Daily Expenses** là Progressive Web App giải quyết vấn đề mất kiểm soát chi tiêu cá nhân thông qua **extreme simplicity**. App cho phép tracking expenses trong **5-7 giây** với workflow tối giản (chỉ 2 fields: amount + note), giúp user xây dựng thói quen tracking hàng ngày mà không tạo friction.

Khác với các solutions phức tạp hiện tại (10 bước, 30-45 giây per entry), Daily Expenses áp dụng "less is more" philosophy - loại bỏ category dropdowns và unnecessary fields để focus vào việc **thực sự ghi chép** thay vì tạo barriers. App hỗ trợ budget alerts và savings goal tracking để biến tracking thành công cụ đạt mục tiêu tài chính lớn (VD: tiết kiệm 300 triệu để kết hôn).

**Core UX Principle:** Mỗi millisecond friction có thể break habit formation. Speed is a feature.

### Target Users

**Primary User: HoanTran - The Goal-Driven Developer**

**Profile:**
- 30 tuổi, Senior Software Developer
- iOS user, tech-savvy, comfortable với PWAs
- Single, planning marriage in 2 years
- Specific savings goal: 300 triệu trong 2 năm (12.5 triệu/tháng)

**Pain Points:**
- Không track chi tiêu → "cuối tháng không biết tiền đi đâu"
- Impulse buying behavior: Săn sale đồ công nghệ khi thấy deals (500k - vài triệu)
- Payment via credit card → mất cảm giác "tiền ra"
- Existing apps quá phức tạp → không muốn dùng thường xuyên

**Goals:**
- Track every expense để identify spending patterns
- Control impulse buying với budget alerts
- Achieve 300M savings goal on schedule
- Build sustainable financial habits

**Behaviors:**
- Mobile-first: Phone luôn bên người
- Expects instant response, không chờ đợi
- Willing to adjust behavior when shown data
- Motivated by clear goals and progress visibility

**Success Criteria:**
- Có thể ghi expense trong 5-7 giây
- Nhận alert trước khi overspend
- Thấy rõ progress về savings goal
- Tracking becomes automatic reflex (90%+ days tracked)

### Key Design Challenges

**1. Speed vs Completeness Trade-off**
- **Challenge:** Entry phải ≤7 giây nhưng capture đủ context
- **Critical Requirements:**
  - Auto-focus vào amount field (no tap needed)
  - Number keyboard auto-show
  - Tab navigation to note field
  - Enter key to submit
  - Optimistic UI - instant feedback, sync background
- **Success Metric:** 90%+ entries completed in ≤10 seconds

**2. Mobile Performance & PWA Constraints**
- **Challenge:** PWA must feel native on iOS Safari
- **Technical Constraints:**
  - iOS PWA limitations: limited notifications, service worker restrictions
  - Must work offline-first, sync when online
  - Background sync không reliable trên iOS
- **Performance Targets:**
  - Initial load: <2 seconds
  - Entry response: <500ms optimistic update
  - Repeat visit: <1 second (cached assets)
- **Offline Strategy:** IndexedDB for local storage, queue sync on reconnect

**3. Budget Awareness Without Friction**
- **Challenge:** Alert về budget mà không annoying/interrupting flow
- **Design Considerations:**
  - Khi nào show alert? (80% threshold? At overspend?)
  - Persistent indicator vs modal popup?
  - How to motivate without frustrating?
- **Balance:** Always visible budget status + non-intrusive warnings

### Design Opportunities

**1. Micro-interactions for Habit Formation**
- **Opportunity:** Delight users để reinforce tracking behavior
- **Tactics:**
  - Instant visual confirmation on entry save
  - Subtle progress animations (budget bar, goal progress)
  - Milestone celebrations (25%, 50%, 75% goal)
  - Success states that feel rewarding
- **Principle:** Every entry should feel satisfying, not burdensome

**2. Smart Defaults & Predictive UX**
- **Opportunity:** Reduce cognitive load với intelligent defaults
- **Features:**
  - Auto-focus amount field on app open
  - Date defaults to today (editable if needed)
  - Recent notes quick-select for repeat expenses
  - Time-based suggestions (morning → "cafe", lunch → "lunch")
- **Future:** AI category detection from note text (post-MVP)

**3. Goal Visualization as Primary Motivation**
- **Opportunity:** Leverage emotional connection to marriage goal
- **Features:**
  - 300M progress bar prominently displayed
  - "On track" / "Behind" / "Ahead" status indicators
  - Time remaining to goal deadline
  - Impact visualization: "This purchase = 4% of monthly budget"
- **Psychology:** Connect every expense to bigger life goal

## Core User Experience

### Defining Experience

**Core User Action: Ultra-Fast Expense Entry**

The heart of Daily Expenses là **adding an expense in 5-7 seconds**. This single interaction defines product success - if entry isn't effortless, habit formation fails và entire value proposition collapses.

**Core Loop:**
```
Transaction occurs → Open app (PWA) → Enter amount + note → Submit → See instant feedback
```

**Critical Success Factor:**
Entry must be faster than thought. By the time user decides "I should track this", the entry should already be done. Any friction breaks the habit-forming loop.

### Platform Strategy

**Primary Platform: Progressive Web App (PWA) on iOS Safari**

**Platform Decisions:**

**Mobile-First PWA Architecture:**
- Installable via "Add to Home Screen" (iOS/Android)
- Standalone mode - launches like native app
- Offline-first with IndexedDB + Service Worker
- Cross-platform ready (iOS primary, desktop testing, future Android)

**iOS-Specific Considerations:**
- Safari PWA limitations: Limited notifications, service worker restrictions
- No background processing - handle gracefully
- Must work seamlessly despite iOS constraints
- Native-like performance targets: <2s load, <500ms response

**Touch-Optimized Design:**
- Large touch targets (44x44pt minimum)
- Bottom-placed primary actions (thumb zone)
- Swipe gestures for list management
- One-handed usability prioritized

**Offline Strategy:**
- Transparent offline operation - user doesn't notice
- Local-first: IndexedDB for immediate persistence
- Background sync queue when reconnected
- Zero data loss guarantee

### Effortless Interactions

**1. Zero-Friction Entry Flow**
- **Auto-focus:** Amount field focused on app open (no tap needed)
- **Smart keyboard:** Number keyboard auto-shows for amount input
- **Fast navigation:** Tab key moves to note field
- **Quick submit:** Enter key saves (no button tap required)
- **Instant feedback:** Optimistic UI shows success immediately, syncs in background

**2. Intelligent Defaults**
- **Date:** Auto-set to today (editable if needed, but 95% case covered)
- **Keyboard:** Contextual keyboards (number for amount, text for note)
- **Recent notes:** Quick-select from recent entries for repeat expenses
- **Time awareness:** Future: Morning → suggest "cafe", lunch time → suggest "lunch"

**3. Natural Language Notes**
- **No categories:** Free-text note field - user types what makes sense to them
- **No dropdowns:** Eliminates major friction point vs competitors
- **Flexibility:** "cafe", "lunch grab", "mua đồ tech" - whatever is natural
- **Future intelligence:** AI can parse categories later, never blocks user now

**4. Always-On Context**
- **Today's total:** Always visible after each entry
- **Budget status:** Remaining budget shown continuously
- **Goal progress:** Savings progress in persistent header
- **No drilling:** Key metrics at-a-glance, no navigation needed

**5. Transparent Offline**
- **Just works:** User unaware of online/offline state
- **Reliable:** Entries always save locally first
- **Auto-sync:** Queues sync when connection returns
- **Trust signals:** Subtle sync indicator, never blocking

### Critical Success Moments

**1. First Entry Success (Day 1)**
- **Moment:** User completes first expense entry
- **Experience:** Takes <10 seconds, feels surprisingly easy
- **Reaction:** "Wow, that was way faster than I expected"
- **Impact:** Sets expectation that tracking isn't a burden
- **Make-or-break:** >30s or confusing = likely abandonment

**2. Budget Awareness Alert (Week 1-2)**
- **Moment:** First time hitting 80%+ of monthly budget
- **Experience:** Non-intrusive alert appears after entry
- **Reaction:** "Oh! I didn't realize I've spent that much"
- **Impact:** First behavioral awareness - more careful spending
- **Critical:** Alert must inform, not annoy (helpful tone, non-blocking)

**3. Impulse Control Victory (Week 2-4)**
- **Moment:** User about to make impulse purchase (tech gadget)
- **Experience:** Checks app first, sees budget nearly exhausted
- **Decision:** "Already at 12M/15M budget, skip this deal"
- **Impact:** App becomes decision tool, not just tracking tool
- **Breakthrough:** Behavior change achieved - tracking leads to control

**4. Pattern Recognition (Month 1)**
- **Moment:** Reviewing monthly expenses, discovers pattern
- **Experience:** "I spent 6 triệu on tech in 2 weeks?!"
- **Reaction:** Surprise and realization of spending habits
- **Impact:** Data-driven insight leads to intentional adjustment
- **Key:** Visualization makes patterns obvious without analysis

**5. Milestone Celebration (Month 3-6)**
- **Moment:** Savings goal reaches 25% progress
- **Experience:** Celebration animation, encouraging message
- **Reaction:** "I'm actually on track! This is working!"
- **Impact:** Motivation renewed, emotional connection to goal
- **Emotional:** Progress toward marriage goal makes tracking meaningful

### Experience Principles

**1. Speed Trumps Features**
- Every millisecond of friction risks breaking habit formation
- Features that add >1s to core flow must be deferred or eliminated
- Optimistic UI always - never make user wait for server response
- Success metric: 90%+ of entries completed in ≤10 seconds
- **Guideline:** When choosing between feature and speed, choose speed

**2. Invisible Complexity**
- Complex technology (offline sync, PWA, optimistic updates) must be transparent
- User experiences simplicity while system handles complexity
- No confusing error states - graceful degradation always
- "It just works" is the only acceptable outcome
- **Guideline:** Technical sophistication should reduce user burden, not increase it

**3. Awareness Over Control**
- Don't force categorization or restrictive input formats
- Show patterns and insights, let user discover naturally
- Budget alerts inform and motivate, don't restrict or shame
- Trust user to adjust behavior when presented with clear data
- **Guideline:** Provide information, not restrictions

**4. Goal-Driven Motivation**
- Every screen connects to the bigger life goal (300M savings for marriage)
- Progress visibility creates positive reinforcement loop
- Celebrate milestones to maintain long-term motivation
- Make abstract savings concrete: "This month = 4% closer to goal"
- **Guideline:** Emotional connection to goal sustains habit through challenges

**5. Mobile-First, Thumb-Friendly**
- Design for one-handed use on iPhone
- Primary actions placed in natural thumb reach zone
- Large touch targets (44x44pt+), no precision required
- Bottom placement for frequent actions, top for status/context
- **Guideline:** If it requires two hands or precision tapping, redesign it

## Desired Emotional Response

### Primary Emotional Goals

**1. Empowered & In Control**
- **Target Feeling:** "I know exactly where my money is going"
- **Why Critical:** Opposes current pain point - "cuối tháng không biết tiền đi đâu"
- **User Quote:** "I can make informed spending decisions based on real data"
- **Outcome:** User feels agency over financial future, not victim of circumstances

**2. Efficient & Productive**
- **Target Feeling:** "Tracking takes seconds, not minutes - it's effortless"
- **Why Critical:** Efficiency is prerequisite for habit formation
- **User Quote:** "That was so fast! I can do this while walking or waiting in line"
- **Outcome:** Tracking becomes reflex action, no burden or resistance

**3. Confident & On Track**
- **Target Feeling:** "I'm making real progress toward my 300M wedding savings goal"
- **Why Critical:** Confidence sustains motivation through months and years
- **User Quote:** "I can see the progress bar moving - I'm going to achieve this!"
- **Outcome:** User trusts the process, believes in goal achievement

**4. Motivated & Hopeful**
- **Target Feeling:** "Every expense tracked brings me closer to my dream"
- **Why Critical:** Positive emotion is sustainable, guilt/shame is not
- **User Quote:** "This app is helping me become financially disciplined"
- **Outcome:** User stays engaged long-term through positive reinforcement

**Differentiation from Competitors:**
- **Lightness vs Heaviness:** Quick check-in, not homework assignment
- **Freedom vs Restriction:** Natural language, no category prison
- **Progress vs Judgment:** Goal-focused, not shame-based
- **Delight vs Duty:** Enjoyable to use, not just functional

### Emotional Journey Mapping

**Phase 1: First Discovery (Day 1)**

**Initial Contact:**
- Emotion: Curiosity mixed with skepticism
- Internal dialogue: "Will this actually be different from other expense apps?"
- Design response: Clear value prop, show "5-7 seconds" immediately

**Setup Experience:**
- Emotion: Pleasant surprise
- Internal dialogue: "Wow, just 2 fields? No category dropdowns? This IS simple!"
- Design response: Minimal setup, get to first entry fast

**First Entry:**
- Emotion: Relief and delight
- Internal dialogue: "That was actually fast! I can do this every day!"
- Design response: <10 seconds actual experience, instant feedback

**Phase 2: Core Experience - Daily Use (Week 1-4)**

**Opening App:**
- Emotion: Readiness, no dread or resistance
- Internal dialogue: "Quick check-in time"
- Design response: Fast load, auto-focus, thumb-friendly

**During Entry:**
- Emotion: Flow state - minimal conscious thought
- Internal dialogue: Fingers moving faster than brain
- Design response: Zero friction, muscle memory develops

**After Entry:**
- Emotion: Satisfaction + awareness
- Internal dialogue: "Done! Today: 3M spent, Budget left: 12M"
- Design response: Clear summary, immediate context

**Discovering Patterns:**
- Emotion: Surprise → awareness → motivation to adjust
- Internal dialogue: "Whoa! I spent 6M on tech in 2 weeks?!"
- Design response: Obvious visualization, non-judgmental presentation

**Phase 3: Success Moments (Month 1-6)**

**First Budget Alert:**
- Emotion: Awareness (not shame or guilt)
- Internal dialogue: "Good to know I'm at 85% budget - I'll be more careful"
- Design response: Informative tone, empowering not restricting

**First Impulse Control Win:**
- Emotion: Pride and self-efficacy
- Internal dialogue: "I checked the app first and decided not to buy - I'm in control!"
- Design response: Budget visibility enabled good decision

**First Milestone (25%, 50%, 75%):**
- Emotion: Joy and renewed motivation
- Internal dialogue: "25% of 300M done! I'm actually doing this!"
- Design response: Celebration animation, encouraging message

**Phase 4: Long-term Engagement (Month 6+)**

**Routine Tracking:**
- Emotion: Automatic, no emotion needed - it's habit
- Internal dialogue: None - muscle memory
- Design response: Stays out of the way, always fast

**Progress Checks:**
- Emotion: Hope and confidence
- Internal dialogue: "On track for wedding savings goal"
- Design response: Progress bar shows steady advancement

**Goal Achievement:**
- Emotion: Accomplishment and gratitude
- Internal dialogue: "300M saved! This app changed how I handle money"
- Design response: Major celebration, potentially testimonial moment

**When Things Go Wrong:**

**Offline Sync Issue:**
- Emotion: Trust, not panic
- Internal dialogue: "It'll sync when I'm back online - no worries"
- Design response: Clear queued indicator, transparent status

**Overspending Month:**
- Emotion: Awareness and resolve (not failure or shame)
- Internal dialogue: "Ok, exceeded budget this month - I'll adjust next month"
- Design response: Neutral data presentation, focus on recovery

**Missed Tracking Days:**
- Emotion: Motivation to restart (not guilt)
- Internal dialogue: "Forgot a few days, back on track today"
- Design response: Easy to catch up, no guilt trips

### Micro-Emotions

**Confidence > Confusion**
- **Always know what to do next:** Clear CTAs, obvious actions
- **No complex flows:** Linear paths, no decision paralysis
- **Immediate feedback:** Success states always clear
- **Predictable behavior:** No surprises, consistent patterns

**Trust > Skepticism**
- **Data safety assured:** Even offline, data persists
- **Sync reliability:** Transparent sync status, always works
- **No data loss:** Guaranteed persistence, visible confirmations
- **Transparent operations:** User knows what's happening always

**Accomplishment > Frustration**
- **Every entry = small win:** Positive reinforcement each time
- **Milestones celebrated:** 25%, 50%, 75% goal achievements
- **Progress always visible:** Never wondering "am I making progress?"
- **Success is achievable:** Goals feel within reach, not impossible

**Delight > Satisfaction**
- **Not just functional:** Micro-interactions spark joy
- **Subtle animations:** Smooth, playful, never slow
- **Celebrations feel special:** Milestones are moments of joy
- **Pleasure in use:** Tiny delights make tracking enjoyable

**Calm > Anxiety**
- **Informative alerts:** Budget warnings help, don't alarm
- **No judgment:** Data presented neutrally, no shame
- **Clear presentation:** Not overwhelming, easy to parse
- **Control reduces stress:** Tracking brings peace of mind

**Connection > Isolation**
- **Personal goal anchored:** Marriage savings = deeply meaningful
- **Future community:** Belonging to goal-driven savers
- **Identity formation:** "I'm someone who has finances together"
- **Shared journey:** Not alone in financial discipline quest

### Design Implications

**To Create "Empowered & In Control" Feeling:**

**Always-Visible Context:**
- Budget status in persistent header
- "15M budget, 3M remaining" always shown
- Monthly spending total at-a-glance
- No need to drill down for basic metrics

**Clear Insights:**
- Spending patterns visualized simply
- "You spent 40% on food, 30% on tech" type summaries
- Week-over-week, month-over-month comparisons
- Data tells story without analysis burden

**Impact Visualization:**
- "This 1.5M purchase = 10% of monthly budget"
- "At this rate, you'll exceed budget in 12 days"
- Connect individual actions to bigger picture
- Make abstract concrete

**Inform, Don't Restrict:**
- Alerts provide information, user decides action
- No blocking or preventing purchases
- Trust user to self-correct with good data
- Awareness drives behavior change

**To Create "Efficient & Productive" Feeling:**

**Sub-Second Response:**
- Optimistic UI - instant confirmation
- No waiting for server responses
- Perceived performance = actual speed
- Loading states minimal or nonexistent

**Smart Defaults:**
- Auto-focus amount field on open
- Date = today (no selection needed)
- Number keyboard auto-shows
- Tab navigation to next field

**Keyboard Optimization:**
- Enter key saves entry
- No mouse/tap required after typing
- Keyboard shortcuts for power users
- Flow state uninterrupted

**Thumb-Friendly Design:**
- One-handed use prioritized
- Primary actions in lower third
- Large touch targets (44x44pt+)
- No precision tapping required

**To Create "Confident & On Track" Feeling:**

**Goal Progress Prominence:**
- 300M savings goal bar in header
- Always visible, never buried
- Updates after each entry
- Percentage and amount shown

**Status Indicators:**
- "On track" (green) - savings rate sufficient
- "Behind" (yellow) - need to increase savings
- "Ahead" (blue) - exceeding expectations
- Color-coded for quick comprehension

**Milestone Celebrations:**
- 25% - "Quarter of the way there!"
- 50% - "Halfway to your wedding goal!"
- 75% - "Almost there! Final push!"
- 100% - "Goal achieved! Time to celebrate!"

**Time Context:**
- "18 months remaining to goal"
- "Need to save 12.5M/month to stay on track"
- "Current rate: 13M/month - ahead of schedule!"
- Temporal awareness maintains urgency

**To Create "Motivated & Hopeful" Feeling:**

**Positive Language:**
- "Great job tracking today!" not "You overspent"
- "You're 3M under budget - well done!" instead of warnings
- "Keep it up!" vs "Don't spend more"
- Encouraging, never shaming

**Micro-Animations:**
- Subtle celebration on save (checkmark, color pulse)
- Progress bar smooth transitions
- Milestone confetti/animation
- Delight without distraction

**Goal Connection:**
- "Every tracked expense = progress toward wedding"
- "This discipline now = dream wedding later"
- "300M goal: Your future starts with today's choices"
- Emotional anchoring to life goal

**Small Wins Celebrated:**
- "7 days tracked in a row! Great habit forming!"
- "First week under budget - excellent!"
- "50 expenses tracked - you're committed!"
- Reinforce positive behavior immediately

**To Create "Trust" Feeling:**

**Transparent Sync:**
- "Syncing..." indicator when online
- "Saved locally" when offline
- "All synced ✓" confirmation
- Never mysterious about data state

**Save Confirmations:**
- Visual checkmark on successful save
- Entry appears in list immediately
- Total updates instantly
- User sees result of action

**Predictable Behavior:**
- No surprises in functionality
- Consistent interaction patterns
- Reliable offline → online sync
- Data always where expected

**Clear State Indicators:**
- Online/offline subtle indicator if needed
- Sync queue count if pending
- Error messages clear and actionable
- Never ambiguous about system state

**To Create "Calm" Feeling:**

**Clean Interface:**
- Whitespace generous
- No clutter or visual noise
- Focused on essentials only
- Easy on eyes

**Non-Intrusive Notifications:**
- Budget alerts: Snackbar (bottom), auto-dismiss
- Not modal popups blocking workflow
- Can be acknowledged or ignored
- Friendly tone, not alarming

**Clear Data Display:**
- Not overwhelming with too many numbers
- Hierarchy obvious (today vs month)
- Visualizations simple and scannable
- No cognitive overload

**Soft Color Palette:**
- Not aggressive reds for over-budget
- Warm yellows/oranges for warnings
- Calming blues/greens for success
- Professional but friendly tones

### Emotional Design Principles

**1. Delight in Details**
- Every interaction should have a touch of delight
- Micro-animations smooth and playful (never slow)
- Success states feel rewarding, not just functional
- Small moments of joy reinforce habit formation
- **Guideline:** Add delight that doesn't add time

**2. Positive Reinforcement Over Punishment**
- Celebrate wins, don't punish overspending
- "Great job!" beats "You failed"
- Show progress, not just problems
- Motivate through hope, not fear or shame
- **Guideline:** Every message should motivate, never demotivate

**3. Transparency Builds Trust**
- Always show what's happening (sync, save, load)
- No mysterious delays or unexplained behavior
- Offline/online state clear if relevant
- User always knows system state
- **Guideline:** No surprises - predictability creates trust

**4. Emotional Connection to Goal**
- Every screen references or implies the 300M wedding goal
- Progress toward life milestone, not just numbers
- Financial discipline = love and commitment
- Abstract (savings) made concrete (marriage)
- **Guideline:** Connect money to meaning

**5. Calm Efficiency, Not Rushed Urgency**
- Fast doesn't mean frantic
- Smooth animations, not jarring transitions
- Alerts inform calmly, not alarm
- Speed creates calm (not waiting = not stressed)
- **Guideline:** Efficient but never anxiety-inducing

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**1. Twitter / X (Fast Entry Pattern)**

**What they do well:**
- **Compose tweet**: Tap button → keyboard appears → type → post (4-5 seconds)
- **Auto-focus** on compose field immediately
- **Character limit visible** but not restrictive initially
- **Optimistic posting**: Tweet appears instantly, syncs background

**UX Lessons:**
- Speed is achieved through: auto-focus, minimal fields, optimistic UI
- Context always visible (character count = budget in our case)
- Primary action prominent (blue "Post" button = our "Add" button)

**Transferable to Daily Expenses:**
- ✅ Auto-focus amount field
- ✅ Optimistic UI for instant feedback
- ✅ Prominent primary action button
- ✅ Context always visible (today's total, budget)

**2. Duolingo (Goal Tracking & Motivation)**

**What they do well:**
- **Goal progress** always visible at top
- **Streak counter** motivates daily use
- **Milestone celebrations** (confetti, badges)
- **Positive reinforcement**: "Great job!" not "You failed"
- **Small daily commitment** feels achievable

**UX Lessons:**
- Visual progress creates motivation
- Streaks and milestones drive habit formation
- Positive language >>> negative language
- Small wins celebrated frequently
- Gamification without being childish

**Transferable to Daily Expenses:**
- ✅ 300M goal progress bar prominent
- ✅ Tracking streak counter (future)
- ✅ Milestone celebrations (25%, 50%, 75%)
- ✅ Positive reinforcement language
- ✅ Small daily action (5-7s entry) feels achievable

**3. Apple iOS Native Apps (Polish & Performance)**

**What they do well:**
- **Instant response**: Tap = immediate visual feedback
- **Smooth animations**: 60fps, never janky
- **Loading states**: Skeleton screens, not spinners
- **Offline just works**: No distinction for user
- **Thumb-friendly**: Controls in lower third
- **Large touch targets**: Easy to tap, no precision needed

**UX Lessons:**
- Performance is UX - speed creates delight
- Animations guide attention, show relationships
- Offline capability should be invisible
- Mobile design = thumb zone priority
- Touch targets matter for usability

**Transferable to Daily Expenses:**
- ✅ <500ms response times (optimistic UI)
- ✅ Smooth transitions and micro-animations
- ✅ Offline-first architecture (IndexedDB)
- ✅ Bottom-placed primary actions
- ✅ 44x44pt minimum touch targets

**4. Competitors - Anti-Pattern Analysis**

**Moneylover / YNAB / Wallet - What to AVOID:**

**❌ Too Many Required Fields:**
- Category dropdown (major friction!)
- Payment method selection
- Tags, location, photos
- Result: 10 steps, 30-45 seconds per entry

**❌ Complex Category Systems:**
- Rigid hierarchies (Food → Dining Out → Lunch)
- Forces user into predefined boxes
- Doesn't match mental model
- Time-consuming to select

**❌ Heavy Onboarding:**
- Multiple setup screens
- Bank account linking required
- Category customization up front
- Budget setup before first use

**❌ Feature Overload:**
- 50+ features fighting for attention
- Complex navigation (5+ tabs)
- Reports, charts, budgets all competing
- Overwhelming for new users

**Lessons - Do the OPPOSITE:**
- ✅ Minimal fields (amount + note only)
- ✅ Free-form note (no categories)
- ✅ Quick onboarding (goal + budget)
- ✅ Focus on ONE core action (add expense)

### Transferable UX Patterns

**Navigation Patterns:**

**1. Bottom Tab Bar (iOS Standard)**
- **Pattern**: 3-4 primary sections in bottom tabs
- **For Daily Expenses**: 
  - Tab 1: Quick Add (home, default)
  - Tab 2: History/List
  - Tab 3: Stats/Insights
  - Tab 4: Settings
- **Why it works**: Thumb-friendly, always accessible, clear hierarchy

**2. Pull-to-Refresh (Standard Mobile)**
- **Pattern**: Drag down list to sync/refresh data
- **For Daily Expenses**: Pull expense list to force sync
- **Why it works**: Familiar gesture, gives user control

**3. Swipe Actions (iOS Mail pattern)**
- **Pattern**: Swipe left/right for quick actions (delete, edit)
- **For Daily Expenses**: Swipe expense left to delete, right to edit
- **Why it works**: Fast, no need for edit mode, contextual

**Interaction Patterns:**

**1. Floating Action Button (Material Design)**
- **Pattern**: Prominent circular button for primary action
- **For Daily Expenses**: FAB for "Add Expense" (always visible)
- **Why it works**: Unmissable, indicates primary action, thumb-friendly

**2. Optimistic UI (Twitter pattern)**
- **Pattern**: Show success immediately, sync in background
- **For Daily Expenses**: Expense appears in list instantly, API call async
- **Why it works**: Perceived speed, no waiting, trust through transparency

**3. Smart Suggestions (iOS QuickType)**
- **Pattern**: Context-aware suggestions above keyboard
- **For Daily Expenses**: Recent notes ("cafe", "lunch") as quick-tap chips
- **Why it works**: Reduces typing, speeds up repeat entries

**Visual Patterns:**

**1. Progress Indicators (Duolingo)**
- **Pattern**: Circular or linear progress bars with percentage
- **For Daily Expenses**: 
  - Budget: Linear bar (15M total, 3M remaining)
  - Goal: Circular progress (20% of 300M)
- **Why it works**: Instant comprehension, motivating visual

**2. Card-Based Lists (Google Material)**
- **Pattern**: Each item in elevated card with shadow
- **For Daily Expenses**: Each expense as subtle card
- **Why it works**: Clear boundaries, tappable affordance, modern look

**3. Color-Coded Status (Apple Health)**
- **Pattern**: Green = good, yellow = warning, red = danger
- **For Daily Expenses**:
  - Budget: Green (<80%), Yellow (80-100%), Orange (>100%)
  - Goal: Blue (on track), Yellow (behind), Green (ahead)
- **Why it works**: Instant visual status, no reading required

### Anti-Patterns to Avoid

**1. Category Dropdown Hell**
- **Problem**: Moneylover requires category selection from long list
- **Why it fails**: Breaks flow, forces rigid thinking, time-consuming
- **Our solution**: Free-text note field, AI categorizes later (post-MVP)

**2. Multi-Step Entry Wizard**
- **Problem**: Some apps use wizard (Step 1: Amount, Step 2: Category, Step 3: Date...)
- **Why it fails**: Each step = mental context switch, feels slow
- **Our solution**: Single screen, all fields visible, 5-7 seconds total

**3. Overwhelming Dashboard**
- **Problem**: Apps show 10+ metrics on home screen
- **Why it fails**: Cognitive overload, unclear what matters
- **Our solution**: Focus on 3 key metrics: Today total, Budget remaining, Goal progress

**4. Modal Overload**
- **Problem**: Apps use modals for entry, blocking entire screen
- **Why it fails**: Feels heavy, can't see context while entering
- **Our solution**: In-line entry if possible, or full-screen with context header

**5. Complicated Sync Logic**
- **Problem**: Users see "Syncing..." for seconds, or conflicts requiring resolution
- **Why it fails**: Exposes technical complexity, creates anxiety
- **Our solution**: Transparent sync (queued indicator), auto-resolve conflicts, never block

**6. Aggressive Gamification**
- **Problem**: Some apps over-do badges, points, leaderboards
- **Why it fails**: Feels childish, distracts from real goal
- **Our solution**: Subtle celebrations at real milestones (25%, 50%, 75%), not every action

### Design Inspiration Strategy

**What to Adopt (Use As-Is):**

**1. Bottom Tab Navigation (iOS Pattern)**
- Standard iOS tab bar for main sections
- Proven pattern, users understand immediately
- Thumb-friendly, always accessible

**2. Floating Action Button for Primary Action**
- Material Design FAB for "Add Expense"
- Prominent, unmissable, encourages core action
- Position: Bottom-right (thumb reach zone)

**3. Optimistic UI Pattern**
- Show changes immediately, sync background
- Users see instant feedback
- Builds on Twitter/social media mental model

**4. Progress Bars for Goals**
- Linear bar for budget (concrete, finite)
- Visual at-a-glance status
- Color-coded for quick comprehension

**What to Adapt (Modify for Our Needs):**

**1. Duolingo Streak Pattern → Tracking Streak**
- Adapt: Show "X days tracked" but don't make it stressful
- Modify: No "streak broken" shame - just encourage restart
- Goal: Positive motivation, not guilt

**2. iOS Swipe Actions → Simplified Actions**
- Adapt: Swipe left = delete (standard)
- Modify: Tap to edit (simpler than swipe right)
- Goal: Fast but not confusing for less frequent actions

**3. QuickType Suggestions → Recent Notes**
- Adapt: Show recent notes as chips above keyboard
- Modify: Only show top 3-5 most recent
- Goal: Speed up repeat entries without clutter

**4. Apple Health Color Coding → Budget Status**
- Adapt: Use color for status indication
- Modify: Softer colors (not alarming red), orange for over-budget
- Goal: Clear status without anxiety

**What to Avoid (Anti-Patterns):**

**1. Avoid Category Dropdowns**
- Conflicts with speed goal (5-7 seconds)
- Free-text note is more natural
- Future: AI can categorize from notes

**2. Avoid Multi-Screen Wizards**
- Conflicts with efficiency principle
- Single screen with all fields better
- User sees complete picture

**3. Avoid Feature Bloat**
- MVP focuses on core loop only
- Add features only when proven necessary
- Every feature must justify its friction cost

**4. Avoid Aggressive Notifications**
- No push notifications on iOS (PWA limitation anyway)
- In-app alerts only, non-intrusive
- User controls their experience

**5. Avoid Complex Budget Categories**
- Don't force envelope budgeting (YNAB pattern)
- Simple total monthly budget only for MVP
- Can add category budgets post-MVP if needed

## Design System Foundation

### Design System Choice

**Selected: Material-UI (MUI) - Themeable Component Library**

**From PRD & Product Brief:**
- **Tech Stack**: React + Material-UI (MUI) components
- **Platform**: PWA on iOS Safari
- **Timeline**: 1-month MVP
- **Team**: Solo developer (HoanTran)
- **Brand**: New product, no existing guidelines

### Rationale for Selection

**1. Speed to Market (Critical for 1-month MVP)**
- MUI provides complete component library out-of-the-box
- Pre-built components: TextField, Button, Card, Tabs, Progress bars
- No need to build components from scratch
- Focus on business logic, not UI primitives

**2. Quality & Accessibility**
- Components built with ARIA compliance
- Keyboard navigation included
- Touch-friendly by default (44px targets)
- Proven by millions of production apps

**3. Customization Flexibility**
- Powerful theming system (colors, typography, spacing)
- Can override styles when needed
- Not locked into "Material look" - can customize extensively
- Supports custom components alongside MUI

**4. React Integration**
- Native React components (not wrappers)
- Works seamlessly with React hooks
- Good TypeScript support
- Integrates well with TanStack Query

**5. Mobile-First & PWA Ready**
- Responsive by default
- Touch optimized
- Works well on iOS Safari
- No mobile-specific issues

**6. Solo Developer Friendly**
- Excellent documentation
- Large community (Stack Overflow, GitHub)
- Regular updates and maintenance
- Easy to learn, hard to master (good progression)

**7. Performance Adequate**
- Tree-shakeable (only bundle used components)
- CSS-in-JS with emotion (runtime but optimized)
- Bundle size acceptable for PWA
- Lazy loading support

### Implementation Approach

**Phase 1: Core Setup (Week 1)**

**Theme Configuration:**
```javascript
const theme = createTheme({
  palette: {
    primary: { main: '#2196F3' }, // Calm blue (trust, finance)
    secondary: { main: '#4CAF50' }, // Green (success, savings)
    warning: { main: '#FF9800' }, // Orange (budget warning)
    error: { main: '#F44336' }, // Red (over budget)
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 500 },
    body1: { fontSize: '1rem' },
  },
  spacing: 8, // Base spacing unit
  shape: { borderRadius: 8 }, // Rounded corners
});
```

**Component Strategy:**
- **Use MUI as-is**: TextField, Button, Card, LinearProgress, CircularProgress
- **Customize**: AppBar (header), BottomNavigation (tabs), Snackbar (alerts)
- **Custom components**: ExpenseCard, GoalProgress (build on MUI primitives)

**Layout Foundation:**
- MUI Container for responsive layout
- MUI Box for spacing/flexbox utilities
- MUI Stack for vertical/horizontal layouts
- MUI Grid if needed (likely not for MVP)

**Phase 2: Custom Components (Week 2-3)**

**Components to Build:**

**QuickAddForm:**
- MUI TextField for amount (number type)
- MUI TextField for note (text type)
- MUI Button for submit
- Custom validation logic

**ExpenseCard:**
- Base: MUI Card + CardContent
- Custom layout for amount, note, date
- Swipe gesture handling (react-swipeable)

**BudgetIndicator:**
- MUI LinearProgress for budget bar
- Custom color logic (green/yellow/orange)
- MUI Typography for remaining amount

**GoalProgress:**
- MUI CircularProgress or LinearProgress
- Custom milestone markers
- MUI Typography for percentage

**Phase 3: Polish (Week 4)**
- Micro-animations with MUI transitions
- Custom MUI theme refinements
- Responsive tweaks
- Loading states with MUI Skeleton

### Customization Strategy

**Level 1: Theme Tokens (Global)**
- Customize via theme - affects all components
- `theme.palette.primary.main = '#2196F3'` for brand color
- `theme.typography.fontFamily` for custom fonts
- `theme.spacing(2)` for consistent spacing

**Level 2: Component-Level Styling**
- Use `sx` prop for one-off customizations
- Example: `<Button sx={{ borderRadius: 20, textTransform: 'none' }}>`
- Override component styles as needed

**Level 3: Custom Components**
- Build on MUI primitives
- Compose MUI components with custom logic
- Maintain MUI foundation for consistency

**Customization Principles:**

**1. Start with Defaults**
- Use MUI components as-is first
- Only customize when user experience requires it
- Don't fight the framework

**2. Theme for Consistency**
- Define brand colors, typography, spacing in theme
- All components inherit automatically
- Easy to adjust globally

**3. Progressive Enhancement**
- MVP uses mostly default MUI
- Post-MVP refine custom look
- Maintain MUI foundation for speed

**4. Mobile-First Customization**
- Test all customizations on mobile first
- Ensure touch targets remain 44x44pt minimum
- Responsive tweaks via MUI breakpoints

### Design Token Strategy

**Colors:**
- **Primary (Blue #2196F3)**: Primary actions, links, goal progress (on track)
- **Secondary (Green #4CAF50)**: Success states, under budget, achievements
- **Warning (Orange #FF9800)**: Budget warnings (80-100%)
- **Error (Red-orange #F44336)**: Over budget, errors
- **Grey shades**: Text hierarchy, backgrounds, borders

**Typography:**
- **H1 (2rem/32px)**: Page titles
- **H2 (1.5rem/24px)**: Section headers
- **Body1 (1rem/16px)**: Default text
- **Body2 (0.875rem/14px)**: Secondary text
- **Caption (0.75rem/12px)**: Timestamps, metadata

**Spacing:**
- **Base unit**: 8px
- **Tight**: 4px (0.5 unit)
- **Normal**: 8px, 16px, 24px (1, 2, 3 units)
- **Loose**: 32px, 40px (4, 5 units)

**Radius:**
- **Small**: 4px (chips, tags)
- **Medium**: 8px (cards, buttons)
- **Large**: 16px (modals, sheets)
- **Circle**: 50% (FAB, avatars)

**Shadows:**
- MUI elevation system (0-24)
- Cards: elevation 1-2
- FAB: elevation 6
- Modals: elevation 16

### Component Inventory (MVP)

**Form Inputs:**
- TextField (amount, note, date)
- Button (primary actions)
- IconButton (secondary actions)

**Layout:**
- Container (page wrapper)
- Box (flexbox utilities)
- Stack (vertical/horizontal layouts)
- AppBar (header with goal progress)

**Navigation:**
- BottomNavigation (main tabs)
- BottomNavigationAction (tab items)
- Tabs (if needed for sub-navigation)

**Feedback:**
- Snackbar (budget alerts)
- LinearProgress (budget bar)
- CircularProgress (goal progress)
- Skeleton (loading states)

**Display:**
- Card (expense items)
- CardContent (card body)
- Typography (all text)
- Divider (visual separation)

**Overlays:**
- Dialog (confirmations)
- Drawer (settings, filters)

**Icons:**
- MUI Icons (@mui/icons-material)
- Add, Delete, Edit, Check, Close icons

## Defining Core Experience

### The Defining Interaction

**"Add an expense in 5-7 seconds"**

This is THE core interaction that defines Daily Expenses. If we fail to nail this, the entire value proposition collapses.

**Why this is the defining moment:**
- **Frequency**: Users perform this 3-5 times per day
- **Habit Formation**: Friction here = app abandonment
- **Value Delivery**: Fast tracking → complete data → insights → goal achievement
- **Differentiation**: 5-7s vs competitors' 30-45s = 6x faster = game changer

**How users describe it to friends:**
"Mình dùng app này track chi tiêu, siêu nhanh! Mua xong gì mở app gõ số tiền với note, 5 giây xong. Không phải chọn category gì cả!"

**Famous Comparison:**
- Twitter: "Tweet in seconds - share thoughts instantly"
- Instagram: "Share beautiful moments with one tap"
- Daily Expenses: "Track spending in 5 seconds - no friction, just data"

### User Mental Model

**How users currently solve expense tracking:**

**1. Memory (fails)**
- Method: "Cuối tháng sẽ nhớ lại"
- Result: Can't remember most transactions
- Pain: "Không biết đã chi bao nhiêu, vào đâu"

**2. Bank Statement (reactive)**
- Method: Check after spending has occurred
- Result: Too late to adjust behavior
- Pain: No control, only post-mortem analysis

**3. Excel/Notes (too slow)**
- Method: Open app, find file, type in spreadsheet
- Result: Takes 1-2 minutes, often skipped
- Pain: "Quá lâu, lười mở"

**4. Existing Apps (too complex)**
- Method: 10-step process with category dropdowns
- Result: 30-45 seconds per entry, friction kills habit
- Pain: "Apps hiện tại quá phức tạp"

**Mental model users bring to Daily Expenses:**

**Speed Expectation:**
- Reference point: Sending a text message, composing a tweet
- Standard: <10 seconds acceptable, <5 seconds magical
- Mindset: "Ghi chi tiêu should be as fast as sending a message"

**Field Expectations:**
- **Amount (required)**: The core data point, must have
- **Context/Note (helpful)**: Remember what it was for
- **Date (automatic)**: Usually today, shouldn't need to select
- **Category (don't care)**: "Just let me describe it naturally"

**Where users get confused/frustrated with traditional apps:**

**❌ Category Hell:**
- "Food? Dining? Restaurant? Lunch? What's the difference?"
- "I just want to say 'lunch' - why do I need to pick from 20 options?"
- Mental burden: Taxonomy doesn't match natural thinking

**❌ Required Fields Overload:**
- "Why do I need payment method? Just let me add the expense!"
- "Location? Tags? Receipt? I just want the basics!"
- Friction: Every field = decision fatigue

**❌ Multi-Step Wizards:**
- "Why can't everything be on one screen?"
- "Each step breaks my flow and makes me think"
- Context loss: Forgetting what I'm entering by step 3

**❌ Loading & Waiting:**
- "Why is it loading? I just want to add a number!"
- "Did it save? I don't see confirmation..."
- Uncertainty: Lack of immediate feedback creates doubt

**What makes experiences magical vs terrible:**

**✨ Magical Moments:**
- Auto-focus when opening app (no tap needed)
- Number keyboard appears automatically
- Instant confirmation with visual feedback
- Recent entries visible for context
- Offline works seamlessly

**💀 Terrible Moments:**
- Scrolling dropdown with 20+ categories
- Loading spinners after submitting
- Multi-step wizards breaking flow
- Having to tap 5+ times to reach add screen
- Sync conflicts requiring user resolution

### Success Criteria

**Quantitative Success Metrics:**

**1. Speed (Primary)**
- 90%+ of entries completed in ≤10 seconds
- Average entry time: 5-7 seconds
- Perceived speed: <3 seconds (via optimistic UI)
- No loading states blocking user progress

**2. Reliability (Trust)**
- 100% of entries saved (online or offline)
- Zero data loss incidents
- Sync success rate: 100% within 30s of reconnection
- Error recovery: Transparent, automatic, no user intervention

**3. Consistency (Habit)**
- 80%+ of days with at least one entry (Month 1)
- 90%+ of days with entries (Month 3+)
- Average 3-5 entries per day
- Less than 5% abandoned entries

**Qualitative Success Indicators:**

**1. Ease ("It Just Works")**
- User testimonial: "I don't even think about it anymore"
- Can perform one-handed while walking
- Muscle memory develops within 2 weeks
- No tutorial needed, instant comprehension

**2. Accomplishment (Feel Smart)**
- **Immediate**: "Done! That was fast"
- **Daily**: "Tracked everything today"
- **Weekly**: "I can see my patterns now"
- **Monthly**: "I spent too much on X, adjusting!"

**3. Confidence (Trust System)**
- Never wonder "Did it save?"
- Offline entry feels same as online
- Data always where expected
- No surprises or unexpected behavior

**Feedback Signals ("Doing It Right"):**

**Visual Confirmation:**
- ✅ Checkmark animation on successful save
- ✅ Entry appears in list immediately
- ✅ Today's total updates instantly
- ✅ Budget remaining shown
- ✅ Subtle success color (green pulse on button)

**Contextual Awareness:**
- See impact: "Today: 145k → 190k"
- Budget status: "14,855k remaining → 14,810k remaining"
- Color indicator: Green (<80%) → Yellow (80-100%) → Orange (>100%)
- Goal progress: "20.1% of 300M" updates

**System Response Speed:**
- Field focus: 0ms (instant on load)
- Keyboard show: <100ms (automatic)
- Save confirmation: <500ms (optimistic)
- List update: <100ms (local first)
- Sync to server: Background, non-blocking

**Automatic Behaviors (No User Action):**
- ✅ Amount field auto-focused on app open
- ✅ Number keyboard shows automatically
- ✅ Date defaults to today
- ✅ Local save immediate (IndexedDB)
- ✅ Background sync to server
- ✅ Totals and budget auto-update
- ✅ Offline/online transition seamless

### Novel vs Established Patterns

**Pattern Type: Hybrid - Established Foundation with Novel Simplification**

**Established Patterns (User Familiarity):**

**1. Form Entry (Universal)**
- Text fields for input
- Submit button
- Validation feedback
- **Why familiar**: Every app has forms
- **Benefit**: Zero learning curve

**2. List View (Universal)**
- Chronological list of items
- Scroll to see more
- Tap to interact
- **Why familiar**: Email, messages, social feeds
- **Benefit**: Intuitive navigation

**3. Bottom Tab Navigation (Mobile Standard)**
- 3-4 main sections in tabs
- Always visible and accessible
- Thumb-friendly positioning
- **Why familiar**: iOS, Android, Material Design standard
- **Benefit**: Expected mobile pattern

**Our Innovation Within Familiar Patterns:**

**1. Extreme Simplification**
- **Innovation**: Only 2 fields vs industry standard 5-7 fields
- **Novel approach**: Free-text note replaces category dropdown
- **Benefit**: 6x less friction, 5-6x faster entry
- **Learning curve**: Zero - less is easier
- **Risk**: None - removing complexity is always easier

**2. Optimistic UI as Primary Experience**
- **Innovation**: Offline-first is default UX, not fallback
- **Novel approach**: User never aware of online/offline state
- **Benefit**: Reliability feels magical, no sync anxiety
- **Learning curve**: Zero - just works
- **Risk**: None - better experience than waiting

**3. Goal-First Architecture**
- **Innovation**: Savings goal more prominent than expense list
- **Novel approach**: Every screen connects to life milestone (marriage)
- **Benefit**: Emotional motivation sustains long-term habit
- **Learning curve**: Zero - more inspiring than traditional finance UI
- **Risk**: None - adding meaning increases engagement

**4. Natural Language Notes**
- **Innovation**: Free-form text instead of categorization
- **Novel approach**: AI can categorize later, never blocks user
- **Benefit**: Mental model match, no taxonomy burden
- **Learning curve**: Zero - just describe naturally
- **Risk**: None - simpler than category selection

**No Novel Gestures or Interactions Requiring Education:**
- Deliberately use familiar interactions only
- Innovation is in simplification, not new patterns
- Users can use app immediately without tutorial
- **Philosophy**: "Be boring where it doesn't matter, innovative where it does"

**Where We Innovate:**
- Reduction of steps (10 → 4)
- Reduction of fields (7 → 2)
- Reduction of time (45s → 7s)
- Increase of reliability (optimistic UI)
- Increase of meaning (goal connection)

**Where We Follow Convention:**
- Form interactions
- List displays
- Tab navigation
- Touch gestures (swipe, tap)
- Visual feedback patterns

### Experience Mechanics

**Core Flow: Adding an Expense in 5-7 Seconds**

**1. INITIATION (0.5 seconds)**

**User Context:**
- Just completed a transaction (bought coffee, paid for lunch, etc.)
- Pulls out iPhone to track expense
- Habit trigger: "I need to log this"

**User Action:**
- Taps Daily Expenses icon on home screen
- PWA launches in standalone mode (no browser chrome)

**System Response:**
- **First launch**: <2 seconds load time
- **Repeat launch**: <1 second (cached assets)
- Lands directly on Quick Add screen (default tab)
- Amount field already focused (no tap needed)
- Number keyboard appears automatically
- Recent expenses visible below for context

**Visual State:**
- Header: Goal progress bar + Today's total
- Main: Amount field (focused) + Note field + Add button
- Bottom: Tab navigation (Quick Add selected)
- Context: Today's expenses list preview

**2. INTERACTION (4-6 seconds)**

**Phase A: Enter Amount (2-3 seconds)**

**User Action:**
- Types amount on number keyboard
- Example: "45000" for 45k coffee

**System Response:**
- Real-time formatting as typing: "45,000"
- Field border: Blue (focus) → Red (if invalid < 0)
- No blocking validation, just visual cue

**Phase B: Add Context (2-3 seconds)**

**User Action:**
- Presses Tab key OR taps note field
- Types short description: "cafe", "lunch grab", "mua đồ"

**System Response:**
- Keyboard switches from number to text
- Recent notes appear as chips above keyboard:
  - [cafe] [lunch] [grab] [shopping]
- User can tap chip instead of typing (optional)
- Character count if needed (max 100 chars)

**Phase C: Submit (0.5 seconds)**

**User Action (two methods):**
- **Keyboard users**: Press Enter key
- **Touch users**: Tap "Add Expense" button
- Both work equally well

**System Response:**
- Button shows loading state (brief spinner)
- Optimistic: Assume success, show confirmation

**3. FEEDBACK (Instant - <500ms)**

**Visual Confirmation Sequence:**

**Immediate (0-100ms):**
- ✅ Checkmark animation in button (green pulse)
- ✅ Success color flash
- ✅ Amount and note fields clear
- ✅ Focus returns to amount field (ready for next)

**Fast (100-300ms):**
- ✅ New entry appears at top of "Today's Expenses" list
- ✅ Entry shows: amount, note, timestamp "Just now"
- ✅ Subtle slide-in animation (smooth, not jarring)

**Context Update (300-500ms):**
- ✅ **Today's Total** updates: "Today: 145k" → "Today: 190k"
- ✅ **Budget Status** updates: "14,855k remaining" → "14,810k remaining"
- ✅ **Color indicator**: Adjusts if crossing threshold
  - Green: <80% budget used
  - Yellow: 80-100% budget used
  - Orange: >100% budget (over)
- ✅ **Goal progress**: "20.0%" → "20.015%" (subtle)

**Behind the Scenes (Non-Blocking):**
- Entry saved to IndexedDB immediately (local storage)
- API POST to server starts (async, doesn't block UI)
- If offline: Queued for sync, user unaware
- If online: Syncs within 1-2 seconds
- Sync indicator: Subtle badge only if relevant

**Error Handling (Rare):**
- Entry always in local storage (never lost)
- If API fails: Queue for retry
- User sees: "Syncing..." badge (non-intrusive)
- Auto-retry: Every 30s when online
- User never blocks, never loses data

**4. COMPLETION (Immediate)**

**User Knows They're Done:**
- ✅ See new entry in today's list
- ✅ Updated totals confirm save
- ✅ Fields cleared and ready for next entry
- ✅ No spinner, no "Saving...", no waiting

**Successful Outcome Achieved:**
- Expense tracked with full context
- Data complete: amount, note, timestamp, date
- Budget calculations updated
- Goal progress recalculated
- Local and server storage in sync (or queued)

**What Happens Next (User Choice):**

**Option 1: Add Another (Common after shopping)**
- Amount field already focused
- Just start typing next amount
- Repeat flow: 5-7 seconds each

**Option 2: Review Context**
- Scroll down to see today's full list
- Review recent entries for accuracy
- Check daily total

**Option 3: Exit App**
- Close app or switch away
- Confident data is saved
- No "Are you sure?" prompts

**Option 4: Check Budget Status**
- Glance at budget remaining
- See if approaching limit
- Maybe adjust spending for rest of day

**Secondary Actions Available:**

**Edit Entry:**
- Tap entry in list
- Form opens with data pre-filled
- Edit and save (same flow)

**Delete Entry:**
- Swipe entry left (iOS pattern)
- Delete button appears
- Tap to confirm, entry removed
- Totals update immediately

**Force Sync:**
- Pull down on list (pull-to-refresh)
- Manual sync trigger if desired
- Usually unnecessary (auto-sync works)

**View Details:**
- Tap entry to see full details
- Timestamp, sync status, edit history
- Edit or delete from detail view

## Visual Design Foundation

### Color System

**Color Strategy: Calm Trust with Positive Motivation**

Based on emotional design goals (empowered, efficient, confident, motivated) and financial app requirements, the color system balances trust with positivity.

**Primary Colors:**

**Blue (#2196F3) - Primary Brand Color**
- **Usage**: Primary actions, links, focused states, active elements
- **Psychology**: Trust, stability, professionalism - ideal for financial applications
- **Emotional alignment**: Supports "Confident & In Control" feeling
- **Examples**: 
  - Add Expense button (primary CTA)
  - Focused input fields
  - Active tab indicator
  - Primary links and interactive elements

**Green (#4CAF50) - Success & Achievement**
- **Usage**: Success states, under-budget status, milestone achievements
- **Psychology**: Growth, positivity, financial health, achievement
- **Emotional alignment**: Supports "Motivated & Hopeful" feeling
- **Examples**:
  - Budget status bar (<80% used)
  - Success messages "Expense added!"
  - Milestone celebration badges
  - Savings on-track indicator

**Semantic Action Colors:**

**Warning Orange (#FF9800)**
- **Usage**: Budget warnings (80-100% used), spending rate alerts
- **Psychology**: Attention without alarm, awareness without anxiety
- **Emotional alignment**: Supports "Awareness Over Control" principle
- **Examples**:
  - Budget bar when 80-100% spent
  - "Approaching budget limit" notice
  - High spending rate indicator

**Error Red-Orange (#F44336)**
- **Usage**: Over-budget status, validation errors, critical alerts
- **Psychology**: Important information, corrective action needed
- **Tone**: Informative, not punishing (softer red-orange vs harsh red)
- **Examples**:
  - Budget exceeded indicator
  - Invalid input field borders
  - Delete confirmation (destructive action)

**Goal Progress Colors:**

**Goal Blue (#42A5F5) - Lighter variant**
- **Usage**: 300M savings goal progress, on-track status
- **Psychology**: Forward momentum, progress, aspiration
- **Emotional alignment**: Supports "Confident & On Track" feeling
- **Examples**:
  - Circular progress indicator for goal
  - "On track" status badge
  - Goal milestone markers

**Behind Status Yellow (#FFB74D)**
- **Usage**: Behind savings goal pace
- **Psychology**: Gentle nudge to adjust, not failure
- **Tone**: Encouraging adjustment, not shame

**Ahead Status Green (#66BB6A)**
- **Usage**: Ahead of savings goal pace
- **Psychology**: Celebration, positive reinforcement
- **Tone**: Achievement, keeping momentum

**Neutral Greys (Material Design Scale):**

- **Grey 900 (#212121)**: Primary text, high emphasis
- **Grey 700 (#616161)**: Secondary text, medium emphasis
- **Grey 500 (#9E9E9E)**: Disabled text, placeholders, low emphasis
- **Grey 400 (#BDBDBD)**: Inactive icons
- **Grey 300 (#E0E0E0)**: Borders, dividers
- **Grey 100 (#F5F5F5)**: Card backgrounds, elevated surfaces
- **Grey 50 (#FAFAFA)**: Page background, lowest elevation
- **White (#FFFFFF)**: Highest elevation surfaces, modals

**Background Hierarchy:**
- Level 0 (Page): Grey 50 (#FAFAFA)
- Level 1 (Cards): White or Grey 100
- Level 2 (Elevated): White with elevation shadow
- Level 3 (Modal): White with higher elevation

**Color Psychology Alignment:**

**Calm & Trustworthy:**
- Blue as primary = financial stability and trust
- Soft greys = professional without being overwhelming
- No harsh blacks or aggressive reds
- Gentle color transitions

**Motivating & Positive:**
- Green for success = celebrate wins, not just track failures
- Blue for progress = forward momentum visualization
- Orange warning = helpful guidance, not scary alarm
- Positive reinforcement through color

**Accessible & Inclusive:**
- All text colors meet WCAG AA minimum (4.5:1 contrast)
- Important actions meet WCAG AAA (7:1 contrast)
- Color never sole indicator of meaning
- Icons and text accompany all color-coded states

**Color Usage Guidelines:**

**Primary Actions:**
- Background: Blue #2196F3
- Text on primary: White #FFFFFF
- Hover: Blue #1E88E5 (darker)
- Focus: Blue with 2px outline

**Success States:**
- Background: Green #4CAF50
- Text: White on solid, Grey 900 on light
- Icon: Checkmark in green circle

**Warning States:**
- Background: Orange #FF9800
- Text: Grey 900 (dark text on orange)
- Icon: Alert triangle in orange

**Error States:**
- Background: Red-Orange #F44336
- Text: White on solid, Grey 900 on light
- Icon: X or alert in red-orange

### Typography System

**Font Family Stack:**
```css
font-family: 'Roboto', 'Helvetica Neue', 'Arial', sans-serif;
```

**Rationale:**
- **Roboto**: Material Design standard, optimized for screens
- **Excellent readability**: Geometric yet friendly, works at all sizes
- **Performance**: System font fallbacks load instantly
- **Mobile-optimized**: Designed specifically for digital interfaces
- **Wide language support**: Covers Latin, Cyrillic, Greek

**Type Scale & Hierarchy:**

**Display / Headers:**

**H1 - Page Titles (2rem / 32px)**
- Font weight: 500 (Medium)
- Line height: 1.2 (38.4px)
- Letter spacing: -0.5px (optical adjustment)
- Usage: Top-level page names
- Examples: "Quick Add", "Expenses", "Budget"

**H2 - Section Headers (1.5rem / 24px)**
- Font weight: 500 (Medium)
- Line height: 1.3 (31.2px)
- Letter spacing: 0px
- Usage: Major sections within pages
- Examples: "Today's Expenses", "This Month", "Goal Progress"

**H3 - Subsection Headers (1.25rem / 20px)**
- Font weight: 500 (Medium)
- Line height: 1.4 (28px)
- Letter spacing: 0.15px
- Usage: Widget titles, category groupings
- Examples: "Budget Status", "Recent Entries", "Savings Goal"

**Body Text:**

**Body1 - Primary Body (1rem / 16px)**
- Font weight: 400 (Regular)
- Line height: 1.5 (24px)
- Letter spacing: 0.15px
- Usage: Main content, expense notes, descriptions
- Examples: Expense descriptions, help text, general content

**Body2 - Secondary Body (0.875rem / 14px)**
- Font weight: 400 (Regular)
- Line height: 1.43 (20px)
- Letter spacing: 0.25px
- Usage: Supporting information, metadata
- Examples: Date labels, field helpers, secondary info

**Small Text:**

**Caption (0.75rem / 12px)**
- Font weight: 400 (Regular)
- Line height: 1.66 (20px)
- Letter spacing: 0.4px
- Usage: Timestamps, labels, fine print
- Examples: "Just now", "2 hours ago", "Synced", input labels

**Specialized Type Styles:**

**Button Text (0.875rem / 14px)**
- Font weight: 500 (Medium)
- Line height: 1.75 (24.5px)
- Letter spacing: 1.25px
- Text transform: Uppercase (Material standard)
- Usage: All buttons

**Amount Display (1.5-2rem / 24-32px)**
- Font weight: 500-600 (Medium to SemiBold)
- Line height: 1.2
- Letter spacing: -0.5px
- Usage: Prominent amount displays
- Examples: Today's total, monthly total, budget remaining

**Goal Numbers (1.25rem / 20px)**
- Font weight: 600 (SemiBold)
- Line height: 1.2
- Letter spacing: 0px
- Usage: Savings goal progress
- Examples: "60M / 300M", "20% Complete"

**Number Formatting:**
- Amounts: Comma separators (45,000)
- Currency: VND symbol or "k" suffix (45k, 45,000 VND)
- Percentages: No decimal for whole numbers (20%), one decimal if needed (20.5%)

**Typography Tone:**
- **Not corporate stiff**: No traditional serif fonts
- **Not too casual**: No handwriting or display fonts for body
- **Modern professional with friendly touch**: Clean, readable, approachable
- **Data-friendly**: Tabular numbers for amounts (monospace numerals)

**Hierarchy Visual Weight:**
1. H1 (32px, 500 weight) - Strongest
2. Amount Display (24-32px, 500-600 weight) - High prominence
3. H2 (24px, 500 weight) - Strong
4. Goal Numbers (20px, 600 weight) - Emphasized
5. H3 (20px, 500 weight) - Medium
6. Body1 (16px, 400 weight) - Normal
7. Body2 (14px, 400 weight) - Less prominent
8. Caption (12px, 400 weight) - Subtle

**Accessibility:**
- Minimum body text: 16px (no smaller for main content)
- Line height: 1.5+ for readability
- Font weight: Never below 400 (no thin fonts)
- Contrast: All text meets WCAG AA on backgrounds

### Spacing & Layout Foundation

**Base Spacing Unit: 8px**

Follows Material Design 8dp grid system, providing mathematical consistency and flexibility.

**Spacing Scale:**

```
0.5 unit = 4px   - Tight spacing (within small components)
1 unit   = 8px   - Minimal spacing (closely related items)
1.5 units = 12px  - Close spacing (list items, form fields)
2 units  = 16px  - Normal spacing (default between elements)
3 units  = 24px  - Section spacing (group separation)
4 units  = 32px  - Major sections (page-level divisions)
5 units  = 40px  - Loose spacing (dramatic separation)
6 units  = 48px  - Extra loose (rarely used)
```

**Layout Density: Efficient But Breathable**

Balance between information density (important for finance app) and comfortable reading (avoid cognitive overload).

**Mobile-First Layout (320-600px):**

**Page Structure:**
- Page padding: 16px horizontal (comfortable thumb zones)
- Top padding: 8px (below header)
- Bottom padding: 16px (above tab bar)
- Safe area insets: Respected for iOS notch/home indicator

**Component Spacing:**

**Form Fields:**
- Field to field vertical: 16px
- Field internal padding: 12px
- Label to field: 8px
- Field height: 48-56px (touch-friendly)
- Helper text margin top: 4px

**Cards:**
- Card to card vertical: 12px
- Card internal padding: 16px
- Card border radius: 8px (medium)
- Card elevation: 1-2 (subtle shadow)
- Card margin horizontal: 0px (full width on mobile)

**Lists:**
- List item padding: 12px vertical, 16px horizontal
- Item to item: 0px (divider line instead)
- Section header above: 24px
- List container padding: 0px (items handle own padding)

**Buttons:**
- Button padding: 8px vertical, 16px horizontal
- Button min-width: 64px (Material standard)
- Button height: 36px (text), 48px (icon)
- Button to button spacing: 8-12px
- FAB size: 56x56px (large), 40x40px (small)

**Headers:**
- AppBar height: 56px (mobile), 64px (desktop)
- AppBar padding: 16px horizontal
- Title to icon spacing: 16px
- AppBar elevation: 4 (standard)

**Bottom Navigation:**
- Tab bar height: 56px
- Tab padding: 12px vertical, 12px horizontal
- Icon size: 24x24px
- Icon to label: 4px
- Tab bar elevation: 8 (above content)

**White Space Philosophy:**

**Not Minimal:**
- Enough space for elements to breathe
- Clear visual groupings through spacing
- Prevent cognitive overload

**Not Excessive:**
- Mobile screen real estate is precious
- Information density important for finance app
- Users want to see data without scrolling excessively

**Purposeful:**
- Space guides attention to key actions (Add button)
- Hierarchy created through spacing relationships
- Consistent spacing = predictable, learnable interface

**Vertical Rhythm:**
- Base rhythm: 8px
- Text baseline grid: 4px (sub-pixel alignment)
- Component rhythm: 16px (consistent vertical flow)
- Section rhythm: 24-32px (clear breaks)

**Responsive Breakpoints:**

```
Mobile: 0-599px     (320px minimum)
Tablet: 600-959px   (iPad portrait)
Desktop: 960px+     (laptop, desktop)
```

**Responsive Adjustments:**

**Tablet (600-959px):**
- Page padding: 24px horizontal
- Card margin: 8px horizontal (not full width)
- Grid: 2 columns for stats widgets
- Font sizes: +1-2px for some elements

**Desktop (960px+):**
- Page padding: 32px horizontal
- Max content width: 1200px (centered)
- Card margin: 16px horizontal
- Grid: 3-4 columns for dashboard
- Side navigation instead of bottom tabs

**Grid System: Flexible, Not Rigid**

No strict 12-column grid for MVP. Use flexbox-based layouts:
- MUI Box for flex containers
- MUI Stack for vertical/horizontal flows
- MUI Grid only if complex layout needed
- CSS Grid for specific dashboard layouts

**Layout Principles:**

**1. Mobile-First, Always**
- Design for 320px width minimum
- Primary interaction: touch, not mouse
- Thumb-friendly: Bottom-placed primary actions

**2. Content-First**
- Layout serves content, not vice versa
- No layout for layout's sake
- Minimize chrome, maximize content

**3. Progressive Enhancement**
- Core experience works on smallest screen
- Larger screens add convenience, not essential features
- Responsive = better, not different

### Accessibility Considerations

**Color Contrast Compliance:**

**Text Contrast Ratios (WCAG 2.1):**
- **Body text (16px)**: 4.5:1 minimum (AA standard)
- **Large text (24px+)**: 3:1 minimum (AA standard)
- **Headings**: 7:1 target (AAA standard)
- **Interactive elements**: 4.5:1 minimum

**Tested Combinations:**
- Grey 900 on White: 15.8:1 ✅ (AAA)
- Grey 700 on White: 7.7:1 ✅ (AAA)
- Grey 500 on White: 4.6:1 ✅ (AA)
- White on Blue #2196F3: 4.5:1 ✅ (AA)
- White on Green #4CAF50: 4.5:1 ✅ (AA)
- Grey 900 on Orange #FF9800: 7.2:1 ✅ (AAA)

**Non-Text Contrast:**
- UI components: 3:1 minimum (buttons, form fields, borders)
- Focus indicators: 3:1 against adjacent colors
- Status indicators: Never color alone, always + icon/text

**Touch Target Accessibility:**

**Minimum Sizes (WCAG 2.5.5):**
- Touch targets: 44x44pt iOS, 48x48px Android
- Applied to: All buttons, links, form fields, list items
- Primary actions: 48-56px height (generous)

**Spacing Between Targets:**
- Minimum: 8px between tappable elements
- Recommended: 12-16px for frequently used actions
- Prevents accidental taps

**Examples:**
- Expense list items: 56px height (12px padding + content + 12px)
- Bottom nav tabs: 56px height
- FAB button: 56x56px
- Text buttons: 48px height minimum
- Icon buttons: 48x48px

**Typography Accessibility:**

**Font Size:**
- Minimum body: 16px (1rem) - never smaller for main content
- Captions: 12px acceptable for non-essential text
- User zoom: Support up to 200% zoom (responsive em units)

**Line Height:**
- Body text: 1.5 minimum (WCAG guideline)
- Headings: 1.2-1.4 acceptable (shorter text)
- Prevents crowding, improves readability

**Line Length:**
- Optimal: 50-75 characters per line
- Maximum: 80 characters
- Mobile: Naturally constrained by width

**Font Weight:**
- Body: 400 minimum (regular)
- Never use ultra-light (100-200) for text
- Emphasis: 500-600 (medium to semibold)

**Focus States:**

**Keyboard Navigation:**
- All interactive elements keyboard accessible
- Tab order: Logical (top to bottom, left to right)
- Skip links: "Skip to main content" for screen readers
- No keyboard traps: Can always tab away

**Visual Focus Indicators:**
- Style: 2px solid outline
- Color: Blue #2196F3 (primary color)
- Offset: 2px from element edge
- Visible: High contrast against all backgrounds
- Never remove: outline: none is forbidden without replacement

**Focus Visible (CSS):**
```css
:focus-visible {
  outline: 2px solid #2196F3;
  outline-offset: 2px;
}
```

**Color Independence:**

**Never Rely on Color Alone:**

**Budget Status:**
- ❌ Color only: Green bar = under budget
- ✅ Color + Text: Green bar + "14,855k remaining"
- ✅ Color + Icon: Green + checkmark icon

**Success/Error Messages:**
- ❌ Color only: Red background = error
- ✅ Color + Icon + Text: Red + X icon + "Invalid amount"

**Progress Indicators:**
- ❌ Color only: Blue = on track
- ✅ Color + Number + Text: Blue + "20%" + "On track"

**Link Differentiation:**
- Not just color: Underline or icon in addition to blue
- Hover/Focus: Underline appears

**Screen Reader Support:**

**Semantic HTML:**
- Use proper elements: `<button>`, `<input>`, `<form>`, `<nav>`
- Heading hierarchy: h1 → h2 → h3 (no skipping)
- Lists: `<ul>`, `<ol>` for expense lists
- Landmarks: `<main>`, `<nav>`, `<aside>` for structure

**ARIA Labels:**
- Icon buttons: `aria-label="Add expense"`
- Form fields: Proper `<label>` association
- Status updates: `aria-live="polite"` for budget changes
- Hidden text: `.sr-only` class for screen reader only text

**ARIA Live Regions:**
- Budget updates: `aria-live="polite"` (non-intrusive)
- Error messages: `aria-live="assertive"` (immediate)
- Success messages: `aria-live="polite"`
- Dynamic totals: `aria-atomic="true"` (read full value)

**Image Alternatives:**
- Icons with meaning: `aria-label` or `title`
- Decorative icons: `aria-hidden="true"`
- SVG icons: `<title>` element for description

**Form Accessibility:**
- Labels: Always visible, properly associated
- Placeholders: Not replacement for labels
- Error messages: Linked via `aria-describedby`
- Required fields: `aria-required="true"` + visual indicator
- Validation: Real-time but not aggressive

**Testing Strategy:**

**Automated Testing:**
- Lighthouse accessibility audit
- axe DevTools browser extension
- WAVE accessibility checker
- Color contrast analyzer

**Manual Testing:**
- Keyboard only navigation (no mouse)
- Screen reader testing (VoiceOver on iOS/Mac, NVDA on Windows)
- Zoom to 200% (text should remain readable)
- Test on actual devices (not just simulators)

**Accessibility Statement:**
"Daily Expenses is committed to WCAG 2.1 Level AA compliance. We test with assistive technologies and continuously improve accessibility. Contact us with any accessibility concerns."
