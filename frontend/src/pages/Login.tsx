import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Activity } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    // TODO: wire to POST /api/auth/login once JWT auth is implemented backend-side
    setTimeout(() => { setLoading(false); navigate('/') }, 600)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-light-alt px-4 dark:bg-surface-dark">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">MEDIX</h1>
          <p className="text-sm text-slate-500">Pharmacy Operations Center</p>
          <p className="mt-1 text-xs text-slate-400">Securely manage your pharmacy, inventory and sales.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-surface-dark-alt">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
            <Input type="email" required placeholder="admin@medix.local" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Password</label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" className="pr-10" />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
        </form>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> All systems operational
        </div>
      </div>
    </div>
  )
}
