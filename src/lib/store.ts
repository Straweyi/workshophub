import { useSyncExternalStore } from 'react'
import { supabase } from '@/lib/supabase'

export type Level = 'Beginner' | 'Intermediate' | 'Advanced'
export type Category = 'Crochet' | 'Knitting' | 'Amigurumi' | 'Macrame'
export type RegStatus = 'pending' | 'paid' | 'waitlist' | 'offered' | 'cancelled'

export interface Workshop {
  id: string
  slug: string
  title: string
  category: Category
  level: Level
  date: string // YYYY-MM-DD
  time: string
  duration: string
  location: string
  city: string
  price: number
  capacity: number
  image: string
  summary: string
  description: string
  includes: string[]
  published: boolean
}

export interface Registration {
  id: string
  code: string
  workshopId: string
  name: string
  email: string
  phone: string
  tickets: number
  total: number
  status: RegStatus
  source: string
  createdAt: string
  checkedIn: boolean
}

export interface Follow {
  email: string
  category: Category | 'All'
  createdAt: string
}

export interface PageView {
  workshopId: string
  source: string
  ts: string
}

export interface MailLog {
  id: string
  to: string
  subject: string
  ts: string
}

export type CorporateStatus = 'new' | 'contacted' | 'quoted' | 'deal' | 'completed'

export interface CorporateRequest {
  id: string
  companyName: string
  picName: string
  email: string
  phone: string
  eventType: string
  craftCategory: string
  participants: number
  locationType: string
  locationCity: string
  targetDate: string
  addons: string[]
  estimatedTotal: number
  costPerPax: number
  notes: string
  status: CorporateStatus
  createdAt: string
}

export type Seats = Record<string, { taken: number; waitlist: number }>

interface State {
  workshops: Workshop[]
  registrations: Registration[]
  follows: Follow[]
  views: PageView[]
  mails: MailLog[]
  corporateRequests: CorporateRequest[]
  /** seats taken / waitlisted per workshop id (public-safe, no personal data) */
  seats: Seats
  /** false until the first load from the database finished */
  ready: boolean
}

type Base = Omit<State, 'seats' | 'ready'>

const KEY = 'straweyi-hub-v1'

export const CATEGORIES: Category[] = ['Crochet', 'Knitting', 'Amigurumi', 'Macrame']
export const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced']

const uid = () => Math.random().toString(36).slice(2, 9)
const code = () => 'SW-' + Math.random().toString(36).slice(2, 8).toUpperCase()

