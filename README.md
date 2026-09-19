<h1 align="center">💊 MEDIX</h1>
<h2 align="center">Smart Pharmacy Store Management & Intelligence System</h2>

<p align="center">
  <strong>
    A modern full-stack pharmacy management system built with React,
    FastAPI and MySQL.
  </strong>
</p>

<p align="center">

<img src="https://img.shields.io/badge/⚛%20REACT-0D1117?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/▲%20TYPESCRIPT-0D1117?style=for-the-badge&logo=typescript&logoColor=3178C6" />
<img src="https://img.shields.io/badge/⚡%20VITE-0D1117?style=for-the-badge&logo=vite&logoColor=646CFF" />
<img src="https://img.shields.io/badge/🎨%20TAILWIND-0D1117?style=for-the-badge&logo=tailwindcss&logoColor=06B6D4" />

</p>

<p align="center">

<img src="https://img.shields.io/badge/🐍%20PYTHON-0D1117?style=for-the-badge&logo=python&logoColor=3776AB" />
<img src="https://img.shields.io/badge/🚀%20FASTAPI-0D1117?style=for-the-badge&logo=fastapi&logoColor=009688" />
<img src="https://img.shields.io/badge/🗄%20MYSQL-0D1117?style=for-the-badge&logo=mysql&logoColor=4479A1" />
<img src="https://img.shields.io/badge/🔗%20SQLALCHEMY-0D1117?style=for-the-badge&logo=sqlalchemy&logoColor=D71F00" />

</p>

<p align="center">

<img src="https://img.shields.io/badge/📊%20ANALYTICS-0D1117?style=for-the-badge&logo=chartdotjs&logoColor=FFFFFF" />
<img src="https://img.shields.io/badge/🔌%20REST%20API-0D1117?style=for-the-badge&logo=fastapi&logoColor=009688" />
<img src="https://img.shields.io/badge/📱%20RESPONSIVE-0D1117?style=for-the-badge&logo=responsive&logoColor=FFFFFF" />
<img src="https://img.shields.io/badge/🌙%20DARK%20MODE-0D1117?style=for-the-badge&logo=github&logoColor=FFFFFF" />

</p>

---

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-api-overview">API</a> •
  <a href="#-database-engineering">Database</a>
</p>

---

## 🚀 Overview

**MEDIX** is a full-stack **Pharmacy Store Management & Intelligence System** designed to manage medicines, inventory, batches, sales, invoices, customers and business analytics through a modern SaaS-style interface.

The project combines a responsive **React frontend**, production-style **FastAPI backend**, and a relational **MySQL database**.

Unlike a UI-only pharmacy dashboard, MEDIX performs its calculations and business operations using **real API calls, SQL queries, database views, triggers and transactions**.

> **Build Status:** 🟢 Tier 1 — Core functionality implemented end-to-end.

The system currently supports:

* Medicine management
* Batch-level inventory
* Expiry tracking
* Low & critical stock detection
* FEFO inventory allocation
* Atomic POS checkout
* Automatic stock deduction
* Invoice generation
* Sales history
* Dashboard analytics
* Revenue analysis
* Category performance
* Payment-method analytics
* Rule-based MEDIX Insights

---

# ✨ Why MEDIX?

Traditional pharmacy software can be complicated, outdated, or difficult to understand.

MEDIX focuses on three principles:

### 🎯 Simplicity

A clean interface designed around the daily workflow of a pharmacy.

### 🔐 Data Integrity

Inventory and sales operations are protected using database constraints and transactions.

### 📊 Intelligence

Live inventory and sales data are transformed into useful dashboards and actionable insights.

---

# 🌟 Features

## 💊 Medicine Management

Manage the pharmacy's medicine catalog with:

* Medicine name
* Category
* Selling price
* Prescription requirement
* Stock status
* Reorder level
* Critical stock level

Stock health is automatically classified as:

```text
HEALTHY
LOW
CRITICAL
```

---

## 📦 Batch-Level Inventory

Every medicine can contain multiple inventory batches.

Each batch tracks:

* Batch number
* Supplier
* Manufacturing information
* Expiry date
* Available quantity
* Purchase information

