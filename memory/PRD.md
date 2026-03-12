# Credlocity CMS - Product Requirements Document

## Original Problem Statement
Build a comprehensive legal-tech platform (Credlocity CMS) that includes:
- Attorney marketplace for FCRA cases with bidding system
- Client review system
- Employee activity tracking
- Payroll management
- Multi-company subscription system
- Credlocity Partners directory
- Credit Issue Educational Pages
- Real-time bid notifications
- Revenue splitting between Credlocity and referring companies

## Core Architecture

### Tech Stack
- **Frontend**: React with Tailwind CSS, Shadcn/UI components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT-based for admin/staff, custom tokens for attorneys/partners

---

## What's Been Implemented

### Latest Session: January 28, 2025

#### 1. Shar Schaffeld Profile & Merger Announcement (COMPLETE)
- **Updated Shar's Profile** at `/team/shar-schaffeld`:
  - Photo: Professional headshot
  - Title: Chief Operating Officer (COO)
  - Specialization: Credit Repair Operations & Regulatory Compliance
  - Full bio with professional background
  - Credentials: Idaho #CCR-10773 MLS, Oregon #DM-80114 MLS, NMLS #1672269
  - 17+ Years Experience badge
  - LinkedIn social link
  
- **Merger Announcement** updated with:
  - "Featured Team Members" section showing Shar with "View Profile →" link
  - Large featured "Meet Our New COO" section with photo, bio, and "View Shar's Full Profile" button
  - Full merger details (34 years combined expertise, 18 professionals, bi-coastal offices)

#### 2. Real-time Bid Notifications (COMPLETE)
New notification system in `/app/backend/marketplace_api.py`:

**Functions Added:**
- `create_notification()` - Creates notification records in database
- `notify_outbid_attorneys()` - Notifies all attorneys when someone places a higher bid
- `notify_bid_accepted()` - Notifies attorney when their bid wins
- `notify_bidding_deadline()` - Reminds bidders of approaching deadlines

**API Endpoints:**
- `GET /api/marketplace/notifications` - Get attorney's notifications (with unread count)
- `PATCH /api/marketplace/notifications/{id}/read` - Mark notification as read
- `POST /api/marketplace/notifications/mark-all-read` - Mark all as read

**Notification Types:**
- `outbid` - "You've Been Outbid!" with competitor's bid amount
- `bid_accepted` - "Congratulations! Your Bid Was Accepted"
- `bidding_deadline` - Deadline reminders (6 hours, 24 hours)
- `settlement_confirmed` - Settlement confirmation

#### 3. Revenue Splitting Logic (COMPLETE)
Implemented in `/app/backend/marketplace_api.py`:

**Default Split Configuration:**
```python
DEFAULT_REVENUE_SPLIT = {
    "credlocity_percentage": 40,  # Credlocity takes 40%
    "company_percentage": 60,     # Referring company gets 60%
}
```

**Functions Added:**
- `calculate_revenue_split()` - Calculates split amounts based on total revenue
- `process_case_settlement_revenue()` - Processes revenue when case settles:
  - Creates revenue_splits collection records
  - Updates case with revenue_split info
  - Updates company's pending_payout balance
  - Updates platform_revenue tracking (monthly aggregation)

**Data Tracked:**
- Revenue by month in `platform_revenue` collection
- Individual revenue entries per case
- Company payout transactions (pending/completed)

#### 4. ImageUpload Component Added to Blog CMS (COMPLETE)
- Added `ImageUpload` component to `/app/frontend/src/pages/admin/blog/CreatePost.js`
- Added `ImageUpload` component to `/app/frontend/src/pages/admin/blog/EditPost.js`
- Replaces text URL input with drag-and-drop file upload
- Supports both file upload and URL fallback

#### 6. CMS Component Standardization (COMPLETE - January 28, 2025)
**Added ImageUpload & SchemaSelector to all remaining CMS modules:**

