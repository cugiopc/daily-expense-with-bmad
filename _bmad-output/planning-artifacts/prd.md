---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments: ['_bmad-output/planning-artifacts/product-brief-Daily Expenses-2026-01-13.md']
workflowType: 'prd'
project_name: 'simple-todo-app'
date: '2026-01-14'
author: 'HoanTran'
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
projectType: 'greenfield'
classification:
  projectType: 'Progressive Web App (PWA)'
  domain: 'Personal Finance / Expense Tracking'
  complexity: 'Low-Medium'
  projectContext: 'greenfield'
---

# Product Requirements Document - simple-todo-app

**Author:** HoanTran
**Date:** 2026-01-14

## Success Criteria

### User Success

**Primary Success Outcome:**
User achieves their savings goal of **300 triệu trong 2 năm** để chuẩn bị kết hôn, averaging 12.5 triệu/tháng savings rate.

**Behavioral Success Indicators:**

**1. Habit Formation (Core Behavior)**
- **Target:** Tracking becomes automatic reflex - user logs every transaction
- **Success Metrics:**
  - Week 2: 70% of days have expense entries
  - Month 1: 80% of days have expense entries  
  - Month 3: 90%+ of days have expense entries (habit formed)
  - Average 3-5 expense entries per day
- **Ultimate Goal:** User tracks without reminders, automatic behavior

**2. Impulse Buying Control**
- **Problem Addressed:** Săn sale đồ công nghệ without budget consideration
- **Success Metrics:**
  - User checks app before purchasing items >500k
  - Month 3: Actively avoids 50%+ impulse buys after checking budget
  - Month 6: Budget alerts successfully prevent overspending
- **Behavioral Change:**
  - Month 1: Awareness - "Ồ, tháng này mình chi nhiều quá"
  - Month 3: Prevention - Pause before impulse purchases
  - Month 6: Mastery - Budget becomes decision-making tool

**3. Budget Adherence**
- **Baseline:** Currently no budget control (often overspend)
- **Success Targets:**
  - Month 1-2: Learning phase (baseline establishment, likely overspend)
  - Month 3-6: 50% of months within budget
  - Month 7-12: 70%+ of months within budget
  - Year 2: 80%+ months within budget (mastery)

**4. Financial Awareness**
- **Before:** "Cuối tháng không biết đã chi bao nhiêu, vào đâu"
- **After Success:** User can answer "How much did I spend this month on X?" without checking app
- **Key Aha Moments:**
  - Week 2: First realization - "Wow, 2 tuần tracking mới thấy mình chi vào đồ công nghệ 6 triệu!"
  - Month 1: Clear picture of monthly spending patterns
  - Month 3: Proactive adjustment based on data insights

**5. Speed & Convenience**
- **Target:** 5-7 seconds per expense entry (actual use case)
- **Success Metric:** Average entry time ≤10 seconds (accounting for edge cases)
- **Friction Test:** User tracks even small expenses (<50k) without hesitation
- **Compliance Indicator:** No "batch entry" at end of day (indicates low friction)

### Business Success

**Phase 1: MVP Validation (Month 1-3)**

**Objective:** Prove core value proposition - fast tracking leads to habit formation

**Success Criteria:**
- ✅ MVP deployed and usable as iOS PWA
- ✅ Core features working: Quick add, list, daily/monthly totals, budget alerts
- ✅ User consistently uses app (70%+ days in Month 3)
- ✅ Entry speed meets target (<10s average)
- ✅ At least one "aha moment" - user realizes spending patterns

**Measurable Outcomes:**
- Total expenses tracked: 200+ entries in Month 1
- App opens: 3-5 times per day
- User sentiment: "Việc ghi chi tiêu không còn là burden"

**Phase 2: Feature Enhancement (Month 4-6)**

**Objective:** Budget control and goal tracking drive behavior change

**Success Criteria:**
- ✅ Budget alerts implemented and effective
- ✅ Savings goal tracking visible and motivating
- ✅ User avoids 2-3+ impulse purchases due to app alerts
- ✅ 50%+ months within budget

**Measurable Outcomes:**
- Budget violations prevented: 2-3 instances per month
- User checks app before major purchases (>500k)
- Progress toward 300M goal: On track (60M+ saved by Month 6)

**Phase 3: Habit Mastery (Month 7-12)**

**Objective:** Tracking becomes automatic, consistent savings achieved

**Success Criteria:**
- ✅ 90%+ days with expense entries
- ✅ 70%+ months within budget
- ✅ Impulse buying significantly reduced
- ✅ Savings rate averaging 12.5M+/month

**Measurable Outcomes:**
- Year 1 savings: 140-150M (47-50% of goal)
- Behavioral change validated: User makes different purchasing decisions
- App has become indispensable tool

