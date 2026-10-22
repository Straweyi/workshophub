import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import { RequireAdmin } from '@/components/AdminGuard'
import { ADMIN_PATH } from '@/lib/supabase'

const WorkshopDetail = lazy(() => import('@/pages/WorkshopDetail'))
const TicketPage = lazy(() => import('@/pages/Ticket'))
const Admin = lazy(() => import('@/pages/Admin'))
const About = lazy(() => import('@/pages/About'))
const CorporateBooking = lazy(() => import('@/pages/CorporateBooking'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Loading…</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/corporate" element={<CorporateBooking />} />
            <Route path="/workshop/:slug" element={<WorkshopDetail />} />
            <Route path="/ticket/:code" element={<TicketPage />} />
            <Route path={ADMIN_PATH} element={<RequireAdmin><Admin /></RequireAdmin>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
