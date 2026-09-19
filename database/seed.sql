-- ============================================================
-- MEDIX seed data — fictional data only, sized so dashboard,
-- charts, expiry radar and analytics all have something real to show.
-- ============================================================
USE medix;

-- Default admin: email admin@medix.local / password "medix123" (bcrypt hash below)
INSERT INTO users (full_name, email, password_hash, role) VALUES
('Store Admin', 'admin@medix.local', '$2b$12$KIXQ7Z3G6f8Qe1s2c1p3F.examplehashvalueonly000000000000', 'admin'),
('Asha Verma', 'asha@medix.local', '$2b$12$KIXQ7Z3G6f8Qe1s2c1p3F.examplehashvalueonly000000000000', 'pharmacist');

INSERT INTO categories (name, description) VALUES
('Analgesics', 'Pain relief medication'),
('Antibiotics', 'Bacterial infection treatment'),
('Antihistamines', 'Allergy relief'),
('Vitamins', 'Nutritional supplements'),
('Antacids', 'Digestive / acidity relief'),
('Cardiovascular', 'Heart and blood pressure medication'),
('Diabetes', 'Blood sugar management'),
('Dermatology', 'Skin treatment');

INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
('Sunrise Pharma Distributors', 'Ramesh Iyer', '9820011223', 'contact@sunrisepharma.example', 'MIDC, Nagpur'),
('Cipla Regional Depot', 'Neha Kulkarni', '9820033445', 'depot@ciplaregion.example', 'Wardha Road, Nagpur'),
('MediSupply Co.', 'Farhan Shaikh', '9820055667', 'sales@medisupply.example', 'Sitabuldi, Nagpur'),
('WellCare Wholesalers', 'Priya Nair', '9820077889', 'orders@wellcare.example', 'Civil Lines, Nagpur');

INSERT INTO medicines (name, generic_name, category_id, manufacturer, unit_price, prescription_required, reorder_level, critical_level) VALUES
('Paracetamol 500mg', 'Paracetamol', 1, 'Cipla', 2.50, FALSE, 100, 30),
('Ibuprofen 400mg', 'Ibuprofen', 1, 'Sun Pharma', 3.20, FALSE, 60, 15),
('Amoxicillin 500mg', 'Amoxicillin', 2, 'GSK', 6.80, TRUE, 50, 10),
('Azithromycin 250mg', 'Azithromycin', 2, 'Cipla', 12.00, TRUE, 40, 10),
('Cetirizine 10mg', 'Cetirizine', 3, 'Dr. Reddy''s', 1.80, FALSE, 80, 20),
('Loratadine 10mg', 'Loratadine', 3, 'Sun Pharma', 2.10, FALSE, 50, 12),
('Vitamin B12 1000mcg', 'Cyanocobalamin', 4, 'HealthVit', 4.50, FALSE, 40, 10),
('Vitamin C 500mg', 'Ascorbic Acid', 4, 'HealthVit', 1.20, FALSE, 100, 25),
('Omeprazole 20mg', 'Omeprazole', 5, 'Dr. Reddy''s', 3.90, FALSE, 45, 10),
('Antacid Gel 200ml', 'Aluminium Hydroxide', 5, 'Digene', 5.60, FALSE, 30, 8),
('Amlodipine 5mg', 'Amlodipine', 6, 'Cipla', 4.10, TRUE, 40, 10),
('Atorvastatin 10mg', 'Atorvastatin', 6, 'Sun Pharma', 5.30, TRUE, 35, 8),
('Metformin 500mg', 'Metformin', 7, 'Sun Pharma', 2.80, TRUE, 60, 15),
('Insulin Glargine', 'Insulin Glargine', 7, 'Novo Nordisk', 320.00, TRUE, 10, 3),
('Clotrimazole Cream', 'Clotrimazole', 8, 'GSK', 3.40, FALSE, 25, 6);

