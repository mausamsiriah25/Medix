from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db
from app.models.entities import Medicine, Category
from app.schemas.schemas import MedicineCreate, MedicineUpdate, MedicineOut

router = APIRouter(prefix="/api/medicines", tags=["Medicines"])


@router.get("", response_model=list[MedicineOut])
def list_medicines(
    db: Session = Depends(get_db),
    search: str | None = None,
    category_id: int | None = None,
    stock_status: str | None = Query(None, pattern="^(HEALTHY|LOW|CRITICAL)$"),
    prescription_required: bool | None = None,
):
    # v_medicine_stock is the DB view doing the stock aggregation (see schema.sql)
    sql = "SELECT * FROM v_medicine_stock WHERE is_active = TRUE"
    params = {}
    if search:
        sql += " AND name LIKE :search"
        params["search"] = f"%{search}%"
    if category_id:
        sql += " AND category_id = :category_id"
        params["category_id"] = category_id
    if stock_status:
        sql += " AND stock_status = :stock_status"
        params["stock_status"] = stock_status
    if prescription_required is not None:
        sql += " AND prescription_required = :rx"
        params["rx"] = prescription_required
    sql += " ORDER BY name"

    rows = db.execute(text(sql), params).mappings().all()
    return [dict(r) for r in rows]


@router.get("/{medicine_id}")
def get_medicine(medicine_id: int, db: Session = Depends(get_db)):
    row = db.execute(
        text("SELECT * FROM v_medicine_stock WHERE medicine_id = :id"),
        {"id": medicine_id},
    ).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Medicine not found"})

    batches = db.execute(
        text("SELECT * FROM v_batch_stock WHERE medicine_id = :id ORDER BY expiry_date"),
        {"id": medicine_id},
    ).mappings().all()

    return {"medicine": dict(row), "batches": [dict(b) for b in batches]}


@router.post("", status_code=201)
def create_medicine(payload: MedicineCreate, db: Session = Depends(get_db)):
    category = db.get(Category, payload.category_id)
    if not category:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Category not found"})
    med = Medicine(**payload.model_dump())
    db.add(med)
    db.commit()
    db.refresh(med)
    return {"success": True, "medicine_id": med.medicine_id}


@router.put("/{medicine_id}")
def update_medicine(medicine_id: int, payload: MedicineUpdate, db: Session = Depends(get_db)):
    med = db.get(Medicine, medicine_id)
    if not med:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Medicine not found"})
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(med, field, value)
    db.commit()
    return {"success": True}


@router.delete("/{medicine_id}")
def delete_medicine(medicine_id: int, db: Session = Depends(get_db)):
    """Soft delete only — historical sales must keep referencing this medicine."""
    med = db.get(Medicine, medicine_id)
    if not med:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Medicine not found"})
    med.is_active = False
    db.commit()
    return {"success": True, "message": "Medicine deactivated"}
