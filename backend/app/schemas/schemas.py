from pydantic import BaseModel, Field, ConfigDict
from datetime import date, datetime
from typing import Optional, Literal


# ---------- Category ----------
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    category_id: int


# ---------- Supplier ----------
class SupplierBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierOut(SupplierBase):
    model_config = ConfigDict(from_attributes=True)
    supplier_id: int


# ---------- Medicine ----------
class MedicineBase(BaseModel):
    name: str
    generic_name: Optional[str] = None
    category_id: int
    manufacturer: Optional[str] = None
    unit_price: float = Field(ge=0)
    prescription_required: bool = False
    reorder_level: int = Field(ge=0, default=20)
    critical_level: int = Field(ge=0, default=5)

class MedicineCreate(MedicineBase):
    pass

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    generic_name: Optional[str] = None
    category_id: Optional[int] = None
    manufacturer: Optional[str] = None
    unit_price: Optional[float] = Field(default=None, ge=0)
    prescription_required: Optional[bool] = None
    reorder_level: Optional[int] = Field(default=None, ge=0)
    critical_level: Optional[int] = Field(default=None, ge=0)
    is_active: Optional[bool] = None

class MedicineOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    medicine_id: int
    name: str
    category_name: str
    unit_price: float
    reorder_level: int
    critical_level: int
    prescription_required: bool
    is_active: bool
    total_quantity: int
    stock_status: Literal["HEALTHY", "LOW", "CRITICAL"]


# ---------- Batch / Inventory ----------
class BatchCreate(BaseModel):
    medicine_id: int
    supplier_id: int
    batch_number: str
    manufacture_date: Optional[date] = None
    expiry_date: date
    cost_price: float = Field(ge=0)
    quantity_received: int = Field(ge=0)

class BatchStockOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    batch_id: int
    medicine_id: int
    medicine_name: str
    category_name: str
    supplier_name: str
    batch_number: str
    expiry_date: date
    days_to_expiry: int
    quantity: int
    stock_status: str
    expiry_status: str

class RestockRequest(BaseModel):
    quantity: int = Field(gt=0)


# ---------- Customer ----------
class CustomerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerOut(CustomerBase):
    model_config = ConfigDict(from_attributes=True)
    customer_id: int


# ---------- Sales / POS ----------
class SaleItemIn(BaseModel):
    medicine_id: int
    quantity: int = Field(gt=0)

class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    items: list[SaleItemIn]
    discount_amount: float = Field(default=0, ge=0)
    payment_method: Literal["cash", "card", "upi"]

class SaleItemOut(BaseModel):
    medicine_id: int
    medicine_name: str
    batch_id: int
    quantity: int
    unit_price: float
    line_total: float

class SaleOut(BaseModel):
    sale_id: int
    invoice_number: str
    customer_name: Optional[str] = None
    subtotal: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    payment_method: str
    sale_date: datetime
    items: list[SaleItemOut]


# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    full_name: str
    role: str


# ---------- Generic error envelope ----------
class ErrorDetail(BaseModel):
    success: bool = False
    message: str
    details: Optional[dict] = None
