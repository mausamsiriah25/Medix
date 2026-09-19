export interface Medicine {
  medicine_id: number
  name: string
  category_name: string
  unit_price: number
  reorder_level: number
  critical_level: number
  prescription_required: boolean
  is_active: boolean
  total_quantity: number
  stock_status: 'HEALTHY' | 'LOW' | 'CRITICAL'
}

export interface BatchStock {
  batch_id: number
  medicine_id: number
  medicine_name: string
  category_name: string
  supplier_name: string
  batch_number: string
  expiry_date: string
  days_to_expiry: number
  quantity: number
  stock_status: string
  expiry_status: 'EXPIRED' | 'EXPIRING_SOON' | 'EXPIRING_LATER' | 'SAFE'
}

export interface CartItem {
  medicine_id: number
  name: string
  unit_price: number
  quantity: number
  available: number
}

export interface SaleSummary {
  sale_id: number
  invoice_number: string
  customer_name: string
  total_amount: number
  payment_method: string
  sale_date: string
  item_count: number
}

export interface RevenuePoint { date: string; revenue: number; transactions: number }
export interface TopMedicine { medicine_id: number; name: string; units_sold: number; revenue: number }
export interface CategoryPerf { category: string; revenue: number; units_sold: number }