function seed(): Base {
  const workshops: Workshop[] = [
    {
      id: 'w1', slug: 'make-your-own-crochet-bag', title: 'Make Your Own Crochet Bag', category: 'Crochet', level: 'Beginner',
      date: '2026-11-07', time: '10:00 â€“ 14:00', duration: '4 hours', location: 'Kafe Bumi, Dago', city: 'Bandung', price: 175000, capacity: 16,
      image: '/img/crochet-bag.jpg',
      summary: 'Learn the basic stitches and walk home with your very own striped tote.',
      description: 'No experience needed. In four relaxed hours you will learn the foundation chain, single crochet and how to shape a sturdy tote. Our instructors guide you stitch by stitch while you sip something warm.',
      includes: ['All cotton yarn & hooks', 'Pattern card to keep', 'Drink & light snack', 'Finished tote bag'], published: true,
    },
    {
      id: 'w2', slug: 'amigurumi-bunny-and-bear', title: 'Amigurumi: Bunny & Bear', category: 'Amigurumi', level: 'Intermediate',
      date: '2026-11-14', time: '13:00 â€“ 17:00', duration: '4 hours', location: 'Studio Straweyi', city: 'Bandung', price: 225000, capacity: 12,
      image: '/img/amigurumi.jpg',
      summary: 'Crochet a tiny friend from scratch, from magic ring to stitched-on smile.',
      description: 'Magic ring, increases and decreases, stuffing and assembly. Choose bunny or bear and personalise it with a scarf or bow.',
      includes: ['Yarn, safety eyes & stuffing', 'Step-by-step pattern', 'Tea & cookies'], published: true,
    },
    {
      id: 'w3', slug: 'knit-your-first-scarf', title: 'Knit Your First Scarf', category: 'Knitting', level: 'Beginner',
      date: '2026-11-21', time: '10:00 â€“ 13:00', duration: '3 hours', location: 'Ruang Kolektif', city: 'Jakarta', price: 150000, capacity: 14,
      image: '/img/knitting.jpg',
      summary: 'Cast on, knit, purl and bind off in a friendly cafÃ© session.',
      description: 'A slow, social introduction to knitting. You will start a soft scarf and leave knowing everything needed to finish it at home.',
      includes: ['Needles & merino blend yarn', 'Tutorial booklet', 'Coffee or tea'], published: true,
    },
    {
      id: 'w4', slug: 'macrame-wall-hanging', title: 'MacramÃ© Wall Hanging', category: 'Macrame', level: 'Beginner',
      date: '2026-11-28', time: '14:00 â€“ 17:00', duration: '3 hours', location: 'Kafe Bumi, Dago', city: 'Bandung', price: 195000, capacity: 10,
      image: '/img/macrame.jpg',
      summary: 'Tie square knots and spirals into a boho wall piece for your home.',
      description: 'Learn five foundational macramÃ© knots and combine them into a hanging with fringe. Perfect for gifting or decorating your space.',
      includes: ['Cotton rope & wooden dowel', 'Knot guide', 'Snacks'], published: true,
    },
    {
      id: 'w5', slug: 'advanced-granny-square-cardigan', title: 'Granny Square Cardigan Lab', category: 'Crochet', level: 'Advanced',
      date: '2026-12-05', time: '10:00 â€“ 16:00', duration: '6 hours', location: 'Studio Straweyi', city: 'Bandung', price: 350000, capacity: 8,
      image: '/img/crochet-bag.jpg',
      summary: 'Join motifs, size your pattern and start a wearable cardigan.',
      description: 'For crocheters comfortable with granny squares. We cover colour planning, joining techniques and customizing size.',
      includes: ['Premium yarn bundle', 'Pattern workbook', 'Lunch'], published: true,
    },
    {
      id: 'w6', slug: 'cozy-knit-hat-evening', title: 'Cozy Knit Hat Evening', category: 'Knitting', level: 'Intermediate',
      date: '2026-12-12', time: '18:30 â€“ 21:30', duration: '3 hours', location: 'Ruang Kolektif', city: 'Jakarta', price: 165000, capacity: 12,
      image: '/img/knitting.jpg',
      summary: 'An after-work evening knitting in the round.',
      description: 'Learn circular needles, decreasing for the crown and adding a pom-pom.',
      includes: ['Circular needles & yarn', 'Pom-pom maker', 'Dinner snacks'], published: true,
    },
  ]

  const names = ['Alya Putri', 'Raka Pratama', 'Nadia Sari', 'Dimas Aditya', 'Salsa Maharani', 'Bima Nugraha', 'Citra Dewi', 'Farhan Hakim', 'Intan Permata', 'Yoga Wijaya', 'Maya Anggraini', 'Reza Fauzi']
  const sources = ['instagram', 'instagram', 'instagram', 'whatsapp', 'referral', 'campus', 'direct', 'cafe-partner']
  const plan: Record<string, number> = { w1: 12, w2: 12, w3: 6, w4: 4, w5: 2, w6: 1 }
  const registrations: Registration[] = []
  let n = 0
  for (const w of workshops) {
    const count = plan[w.id]
    let seats = 0
    let i = 0
    while (seats < count) {
      const t = 1 + (i % 7 === 0 ? 1 : 0)
      const q = Math.min(t, count - seats)
      const nm = names[n % names.length]
      registrations.push({
        id: uid(), code: code(), workshopId: w.id, name: nm,
        email: nm.split(' ')[0].toLowerCase() + n + '@mail.com', phone: '08123' + (400000 + n * 137),
        tickets: q, total: q * w.price, status: n % 5 === 4 ? 'pending' : 'paid',
        source: sources[n % sources.length], createdAt: new Date(2026, 9, 1 + (n % 14)).toISOString(), checkedIn: false,
      })
      seats += q; i++; n++
    }
  }
  // two people on waitlist for the full workshop
  registrations.push(
    { id: uid(), code: code(), workshopId: 'w1', name: 'Kirana Lestari', email: 'kirana@mail.com', phone: '081299900011', tickets: 1, total: 0, status: 'waitlist', source: 'instagram', createdAt: new Date(2026, 9, 14).toISOString(), checkedIn: false },
    { id: uid(), code: code(), workshopId: 'w1', name: 'Hendra Saputra', email: 'hendra@mail.com', phone: '081299900022', tickets: 2, total: 0, status: 'waitlist', source: 'whatsapp', createdAt: new Date(2026, 9, 15).toISOString(), checkedIn: false },
  )

  const views: PageView[] = []
  const vw: Record<string, number> = { w1: 140, w2: 96, w3: 70, w4: 48, w5: 30, w6: 22 }
  for (const w of workshops)
    for (let i = 0; i < vw[w.id]; i++)
      views.push({ workshopId: w.id, source: sources[(i * 3 + 1) % sources.length], ts: new Date(2026, 9, 1 + (i % 15)).toISOString() })

  const corporateRequests: CorporateRequest[] = [
    {
      id: 'CR-SHOPEE01',
      companyName: 'PT Shopee International Indonesia',
      picName: 'Amanda Clarissa',
      email: 'amanda.c@shopee.co.id',
      phone: '08119876543',
      eventType: 'Brand Activation & PR Gathering',
      craftCategory: 'Crochet Bag',
      participants: 45,
      locationType: 'Client Office / Venue',
      locationCity: 'Jakarta Selatan',
      targetDate: '2026-11-20',
      addons: ['Custom Box Branding', 'Photo & Video Documentation'],
      estimatedTotal: 8900000,
      costPerPax: 197000,
      notes: 'Mohon siapkan yarn bernuansa oranye khas Shopee untuk 45 influencer & media.',
      status: 'quoted',
      createdAt: new Date(2026, 9, 12).toISOString(),
    },
    {
      id: 'CR-BCA02',
      companyName: 'BCA Digital (blu by BCA)',
      picName: 'Rian Pratama',
      email: 'rian.pratama@bcadigital.co.id',
      phone: '081287654321',
      eventType: 'Corporate Team Building & Wellness',
      craftCategory: 'Macramé Wall Hanging',
      participants: 30,
      locationType: 'Straweyi Studio',
      locationCity: 'Bandung',
      targetDate: '2026-11-27',
      addons: ['Artisan Coffee & Pastry', 'Laser-cut Wooden Tag'],
      estimatedTotal: 6200000,
      costPerPax: 206000,
      notes: 'Sesi santai Jumat sore untuk tim product design & engineer.',
      status: 'new',
      createdAt: new Date(2026, 9, 16).toISOString(),
    },
  ]

  return { workshops, registrations, follows: [], views, mails: [], corporateRequests }
}

