import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Download, Mail, Pencil, PlusCircle, RotateCcw, ScanLine, Table2, Trash2, TrendingUp, X, Check, CheckCircle2, AlertTriangle, XCircle, UserCheck, Building2, PhoneCall, CalendarPlus, FileText, Printer, Eye } from 'lucide-react'
import { Badge, Button, Card, Input, Label, Select, Textarea } from '@/components/ui'
import QrScanner from '@/components/QrScanner'
import { CATEGORIES, LEVELS, addWorkshop, checkIn, convertCorporateToWorkshop, createCorporateRequest, deleteCorporateRequest, deleteWorkshop, editWorkshop, getTodayDateStr, loadAdmin, parseTicketCode, quickConfirmAndCheckIn, resetDemo, seatsLeft, seatsTaken, setStatus, togglePublish, updateCorporateRequestStatus, useStore, type Category, type CheckInResult, type CorporateRequest, type CorporateStatus, type Level, type RegStatus, type Workshop } from '@/lib/store'
import { cn, fmtDate, rupiah, waLink } from '@/lib/utils'
import { LogoutButton } from '@/components/AdminGuard'
import { supabaseReady } from '@/lib/supabase'
import { playScanSound } from '@/lib/audio'

const act = (p: Promise<unknown>) => p.catch((e) => alert(e instanceof Error ? e.message : 'Action failed'))

const TABS = [
  ['overview', 'Overview', TrendingUp],
  ['registrations', 'Registrations', Table2],
  ['corporate', 'B2B & Corporate', Building2],
  ['checkin', 'Check-in', ScanLine],
  ['create', 'New workshop', PlusCircle],
  ['outbox', 'Outbox', Mail],
] as const
type Tab = (typeof TABS)[number][0]

const statusVariant: Record<RegStatus, 'sage' | 'mustard' | 'dark' | 'terra' | 'outline'> = {
  paid: 'sage', pending: 'mustard', waitlist: 'dark', offered: 'terra', cancelled: 'outline',
}

function Kpi({ label, value, hint, delay }: { label: string; value: string; hint: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="p-4 sm:p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</div>
        <div className="mt-2 break-words font-display text-2xl font-bold sm:text-3xl">{value}</div>
        <div className="mt-1 text-xs text-muted">{hint}</div>
      </Card>
    </motion.div>
  )
}

function Bar({ pct, className }: { pct: number; className?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-sand">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, pct)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={cn('h-full rounded-full bg-terra', className)}
      />
    </div>
  )
}

