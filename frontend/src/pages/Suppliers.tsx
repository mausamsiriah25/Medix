import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/services/api'

interface Supplier { supplier_id: number; name: string; contact_person?: string; phone?: string; email?: string }

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Supplier[]>('/api/suppliers').then(setSuppliers).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Suppliers</h1>
        <p className="text-sm text-slate-500">Vendors supplying your medicine batches.</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full" />)}</div>
      ) : suppliers.length === 0 ? (
        <Card><EmptyState title="No suppliers yet" /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map(s => (
            <Card key={s.supplier_id} className="p-4">
              <p className="font-semibold">{s.name}</p>
              <p className="mt-1 text-sm text-slate-500">{s.contact_person}</p>
              <p className="mt-2 text-xs text-slate-400">{s.phone}</p>
              <p className="text-xs text-slate-400">{s.email}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