const remote = supabase !== null

const CORP_STORAGE_KEY = 'straweyi_corporate_leads_v2'

export function getStoredCorporateRequests(): CorporateRequest[] {
  try {
    const raw = localStorage.getItem(CORP_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.warn('Failed to read corporate leads storage:', e)
  }
  // Fallback to initial seed if empty
  return seed().corporateRequests || []
}

export function saveStoredCorporateRequests(list: CorporateRequest[]) {
  try {
    localStorage.setItem(CORP_STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.warn('Failed to save corporate leads storage:', e)
  }
}

const emptyBase: Base = {
  workshops: [],
  registrations: [],
  follows: [],
  views: [],
  mails: [],
  corporateRequests: getStoredCorporateRequests(),
}

function computeSeats(b: Base): Seats {
  const out: Seats = {}
  for (const w of b.workshops) out[w.id] = { taken: 0, waitlist: 0 }
  for (const r of b.registrations) {
    const x = (out[r.workshopId] ??= { taken: 0, waitlist: 0 })
    if (r.status === 'paid' || r.status === 'pending' || r.status === 'offered') x.taken += r.tickets
    else if (r.status === 'waitlist') x.waitlist += 1
  }
  return out
}

export const getTodayDateStr = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function cleanExpired(b: Base): Base {
  const today = getTodayDateStr()
  const activeWorkshops = (b.workshops || []).filter((w) => w.date >= today)
  const validIds = new Set(activeWorkshops.map((w) => w.id))
  return {
    ...b,
    workshops: activeWorkshops,
    registrations: (b.registrations || []).filter((r) => validIds.has(r.workshopId)),
    views: (b.views || []).filter((v) => validIds.has(v.workshopId)),
    corporateRequests: b.corporateRequests?.length ? b.corporateRequests : getStoredCorporateRequests(),
  }
}

function load(): Base {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Base
      const cleaned = cleanExpired(parsed)
      if (cleaned.workshops.length !== (parsed.workshops || []).length) {
        try { localStorage.setItem(KEY, JSON.stringify(cleaned)) } catch { /* ignore */ }
      }
      return cleaned
    }
  } catch { /* ignore */ }
  const seeded = seed()
  return cleanExpired(seeded)
}

const initialCorporateRequests = getStoredCorporateRequests()

let state: State = remote
  ? { ...emptyBase, corporateRequests: initialCorporateRequests, seats: {}, ready: false }
  : (() => {
      const b = load()
      const corp = b.corporateRequests?.length ? b.corporateRequests : initialCorporateRequests
      return { ...b, corporateRequests: corp, seats: computeSeats(b), ready: true }
    })()
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

