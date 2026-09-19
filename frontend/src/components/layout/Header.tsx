import { Moon, Sun, Search, Menu } from 'lucide-react'
import { useTheme } from '@/lib/theme'

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { theme, toggle } = useTheme()
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-surface-dark-alt/80 md:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900 sm:flex">
          <Search className="h-4 w-4" />
          <span>Search MEDIX...</span>
          <kbd className="ml-4 rounded border border-slate-300 px-1.5 py-0.5 text-[10px] dark:border-slate-600">Ctrl K</kbd>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={toggle} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Toggle theme">
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
          PH
        </div>
      </div>
    </header>
  )
}