- **CreatePage.js** (`/admin/pages/create`):
  - Featured Image with ImageUpload (drag-and-drop + URL fallback)
  - Featured Image Alt Text field
  - Schema.org Structured Data (SchemaSelector with "page" defaults)
  - OG Image field in SEO Settings

- **EditPage.js** (`/admin/pages/edit/:id`):
  - Same components as CreatePage
  - Properly loads existing featured_image_url, schema_types

- **TeamManagement.js** (`/admin/team`):
  - Profile Photo ImageUpload in Add/Edit modal
  - Photo preview in member list table
  - 2MB file size limit for profile photos

- **LawsuitForm.js** (`/admin/lawsuits/create` & edit):
  - Featured Image with ImageUpload
  - Featured Image Alt Text field
  - SchemaSelector with "lawsuit" defaults (Legal Case, Legal Service, Breadcrumb, Organization)
  - Custom Schema.org JSON Data (Advanced) field retained

**Testing Status:** 100% verified (iteration_7.json)

#### 5. Previous Session Work (Still Active)
- Hero image with Black/Hispanic family
- 6 Credit Issue Educational Pages (FDCPA, FCBA, FCRA content)
- Footer scroll-to-top fix
- Homepage performance optimization
- Blog CMS credit issue page linking
- Partner video testimonials
- Schema Selector & Credlocity Partners system

---

## Key Credentials
- **Admin Login**: Admin@credlocity.com / Credit123!
- **Attorney Login**: test.attorney@marketplace.com / Attorney123!
- **Partner Login**: test.partner@outsourcing.com / Partner123!

---

## Database Collections (New/Updated)

### `notifications`
```json
{
  "id": "uuid",
  "recipient_id": "user_id",
  "recipient_type": "attorney|company|admin",
  "notification_type": "outbid|bid_accepted|bidding_deadline|settlement_confirmed",
  "title": "string",
  "message": "string",
  "related_case_id": "case_id",
  "related_bid_id": "bid_id",
  "priority": "low|normal|high|urgent",
  "action_url": "/attorney/marketplace/...",
  "is_read": false,
  "created_at": "ISO timestamp"
}
```

### `revenue_splits`
```json
{
  "id": "uuid",
  "case_id": "case_id",
  "company_id": "company_id",
  "settlement_amount": 10000.00,
  "initial_fee": 500.00,
  "commission_amount": 300.00,
  "total_revenue": 800.00,
  "split_details": {
    "credlocity_percentage": 40,
    "company_percentage": 60,
    "credlocity_amount": 320.00,
    "company_amount": 480.00
  },
  "status": "pending_payout",
  "created_at": "ISO timestamp"
}
```

### `platform_revenue` (monthly aggregation)
```json
{
  "period": "2025-01",
  "total_revenue": 12500.00,
  "case_count": 15,
  "revenue_entries": [...]
}
```

---

## API Endpoints (New)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/marketplace/notifications` | GET | Get attorney notifications |
| `/api/marketplace/notifications/{id}/read` | PATCH | Mark notification read |
| `/api/marketplace/notifications/mark-all-read` | POST | Mark all read |
| `/api/admin/revenue-splits` | GET | Get revenue splits with filtering |
| `/api/admin/revenue-splits/export` | GET | Export revenue splits to CSV |
| `/api/authors/slug/{slug}` | GET | Get author by slug (public) |

---

## Testing Status
- **Backend**: 100% (15/15 tests passed)
- **Frontend**: 100% (all features verified)
- **Latest test report**: `/app/test_reports/iteration_8.json`

---

## Backlog / Upcoming Tasks

### P0 (Completed This Session - January 29, 2025)
- [x] CMS Component Standardization (ImageUpload & SchemaSelector to all modules)
- [x] Real-time Bid Notifications Frontend UI (NotificationDropdown component)
- [x] Revenue Splitting Dashboard (RevenueSplitReport admin page)
- [x] Internal Employee Chat System (Full-featured with DMs, Groups, Departments)
- [x] Customer Support Chat (Live Agent + Chatbot Settings + Knowledge Base)

