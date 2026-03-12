# Credlocity

**Credit Repair Services — Full-Stack Platform**

## Overview

Credlocity is a comprehensive credit repair services platform with a public-facing website, admin CMS, attorney portal, company portal, and partner dashboard.

## Architecture

| Component | Domain | Description |
|-----------|--------|-------------|
| **Frontend (Website)** | `www.credlocity.com` | Public-facing React website |
| **Backend (CMS)** | `www.credlocitybackend.com` | Admin CMS & API server |
| **Attorney Portal** | `attorneys.credlocity.com` | Attorney case management |
| **Company Portal** | `companies.credlocity.com` | B2B company case submissions |
| **Partner Portal** | `partners.credlocity.com` | Outsourcing partner dashboard |

## Tech Stack

- **Frontend:** React (CRA), Tailwind CSS, shadcn/ui
- **Backend:** Python (Flask), SQLAlchemy
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Payments:** Stripe
- **AI:** CreditSage Chatbot

## Project Structure

```
credlocity/
├── backend/                    # Python Flask API server
│   ├── server.py              # Main server + routes
│   ├── models.py              # Database models (SQLAlchemy)
│   ├── auth.py                # Authentication
│   ├── security/              # Security module (RBAC, rate limiting, encryption)
│   ├── stripe_api.py          # Stripe payment integration
│   ├── *_api.py               # Feature-specific API modules
│   ├── seed_*.py              # Database seeders
│   └── tests/                 # Backend tests
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # Shared components (Header, Footer, ChatBot, etc.)
│   │   ├── pages/             # Public pages
│   │   │   ├── admin/         # CMS admin pages
│   │   │   ├── attorney/      # Attorney portal
│   │   │   ├── company/       # Company portal
│   │   │   ├── partner/       # Partner portal
│   │   │   ├── partners/      # Partner landing pages
│   │   │   ├── credit-issues/ # Credit issue specific pages
│   │   │   └── public/        # Public forms
│   │   ├── context/           # React context (Auth)
│   │   ├── hooks/             # Custom hooks
│   │   └── utils/             # API utilities
│   └── public/
└── README.md
```

## Features

### Public Website
- Home, Pricing, Credit Scores, Collection Removal, FAQ
- Blog Hub, Success Stories, Press Releases
- Lawsuit Tracker, Legal Pages
- Credit Issue Pages (Bankruptcy, Charge-Offs, Hard Inquiries, etc.)
- Report a Company, Submit Complaint
- Author Profiles, Team Page
- Partner Landing Pages (Car Dealers, Mortgage, Real Estate, Attorneys)
- Client Intake Form, Review Submission

### Admin CMS (Backend)
- **Content Management:** Blog, Pages, FAQ, Authors, Reviews, Media Library, Education Hub, Press Releases, Legal Pages, Banners & Popups
- **Page Builder:** Visual drag-and-drop editor with component library
- **Client Management:** Client profiles, intake forms, case tracking
- **Collections:** Accounts, payment plans, approval queue, Google Voice integration
- **Billing:** Invoices, subscriptions, coupons, companies, Stripe integration
- **Outsourcing:** Partners, invoices, work logs, tickets, coupons
- **Lawsuits:** Case management with categories, types, violations
- **Revenue:** Dashboard, splits, reports
- **Metrics:** Analytics dashboard
- **Security:** RBAC, audit logging, rate limiting, encryption
- **Team Management**
- **Chat:** Internal CMS chat, support chat dashboard

### Attorney Portal
- Dashboard, case marketplace, case pledges
- Case detail & updates, payments, reviews
- Agreement management, notifications

### Company Portal
- Signup, login, dashboard
- Case submission wizard, subscription management

### Partner Portal
- Login, dashboard

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
python server.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Environment Variables

```env
# Backend
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///credlocity.db
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
OPENAI_API_KEY=sk-...  # For CreditSage chatbot

# Frontend
REACT_APP_API_URL=https://www.credlocitybackend.com/api
```

## Domains

| Domain | Purpose | Status |
|--------|---------|--------|
| `credlocity.com` | Main website | Pending setup |
| `credlocitybackend.com` | CMS/API backend | Pending setup |
| `attorneys.credlocity.com` | Attorney portal | Subdomain |
| `companies.credlocity.com` | Company portal | Subdomain |
| `partners.credlocity.com` | Partner portal | Subdomain |

---

*Built with ❤️ for Credlocity*
