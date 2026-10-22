import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { QRCodeSVG } from 'qrcode.react'
import { CalendarDays, Clock, Hourglass, MapPin, MessageCircle, PartyPopper, Printer, Wallet } from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { getRegistration, setStatus, useStore, type Registration } from '@/lib/store'
import { supabaseReady } from '@/lib/supabase'
import { ADMIN_WA, fmtDate, rupiah, waLink } from '@/lib/utils'

export default function TicketPage() {
  const { code } = useParams()
  const s = useStore()
  const [fetched, setFetched] = useState<Registration | null | undefined>(undefined)
  useEffect(() => {
    let on = true
    if (code) getRegistration(code).then((x) => { if (on) setFetched(x) })
    return () => { on = false }
  }, [code])
  // demo mode reads live from the store so status changes show instantly
  const r = supabaseReady ? fetched : s.registrations.find((x) => x.code === code)
  const w = r && s.workshops.find((x) => x.id === r.workshopId)

  if ((r === undefined || !s.ready) && supabaseReady) return <div className="py-32 text-center text-muted">Loading your ticket…</div>
  if (!r || !w) return <div className="py-32 text-center"><h1 className="text-4xl font-semibold">Ticket not found</h1><Button asChild className="mt-6"><Link to="/">Browse workshops</Link></Button></div>

  const paid = r.status === 'paid'
  const waiting = r.status === 'waitlist'
  const offered = r.status === 'offered'

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 print:max-w-none print:p-0">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center print:hidden">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-sage/30 text-sage-dark">{waiting ? <Hourglass /> : <PartyPopper />}</div>
        <h1 className="text-4xl font-bold">{waiting ? "You're on the waitlist" : paid ? "You're in!" : 'Seat reserved'}</h1>
        <p className="mt-2 text-muted">{waiting ? "We'll email you the moment a seat opens up." : <>A confirmation was sent to <strong className="text-ink">{r.email}</strong>.</>}</p>
      </motion.div>

      {/* Print-only header */}
      <div className="hidden border-b-2 border-line pb-4 print:mb-6 print:block">
        <h1 className="text-2xl font-bold font-display text-terra-dark">Straweyi Workshop Hub</h1>
        <p className="text-xs text-muted">Official Workshop Pass & E-Ticket</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 24, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: 'spring', delay: 0.1 }} className="overflow-hidden rounded-[2rem] border border-line bg-paper shadow-lift md:flex print:rounded-2xl print:border-2 print:border-ink/20 print:shadow-none">
        <div className="flex-1 p-7">
          <Badge variant={paid ? 'sage' : waiting ? 'dark' : 'mustard'} id="ticket-status">{paid ? 'Paid' : waiting ? 'Waitlist' : offered ? 'Seat offered, payment due' : 'Awaiting payment'}</Badge>
          <h2 className="mt-3 text-2xl font-semibold">{w.title}</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li className="flex items-center gap-2"><CalendarDays className="size-4 text-terra" />{fmtDate(w.date)}</li>
            <li className="flex items-center gap-2"><Clock className="size-4 text-terra" />{w.time}</li>
            <li className="flex items-center gap-2"><MapPin className="size-4 text-terra" />{w.location}, {w.city}</li>
          </ul>
          <div className="stitch my-5" />
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-xs uppercase tracking-wider text-muted">Name</dt><dd className="font-medium">{r.name}</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-muted">Tickets</dt><dd className="font-medium">{r.tickets}</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-muted">Booking code</dt><dd className="font-mono font-semibold">{r.code}</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-muted">Total</dt><dd className="font-medium">{waiting ? '—' : rupiah(r.total)}</dd></div>
          </dl>
        </div>
        <div className="flex flex-col items-center justify-center border-t-2 border-dashed border-line bg-sand/50 p-7 md:w-60 md:border-l-2 md:border-t-0 print:bg-white print:border-ink/20">
          <div className={`rounded-2xl bg-white p-3 transition print:border print:border-line ${paid ? '' : 'opacity-30 blur-[2px]'}`}>
            <QRCodeSVG value={r.code} size={150} fgColor="#3b2430" />
          </div>
          <p className="mt-3 text-center text-xs text-muted">{paid ? 'Show this QR at check-in' : 'QR activates after payment is confirmed'}</p>
        </div>
      </motion.div>

      {(r.status === 'pending' || offered) && (
        <Card className="mt-8 p-6 print:hidden">
          <h3 className="flex items-center gap-2 text-xl font-semibold"><Wallet className="size-5 text-terra" />Complete your payment via WhatsApp</h3>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">
            <li>Chat our admin on WhatsApp with your booking code <span className="font-mono font-semibold text-ink">{r.code}</span> (total <strong className="text-ink">{rupiah(r.total)}</strong>).</li>
            <li>Pay following the admin's instructions and send the proof of transfer.</li>
            <li>Once confirmed, your <strong className="text-ink">QR ticket is activated</strong> and sent to your email &amp; WhatsApp.</li>
          </ol>
          <Button asChild id="wa-confirm" className="mt-4 w-full gap-2">
            <a href={waLink(`Halo Straweyi, saya ingin konfirmasi pembayaran workshop "${w.title}".\nKode booking: ${r.code}\nNama: ${r.name}\nJumlah tiket: ${r.tickets}\nTotal: ${rupiah(r.total)}`, ADMIN_WA)} target="_blank" rel="noreferrer"><MessageCircle className="size-4" />Chat admin on WhatsApp</a>
          </Button>
          {supabaseReady ? (
            <p className="mt-4 rounded-xl bg-mustard/20 p-4 text-sm">Keep this page's link. Your ticket QR activates as soon as we confirm your payment.</p>
          ) : (
            <div className="mt-4 rounded-xl bg-mustard/20 p-4 text-sm">
              <strong>Demo mode:</strong> there is no real payment gateway yet. Use the button below to simulate a confirmed payment.
              <Button id="simulate-payment" className="mt-3 w-full" onClick={() => void setStatus(r.id, 'paid')}>Simulate payment received</Button>
            </div>
          )}
        </Card>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 print:hidden">
        <Button id="print-ticket" variant="default" onClick={() => window.print()} className="gap-2">
          <Printer className="size-4" /> Cetak / Simpan Tiket (PDF)
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Back to workshops</Link>
        </Button>
      </div>
    </div>
  )
}
