---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: []
date: 2026-01-13
author: HoanTran
---

# Product Brief: Daily Expenses

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

**Daily Expenses** là ứng dụng web quản lý chi tiêu cá nhân được thiết kế để giải quyết vấn đề mất kiểm soát tài chính do thiếu công cụ theo dõi hiệu quả. Ứng dụng tập trung vào **extreme simplicity** - cho phép ghi chi tiêu trong **5-7 giây** với chỉ hai thông tin: số tiền và ghi chú tự do, giúp người dùng dễ dàng xây dựng thói quen theo dõi chi tiêu hằng ngày.

Khác với các ứng dụng truyền thống yêu cầu nhiều bước và dropdown category phức tạp, Daily Expenses áp dụng triết lý "less is more" - tối giản hóa data entry để tập trung vào việc **thực sự ghi chép** thay vì tạo ma sát. Ứng dụng hỗ trợ đặt mục tiêu tiết kiệm cụ thể, cảnh báo ngân sách, và theo dõi tiến độ đạt mục tiêu tài chính quan trọng (như chuẩn bị kết hôn).

Được phát triển theo mindset **MVP-first** với tech stack hiện đại (React + TanStack Query + Material-UI, .NET Core 10, PostgreSQL) và triển khai dưới dạng Progressive Web App (PWA) để truy cập nhanh từ màn hình điện thoại. Dự án vừa là công cụ thực tế phục vụ nhu cầu cá nhân, vừa là cơ hội học tập và thử nghiệm công nghệ.

---

## Core Vision

### Problem Statement

**Người dùng cá nhân gặp khó khăn trong việc quản lý và tiết kiệm tiền do thiếu công cụ theo dõi chi tiêu đơn giản và nhanh chóng.**

**Root cause analysis:**
- **Không có thói quen theo dõi**: Các công cụ hiện tại (Excel, sổ tay) mất thời gian và tạo ma sát
- **Apps phức tạp tạo barrier**: Category dropdowns, nhiều field bắt buộc, quá nhiều bước
- **Thiếu động lực rõ ràng**: Chỉ "tracking" mà không có mục tiêu cụ thể để phấn đấu

**Hậu quả cụ thể:**
- Không biết đã chi tiêu bao nhiêu và vào đâu mỗi tháng
- Dễ mất kiểm soát với các khoản chi nhỏ lẻ (đặc biệt qua thẻ tín dụng)
- Cuối tháng không thể nhìn lại để đánh giá và điều chỉnh
- Không có cảnh báo khi chi tiêu vượt mức
- Mất cân đối giữa thu nhập và chi tiêu
- **Không đạt được mục tiêu tài chính lớn** (tiết kiệm để kết hôn, mua nhà, đầu tư)

### Problem Impact

**Tác động ngắn hạn:**
- Stress và lo lắng về tình hình tài chính
- Chi tiêu vượt mức vào những khoản không cần thiết (đồ linh tinh)
- Cảm giác "tiền bốc hơi" mà không rõ đi đâu

**Tác động dài hạn:**
- Không tích lũy được tiền cho các mục tiêu lớn
- Trì hoãn các kế hoạch quan trọng trong cuộc sống (kết hôn, mua nhà)
- Hình thành thói quen chi tiêu thiếu kỷ luật và ý thức

**Personal impact:**
- Mục tiêu cụ thể: Cần tiết kiệm để chuẩn bị kết hôn
- Thời gian: Càng sớm càng tốt, nhưng cần công cụ hiệu quả
- Động lực: Rất cao nhưng thiếu phương tiện theo dõi phù hợp

### Why Existing Solutions Fall Short

**Các giải pháp truyền thống (Excel, sổ tay):**
- Mất thời gian để mở và ghi chép (~1-2 phút/lần)
- Thiếu tính tiện lợi, dễ quên và bỏ qua
- Không có tính năng cảnh báo, phân tích tự động
- Không sync giữa các thiết bị

**Các ứng dụng có sẵn (Moneylover, YNAB, Wallet, Money Manager):**

*Phân tích từ party mode discussion:*

**Typical flow của apps hiện tại (~30-45 giây, 10 bước):**
1. Unlock phone
2. Tìm và mở app
3. Đợi app load
4. Tap 'Add expense'
5. Chọn ngày (nếu không phải hôm nay)
6. Nhập số tiền
7. **Chọn category từ dropdown dài** ← Major friction
8. Chọn payment method (cash/card/bank) ← Optional nhưng often required
9. Thêm note
10. Tap 'Save'

**Friction points:**
- **Quá nhiều bước**: 10 bước tạo ma sát, người dùng dễ bỏ qua
- **Category dropdown**: Cứng nhắc, không linh hoạt, mất thời gian chọn
- **Required fields**: Nhiều field bắt buộc mà không cần thiết cho MVP
- **Load time**: Web apps thường chậm, native apps tốn dung lượng