This allows MEDIX to accurately track inventory at the batch level instead of treating all stock as a single quantity.

---

## ⏳ Expiry Radar

MEDIX continuously evaluates medicine expiry status.

```text
┌───────────────────────────────┐
│          EXPIRY RADAR         │
├───────────────────────────────┤
│ 🔴 EXPIRED                    │
│ 🟠 EXPIRING ≤ 30 DAYS         │
│ 🟡 EXPIRING ≤ 90 DAYS         │
│ 🟢 SAFE                       │
└───────────────────────────────┘
```

Expiry classification is calculated dynamically using SQL date operations rather than hardcoded values.

---

## 🚨 Smart Stock Alerts

MEDIX monitors inventory using medicine-specific:

* `reorder_level`
* `critical_level`

This allows the system to identify medicines that require restocking before they become unavailable.

---

# 🧾 Point of Sale — POS

The POS system provides:

* Medicine search
* Cart management
* Quantity validation
* Tax calculation
* Discount handling
* Payment method selection
* Invoice generation
* Atomic checkout

### FEFO Inventory Allocation

MEDIX uses:

> **First Expiry, First Out (FEFO)**

During checkout, the system prioritizes the batch that expires first.

Example:

```text
Medicine: Paracetamol

Batch A → Expires Jan 2027 → 20 units
Batch B → Expires Jun 2027 → 50 units
Batch C → Expires Dec 2027 → 100 units

Customer requests: 30 units

Allocation:
Batch A → 20
Batch B → 10
```

Expired batches are never offered for sale.

---

# 🔒 Atomic Checkout & Data Integrity

One of the key engineering aspects of MEDIX is its transaction-based checkout system.

The sale and inventory deduction occur inside a database transaction.

```text
START TRANSACTION
        │
        ▼
Validate Cart
        │
        ▼
Check Available Stock
        │
        ▼
Select FEFO Batches
        │
        ▼
Create Sale
        │
        ▼
Create Sale Items
        │
        ▼
Deduct Inventory
        │
        ▼
Generate Invoice
        │
        ▼
     COMMIT
```

If any operation fails:

```text
ROLLBACK
```

This prevents partially completed sales and inconsistent inventory.

---

# 📊 Dashboard & Analytics

MEDIX provides real-time business analytics generated from the database.

### Dashboard

Includes:

* Total medicines
* Available stock
* Low-stock medicines
* Expiring medicines
* Today's sales
* Revenue overview
* Recent transactions

### Analytics

Includes:

* Revenue trends
* Top-selling medicines
* Category performance
* Payment-method distribution
* Sales summaries

All major statistics are generated from **real SQL aggregation queries** rather than hardcoded values.

---

# 🧠 MEDIX Insights

MEDIX includes a rule-based intelligence layer that analyzes live pharmacy data.

It can surface insights related to:

* Low stock
* Critical stock
* Expiring medicines
* Sales trends
* High-demand medicines

> MEDIX Insights is currently **rule-based**, not an AI/ML model.

---

# 📸 Screenshots

> The screenshots below should be placed inside the project's `screenshots/` directory.

## 🏠 Dashboard

<p align="center">
  <img src="screenshots/dashboard.png" alt="MEDIX Dashboard" width="100%"/>
</p>

---

## 💊 Medicine Management

<p align="center">
  <img src="screenshots/medicines.png" alt="Medicine Management" width="100%"/>
</p>

---

## 📦 Inventory & Batches

<p align="center">
  <img src="screenshots/inventory.png" alt="Inventory Management" width="100%"/>
</p>

---

## ⏳ Expiry Radar

<p align="center">
  <img src="screenshots/expiry-radar.png" alt="Expiry Radar" width="100%"/>
</p>

---

## 🧾 Point of Sale

<p align="center">
  <img src="screenshots/pos.png" alt="Point of Sale" width="100%"/>
</p>

---

## 🧾 Invoice

<p align="center">
  <img src="screenshots/invoice.png" alt="Invoice" width="100%"/>
</p>

---

## 📜 Sales History

<p align="center">
  <img src="screenshots/sales_history.png" alt="Sales History" width="100%"/>
</p>

---

## 📈 Analytics

