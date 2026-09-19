from sqlalchemy import (
    Column, Integer, String, Numeric, Boolean, Date, DateTime, ForeignKey, Enum, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class RoleEnum(str, enum.Enum):
    admin = "admin"
    pharmacist = "pharmacist"


class PaymentMethodEnum(str, enum.Enum):
    cash = "cash"
    card = "card"
    upi = "upi"


class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.pharmacist, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class Category(Base):
    __tablename__ = "categories"
    category_id = Column(Integer, primary_key=True)
    name = Column(String(80), nullable=False, unique=True)
    description = Column(String(255))
    medicines = relationship("Medicine", back_populates="category")


class Supplier(Base):
    __tablename__ = "suppliers"
    supplier_id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    contact_person = Column(String(100))
    phone = Column(String(20))
    email = Column(String(150))
    address = Column(String(255))
    created_at = Column(DateTime, server_default=func.now())
    batches = relationship("Batch", back_populates="supplier")


class Medicine(Base):
    __tablename__ = "medicines"
    medicine_id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    generic_name = Column(String(150))
    category_id = Column(Integer, ForeignKey("categories.category_id"), nullable=False)
    manufacturer = Column(String(150))
    unit_price = Column(Numeric(10, 2), nullable=False)
    prescription_required = Column(Boolean, default=False, nullable=False)
    reorder_level = Column(Integer, default=20, nullable=False)
    critical_level = Column(Integer, default=5, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    category = relationship("Category", back_populates="medicines")
    batches = relationship("Batch", back_populates="medicine")


class Batch(Base):
    __tablename__ = "batches"
    batch_id = Column(Integer, primary_key=True)
    medicine_id = Column(Integer, ForeignKey("medicines.medicine_id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.supplier_id"), nullable=False)
    batch_number = Column(String(50), nullable=False)
    manufacture_date = Column(Date)
    expiry_date = Column(Date, nullable=False)
    cost_price = Column(Numeric(10, 2), nullable=False)
    quantity_received = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    medicine = relationship("Medicine", back_populates="batches")
    supplier = relationship("Supplier", back_populates="batches")
    inventory = relationship("Inventory", back_populates="batch", uselist=False)


class Inventory(Base):
    __tablename__ = "inventory"
    inventory_id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey("batches.batch_id"), nullable=False, unique=True)
    quantity = Column(Integer, nullable=False)
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())

    batch = relationship("Batch", back_populates="inventory")


class Customer(Base):
    __tablename__ = "customers"
    customer_id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    phone = Column(String(20), unique=True)
    email = Column(String(150))
    created_at = Column(DateTime, server_default=func.now())


class Sale(Base):
    __tablename__ = "sales"
    sale_id = Column(Integer, primary_key=True)
    invoice_number = Column(String(30), nullable=False, unique=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0, nullable=False)
    discount_amount = Column(Numeric(10, 2), default=0, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(Enum(PaymentMethodEnum), nullable=False)
    sale_date = Column(DateTime, server_default=func.now())

    items = relationship("SaleDetail", back_populates="sale", cascade="all, delete-orphan")
    customer = relationship("Customer")


class SaleDetail(Base):
    __tablename__ = "sale_details"
    sale_detail_id = Column(Integer, primary_key=True)
    sale_id = Column(Integer, ForeignKey("sales.sale_id"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.medicine_id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.batch_id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    line_total = Column(Numeric(10, 2), nullable=False)

    sale = relationship("Sale", back_populates="items")
    medicine = relationship("Medicine")
    batch = relationship("Batch")