**Why user chưa thử các apps này:**
- Là developer muốn tự xây dựng để học hỏi
- Muốn có sự kiểm soát hoàn toàn về tính năng và dữ liệu
- Nhìn thấy cơ hội làm đơn giản hơn các giải pháp hiện có

**Key insight từ party mode:** 
Vấn đề không phải là thiếu apps, mà là apps hiện tại **quá phức tạp** và tạo **ma sát ngăn việc ghi chép thường xuyên**. Để xây dựng thói quen, cần giảm friction xuống mức tối thiểu.

### Proposed Solution

**Daily Expenses** là Progressive Web App (PWA) cho phép ghi chi tiêu trong **5-7 giây** với workflow tối giản.

**Core User Flow (4 bước, 5-7 giây):**
1. **Mở app** - Tap shortcut trên home screen (PWA) → 0.5s
2. **Nhập số tiền** - Input tự động focus, number keyboard → 2-3s
3. **Ghi chú ngắn** - Tab sang field note, gõ tự do (VD: "cà phê", "ăn trưa") → 2-3s
4. **Save** - Tap button hoặc Enter → 0.5s

**→ Total: 5-7 giây với đầy đủ context!**

**MVP Features (Timeline: 1 tháng):**

**Week 1-2: Core Tracking**
- Ultra-fast expense entry (số tiền + note only)
- Expense list với daily/monthly grouping
- Basic daily/monthly totals
- PWA setup (add to home screen, offline mode)

**Week 3: Budget & Alerts**
- Set monthly budget
- Real-time alert khi chi tiêu vượt mức
- Budget progress visualization
- Balance tracking (thu nhập vs chi tiêu)

**Week 4: Goals & Polish**
- Saving goal setting và tracking
- Goal progress visualization
- Basic charts (chi tiêu theo thời gian)
- UI/UX polish, testing, deployment

**Technical Architecture:**

**Frontend:**
- React 18 + TanStack Query (data fetching & caching)
- Material-UI (MUI) components
- PWA configuration (Service Worker, manifest.json)
- Optimistic UI updates (instant feedback)
- IndexedDB cho offline storage