### P1 (Completed Previously)
- [x] Real-time bid notifications backend logic
- [x] Revenue splitting backend logic (40/60 split)
- [x] Add ImageUpload to Blog CMS
- [x] Add ImageUpload & SchemaSelector to all CMS modules

### P2 (Medium Priority)
- [ ] Payroll System (Phase 2)
- [ ] AI Chatbot Full Integration (connect to LLM provider using Emergent Key)

### P3 (Lower Priority)
- [ ] Google Voice Integration (Paused)
- [ ] Backend data cleanup for `lawsuit_party_roles`
- [ ] Redefined `Author` model linting warning fix
- [ ] Investigate intermittent 404 on Companies Stats Endpoint

---

## New Components Added (January 29, 2025)

### Internal Chat System (`/app/frontend/src/pages/admin/chat/InternalChat.js`)
- Real-time team messaging with polling
- Direct Messages (1-on-1)
- Group Channels
- Department Channels (Collections, Sales, Support, Legal, Operations, Management, General)
- File sharing support
- User search and channel creation
- Unread message counts

### Customer Support Chat (`/app/frontend/src/pages/admin/support-chat/SupportChatDashboard.js`)
- **Live Chat Tab**: Agent dashboard with session queue (Waiting/Active/Mine filters)
- **Chatbot Settings Tab**: AI configuration (Model Provider, Model Name, Temperature, Max Tokens, System Prompt)
  - Note: AI integration is settings-only, actual LLM connection pending
- **Knowledge Base Tab**: Article management with import from FAQs/Blog
- **Analytics Tab**: Session stats, resolution rate, top agents

### NotificationDropdown (`/app/frontend/src/components/attorney/NotificationDropdown.js`)
- Bell icon with unread count badge
- Polls every 30 seconds for new notifications
- Dropdown panel with notification list
- Mark as read (single/all) functionality
- Notification type icons (outbid, bid_won, payment_received, case_update)

### RevenueSplitReport (`/app/frontend/src/pages/admin/revenue/RevenueSplitReport.js`)
- Admin dashboard for tracking 40%/60% revenue splits
- Summary stat cards (Total Revenue, Credlocity Share, Company Share, Cases Settled, Pending Payouts)
- Visual 40%/60% distribution chart
- Filters: Status, Company, Date Range, Search
- Export to CSV functionality
- Paginated transactions table

---

## Chat System API Endpoints

### Internal Chat (`/api/chat/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/channels` | GET | Get user's channels |
| `/channels` | POST | Create channel (dm/group/department) |
| `/channels/{id}/messages` | GET | Get channel messages |
| `/channels/{id}/messages` | POST | Send message |
| `/departments` | GET | Get department list |
| `/users/search` | GET | Search users |
| `/upload` | POST | Upload file attachment |
| `/unread` | GET | Get unread counts |

### Customer Support Chat (`/api/support-chat/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sessions/start` | POST | Start visitor chat session |
| `/agent/sessions` | GET | Get agent sessions |
| `/agent/sessions/{id}/claim` | POST | Agent claims session |
| `/agent/sessions/{id}/messages` | POST | Agent sends message |
| `/chatbot/settings` | GET/PUT | Get/Update chatbot config |
| `/knowledge-base` | GET/POST | Manage knowledge articles |
| `/knowledge-base/import` | POST | Import from FAQs/Blog |
| `/analytics` | GET | Get chat analytics |
| `/canned-responses` | GET/POST | Manage canned responses |

---

## Project Health Check
- **Working**: All tested features
- **Broken**: Google Voice integration (`pygooglevoice`)
- **Mocked**: None
- **Pending**: AI Chatbot full integration (settings configured, LLM connection pending)

---

## Testing Status
- **Backend**: 100% (25/25 tests passed)
- **Frontend**: 100% (all features verified)
- **Latest test report**: `/app/test_reports/iteration_9.json`

---

## Last Updated: January 29, 2025