<p align="center">
  <img src="screenshots/analytics.png" alt="MEDIX Analytics" width="100%"/>
</p>

---

## 🧠 MEDIX Insights

<p align="center">
  <img src="screenshots/insights.png" alt="MEDIX Insights" width="100%"/>
</p>

---

## 🌙 Dark Mode

<p align="center">
  <img src="screenshots/dark_mode.png" alt="MEDIX Dark Mode" width="100%"/>
</p>

---

# 🏗️ Architecture

```text
                     ┌──────────────────────┐
                     │      MEDIX UI        │
                     │ React + TypeScript   │
                     │ Vite + Tailwind CSS  │
                     └──────────┬───────────┘
                                │
                         REST / JSON API
                                │
                                ▼
                     ┌──────────────────────┐
                     │      FastAPI         │
                     │       Backend        │
                     │ Python + Pydantic    │
                     └──────────┬───────────┘
                                │
                           SQLAlchemy
                                │
                                ▼
                     ┌──────────────────────┐
                     │       MySQL 8        │
                     │                      │
                     │ Tables                │
                     │ Views                 │
                     │ Triggers              │
                     │ Constraints           │
                     │ Transactions          │
                     └──────────────────────┘
```

### Request Flow

```text
User
 │
 ▼
React Frontend
 │
 ▼
REST API
 │
 ▼
FastAPI
 │
 ▼
SQLAlchemy
 │
 ▼
MySQL
 │
 ▼
Business Data
 │
 ▼
JSON Response
 │
 ▼
React UI
```

---

# 🛠️ Technology Stack

## Frontend

| Technology   | Purpose                     |
| ------------ | --------------------------- |
| React 18     | UI framework                |
| TypeScript   | Type safety                 |
| Vite         | Development & build tooling |
| Tailwind CSS | Styling                     |
| Recharts     | Analytics & charts          |
| Lucide Icons | UI icons                    |

## Backend

| Technology | Purpose               |
| ---------- | --------------------- |
| Python     | Backend language      |
| FastAPI    | REST API framework    |
| SQLAlchemy | ORM / database access |
| Pydantic   | Data validation       |
| Uvicorn    | ASGI server           |

## Database

| Technology   | Purpose                        |
| ------------ | ------------------------------ |
| MySQL 8      | Relational database            |
| SQL Views    | Derived inventory & sales data |
| Triggers     | Database-level automation      |
| Transactions | Atomic operations              |
| Constraints  | Data integrity                 |
| Indexes      | Query optimization             |

---

# 🗄️ Database Engineering

MEDIX was designed to demonstrate real relational database concepts.

### 🔑 Constraints

The database uses:

* Primary Keys
* Foreign Keys
* `NOT NULL`
* `UNIQUE`
* `CHECK`

### ⚡ Indexes

Indexes are used for frequently queried fields such as:

* Medicine identifiers
* Batch identifiers
* Expiry dates
* Sales dates
* Foreign-key relationships

### 🔄 Triggers

MEDIX includes database triggers for:

1. Preventing negative inventory
2. Automatically creating inventory records when batches are received

### 👁️ SQL Views

The database includes views for derived information such as:

```text
v_batch_stock
v_medicine_stock
v_daily_sales
v_top_selling_medicines
```

### 🔗 Relational Operations

The project demonstrates:

* `JOIN`
* `GROUP BY`
* Aggregate functions
* Date-range queries
* Filtering
* Sorting
* Nested queries
* SQL views

---

# 📂 Project Structure

```text
MEDIX/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routes/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── ...
│   │
│   ├── package.json
│   └── .env
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── docs/
│   ├── ER_DIAGRAM.md
│   └── DATABASE_SCHEMA.md
│
├── screenshots/
│   ├── dashboard.png
│   ├── medicines.png
│   ├── inventory.png
│   ├── expiry-radar.png
│   ├── pos.png
│   ├── invoice.png
│   ├── sales-history.png
│   ├── analytics.png
│   ├── insights.png
│   └── dark-mode.png
│
├── .env.example
└── README.md
```

---