**Phase 4: Long-term Success (Year 2)**

**Objective:** Achieve 300M savings goal and prepare for life milestone

**Success Criteria:**
- ✅ Total savings: 300M+ achieved
- ✅ Financial discipline maintained throughout journey
- ✅ Ready to propose with financial confidence
- ✅ Consider v2 features: multi-user for post-marriage

**Measurable Outcomes:**
- Goal completion: 100% (300M saved)
- User testimonial: "App changed my financial life"
- Product evolution decision: Continue as personal tool or share with community

### Technical Success

**Performance Requirements:**
- **App Load Time:** <2 seconds on 4G connection
- **Expense Entry Speed:** <500ms from submit to UI confirmation (optimistic updates)
- **Offline Capability:** Full functionality without internet, sync when online
- **PWA Install:** One-tap "Add to Home Screen" on iOS Safari
- **Service Worker:** Cache static assets, <1s load on repeat visits

**Reliability:**
- **Uptime Target:** 99%+ availability (personal use, not mission-critical)
- **Data Consistency:** Zero data loss during offline→online sync
- **Sync Accuracy:** 100% of offline entries sync successfully within 30 seconds of reconnection
- **Error Handling:** User-friendly messages, graceful degradation if backend down

**Security:**
- **Authentication:** JWT with 7-day expiry, secure httpOnly cookies
- **Password Requirements:** Minimum 8 characters (basic protection for single user)
- **HTTPS Only:** All API communication over TLS
- **Data Privacy:** Single-user MVP, no data sharing or third-party analytics

**Browser Compatibility:**
- **Primary:** iOS Safari (latest 2 versions) - HoanTran's iPhone
- **Secondary:** Chrome/Edge on desktop (testing/development)
- **Not Required:** IE, older mobile browsers

**API Performance:**
- **GET /expenses:** <200ms response time
- **POST /expense:** <100ms to save to database
- **Database Queries:** Indexed for fast retrieval, <50ms for daily/monthly aggregations

**Code Quality:**
- **Test Coverage:** Core expense CRUD operations covered by integration tests
- **Error Monitoring:** Basic logging for production issues
- **Deployment:** One-command deploy to production, rollback capability

### Measurable Outcomes

**Daily KPIs:**
- Expense entry rate: 3-5 entries per day
- Entry speed: ≤10 seconds average (target: 5-7 seconds)
- App opens: 3-5 times per day minimum
- Daily total accuracy: User can estimate within 10% error without checking

**Weekly KPIs:**
- Tracking consistency: 6-7 days tracked per week (85%+ target)
- Budget awareness: User knows remaining budget without checking
- Pattern recognition: User identifies overspending categories

**Monthly KPIs:**

**Usage Metrics:**
- Total entries: 80-150 expenses per month
- Active days: 25+ days per month (80%+ target)
- Average entry time: ≤10 seconds
- Feature usage: Daily totals viewed 25+ times, monthly review completed

**Financial Metrics:**
- Total monthly expenses: Tracked and visible
- Budget adherence: Within ±10% of monthly budget
- Monthly savings: 12.5M+ average
- Impulse purchases prevented: 2-3+ major purchases (>500k) avoided

**Behavioral Metrics:**
- Pre-purchase app checks: 80%+ of major purchases
- Budget alert response: Adjusts spending 70%+ of times after alert
- Habit strength: Tracking without reminders, automatic behavior

**Quarterly KPIs:**

**Progress Metrics:**
- Q1 (Month 3): 30-37.5M saved (10-12.5% of 300M goal)
- Q2 (Month 6): 60-75M saved (20-25% of goal)
- Q3 (Month 9): 90-112.5M saved (30-37.5% of goal)
- Q4 (Month 12): 140-150M saved (47-50% of goal)

**Habit Metrics:**
- Tracking consistency: 90%+ days tracked
- Budget success rate: 50%+ months within budget (Q2), 70%+ (Q3-Q4)
- Behavioral change: Measurable reduction in impulse spending

**Satisfaction Metrics:**
- Perceived value: User considers app "essential"
- Time investment: <5 minutes per day total (tracking + review)
- Goal confidence: User feels confident about reaching 300M

**Success Thresholds:**

**Minimum Viable Success (MVP):**
- User tracks consistently for 30+ days
- Identifies at least one major spending pattern
- Feels tracking is "worth the effort"
- Entry time <15 seconds (acceptable, not ideal)

**Target Success (Expected):**
- 80%+ days tracked per month
- 12.5M/month average savings
- 70%+ months within budget by Year 2
- Entry time <10 seconds average
- Goal achieved: 300M in 2 years

**Exceptional Success (Stretch):**
- 95%+ days tracked per month
- 15M+/month average savings
- 300M goal achieved in <2 years
- Entry time 5-7 seconds consistently
- Zero impulse purchases in final 6 months
- Product becomes valuable enough to share with community

