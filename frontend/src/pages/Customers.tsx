import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/services/api'

interface Customer { customer_id: number; name: string; phone?: string; email?: string }

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Customer[]>('/api/customers').then(setCustomers).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Customers</h1>
        <p className="text-sm text-slate-500">People who've purchased from your pharmacy.</p>
      </div>
      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : customers.length === 0 ? (
          <EmptyState title="No customers yet" />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
              <tr><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Phone</th><th className="px-4 py-3 font-medium">Email</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {customers.map(c => (
                <tr key={c.customer_id}>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-slate-500">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{c.email || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