# ⚙️ Installation

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/Medix.git
cd Medix
```

---

## 2️⃣ Configure MySQL

Make sure **MySQL 8.x** is installed and running.

Create the database and tables:

```bash
mysql -u root -p < database/schema.sql
```

Load the initial data:

```bash
mysql -u root -p < database/seed.sql
```

---

# 🐍 3️⃣ Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

### Windows

```powershell
python -m venv venv
venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your environment file:

```bash
cp ../.env.example .env
```

For Windows PowerShell:

```powershell
Copy-Item ..\.env.example .env
```

Configure your MySQL connection inside:

```text
backend/.env
```

Example:

```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/medix
```

Start the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

---

# ⚛️ 4️⃣ Frontend Setup

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 🔐 Environment Variables

Never commit real credentials or API secrets.

### Backend

```env
DATABASE_URL=mysql+pymysql://USERNAME:PASSWORD@HOST:3306/DATABASE
```

### Frontend

```env
VITE_API_BASE_URL=http://localhost:8000
```

Use `.env.example` as the configuration template.

---

# 🔌 API Overview

| Resource          | Endpoints                                |
| ----------------- | ---------------------------------------- |
| Medicines         | `GET/POST /api/medicines`                |
| Medicine Details  | `GET/PUT/DELETE /api/medicines/{id}`     |
| Inventory         | `GET /api/inventory`                     |
| Low Stock         | `GET /api/inventory/low-stock`           |
| Expiring Stock    | `GET /api/inventory/expiring?days=`      |
| Batches           | `POST /api/inventory/batches`            |
| Restock           | `POST /api/inventory/restock/{batch_id}` |
| Sales             | `POST /api/sales`                        |
| Sales History     | `GET /api/sales`                         |
| Sale Details      | `GET /api/sales/{id}`                    |
| Analytics Summary | `GET /api/analytics/summary`             |
| Revenue           | `GET /api/analytics/revenue`             |
| Top Selling       | `GET /api/analytics/top-selling`         |
| Categories        | `GET/POST /api/categories`               |
| Suppliers         | `GET/POST /api/suppliers`                |
| Customers         | `GET/POST /api/customers`                |

API errors follow a consistent structure:

```json
{
  "success": false,
  "message": "Insufficient stock",
  "details": {
    "available": 5,
    "requested": 10
  }
}
```

---

# 🧪 Core Business Logic

### Stock Validation

```text
Requested Quantity
        │
        ▼
Available Quantity?
    /           \
  YES            NO
   │              │
   ▼              ▼
Continue      Return Error
```

### FEFO Allocation

```text
Sort batches by expiry date
             │
             ▼
Select earliest expiry
             │
             ▼
Allocate required quantity
             │
             ▼
Remaining quantity?
       │
       ▼
Select next batch
```

### Atomic Sale

```text
BEGIN TRANSACTION
       │
       ├── Validate medicines
       ├── Validate quantities
       ├── Find FEFO batches
       ├── Create sale
       ├── Create sale items
       ├── Update inventory
       └── Generate invoice
                │
                ▼
             COMMIT

       Any failure?
             │
             ▼
           ROLLBACK
```

---

# 📱 Responsive Design

MEDIX is designed for different screen sizes.

### Desktop

```text
┌──────────┬───────────────────────────┐
│ Sidebar  │                           │
│          │       Dashboard           │
│          │                           │
│          │       Analytics           │
│          │                           │
└──────────┴───────────────────────────┘
```

### Mobile

The interface adapts into a mobile-friendly layout with:

* Responsive cards
* Mobile-safe navigation
* Horizontally manageable data
* Touch-friendly controls

---

# 🌓 Theme Support

MEDIX supports:

* ☀️ Light mode
* 🌙 Dark mode

The UI uses a consistent design system across dashboards, tables, forms, analytics and POS screens.

---

# 🚧 What's Currently Stubbed?

To keep the project transparent, the following features are currently simplified.

### Authentication

The login interface is currently a UI shell.

JWT/session-based authentication has not yet been fully connected to the backend.

The current sales implementation uses the seeded admin user.

---

### Command Palette

`Ctrl + K` command palette is planned but not fully implemented.

---

### Settings

The Settings route currently acts as a placeholder.

---

### Medicine Add/Edit UI

Backend capabilities exist, but the complete frontend modal workflow is still under development.

---