**Failure Criteria (Pivot Signals):**
- User stops tracking after 2 weeks (<50% days tracked)
- Entry time >30 seconds (too much friction)
- User reverts to impulse buying with no reduction
- No "aha moments" after Month 1
- Savings rate <8M/month (off track for goal)

**If Failure Occurs:**
- Re-evaluate UX: Is entry too slow/complex?
- Add features: Voice input? Auto-categorization?
- Simplify further: Remove unnecessary fields?
- Gamification: Add rewards/streaks to maintain motivation?

## Product Scope

### MVP - Minimum Viable Product (1 Month Timeline)

**Week 1-2: Essential Tracking Foundation**

**1. Ultra-Fast Expense Entry**
- Quick Add Form:
  - Amount input field (number, auto-focus, number keyboard)
  - Note field (free text, optional but recommended)
  - Date auto-set to today (editable if needed)
  - Submit button + Enter key support
- Target: 5-7 seconds per entry
- UX: Optimistic UI - show success immediately, sync in background
- Offline Support: IndexedDB for offline storage, sync when online

**2. Expense List & History**
- Daily View: Today's expenses with running total
- Monthly View: Current month expenses grouped by day
- List Features:
  - Display: Amount, note, date/time
  - Sort: Most recent first
  - Simple scroll/pagination
  - Basic edit/delete (tap to edit)
- Quick Stats Display:
  - Today's total
  - Month's total
  - Simple, always visible

**3. Progressive Web App (PWA) Setup**
- Installation:
  - Add to Home Screen capability (iOS/Android)
  - Shortcut icon on home screen
  - Instant launch like native app
- Performance:
  - Service Worker for offline functionality
  - Cache static assets for fast load
  - Background sync when online
- Mobile Optimization:
  - Responsive design (mobile-first)
  - Touch-optimized inputs
  - Fast tap responses

**Week 3: Budget Control**

**4. Budget Management**
- Budget Setting:
  - Set monthly budget limit (VD: 15 triệu)
  - Simple input form, persist per month
- Budget Tracking:
  - Show remaining budget
  - Daily progress indicator
  - Visual progress bar
- Budget Alerts:
  - Warning at 80% budget used
  - Alert when over budget
  - Notification/banner style (non-intrusive)

**5. Spending Overview**
- Dashboard Elements:
  - Today's spending vs average
  - Week's spending trend
  - Month's spending vs budget
  - Simple bar chart or progress visualization

**Week 4: Goals & Polish**

**6. Savings Goal Feature**
- Goal Setting:
  - Set target amount (VD: 300 triệu)
  - Set deadline (VD: 2 năm)
  - Calculate monthly savings needed
- Progress Tracking:
  - Current savings amount (manual input initially)
  - Progress bar visualization
  - Percentage complete
  - Estimated completion date based on current rate
- Motivation Elements:
  - Milestone celebrations (25%, 50%, 75%)
  - Time remaining to goal
  - "On track" / "Behind" / "Ahead" status

**7. UI/UX Polish**
- Material-UI Components: Consistent, professional look
- Loading States: Skeleton screens, spinners
- Error Handling: User-friendly error messages
- Empty States: Helpful messaging when no data
- Responsive Design: Works on all screen sizes
- Accessibility: Proper labels, keyboard navigation

**MVP Launch Criteria (Week 4):**
- ✅ All core features functional and tested
- ✅ PWA installable on iOS
- ✅ Expense entry ≤10 seconds consistently
- ✅ No critical bugs blocking usage
- ✅ Backend deployed and stable
- ✅ Data persists reliably

### Growth Features (Post-MVP)

**Phase 2: Intelligence & Automation (Month 4-6)**

**Smart Features:**
- **AI Category Detection:** Parse free-text notes → auto-suggest categories
  - Example: "cafe" → Food & Drink category
  - Machine learning from user patterns
  - User can accept/reject suggestions
- **Smart Defaults:** Predictive input based on time/location
  - Morning → suggest "cafe"
  - Lunch time → suggest "lunch" with average amount
- **Spending Insights:**
  - "You spend 40% on food, 30% on tech, 20% on transport"
  - "You spend 2x more on weekends"
  - "Tech spending up 50% this month"

**Enhanced Tracking:**
- **Voice Input:** "Hey app, 45k cafe" → instant entry
- **Quick Actions:** Widget with preset buttons (cafe, lunch, transport)
- **Batch Entry:** Add multiple expenses at once (end of day catchup)

**Phase 3: Advanced Analytics & Integrations (Month 7-12)**

