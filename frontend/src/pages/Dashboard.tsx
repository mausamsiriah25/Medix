import { useEffect, useState } from 'react'
import { IndianRupee, Pill, AlertTriangle, CalendarClock, Receipt, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card } from '@/components/ui/Card'
import { Badge, statusTone } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { api } from '@/services/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { BatchStock, Medicine, RevenuePoint, TopMedicine } from '@/types'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<{ today_transactions: number; today_revenue: number; average_order_value: number } | null>(null)
  const [revenue, setRevenue] = useState<RevenuePoint[]>([])
  const [topMedicines, setTopMedicines] = useState<TopMedicine[]>([])
  const [lowStock, setLowStock] = useState<Medicine[]>([])
  const [expiring, setExpiring] = useState<BatchStock[]>([])
  const [medicineCount, setMedicineCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [s, r, t, meds, exp] = await Promise.all([
          api.get<typeof summary>('/api/analytics/summary'),
          api.get<RevenuePoint[]>('/api/analytics/revenue?days=14'),
          api.get<TopMedicine[]>('/api/analytics/top-selling?limit=5'),
          api.get<Medicine[]>('/api/medicines'),
          api.get<BatchStock[]>('/api/inventory/expiring?days=30'),
        ])
        if (cancelled) return
        setSummary(s)
        setRevenue(r)
        setTopMedicines(t)
        setMedicineCount(meds.length)
        setLowStock(meds.filter(m => m.stock_status !== 'HEALTHY').slice(0, 5))
        setExpiring(exp.slice(0, 5))
      } catch (e) {
        if (!cancelled) setError('Could not reach the MEDIX API. Is the backend running on the configured URL?')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (error) {
    return (
      <Card className="p-8 text-center text-sm text-slate-500">
        {error}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Good morning, Pharmacist 👋</h1>
        <p className="text-sm text-slate-500">Here's your pharmacy overview for today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Today's Sales" value={summary ? formatCurrency(summary.today_revenue) : '—'} icon={IndianRupee} loading={loading} />
        <MetricCard label="Total Medicines" value={medicineCount !== null ? String(medicineCount) : '—'} icon={Pill} loading={loading} />
        <MetricCard label="Low Stock" value={String(lowStock.length)} icon={AlertTriangle} loading={loading} tone={lowStock.length ? 'warning' : 'default'} />
        <MetricCard label="Expiring Soon" value={String(expiring.length)} icon={CalendarClock} loading={loading} tone={expiring.length ? 'critical' : 'default'} />
        <MetricCard label="Transactions Today" value={summary ? String(summary.today_transactions) : '—'} icon={Receipt} loading={loading} />
        <MetricCard label="Avg. Order Value" value={summary ? formatCurrency(summary.average_order_value) : '—'} icon={TrendingUp} loading={loading} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Pharmacy Pulse</h2>
            <span className="text-xs text-slate-400">Last 14 days</span>
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : revenue.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">No sales recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => formatDate(d).split(' ').slice(0, 2).join(' ')} />
                <YAxis tick={{ fontSize: 11 }} width={40} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} labelFormatter={d => formatDate(d as string)} />
                <Line type="monotone" dataKey="revenue" stroke="#2749e9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Top Selling Medicines</h2>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : topMedicines.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No sales data yet.</p>
          ) : (
            <ol className="space-y-3">
              {topMedicines.map((m, i) => (
                <li key={m.medicine_id} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.units_sold} units sold</p>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(m.revenue)}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Live Inventory Alerts</h2>
            <button onClick={() => navigate('/inventory')} className="text-xs font-medium text-brand-600 hover:underline">View all</button>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : lowStock.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">All stock levels are healthy.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {lowStock.map(m => (
                <li key={m.medicine_id} onClick={() => navigate('/medicines')} className="flex cursor-pointer items-center justify-between gap-2 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-slate-400">Only {m.total_quantity} units remaining</p>
                  </div>
                  <Badge tone={statusTone(m.stock_status)}>{m.stock_status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Expiry Radar</h2>
            <button onClick={() => navigate('/inventory')} className="text-xs font-medium text-brand-600 hover:underline">View all</button>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : expiring.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Nothing expiring in the next 30 days.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {expiring.map(b => (
                <li key={b.batch_id} onClick={() => navigate('/inventory')} className="flex cursor-pointer items-center justify-between gap-2 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div>
                    <p className="text-sm font-medium">{b.medicine_name}</p>
                    <p className="text-xs text-slate-400">Batch {b.batch_number} · {formatDate(b.expiry_date)}</p>
                  </div>
                  <Badge tone={statusTone(b.expiry_status)}>{b.days_to_expiry <= 0 ? 'EXPIRED' : `${b.days_to_expiry}d left`}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
