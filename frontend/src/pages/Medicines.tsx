import { useEffect, useMemo, useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge, statusTone } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/services/api'
import { formatCurrency } from '@/lib/utils'
import type { Medicine } from '@/types'

export default function Medicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    let cancelled = false
    const timeout = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (statusFilter !== 'ALL') params.set('stock_status', statusFilter)
        const data = await api.get<Medicine[]>(`/api/medicines?${params.toString()}`)
        if (!cancelled) setMedicines(data)
      } catch {
        if (!cancelled) setError('Failed to load medicines.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300) // debounce
    return () => { cancelled = true; clearTimeout(timeout) }
  }, [search, statusFilter])

  const filters = ['ALL', 'HEALTHY', 'LOW', 'CRITICAL']

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">Medicines</h1>
          <p className="text-sm text-slate-500">Manage your medicine catalog and stock status.</p>
        </div>
        <Button><Plus className="h-4 w-4" /> Add Medicine</Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search medicines, manufacturer..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1.5">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === f ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : error ? (
          <p className="p-8 text-center text-sm text-red-500">{error}</p>
        ) : medicines.length === 0 ? (
          <EmptyState title="No medicines found." description="Try changing your filters or add a new medicine." action={<Button variant="secondary"><Plus className="h-4 w-4" />Add Medicine</Button>} />
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Medicine</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Rx</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {medicines.map(m => (
                  <tr key={m.medicine_id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium">{m.name}</td>
                    <td className="px-4 py-3 text-slate-500">{m.category_name}</td>
                    <td className="px-4 py-3">{formatCurrency(m.unit_price)}</td>
                    <td className="px-4 py-3">{m.total_quantity} units</td>
                    <td className="px-4 py-3 text-slate-500">{m.prescription_required ? 'Required' : '—'}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone(m.stock_status)}>{m.stock_status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
              {medicines.map(m => (
                <div key={m.medicine_id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.category_name}</p>
                    </div>
                    <Badge tone={statusTone(m.stock_status)}>{m.stock_status}</Badge>
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-slate-500">
                    <span>{formatCurrency(m.unit_price)}</span>
                    <span>{m.total_quantity} units</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
