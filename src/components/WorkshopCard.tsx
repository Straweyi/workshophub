import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui'
import { fmtDate, rupiah } from '@/lib/utils'
import { seatsLeft, useStore, waitlistCount, type Workshop } from '@/lib/store'

export function SeatBadge({ w }: { w: Workshop }) {
  const s = useStore()
  const left = seatsLeft(s, w)
  if (left === 0) return <Badge variant="dark">Full · Waitlist {waitlistCount(s, w.id)}</Badge>
  if (left <= 4) return <Badge variant="mustard">Only {left} seats left</Badge>
  return <Badge variant="sage">{left} seats open</Badge>
}

export const levelVariant = { Beginner: 'sage', Intermediate: 'mustard', Advanced: 'terra' } as const

export default function WorkshopCard({ w, index = 0 }: { w: Workshop; index?: number }) {
  const s = useStore()
  const full = seatsLeft(s, w) === 0
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      whileHover={{ y: -6 }}
      className="group overflow-hidden rounded-3xl border border-line bg-paper shadow-soft transition-shadow hover:shadow-lift"
    >
      <Link to={`/workshop/${w.slug}`} className="block" id={`card-${w.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={w.image} alt={w.title} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge className="bg-paper/90 backdrop-blur">{w.category}</Badge>
            <Badge variant={levelVariant[w.level]} className="backdrop-blur">{w.level}</Badge>
          </div>
          <div className="absolute bottom-3 right-3 rounded-2xl bg-paper px-3 py-1.5 text-center shadow-soft">
            <div className="text-[10px] font-bold uppercase tracking-widest text-terra">{fmtDate(w.date, { month: 'short' })}</div>
            <div className="font-display text-xl font-bold leading-none">{new Date(w.date + 'T00:00:00').getDate()}</div>
          </div>
        </div>
        <div className="space-y-3 p-5">
          <h3 className="text-xl font-semibold leading-snug">{w.title}</h3>
          <p className="line-clamp-2 text-sm text-muted">{w.summary}</p>
          <ul className="space-y-1.5 text-sm text-muted">
            <li className="flex items-center gap-2"><CalendarDays className="size-4 text-terra" />{fmtDate(w.date, { weekday: 'short', day: 'numeric', month: 'short' })}</li>
            <li className="flex items-center gap-2"><Clock className="size-4 text-terra" />{w.time}</li>
            <li className="flex items-center gap-2"><MapPin className="size-4 text-terra" />{w.location}, {w.city}</li>
          </ul>
          <div className="stitch" />
          <div className="flex items-center justify-between">
            <div><span className="font-display text-xl font-bold">{rupiah(w.price)}</span><span className="text-xs text-muted"> / person</span></div>
            <SeatBadge w={w} />
          </div>
          <div className={`rounded-full py-2.5 text-center text-sm font-semibold transition ${full ? 'bg-ink text-cream' : 'bg-terra text-white group-hover:bg-terra-dark'}`}>
            {full ? 'Join waitlist' : 'Reserve a seat'}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
