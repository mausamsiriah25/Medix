from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db
from app.models.entities import Batch, Inventory, Medicine, Supplier
from app.schemas.schemas import BatchCreate, RestockRequest, BatchStockOut

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.get("", response_model=list[BatchStockOut])
def list_inventory(db: Session = Depends(get_db)):
    rows = db.execute(text("SELECT * FROM v_batch_stock ORDER BY expiry_date")).mappings().all()
    return [dict(r) for r in rows]


@router.get("/low-stock", response_model=list[BatchStockOut])
def low_stock(db: Session = Depends(get_db)):
    rows = db.execute(
        text("SELECT * FROM v_batch_stock WHERE stock_status IN ('LOW','CRITICAL') ORDER BY quantity")
    ).mappings().all()
    return [dict(r) for r in rows]


@router.get("/expiring", response_model=list[BatchStockOut])
def expiring(days: int = 90, db: Session = Depends(get_db)):
    rows = db.execute(
        text("""SELECT * FROM v_batch_stock
                 WHERE days_to_expiry BETWEEN 0 AND :days OR expiry_status = 'EXPIRED'
                 ORDER BY days_to_expiry"""),
        {"days": days},
    ).mappings().all()
    return [dict(r) for r in rows]


@router.post("/batches", status_code=201)
def receive_batch(payload: BatchCreate, db: Session = Depends(get_db)):
    if not db.get(Medicine, payload.medicine_id):
        raise HTTPException(status_code=404, detail={"success": False, "message": "Medicine not found"})
    if not db.get(Supplier, payload.supplier_id):
        raise HTTPException(status_code=404, detail={"success": False, "message": "Supplier not found"})

    batch = Batch(**payload.model_dump())
    db.add(batch)
    db.flush()
    # Inventory row is also auto-created by trg_batch_creates_inventory in MySQL;
    # this INSERT is defensive for engines/tests that bypass the trigger.
    existing = db.query(Inventory).filter(Inventory.batch_id == batch.batch_id).first()
    if not existing:
        db.add(Inventory(batch_id=batch.batch_id, quantity=payload.quantity_received))
    db.commit()
    return {"success": True, "batch_id": batch.batch_id}


@router.post("/restock/{batch_id}")
def restock(batch_id: int, payload: RestockRequest, db: Session = Depends(get_db)):
    inv = db.query(Inventory).filter(Inventory.batch_id == batch_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Batch inventory not found"})
    inv.quantity += payload.quantity
    db.commit()
    return {"success": True, "new_quantity": inv.quantity}
