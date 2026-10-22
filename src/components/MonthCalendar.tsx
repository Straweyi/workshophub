import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui'
import type { Workshop } from '@/lib/store'
import { cn } from '@/lib/utils'

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MonthCalendar({ workshops }: { workshops: Workshop[] }) {
  const nav = useNavigate()
  const first = workshops.length ? new Date(workshops.map((w) => w.date).sort()[0] + 'T00:00:00') : new Date()
  const [cursor, setCursor] = useState(new Date(first.getFullYear(), first.getMonth(), 1))
  const [dir, setDir] = useState(1)

  const y = cursor.getFullYear(), m = cursor.getMonth()
  const offset = (new Date(y, m, 1).getDay() + 6) % 7
  const days = new Date(y, m + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, i) => i - offset + 1)
  const iso = (d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const move = (n: number) => { setDir(n); setCursor(new Date(y, m + n, 1)) }

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-paper shadow-soft">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h3 className="text-2xl font-semibold">{cursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => move(-1)} aria-label="Previous month"><ChevronLeft className="size-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => move(1)} aria-label="Next month"><ChevronRight className="size-4" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-line bg-sand/50 text-center text-[11px] font-bold uppercase tracking-widest text-muted">
        {DOW.map((d) => <div key={d} className="py-2">{d}</div>)}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={y + '-' + m} initial={{ opacity: 0, x: 30 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 * dir }} transition={{ duration: 0.2 }} className="grid grid-cols-7">
          {cells.map((d, i) => {
            const inMonth = d >= 1 && d <= days
            const events = inMonth ? workshops.filter((w) => w.date === iso(d)) : []
            return (
              <div key={i} className={cn('min-h-20 border-b border-r border-line/70 p-1.5 sm:min-h-28', !inMonth && 'bg-sand/30')}>
                {inMonth && <div className="mb-1 text-xs font-semibold text-muted">{d}</div>}
                {events.map((w) => (
                  <button key={w.id} onClick={() => nav(`/workshop/${w.slug}`)} className="mb-1 block w-full cursor-pointer truncate rounded-lg bg-terra px-1.5 py-1 text-left text-[11px] font-semibold text-white transition hover:bg-terra-dark sm:text-xs" title={w.title}>
                    {w.title}
                  </button>
                ))}
              </div>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
