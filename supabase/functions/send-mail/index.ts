// Supabase Edge Function: sends an email via Resend when a row is inserted into mail_log.
// Triggered by a Database Webhook (INSERT on public.mail_log).
// Secrets: RESEND_API_KEY, MAIL_FROM, SITE_URL, WEBHOOK_SECRET (SUPABASE_* are built in).
import { createClient } from 'npm:@supabase/supabase-js@2'

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))

Deno.serve(async (req) => {
  if (req.headers.get('x-webhook-secret') !== Deno.env.get('WEBHOOK_SECRET')) {
    return new Response('unauthorized', { status: 401 })
  }

  const { record } = await req.json()
  if (!record?.id || record.sent_at) return new Response('skip')

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const site = (Deno.env.get('SITE_URL') ?? '').replace(/\/$/, '')
  const code: string | undefined = record.code ?? /SW-[A-Z0-9]{8}/.exec(record.subject)?.[0]
  const link = code ? `${site}/ticket/${code}` : site

  // QR is shown ONLY once payment is confirmed (status = paid)
  let paid = false
  if (code) {
    const { data } = await db.from('registrations').select('status').eq('code', code).maybeSingle()
    paid = data?.status === 'paid'
  }
  const qr = paid ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(code!)}` : ''

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#2b2430">
    <h2 style="margin:0 0 12px">${esc(record.subject)}</h2>
    ${code ? `<p>Your booking code: <b>${esc(code)}</b></p>` : ''}
    ${paid ? `<p>Show this QR at check-in:</p><p><img src="${qr}" width="220" height="220" alt="QR ticket ${esc(code!)}"></p>` : code ? '<p>To get your QR ticket, complete payment by chatting our admin on WhatsApp. We will send the QR here once confirmed.</p>' : ''}
    ${code ? `<p><a href="${link}" style="display:inline-block;background:#c2457a;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none">View your ticket</a></p>` : ''}
    <p style="color:#888;font-size:12px">Straweyi Workshop Hub</p>
  </div>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: Deno.env.get('MAIL_FROM'), to: [record.to_email], subject: record.subject, html }),
  })

  if (res.ok) {
    await db.from('mail_log').update({ sent_at: new Date().toISOString(), error: null }).eq('id', record.id)
    return new Response('sent')
  }
  const error = (await res.text()).slice(0, 500)
  await db.from('mail_log').update({ error }).eq('id', record.id)
  return new Response(error, { status: 502 })
})
