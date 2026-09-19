# MEDIX Database Schema

## Entities
`users`, `categories`, `suppliers`, `medicines`, `batches`, `inventory`, `customers`, `sales`, `sale_details`

## Why batches are separate from medicines
A medicine (e.g. "Paracetamol 500mg") is a catalog concept — name, price, category. A **batch** is a specific consignment received from a specific supplier with its own expiry date and quantity. One medicine can have many batches on shelf at once, each expiring at a different time. Splitting them out is what makes FEFO selling and per-batch expiry tracking possible, and is exactly why `medicine_id → batches.medicine_id` is a 1:N relationship rather than storing expiry directly on `medicines`.

## Why inventory is separate from batches
`batches` records what was *received* (an immutable-ish goods-received log). `inventory` records what's *currently available* to sell. Keeping them apart means restocks, sales, and adjustments only ever touch `inventory.quantity`, while `batches` stays a clean audit trail of what came in and when.

## Normalization (≈3NF)
- Every non-key column depends on the whole primary key, not part of it (no composite keys with partial dependency).
- No transitive dependencies: e.g. `category_name` is never duplicated onto `medicines` — it's looked up via `category_id → categories`. Views (`v_medicine_stock`, `v_batch_stock`) denormalize *for reads only*, which is standard practice and doesn't violate the underlying schema's normal form.
- `sale_details.unit_price` is an intentional, documented exception: it snapshots price at time of sale so historical invoices don't change if `medicines.unit_price` is later edited. This is a common, deliberate denormalization for auditability, not an oversight.

## Constraints
- `CHECK` constraints prevent negative prices/quantities and enforce `manufacture_date < expiry_date`.
- `UNIQUE (medicine_id, batch_number)` stops the same batch number being entered twice for one medicine.
- Foreign keys use `ON DELETE RESTRICT` from `sale_details` back to `medicines`/`batches` — you cannot hard-delete a medicine or batch that has sales history. Medicines are soft-deleted (`is_active = FALSE`) instead.

## Indexes
`medicine name`, `batch expiry_date`, `batch medicine_id/supplier_id`, `sale_date`, `sale_details medicine_id` — all chosen because they back a real filter/sort the API performs (search, expiry radar, sales-by-date, top-selling aggregation).

## Views
- `v_batch_stock` — per-batch stock + expiry status, joined across medicine/category/supplier. Backs the Expiry Radar and Inventory page.
- `v_medicine_stock` — per-medicine aggregate stock across all non-expired batches. Backs the Medicines list and low-stock alerts.
- `v_daily_sales`, `v_top_selling_medicines` — backing rollups for the dashboard/analytics (the API re-derives date-range/limit filtering on top of these in `analytics_service.py`).

## Trigger design decision
Inventory decrement on sale happens in the **FastAPI service layer** (`sales_service.create_sale`), inside one SQLAlchemy transaction, not in a database trigger — so a failed sale (insufficient stock, expired batch) returns a specific, readable error instead of an opaque SQL exception. `trg_inventory_no_negative` remains as a defence-in-depth guard at the DB layer regardless of which application path writes to `inventory`. `trg_batch_creates_inventory` auto-creates the matching inventory row whenever a batch is received, so the API never has to remember to do it manually.

## Transaction (viva-ready explanation)
```
BEGIN
  INSERT sale
  FOR each cart line:
    allocate FEFO batches (skip expired, skip out-of-stock)
    INSERT sale_details
    UPDATE inventory.quantity -= allocated_qty
COMMIT
-- any exception anywhere above -> ROLLBACK, nothing partially applied
```
See `backend/app/services/sales_service.py`.
