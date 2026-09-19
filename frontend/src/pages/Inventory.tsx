import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge, statusTone } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/services/api'
import { formatDate } from '@/lib/utils'
import type { BatchStock } from '@/types'

const RADAR_FILTERS = [
  { key: 'EXPIRED', label: '🔴 Expired' },
  { key: 'EXPIRING_SOON', label: '🟠 Expiring ≤30d' },
  { key: 'EXPIRING_LATER', label: '🟡 Expiring ≤90d' },
  { key: 'SAFE', label: '🟢 Safe' },
]

export default function Inventory() {
  const [batches, setBatches] = useState<BatchStock[]>([])
  const [loading, setLoading] = useState(true)
  const [expiryFilter, setExpiryFilter] = useState<string | null>(null)
  const [stockFilter, setStockFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'expiry' | 'quantity' | 'name'>('expiry')

  useEffect(() => {
    api.get<BatchStock[]>('/api/inventory')
      .then(setBatches)
      .finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => {
    const c: Record<string, number> = { HEALTHY: 0, LOW: 0, CRITICAL: 0, EXPIRED: 0 }
    for (const b of batches) {
      if (b.expiry_status === 'EXPIRED') c.EXPIRED++
      else c[b.stock_status] = (c[b.stock_status] || 0) + 1
    }
    return c
  }, [batches])

  const filtered = useMemo(() => {
    let rows = [...batches]
    if (expiryFilter) rows = rows.filter(b => b.expiry_status === expiryFilter)
    if (stockFilter) rows = rows.filter(b => b.stock_status === stockFilter)
    if (sortBy === 'expiry') rows.sort((a, b) => a.days_to_expiry - b.days_to_expiry)
    if (sortBy === 'quantity') rows.sort((a, b) => b.quantity - a.quantity)
    if (sortBy === 'name') rows.sort((a, b) => a.medicine_name.localeCompare(b.medicine_name))
    return rows
  }, [batches, expiryFilter, stockFilter, sortBy])

  const total = batches.length || 1
  const healthBars = [
    { label: 'Healthy', key: 'HEALTHY', color: 'bg-emerald-500' },
    { label: 'Low', key: 'LOW', color: 'bg-amber-500' },
    { label: 'Critical', key: 'CRITICAL', color: 'bg-red-500' },
    { label: 'Expired', key: 'EXPIRED', color: 'bg-slate-500' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Inventory</h1>
        <p className="text-sm text-slate-500">Stock health and batch-level expiry tracking, powered by live data.</p>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold">Inventory Health</h2>
        {loading ? <Skeleton className="h-24 w-full" /> : (
          <div className="space-y-3">
            {healthBars.map(bar => {
              const count = counts[bar.key] || 0
              const pct = Math.round((count / total) * 100)
              const active = stockFilter === bar.key || (bar.key === 'EXPIRED' && expiryFilter === 'EXPIRED')
              return (
                <button
                  key={bar.key}
                  onClick={() => {
                    if (bar.key === 'EXPIRED') { setExpiryFilter(p => p === 'EXPIRED' ? null : 'EXPIRED'); setStockFilter(null) }
                    else { setStockFilter(p => p === bar.key ? null : bar.key); setExpiryFilter(null) }
                  }}
                  className={`w-full rounded-lg p-1.5 text-left transition-colors ${active ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                >
                  <div className="mb-1 flex justify-between text-xs font-medium">
                    <span>{bar.label}</span>
                    <span className="text-slate-400">{count} batches</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className={`h-full ${bar.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Expiry Radar</h2>
          <div className="flex flex-wrap gap-1.5">
            {RADAR_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => { setExpiryFilter(p => p === f.key ? null : f.key); setStockFilter(null) }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  expiryFilter === f.key ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-surface-dark"
            >
              <option value="expiry">Sort: Nearest expiry</option>
              <option value="quantity">Sort: Highest quantity</option>
              <option value="name">Sort: Medicine name</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No batches match this filter." description="Try a different expiry or stock filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="px-3 py-2 font-medium">Medicine</th>
                  <th className="px-3 py-2 font-medium">Batch</th>
                  <th className="px-3 py-2 font-medium">Supplier</th>
                  <th className="px-3 py-2 font-medium">Expiry</th>
                  <th className="px-3 py-2 font-medium">Qty</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(b => (
                  <tr key={b.batch_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-2.5 font-medium">{b.medicine_name}</td>
                    <td className="px-3 py-2.5 text-slate-500">{b.batch_number}</td>
                    <td className="px-3 py-2.5 text-slate-500">{b.supplier_name}</td>
                    <td className="px-3 py-2.5">{formatDate(b.expiry_date)} <span className="text-xs text-slate-400">({b.days_to_expiry}d)</span></td>
                    <td className="px-3 py-2.5">{b.quantity}</td>
                    <td className="px-3 py-2.5"><Badge tone={statusTone(b.expiry_status)}>{b.expiry_status.replace('_', ' ')}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