**Analytics:**
- **Trend Analysis:** Spending trends over time, month-over-month comparisons
- **Predictive Budgeting:** AI suggests budget based on patterns
- **Goal Optimization:** Recommend spending cuts to hit savings goal faster
- **Custom Reports:** Export filtered data, generate PDF reports

**Automation:**
- **Bank API Integration:** Auto-import transactions from bank
- **Receipt OCR:** Scan receipt → auto-extract amount and items
- **E-wallet Sync:** Sync with Momo, ZaloPay transactions
- **Email Parsing:** Parse receipt emails from e-commerce

### Vision (Future)

**Phase 4: Multi-User & Collaboration (Year 2)**

**Post-Marriage Features:**
- **Multi-User Accounts:** Create account for spouse
- **Household Mode:**
  - Each person tracks own expenses
  - Shared view of household spending
  - Individual + combined budgets
  - Separate savings goals (personal + joint)
- **Family Planning:** Budget for future (house, kids, etc.)

**Phase 5: Platform & Community (Year 2+)**

**Scale Considerations:**
- **Native Apps:** iOS/Android native if PWA shows limitations
- **API Platform:** Third-party integrations, developer API
- **Community Features** (if valuable):
  - Anonymous spending benchmarks
  - Financial tips and resources
  - Success stories from users
  - Optional public profiles

**Long-term Vision:**
Evolve from personal tool → potentially valuable for broader community of goal-driven savers. But only if:
- Core single-user experience is exceptional
- User testimonial: "This changed my financial life"
- Organic interest from others seeing success
- Developer has capacity to support wider audience

**Guiding Principle:** Always prioritize simplicity and speed. Every feature must justify its friction cost. If it doesn't make tracking faster or insights clearer, defer it.

**Explicitly Out of Scope for MVP:**
1. Advanced Categorization (dropdown categories, category-based budgeting)
2. Multi-User & Collaboration (family sharing, permissions)
3. Advanced Input Methods (voice, OCR, SMS parsing)
4. Bank & Payment Integration (auto-import, e-wallet sync)
5. Advanced Analytics (predictive, AI insights, custom reports)
6. Social & Gamification (leaderboards, badges, sharing)
7. Advanced Budget Features (category budgets, envelope system)
8. Cross-Platform Native Apps (iOS/Android native)
9. Advanced Security (biometric auth, 2FA, encryption at rest)
10. Integrations & Exports (Excel, Zapier, API)

**Rationale:** MVP focuses on proving core value - ultra-fast tracking leads to habit formation and behavioral change. All deferred features can be added after validating core workflow with real usage.

## User Journeys

### Primary User: HoanTran - The Goal-Driven Developer

**Persona Profile:**
- **Name:** HoanTran
- **Age & Role:** 30 tuổi, Senior Software Developer
- **Context:** Single, có kế hoạch kết hôn trong 2 năm
- **Tech Profile:** iOS user, comfortable với web apps và PWAs
- **Financial Situation:** Stable professional income, saving goal 300 triệu trong 2 năm (12.5 triệu/tháng)
- **Current Challenge:** Không theo dõi chi tiêu → mất kiểm soát → săn sale đồ công nghệ impulse buying → không đạt mục tiêu

**Spending Behavior:**
- Primary expenses: Ăn uống hàng ngày (100-200k/day), tạp hóa
- Payment method: Thẻ tín dụng/debit card
- Major pain point: Săn sale đồ công nghệ - impulse buying khi thấy deals (500k - vài triệu)
- Pattern: Không nhận ra spending patterns, cuối tháng không biết đã chi bao nhiêu

**Motivations:**
- **Primary:** Tiết kiệm đủ tiền để kết hôn (mục tiêu cụ thể, deadline rõ ràng)
- **Secondary:** Kiểm soát chi tiêu impulse, đặc biệt săn sale đồ công nghệ
- **Underlying:** Muốn có kỷ luật tài chính tốt hơn, chuẩn bị cho tương lai

**Frustrations:**
- "Cuối tháng nhìn account balance giảm mà không biết tiêu vào đâu"
- "Thấy deal đồ công nghệ là muốn mua ngay, không nghĩ đến budget"
- "Không có cảnh báo khi chi tiêu vượt mức"
- "Apps hiện tại quá phức tạp, lười mở"

### Journey 1: Discovery & Initial Setup (Day 1)

**Opening Scene - The Decision:**

HoanTran ngồi check bank statement cuối tháng, nhận ra account balance giảm 8 triệu mà không nhớ đã chi vào đâu. Lần thứ ba trong tháng này. Với mục tiêu kết hôn trong 2 năm, anh cần tiết kiệm 300 triệu - tức là 12.5 triệu/tháng. Nhưng không tracking thì làm sao biết mình có đang on track?

Anh quyết định: "Mình là developer, mình sẽ tự build app tracking chi tiêu. Ultra-simple, ultra-fast. Không có category dropdown phức tạp như các app khác. Chỉ cần ghi nhanh số tiền và note là đủ."

