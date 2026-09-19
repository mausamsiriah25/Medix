import { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
        <Inbox className="h-6 w-6 text-slate-400" />
      </div>
      <p className="font-medium text-slate-700 dark:text-slate-200">{title}</p>
      {description && <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action}
    </div>
  )
}