/** local (demo) mode only: persist to the browser */
function commit(next: Base) {
  const cleaned = cleanExpired(next)
  state = { ...cleaned, seats: computeSeats(cleaned), ready: true }
  const base: Base = {
    workshops: cleaned.workshops,
    registrations: cleaned.registrations,
    follows: cleaned.follows,
    views: cleaned.views,
    mails: cleaned.mails,
    corporateRequests: cleaned.corporateRequests || [],
  }
  try { localStorage.setItem(KEY, JSON.stringify(base)) } catch { /* ignore */ }
  if (base.corporateRequests) {
    saveStoredCorporateRequests(base.corporateRequests)
  }
  notify()
}

/** remote mode: patch in-memory state */
function patch(p: Partial<State>) {
  state = { ...state, ...p }
  if (p.corporateRequests) {
    saveStoredCorporateRequests(p.corporateRequests)
  }
  notify()
}

export function useStore(): State {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => state,
  )
}

export function resetDemo() {
  if (remote) return
  commit(seed())
}

// ---------- selectors ----------
export const seatsTaken = (s: State, id: string) => s.seats[id]?.taken ?? 0
export const seatsLeft = (s: State, w: Workshop) => Math.max(0, w.capacity - seatsTaken(s, w.id))
export const waitlistCount = (s: State, id: string) => s.seats[id]?.waitlist ?? 0

// ---------- source tracking ----------
export function captureSource(): string {
  const p = new URLSearchParams(window.location.search)
  const found = p.get('src') || p.get('ref') || p.get('utm_source')
  if (found) sessionStorage.setItem('swh-src', found.toLowerCase())
  return sessionStorage.getItem('swh-src') || 'direct'
}

// ---------- database (Supabase) mapping ----------
interface RegRow {
  id: string; code: string; workshop_id: string; name: string; email: string; phone: string
  tickets: number; total: number; status: RegStatus; source: string; checked_in: boolean; created_at: string
}
const toReg = (r: RegRow): Registration => ({
  id: r.id, code: r.code, workshopId: r.workshop_id, name: r.name, email: r.email, phone: r.phone,
  tickets: r.tickets, total: r.total, status: r.status, source: r.source, checkedIn: r.checked_in, createdAt: r.created_at,
})

/** Public data: published workshops + seat counts. Safe for any visitor. */
export async function loadPublic() {
  if (!supabase) return
  try {
    const today = getTodayDateStr()
    // Trigger purge in DB if RPC exists
    try {
      await supabase.rpc('purge_expired_workshops')
    } catch {
      // Ignore if function not yet defined in Supabase
    }
    const [w, seats] = await Promise.all([
      supabase.from('workshops').select('*').gte('date', today).order('date', { ascending: true }),
      supabase.rpc('workshop_seats'),
    ])
    if (w.error) throw w.error
    const merged: Seats = { ...state.seats }
    for (const x of (seats.data ?? []) as { workshop_id: string; taken: number; waitlist: number }[])
      merged[x.workshop_id] = { taken: x.taken, waitlist: x.waitlist }
    const activeWorkshops = ((w.data ?? []) as Workshop[]).filter((item) => item.date >= today)
    patch({ workshops: activeWorkshops, seats: merged, ready: true })
  } catch (e) {
    console.error('loadPublic failed', e)
    patch({ ready: true })
  }
}

