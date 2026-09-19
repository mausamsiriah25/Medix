import { cn } from '@/lib/utils'

type Tone = 'success' | 'warning' | 'critical' | 'neutral'
const tones: Record<Tone, string> = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  )
}

export function statusTone(status: string): Tone {
  if (['CRITICAL', 'EXPIRED'].includes(status)) return 'critical'
  if (['LOW', 'EXPIRING_SOON'].includes(status)) return 'warning'
  if (['HEALTHY', 'SAFE'].includes(status)) return 'success'
  return 'neutral'
}