**Backend:**
- .NET Core 10 (C#) REST API
- Minimal endpoints: expenses CRUD, budget, goals, stats
- JWT authentication (single user MVP)
- Connection pooling cho performance

**Database:**
- PostgreSQL
- Simple schema: expenses, budgets, goals tables
- Indexed queries cho fast retrieval

**Key Technical Decisions:**
- **PWA over native**: Faster development, cross-platform
- **Optimistic UI**: Show success immediately, sync in background
- **Offline-first**: Work without internet, sync when online
- **Number-first input**: Auto-focus, keyboard optimization

### Key Differentiators

**1. Extreme Simplicity - "Less is More"**
- **2 fields only**: Số tiền + note (không category dropdown!)
- Note tự do: "cà phê", "grab", "ăn trưa" → tự nhiên hơn dropdown
- Future: AI có thể parse note thành category sau, nhưng không block user

**vs Competitors:**
- Moneylover/YNAB: 5-7 required fields
- Daily Expenses: 2 fields
- **Result**: 6x ít friction hơn

**2. Speed-First Design - "5-7 Seconds Reality"**
- Input auto-focus khi mở app
- Number keyboard tự động
- Tab navigation
- Enter to save
- Optimistic UI (no waiting)

**vs Traditional apps:** 
- Others: 30-45 giây (10 bước)
- Daily Expenses: 5-7 giây (4 bước)
- **Result**: 5-6x nhanh hơn

**3. Goal-Oriented Approach**
- Không chỉ tracking, mà **tracking để đạt mục tiêu**
- Saving goal với deadline rõ ràng
- Progress visualization tạo động lực
- Budget alerts ngăn overspending

**Psychological advantage:**
- **Clear motivation**: "Tiết kiệm để lấy vợ" > "Theo dõi chi tiêu"
- **Tangible progress**: Thấy được tiến độ mỗi ngày
- **Positive reinforcement**: Celebrate milestones

**4. MVP-First Mindset**
- Ship simple, iterate based on real usage
- 1 tháng để có usable product
- Learn from own behavior before adding features
- Developer-owned = fast iteration cycles

**vs Feature-rich apps:**
- Others: Kitchen sink approach, overwhelming
- Daily Expenses: Start minimal, add what's needed
- **Result**: Faster to market, easier to use

**5. Developer-Owned & Open to Evolution**
- Full control về features và data
- Có thể customize theo nhu cầu thực tế
- Learning project + practical tool
- Modern tech stack có thể scale

**Future possibilities:**
- AI category từ note
- Voice input
- Bank API integration
- Receipt OCR
- Multi-user/family sharing
→ Nhưng chỉ thêm khi proven cần thiết từ usage

---

## Target Users

### Primary User: HoanTran - The Goal-Driven Developer

**Profile:**
- **Age & Role**: 30 tuổi, Senior Software Developer
- **Tech Comfort**: iOS user, comfortable với web apps và PWAs
- **Income Level**: Stable, professional income
- **Relationship Status**: Single, có kế hoạch kết hôn trong 2 năm

**Financial Context:**
- **Saving Goal**: 300 triệu trong 2 năm để chuẩn bị kết hôn
- **Monthly Target**: 12.5 triệu/tháng cần tiết kiệm
- **Current Challenge**: Không theo dõi chi tiêu → mất kiểm soát → không đạt mục tiêu

**Spending Behavior:**
- **Primary Expenses**: Ăn uống hàng ngày, tạp hóa
- **Payment Method**: Chủ yếu dùng thẻ tín dụng (credit/debit card)
- **Major Pain Point**: Săn sale đồ công nghệ - impulse buying khi thấy deals
- **Spending Pattern**: 
  - Daily small expenses: 100-200k (ăn uống, cafe)
  - Impulse purchases: 500k - vài triệu (tech gadgets khi sale)
  - Monthly blind spots: Không biết tổng chi tiêu, không nhận ra pattern

**Current Situation:**
- Không dùng công cụ theo dõi chi tiêu nào
- Quẹt card dễ dàng → mất cảm giác "tiền ra"
- Cuối tháng không biết đã chi bao nhiêu, vào đâu
- Thường mua đồ công nghệ khi thấy sale mà không cân nhắc budget
- Có động lực mạnh (lấy vợ) nhưng thiếu công cụ hỗ trợ

**Behaviors & Habits:**
- **Tech-savvy**: Là developer, thoải mái với technical solutions
- **Mobile-first**: Điện thoại luôn bên người, muốn access nhanh
- **Daily checker**: Có thói quen check tài chính hằng ngày (nếu có tool)
- **Responsive to data**: Sẵn sàng điều chỉnh hành vi khi nhìn thấy insights và alerts

**Motivations:**
- **Primary**: Tiết kiệm đủ tiền để kết hôn (mục tiêu cụ thể, deadline rõ ràng)
- **Secondary**: Kiểm soát chi tiêu impulse, đặc biệt săn sale đồ công nghệ
- **Underlying**: Muốn có kỷ luật tài chính tốt hơn, chuẩn bị cho tương lai

**Frustrations:**
- "Cuối tháng nhìn account balance giảm mà không biết tiêu vào đâu"
- "Thấy deal đồ công nghệ là muốn mua ngay, không nghĩ đến budget"
- "Không có cảnh báo khi chi tiêu vượt mức"
- "Apps hiện tại quá phức tạp, lười mở"

**Goals:**
- Track every expense để biết tiền đi đâu
- Nhận cảnh báo khi chi tiêu vượt budget
- Theo dõi progress tiết kiệm hướng đến 300 triệu
- Xây dựng thói quen ghi chép không tốn thời gian

**Success Criteria:**
- Ghi được mọi khoản chi tiêu trong 5-7 giây
- Nhìn thấy rõ pattern chi tiêu hàng tháng
- Nhận alert trước khi "săn sale" phá budget
- Track progress tiết kiệm và on track với goal 300 triệu
- Sau 1 tháng dùng: "Tháng này mình chi vào đồ tech 5 triệu, tháng sau phải cắt giảm"

### Secondary Users

**Future Spouse (Post-MVP):**
- **Profile**: Tương lai sau khi kết hôn
- **Need**: Tracking chi tiêu riêng trong cùng household
- **Approach**: Separate accounts, có thể share insights
- **MVP Consideration**: Single-user first, multi-user ở v2+

**Note**: MVP focuses hoàn toàn on HoanTran như sole user. Multi-user capabilities sẽ được evaluate sau khi validate core workflow với single user.

### User Journey

#### Phase 1: Discovery & Setup (Day 1)

**Context**: HoanTran quyết định tự build app để tracking chi tiêu

**Journey:**
1. **Development**: Tự code và deploy app
2. **PWA Installation**: Add to iOS home screen, shortcut sẵn sàng
3. **Goal Setting**: Nhập mục tiêu 300 triệu trong 2 năm
4. **Budget Setup**: Set monthly budget (VD: 15 triệu, để có 12.5 triệu tiết kiệm)

**First Impression**: "App đơn giản quá, chỉ vài field thôi. Thử xem nào!"

#### Phase 2: Daily Usage (Week 1-4)

**Morning Routine:**
```
7:30 AM - Mua cà phê 45k
→ Tap shortcut trên home screen (0.5s)
→ Gõ "45000" (2s)
→ Note "cafe" (2s)  
→ Tap Add (0.5s)
→ Done! Thấy "Today: 45k, Budget left: 14,955k"
```

**Lunchtime:**
```
12:00 PM - Ăn trưa 80k
→ Mở app (đã cache, instant load)
→ Quick add "80000" + "lunch"
→ 5 giây xong
→ Today: 125k, Budget left: 14,875k
```

**Evening - The Temptation:**
```
6:00 PM - Thấy Shopee sale iPhone accessories
→ Sắp checkout 1.5 triệu
→ Chợt nhớ: "Để check app xem chi bao nhiêu rồi"
→ Mở app: "Today: 3.2 triệu, Month: 18 triệu / 15 triệu budget"
→ 🚨 Alert: "Bạn đã vượt budget 3 triệu!"
→ Pause... "Oke, deal này bỏ qua. Tháng sau vậy."
→ ✅ Saved from impulse buy!
```

**Evening Check:**
```
10:00 PM - Daily review
→ Mở app xem expenses list
→ "Hôm nay: 3.2 triệu - ăn uống 200k, mua đồ 3 triệu"
→ "Tháng này đã chi 18 triệu, vượt budget rồi"
→ Mental note: "Tháng sau phải careful hơn"
```

**Key Behaviors:**
- Ghi expense **ngay sau khi chi** (habit forming trong 2 tuần)
- Check app **trước khi mua đồ tech** (learned behavior sau vài lần vượt budget)
- **End-of-day review**: Xem tổng chi tiêu ngày, adjust behavior ngày mai
- **Weekly review**: Nhìn lại pattern, identify categories chi nhiều

#### Phase 3: Success Moments

**Week 2 - First Aha Moment:**
```
"Wow, 2 tuần tracking mới thấy mình chi vào đồ công nghệ 6 triệu! 
Không tracking thì không bao giờ nhận ra pattern này."
```

**Month 1 - Budget Awareness:**
```
"Tháng đầu vượt budget 5 triệu vì chưa quen. 
Nhưng giờ biết rõ mình chi vào đâu rồi. 
Tháng sau sẽ cẩn thận hơn với săn sale!"
```

**Month 3 - Behavior Change:**
```
"Hôm nay thấy deal laptop cũ nhưng app báo đã chi 12 triệu rồi.
OK thôi, skip deal này. 
Còn 3 triệu buffer cho đến cuối tháng."
→ Successfully avoided impulse buy!
```

**Month 6 - Goal Progress:**
```
"6 tháng đã tiết kiệm được 60 triệu / 300 triệu target.
Progress bar: 20% complete.
On track! Nếu giữ được pace này, 2 năm đủ tiền cưới!"
→ Massive motivation boost!
```

**Year 1 - Mastery:**
```
"Giờ việc ghi chi tiêu như reflex rồi. 
Mua gì cũng mở app ghi luôn, 5 giây done.
Đã tiết kiệm 140 triệu, còn 160 triệu nữa là đủ.
App này life-changing thật!"
```

#### Phase 4: Long-term Value

**Habit Formation:**
- Tracking trở thành **automatic**: Mua gì → ghi ngay
- **Decision tool**: Check app trước khi mua đồ lớn
- **Accountability**: Nhìn thấy data → tự điều chỉnh behavior

**Goal Achievement:**
- **Month 24**: Đạt 300 triệu! 🎉
- **Confidence**: "Mình đã ready để propose!"
- **New Goal**: Plan wedding budget với vợ sắp cưới

**Post-Marriage (Future):**
- Tạo account cho vợ
- Mỗi người track riêng
- Share insights về household expenses
- New goals: Mua nhà, con cái, đầu tư

#### Key Touchpoints Summary

**Daily (3-5 lần/ngày):**
- Quick expense entry (5-7 giây/lần)
- Glance at today's total and budget status

**Weekly (Chủ nhật chiều):**
- Review week's expenses by category
- Identify overspending areas
- Plan next week's budget adjustments

**Monthly (Cuối tháng):**
- Deep dive into monthly spending
- Compare vs budget and previous months
- Update savings progress
- Set next month's goals

**Quarterly:**
- Big picture review of savings journey
- Celebrate milestones (25%, 50%, 75% goal)
- Adjust strategies if needed

---

## Success Metrics

### User Success Metrics

**Primary Success Outcome:**
- **Savings Goal Achievement**: Tiết kiệm đủ 300 triệu trong 2 năm để chuẩn bị kết hôn
- **Target**: 12.5 triệu/tháng average savings rate
- **Success Indicator**: Progress tracking shows on-track or ahead of schedule

**Behavioral Success Indicators:**

**1. Habit Formation (Core Behavior)**
- **Target**: Ghi chi tiêu mỗi khi có transaction
- **Success Metric**: Average 3-5 expense entries per day
- **Milestone Targets**:
  - Week 2: 70% days có expense entries
  - Month 1: 80% days có expense entries
  - Month 3: 90%+ days có expense entries (habit formed)
- **Ultimate Goal**: Tracking becomes automatic reflex

**2. Impulse Buying Control**
- **Problem**: Săn sale đồ công nghệ without budget consideration
- **Success Metric**: Số lần check app trước khi mua items > 500k
- **Behavioral Change Indicator**: 
  - Month 1: Awareness - "Ồ, tháng này mình chi nhiều quá"
  - Month 3: Prevention - Actively check app before purchase, avoid 50%+ impulse buys
  - Month 6: Mastery - Budget alerts successfully prevent overspending

**3. Budget Adherence**
- **Baseline**: Currently no budget control (often overspend)
- **Success Metric**: % of months staying within monthly budget
- **Milestone Targets**:
  - Month 1-2: Establishing baseline, likely to overspend (learning phase)
  - Month 3-6: 50% of months within budget
  - Month 7-12: 70%+ of months within budget
  - Year 2: 80%+ months within budget (mastery)

**4. Financial Awareness**
- **Before**: "Cuối tháng không biết đã chi bao nhiêu, vào đâu"
- **After Success**: "Biết rõ spending patterns, identify overspending categories"
- **Success Indicator**: User can answer "How much did I spend this month on X?" without checking app
- **Aha Moments**:
  - Week 2: First realization of spending patterns
  - Month 1: Clear picture of monthly expenses
  - Month 3: Proactive adjustment based on data

**5. Speed & Convenience (User Experience)**
- **Target**: Maintain 5-7 seconds per expense entry
- **Success Metric**: Average entry time ≤ 10 seconds (accounting for edge cases)
- **Friction Test**: User chooses to track even small expenses (<50k) without hesitation
- **Compliance Indicator**: No "batch entry" at end of day (sign of friction)

### Business/Product Objectives

**Phase 1: MVP Validation (Month 1-3)**

**Objective**: Prove core value proposition - fast tracking leads to habit formation

**Success Criteria:**
- ✅ MVP deployed and usable on iOS PWA
- ✅ Core features working: Quick add, list, daily/monthly totals
- ✅ User consistently uses app daily (70%+ days)
- ✅ Entry speed meets target (<10s average)
- ✅ At least one "aha moment" - user realizes spending patterns

**Measurable Outcomes:**
- Total expenses tracked: 200+ entries in Month 1
- App open frequency: 3-5 times per day
- User sentiment: "Việc ghi chi tiêu không còn là burden"

**Phase 2: Feature Enhancement (Month 4-6)**

**Objective**: Add budget control and goal tracking to drive behavior change

**Success Criteria:**
- ✅ Budget alerts implemented and effective
- ✅ Savings goal tracking visible and motivating
- ✅ User avoids at least 2-3 impulse purchases due to app alerts
- ✅ 50%+ months within budget

**Measurable Outcomes:**
- Budget violations prevented: 2-3 instances per month
- User checks app before major purchases (>500k)
- Progress toward 300M goal: On track (60M+ saved by Month 6)

**Phase 3: Habit Mastery (Month 7-12)**

**Objective**: Tracking becomes automatic, consistent savings achieved

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

**Objective**: Achieve 300M savings goal and prepare for life milestone

**Success Criteria:**
- ✅ Total savings: 300M+ achieved
- ✅ Financial discipline maintained throughout journey
- ✅ Ready to propose with financial confidence
- ✅ Consider v2 features: multi-user for post-marriage

**Measurable Outcomes:**
- Goal completion: 100% (300M saved)
- User testimonial: "App changed my financial life"
- Product evolution decision: Continue as personal tool or share with community

### Key Performance Indicators (KPIs)

**Daily KPIs:**
- **Expense Entry Rate**: 3-5 entries per day (Target: maintain consistency)
- **Entry Speed**: ≤10 seconds average (Target: 5-7 seconds ideal)
- **App Opens**: 3-5 times per day minimum
- **Daily Total Accuracy**: User can estimate without checking (<10% error)

**Weekly KPIs:**
- **Tracking Consistency**: 6-7 days tracked per week (Target: 85%+)
- **Budget Awareness**: User knows remaining budget without checking app
- **Pattern Recognition**: User identifies overspending categories

**Monthly KPIs:**

**Usage Metrics:**
- **Total Entries**: 80-150 expenses per month (based on 3-5/day)
- **Active Days**: 25+ days per month (Target: 80%+ days)
- **Average Entry Time**: ≤10 seconds
- **Feature Usage**: Daily totals viewed 25+ times, monthly review completed

**Financial Metrics:**
- **Total Monthly Expenses**: Tracked and visible
- **Budget Adherence**: Within ±10% of monthly budget
- **Monthly Savings**: 12.5M+ average
- **Impulse Purchases Prevented**: 2-3+ major purchases (>500k) avoided

**Behavioral Metrics:**
- **Pre-Purchase App Checks**: User checks app before 80%+ major purchases
- **Budget Alert Response**: User adjusts spending 70%+ of times after alert
- **Habit Strength**: Tracking without reminders, automatic behavior

**Quarterly KPIs:**

**Progress Metrics:**
- **Cumulative Savings**: On track for 300M goal
  - Q1 (Month 3): 30-37.5M (10-12.5% of goal)
  - Q2 (Month 6): 60-75M (20-25% of goal)
  - Q3 (Month 9): 90-112.5M (30-37.5% of goal)
  - Q4 (Month 12): 140-150M (47-50% of goal)

**Habit Metrics:**
- **Tracking Consistency**: 90%+ days tracked
- **Budget Success Rate**: 50%+ months within budget (Q2), 70%+ (Q3-Q4)
- **Behavioral Change**: Measurable reduction in impulse spending

**Satisfaction Metrics:**
- **Perceived Value**: User considers app "essential"
- **Time Investment**: <5 minutes per day total (tracking + review)
- **Goal Confidence**: User feels confident about reaching 300M

**Yearly KPIs:**

**Goal Achievement:**
- **Year 1 Savings**: 140-150M (47-50% of 300M goal)
- **Year 2 Savings**: 300M+ total (goal achieved)

**Product Success:**
- **Retention**: User still actively tracking after 12+ months
- **Mastery**: Tracking is habitual, <10s entry time maintained
- **Impact**: User attributes financial discipline improvement to app

**Leading Indicators (Predictive):**
- **Week 2 Consistency**: If 70%+ days tracked → High likelihood of Month 1 success
- **Month 1 Budget Awareness**: If user knows spending by category → Behavior change likely
- **Month 3 Habit Formation**: If 80%+ days tracked → Long-term success probable
- **Month 6 Progress**: If 60M+ saved → On track for 2-year goal

**Lagging Indicators (Outcome):**
- **Monthly Savings Rate**: Actual tiết kiệm achieved
- **Goal Completion**: 300M milestone reached
- **Behavioral Transformation**: From impulse spender to disciplined saver

### Success Thresholds

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

### Failure Criteria (Pivot Signals)

**Product Failure Indicators:**
- User stops tracking after 2 weeks (<50% days tracked)
- Entry time >30 seconds (too much friction)
- User reverts to impulse buying with no reduction
- No "aha moments" after Month 1
- Savings rate <8M/month (off track)

**If Failure Occurs:**
- Re-evaluate UX: Is entry too slow/complex?
- Add features: Voice input? Auto-categorization?
- Simplify further: Remove unnecessary fields?
- Gamification: Add rewards/streaks to maintain motivation?

---

## MVP Scope

### Core Features (1 Month Timeline)

**Week 1-2: Essential Tracking Foundation**

**1. Ultra-Fast Expense Entry**
- **Quick Add Form**:
  - Amount input field (number, auto-focus, number keyboard)
  - Note field (free text, optional but recommended)
  - Date auto-set to today (editable if needed)
  - Submit button + Enter key support
- **Target**: 5-7 seconds per entry
- **UX**: Optimistic UI - show success immediately, sync in background
- **Offline Support**: IndexedDB for offline storage, sync when online

**2. Expense List & History**
- **Daily View**: Today's expenses with running total
- **Monthly View**: Current month expenses grouped by day
- **List Features**:
  - Display: Amount, note, date/time
  - Sort: Most recent first
  - Simple scroll/pagination
  - Basic edit/delete (tap to edit)
- **Quick Stats Display**:
  - Today's total
  - Month's total
  - Simple, always visible

**3. Progressive Web App (PWA) Setup**
- **Installation**:
  - Add to Home Screen capability (iOS/Android)
  - Shortcut icon on home screen
  - Instant launch like native app
- **Performance**:
  - Service Worker for offline functionality
  - Cache static assets for fast load
  - Background sync when online
- **Mobile Optimization**:
  - Responsive design (mobile-first)
  - Touch-optimized inputs
  - Fast tap responses

**Week 3: Budget Control**

**4. Budget Management**
- **Budget Setting**:
  - Set monthly budget limit (VD: 15 triệu)
  - Simple input form, persist per month
- **Budget Tracking**:
  - Show remaining budget
  - Daily progress indicator
  - Visual progress bar
- **Budget Alerts**:
  - Warning at 80% budget used
  - Alert when over budget
  - Notification/banner style (non-intrusive)

**5. Spending Overview**
- **Dashboard Elements**:
  - Today's spending vs average
  - Week's spending trend
  - Month's spending vs budget
  - Simple bar chart or progress visualization

**Week 4: Goals & Polish**

**6. Savings Goal Feature**
- **Goal Setting**:
  - Set target amount (VD: 300 triệu)
  - Set deadline (VD: 2 năm)
  - Calculate monthly savings needed
- **Progress Tracking**:
  - Current savings amount (manual input initially)
  - Progress bar visualization
  - Percentage complete
  - Estimated completion date based on current rate
- **Motivation Elements**:
  - Milestone celebrations (25%, 50%, 75%)
  - Time remaining to goal
  - "On track" / "Behind" / "Ahead" status

**7. UI/UX Polish**
- **Material-UI Components**: Consistent, professional look
- **Loading States**: Skeleton screens, spinners
- **Error Handling**: User-friendly error messages
- **Empty States**: Helpful messaging when no data
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: Proper labels, keyboard navigation

### MVP Technical Specifications

**Frontend Stack:**
- React 18 (latest features)
- TanStack Query (data fetching, caching, optimistic updates)
- Material-UI v5 (component library)
- React Router (if multi-page needed)
- Workbox (Service Worker/PWA)

**Backend Stack:**
- .NET Core 10 (C# Web API)
- Entity Framework Core (ORM)
- JWT Authentication (simple, single-user)
- RESTful API design

**Database:**
- PostgreSQL 15+
- Simple schema:
  - `users` table (single user for MVP)
  - `expenses` table (id, user_id, amount, note, date, created_at)
  - `budgets` table (id, user_id, month, amount)
  - `goals` table (id, user_id, target_amount, current_amount, deadline, created_at)

**API Endpoints (Minimal):**
```
POST   /api/auth/login          # Simple auth
GET    /api/expenses            # List expenses (paginated, filtered by date)
POST   /api/expenses            # Create expense
PUT    /api/expenses/{id}       # Update expense
DELETE /api/expenses/{id}       # Delete expense
GET    /api/expenses/stats      # Daily/monthly totals
POST   /api/budgets             # Set/update monthly budget
GET    /api/budgets/current     # Get current month budget status
POST   /api/goals               # Create/update savings goal
GET    /api/goals/progress      # Get goal progress
```

**Deployment:**
- Frontend: Vercel/Netlify (easy PWA hosting)
- Backend: Railway/Render/Azure (free tier initially)
- Database: Railway/Supabase/Azure (PostgreSQL hosting)

### Out of Scope for MVP

**Explicitly Deferred to v2+:**

**1. Advanced Categorization**
- Dropdown category selection (too much friction)
- Auto-categorization from note using AI/ML
- Category-based budgeting
- Category analytics and trends
- **Rationale**: Free-text note is simpler and faster for MVP. Categories can be added later through AI parsing or manual tagging without blocking initial tracking.

**2. Multi-User & Collaboration**
- Multiple user accounts
- Family/household sharing
- Shared budgets or goals
- Permission management
- **Rationale**: Single-user focus for MVP validates core workflow first. Multi-user adds significant complexity (auth, data isolation, sharing logic). Can add after proving value with solo user.

**3. Advanced Input Methods**
- Voice input ("45k cafe")
- Receipt scanning with OCR
- SMS parsing for bank transactions
- Email receipt parsing
- **Rationale**: Nice-to-have but not essential for 5-7 second entry goal. Manual entry validates the UX first. Can add as enhancement if users request it.

**4. Bank & Payment Integration**
- Bank API connections
- Automatic transaction import
- Credit card synchronization
- E-wallet integration (Momo, ZaloPay)
- **Rationale**: Requires complex API integrations, bank partnerships, security compliance. MVP focuses on manual tracking to validate behavior change first. Automation comes later if proven valuable.

**5. Advanced Analytics**
- Spending trends over time
- Predictive analytics
- AI spending insights
- Comparison with similar users
- Custom reports and exports
- **Rationale**: Basic stats are sufficient for MVP. Advanced analytics require significant data accumulation and development time. Can add once users have months of data.

**6. Social & Gamification**
- Sharing achievements
- Leaderboards or challenges
- Friend comparisons
- Community features
- Badges and rewards system
- **Rationale**: MVP is personal tool. Social features add complexity and may not align with private financial tracking. Can explore if users request community aspects.

**7. Advanced Budget Features**
- Category-specific budgets
- Rolling budgets
- Envelope budgeting system
- Budget templates
- Budget sharing
- **Rationale**: Simple monthly budget sufficient for MVP. Advanced budgeting requires proven need from user behavior. Can add based on user feedback.

**8. Cross-Platform Native Apps**
- iOS native app
- Android native app
- Desktop application
- Browser extensions
- **Rationale**: PWA covers 95% of use cases with 20% of effort. Native apps can come later if PWA limitations discovered.

**9. Advanced Security Features**
- Biometric authentication
- Encryption at rest
- Two-factor authentication
- PIN lock
- **Rationale**: Basic JWT auth sufficient for MVP (single user, low security risk). Can add security layers based on user concerns.

**10. Integrations & Exports**
- Excel export
- Google Sheets sync
- Zapier integration
- API for third-party apps
- Webhook notifications
- **Rationale**: MVP focuses on core tracking. Integrations require API stability and documentation. Can add based on user workflow needs.

### MVP Success Criteria

**Launch Criteria (Week 4):**
- ✅ All core features functional and tested
- ✅ PWA installable on iOS
- ✅ Expense entry ≤10 seconds consistently
- ✅ No critical bugs blocking usage
- ✅ Backend deployed and stable
- ✅ Data persists reliably

**Validation Phase (Week 5-8):**
- **Usage Success** (Week 8 Target):
  - 70%+ days with expense entries
  - 100+ total expenses tracked
  - Average entry time <10 seconds
  - User feedback: "Easy to use, tracking is not a burden"

- **Value Creation** (Week 8 Target):
  - User has at least one "aha moment" (realizes spending pattern)
  - User mentions changing a purchasing decision based on app data
  - User checks app before major purchase (>500k) at least once
  - User sentiment: "This is actually helping me"

**Go/No-Go Decision (Month 3):**

**GO Signals (Proceed to v2 features):**
- User tracks consistently (80%+ days in Month 3)
- Habit formed: Tracking feels automatic
- Budget awareness: User knows spending without checking app
- Behavioral change: At least one avoided impulse purchase
- Goal progress: On track or close (target 37.5M by Month 3)
- User feedback: "I can't imagine not using this now"

**ITERATE Signals (Refine MVP before expanding):**
- Usage declining (60-79% days tracked)
- Entry time >15 seconds (friction exists)
- User skips tracking on some days
- No clear "aha moments" yet
- Feedback: "It's okay but I'm not convinced yet"
- **Actions**: UX improvements, reduce friction, add motivation elements

**NO-GO Signals (Pivot or abandon):**
- Usage dropped (<50% days tracked in Month 3)
- Entry time >30 seconds (too much friction)
- User stopped using after initial weeks
- No behavioral change observed
- Feedback: "This doesn't work for me" or silence
- **Actions**: Major pivot (voice input? Auto-categorization?), or accept product doesn't solve problem

### Future Vision (Post-MVP)

**Phase 2: Intelligence & Automation (Month 4-6)**

**Smart Features:**
- **AI Category Detection**: Parse free-text notes → auto-suggest categories
  - Example: "cafe" → Food & Drink category
  - Machine learning from user patterns
  - User can accept/reject suggestions
- **Smart Defaults**: Predictive input based on time/location
  - Morning → suggest "cafe"
  - Lunch time → suggest "lunch" with average amount
- **Spending Insights**: 
  - "You spend 40% on food, 30% on tech, 20% on transport"
  - "You spend 2x more on weekends"
  - "Tech spending up 50% this month"

**Enhanced Tracking:**
- **Voice Input**: "Hey app, 45k cafe" → instant entry
- **Quick Actions**: Widget với preset buttons (cafe, lunch, transport)
- **Batch Entry**: Add multiple expenses at once (end of day catchup)

**Phase 3: Advanced Analytics & Integrations (Month 7-12)**

**Analytics:**
- **Trend Analysis**: Spending trends over time, month-over-month comparisons
- **Predictive Budgeting**: AI suggests budget based on patterns
- **Goal Optimization**: Recommend spending cuts to hit savings goal faster
- **Custom Reports**: Export filtered data, generate PDF reports

**Automation:**
- **Bank API Integration**: Auto-import transactions from bank
- **Receipt OCR**: Scan receipt → auto-extract amount and items
- **E-wallet Sync**: Sync with Momo, ZaloPay transactions
- **Email Parsing**: Parse receipt emails from e-commerce

**Phase 4: Multi-User & Collaboration (Year 2)**

**Post-Marriage Features:**
- **Multi-User Accounts**: Create account for spouse
- **Household Mode**: 
  - Each person tracks own expenses
  - Shared view of household spending
  - Individual + combined budgets
  - Separate savings goals (personal + joint)
- **Family Planning**: Budget for future (house, kids, etc.)

**Phase 5: Platform & Community (Year 2+)**

**Scale Considerations:**
- **Native Apps**: iOS/Android native if PWA shows limitations
- **API Platform**: Third-party integrations, developer API
- **Community Features** (if valuable):
  - Anonymous spending benchmarks
  - Financial tips and resources
  - Success stories from users
  - Optional public profiles

**Long-term Vision:**
From personal tool → potentially valuable for broader community of goal-driven savers. But only if:
- Core single-user experience is exceptional
- User testimonial: "This changed my financial life"
- Organic interest from others seeing success
- Developer has capacity to support wider audience

**Guiding Principle**: Always prioritize simplicity and speed. Every feature must justify its friction cost. If it doesn't make tracking faster or insights clearer, defer it.