function EditModal({ w, onClose }: { w: Workshop; onClose: () => void }) {
  const images: Record<Category, string> = {
    Crochet: '/img/crochet-bag.jpg', Knitting: '/img/knitting.jpg',
    Amigurumi: '/img/amigurumi.jpg', Macrame: '/img/macrame.jpg',
  }
  const [f, setF] = useState({
    title: w.title, category: w.category as Category, level: w.level,
    date: w.date, time: w.time, duration: w.duration, location: w.location,
    city: w.city, price: w.price, capacity: w.capacity, summary: w.summary,
    description: w.description, includes: w.includes.join(', '), published: w.published,
  })
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }))
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const changes = {
      ...f,
      image: images[f.category],
      includes: f.includes.split(',').map((x: string) => x.trim()).filter(Boolean),
    }
    act(editWorkshop(w.id, changes).then(onClose))
  }
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-4 pt-10 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl rounded-3xl bg-paper shadow-lift"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-7 sm:py-5">
          <h3 className="text-xl font-semibold">Edit workshop</h3>
          <button onClick={onClose} className="grid size-9 cursor-pointer place-items-center rounded-full hover:bg-sand">
            <X className="size-5" />
          </button>
        </div>
        <form id="edit-form" onSubmit={submit} className="grid gap-4 p-5 sm:p-7 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="e-title">Title</Label>
            <Input id="e-title" required value={f.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="e-cat">Category</Label>
            <Select id="e-cat" value={f.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="e-level">Level</Label>
            <Select id="e-level" value={f.level} onChange={(e) => set('level', e.target.value)}>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="e-date">Date</Label>
            <Input id="e-date" required type="date" min={getTodayDateStr()} value={f.date} onChange={(e) => set('date', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="e-time">Time range</Label>
            <Input id="e-time" value={f.time} onChange={(e) => set('time', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="e-loc">Location</Label>
            <Input id="e-loc" required value={f.location} onChange={(e) => set('location', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="e-city">City</Label>
            <Input id="e-city" required value={f.city} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="e-price">Price (Rp)</Label>
            <Input id="e-price" type="number" min={0} step={5000} value={f.price} onChange={(e) => set('price', +e.target.value)} />
          </div>
          <div>
            <Label htmlFor="e-cap">Capacity</Label>
            <Input id="e-cap" type="number" min={1} value={f.capacity} onChange={(e) => set('capacity', +e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="e-sum">Short summary</Label>
            <Input id="e-sum" required value={f.summary} onChange={(e) => set('summary', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="e-desc">Description</Label>
            <Textarea id="e-desc" value={f.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="e-inc">Included items (comma separated)</Label>
            <Input id="e-inc" value={f.includes} onChange={(e) => set('includes', e.target.value)} />
          </div>
          <div className="flex gap-3 md:col-span-2">
            <Button id="edit-submit" type="submit" size="lg">Save changes</Button>
            <Button type="button" variant="outline" size="lg" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function Overview({ onEdit }: { onEdit: (w: Workshop) => void }) {
  const s = useStore()
  const live = s.registrations.filter((r) => r.status !== 'waitlist' && r.status !== 'cancelled')
  const paid = s.registrations.filter((r) => r.status === 'paid')
  const seats = live.reduce((a, r) => a + r.tickets, 0)
  const revenue = paid.reduce((a, r) => a + r.total, 0)
  const conv = s.views.length ? (live.length / s.views.length) * 100 : 0
  const payRate = live.length ? (paid.length / live.length) * 100 : 0
  const attend = paid.length ? (paid.filter((r) => r.checkedIn).length / paid.length) * 100 : 0

  const sources = useMemo(() => {
    const keys = [...new Set([...s.views.map((v) => v.source), ...live.map((r) => r.source)])]
    return keys.map((k) => {
      const v = s.views.filter((x) => x.source === k).length
      const regs = live.filter((r) => r.source === k)
      return { k, views: v, regs: regs.length, attended: regs.filter((r) => r.checkedIn).length, conv: v ? (regs.length / v) * 100 : 0 }
    }).sort((a, b) => b.regs - a.regs)
  }, [s])
  const maxRegs = Math.max(1, ...sources.map((x) => x.regs))

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        <Kpi delay={0} label="Seats booked" value={String(seats)} hint={`${live.length} bookings`} />
        <Kpi delay={0.05} label="Revenue paid" value={rupiah(revenue)} hint={`${paid.length} paid bookings`} />
        <Kpi delay={0.1} label="Visit to booking" value={conv.toFixed(1) + '%'} hint={`${s.views.length} page views`} />
        <Kpi delay={0.15} label="Payment success" value={payRate.toFixed(0) + '%'} hint="paid / all bookings" />
        <Kpi delay={0.2} label="Attendance" value={attend.toFixed(0) + '%'} hint="checked in / paid" />
      </div>

      <Card className="p-4 sm:p-6">
        <h3 className="text-xl font-semibold">Which channels bring people in?</h3>
        <p className="mb-5 text-sm text-muted">
          Tag links with ?src=name to track a campaign, e.g. ?src=instagram.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted">
                <th className="pb-3">Source</th>
                <th className="pb-3">Views</th>
                <th className="pb-3">Bookings</th>
                <th className="pb-3">Conv.</th>
                <th className="pb-3">Attended</th>
                <th className="w-1/3 pb-3" />
              </tr>
            </thead>
            <tbody>
              {sources.map((x) => (
                <tr key={x.k} className="border-t border-line">
                  <td className="py-3 font-semibold capitalize">{x.k}</td>
                  <td>{x.views}</td>
                  <td>{x.regs}</td>
                  <td>{x.conv.toFixed(1)}%</td>
                  <td>{x.attended}</td>
                  <td><Bar pct={(x.regs / maxRegs) * 100} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <h3 className="mb-5 text-xl font-semibold">Workshops</h3>
        <div className="space-y-4">
          {s.workshops.map((w) => {
            const taken = seatsTaken(s, w.id)
            const views = s.views.filter((v) => v.workshopId === w.id).length
            const regs = s.registrations.filter(
              (r) => r.workshopId === w.id && r.status !== 'waitlist' && r.status !== 'cancelled'
            ).length
            return (
              <div key={w.id} className="grid items-center gap-3 rounded-2xl border border-line p-4 md:grid-cols-[1.4fr_1fr_auto]">
                <div>
                  <div className="font-semibold">
                    {w.title} {!w.published && <Badge variant="outline">Draft</Badge>}
                  </div>
                  <div className="text-xs text-muted">
                    {fmtDate(w.date, { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{w.city}{' · '}{views} views
                    {' · '}{views ? ((regs / views) * 100).toFixed(1) : 0}% conv.
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-muted">
                    {taken}/{w.capacity} seats · {seatsLeft(s, w)} left
                  </div>
                  <Bar pct={(taken / w.capacity) * 100} className={taken >= w.capacity ? 'bg-ink' : ''} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button id={`edit-ws-${w.id}`} size="sm" variant="outline" onClick={() => onEdit(w)}>
                    <Pencil className="size-3" />Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => act(togglePublish(w.id))}>
                    {w.published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button
                    size="sm" variant="ghost"
                    className="text-terra-dark hover:bg-blush"
                    onClick={() => { if (window.confirm('Delete this workshop? This cannot be undone.')) act(deleteWorkshop(w.id)) }}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function Registrations() {
  const s = useStore()
  const [wid, setWid] = useState('')
  const rows = s.registrations.filter((r) => !wid || r.workshopId === wid).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const exportCsv = () => {
    const head = ['code', 'workshop', 'name', 'email', 'phone', 'tickets', 'total', 'status', 'source', 'checked_in', 'created']
    const esc = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`
    const lines = rows.map((r) => [
      r.code, s.workshops.find((w) => w.id === r.workshopId)?.title,
      r.name, r.email, r.phone, r.tickets, r.total, r.status, r.source, r.checkedIn, r.createdAt
    ].map(esc).join(','))
    const blob = new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'straweyi-registrations.csv'; a.click()
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold">{rows.length} registrations</h3>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Select aria-label="Filter by workshop" value={wid} onChange={(e) => setWid(e.target.value)} className="h-10 w-full sm:w-56">
            <option value="">All workshops</option>
            {s.workshops.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
          </Select>
          <Button id="export-csv" variant="dark" size="default" onClick={exportCsv}>
            <Download className="size-4" />Export CSV
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted">
              <th className="pb-3">Attendee</th>
              <th className="pb-3">Workshop</th>
              <th className="pb-3">Tix</th>
              <th className="pb-3">Source</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="py-3">
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-muted">{r.email} · <span className="font-mono">{r.code}</span></div>
                </td>
                <td className="max-w-48 truncate pr-3">{s.workshops.find((w) => w.id === r.workshopId)?.title}</td>
                <td>{r.tickets}</td>
                <td className="capitalize">{r.source}</td>
                <td><Badge variant={statusVariant[r.status]}>{r.status}{r.checkedIn ? ' · in' : ''}</Badge></td>
                <td className="space-x-1 text-right">
                  {r.status === 'pending' && r.phone && (
                    <Button asChild size="sm" variant="outline">
                      <a target="_blank" rel="noreferrer" href={waLink(`Halo ${r.name}, terima kasih sudah reservasi workshop "${s.workshops.find((w) => w.id === r.workshopId)?.title}" (kode ${r.code}). Total pembayaran ${rupiah(r.tickets * (s.workshops.find((w) => w.id === r.workshopId)?.price ?? 0))}. Silakan lakukan pembayaran dan kirim bukti transfer di chat ini ya.`, r.phone)}>WA</a>
                    </Button>
                  )}
                  {r.status === 'pending' && <Button size="sm" onClick={() => act(setStatus(r.id, 'paid'))}>Mark paid</Button>}
                  {r.status === 'paid' && r.phone && (
                    <Button asChild size="sm" variant="sage">
                      <a target="_blank" rel="noreferrer" href={waLink(`Halo ${r.name}, pembayaran Anda sudah kami terima. Tiket QR workshop "${s.workshops.find((w) => w.id === r.workshopId)?.title}" ada di sini: ${window.location.origin}/ticket/${r.code}\nTunjukkan QR saat check-in. Sampai jumpa!`, r.phone)}>Send ticket</a>
                    </Button>
                  )}
                  {r.status === 'waitlist' && (() => {
                    const w = s.workshops.find((x) => x.id === r.workshopId)!
                    const can = seatsLeft(s, w) >= r.tickets
                    return <Button size="sm" variant="sage" disabled={!can} title={can ? '' : 'No seats free'} onClick={() => act(setStatus(r.id, 'offered'))}>Offer seat</Button>
                  })()}
                  {r.status === 'offered' && <Button size="sm" onClick={() => act(setStatus(r.id, 'paid'))}>Mark paid</Button>}
                  {r.status !== 'cancelled' && <Button size="sm" variant="ghost" onClick={() => act(setStatus(r.id, 'cancelled'))}>Cancel</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted">Cancel a booking to free its seats, then use "Offer seat" on the waitlist.</p>
    </Card>
  )
}

function CheckIn() {
  const s = useStore()
  const [code, setCode] = useState('')
  const [res, setRes] = useState<CheckInResult | null>(null)
  const [camera, setCamera] = useState(false)
  const [camError, setCamError] = useState('')
  const [busy, setBusy] = useState(false)

  const paidRegs = s.registrations.filter((r) => r.status === 'paid')
  const arrived = s.registrations.filter((r) => r.checkedIn).reduce((n, r) => n + r.tickets, 0)
  const expected = paidRegs.reduce((n, r) => n + r.tickets, 0)

  // Not yet arrived (paid only)
  const notArrived = s.registrations.filter((r) => r.status === 'paid' && !r.checkedIn)
  // Recently checked in (latest first)
  const recentCheckedIn = s.registrations.filter((r) => r.checkedIn).slice(0, 5)

  const run = async (rawCode: string) => {
    const cleaned = parseTicketCode(rawCode)
    if (!cleaned) return
    setBusy(true)
    setCamError('')
    try {
      const result = await checkIn(cleaned)
      setRes(result)
      if (result.status === 'ok') {
        playScanSound('success')
      } else if (result.status === 'already') {
        playScanSound('warning')
      } else {
        playScanSound('error')
      }
    } catch (e) {
      playScanSound('error')
      setRes({
        status: 'invalid',
        message: e instanceof Error ? e.message : 'Gagal memproses check-in tiket.',
        code: cleaned,
      })
    } finally {
      setBusy(false)
    }
  }

  const handleQuickPayAndCheckIn = async (regId: string) => {
    setBusy(true)
    try {
      const result = await quickConfirmAndCheckIn(regId)
      setRes(result)
      playScanSound('success')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal konfirmasi pembayaran.')
    } finally {
      setBusy(false)
    }
  }

  const onScan = (scannedText: string) => {
    void run(scannedText)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-6">
        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">QR Ticket Check-In</h3>
              <p className="mt-1 text-sm text-muted">
                Pindai QR lewat kamera perangkat, unggah screenshot QR, atau ketik kode tiket.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-sand/80 px-4 py-2">
              <UserCheck className="size-5 text-terra" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Kehadiran</div>
                <div className="font-display text-lg font-bold text-ink">
                  {arrived} / {expected} <span className="text-xs font-normal text-muted">orang</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Button
              id="toggle-camera"
              variant={camera ? 'outline' : 'default'}
              className="w-full gap-2 text-sm font-semibold"
              onClick={() => {
                setCamError('')
                setCamera((v) => !v)
              }}
            >
              <ScanLine className="size-4" />
              {camera ? 'Tutup Scanner Kamera' : 'Buka Scanner Kamera'}
            </Button>

            {camera && (
              <div className="rounded-2xl border border-line bg-sand/30 p-4">
                <QrScanner
                  onScan={onScan}
                  onError={(m) => {
                    setCamError(m)
                  }}
                />
              </div>
            )}

            {camError && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-terra/10 p-4 text-sm text-terra-dark">
                <AlertTriangle className="size-5 shrink-0" />
                <span>{camError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const c = code
                setCode('')
                void run(c)
              }}
              className="flex gap-2"
            >
              <Input
                id="checkin-code"
                autoFocus={!camera}
                placeholder="Ketik kode tiket, contoh: SW-XXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-base uppercase"
                disabled={busy}
              />
              <Button id="checkin-submit" type="submit" disabled={busy || !code.trim()} className="shrink-0 px-6">
                {busy ? 'Memproses...' : 'Check In'}
              </Button>
            </form>
          </div>

          {/* Result announcement banner */}
          <AnimatePresence mode="wait">
            {res && (
              <motion.div
                key={res.status + res.code + Date.now()}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`mt-6 overflow-hidden rounded-2xl border p-5 ${
                  res.status === 'ok'
                    ? 'border-sage bg-sage/20 text-ink'
                    : res.status === 'already'
                    ? 'border-mustard bg-mustard/20 text-ink'
                    : 'border-terra bg-terra/15 text-ink'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {res.status === 'ok' ? (
                    <div className="grid size-10 shrink-0 place-items-center rounded-full bg-sage text-white">
                      <CheckCircle2 className="size-6" />
                    </div>
                  ) : res.status === 'already' ? (
                    <div className="grid size-10 shrink-0 place-items-center rounded-full bg-mustard text-ink">
                      <AlertTriangle className="size-6" />
                    </div>
                  ) : (
                    <div className="grid size-10 shrink-0 place-items-center rounded-full bg-terra text-white">
                      <XCircle className="size-6" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-lg font-bold">
                        {res.status === 'ok'
                          ? 'Check-In Berhasil!'
                          : res.status === 'already'
                          ? 'Tiket Sudah Check-In Sebelumnya'
                          : res.status === 'unpaid'
                          ? 'Tiket Belum Lunas'
                          : 'Kode Tiket Tidak Valid'}
                      </h4>
                      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                        {res.code}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-ink/80">{res.message}</p>

                    {res.registration && (
                      <div className="mt-3 rounded-xl bg-white/70 p-3.5 text-sm backdrop-blur-sm">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-base text-ink">{res.registration.name}</span>
                          <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-bold text-terra-dark">
                            {res.registration.tickets} Tiket
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-muted">
                          {res.workshop?.title ?? 'Workshop Straweyi'} · {res.registration.phone || res.registration.email}
                        </div>

                        {res.status === 'unpaid' && (
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-3">
                            <span className="text-xs text-muted">
                              Total tagihan: <strong className="text-ink">{rupiah(res.registration.total)}</strong>
                            </span>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleQuickPayAndCheckIn(res.registration!.id)}
                              disabled={busy}
                              className="text-xs"
                            >
                              Konfirmasi Lunas & Check-In Sekarang
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Recently checked in */}
        {recentCheckedIn.length > 0 && (
          <Card className="p-4 sm:p-6">
            <h4 className="text-base font-semibold text-ink">Baru Saja Check-In</h4>
            <div className="mt-3 space-y-2">
              {recentCheckedIn.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl bg-sage/15 px-4 py-2.5 text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-6 place-items-center rounded-full bg-sage text-white">
                      <Check className="size-3.5" />
                    </span>
                    <span className="font-medium">{r.name}</span>
                    <span className="text-xs text-muted">({r.tickets} tiket)</span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-sage-dark">{r.code}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Right Column: Paid attendees not yet arrived */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Peserta Belum Hadir</h3>
          <Badge variant="mustard">{notArrived.length} orang</Badge>
        </div>
        <p className="mt-1 text-xs text-muted">
          Klik tombol check-in atau klik kode untuk memasukkannya ke input.
        </p>

        <div className="mt-4 max-h-[560px] space-y-2.5 overflow-y-auto pr-1">
          {notArrived.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">
              Semua peserta yang lunas sudah melakukan check-in!
            </div>
          ) : (
            notArrived.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-line bg-paper p-3 text-sm shadow-xs transition hover:bg-sand/40"
              >
                <div>
                  <div className="font-semibold text-ink">{r.name}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                    <span>{r.tickets} tiket</span>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCode(r.code)
                      }}
                      className="cursor-pointer font-mono font-bold text-terra hover:underline"
                    >
                      {r.code}
                    </button>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 shrink-0 text-xs hover:bg-terra hover:text-white"
                  disabled={busy}
                  onClick={() => void run(r.code)}
                >
                  Check In
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}


function Create({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({
    title: '', category: 'Crochet' as Category, level: 'Beginner' as Level,
    date: getTodayDateStr(), time: '10:00 – 13:00', duration: '3 hours', location: '', city: 'Bandung',
    price: 175000, capacity: 12, summary: '', description: '', includes: 'Materials, Refreshments',
  })
  const set = (k: string, v: string | number) => setF((p) => ({ ...p, [k]: v }))
  const images: Record<Category, string> = { Crochet: '/img/crochet-bag.jpg', Knitting: '/img/knitting.jpg', Amigurumi: '/img/amigurumi.jpg', Macrame: '/img/macrame.jpg' }
  return (
    <Card className="p-4 sm:p-6">
      <h3 className="mb-5 text-xl font-semibold">Publish a new workshop</h3>
      <form
        id="create-form"
        onSubmit={(e) => { e.preventDefault(); act(addWorkshop({ ...f, image: images[f.category], includes: f.includes.split(',').map((x) => x.trim()).filter(Boolean), published: true }).then(onDone)) }}
        className="grid gap-4 md:grid-cols-2"
      >
        <div className="md:col-span-2"><Label htmlFor="c-title">Title</Label><Input id="c-title" required value={f.title} onChange={(e) => set('title', e.target.value)} /></div>
        <div><Label htmlFor="c-cat">Category</Label><Select id="c-cat" value={f.category} onChange={(e) => set('category', e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></div>
        <div><Label htmlFor="c-level">Level</Label><Select id="c-level" value={f.level} onChange={(e) => set('level', e.target.value)}>{LEVELS.map((c) => <option key={c}>{c}</option>)}</Select></div>
        <div><Label htmlFor="c-date">Date</Label><Input id="c-date" required type="date" min={getTodayDateStr()} value={f.date} onChange={(e) => set('date', e.target.value)} /></div>
        <div><Label htmlFor="c-time">Time</Label><Input id="c-time" value={f.time} onChange={(e) => set('time', e.target.value)} /></div>
        <div><Label htmlFor="c-loc">Location</Label><Input id="c-loc" required value={f.location} onChange={(e) => set('location', e.target.value)} /></div>
        <div><Label htmlFor="c-city">City</Label><Input id="c-city" required value={f.city} onChange={(e) => set('city', e.target.value)} /></div>
        <div><Label htmlFor="c-price">Price (Rp)</Label><Input id="c-price" type="number" min={0} step={5000} value={f.price} onChange={(e) => set('price', +e.target.value)} /></div>
        <div><Label htmlFor="c-cap">Capacity</Label><Input id="c-cap" type="number" min={1} value={f.capacity} onChange={(e) => set('capacity', +e.target.value)} /></div>
        <div className="md:col-span-2"><Label htmlFor="c-sum">Short summary</Label><Input id="c-sum" required value={f.summary} onChange={(e) => set('summary', e.target.value)} /></div>
        <div className="md:col-span-2"><Label htmlFor="c-desc">Description</Label><Textarea id="c-desc" value={f.description} onChange={(e) => set('description', e.target.value)} /></div>
        <div className="md:col-span-2"><Label htmlFor="c-inc">Included (comma separated)</Label><Input id="c-inc" value={f.includes} onChange={(e) => set('includes', e.target.value)} /></div>
        <div className="md:col-span-2">
          <Button id="create-submit" type="submit" size="lg">Publish workshop</Button>
          <span className="ml-3 text-xs text-muted">Followers of this category will get an email.</span>
        </div>
      </form>
    </Card>
  )
}

function Outbox() {
  const s = useStore()
  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-xl font-semibold">Email outbox</h3>
      <p className="mb-4 text-sm text-muted">Simulated emails (confirmations, follower alerts, waitlist offers). Connect an email provider to send them for real.</p>
      {s.mails.length === 0 && <p className="py-8 text-center text-muted">Nothing sent yet. Make a booking or follow a category.</p>}
      <ul className="divide-y divide-line">
        {s.mails.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-4 py-3 text-sm">
            <div>
              <div className="font-medium">{m.subject}</div>
              <div className="text-xs text-muted">to {m.to}</div>
            </div>
            <div className="shrink-0 text-xs text-muted">
              {new Date(m.ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

const corpStatusVariant: Record<CorporateStatus, 'sage' | 'mustard' | 'dark' | 'terra' | 'outline'> = {
  new: 'mustard',
  contacted: 'terra',
  quoted: 'dark',
  deal: 'sage',
  completed: 'outline',
}

const corpStatusLabels: Record<CorporateStatus, string> = {
  new: 'Permintaan Baru',
  contacted: 'Sudah Dihubungi',
  quoted: 'Penawaran Terkirim',
  deal: 'Deal / Terjadwal',
  completed: 'Selesai',
}

function CorporateLeads() {
  const s = useStore()
  const [filter, setFilter] = useState<CorporateStatus | 'all'>('all')
  const [q, setQ] = useState('')
  const [viewingQuotation, setViewingQuotation] = useState<CorporateRequest | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // Form for manual lead creation
  const [manualForm, setManualForm] = useState({
    companyName: '',
    picName: '',
    email: '',
    phone: '',
    eventType: 'Corporate Team Building & Wellness',
    craftCategory: 'Crochet Bag',
    participants: 25,
    locationType: 'Client Office / Venue',
    locationCity: 'Jakarta',
    targetDate: getTodayDateStr(),
    addons: [] as string[],
    estimatedTotal: 4500000,
    costPerPax: 180000,
    notes: '',
  })

  const list = s.corporateRequests || []
  const filtered = useMemo(() => {
    return list.filter((r) => {
      const matchFilter = filter === 'all' || r.status === filter
      const matchQuery =
        !q ||
        (r.companyName + r.picName + r.craftCategory + r.eventType)
          .toLowerCase()
          .includes(q.toLowerCase())
      return matchFilter && matchQuery
    })
  }, [list, filter, q])

  const totalPipeline = useMemo(
    () => list.reduce((acc, r) => acc + (r.estimatedTotal || 0), 0),
    [list]
  )
  const newCount = useMemo(
    () => list.filter((r) => r.status === 'new').length,
    [list]
  )
  const dealCount = useMemo(
    () => list.filter((r) => r.status === 'deal' || r.status === 'completed').length,
    [list]
  )

  const handleStatusChange = (id: string, status: CorporateStatus) => {
    act(updateCorporateRequestStatus(id, status))
  }

  const handleScheduleWorkshop = (item: CorporateRequest) => {
    if (window.confirm(`Jadwalkan private workshop untuk "${item.companyName}" (${item.targetDate}) ke sistem kalender studio?`)) {
      act(convertCorporateToWorkshop(item).then(() => {
        alert(`Private workshop untuk ${item.companyName} berhasil dijadwalkan ke sistem kalender!`)
      }))
    }
  }

  const handleDeleteLead = (item: CorporateRequest) => {
    if (window.confirm(`Hapus data prospek "${item.companyName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      act(deleteCorporateRequest(item.id))
    }
  }

  const handleCreateManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualForm.companyName.trim() || !manualForm.phone.trim()) {
      alert('Nama Perusahaan dan Nomor Telepon/WhatsApp wajib diisi.')
      return
    }
    const costPerPax = Math.round(manualForm.estimatedTotal / Math.max(1, manualForm.participants))
    act(createCorporateRequest({
      ...manualForm,
      costPerPax,
    }).then(() => {
      setShowAddModal(false)
      setManualForm({
        companyName: '',
        picName: '',
        email: '',
        phone: '',
        eventType: 'Corporate Team Building & Wellness',
        craftCategory: 'Crochet Bag',
        participants: 25,
        locationType: 'Client Office / Venue',
        locationCity: 'Jakarta',
        targetDate: getTodayDateStr(),
        addons: [],
        estimatedTotal: 4500000,
        costPerPax: 180000,
        notes: '',
      })
    }))
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">Total Leads B2B</div>
          <div className="mt-2 font-display text-3xl font-bold">{list.length}</div>
          <div className="mt-1 text-xs text-muted">{newCount} permintaan baru perlu follow-up</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">Potensi Pipeline Nilai</div>
          <div className="mt-2 font-display text-3xl font-bold text-terra-dark">{rupiah(totalPipeline)}</div>
          <div className="mt-1 text-xs text-muted">Estimasi total nilai penawaran</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">Deal & Selesai</div>
          <div className="mt-2 font-display text-3xl font-bold text-sage-dark">{dealCount} Project</div>
          <div className="mt-1 text-xs text-muted">Kolaborasi berhasil terlaksana</div>
        </Card>
      </div>

      {/* Filter and Table Card */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <h3 className="text-xl font-bold text-ink">Daftar Permintaan Corporate & Private Workshop</h3>
            <p className="text-xs text-muted mt-0.5">Kelola prospek kolaborasi, status penawaran, dan kontak PIC</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="h-9 gap-1.5 text-xs bg-terra text-white hover:bg-terra-dark shadow-xs"
            >
              <PlusCircle className="size-3.5" /> Tambah Prospek Manual
            </Button>
            <Input
              placeholder="Cari perusahaan / PIC…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-9 w-full text-xs sm:w-44"
            />
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as CorporateStatus | 'all')}
              className="h-9 w-full text-xs sm:w-40"
            >
              <option value="all">Semua Status ({list.length})</option>
              <option value="new">Permintaan Baru</option>
              <option value="contacted">Sudah Dihubungi</option>
              <option value="quoted">Penawaran Terkirim</option>
              <option value="deal">Deal / Terjadwal</option>
              <option value="completed">Selesai</option>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted text-sm">
            Tidak ada permintaan B2B yang sesuai dengan filter.
          </div>
        ) : (
          <div className="divide-y divide-line/70">
            {filtered.map((item) => {
              const waFollowUpMsg = `Halo ${item.picName}, saya dari tim Straweyi ingin follow up terkait rencana ${item.eventType} (${item.craftCategory}) untuk ${item.companyName}. Apakah ada hal yang ingin didiskusikan lebih lanjut?`
              return (
                <div key={item.id} className="py-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-muted">{item.id}</span>
                        <Badge variant={corpStatusVariant[item.status]}>
                          {corpStatusLabels[item.status]}
                        </Badge>
                      </div>
                      <h4 className="mt-1 text-lg font-bold text-ink">{item.companyName}</h4>
                      <p className="text-xs text-muted">
                        PIC: <strong className="text-ink">{item.picName}</strong> · Tel: {item.phone} · {item.email || 'Tanpa email'}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-display text-xl font-bold text-terra-dark">
                        {rupiah(item.estimatedTotal)}
                      </div>
                      <div className="text-xs text-muted">
                        {item.participants} Pax · {rupiah(item.costPerPax)}/pax
                      </div>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid gap-2 rounded-2xl bg-sand/30 p-3.5 text-xs sm:grid-cols-3">
                    <div>
                      <span className="text-muted block">Jenis Workshop:</span>
                      <strong className="text-ink">{item.craftCategory}</strong>
                      <span className="text-[11px] text-muted block mt-0.5">{item.eventType}</span>
                    </div>
                    <div>
                      <span className="text-muted block">Target Jadwal & Lokasi:</span>
                      <strong className="text-ink">{item.targetDate}</strong>
                      <span className="text-[11px] text-muted block mt-0.5">{item.locationType}</span>
                    </div>
                    <div>
                      <span className="text-muted block">Add-ons:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {item.addons && item.addons.length > 0 ? (
                          item.addons.map((a, i) => (
                            <span key={i} className="rounded bg-paper px-1.5 py-0.5 text-[10px] border border-line">
                              {a}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted">Tanpa add-on</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="rounded-xl border border-line/60 bg-paper p-2.5 text-xs text-muted">
                      <strong className="text-ink">Catatan:</strong> {item.notes}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex w-full items-center gap-2 sm:w-auto">
                      <span className="text-xs text-muted font-medium">Ubah Status:</span>
                      <Select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as CorporateStatus)}
                        className="h-8 w-full py-0 text-xs sm:w-44"
                      >
                        <option value="new">Permintaan Baru</option>
                        <option value="contacted">Sudah Dihubungi</option>
                        <option value="quoted">Penawaran Terkirim</option>
                        <option value="deal">Deal / Terjadwal</option>
                        <option value="completed">Selesai</option>
                      </Select>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingQuotation(item)}
                        className="h-8 text-xs gap-1.5"
                      >
                        <Eye className="size-3.5" /> Lihat Quotation
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleScheduleWorkshop(item)}
                        className="h-8 text-xs border-sage text-sage-dark hover:bg-sage/10 gap-1.5"
                        title="Masukkan private workshop ini ke jadwal sistem kalender"
                      >
                        <CalendarPlus className="size-3.5" /> Jadwalkan ke Kalender
                      </Button>

                      <Button
                        asChild
                        size="sm"
                        variant="sage"
                        className="h-8 text-xs"
                      >
                        <a href={waLink(waFollowUpMsg, item.phone)} target="_blank" rel="noreferrer">
                          <PhoneCall className="mr-1.5 size-3" /> Chat WA PIC
                        </a>
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteLead(item)}
                        className="h-8 text-xs text-terra hover:bg-blush"
                        title="Hapus data prospek"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Quotation Sheet Modal within Admin */}
      <AnimatePresence>
        {viewingQuotation && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 p-3 backdrop-blur-sm sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl overflow-hidden rounded-3xl bg-paper shadow-lift"
            >
              <div className="flex items-center justify-between border-b border-line bg-sand/40 px-6 py-4">
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-terra" />
                  <h3 className="font-bold text-lg text-ink">Preview Dokumen Penawaran ({viewingQuotation.id})</h3>
                </div>
                <button
                  onClick={() => setViewingQuotation(null)}
                  className="grid size-8 cursor-pointer place-items-center rounded-full hover:bg-sand"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-6 text-sm">
                <div className="flex justify-between items-start border-b border-line pb-4">
                  <div>
                    <span className="font-display text-2xl font-bold text-ink">Straweyi Workshop Hub</span>
                    <p className="text-xs text-muted">PT Straweyi Kreasi Indonesia · Bandung & Jakarta</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="terra" className="font-mono text-xs">{viewingQuotation.id}</Badge>
                    <div className="text-xs text-muted mt-1">Status: {corpStatusLabels[viewingQuotation.status]}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-xl bg-sand/30 p-4 text-xs">
                  <div>
                    <span className="font-semibold text-ink">Klien:</span>
                    <div className="font-bold text-sm text-terra-dark">{viewingQuotation.companyName}</div>
                    <div className="text-muted">PIC: {viewingQuotation.picName} ({viewingQuotation.phone})</div>
                    {viewingQuotation.email && <div className="text-muted">{viewingQuotation.email}</div>}
                  </div>
                  <div>
                    <span className="font-semibold text-ink">Acara:</span>
                    <div className="text-muted">{viewingQuotation.eventType}</div>
                    <div className="text-muted">Jadwal: <strong>{viewingQuotation.targetDate}</strong></div>
                    <div className="text-muted">Lokasi: {viewingQuotation.locationType}</div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-b border-line py-3 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span>{viewingQuotation.craftCategory} ({viewingQuotation.participants} Pax)</span>
                    <span>{rupiah(viewingQuotation.estimatedTotal)}</span>
                  </div>
                  {viewingQuotation.addons && viewingQuotation.addons.length > 0 && (
                    <div className="text-muted text-[11px]">
                      Add-ons: {viewingQuotation.addons.join(', ')}
                    </div>
                  )}
                  {viewingQuotation.notes && (
                    <div className="text-muted text-[11px] italic">
                      Catatan Klien: {viewingQuotation.notes}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center font-bold text-base">
                  <span>Total Nilai Penawaran</span>
                  <span className="text-terra-dark text-lg">{rupiah(viewingQuotation.estimatedTotal)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-line bg-sand/30 px-6 py-4">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
                  <Printer className="size-3.5" /> Cetak / Print PDF
                </Button>
                <Button size="sm" onClick={() => setViewingQuotation(null)} className="text-xs">
                  Tutup
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Lead Creation Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 p-3 backdrop-blur-sm sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg overflow-hidden rounded-3xl bg-paper shadow-lift"
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-sand/30">
                <h3 className="font-bold text-lg text-ink">Tambah Prospek B2B Manual</h3>
                <button onClick={() => setShowAddModal(false)} className="grid size-8 place-items-center rounded-full hover:bg-sand">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleCreateManualSubmit} className="p-6 space-y-3.5 text-xs">
                <div>
                  <Label htmlFor="m-company" className="text-xs">Nama Perusahaan / Komunitas *</Label>
                  <Input id="m-company" required value={manualForm.companyName} onChange={(e) => setManualForm({ ...manualForm, companyName: e.target.value })} className="h-9 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="m-pic" className="text-xs">Nama PIC</Label>
                    <Input id="m-pic" value={manualForm.picName} onChange={(e) => setManualForm({ ...manualForm, picName: e.target.value })} className="h-9 text-xs" />
                  </div>
                  <div>
                    <Label htmlFor="m-phone" className="text-xs">No. WhatsApp *</Label>
                    <Input id="m-phone" required value={manualForm.phone} onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })} className="h-9 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="m-craft" className="text-xs">Kategori Craft</Label>
                    <Input id="m-craft" value={manualForm.craftCategory} onChange={(e) => setManualForm({ ...manualForm, craftCategory: e.target.value })} className="h-9 text-xs" />
                  </div>
                  <div>
                    <Label htmlFor="m-pax" className="text-xs">Jumlah Peserta (Pax)</Label>
                    <Input id="m-pax" type="number" min={5} value={manualForm.participants} onChange={(e) => setManualForm({ ...manualForm, participants: +e.target.value })} className="h-9 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="m-total" className="text-xs">Estimasi Total Budget (Rp)</Label>
                    <Input id="m-total" type="number" min={0} step={100000} value={manualForm.estimatedTotal} onChange={(e) => setManualForm({ ...manualForm, estimatedTotal: +e.target.value })} className="h-9 text-xs" />
                  </div>
                  <div>
                    <Label htmlFor="m-date" className="text-xs">Target Tanggal</Label>
                    <Input id="m-date" type="date" value={manualForm.targetDate} onChange={(e) => setManualForm({ ...manualForm, targetDate: e.target.value })} className="h-9 text-xs" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="m-notes" className="text-xs">Catatan Tambahan</Label>
                  <Textarea id="m-notes" rows={2} value={manualForm.notes} onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })} className="text-xs" />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-line">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>Batal</Button>
                  <Button type="submit" size="sm" className="bg-terra text-white hover:bg-terra-dark">Simpan Prospek</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Admin() {
  useEffect(() => { void loadAdmin() }, [])
  const [tab, setTab] = useState<Tab>('overview')
  const [editing, setEditing] = useState<Workshop | null>(null)
  const newCorpCount = (useStore().corporateRequests || []).filter((r) => r.status === 'new').length
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="dark" className="mb-3">Organizer dashboard</Badge>
          <h1 className="text-3xl font-bold sm:text-4xl">Studio control room</h1>
          <p className="mt-1 text-muted">Signed in as organizer. Live data from Supabase.</p>
        </div>
        <div className="flex gap-2">
          <LogoutButton />
          {!supabaseReady && (
            <Button variant="outline" size="sm" onClick={() => { if (window.confirm('Reset all demo data?')) resetDemo() }}>
              <RotateCcw className="size-4" />Reset demo data
            </Button>
          )}
        </div>
      </div>
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mb-8 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0" role="tablist">
        {TABS.map(([k, label, Icon]) => (
          <button
            key={k} id={`tab-${k}`} role="tab" aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={cn('flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-semibold transition sm:py-2',
              tab === k ? 'border-ink bg-ink text-cream' : 'border-line bg-paper hover:bg-sand')}
          >
            <Icon className="size-4" />
            {label}
            {k === 'corporate' && newCorpCount > 0 && (
              <span className="rounded-full bg-terra px-2 py-0.5 text-[10px] font-bold text-white leading-none">
                {newCorpCount} baru
              </span>
            )}
          </button>
        ))}
      </div>
      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {tab === 'overview' && <Overview onEdit={(w) => setEditing(w)} />}
        {tab === 'registrations' && <Registrations />}
        {tab === 'corporate' && <CorporateLeads />}
        {tab === 'checkin' && <CheckIn />}
        {tab === 'create' && <Create onDone={() => setTab('overview')} />}
        {tab === 'outbox' && <Outbox />}
      </motion.div>

      <AnimatePresence>
        {editing && <EditModal w={editing} onClose={() => setEditing(null)} />}
      </AnimatePresence>
    </div>
  )
}
