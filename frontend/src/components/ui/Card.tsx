import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(
      'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-surface-dark-alt',
      className,
    )}>
      {children}
    </div>
  )
}
