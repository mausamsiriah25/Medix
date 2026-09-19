"""
Core POS transaction logic.

Design decision (documented for the viva): stock validation and
decrement happen HERE, inside an explicit SQLAlchemy transaction —
not in a database trigger. This lets us return a precise, friendly
error ("Insufficient stock: 4 available, 7 requested") instead of a
raw SQL exception, while `trg_inventory_no_negative` in the DB still
acts as a last-line-of-defence guard against corruption from any
other write path.
"""
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
import uuid

from app.models.entities import (
    Medicine, Batch, Inventory, Sale, SaleDetail, Customer
)
from app.schemas.schemas import SaleCreate
from app.config import settings


def _next_invoice_number(db: Session) -> str:
    return f"INV-{uuid.uuid4().hex[:8].upper()}"


def _pick_batches_fefo(db: Session, medicine_id: int, needed: int) -> list[tuple[Batch, Inventory, int]]:
    """
    FEFO = First-Expiry-First-Out: sell from the batch expiring soonest,
    so older stock clears before newer stock. Skips expired batches
    entirely — expired medicine can never be sold.
    """
    today = date.today()
    rows = (
        db.query(Batch, Inventory)
        .join(Inventory, Inventory.batch_id == Batch.batch_id)
        .filter(Batch.medicine_id == medicine_id)
        .filter(Batch.expiry_date >= today)
        .filter(Inventory.quantity > 0)
        .order_by(Batch.expiry_date.asc())
        .all()
    )

    allocations = []
    remaining = needed
    for batch, inv in rows:
        if remaining <= 0:
            break
        take = min(inv.quantity, remaining)
        if take > 0:
            allocations.append((batch, inv, take))
            remaining -= take

    return allocations, remaining


def create_sale(db: Session, payload: SaleCreate, user_id: int) -> Sale:
    if not payload.items:
        raise HTTPException(status_code=400, detail={
            "success": False, "message": "Cart is empty"
        })

    if payload.customer_id is not None:
        customer = db.get(Customer, payload.customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail={
                "success": False, "message": "Customer not found"
            })

    # ---- Validate + allocate stock for every line BEFORE writing anything ----
    line_plans = []  # (medicine, [(batch, inventory, qty), ...], unit_price)
    subtotal = 0.0

    for item in payload.items:
        medicine = db.get(Medicine, item.medicine_id)
        if not medicine or not medicine.is_active:
            raise HTTPException(status_code=404, detail={
                "success": False,
                "message": f"Medicine {item.medicine_id} not found or inactive",
            })

        allocations, remaining = _pick_batches_fefo(db, medicine.medicine_id, item.quantity)
        available = item.quantity - remaining
        if remaining > 0:
            raise HTTPException(status_code=409, detail={
                "success": False,
                "message": f"Insufficient stock for {medicine.name}",
                "details": {"available": available, "requested": item.quantity},
            })

        unit_price = float(medicine.unit_price)
        line_plans.append((medicine, allocations, unit_price))
        subtotal += unit_price * item.quantity

    tax_amount = round(subtotal * settings.tax_rate, 2)
    total_amount = round(subtotal + tax_amount - payload.discount_amount, 2)
    if total_amount < 0:
        raise HTTPException(status_code=400, detail={
            "success": False, "message": "Discount exceeds order total"
        })

    # ---- BEGIN TRANSACTION: create sale, sale_details, decrement inventory ----
    try:
        sale = Sale(
            invoice_number=_next_invoice_number(db),
            customer_id=payload.customer_id,
            user_id=user_id,
            subtotal=round(subtotal, 2),
            tax_amount=tax_amount,
            discount_amount=payload.discount_amount,
            total_amount=total_amount,
            payment_method=payload.payment_method,
        )
        db.add(sale)
        db.flush()  # get sale.sale_id without committing

        for medicine, allocations, unit_price in line_plans:
            for batch, inv, qty in allocations:
                db.add(SaleDetail(
                    sale_id=sale.sale_id,
                    medicine_id=medicine.medicine_id,
                    batch_id=batch.batch_id,
                    quantity=qty,
                    unit_price=unit_price,
                    line_total=round(unit_price * qty, 2),
                ))
                inv.quantity -= qty  # atomic within this transaction

        db.commit()
        db.refresh(sale)
        return sale

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail={
            "success": False,
            "message": "Sale could not be completed; no stock was changed",
            "details": {"error": str(exc)},
        })
