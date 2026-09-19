import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: string
  icon: LucideIcon
  trend?: number
  loading?: boolean
  tone?: 'default' | 'critical' | 'warning'
}

export function MetricCard({ label, value, icon: Icon, trend, loading, tone = 'default' }: Props) {
  if (loading) {
    return (
      <Card className="p-4">
        <Skeleton className="mb-3 h-4 w-24" />
        <Skeleton className="h-7 w-20" />
      </Card>
    )
  }

  const toneStyles = {
    default: 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300',
    critical: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
    warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  }[tone]

  return (
    <Card className="p-4 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={cn('rounded-lg p-2', toneStyles)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {trend !== undefined && (
        <div className={cn('mt-3 flex items-center gap-1 text-xs font-medium', trend >= 0 ? 'text-emerald-600' : 'text-red-600')}>
          {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(trend)}% vs yesterday
        </div>
      )}
    </Card>
  )
}
