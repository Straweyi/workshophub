import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Bell, Building2, CalendarDays, Check, Heart, LayoutGrid, Search, Sparkles, Ticket, QrCode } from 'lucide-react'
import { Badge, Button, Input, Select } from '@/components/ui'
import WorkshopCard from '@/components/WorkshopCard'
import MonthCalendar from '@/components/MonthCalendar'
import { CATEGORIES, LEVELS, follow, getTodayDateStr, seatsLeft, useStore, type Category } from '@/lib/store'
import { cn, fmtDate } from '@/lib/utils'

function FollowBox() {
  const [email, setEmail] = useState('')
  const [cat, setCat] = useState<Category | 'All'>('All')
  const [done, setDone] = useState(false)
  return (
    <section id="follow" className="relative overflow-hidden rounded-[1.5rem] bg-ink p-6 text-cream sm:rounded-[2rem] sm:p-12">
      <div className="absolute -right-16 -top-16 size-64 rounded-full bg-terra/40 blur-3xl" />
      <div className="relative grid items-center gap-8 md:grid-cols-2">
        <div>
          <Badge variant="terra" className="mb-4"><Bell className="size-3" /> Workshop reminders</Badge>
          <h2 className="text-3xl font-semibold sm:text-4xl">Never miss a new date again.</h2>
          <p className="mt-3 text-cream/70">Follow a category and we'll email you when a workshop is published, a reminder before it starts, and when a booking is waiting for payment.</p>
        </div>
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 rounded-2xl bg-cream/10 p-6">
              <span className="grid size-10 place-items-center rounded-full bg-sage text-ink"><Check className="size-5" /></span>
              <p className="font-medium">You're in! We'll keep you posted at {email}.</p>
            </motion.div>
          ) : (
            <motion.form key="f" exit={{ opacity: 0 }} onSubmit={(e) => { e.preventDefault(); follow(email, cat).then(() => setDone(true)).catch(() => alert('Could not subscribe right now. Please try again.')) }} className="space-y-3">
              <Input id="follow-email" required type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="border-cream/20 bg-cream/10 text-cream placeholder:text-cream/50" />
              <Select id="follow-category" value={cat} onChange={(e) => setCat(e.target.value as Category | 'All')} className="border-cream/20 bg-cream/10 text-cream [&>option]:text-ink">
                <option value="All">All workshops</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
              <Button id="follow-submit" type="submit" className="w-full">Follow</Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

const TESTIMONIALS = [
  { name: 'Alya Putri', category: 'Crochet', quote: 'Bawa pulang tas rajutan buatan sendiri! Instrukturnya sabar banget dan suasananya bikin semangat belajar.', avatar: 'AP' },
  { name: 'Nadia Sari', category: 'Amigurumi', quote: 'Workshop Amigurumi terbaik yang pernah aku ikuti. Dalam 4 jam sudah jadi boneka yang lucu banget!', avatar: 'NS' },
  { name: 'Raka Pratama', category: 'Macramé', quote: 'Awalnya ragu, tapi ternyata seru banget. Sekarang dinding kamarku punya hiasan macramé buatan sendiri.', avatar: 'RP' },
  { name: 'Citra Dewi', category: 'Knitting', quote: 'Proses booking cepat dan mudah, langsung dapat tiket QR. Workshop-nya intimate dan bahan-bahannya berkualitas.', avatar: 'CD' },
]

function Testimonials() {
  return (
    <section aria-labelledby="testimonials-heading">
      <div className="mb-8 text-center">
        <Badge variant="terra" className="mb-3"><Heart className="size-3" /> Kata mereka</Badge>
        <h2 id="testimonials-heading" className="text-3xl font-semibold sm:text-4xl">Peserta bicara.</h2>
        <p className="mt-2 text-muted">Lebih dari 200 karya sudah lahir dari tangan-tangan peserta Straweyi.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="relative rounded-3xl border border-line bg-paper p-6 shadow-soft"
          >
            <div className="absolute -top-3 left-6 text-4xl leading-none text-terra/30 select-none font-display">&ldquo;</div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.quote}</p>
            <div className="mt-5 flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blush font-display text-sm font-bold text-terra-dark">{t.avatar}</span>
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted">{t.category} workshop</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  const s = useStore()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<Category | 'All'>('All')
  const [level, setLevel] = useState('')
  const [city, setCity] = useState('')
  const [price, setPrice] = useState('')
  const [month, setMonth] = useState('')
  const [view, setView] = useState<'cards' | 'calendar'>('cards')
  const [onlyOpen, setOnlyOpen] = useState(false)

  const todayStr = getTodayDateStr()
  const published = s.workshops.filter((w) => w.published && w.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date))
  const cities = [...new Set(published.map((w) => w.city))]
  const months = [...new Set(published.map((w) => w.date.slice(0, 7)))]

  // Closest upcoming workshop from server data (or first available)
  const nextWorkshop = published.find((w) => w.date >= todayStr) ?? published[0]

  const nextDateFormatted = useMemo(() => {
    if (!nextWorkshop?.date) return 'Soon'
    return fmtDate(nextWorkshop.date, { day: 'numeric', month: 'short' })
  }, [nextWorkshop?.date])

  const list = useMemo(() => published.filter((w) =>
    (cat === 'All' || w.category === cat) &&
    (!level || w.level === level) &&
    (!city || w.city === city) &&
    (!month || w.date.startsWith(month)) &&
    (!price || w.price <= Number(price)) &&
    (!onlyOpen || seatsLeft(s, w) > 0) &&
    (!q || (w.title + w.summary + w.location).toLowerCase().includes(q.toLowerCase())),
  ), [published, cat, level, city, month, price, onlyOpen, q, s])

  const reset = () => { setQ(''); setCat('All'); setLevel(''); setCity(''); setPrice(''); setMonth(''); setOnlyOpen(false) }

  return (
    <>
      <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-8 sm:px-5 sm:pb-16 md:grid-cols-[1.1fr_1fr] md:gap-12 md:pt-20">
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="terra" className="mb-5"><Sparkles className="size-3" /> Registration open · Nov–Dec 2026</Badge>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
            Make something <em className="text-terra not-italic">beautiful</em> with your hands.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mt-5 max-w-lg text-base text-muted sm:mt-6 sm:text-lg">
            Browse every upcoming Straweyi workshop, see price, place and seats left, then book in under a minute. No account, no DM.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg"><a href="#workshops" id="hero-cta">Browse workshops</a></Button>
            <Button asChild size="lg" variant="outline"><a href="#follow">Get reminders</a></Button>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <li className="flex items-center gap-2"><Check className="size-4 text-sage-dark" />No account needed</li>
            <li className="flex items-center gap-2"><QrCode className="size-4 text-sage-dark" />QR ticket</li>
            <li className="flex items-center gap-2"><Ticket className="size-4 text-sage-dark" />Live seat count</li>
          </motion.ul>
        </div>
        <div className="relative mx-auto h-[20rem] w-full max-w-md sm:h-[26rem]">
          <motion.img initial={{ opacity: 0, scale: 0.9, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: -4 }} transition={{ delay: 0.2, type: 'spring' }} src="/img/crochet-bag.jpg" alt="Crocheting a striped tote bag" className="absolute left-0 top-0 h-48 w-44 rounded-[1.5rem] border-4 border-paper object-cover shadow-lift sm:h-64 sm:w-60 sm:rounded-[2rem]" />
          <motion.img initial={{ opacity: 0, scale: 0.9, rotate: 8 }} animate={{ opacity: 1, scale: 1, rotate: 5 }} transition={{ delay: 0.35, type: 'spring' }} src="/img/amigurumi.jpg" alt="Amigurumi bear and bunny" className="floaty absolute right-0 top-12 h-44 w-40 rounded-[1.5rem] border-4 border-paper object-cover shadow-lift sm:top-16 sm:h-60 sm:w-52 sm:rounded-[2rem]" />
          <motion.img initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} src="/img/macrame.jpg" alt="Macramé workshop" className="absolute bottom-0 left-6 h-36 w-48 rounded-[1.5rem] border-4 border-paper object-cover shadow-lift sm:left-12 sm:h-48 sm:w-64 sm:rounded-[2rem]" />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="absolute bottom-4 right-1 grid size-20 rotate-12 place-items-center rounded-full bg-mustard text-center font-display text-xs font-bold leading-tight text-ink shadow-lift sm:bottom-6 sm:right-2 sm:size-24 sm:text-sm"
          >
            Next<br />workshop<br />{nextDateFormatted}
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 sm:space-y-20 sm:px-5">
        <section id="workshops" className="scroll-mt-24">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold sm:text-4xl">Upcoming workshops</h2>
              <p className="mt-1 text-muted">{list.length} of {published.length} workshops</p>
            </div>
            <div className="flex rounded-full border border-line bg-paper p-1" role="tablist">
              {([['cards', 'Cards', LayoutGrid], ['calendar', 'Calendar', CalendarDays]] as const).map(([k, label, Icon]) => (
                <button key={k} id={`view-${k}`} role="tab" aria-selected={view === k} onClick={() => setView(k)} className={cn('flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition', view === k ? 'bg-ink text-cream' : 'text-muted hover:text-ink')}>
                  <Icon className="size-4" />{label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8 space-y-4 rounded-3xl border border-line bg-paper p-4 shadow-soft">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input id="search" aria-label="Search workshops" placeholder="Search workshops, places…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-11" />
            </div>
            <div className="flex flex-wrap gap-2">
              {(['All', ...CATEGORIES] as const).map((c) => (
                <button key={c} id={`cat-${c}`} onClick={() => setCat(c)} className={cn('cursor-pointer rounded-full border px-4 py-1.5 text-sm font-semibold transition', cat === c ? 'border-terra bg-terra text-white' : 'border-line hover:bg-sand')}>{c}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <Select aria-label="Month" value={month} onChange={(e) => setMonth(e.target.value)}>
                <option value="">Any date</option>
                {months.map((m) => <option key={m} value={m}>{new Date(m + '-01T00:00:00').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</option>)}
              </Select>
              <Select aria-label="City" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">Any city</option>
                {cities.map((c) => <option key={c}>{c}</option>)}
              </Select>
              <Select aria-label="Level" value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="">Any level</option>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </Select>
              <Select aria-label="Max price" value={price} onChange={(e) => setPrice(e.target.value)}>
                <option value="">Any price</option>
                <option value="150000">Up to Rp150.000</option>
                <option value="200000">Up to Rp200.000</option>
                <option value="250000">Up to Rp250.000</option>
              </Select>
              <label className="col-span-2 flex h-12 cursor-pointer items-center gap-2 rounded-xl border border-line px-4 text-sm md:col-span-1">
                <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} className="size-4 accent-[#e8799f]" /> Seats available
              </label>
            </div>
          </div>

          {view === 'calendar' ? (
            <MonthCalendar workshops={list} />
          ) : !s.ready ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-3xl border border-line bg-paper shadow-soft">
                  <div className="aspect-[4/3] bg-sand" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 rounded-full bg-sand" />
                    <div className="h-4 w-full rounded-full bg-sand" />
                    <div className="h-4 w-2/3 rounded-full bg-sand" />
                    <div className="mt-4 h-10 rounded-2xl bg-sand" />
                  </div>
                </div>
              ))}
            </div>
          ) : list.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((w, i) => <WorkshopCard key={w.id} w={w} index={i} />)}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-line py-20 text-center">
              <p className="font-display text-2xl">No workshops match yet.</p>
              <p className="mt-1 text-muted">Try loosening a filter, or follow a category to be notified.</p>
              <Button variant="outline" className="mt-5" onClick={reset}>Clear filters</Button>
            </div>
          )}
        </section>

        <section aria-labelledby="how" className="grid gap-6 md:grid-cols-3">
          <h2 id="how" className="sr-only">How it works</h2>
          {[
            ['1', 'Pick a workshop', 'Filter by date, city, level and budget. Every card shows live seat availability.'],
            ['2', 'Reserve in a minute', 'Name, contact and ticket count. Pay by transfer, no account needed.'],
            ['3', 'Show your QR', 'Get a ticket with a QR code and check in instantly on the day.'],
          ].map(([n, t, d], i) => (
            <motion.div key={n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-3xl border border-line bg-paper p-7 shadow-soft">
              <span className="grid size-11 place-items-center rounded-full bg-blush font-display text-xl font-bold text-terra-dark">{n}</span>
              <h3 className="mt-4 text-xl font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted">{d}</p>
            </motion.div>
          ))}
        </section>

        <Testimonials />

        {/* Corporate & Private B2B Teaser Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-paper via-sand/30 to-blush/40 p-6 shadow-soft sm:p-12">
          <div className="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <Badge variant="terra" className="mb-3">
                <Building2 className="mr-1.5 size-3.5" /> Private & Corporate Booking
              </Badge>
              <h3 className="text-2xl font-bold sm:text-3xl text-ink">
                Ingin Mengadakan Workshop Eksklusif untuk Kantor atau Komunitas Anda?
              </h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                Dipercaya oleh 170+ brand ternama (BCA, Shopee, TikTok, Bank Mandiri, US Embassy). Lengkap dengan instruktur berpengalaman, materi premium, dan live price simulator instan.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg" className="h-auto w-full whitespace-normal bg-terra py-3.5 text-center text-white shadow-soft hover:bg-terra-dark sm:w-auto">
                  <Link to="/corporate">
                    Simulasi Biaya & Dapatkan Penawaran Resmi
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-auto w-full whitespace-normal py-3.5 text-center sm:w-auto">
                  <Link to="/about">
                    Lihat 170+ Portofolio Kolaborasi
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-sm rounded-2xl border border-line/80 bg-paper p-5 shadow-soft space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-line pb-2.5">
                <span className="font-bold text-ink">Keunggulan B2B Straweyi:</span>
                <span className="text-terra font-semibold">10 - 200+ Pax</span>
              </div>
              <ul className="space-y-2 text-muted">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-sage-dark shrink-0" /> Alat & bahan 100% dibawa pulang peserta
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-sage-dark shrink-0" /> Custom branding box logo & souvenir tag
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-sage-dark shrink-0" /> Rasio intensif 1 instruktur per 8 peserta
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-sage-dark shrink-0" /> On-site di kantor/venue Anda atau studio kami
                </li>
              </ul>
            </div>
          </div>
        </section>

        <FollowBox />
      </div>
    </>
  )
}
