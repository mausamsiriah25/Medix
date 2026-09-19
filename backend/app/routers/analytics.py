from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import analytics_service as svc

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    return svc.summary_metrics(db)


@router.get("/revenue")
def revenue(days: int = 14, db: Session = Depends(get_db)):
    return svc.revenue_trend(db, days)


@router.get("/top-selling")
def top_selling(limit: int = 5, db: Session = Depends(get_db)):
    return svc.top_selling_medicines(db, limit)


@router.get("/category-performance")
def category_performance(db: Session = Depends(get_db)):
    return svc.category_performance(db)


@router.get("/payment-methods")
def payment_methods(db: Session = Depends(get_db)):
    return svc.payment_method_split(db)
