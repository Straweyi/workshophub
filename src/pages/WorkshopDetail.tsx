import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, CalendarDays, Check, Clock, Copy, MapPin, Minus, Plus, Share2, Signal, Users } from 'lucide-react'
import { Badge, Button, Card, Input, Label, Select } from '@/components/ui'
import { levelVariant, SeatBadge } from '@/components/WorkshopCard'
import { register, seatsLeft, trackView, useStore, waitlistCount, type Workshop } from '@/lib/store'
import { fmtDate, rupiah } from '@/lib/utils'

const SOURCES = ['instagram', 'whatsapp', 'campus', 'cafe-partner', 'referral']

function ShareBox({ w }: { w: Workshop }) {
  const [src, setSrc] = useState('instagram')
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/workshop/${w.slug}?src=${src}`
  const copy = async () => {
    await navigator.clipboard?.writeText(url)
    setCopied(true); setTimeout(() => setCopied(false), 1800)
  }
  const wa = `https://wa.me/?text=${encodeURIComponent(`Join me at ${w.title} – ${url}`)}`
  return (
    <Card className="p-5">
      <h3 className="flex items-center gap-2 text-lg font-semibold"><Share2 className="size-4 text-terra" />Share this workshop</h3>
      <p className="mt-1 text-xs text-muted">Links carry a campaign tag so Straweyi knows where sign-ups come from.</p>
      <div className="mt-3 flex gap-2">
        <Select aria-label="Campaign source" value={src} onChange={(e) => setSrc(e.target.value)} className="h-10 w-40">
          {SOURCES.map((s) => <option key={s}>{s}</option>)}
        </Select>
        <Input readOnly value={url} className="h-10 text-xs" aria-label="Share link" />
      </div>
      <div className="mt-3 flex gap-2">
        <Button id="copy-link" size="sm" variant="outline" onClick={copy}>{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? 'Copied' : 'Copy link'}</Button>
        <Button asChild size="sm" variant="sage"><a href={wa} target="_blank" rel="noreferrer">WhatsApp</a></Button>
      </div>
    </Card>
  )
}

function BookingCard({ w }: { w: Workshop }) {
  const s = useStore()
  const nav = useNavigate()
  const left = seatsLeft(s, w)
  const full = left === 0
  const [tickets, setTickets] = useState(1)
  const [f, setF] = useState({ name: '', email: '', phone: '' })
  const max = full ? 4 : Math.min(left, 4)
  const waitlisting = full || tickets > left

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      const r = await register({ workshopId: w.id, ...f, tickets })
      nav(`/ticket/${r.code}`)
    } catch {
      setErr('Could not complete your booking. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="p-6 lg:sticky lg:top-24">
      <div className="flex items-end justify-between">
        <div><span className="font-display text-3xl font-bold">{rupiah(w.price)}</span><span className="text-sm text-muted"> / person</span></div>
        <SeatBadge w={w} />
      </div>
      <div className="stitch my-4" />
      <form onSubmit={submit} className="space-y-4" id="booking-form">
        <div><Label htmlFor="name">Full name</Label><Input id="name" required autoComplete="name" placeholder="Your name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><Label htmlFor="email">Email</Label><Input id="email" required type="email" autoComplete="email" placeholder="you@email.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div><Label htmlFor="phone">WhatsApp number</Label><Input id="phone" required type="tel" autoComplete="tel" placeholder="08xx xxxx xxxx" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
        <div>
          <Label>Tickets</Label>
          <div className="flex h-12 items-center justify-between rounded-xl border border-line bg-paper px-2">
            <Button type="button" variant="ghost" size="icon" aria-label="Fewer tickets" onClick={() => setTickets((t) => Math.max(1, t - 1))}><Minus className="size-4" /></Button>
            <span className="font-display text-lg font-semibold" aria-live="polite">{tickets}</span>
            <Button type="button" variant="ghost" size="icon" aria-label="More tickets" onClick={() => setTickets((t) => Math.min(max, t + 1))}><Plus className="size-4" /></Button>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-sand/70 px-4 py-3 text-sm">
          <span className="text-muted">{waitlisting ? 'Waitlist is free' : 'Total'}</span>
          <span className="font-display text-xl font-bold">{waitlisting ? 'Rp0' : rupiah(w.price * tickets)}</span>
        </div>
        <Button id="submit-booking" type="submit" size="lg" className="w-full" disabled={busy} variant={waitlisting ? 'dark' : 'default'}>
          {busy ? 'Please wait…' : waitlisting ? 'Join the waitlist' : 'Reserve my seat'}
        </Button>
        {err && <p role="alert" className="text-center text-sm text-terra-dark">{err}</p>}
        <p className="text-center text-xs text-muted">{waitlisting ? "We'll email you if a seat opens up." : 'Seat is held while you complete payment by transfer.'}</p>
      </form>
    </Card>
  )
}

export default function WorkshopDetail() {
  const { slug } = useParams()
  const s = useStore()
  const w = s.workshops.find((x) => x.slug === slug)

  useEffect(() => { if (w) trackView(w.id) }, [w?.id])

  if (!w && !s.ready) return <div className="py-32 text-center text-muted">Loading…</div>
  if (!w) return <div className="mx-auto max-w-xl py-32 text-center"><h1 className="text-4xl font-semibold">Workshop not found</h1><Button asChild className="mt-6"><Link to="/">Back to workshops</Link></Button></div>

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-terra"><ArrowLeft className="size-4" />All workshops</Link>
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-[2rem] shadow-soft">
            <img src={w.image} alt={w.title} className="aspect-[16/10] w-full object-cover" />
            <div className="absolute left-4 top-4 flex gap-2"><Badge className="bg-paper/90">{w.category}</Badge><Badge variant={levelVariant[w.level]}>{w.level}</Badge></div>
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold sm:text-5xl">{w.title}</h1>
            <p className="mt-3 text-lg text-muted">{w.summary}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [CalendarDays, 'Date', fmtDate(w.date)],
              [Clock, 'Time', `${w.time} (${w.duration})`],
              [MapPin, 'Location', `${w.location}, ${w.city}`],
              [Signal, 'Level', w.level],
              [Users, 'Class size', `${w.capacity} seats · ${waitlistCount(s, w.id)} on waitlist`],
            ].map(([Icon, label, value]) => {
              const I = Icon as typeof Clock
              return (
                <div key={label as string} className="flex items-start gap-3 rounded-2xl border border-line bg-paper p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blush text-terra-dark"><I className="size-5" /></span>
                  <div><div className="text-xs font-semibold uppercase tracking-wider text-muted">{label as string}</div><div className="font-medium">{value as string}</div></div>
                </div>
              )
            })}
          </div>
          <section>
            <h2 className="text-2xl font-semibold">About this workshop</h2>
            <p className="mt-3 leading-relaxed text-muted">{w.description}</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold">What's included</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {w.includes.map((i) => <li key={i} className="flex items-center gap-3 text-sm"><span className="grid size-6 place-items-center rounded-full bg-sage/30 text-sage-dark"><Check className="size-3.5" /></span>{i}</li>)}
            </ul>
          </section>
          <ShareBox w={w} />
        </div>
        <aside><BookingCard w={w} /></aside>
      </div>
    </div>
  )
}