### Suppliers & Customers

The APIs support creation, while the current frontend primarily provides read-oriented views.

---

# 🔮 Future Enhancements

Planned improvements include:

* 📷 Barcode scanning
* 📋 Purchase order management
* 👥 Role-based access control
* 🔐 JWT authentication
* 📧 Email invoices
* 🏪 Multi-store management
* 📈 Demand forecasting
* 🤖 ML-based sales prediction
* 📦 Automated supplier ordering
* 📱 Progressive Web App support
* ☁️ Cloud deployment
* 🔔 Advanced notification system

---

# 📚 Documentation

Detailed database documentation is available in:

```text
docs/ER_DIAGRAM.md
docs/DATABASE_SCHEMA.md
```

These documents cover:

* ER relationships
* Table structures
* Foreign keys
* Constraints
* Indexes
* Triggers
* Views
* Transactions
* Database relationships

---

# 🎓 DBMS Concepts Demonstrated

MEDIX can also be used as a practical demonstration of relational database concepts.

| Concept             | Implementation            |
| ------------------- | ------------------------- |
| Primary Key         | Entity identification     |
| Foreign Key         | Relational integrity      |
| Unique Constraint   | Batch/medicine uniqueness |
| NOT NULL            | Required fields           |
| CHECK               | Data validation           |
| Indexes             | Query optimization        |
| Joins               | Multi-table queries       |
| GROUP BY            | Analytics                 |
| Aggregate Functions | Revenue & sales           |
| SQL Views           | Derived inventory data    |
| Triggers            | Automated DB operations   |
| Transactions        | Atomic checkout           |
| Rollback            | Failure recovery          |
| Date Functions      | Expiry tracking           |

---

# 📈 Project Highlights

```text
                  MEDIX
                    │
       ┌────────────┼────────────┐
       │            │            │
       ▼            ▼            ▼
   INVENTORY       SALES      ANALYTICS
       │            │            │
       ▼            ▼            ▼
   Batches        FEFO        Revenue
   Expiry         POS         Top Sellers
   Stock          Invoice     Categories
   Alerts         Atomic      Payments
       │            │            │
       └────────────┼────────────┘
                    │
                    ▼
                MySQL 8
```

---

# 👨‍💻 Development

MEDIX is structured as a monorepo containing:

```text
Frontend
   ↓
React + TypeScript + Vite

Backend
   ↓
Python + FastAPI + SQLAlchemy

Database
   ↓
MySQL 8
```

This separation makes the application easier to develop, test, maintain and extend.

---

# 🏆 Project Status

| Module              | Status      |
| ------------------- | ----------- |
| Database Schema     | 🟢 Complete |
| Seed Data           | 🟢 Complete |
| Medicine Catalog    | 🟢 Complete |
| Batch Inventory     | 🟢 Complete |
| Expiry Tracking     | 🟢 Complete |
| Low Stock Detection | 🟢 Complete |
| FEFO Allocation     | 🟢 Complete |
| POS Checkout        | 🟢 Complete |
| Atomic Transactions | 🟢 Complete |
| Invoice             | 🟢 Complete |
| Sales History       | 🟢 Complete |
| Dashboard           | 🟢 Complete |
| Analytics           | 🟢 Complete |
| MEDIX Insights      | 🟢 Complete |
| Responsive UI       | 🟢 Complete |
| Authentication      | 🟡 Planned  |
| Command Palette     | 🟡 Planned  |
| Advanced Settings   | 🟡 Planned  |
| Supplier CRUD UI    | 🟡 Planned  |
| Customer CRUD UI    | 🟡 Planned  |

---

# 🤝 Contributing

Contributions, suggestions and improvements are welcome.

```bash
# Fork the repository

# Create a feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m "Add amazing feature"

# Push the branch
git push origin feature/amazing-feature

# Open a Pull Request
```

---

# 📄 License

This project is developed for educational and demonstration purposes.

---

<p align="center">

### 💊 MEDIX

**Smart Pharmacy Store Management & Intelligence System**

Built with ❤️ using React, FastAPI & MySQL

</p>

<p align="center">
  <strong>Manage Medicines • Control Inventory • Process Sales • Understand Data</strong>
</p>
