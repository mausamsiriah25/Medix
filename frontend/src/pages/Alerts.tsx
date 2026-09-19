import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge, statusTone } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/services/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { BatchStock, Medicine } from '@/types'

export default function Alerts() {
  const [lowStock, setLowStock] = useState<BatchStock[]>([])
  const [expiring, setExpiring] = useState<BatchStock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<BatchStock[]>('/api/inventory/low-stock'),
      api.get<BatchStock[]>('/api/inventory/expiring?days=90'),
    ]).then(([l, e]) => { setLowStock(l); setExpiring(e) }).finally(() => setLoading(false))
  }, [])

  // MEDIX Insights: rule-based, derived from the same fetched data — not AI.
  const expiringSoonCount = expiring.filter(e => e.expiry_status === 'EXPIRING_SOON').length
  const exposure = expiring
    .filter(e => e.expiry_status === 'EXPIRING_SOON' || e.expiry_status === 'EXPIRED')
    .reduce((sum, e) => sum + e.quantity, 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Alerts</h1>
        <p className="text-sm text-slate-500">Rule-based insights generated from live inventory data.</p>
      </div>

      {!loading && (lowStock.length > 0 || expiringSoonCount > 0) && (
        <Card className="border-brand-100 bg-brand-50/50 p-5 dark:border-brand-900 dark:bg-brand-950/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">MEDIX Insights</p>
          <div className="mt-2 space-y-2 text-sm">
            {lowStock[0] && (
              <p><span className="font-medium">{lowStock[0].medicine_name}</span> has fallen below its reorder level. Recommended action: restock soon.</p>
            )}
            {expiringSoonCount > 0 && (
              <p><span className="font-medium">{expiringSoonCount} batch(es)</span> are expiring within 30 days, covering roughly {exposure} units of stock exposure.</p>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 font-semibold">🔴 Low / Critical Stock</h2>
          {loading ? <Skeleton className="h-40 w-full" /> : lowStock.length === 0 ? (
            <EmptyState title="Stock levels are healthy" />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {lowStock.map(b => (
                <li key={b.batch_id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{b.medicine_name}</p>
                    <p className="text-xs text-slate-400">Only {b.quantity} units remaining</p>
                  </div>
                  <Badge tone={statusTone(b.stock_status)}>{b.stock_status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold">🟠 Expiry Watchlist</h2>
          {loading ? <Skeleton className="h-40 w-full" /> : expiring.length === 0 ? (
            <EmptyState title="Nothing expiring within 90 days" />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {expiring.map(b => (
                <li key={b.batch_id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{b.medicine_name}</p>
                    <p className="text-xs text-slate-400">Batch {b.batch_number} · {formatDate(b.expiry_date)}</p>
                  </div>
                  <Badge tone={statusTone(b.expiry_status)}>{b.expiry_status.replace('_', ' ')}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