**Rising Action - Building & Setup:**

1. **Development Phase:**
   - HoanTran code Daily Expenses app trong 4 tuần
   - Tech stack: React + Material-UI, .NET Core, PostgreSQL
   - Focus: Speed and simplicity - 5-7 seconds per entry
   - Deploy as Progressive Web App

2. **First Launch:**
   - Mở app lần đầu trên iPhone
   - Clean, minimal interface - chỉ 2 fields: Amount và Note
   - "Wow, đơn giản quá. Không có dropdown category rườm rà!"
   
3. **Goal Setting:**
   - Nhập mục tiêu: 300 triệu trong 2 năm
   - App tính: Cần tiết kiệm 12.5 triệu/tháng
   - Progress bar hiện: 0% complete
   - "OK, bắt đầu từ hôm nay!"

4. **Budget Setup:**
   - Set monthly budget: 15 triệu (để còn 12.5 triệu tiết kiệm từ income)
   - App hiện: "Budget left: 15 triệu"

5. **PWA Installation:**
   - Tap "Add to Home Screen" trên iOS Safari
   - Icon xuất hiện trên home screen, ngay bên cạnh Banking app
   - "Perfect! Giờ mở app chỉ cần 1 tap"

**First Impression:**
"App này minimalist thật. Chỉ có mấy field thôi, không overwhelming như Moneylover. Xem thử tracking có dễ không!"

**Emotional State:** Optimistic nhưng skeptical - "Liệu mình có thực sự dùng lâu dài không?"

### Journey 2: Daily Usage - Building the Habit (Week 1-4)

**Morning Routine - Day 2 (7:30 AM):**

HoanTran vừa mua cà phê 45k ở quán quen. Đang đứng chờ đèn đỏ, anh nhớ ra app.

```
→ Tap shortcut "Daily Expenses" trên home screen (0.5s)
→ App mở instant (PWA đã cache)
→ Cursor tự động focus vào Amount field, number keyboard hiện lên
→ Gõ "45000" (2s)
→ Tap vào Note field, gõ "cafe" (2s)
→ Tap "Add" button (0.5s)
→ ✓ Saved! UI update ngay: "Today: 45k, Budget left: 14,955k"
```

**Total time: 5 seconds**

HoanTran surprised: "Wow, nhanh thật! 5 giây xong. Không như tưởng tượng!"

**Lunchtime - Day 2 (12:00 PM):**

Ăn trưa xong, HoanTran mở app ngay trên bàn ăn:

```
→ Mở app (instant load từ cache)
→ Quick add: "80000" + "lunch"
→ 5 giây xong
→ Today: 125k, Budget left: 14,875k
```

"Này dễ quá! Mình có thể làm được việc này mỗi ngày!"

**Evening Temptation - Day 5 (6:00 PM) - THE CRITICAL MOMENT:**

HoanTran đang lướt Shopee, thấy deal iPhone accessories - wireless charger + MagSafe case combo, giá 1.5 triệu (giảm 40%). Tay anh đã hover trên nút "Checkout"...

Chợt nhớ: "Đợi đã, để mình check app xem tuần này chi bao nhiêu rồi."

```
→ Mở Daily Expenses
→ Nhìn thấy: "Today: 3.2 triệu, Month: 18 triệu / 15 triệu budget"
→ 🚨 Red alert banner: "Bạn đã vượt budget 3 triệu!"
→ Breakdown: Tech accessories: 5 triệu, Food: 8 triệu, Other: 5 triệu
```

**The Pause - Critical Decision Point:**

HoanTran stare at the screen for 10 seconds. Số 18 triệu vs 15 triệu budget hits hard.

Mental calculation: "18 triệu + 1.5 triệu nữa = 19.5 triệu. Gần 20 triệu rồi! Mới đầu tháng thôi mà..."

Anh nhìn lại Shopee cart, rồi nhìn lại savings goal progress bar: 0% complete.

"Thôi, deal này bỏ qua. Month sau vậy. Giờ cần tiết kiệm đã."

→ Close Shopee app
→ ✅ **IMPULSE PURCHASE AVOIDED! Saved 1.5 triệu!**

**Emotional State:** Mix of disappointment (miss the deal) và relief (dodged overspending). First time budget alert thực sự changed behavior.

**Evening Check - Day 7 (10:00 PM):**

Before sleep routine, HoanTran mở app review tuần đầu:

```
Week 1 Summary:
- Total tracked: 2.8 triệu (7 days)
- Average per day: 400k
- Budget status: 12.2 triệu left for 23 days
- Categories (auto-detected from notes):
  - Food & Drink: 1.5 triệu (cafe, lunch, dinner)
  - Tech: 800k (cable, screen protector)
  - Transportation: 300k (grab, parking)
  - Other: 200k
```

