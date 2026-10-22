import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const rupiah = (n: number) =>
  n === 0 ? 'Free' : 'Rp' + n.toLocaleString('id-ID')

export const fmtDate = (iso: string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', opts ?? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

/** Normalize Indonesian numbers to international format without '+' (08xx -> 628xx). */
export const normalizePhone = (p: string) => {
  const d = p.replace(/\D/g, '')
  return d.startsWith('0') ? '62' + d.slice(1) : d
}

/** Click-to-chat link. Without a number, WhatsApp lets the user pick the contact. */
export const waLink = (text: string, phone?: string) =>
  `https://wa.me/${phone ? normalizePhone(phone) : ''}?text=${encodeURIComponent(text)}`

export const ADMIN_WA = (import.meta.env.VITE_WA_NUMBER as string | undefined) ?? ''