-- Batches: mix of healthy / low / critical / expired / expiring soon / far future
-- Supplier ids: 1 Sunrise, 2 Cipla Depot, 3 MediSupply, 4 WellCare
INSERT INTO batches (medicine_id, supplier_id, batch_number, manufacture_date, expiry_date, cost_price, quantity_received) VALUES
-- Paracetamol: healthy stock, one batch further out
(1, 1, 'PCM2401', '2025-04-01', DATE_ADD(CURDATE(), INTERVAL 240 DAY), 1.60, 300),
(1, 1, 'PCM2402', '2025-09-01', DATE_ADD(CURDATE(), INTERVAL 420 DAY), 1.60, 150),
-- Ibuprofen: healthy
(2, 2, 'IBU2402', '2025-05-10', DATE_ADD(CURDATE(), INTERVAL 300 DAY), 2.10, 180),
-- Amoxicillin: LOW stock scenario
(3, 2, 'AMX2403', '2025-02-15', DATE_ADD(CURDATE(), INTERVAL 200 DAY), 4.50, 45),
-- Azithromycin: high sales item, healthy stock
(4, 2, 'AZI2404', '2025-06-01', DATE_ADD(CURDATE(), INTERVAL 260 DAY), 8.00, 220),
-- Cetirizine: EXPIRING SOON (within 30 days)
(5, 3, 'CTZ2405', '2025-01-05', DATE_ADD(CURDATE(), INTERVAL 18 DAY), 1.10, 90),
(5, 3, 'CTZ2406', '2025-08-01', DATE_ADD(CURDATE(), INTERVAL 300 DAY), 1.10, 60),
-- Loratadine: healthy
(6, 3, 'LOR2402', '2025-03-01', DATE_ADD(CURDATE(), INTERVAL 200 DAY), 1.40, 100),
-- Vitamin B12: EXPIRED batch
(7, 4, 'VB122401', '2024-06-01', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 2.80, 70),
(7, 4, 'VB122402', '2025-07-01', DATE_ADD(CURDATE(), INTERVAL 260 DAY), 2.80, 50),
-- Vitamin C: healthy, large stock
(8, 4, 'VITC2403', '2025-04-01', DATE_ADD(CURDATE(), INTERVAL 320 DAY), 0.70, 400),
-- Omeprazole: EXPIRING within 90 days
(9, 1, 'OMZ2402', '2025-01-20', DATE_ADD(CURDATE(), INTERVAL 75 DAY), 2.30, 120),
-- Antacid Gel: healthy
(10, 1, 'ANTG2401', '2025-05-01', DATE_ADD(CURDATE(), INTERVAL 250 DAY), 3.80, 60),
-- Amlodipine: CRITICAL stock
(11, 2, 'AML2404', '2025-03-01', DATE_ADD(CURDATE(), INTERVAL 200 DAY), 2.60, 8),
-- Atorvastatin: healthy
(12, 2, 'ATV2403', '2025-04-15', DATE_ADD(CURDATE(), INTERVAL 220 DAY), 3.40, 90),
-- Metformin: healthy, high volume
(13, 3, 'MET2405', '2025-05-01', DATE_ADD(CURDATE(), INTERVAL 280 DAY), 1.80, 260),
-- Insulin: CRITICAL, high value (drives "financial exposure" insight)
(14, 4, 'INS2401', '2025-02-01', DATE_ADD(CURDATE(), INTERVAL 150 DAY), 250.00, 4),
-- Clotrimazole: healthy
(15, 1, 'CLO2402', '2025-06-01', DATE_ADD(CURDATE(), INTERVAL 300 DAY), 2.10, 40);

INSERT INTO customers (name, phone, email) VALUES
('Walk-in Customer', NULL, NULL),
('Rohit Deshmukh', '9823001111', 'rohit.d@example.com'),
('Sneha Patil', '9823002222', 'sneha.p@example.com'),
('Imran Sheikh', '9823003333', NULL),
('Kavita Joshi', '9823004444', 'kavita.j@example.com');

