from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.schemas import SaleCreate, SaleOut
from app.services.sales_service import create_sale

router = APIRouter(prefix="/api/sales", tags=["Sales"])

# NOTE: user_id is hardcoded to 1 (seeded admin) until full auth/session
# wiring is added — swap for `Depends(get_current_user)` at that point.
DEFAULT_USER_ID = 1


@router.post("", status_code=201)
def checkout(payload: SaleCreate, db: Session = Depends(get_db)):
    sale = create_sale(db, payload, user_id=DEFAULT_USER_ID)
    return {
        "success": True,
        "sale_id": sale.sale_id,
        "invoice_number": sale.invoice_number,
        "total_amount": float(sale.total_amount),
    }


@router.get("")
def list_sales(db: Session = Depends(get_db), limit: int = 50):
    from app.models.entities import Sale
    sales = db.query(Sale).order_by(Sale.sale_date.desc()).limit(limit).all()
    return [
        {
            "sale_id": s.sale_id,
            "invoice_number": s.invoice_number,
            "customer_name": s.customer.name if s.customer else "Walk-in",
            "total_amount": float(s.total_amount),
            "payment_method": s.payment_method.value if hasattr(s.payment_method, "value") else s.payment_method,
            "sale_date": s.sale_date,
            "item_count": len(s.items),
        }
        for s in sales
    ]


@router.get("/{sale_id}")
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    from app.models.entities import Sale
    from fastapi import HTTPException
    sale = db.get(Sale, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Sale not found"})
    return {
        "sale_id": sale.sale_id,
        "invoice_number": sale.invoice_number,
        "customer_name": sale.customer.name if sale.customer else "Walk-in",
        "subtotal": float(sale.subtotal),
        "tax_amount": float(sale.tax_amount),
        "discount_amount": float(sale.discount_amount),
        "total_amount": float(sale.total_amount),
        "payment_method": sale.payment_method.value if hasattr(sale.payment_method, "value") else sale.payment_method,
        "sale_date": sale.sale_date,
        "items": [
            {
                "medicine_name": item.medicine.name,
                "batch_id": item.batch_id,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "line_total": float(item.line_total),
            }
            for item in sale.items
        ],
    }
