import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/services/api'
import { formatCurrency } from '@/lib/utils'
import type { CategoryPerf, TopMedicine } from '@/types'

const COLORS = ['#2749e9', '#3d68f5', '#608ffa', '#93b6fd', '#bfd4fe']

export default function Analytics() {
  const [top, setTop] = useState<TopMedicine[]>([])
  const [categories, setCategories] = useState<CategoryPerf[]>([])
  const [payments, setPayments] = useState<{ method: string; count: number; revenue: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<TopMedicine[]>('/api/analytics/top-selling?limit=8'),
      api.get<CategoryPerf[]>('/api/analytics/category-performance'),
      api.get<{ method: string; count: number; revenue: number }[]>('/api/analytics/payment-methods'),
    ]).then(([t, c, p]) => { setTop(t); setCategories(c); setPayments(p) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Analytics</h1>
        <p className="text-sm text-slate-500">Business intelligence generated from real sales data.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Top Selling Medicines</h2>
          {loading ? <Skeleton className="h-64 w-full" /> : top.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">No sales yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={top} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `${v} units`} />
                <Bar dataKey="units_sold" fill="#2749e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Category Performance</h2>
          {loading ? <Skeleton className="h-64 w-full" /> : categories.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">No sales yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="#3d68f5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold">Payment Methods</h2>
          {loading ? <Skeleton className="h-64 w-full" /> : payments.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">No sales yet.</p>
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <ResponsiveContainer width="100%" height={220} className="max-w-xs">
                <PieChart>
                  <Pie data={payments} dataKey="revenue" nameKey="method" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {payments.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {payments.map((p, i) => (
                  <div key={p.method} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="w-16 font-medium uppercase">{p.method}</span>
                    <span className="text-slate-400">{p.count} orders · {formatCurrency(p.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