"Hmmm, 400k/day trung bình. Nếu giữ được pace này, month này OK. Nhưng phải cẩn thận với săn sale!"

**Habit Formation Progress:**
- Days tracked: 6/7 (missed Day 3 - forgot)
- Average entry time: 7 seconds (close to 5-7s target!)
- Daily app opens: 4-5 times
- **Key learning:** Budget alert works! Prevented 1 impulse buy already.

### Journey 3: The Aha Moment (Week 2) - Pattern Recognition

**Sunday Review - Day 14 (3:00 PM):**

2 tuần đã qua. HoanTran curious về patterns, mở app xem monthly breakdown:

```
2 Weeks Stats:
- Total spent: 6.2 triệu
- Projection: ~12.4 triệu by month-end (within budget!)
- Category breakdown:
  - Tech & Electronics: 3 triệu (48%!) ← ⚠️ RED FLAG
  - Food & Beverage: 2 triệu (32%)
  - Transportation: 800k (13%)
  - Other: 400k (7%)
```

**THE AHA MOMENT:**

HoanTran stares at "Tech & Electronics: 3 triệu (48%)"

"WHAT?! Trong 2 tuần mình đã chi 3 triệu vào đồ tech?! Gần HALF spending của mình?!"

Mental flashback:
- Week 1: Screen protector 150k, USB-C cable 200k, Mechanical keyboard 2 triệu (deal!)
- Week 2: Phone case 300k, Wireless earbuds tips 150k, Cable organizer 200k

"Nếu không tracking, mình không bao giờ nhận ra pattern này. Keyboard 2 triệu 'because it was on sale' - mình thậm chí không nhớ đã mua until now!"

**Realization - Behavioral Insight:**

"Đồ công nghệ là weakness của mình. Thấy deal là muốn mua, không cân nhắc. Đây là lý do mình không tiết kiệm được! Now I see it clearly."

**New Resolution:**
"Từ giờ, trước khi mua đồ tech >500k, PHẢI check app trước. Mandatory!"

**Emotional State:** Enlightened! First time seeing hard data về spending patterns. Vừa shocked vừa empowered - finally có visibility!

### Journey 4: Behavior Change (Month 3) - Mastery

**Deal Notification - Month 3, Week 2 (7:00 PM):**

Email notification: "🔥 Flash Sale: MacBook Air M3 giảm 8 triệu - còn 2 giờ!"

Old HoanTran: Would immediately checkout without thinking.

New HoanTran (post-tracking habit):

```
Step 1: Open Daily Expenses FIRST
Step 2: Check month status:
  - Current month: 11 triệu / 15 triệu budget
  - Budget left: 4 triệu for 12 days remaining
  - Savings goal progress: 11% complete (33M saved of 300M)
  
Step 3: Mental calculation:
  - MacBook: 25 triệu after discount
  - This month budget: Only 4 triệu left
  - Impact: Would blow budget by 21 triệu
  - Savings goal: Would set back by ~2 months
  
Step 4: Rational decision:
  "MacBook would be nice, but:
  - Not urgent (current laptop still good)
  - Would destroy 2 months of progress
  - Goal (kết hôn) > Nice-to-have gadget"
  
Step 5: Close email, move on
```

**Result:** ✅ Another impulse purchase avoided! Saved 25 triệu!

**The New Reflex:**

By Month 3, checking app before major purchases became **automatic**:
- See deal → Open Daily Expenses → Check budget → Decide
- Not "should I buy?" but "can I afford this within budget?"
- Budget becomes **decision framework**, not restriction

**Habit Metrics - Month 3:**
- Days tracked: 28/30 (93% - habit formed!)
- Average entry time: 6 seconds (beating 5-7s target!)
- Impulse purchases prevented: 4 major items (saved ~30 triệu total)
- Budget adherence: 2 out of 3 months within budget
- App opens: Still 4-5 times daily

**Emotional State:** Confident and in control. "Mình đã master được spending behavior. App này đã become second nature."

### Journey 5: Goal Achievement (Month 6) - Milestone Celebration

**Progress Check - Month 6, Last Day (11:00 PM):**

HoanTran mở app xem 6-month review:

```
🎉 6-Month Milestone Reached!

Savings Progress:
━━━━━━━━━━░░░░░░░░░░░░░░░░ 20% complete
Saved: 60 triệu / 300 triệu goal
Time elapsed: 6 months / 24 months
Status: ✅ ON TRACK!

Monthly Performance:
Month 1: Overspent 5 triệu (learning phase)
Month 2: Within budget! +13 triệu saved
Month 3: Within budget! +12 triệu saved  
Month 4: Within budget! +11 triệu saved
Month 5: Within budget! +12 triệu saved
Month 6: Within budget! +12 triệu saved

Total saved: 60 triệu
Average savings: 10 triệu/month (Target: 12.5 triệu/month)

Behavioral Changes Detected:
• Tech spending: Decreased from 48% to 25% ✅
• Impulse purchases prevented: 12 items
• Budget adherence: 5/6 months within budget ✅
• Tracking consistency: 95% of days ✅

Projection: At current pace, goal achieved in 25 months (1 month ahead of schedule!)
```

**The Celebration Moment:**

HoanTran leans back, stares at "20% complete" progress bar.

"6 tháng trước, mình cuối tháng không biết đã chi bao nhiêu. Giờ, mình đã save được 60 triệu! 1/5 của 300 triệu goal rồi!"

Takes screenshot, sends to close friend: "Đang on track để cưới vợ đây! 20% done! 🎉"

**Reflection - The Transformation:**

"App này không chỉ track numbers. Nó changed behavior của mình:
- Bây giờ thấy deal không còn FOMO nữa
- Biết rõ priority: Long-term goal > Short-term wants  
- Tracking trở thành reflex, không còn là chore
- Feeling of control = reduced financial stress"

**Emotional State:** Proud, motivated, confident. "Mình CAN do this. 18 tháng nữa là đủ tiền cưới!"

### Journey 6: Long-Term Success (Month 24) - Goal Completion

**Final Check - Month 24 (Wedding Planning Phase):**

```
🎊 GOAL ACHIEVED! 🎊

Savings Progress:
━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% complete!
Saved: 315 triệu / 300 triệu goal
Time: 24 months (on schedule!)
Bonus: +15 triệu over target! ✨

24-Month Journey:
✅ Expenses tracked: 18,000+ entries
✅ Habit formed: 96% days tracked
✅ Budget mastery: 85% months within budget
✅ Behavioral change: Tech impulse buying reduced 75%
✅ Time investment: ~5 min/day average
✅ Financial discipline: Achieved

Status: READY TO PROPOSE! 💍
```

**The Proposal Preparation:**

HoanTran sitting in coffee shop, planning proposal details. Opens Daily Expenses one more time:

"2 năm trước, mình đã set goal này. Hôm nay, mình đã đạt được. 315 triệu - enough để tổ chức đám cưới và honeymoon."

Looks at the journey:
- From zero tracking → 96% daily habit
- From impulse spender → disciplined saver  
- From financial stress → financial confidence
- From "không biết tiền đi đâu" → complete visibility

"App này không chỉ giúp mình tiết kiệm. Nó taught mình financial discipline. Và giờ, mình ready cho chapter tiếp theo of life."

**New Goal Created:**

```
New Goal: House Down Payment
Target: 500 triệu
Deadline: 3 years
Monthly savings needed: 13.9 triệu

Starting today. Let's go! 🏠
```

**Emotional State:** Fulfilled, accomplished, ready for next milestone. "This app changed my life. Time to share it with my future spouse."

### Journey Requirements Summary

The user journeys reveal the following capability requirements:

**Core Tracking Capabilities:**
- **Ultra-Fast Expense Entry:** 2-field form (amount + note), auto-focus, number keyboard, <10s entry time, optimistic UI updates
- **Expense History:** Daily and monthly views, grouped by date, scrollable list with edit/delete
- **Quick Stats:** Real-time today's total and month's total, always visible

**Budget Management:**
- **Budget Setting:** Simple monthly budget input, persistence across months
- **Budget Tracking:** Remaining budget calculation, visual progress bar
- **Budget Alerts:** Warning at 80% threshold, alert when over budget, non-intrusive banners
- **Budget Projection:** Spending pace analysis, month-end projection

**Goal Tracking:**
- **Savings Goal Setup:** Target amount, deadline, automatic monthly savings calculation
- **Progress Visualization:** Progress bar, percentage complete, amount saved display
- **Milestone Celebrations:** 25%, 50%, 75%, 100% achievement notifications
- **Status Indicators:** "On track" / "Behind" / "Ahead" based on pace analysis
- **Projection:** Estimated completion date based on current savings rate

**Analytics & Insights:**
- **Spending Breakdown:** Category detection from note text, percentage distribution
- **Pattern Recognition:** Identify high-spending categories automatically
- **Trend Analysis:** Week-over-week, month-over-month comparisons
- **Behavioral Insights:** Track improvements in impulse purchases, budget adherence

**PWA Capabilities:**
- **Add to Home Screen:** One-tap installation on iOS/Android
- **Offline Functionality:** Full CRUD operations without internet
- **Background Sync:** Automatic sync when connection restored
- **Fast Load:** Service Worker caching, <1s repeat visits
- **Mobile-Optimized:** Touch-friendly inputs, responsive design

