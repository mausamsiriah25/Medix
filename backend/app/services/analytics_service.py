from datetime import date, timedelta
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.entities import Sale, SaleDetail, Medicine, Category


def revenue_trend(db: Session, days: int = 14):
    since = date.today() - timedelta(days=days - 1)
    rows = (
        db.query(
            func.date(Sale.sale_date).label("day"),
            func.sum(Sale.total_amount).label("revenue"),
            func.count(Sale.sale_id).label("transactions"),
        )
        .filter(func.date(Sale.sale_date) >= since)
        .group_by(func.date(Sale.sale_date))
        .order_by(func.date(Sale.sale_date))
        .all()
    )
    return [
        {"date": str(r.day), "revenue": float(r.revenue), "transactions": r.transactions}
        for r in rows
    ]


def top_selling_medicines(db: Session, limit: int = 5):
    rows = (
        db.query(
            Medicine.medicine_id,
            Medicine.name,
            func.sum(SaleDetail.quantity).label("units_sold"),
            func.sum(SaleDetail.line_total).label("revenue"),
        )
        .join(SaleDetail, SaleDetail.medicine_id == Medicine.medicine_id)
        .group_by(Medicine.medicine_id, Medicine.name)
        .order_by(func.sum(SaleDetail.quantity).desc())
        .limit(limit)
        .all()
    )
    return [
        {"medicine_id": r.medicine_id, "name": r.name,
         "units_sold": int(r.units_sold), "revenue": float(r.revenue)}
        for r in rows
    ]


def category_performance(db: Session):
    rows = (
        db.query(
            Category.name,
            func.sum(SaleDetail.line_total).label("revenue"),
            func.sum(SaleDetail.quantity).label("units_sold"),
        )
        .join(Medicine, Medicine.category_id == Category.category_id)
        .join(SaleDetail, SaleDetail.medicine_id == Medicine.medicine_id)
        .group_by(Category.name)
        .order_by(func.sum(SaleDetail.line_total).desc())
        .all()
    )
    return [
        {"category": r.name, "revenue": float(r.revenue), "units_sold": int(r.units_sold)}
        for r in rows
    ]


def payment_method_split(db: Session):
    rows = (
        db.query(Sale.payment_method, func.count(Sale.sale_id).label("count"),
                  func.sum(Sale.total_amount).label("revenue"))
        .group_by(Sale.payment_method)
        .all()
    )
    return [
        {"method": r.payment_method.value if hasattr(r.payment_method, "value") else r.payment_method,
         "count": r.count, "revenue": float(r.revenue)}
        for r in rows
    ]


def summary_metrics(db: Session):
    today = date.today()
    today_sales = (
        db.query(func.count(Sale.sale_id), func.coalesce(func.sum(Sale.total_amount), 0))
        .filter(func.date(Sale.sale_date) == today)
        .first()
    )
    avg_order_value = (
        db.query(func.coalesce(func.avg(Sale.total_amount), 0)).scalar()
    )
    return {
        "today_transactions": today_sales[0],
        "today_revenue": float(today_sales[1]),
        "average_order_value": round(float(avg_order_value), 2),
    }
