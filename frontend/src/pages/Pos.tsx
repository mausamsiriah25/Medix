import { useEffect, useState } from 'react'
import { Search, Plus, Minus, Trash2, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge, statusTone } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { api, ApiError } from '@/services/api'
import { formatCurrency } from '@/lib/utils'
import type { CartItem, Medicine } from '@/types'

const TAX_RATE = 0.05

export default function Pos() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [payment, setPayment] = useState<'cash' | 'card' | 'upi'>('cash')
  const [error, setError] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)
  const [invoice, setInvoice] = useState<{ invoice_number: string; total_amount: number } | null>(null)

  useEffect(() => {
    api.get<Medicine[]>(`/api/medicines?search=${encodeURIComponent(search)}`).then(setMedicines).catch(() => {})
  }, [search])

  function addToCart(m: Medicine) {
    setError(null)
    setCart(prev => {
      const existing = prev.find(i => i.medicine_id === m.medicine_id)
      if (existing) {
        if (existing.quantity >= m.total_quantity) return prev
        return prev.map(i => i.medicine_id === m.medicine_id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      if (m.total_quantity <= 0) return prev
      return [...prev, { medicine_id: m.medicine_id, name: m.name, unit_price: m.unit_price, quantity: 1, available: m.total_quantity }]
    })
  }

  function changeQty(id: number, delta: number) {
    setCart(prev => prev
      .map(i => i.medicine_id === id ? { ...i, quantity: Math.min(i.available, Math.max(1, i.quantity + delta)) } : i))
  }

  function removeItem(id: number) {
    setCart(prev => prev.filter(i => i.medicine_id !== id))
  }

  const subtotal = cart.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  async function checkout() {
    setPlacing(true)
    setError(null)
    try {
      const result = await api.post<{ invoice_number: string; total_amount: number }>('/api/sales', {
        items: cart.map(i => ({ medicine_id: i.medicine_id, quantity: i.quantity })),
        payment_method: payment,
        discount_amount: 0,
      })
      setInvoice(result)
      setCart([])
    } catch (e) {
      if (e instanceof ApiError) {
        const d = e.details as { available?: number; requested?: number } | undefined
        setError(d?.available !== undefined ? `${e.message} — available: ${d.available}, requested: ${d.requested}` : e.message)
      } else {
        setError('Unable to complete sale.')
      }
    } finally {
      setPlacing(false)
    }
  }

  if (invoice) {
    return (
      <div className="mx-auto max-w-md py-10">
        <Card className="p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h2 className="mt-4 text-lg font-bold">Sale Complete</h2>
          <p className="mt-1 text-3xl font-bold">{formatCurrency(invoice.total_amount)}</p>
          <p className="mt-1 text-sm text-slate-400">Invoice #{invoice.invoice_number}</p>
          <p className="mt-1 text-xs text-emerald-600">Stock updated successfully.</p>
          <Button className="mt-6 w-full" onClick={() => setInvoice(null)}>New Sale</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search medicines to sell..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {medicines.map(m => (
            <button
              key={m.medicine_id}
              onClick={() => addToCart(m)}
              disabled={m.total_quantity <= 0}
              className="rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-brand-400 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-surface-dark-alt"
            >
              <p className="text-sm font-medium leading-tight">{m.name}</p>
              <p className="mt-1 text-sm font-semibold text-brand-600">{formatCurrency(m.unit_price)}</p>
              <p className="mt-0.5 text-xs text-slate-400">Available: {m.total_quantity}</p>
            </button>
          ))}
        </div>
      </div>

      <Card className="flex h-fit flex-col p-4">
        <h2 className="mb-3 font-semibold">Current Bill</h2>
        {cart.length === 0 ? (
          <EmptyState title="Cart is empty" description="Add medicines from the left to start a sale." />
        ) : (
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.medicine_id} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-slate-400">{formatCurrency(item.unit_price)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => changeQty(item.medicine_id, -1)} className="rounded-md bg-slate-100 p-1 dark:bg-slate-800"><Minus className="h-3 w-3" /></button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => changeQty(item.medicine_id, 1)} disabled={item.quantity >= item.available} className="rounded-md bg-slate-100 p-1 disabled:opacity-40 dark:bg-slate-800"><Plus className="h-3 w-3" /></button>
                </div>
                <button onClick={() => removeItem(item.medicine_id)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
          <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between text-slate-500"><span>Tax (5%)</span><span>{formatCurrency(tax)}</span></div>
          <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatCurrency(total)}</span></div>
        </div>

        <div className="mt-4 flex gap-1.5">
          {(['cash', 'card', 'upi'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPayment(p)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium uppercase ${payment === p ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
            >
              {p}
            </button>
          ))}
        </div>

        {error && <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">{error}</p>}

        <Button className="mt-4 w-full" disabled={cart.length === 0 || placing} onClick={checkout}>
          {placing ? 'Processing...' : 'Pay Now'}
        </Button>
      </Card>
    </div>
  )
}