/** Admin data: registrations, follows, views, outbox. RLS returns nothing for non-admins. */
export async function loadAdmin() {
  if (!supabase) return
  try {
    const today = getTodayDateStr()
    // Auto-delete workshops that have already passed from database
    try {
      await supabase.rpc('purge_expired_workshops')
      await supabase.from('workshops').delete().lt('date', today)
    } catch {
      // Ignore if RLS or function not present
    }

    const [w, r, f, v, m] = await Promise.all([
      supabase.from('workshops').select('*').gte('date', today).order('date', { ascending: true }),
      supabase.from('registrations').select('*').order('created_at', { ascending: false }),
      supabase.from('follows').select('*'),
      supabase.from('page_views').select('workshop_id,source,created_at').order('created_at', { ascending: false }).limit(5000),
      supabase.from('mail_log').select('*').order('created_at', { ascending: false }).limit(50),
    ])
    for (const q of [w, r, f, v, m]) if (q.error) throw q.error
    const activeWorkshops = ((w.data ?? []) as Workshop[]).filter((item) => item.date >= today)
    const activeWorkshopIds = new Set(activeWorkshops.map((x) => x.id))
    const localCr = getStoredCorporateRequests()
    let cr: CorporateRequest[] = localCr
    try {
      const { data: crData, error } = await supabase.from('corporate_requests').select('*').order('created_at', { ascending: false })
      if (!error && Array.isArray(crData) && crData.length > 0) {
        const remoteCr: CorporateRequest[] = (crData as Record<string, unknown>[]).map((x) => ({
          id: String(x.id),
          companyName: String(x.company_name || ''),
          picName: String(x.pic_name || ''),
          email: String(x.email || ''),
          phone: String(x.phone || ''),
          eventType: String(x.event_type || ''),
          craftCategory: String(x.craft_category || ''),
          participants: Number(x.participants || 0),
          locationType: String(x.location_type || ''),
          locationCity: String(x.location_city || ''),
          targetDate: String(x.target_date || ''),
          addons: Array.isArray(x.addons) ? (x.addons as string[]) : [],
          estimatedTotal: Number(x.estimated_total || 0),
          costPerPax: Number(x.cost_per_pax || 0),
          notes: String(x.notes || ''),
          status: (x.status as CorporateStatus) || 'new',
          createdAt: String(x.created_at || new Date().toISOString()),
        }))
        const mergedMap = new Map<string, CorporateRequest>()
        for (const item of localCr) mergedMap.set(item.id, item)
        for (const item of remoteCr) mergedMap.set(item.id, item)
        cr = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        saveStoredCorporateRequests(cr)
      }
    } catch {
      // corporate_requests table might not exist yet in remote
    }

    const next: Base = {
      workshops: activeWorkshops,
      registrations: ((r.data ?? []) as RegRow[]).map(toReg).filter((reg) => activeWorkshopIds.has(reg.workshopId)),
      follows: ((f.data ?? []) as { email: string; category: Category | 'All'; created_at: string }[]).map((x) => ({ email: x.email, category: x.category, createdAt: x.created_at })),
      views: ((v.data ?? []) as { workshop_id: string; source: string; created_at: string }[]).map((x) => ({ workshopId: x.workshop_id, source: x.source, ts: x.created_at })),
      mails: ((m.data ?? []) as { id: string; to_email: string; subject: string; created_at: string }[]).map((x) => ({ id: x.id, to: x.to_email, subject: x.subject, ts: x.created_at })),
      corporateRequests: cr,
    }
    patch({ ...next, seats: computeSeats(next), ready: true })
  } catch (e) {
    console.error('loadAdmin failed', e)
  }
}

if (supabase) {
  void loadPublic()
  supabase.auth.onAuthStateChange((event) => {
    // drop personal data from memory as soon as the admin signs out
    if (event === 'SIGNED_OUT') {
      patch({ registrations: [], follows: [], views: [], mails: [] })
      void loadPublic()
    }
  })
}

/** Look up one booking by code (ticket page). */
export async function getRegistration(codeStr: string): Promise<Registration | null> {
  if (supabase) {
    const { data, error } = await supabase.rpc('get_registration', { p_code: codeStr })
    if (error || !data || !(data as RegRow).id) return null
    return toReg(data as RegRow)
  }
  return state.registrations.find((x) => x.code === codeStr) ?? null
}

// ---------- local-mode helpers ----------
function mail(s: Base, to: string, subject: string): MailLog[] {
  return [{ id: uid(), to, subject, ts: new Date().toISOString() }, ...s.mails].slice(0, 50)
}

const slugify = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + uid().slice(0, 3)

// ---------- mutations ----------
export function trackView(workshopId: string) {
  const key = 'swh-v-' + workshopId
  if (sessionStorage.getItem(key)) return
  sessionStorage.setItem(key, '1')
  if (supabase) {
    void supabase.from('page_views').insert({ workshop_id: workshopId, source: captureSource() })
    return
  }
  commit({ ...state, views: [...state.views, { workshopId, source: captureSource(), ts: new Date().toISOString() }] })
}

export async function register(input: { workshopId: string; name: string; email: string; phone: string; tickets: number }): Promise<Registration> {
  if (supabase) {
    const { data, error } = await supabase.rpc('create_registration', {
      p_workshop_id: input.workshopId, p_name: input.name, p_email: input.email,
      p_phone: input.phone, p_tickets: input.tickets, p_source: captureSource(),
    })
    if (error || !data) throw new Error(error?.message ?? 'Booking failed')
    void loadPublic()
    return toReg(data as RegRow)
  }
  const w = state.workshops.find((x) => x.id === input.workshopId)!
  const left = seatsLeft(state, w)
  const waitlist = left < input.tickets
  const reg: Registration = {
    id: uid(), code: code(), workshopId: w.id, name: input.name, email: input.email, phone: input.phone,
    tickets: input.tickets, total: waitlist ? 0 : input.tickets * w.price,
    status: waitlist ? 'waitlist' : w.price === 0 ? 'paid' : 'pending',
    source: captureSource(), createdAt: new Date().toISOString(), checkedIn: false,
  }
  commit({
    ...state,
    registrations: [...state.registrations, reg],
    mails: mail(state, input.email, waitlist ? `You're on the waitlist for ${w.title}` : `Booking confirmed: ${w.title} (${reg.code})`),
  })
  return reg
}

