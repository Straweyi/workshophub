import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Loader2, Lock, LogOut } from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { ADMIN_EMAIL, supabase, supabaseReady } from '@/lib/supabase'
import { Button, Input } from '@/components/ui'
import { Logo } from '@/components/Layout'

const MAX_TRIES = 5
const LOCK_MS = 60_000

export function useAdminSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(supabaseReady)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const isAdmin = !!session && !!ADMIN_EMAIL && session.user.email?.toLowerCase() === ADMIN_EMAIL
  return { session, loading, isAdmin }
}

export async function adminLogout() { await supabase?.auth.signOut() }

function LoginScreen({ foreignAccount }: { foreignAccount: boolean }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [tries, setTries] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(0)

  useEffect(() => { if (foreignAccount) void adminLogout() }, [foreignAccount])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) return
    if (Date.now() < lockedUntil) { setError('Too many attempts. Try again in a minute.'); return }
    setBusy(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (err) {
      const n = tries + 1
      setTries(n)
      if (n >= MAX_TRIES) { setLockedUntil(Date.now() + LOCK_MS); setTries(0); setError('Too many attempts. Locked for a minute.') }
      else setError('Invalid credentials.')
    }
  }

  return (
    <div className="grid min-h-[70vh] place-items-center px-5">
      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} id="admin-login-form"
        className="w-full max-w-sm rounded-[2rem] border border-line bg-paper p-8 shadow-lift">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo />
          <div className="grid size-12 place-items-center rounded-full bg-blush text-terra-dark"><Lock className="size-5" /></div>
          <h1 className="text-2xl font-bold">Studio sign in</h1>
          <p className="text-sm text-muted">Authorized organizer only.</p>
        </div>
        {!supabaseReady && <p className="mb-4 rounded-xl bg-mustard/20 p-3 text-xs">Supabase is not configured. Fill in <code>.env</code> and restart the dev server.</p>}
        <div className="space-y-3">
          <Input id="admin-email" type="email" autoComplete="username" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input id="admin-password" type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p role="alert" className="mt-3 text-center text-sm text-terra-dark">{error}</p>}
        <Button id="admin-login-submit" type="submit" size="lg" className="mt-5 w-full" disabled={busy || !supabaseReady}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : 'Sign in'}
        </Button>
      </motion.form>
    </div>
  )
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, loading, isAdmin } = useAdminSession()
  if (loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="size-6 animate-spin text-terra" /></div>
  if (!isAdmin) return <LoginScreen foreignAccount={!!session} />
  return <>{children}</>
}

export function LogoutButton() {
  return <Button variant="outline" size="sm" id="admin-logout" onClick={() => void adminLogout()}><LogOut className="size-4" />Sign out</Button>
}
