import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseReady = Boolean(url && key)

export const supabase = supabaseReady
  ? createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true } })
  : null

export const ADMIN_EMAIL = ((import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ?? '').trim().toLowerCase()
export const ADMIN_PATH = '/' + (((import.meta.env.VITE_ADMIN_PATH as string | undefined) ?? 'studio-admin').replace(/^\/+/, ''))
