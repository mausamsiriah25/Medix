"""Categories, Suppliers, Customers — straightforward CRUD."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.entities import Category, Supplier, Customer
from app.schemas.schemas import (
    CategoryCreate, CategoryOut, SupplierCreate, SupplierOut,
    CustomerCreate, CustomerOut,
)

router = APIRouter(tags=["Catalog"])


@router.get("/api/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name).all()


@router.post("/api/categories", response_model=CategoryOut, status_code=201)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    cat = Category(**payload.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.get("/api/suppliers", response_model=list[SupplierOut])
def list_suppliers(db: Session = Depends(get_db)):
    return db.query(Supplier).order_by(Supplier.name).all()


@router.post("/api/suppliers", response_model=SupplierOut, status_code=201)
def create_supplier(payload: SupplierCreate, db: Session = Depends(get_db)):
    sup = Supplier(**payload.model_dump())
    db.add(sup)
    db.commit()
    db.refresh(sup)
    return sup


@router.get("/api/customers", response_model=list[CustomerOut])
def list_customers(db: Session = Depends(get_db)):
    return db.query(Customer).order_by(Customer.name).all()


@router.post("/api/customers", response_model=CustomerOut, status_code=201)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    cust = Customer(**payload.model_dump())
    db.add(cust)
    db.commit()
    db.refresh(cust)
    return cust