**Security & Data:**
- **Authentication:** Simple JWT-based login for single user
- **Data Persistence:** PostgreSQL storage, zero data loss guarantee
- **Offline Storage:** IndexedDB for local data when offline
- **Sync Accuracy:** 100% offline→online sync success rate

**User Experience:**
- **Minimalist Interface:** Clean, uncluttered, focus on essentials
- **Error Handling:** User-friendly messages, graceful degradation
- **Empty States:** Helpful guidance when no data
- **Loading States:** Skeleton screens, smooth transitions
- **Accessibility:** Keyboard navigation, proper ARIA labels

**Behavioral Change Support:**
- **Pre-Purchase Check:** Easy access to current budget status before buying
- **Visual Alerts:** Color-coded warnings (red for over budget, yellow for warning)
- **Habit Reinforcement:** Streak tracking (days tracked consistently)
- **Success Feedback:** Positive reinforcement when staying within budget

**Developer/Operations (Supporting):**
- **Monitoring:** Basic error logging for production issues
- **Deployment:** Simple one-command deploy, rollback capability
- **Testing:** Core CRUD operations covered by integration tests
- **Performance:** API response time monitoring

**Future Capabilities (Post-MVP):**
- Multi-user support for household sharing
- AI category suggestions from free-text notes
- Bank API integration for auto-import
- Voice input for hands-free entry
- Advanced analytics and custom reports

## Functional Requirements

### Expense Tracking

- **FR1:** User can add a new expense with amount and optional note
- **FR2:** User can specify the date for an expense (defaults to today)
- **FR3:** User can view a list of all expenses grouped by day
- **FR4:** User can view a list of expenses for the current month
- **FR5:** User can edit an existing expense (amount, note, date)
- **FR6:** User can delete an expense
- **FR7:** User can see today's total spending in real-time
- **FR8:** User can see current month's total spending in real-time
- **FR9:** System can automatically focus on amount input field when add expense screen opens
- **FR10:** System can display optimistic UI updates (show success immediately before server confirmation)

### Budget Management

- **FR11:** User can set a monthly budget amount
- **FR12:** User can view remaining budget for current month
- **FR13:** User can see budget progress visualization (progress bar or chart)
- **FR14:** System can calculate and display daily spending average
- **FR15:** System can project month-end spending based on current pace
- **FR16:** System can alert user when spending reaches 80% of budget
- **FR17:** System can alert user when spending exceeds budget
- **FR18:** User can view budget status before making purchase decisions

### Savings Goal Management

- **FR19:** User can set a savings goal with target amount and deadline
- **FR20:** User can manually input current savings amount
- **FR21:** System can calculate required monthly savings to reach goal
- **FR22:** User can view savings goal progress (percentage complete)
- **FR23:** User can see estimated completion date based on current savings rate
- **FR24:** System can display status indicator (on track / behind / ahead)
- **FR25:** System can celebrate milestone achievements (25%, 50%, 75%, 100%)
- **FR26:** User can update savings goal target or deadline

### Analytics & Insights

- **FR27:** System can automatically detect spending categories from expense notes
- **FR28:** User can view spending breakdown by detected categories
- **FR29:** User can view spending percentage distribution across categories
- **FR30:** User can view week-over-week spending trends
- **FR31:** User can view month-over-month spending comparisons
- **FR32:** System can identify high-spending categories and patterns
- **FR33:** User can view summary statistics (average daily spending, total by period)

### Data Management

- **FR34:** System can persist all expense data reliably
- **FR35:** System can sync data between offline and online states
- **FR36:** System can ensure zero data loss during offline-to-online sync
- **FR37:** User can access full functionality without internet connection
- **FR38:** System can store data locally when offline (IndexedDB)
- **FR39:** System can automatically sync when connection is restored
- **FR40:** User data is isolated and secured (single-user MVP)

### User Account Management

- **FR41:** User can log into the application with credentials
- **FR42:** System can authenticate user sessions securely (JWT)
- **FR43:** User can maintain logged-in state across sessions
- **FR44:** System can enforce HTTPS-only communication

### Progressive Web App Features

- **FR45:** User can install app to device home screen (Add to Home Screen)
- **FR46:** App can launch instantly like a native application
- **FR47:** System can cache static assets for fast repeat visits
- **FR48:** User can access app icon from home screen with one tap
- **FR49:** App can function fully in offline mode
- **FR50:** System can provide fast load times (<2 seconds on 4G)

### User Experience

- **FR51:** System can provide user-friendly error messages
- **FR52:** System can display helpful guidance when no data exists (empty states)
- **FR53:** System can show loading indicators during data operations
- **FR54:** System can support keyboard navigation for accessibility
- **FR55:** App interface can adapt to different screen sizes (responsive design)
