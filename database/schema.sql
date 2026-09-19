-- ============================================================
-- MEDIX — Smart Pharmacy Store Management System
-- Relational Schema (MySQL 8.x)
-- Target normal form: 3NF
-- ============================================================

DROP DATABASE IF EXISTS medix;
CREATE DATABASE medix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medix;

-- ------------------------------------------------------------
-- USERS  (store admins / pharmacists — simple auth)
-- ------------------------------------------------------------
CREATE TABLE users (
    user_id         INT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(100)        NOT NULL,
    email           VARCHAR(150)        NOT NULL UNIQUE,
    password_hash   VARCHAR(255)        NOT NULL,
    role            ENUM('admin','pharmacist') NOT NULL DEFAULT 'pharmacist',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- CATEGORIES
-- ------------------------------------------------------------
CREATE TABLE categories (
    category_id     INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(80)  NOT NULL UNIQUE,
    description     VARCHAR(255)
);

-- ------------------------------------------------------------
-- SUPPLIERS
-- ------------------------------------------------------------
CREATE TABLE suppliers (
    supplier_id     INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    contact_person  VARCHAR(100),
    phone           VARCHAR(20),
    email           VARCHAR(150),
    address         VARCHAR(255),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- MEDICINES  (catalog-level info; NOT stock — stock lives in batches/inventory)
-- ------------------------------------------------------------
CREATE TABLE medicines (
    medicine_id         INT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(150) NOT NULL,
    generic_name        VARCHAR(150),
    category_id         INT NOT NULL,
    manufacturer        VARCHAR(150),
    unit_price          DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    prescription_required BOOLEAN NOT NULL DEFAULT FALSE,
    reorder_level       INT NOT NULL DEFAULT 20 CHECK (reorder_level >= 0),
    critical_level      INT NOT NULL DEFAULT 5  CHECK (critical_level >= 0),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_medicine_category FOREIGN KEY (category_id)
        REFERENCES categories(category_id) ON DELETE RESTRICT,
    CONSTRAINT chk_medicine_name CHECK (CHAR_LENGTH(TRIM(name)) > 0)
);

CREATE INDEX idx_medicine_name ON medicines(name);
CREATE INDEX idx_medicine_category ON medicines(category_id);

-- ------------------------------------------------------------
-- BATCHES  (one medicine -> many batches; each batch has its own expiry/supplier)
-- ------------------------------------------------------------
CREATE TABLE batches (
    batch_id        INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id     INT NOT NULL,
    supplier_id     INT NOT NULL,
    batch_number    VARCHAR(50) NOT NULL,
    manufacture_date DATE,
    expiry_date     DATE NOT NULL,
    cost_price      DECIMAL(10,2) NOT NULL CHECK (cost_price >= 0),
    quantity_received INT NOT NULL CHECK (quantity_received >= 0),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_batch_medicine FOREIGN KEY (medicine_id)
        REFERENCES medicines(medicine_id) ON DELETE CASCADE,
    CONSTRAINT fk_batch_supplier FOREIGN KEY (supplier_id)
        REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
    CONSTRAINT uq_batch_per_medicine UNIQUE (medicine_id, batch_number),
    CONSTRAINT chk_batch_dates CHECK (manufacture_date IS NULL OR manufacture_date < expiry_date)
);

CREATE INDEX idx_batch_expiry ON batches(expiry_date);
CREATE INDEX idx_batch_medicine ON batches(medicine_id);
CREATE INDEX idx_batch_supplier ON batches(supplier_id);

-- ------------------------------------------------------------
-- INVENTORY  (current sellable quantity per batch — 1:1 with batch)
-- Kept separate from `batches` so restocks / adjustments have a clear
-- audit surface without mutating the original goods-received record.
-- ------------------------------------------------------------
CREATE TABLE inventory (
    inventory_id    INT AUTO_INCREMENT PRIMARY KEY,
    batch_id        INT NOT NULL UNIQUE,
    quantity        INT NOT NULL CHECK (quantity >= 0),
    last_updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_batch FOREIGN KEY (batch_id)
        REFERENCES batches(batch_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- CUSTOMERS
-- ------------------------------------------------------------
CREATE TABLE customers (
    customer_id     INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    phone           VARCHAR(20) UNIQUE,
    email           VARCHAR(150),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- SALES  (header)
-- ------------------------------------------------------------
CREATE TABLE sales (
    sale_id         INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number  VARCHAR(30) NOT NULL UNIQUE,
    customer_id     INT NULL,
    user_id         INT NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    tax_amount      DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount    DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_method  ENUM('cash','card','upi') NOT NULL,
    sale_date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sale_customer FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id) ON DELETE SET NULL,
    CONSTRAINT fk_sale_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE RESTRICT
);

CREATE INDEX idx_sale_date ON sales(sale_date);
CREATE INDEX idx_sale_customer ON sales(customer_id);

-- ------------------------------------------------------------
-- SALE_DETAILS  (line items — snapshot price at time of sale so
-- historical invoices stay correct even if unit_price later changes)
-- ------------------------------------------------------------
CREATE TABLE sale_details (
    sale_detail_id  INT AUTO_INCREMENT PRIMARY KEY,
    sale_id         INT NOT NULL,
    medicine_id     INT NOT NULL,
    batch_id        INT NOT NULL,
    quantity        INT NOT NULL CHECK (quantity > 0),
    unit_price      DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    line_total      DECIMAL(10,2) NOT NULL CHECK (line_total >= 0),
    CONSTRAINT fk_saledetail_sale FOREIGN KEY (sale_id)
        REFERENCES sales(sale_id) ON DELETE CASCADE,
    -- medicine/batch kept RESTRICT: a medicine/batch must not be hard-deleted
    -- while sales history references it (use is_active / soft delete instead)
    CONSTRAINT fk_saledetail_medicine FOREIGN KEY (medicine_id)
        REFERENCES medicines(medicine_id) ON DELETE RESTRICT,
    CONSTRAINT fk_saledetail_batch FOREIGN KEY (batch_id)
        REFERENCES batches(batch_id) ON DELETE RESTRICT
);

CREATE INDEX idx_saledetail_sale ON sale_details(sale_id);
CREATE INDEX idx_saledetail_medicine ON sale_details(medicine_id);

-- ============================================================
-- TRIGGERS
-- ============================================================
-- Single source of truth decision: inventory decrement happens in the
-- FastAPI service layer inside an explicit DB transaction (see
-- backend/app/services/sales_service.py), NOT in a trigger — this keeps
-- stock-validation error messages (insufficient stock, expired batch)
-- readable in the API response instead of surfacing as opaque SQL
-- exceptions. The one trigger below is a safety net, not primary logic:
-- it guards against inventory ever going negative no matter which path
-- writes to it.

DELIMITER $$
CREATE TRIGGER trg_inventory_no_negative
BEFORE UPDATE ON inventory
FOR EACH ROW
BEGIN
    IF NEW.quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Inventory quantity cannot go negative';
    END IF;
END$$
DELIMITER ;

-- Auto-create an inventory row whenever a batch is received
DELIMITER $$
CREATE TRIGGER trg_batch_creates_inventory
AFTER INSERT ON batches
FOR EACH ROW
BEGIN
    INSERT INTO inventory (batch_id, quantity) VALUES (NEW.batch_id, NEW.quantity_received);
END$$
DELIMITER ;

-- ============================================================
-- VIEWS
-- ============================================================

-- Current stock + expiry status per batch, joined up to medicine/category/supplier
CREATE VIEW v_batch_stock AS
SELECT
    b.batch_id,
    m.medicine_id,
    m.name              AS medicine_name,
    c.name              AS category_name,
    s.name              AS supplier_name,
    b.batch_number,
    b.expiry_date,
    DATEDIFF(b.expiry_date, CURDATE()) AS days_to_expiry,
    i.quantity,
    m.reorder_level,
    m.critical_level,
    CASE
        WHEN b.expiry_date < CURDATE() THEN 'EXPIRED'
        WHEN b.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'EXPIRING_SOON'
        WHEN b.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY) THEN 'EXPIRING_LATER'
        ELSE 'SAFE'
    END AS expiry_status,
    CASE
        WHEN i.quantity <= m.critical_level THEN 'CRITICAL'
        WHEN i.quantity <= m.reorder_level THEN 'LOW'
        ELSE 'HEALTHY'
    END AS stock_status
FROM inventory i
JOIN batches b   ON b.batch_id = i.batch_id
JOIN medicines m ON m.medicine_id = b.medicine_id
JOIN categories c ON c.category_id = m.category_id
JOIN suppliers s ON s.supplier_id = b.supplier_id;

-- Per-medicine aggregate stock (sum across batches) — what the Medicines
-- list page and low-stock/critical-stock checks read from
CREATE VIEW v_medicine_stock AS
SELECT
    m.medicine_id,
    m.name,
    m.category_id,
    c.name AS category_name,
    m.unit_price,
    m.reorder_level,
    m.critical_level,
    m.prescription_required,
    m.is_active,
    COALESCE(SUM(i.quantity), 0) AS total_quantity,
    CASE
        WHEN COALESCE(SUM(i.quantity), 0) <= m.critical_level THEN 'CRITICAL'
        WHEN COALESCE(SUM(i.quantity), 0) <= m.reorder_level THEN 'LOW'
        ELSE 'HEALTHY'
    END AS stock_status
FROM medicines m
JOIN categories c ON c.category_id = m.category_id
LEFT JOIN batches b ON b.medicine_id = m.medicine_id
LEFT JOIN inventory i ON i.batch_id = b.batch_id AND b.expiry_date >= CURDATE()
GROUP BY m.medicine_id, m.name, m.category_id, c.name, m.unit_price,
         m.reorder_level, m.critical_level, m.prescription_required, m.is_active;

-- Daily revenue rollup — backs the "Pharmacy Pulse" chart
CREATE VIEW v_daily_sales AS
SELECT
    DATE(sale_date) AS sale_day,
    COUNT(*)         AS transaction_count,
    SUM(total_amount) AS revenue
FROM sales
GROUP BY DATE(sale_date);

-- Top-selling medicines (all-time; API filters by date range on top of this)
CREATE VIEW v_top_selling_medicines AS
SELECT
    m.medicine_id,
    m.name,
    SUM(sd.quantity)   AS units_sold,
    SUM(sd.line_total) AS revenue
FROM sale_details sd
JOIN medicines m ON m.medicine_id = sd.medicine_id
GROUP BY m.medicine_id, m.name
ORDER BY units_sold DESC;