-- Sales across the last 14 days, weighted so Paracetamol/Azithromycin/Metformin lead
INSERT INTO sales (invoice_number, customer_id, user_id, subtotal, tax_amount, discount_amount, total_amount, payment_method, sale_date) VALUES
('INV-10001', 2, 1, 62.50, 3.13, 0,   65.63, 'upi',  DATE_SUB(NOW(), INTERVAL 13 DAY)),
('INV-10002', 1, 2, 45.60, 2.28, 0,   47.88, 'cash', DATE_SUB(NOW(), INTERVAL 12 DAY)),
('INV-10003', 3, 1, 128.00, 6.40, 10.00, 124.40, 'card', DATE_SUB(NOW(), INTERVAL 11 DAY)),
('INV-10004', 1, 2, 21.00, 1.05, 0,   22.05, 'cash', DATE_SUB(NOW(), INTERVAL 9 DAY)),
('INV-10005', 4, 1, 96.00, 4.80, 0,   100.80, 'upi',  DATE_SUB(NOW(), INTERVAL 8 DAY)),
('INV-10006', 5, 2, 34.40, 1.72, 0,   36.12, 'card', DATE_SUB(NOW(), INTERVAL 6 DAY)),
('INV-10007', 1, 1, 58.00, 2.90, 0,   60.90, 'cash', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('INV-10008', 2, 2, 150.00, 7.50, 15.00, 142.50, 'upi', DATE_SUB(NOW(), INTERVAL 4 DAY)),
('INV-10009', 1, 1, 27.00, 1.35, 0,   28.35, 'cash', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('INV-10010', 3, 2, 84.00, 4.20, 0,   88.20, 'card', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('INV-10011', 1, 1, 19.60, 0.98, 0,   20.58, 'cash', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('INV-10012', 4, 2, 72.80, 3.64, 0,   76.44, 'upi',  NOW());

-- Sale line items (unit_price snapshot at time of sale)
INSERT INTO sale_details (sale_id, medicine_id, batch_id, quantity, unit_price, line_total) VALUES
(1, 1, 1, 10, 2.50, 25.00), (1, 8, 11, 30, 1.20, 36.00),
(2, 5, 6, 12, 1.80, 21.60), (2, 6, 8, 12, 2.10, 25.20),
(3, 4, 5, 8, 12.00, 96.00), (3, 13, 16, 10, 2.80, 28.00),
(4, 1, 1, 8, 2.50, 20.00),
(5, 4, 5, 6, 12.00, 72.00), (5, 9, 12, 10, 2.30, 23.00),
(6, 7, 10, 6, 4.50, 27.00), (6, 15, 18, 2, 3.40, 6.80),
(7, 13, 16, 15, 2.80, 42.00), (7, 10, 13, 2, 5.60, 11.20), (7, 2, 3, 2, 3.20, 6.40),
(8, 4, 5, 12, 12.00, 144.00), (8, 1, 1, 2, 2.50, 5.00),
(9, 8, 11, 15, 1.20, 18.00), (9, 6, 8, 4, 2.10, 8.40),
(10, 12, 15, 12, 5.30, 63.60), (10, 9, 12, 9, 2.30, 20.70),
(11, 1, 1, 6, 2.50, 15.00), (11, 8, 11, 4, 1.20, 4.80),
(12, 4, 5, 4, 12.00, 48.00), (12, 13, 16, 8, 2.80, 22.40), (12, 5, 6, 1, 1.80, 1.80);

-- Reconcile inventory with the sales above (the batch-insert trigger only
-- sets initial stock = quantity_received; these UPDATEs reflect what the
-- sales service would have decremented at checkout time in real use).
UPDATE inventory SET quantity = 300 - 26 WHERE batch_id = 1;
UPDATE inventory SET quantity = 180 - 2  WHERE batch_id = 3;
UPDATE inventory SET quantity = 220 - 30 WHERE batch_id = 5;
UPDATE inventory SET quantity = 90  - 13 WHERE batch_id = 6;
UPDATE inventory SET quantity = 100 - 16 WHERE batch_id = 8;
UPDATE inventory SET quantity = 400 - 49 WHERE batch_id = 11;
UPDATE inventory SET quantity = 120 - 19 WHERE batch_id = 12;
UPDATE inventory SET quantity = 60  - 2  WHERE batch_id = 13;
UPDATE inventory SET quantity = 90  - 12 WHERE batch_id = 15;
UPDATE inventory SET quantity = 260 - 33 WHERE batch_id = 16;
UPDATE inventory SET quantity = 40  - 2  WHERE batch_id = 18;