export async function setStatus(id: string, status: RegStatus): Promise<void> {
  const r = state.registrations.find((x) => x.id === id)
  if (!r) return
  const w = state.workshops.find((x) => x.id === r.workshopId)!
  let total = r.total
  if (status === 'offered' || status === 'paid') total = r.tickets * w.price
  const subject = status === 'offered' ? `A seat opened up for ${w.title}. Complete payment to confirm` : status === 'paid' ? `Payment received, your ticket is ready: ${w.title} (${r.code})` : ''
  if (supabase) {
    const { error } = await supabase.from('registrations').update({ status, total }).eq('id', id)
    if (error) throw error
    if (subject) await supabase.from('mail_log').insert({ to_email: r.email, subject })
    await loadAdmin()
    return
  }
  commit({
    ...state,
    registrations: state.registrations.map((x) => (x.id === id ? { ...x, status, total } : x)),
    mails: subject ? mail(state, r.email, subject) : state.mails,
  })
}

export interface CheckInResult {
  status: 'ok' | 'already' | 'invalid' | 'unpaid'
  message: string
  code: string
  registration?: Registration
  workshop?: Workshop
}

export function parseTicketCode(input: string): string {
  if (!input) return ''
  const trimmed = input.trim()
  // Look for SW-XXXXXX pattern
  const match = trimmed.match(/SW-[A-Z0-9]+/i)
  if (match) return match[0].toUpperCase()
  // Fallback: strip URL query and path
  const cleaned = trimmed.split('?')[0].split('#')[0].split('/').filter(Boolean).pop() ?? trimmed
  return cleaned.toUpperCase()
}

export async function checkIn(codeStr: string): Promise<CheckInResult> {
  const wanted = parseTicketCode(codeStr)
  if (!wanted) {
    return { status: 'invalid', message: 'Kode tiket kosong.', code: codeStr }
  }

  if (supabase) {
    // 1. Try RPC check_in_ticket if available
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('check_in_ticket', { p_code: wanted })
      if (!rpcErr && rpcData && typeof rpcData === 'object') {
        const res = rpcData as { status: 'ok' | 'already' | 'invalid' | 'unpaid'; name?: string; tickets?: number; code?: string; total?: number; workshop_title?: string }
        await loadAdmin()
        const matchedReg = state.registrations.find((x) => x.code.toUpperCase() === wanted)
        const matchedW = matchedReg ? state.workshops.find((w) => w.id === matchedReg.workshopId) : undefined
        return {
          status: res.status,
          code: wanted,
          message:
            res.status === 'ok' ? 'Check-in berhasil! Selamat datang.' :
            res.status === 'already' ? 'Tiket sudah pernah di-check-in sebelumnya.' :
            res.status === 'unpaid' ? 'Pembayaran tiket belum lunas.' : 'Kode tiket tidak ditemukan.',
          registration: matchedReg,
          workshop: matchedW,
        }
      }
    } catch {
      // Fallback to table query if RPC not present in DB
    }

    // 2. Fallback direct table query
    const { data } = await supabase.from('registrations').select('*').eq('code', wanted).maybeSingle()
    if (!data) {
      return { status: 'invalid', message: 'Kode tiket tidak ditemukan di database.', code: wanted }
    }
    const r = data as RegRow
    const reg = toReg(r)
    const w = state.workshops.find((x) => x.id === r.workshop_id)

    if (r.status !== 'paid') {
      return { status: 'unpaid', message: 'Tiket belum lunas.', code: wanted, registration: reg, workshop: w }
    }
    if (r.checked_in) {
      return { status: 'already', message: 'Tiket sudah pernah check-in sebelumnya.', code: wanted, registration: reg, workshop: w }
    }

    const { error } = await supabase.from('registrations').update({ checked_in: true }).eq('id', r.id)
    if (error) throw error
    await loadAdmin()
    return { status: 'ok', message: 'Check-in berhasil! Selamat datang.', code: wanted, registration: { ...reg, checkedIn: true }, workshop: w }
  }

  // Local demo mode
  const r = state.registrations.find((x) => x.code.toUpperCase() === wanted)
  if (!r) {
    return { status: 'invalid', message: 'Kode tiket tidak ditemukan.', code: wanted }
  }
  const w = state.workshops.find((x) => x.id === r.workshopId)
  if (r.status !== 'paid') {
    return { status: 'unpaid', message: 'Tiket belum lunas.', code: wanted, registration: r, workshop: w }
  }
  if (r.checkedIn) {
    return { status: 'already', message: 'Tiket sudah pernah check-in sebelumnya.', code: wanted, registration: r, workshop: w }
  }

  const updatedReg = { ...r, checkedIn: true }
  commit({ ...state, registrations: state.registrations.map((x) => (x.id === r.id ? updatedReg : x)) })
  return { status: 'ok', message: 'Check-in berhasil! Selamat datang.', code: wanted, registration: updatedReg, workshop: w }
}

