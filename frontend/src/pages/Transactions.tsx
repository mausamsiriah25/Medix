import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/services/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { SaleSummary } from '@/types'

export default function Transactions() {
  const [sales, setSales] = useState<SaleSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<SaleSummary[]>('/api/sales').then(setSales).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Transactions</h1>
        <p className="text-sm text-slate-500">Full sales history with invoice details.</p>
      </div>
      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : sales.length === 0 ? (
          <EmptyState title="No transactions yet" description="Completed sales will appear here." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sales.map(s => (
                <tr key={s.sale_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-medium">{s.invoice_number}</td>
                  <td className="px-4 py-3 text-slate-500">{s.customer_name}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(s.sale_date)}</td>
                  <td className="px-4 py-3 text-slate-500">{s.item_count}</td>
                  <td className="px-4 py-3 uppercase text-slate-500">{s.payment_method}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(s.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
