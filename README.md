# 💊 MEDIX — Smart Pharmacy Store Management & Intelligence System

A premium, responsive, full-stack pharmacy management system built to demonstrate real relational-database engineering underneath a modern SaaS-style UI.

> **Build status:** Tier 1 (must-work) features are implemented end-to-end: database schema, medicines, batches/inventory, expiry tracking, low-stock detection, atomic sales/POS with FEFO stock allocation, invoicing, transaction history, dashboard, and analytics — all wired to real API/DB calls, no hardcoded numbers. Tier 2 items (suppliers/customers CRUD forms beyond read, dark-mode polish pass, command palette, auth/JWT) are scaffolded but simplified — see "What's stubbed" below.

## Features
- Medicine catalog with category, price, prescription flag, live stock status (HEALTHY/LOW/CRITICAL)
- Batch-level inventory: multiple batches per medicine, each with its own supplier, expiry date and quantity
- Expiry Radar: EXPIRED / EXPIRING ≤30d / EXPIRING ≤90d / SAFE, computed live via `DATEDIFF` in a SQL view — never hardcoded
- Low-stock & critical-stock detection driven by per-medicine `reorder_level` / `critical_level`
- POS with FEFO (first-expiry-first-out) batch allocation, cart validation, tax/discount, and one atomic checkout transaction
- Stock automatically decrements inside the same DB transaction as the sale; any failure rolls back the whole sale (nothing partially commits)
- Expired batches are never offered for sale; insufficient stock returns a structured error with available vs. requested quantities
- Dashboard, Analytics (revenue trend, top sellers, category performance, payment split) — all from real SQL aggregation
- Light/dark mode, responsive layout (desktop sidebar → mobile bottom-safe layout with card views for tables)
- MEDIX Insights: rule-based (not AI) recommendations generated from the same live inventory/sales data

## Technology Stack
**Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + Recharts + Lucide icons
**Backend:** Python + FastAPI + SQLAlchemy + Pydantic
**Database:** MySQL 8

## Architecture
```
React (Vite/TS) → REST/JSON → FastAPI → SQLAlchemy → MySQL
```
See `docs/ER_DIAGRAM.md` and `docs/DATABASE_SCHEMA.md` for the full data model.

## Installation

### 1. Database
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env   # edit DATABASE_URL to match your MySQL credentials
uvicorn app.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

### 3. Frontend
```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
npm run dev
```
App: http://localhost:5173

## Environment Variables
See `.env.example` at the project root — copy the backend block into `backend/.env` and the frontend line into `frontend/.env`. Never commit real secrets.

## API Overview
| Resource | Endpoints |
|---|---|
| Medicines | `GET/POST /api/medicines`, `GET/PUT/DELETE /api/medicines/{id}` |
| Inventory | `GET /api/inventory`, `/low-stock`, `/expiring?days=`, `POST /batches`, `POST /restock/{batch_id}` |
| Sales | `POST /api/sales` (atomic checkout), `GET /api/sales`, `GET /api/sales/{id}` |
| Analytics | `GET /api/analytics/summary`, `/revenue`, `/top-selling`, `/category-performance`, `/payment-methods` |
| Categories / Suppliers / Customers | `GET/POST /api/categories`, `/api/suppliers`, `/api/customers` |

Errors always return `{ "success": false, "message": "...", "details": {...} }` with an appropriate HTTP status code.

## DBMS Concepts Demonstrated
Primary/foreign keys, CHECK/UNIQUE/NOT NULL constraints, indexes, two triggers (negative-inventory guard, auto-create inventory row on batch receipt), three views (`v_batch_stock`, `v_medicine_stock`, `v_daily_sales`, `v_top_selling_medicines`), joins, GROUP BY/aggregate functions, date-range queries, and an explicit multi-statement transaction with rollback for sale checkout. Full explanation in `docs/DATABASE_SCHEMA.md`.

## What's stubbed (be upfront about this in a viva/demo)
- Login page is a UI shell — there's no JWT/session auth wired to the backend yet (`user_id` is hardcoded to the seeded admin in `sales.py`). Swap `DEFAULT_USER_ID` for a real `Depends(get_current_user)` once auth is added.
- Command palette (Ctrl+K), Settings page, and Add/Edit modals for Medicines are not built — routes exist as placeholders.
- Suppliers/Customers pages are read-only in the UI (the API supports POST already).

## Future Enhancements
Barcode scanning, purchase orders, role-based access control, email invoices, multi-store support, demand forecasting.
