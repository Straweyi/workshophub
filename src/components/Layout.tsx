import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'motion/react'
import { captureSource } from '@/lib/store'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 40 40" className="size-9" aria-hidden>
        <circle cx="20" cy="20" r="17" fill="#e8799f" />
        <path d="M6 16c8 4 20-4 28 2M5 22c9 4 21-4 30 1M8 28c8 3 17-2 24 0" stroke="#fff7f9" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M30 8c4 5 2 11-3 13" stroke="#3b2430" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
      <span className="font-display text-xl font-bold leading-none">Straweyi<span className="block text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-terra">Workshop Hub</span></span>
    </span>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0); captureSource() }, [pathname])

  const link = ({ isActive }: { isActive: boolean }) =>
    cn('rounded-full px-4 py-2 text-sm font-medium transition hover:bg-sand', isActive && 'bg-ink text-cream hover:bg-ink')

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/80 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5">
          <Link to="/" aria-label="Straweyi Workshop Hub home"><Logo /></Link>
          <nav className="flex items-center gap-1.5" aria-label="Main">
            <NavLink to="/" end className={link}>Workshops</NavLink>
            <NavLink to="/about" className={link}>About Me</NavLink>
            <NavLink to="/corporate" className={link}>Corporate & Private</NavLink>
          </nav>
        </div>
      </header>

      <motion.main key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="flex-1">
        <Outlet />
      </motion.main>

      <footer className="mt-24 border-t border-line bg-sand/50 print:hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-10 sm:flex-row sm:items-center">
          <div>
            <Logo />
            <p className="mt-2 max-w-sm text-sm text-muted">
              Modern craft workshops & bespoke brand activations. Make something beautiful with your hands.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <Link to="/" className="text-muted transition hover:text-terra">Workshops</Link>
            <Link to="/about" className="text-muted transition hover:text-terra">About Me</Link>
            <Link to="/corporate" className="text-muted transition hover:text-terra">Private & Corporate</Link>
            <Link
              to="/corporate"
              className="rounded-full bg-terra/15 px-4 py-1.5 font-semibold text-terra-dark transition hover:bg-terra hover:text-white"
            >
              Request Corporate Proposal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