export async function quickConfirmAndCheckIn(id: string): Promise<CheckInResult> {
  const r = state.registrations.find((x) => x.id === id)
  if (!r) return { status: 'invalid', message: 'Data tidak ditemukan.', code: '' }
  const w = state.workshops.find((x) => x.id === r.workshopId)

  if (supabase) {
    const { error } = await supabase.from('registrations').update({ status: 'paid', checked_in: true }).eq('id', id)
    if (error) throw error
    await loadAdmin()
    const updated = { ...r, status: 'paid' as const, checkedIn: true }
    return { status: 'ok', message: 'Pembayaran dikonfirmasi & check-in berhasil!', code: r.code, registration: updated, workshop: w }
  }

  const updated = { ...r, status: 'paid' as const, checkedIn: true }
  commit({ ...state, registrations: state.registrations.map((x) => (x.id === id ? updated : x)) })
  return { status: 'ok', message: 'Pembayaran dikonfirmasi & check-in berhasil!', code: r.code, registration: updated, workshop: w }
}


export async function follow(email: string, category: Category | 'All'): Promise<void> {
  const addr = email.trim().toLowerCase()
  if (supabase) {
    const { error } = await supabase.from('follows').insert({ email: addr, category })
    if (error && error.code !== '23505') throw error // 23505 = already following
    return
  }
  if (state.follows.some((f) => f.email === addr && f.category === category)) return
  commit({
    ...state,
    follows: [...state.follows, { email: addr, category, createdAt: new Date().toISOString() }],
    mails: mail(state, addr, `You're following ${category === 'All' ? 'all workshops' : category + ' workshops'}`),
  })
}

export async function addWorkshop(w: Omit<Workshop, 'id' | 'slug'>): Promise<void> {
  const slug = slugify(w.title)
  const notified = state.follows.filter((f) => f.category === 'All' || f.category === w.category)
  if (supabase) {
    const { error } = await supabase.from('workshops').insert({ ...w, slug })
    if (error) throw error
    if (notified.length)
      await supabase.from('mail_log').insert(notified.map((f) => ({ to_email: f.email, subject: `New ${w.category} workshop: ${w.title}` })))
    await loadAdmin()
    return
  }
  const nw: Workshop = { ...w, id: uid(), slug }
  commit({
    ...state,
    workshops: [...state.workshops, nw],
    mails: [...notified.map((f) => ({ id: uid(), to: f.email, subject: `New ${w.category} workshop: ${w.title}`, ts: new Date().toISOString() })), ...state.mails].slice(0, 50),
  })
}

export async function togglePublish(id: string): Promise<void> {
  const w = state.workshops.find((x) => x.id === id)
  if (!w) return
  if (supabase) {
    const { error } = await supabase.from('workshops').update({ published: !w.published }).eq('id', id)
    if (error) throw error
    await loadAdmin()
    return
  }
  commit({ ...state, workshops: state.workshops.map((x) => (x.id === id ? { ...x, published: !x.published } : x)) })
}

export async function editWorkshop(id: string, changes: Partial<Omit<Workshop, 'id' | 'slug'>>): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('workshops').update(changes).eq('id', id)
    if (error) throw error
    await loadAdmin()
    return
  }
  commit({ ...state, workshops: state.workshops.map((x) => (x.id === id ? { ...x, ...changes } : x)) })
}

export async function deleteWorkshop(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('workshops').delete().eq('id', id)
    if (error) throw error
    await loadAdmin()
    return
  }
  commit({ ...state, workshops: state.workshops.filter((x) => x.id !== id) })
}

export async function purgeExpiredWorkshops(): Promise<number> {
  const today = getTodayDateStr()
  let deletedCount = 0

  if (supabase) {
    try {
      const { data } = await supabase.rpc('purge_expired_workshops')
      if (typeof data === 'number') deletedCount = data
    } catch {
      const res = await supabase.from('workshops').delete().lt('date', today)
      if (!res.error) deletedCount = 1
    }
    await loadAdmin()
    await loadPublic()
  }

  // Local state purge
  const before = state.workshops.length
  const activeWorkshops = state.workshops.filter((w) => w.date >= today)
  if (activeWorkshops.length !== before) {
    deletedCount += (before - activeWorkshops.length)
    const validIds = new Set(activeWorkshops.map((w) => w.id))
    commit({
      ...state,
      workshops: activeWorkshops,
      registrations: state.registrations.filter((r) => validIds.has(r.workshopId)),
      views: state.views.filter((v) => validIds.has(v.workshopId)),
    })
  }

  return deletedCount
}

export async function createCorporateRequest(
  input: Omit<CorporateRequest, 'id' | 'createdAt' | 'status'>
): Promise<CorporateRequest> {
  const req: CorporateRequest = {
    ...input,
    id: 'CR-' + uid().toUpperCase(),
    status: 'new',
    createdAt: new Date().toISOString(),
  }

  // 1. Immediately persist to dedicated local storage
  const current = getStoredCorporateRequests()
  const updated = [req, ...current.filter((x) => x.id !== req.id)]
  saveStoredCorporateRequests(updated)

  // 2. Sync to Supabase if connected
  if (supabase) {
    try {
      const { error } = await supabase.from('corporate_requests').insert({
        company_name: req.companyName,
        pic_name: req.picName,
        email: req.email,
        phone: req.phone,
        event_type: req.eventType,
        craft_category: req.craftCategory,
        participants: req.participants,
        location_type: req.locationType,
        location_city: req.locationCity,
        target_date: req.targetDate,
        addons: req.addons,
        estimated_total: req.estimatedTotal,
        cost_per_pax: req.costPerPax,
        notes: req.notes,
        status: 'new',
      })
      if (error) {
        console.warn('Supabase corporate_requests insert warning:', error.message)
      }
    } catch (e) {
      console.warn('Supabase corporate_requests insert fallback to local storage:', e)
    }
  }

  const nextMails = mail(
    state,
    req.email,
    `Proposal Request Received: ${req.companyName} (${req.craftCategory})`
  )

  if (remote) {
    patch({
      corporateRequests: updated,
      mails: nextMails,
    })
  } else {
    commit({
      ...state,
      corporateRequests: updated,
      mails: nextMails,
    })
  }

  return req
}

export async function updateCorporateRequestStatus(
  id: string,
  status: CorporateStatus
): Promise<void> {
  const current = getStoredCorporateRequests()
  const updated = current.map((r) => (r.id === id ? { ...r, status } : r))
  saveStoredCorporateRequests(updated)

  if (supabase) {
    try {
      await supabase.from('corporate_requests').update({ status }).eq('id', id)
    } catch {
      // fallback
    }
  }

  if (remote) {
    patch({ corporateRequests: updated })
  } else {
    commit({
      ...state,
      corporateRequests: updated,
    })
  }
}

export async function deleteCorporateRequest(id: string): Promise<void> {
  const current = getStoredCorporateRequests()
  const updated = current.filter((r) => r.id !== id)
  saveStoredCorporateRequests(updated)

  if (supabase) {
    try {
      await supabase.from('corporate_requests').delete().eq('id', id)
    } catch {
      // fallback
    }
  }

  if (remote) {
    patch({ corporateRequests: updated })
  } else {
    commit({
      ...state,
      corporateRequests: updated,
    })
  }
}

export async function convertCorporateToWorkshop(req: CorporateRequest): Promise<void> {
  const images: Record<string, string> = {
    Crochet: '/img/crochet-bag.jpg',
    Knitting: '/img/knitting.jpg',
    Amigurumi: '/img/amigurumi.jpg',
    Macrame: '/img/macrame.jpg',
  }
  const craftCategoryKey: Category = req.craftCategory.includes('Amigurumi')
    ? 'Amigurumi'
    : req.craftCategory.includes('Knitting')
    ? 'Knitting'
    : req.craftCategory.includes('Macram')
    ? 'Macrame'
    : 'Crochet'

  await addWorkshop({
    title: `[Private B2B] ${req.companyName} - ${req.craftCategory.split('(')[0].trim()}`,
    category: craftCategoryKey,
    level: 'Beginner',
    date: req.targetDate || getTodayDateStr(),
    time: '13:00 – 17:00',
    duration: '4 hours',
    location: req.locationType || 'Studio Straweyi',
    city: req.locationCity || 'Bandung',
    price: req.costPerPax,
    capacity: req.participants,
    image: images[craftCategoryKey] || '/img/crochet-bag.jpg',
    summary: `Private workshop eksklusif untuk ${req.companyName} (${req.eventType}).`,
    description: `Private session yang difasilitasi khusus untuk ${req.companyName} dengan PIC ${req.picName} (${req.phone}). Rincian add-on: ${req.addons.join(', ') || 'Standar kit'}.`,
    includes: ['Bahan & alat lengkap hak milik', 'Instruktur dedicated', 'E-Sertifikat kehadiran'],
    published: false,
  })

  await updateCorporateRequestStatus(req.id, 'deal')
}



