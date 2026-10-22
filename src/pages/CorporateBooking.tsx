import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Building2, Users, MapPin, Sparkles, CheckCircle2,
  Clock, ShieldCheck, PhoneCall,
  FileText, Printer, Copy, HelpCircle, X,
  Calculator, Palette, CalendarCheck2, AlertCircle, Eye, Sliders,
  Send, Loader2
} from 'lucide-react'
import { Badge, Button, Card, Input, Label, Textarea } from '@/components/ui'
import { createCorporateRequest, getTodayDateStr, useStore } from '@/lib/store'
import { cn, rupiah, waLink } from '@/lib/utils'

// Configuration Options
const EVENT_TYPES = [
  { id: 'team-building', label: 'Corporate Team Building & Wellness', desc: 'Meningkatkan fokus, bonding tim, dan relaksasi mindful crafting.' },
  { id: 'brand-activation', label: 'Brand Activation & PR Launching Event', desc: 'Aktivasi interaktif bersama influencer, media, & VIP audience.' },
  { id: 'vip-gathering', label: 'VIP Customer & Community Gathering', desc: 'Pengalaman eksklusif premium untuk loyal client atau nasabah prioritas.' },
  { id: 'private-party', label: 'Private Gathering (Bridal Shower / Birthday)', desc: 'Sesi intim bersama teman terdekat dalam suasana hangat dan estetik.' },
  { id: 'campus-school', label: 'Campus & School Creative Workshop', desc: 'Edukasi keterampilan tangan dan kreativitas untuk pelajar/mahasiswa.' },
]

const CRAFT_PACKAGES = [
  {
    id: 'crochet-bag',
    title: 'Crochet Striped Tote Bag',
    category: 'Crochet',
    basePrice: 185000,
    duration: '3.5 - 4 Hours',
    desc: 'Peserta merajut tote bag katun bergaris cantik dari nol hingga jadi dan siap pakai.',
    image: '/img/crochet-bag.jpg',
    includes: ['Benang katun premium 2 warna', 'Ergonomic crochet hook', 'Stitch marker & darning needle', 'Printed pattern guide'],
  },
  {
    id: 'amigurumi-mascot',
    title: 'Amigurumi Mascot / Doll',
    category: 'Amigurumi',
    basePrice: 225000,
    duration: '4 Hours',
    desc: 'Membuat boneka rajut mini atau maskot brand yang menggemaskan dengan detail bordir.',
    image: '/img/amigurumi.jpg',
    includes: ['Benang katun halus & dakron steril', 'Safety eyes & aksesoris', 'Jarum & peniti penanda', 'Step-by-step booklet'],
  },
  {
    id: 'macrame-hanging',
    title: 'Boho Macramé Wall Hanging',
    category: 'Macrame',
    basePrice: 195000,
    duration: '3 Hours',
    desc: 'Seni simpul tali katun alami pada kayu dowel untuk hiasan dinding estetik.',
    image: '/img/macrame.jpg',
    includes: ['Tali katun natural 4mm', 'Dowel kayu pinus halus', 'Sisir macrame & gantungan', 'Lembar panduan 5 simpul'],
  },
  {
    id: 'knitting-scarf',
    title: 'Cozy Knitting Scarf / Beanie',
    category: 'Knitting',
    basePrice: 175000,
    duration: '3 Hours',
    desc: 'Merajut syal atau topi hangat dengan jarum knit bundar yang nyaman untuk pemula.',
    image: '/img/knitting.jpg',
    includes: ['Benang wol wool-blend lembut', 'Jarum rajut bambu premium', 'Pom-pom maker / label kulit', 'Video panduan lanjutan'],
  },
  {
    id: 'custom-bar',
    title: 'Custom Multi-Craft Creative Bar',
    category: 'Custom Experience',
    basePrice: 250000,
    duration: '4 - 5 Hours',
    desc: 'Kombinasi fleksibel di mana peserta bebas memilih craft favorit di station yang disiapkan.',
    image: '/img/crochet-bag.jpg',
    includes: ['Pilihan craft station bervariasi', 'Instruktur spesialis per meja', 'Custom signage & welcome kit', 'Full personalized hampers'],
  },
]

const DURATION_FORMATS = [
  { id: 'express', label: 'Express Pop-Up (1.5 - 2 Jam)', multiplier: 0.85, tag: 'Hemat 15%', desc: 'Cocok untuk booth aktivasi, pop-up store, atau sesi ringkas padat.' },
  { id: 'standard', label: 'Standard Experience (3.5 - 4 Jam)', multiplier: 1.0, tag: 'Rekomendasi Utama', desc: 'Durasi ideal: peserta menyelesaikan 100% karya utuh dari nol.' },
  { id: 'intensive', label: 'Full-Day Intensive (5 - 6 Jam)', multiplier: 1.25, tag: 'Masterclass', desc: 'Pembahasan teknik mendalam dengan break santai & bimbingan personal.' },
]

const COLOR_PALETTES = [
  { id: 'terracotta', name: 'Warm Terracotta & Sand', colors: ['#c45b41', '#f5ded6', '#3b2430'], desc: 'Nuansa hangat, earthy, & signature Straweyi' },
  { id: 'blush', name: 'Pastel Blossom & Lilac', colors: ['#e8799f', '#fce8ef', '#5a2e46'], desc: 'Lembut, manis, ceria, & estetik' },
  { id: 'corporate-blue', name: 'Executive Navy & Gold', colors: ['#1e3a5f', '#d4af37', '#e8f0f8'], desc: 'Elegan, formal, prestisius untuk perbankan & tech' },
  { id: 'forest-sage', name: 'Botanical Sage & Forest', colors: ['#4a6b57', '#9db8a1', '#213326'], desc: 'Segar, mindful, menenangkan, & nuansa alam' },
  { id: 'monochrome', name: 'Monochrome Warm Charcoal', colors: ['#2b2b2b', '#8a8a8a', '#f5f5f5'], desc: 'Minimalis modern, clean, & universal' },
]

const LOCATION_OPTIONS = [
  { id: 'client-venue', label: 'Kantor / Venue Klien (Jabodetabek / Bandung)', travelCost: 0, desc: 'Tim instruktur kami hadir membawa seluruh perlengkapan ke lokasi Anda.' },
  { id: 'straweyi-studio', label: 'Straweyi Creative Studio (Dago, Bandung)', travelCost: 0, desc: 'Venue estetik berkapasitas s.d 40 orang lengkap dengan sound system & pantry.' },
  { id: 'luar-kota', label: 'Luar Kota (Surabaya, Bali, Jogja, Semarang, dll)', travelCost: 1500000, desc: 'Instruktur kami siap ditugaskan ke kota Anda (akomodasi & transport disesuaikan).' },
  { id: 'hybrid-virtual', label: 'Virtual / Hybrid (DIY Kit dikirim ke rumah)', travelCost: 0, desc: 'Materi dikirim ke alamat rumah masing-masing peserta + sesi live via Zoom.' },
]

const ADDONS = [
  { id: 'box-branding', label: 'Custom Box Packaging dengan Logo Perusahaan', pricePerPax: 25000, flat: false, desc: 'Kotak kit eksklusif dengan sleeve/stiker identitas brand Anda.' },
  { id: 'wooden-tag', label: 'Laser-Cut Wooden Souvenir Tag', pricePerPax: 15000, flat: false, desc: 'Tag kayu berukir nama event atau nama masing-masing peserta.' },
  { id: 'photo-video', label: 'Dokumentasi Foto Profesional & 60s Reel Highlight', pricePerPax: 1500000, flat: true, desc: 'Fotografer & videografer khusus untuk konten media sosial perusahaan.' },
  { id: 'coffee-pastry', label: 'Artisan Coffee & Pastry Break Box', pricePerPax: 45000, flat: false, desc: 'Cold brew specialty & croissant/pastry segar untuk camilan santai.' },
]

const CLIENT_LOGOS = [
  'TikTok Indonesia', 'Shopee Indonesia', 'Bank Central Asia (BCA)', 'Bank Mandiri',
  'Kementerian Perindustrian RI', 'DJP (Direktorat Jenderal Pajak)', 'DJI Indonesia',
  'IOM UN Migration', '@america (US Embassy)', 'Transjakarta', 'Lazada Indonesia', 'Wardah'
]

const B2B_TESTIMONIALS = [
  {
    quote: 'Sesi workshop rajut dari Straweyi jadi salah satu team-building paling disukai karyawan kami. Rasio instruktur sangat memadai sehingga yang belum pernah pegang benang pun bisa bawa pulang tas jadi!',
    author: 'Karina W.',
    role: 'People & Culture Manager',
    company: 'Tech Enterprise Jakarta',
    pax: '45 Peserta',
  },
  {
    quote: 'Kolaborasi Straweyi untuk media gathering kami berjalan sukses besar. Craft kit yang disiapkan sangat premium dengan branding logo kami yang rapi. Tamu-tamu VIP sangat terkesan!',
    author: 'Dimas S.',
    role: 'PR & Corporate Communications Lead',
    company: 'FMCG Brand Activation',
    pax: '30 Peserta VIP',
  },
]

export default function CorporateBooking() {
  const store = useStore()

  // Calculator Mode: 'pax' (by participants) or 'budget' (fit to company budget)
  const [calcMode, setCalcMode] = useState<'pax' | 'budget'>('pax')
  const [budgetLimit, setBudgetLimit] = useState<number>(10000000)

  // Configurator state
  const [eventType, setEventType] = useState(EVENT_TYPES[0].id)
  const [selectedCraft, setSelectedCraft] = useState(CRAFT_PACKAGES[0].id)
  const [participants, setParticipants] = useState(30)
  const [durationFormat, setDurationFormat] = useState(DURATION_FORMATS[1].id)
  const [colorPalette, setColorPalette] = useState(COLOR_PALETTES[0].id)
  const [locationType, setLocationType] = useState(LOCATION_OPTIONS[0].id)
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['box-branding'])

  // Right panel view: 'breakdown' or 'live-preview'
  const [rightPanelView, setRightPanelView] = useState<'breakdown' | 'live-preview'>('breakdown')

  // Contact form state
  const [companyName, setCompanyName] = useState('')
  const [picName, setPicName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [notes, setNotes] = useState('')

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showLetterModal, setShowLetterModal] = useState(false)
  const [submittedQuotation, setSubmittedQuotation] = useState<{
    id: string
    companyName: string
    picName: string
    email: string
    phone: string
    craftTitle: string
    eventLabel: string
    participants: number
    locationLabel: string
    targetDate: string
    estimatedTotal: number
    costPerPax: number
    addonsList: string[]
    paletteName: string
    durationLabel: string
  } | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // Package calculation
  const craft = CRAFT_PACKAGES.find((c) => c.id === selectedCraft) || CRAFT_PACKAGES[0]
  const location = LOCATION_OPTIONS.find((l) => l.id === locationType) || LOCATION_OPTIONS[0]
  const duration = DURATION_FORMATS.find((d) => d.id === durationFormat) || DURATION_FORMATS[1]
  const palette = COLOR_PALETTES.find((p) => p.id === colorPalette) || COLOR_PALETTES[0]

  // Tier discount calculation
  const effectivePax = participants
  const tierDiscountPct = useMemo(() => {
    if (effectivePax >= 100) return 0.20 // 20%
    if (effectivePax >= 50) return 0.15  // 15%
    if (effectivePax >= 25) return 0.10  // 10%
    return 0
  }, [effectivePax])

  // Calculation breakdown
  const calculation = useMemo(() => {
    const adjustedBasePrice = Math.round(craft.basePrice * duration.multiplier)
    const rawKitSubtotal = adjustedBasePrice * effectivePax
    const discountAmount = Math.round(rawKitSubtotal * tierDiscountPct)
    const discountedKitSubtotal = rawKitSubtotal - discountAmount

    let addonsTotal = 0
    selectedAddons.forEach((addonId) => {
      const item = ADDONS.find((a) => a.id === addonId)
      if (item) {
        addonsTotal += item.flat ? item.pricePerPax : item.pricePerPax * effectivePax
      }
    })

    const travelFee = location.travelCost
    const total = Math.round(discountedKitSubtotal + addonsTotal + travelFee)
    const perPax = Math.round(total / Math.max(1, effectivePax))

    return {
      adjustedBasePrice,
      rawKitSubtotal,
      discountAmount,
      discountedKitSubtotal,
      addonsTotal,
      travelFee,
      total,
      perPax,
    }
  }, [craft.basePrice, duration.multiplier, effectivePax, tierDiscountPct, selectedAddons, location.travelCost])

  // Reverse budget calculation when in 'budget' mode
  const budgetRecommendation = useMemo(() => {
    if (calcMode !== 'budget') return null
    const adjustedBase = Math.round(craft.basePrice * duration.multiplier)
    // Approximate addons cost per pax
    let perPaxAddons = 0
    let flatAddons = 0
    selectedAddons.forEach((id) => {
      const a = ADDONS.find((item) => item.id === id)
      if (a) {
        if (a.flat) flatAddons += a.pricePerPax
        else perPaxAddons += a.pricePerPax
      }
    })
    const netBudget = Math.max(0, budgetLimit - flatAddons - location.travelCost)
    const costPerPersonApprox = (adjustedBase * (1 - tierDiscountPct)) + perPaxAddons
    const maxPaxPossible = Math.max(5, Math.floor(netBudget / Math.max(1, costPerPersonApprox)))
    return {
      maxPaxPossible,
      surplus: budgetLimit - calculation.total,
    }
  }, [calcMode, craft.basePrice, duration.multiplier, selectedAddons, budgetLimit, location.travelCost, tierDiscountPct, calculation.total])

  // Dynamic Date Availability Intelligence from server schedule
  const dateAvailability = useMemo(() => {
    if (!targetDate) return null
    const clash = store.workshops.find((w) => w.date === targetDate)
    if (clash) {
      return {
        available: false,
        status: 'clash',
        message: `Catatan: Studio Straweyi sudah memiliki jadwal workshop reguler ("${clash.title}") pada ${targetDate}.`,
        suggestion: 'Rekomendasi terbaik: Sesi On-Site di Kantor/Venue Anda atau pilih tanggal luang lainnya.',
      }
    }
    return {
      available: true,
      status: 'free',
      message: `✨ Tanggal ${targetDate} tersedia! Studio maupun tim instruktur siap dibooking secara eksklusif.`,
      suggestion: 'Segera ajukan penawaran untuk mengunci ketersediaan jadwal instruktur.',
    }
  }, [targetDate, store.workshops])

  // Instructor requirement counter
  const instructorsCount = useMemo(() => Math.max(1, Math.ceil(effectivePax / 8)), [effectivePax])

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  // Pre-formatted WhatsApp Message generator
  const generateWhatsAppMessage = () => {
    const chosenAddonNames = selectedAddons
      .map((id) => ADDONS.find((a) => a.id === id)?.label)
      .filter(Boolean)
      .join(', ')

    const msg = `Halo Tim Straweyi, saya tertarik mengajukan Private / Corporate Workshop:

• Perusahaan / Komunitas: ${companyName || '(Belum diisi)'}
• PIC: ${picName || '(Belum diisi)'} (${phone || '-'})
• Jenis Acara: ${EVENT_TYPES.find((e) => e.id === eventType)?.label}
• Pilihan Craft: ${craft.title} (${duration.label})
• Nuansa Warna Benang: ${palette.name}
• Jumlah Peserta: ${effectivePax} Orang (Diskon Grup ${tierDiscountPct * 100}%)
• Kebutuhan Tim: ${instructorsCount} Instruktur Straweyi (Rasio 1:8)
• Lokasi Acara: ${location.label}
• Rencana Tanggal: ${targetDate || 'Fleksibel'}
• Add-ons: ${chosenAddonNames || 'Tanpa add-ons'}
• Estimasi Investasi: ${rupiah(calculation.total)} (${rupiah(calculation.perPax)} / pax)
${notes ? `• Catatan Khusus: ${notes}` : ''}

Mohon informasi ketersediaan jadwal & pengiriman quotation resmi. Terima kasih!`

    return msg
  }

  const handleWhatsAppClick = () => {
    // Automatically record lead in Admin if company name or phone is provided
    if (companyName.trim() || phone.trim() || picName.trim()) {
      try {
        const chosenAddonNames = selectedAddons
          .map((id) => ADDONS.find((a) => a.id === id)?.label)
          .filter(Boolean) as string[]

        void createCorporateRequest({
          companyName: companyName.trim() || 'Calon Klien (WhatsApp)',
          picName: picName.trim() || 'PIC WhatsApp',
          email: email.trim(),
          phone: phone.trim() || 'Direct WhatsApp',
          eventType: EVENT_TYPES.find((e) => e.id === eventType)?.label || eventType,
          craftCategory: `${craft.title} (${palette.name})`,
          participants: effectivePax,
          locationType: location.label,
          locationCity: location.label,
          targetDate: targetDate || getTodayDateStr(),
          addons: chosenAddonNames,
          estimatedTotal: calculation.total,
          costPerPax: calculation.perPax,
          notes: notes.trim() ? `[Via WhatsApp Direct] ${notes.trim()}` : '[Diajukan langsung via WhatsApp Bisnis]',
        })
      } catch (err) {
        console.warn('Auto-save WA inquiry lead error:', err)
      }
    }
    const text = generateWhatsAppMessage()
    window.open(waLink(text, '6289601554639'), '_blank')
  }

  // Submit formal request into system & open Quotation modal
  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName.trim() || !picName.trim() || !phone.trim()) {
      alert('Mohon lengkapi Nama Perusahaan, Nama PIC, dan Nomor WhatsApp Anda.')
      return
    }

    setSubmitting(true)
    try {
      const chosenAddonNames = selectedAddons
        .map((id) => ADDONS.find((a) => a.id === id)?.label)
        .filter(Boolean) as string[]

      const req = await createCorporateRequest({
        companyName: companyName.trim(),
        picName: picName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        eventType: EVENT_TYPES.find((e) => e.id === eventType)?.label || eventType,
        craftCategory: `${craft.title} (${palette.name})`,
        participants: effectivePax,
        locationType: location.label,
        locationCity: location.label,
        targetDate: targetDate || getTodayDateStr(),
        addons: chosenAddonNames,
        estimatedTotal: calculation.total,
        costPerPax: calculation.perPax,
        notes: notes.trim(),
      })

      setSubmittedQuotation({
        id: req.id,
        companyName: req.companyName,
        picName: req.picName,
        email: req.email,
        phone: req.phone,
        craftTitle: craft.title,
        eventLabel: EVENT_TYPES.find((e) => e.id === eventType)?.label || eventType,
        participants: effectivePax,
        locationLabel: location.label,
        targetDate: targetDate || 'To be scheduled',
        estimatedTotal: calculation.total,
        costPerPax: calculation.perPax,
        addonsList: chosenAddonNames,
        paletteName: palette.name,
        durationLabel: duration.label,
      })
      setShowSuccessModal(true)
      setShowLetterModal(false)
    } catch {
      alert('Terjadi kendala saat menyimpan permintaan. Silakan hubungi kami via WhatsApp.')
    } finally {
      setSubmitting(false)
    }
  }

  const copyQuotationSummary = async () => {
    const text = generateWhatsAppMessage()
    await navigator.clipboard.writeText(text)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:py-16">
      {/* Hero Section */}
      <div className="relative mb-14 text-center">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-block">
          <Badge variant="terra" className="mb-4 shadow-xs">
            <Building2 className="mr-1.5 size-3.5" /> B2B & Private Craft Experiences
          </Badge>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
        >
          Elevate Your Team with <br />
          <span className="text-terra">Hands-On Crafting.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-4 max-w-2xl text-base text-muted sm:text-lg"
        >
          Kalkulator interaktif penawaran workshop kreatif untuk corporate team-building, PR brand activation, dan private gathering.
          Pilih paket, sesuaikan budget, dan dapatkan simulasi biaya transparan secara instan.
        </motion.p>

        {/* Highlight Stats Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-4 py-1.5 text-xs font-semibold shadow-soft sm:text-sm">
            <ShieldCheck className="size-4 text-sage-dark" /> 170+ Brand Collaborations
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-4 py-1.5 text-xs font-semibold shadow-soft sm:text-sm">
            <Users className="size-4 text-terra" /> Rasio Instruktur 1 : 8 Peserta
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-4 py-1.5 text-xs font-semibold shadow-soft sm:text-sm">
            <Sparkles className="size-4 text-mustard" /> Custom Logo Box & Merchandise
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-4 py-1.5 text-xs font-semibold shadow-soft sm:text-sm">
            <MapPin className="size-4 text-terra" /> Seluruh Indonesia & Virtual
          </span>
        </div>

        {/* Dynamic Calculator Mode Switcher */}
        <div className="mt-10 mx-auto max-w-md rounded-full border border-line bg-paper p-1 shadow-soft flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => setCalcMode('pax')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 px-4 text-xs font-bold transition cursor-pointer',
              calcMode === 'pax' ? 'bg-ink text-cream shadow-xs' : 'text-muted hover:text-ink'
            )}
          >
            <Users className="size-3.5" /> Hitung Berdasarkan Jumlah Peserta
          </button>
          <button
            type="button"
            onClick={() => setCalcMode('budget')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 px-4 text-xs font-bold transition cursor-pointer',
              calcMode === 'budget' ? 'bg-terra text-white shadow-xs' : 'text-muted hover:text-ink'
            )}
          >
            <Calculator className="size-3.5" /> Sesuaikan dengan Budget Kantor
          </button>
        </div>
      </div>

      {/* Main Two-Column Simulator Section */}
      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] items-start">
        {/* Left Column: Form Configurator */}
        <div className="space-y-8">

          {/* Dynamic Budget Slider (if in budget mode) */}
          {calcMode === 'budget' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 border-2 border-terra/30 bg-gradient-to-br from-paper via-sand/20 to-blush/20">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="size-5 text-terra" />
                    <h3 className="text-base font-bold text-ink">Plafon Budget Kantor Anda</h3>
                  </div>
                  <Badge variant="terra" className="text-xs font-bold">Mode Target Budget</Badge>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">Tentukan batas anggaran:</span>
                    <span className="font-display text-2xl font-bold text-terra-dark">{rupiah(budgetLimit)}</span>
                  </div>
                  <input
                    type="range"
                    min={3000000}
                    max={30000000}
                    step={500000}
                    value={budgetLimit}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setBudgetLimit(val)
                      // auto-adjust pax based on target budget
                      const approxCostPerPax = craft.basePrice * duration.multiplier * 0.9
                      const estPax = Math.max(10, Math.floor(val / approxCostPerPax))
                      setParticipants(estPax)
                    }}
                    className="w-full accent-terra h-2.5 bg-sand rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-muted">
                    <span>Rp 3 Juta</span>
                    <span>Rp 15 Juta</span>
                    <span>Rp 30 Juta+</span>
                  </div>
                  {budgetRecommendation && (
                    <div className="mt-3 rounded-xl bg-paper/80 p-3 text-xs border border-line flex items-center justify-between">
                      <span className="text-muted">
                        Dengan budget <strong>{rupiah(budgetLimit)}</strong>, Anda dapat mengajak:
                      </span>
                      <Badge variant="sage" className="font-bold text-xs">
                        ± {budgetRecommendation.maxPaxPossible} Peserta
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 1: Jenis Acara */}
          <Card className="p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <span className="grid size-8 place-items-center rounded-full bg-terra text-sm font-bold text-white">1</span>
              <div>
                <h3 className="text-lg font-bold">Pilih Format & Tujuan Acara</h3>
                <p className="text-xs text-muted">Sesuaikan dengan agenda dan kebutuhan audiens Anda</p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {EVENT_TYPES.map((e) => (
                <label
                  key={e.id}
                  onClick={() => setEventType(e.id)}
                  className={cn(
                    'flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition',
                    eventType === e.id
                      ? 'border-terra bg-blush/40 shadow-soft'
                      : 'border-line/70 bg-paper hover:border-terra/40'
                  )}
                >
                  <input
                    type="radio"
                    name="event-type"
                    checked={eventType === e.id}
                    onChange={() => setEventType(e.id)}
                    className="mt-1 size-4 accent-terra"
                  />
                  <div>
                    <div className="font-semibold text-sm text-ink">{e.label}</div>
                    <div className="mt-0.5 text-xs text-muted leading-relaxed">{e.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Step 2: Pilihan Kerajinan & Nuansa Warna Benang */}
          <Card className="p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <span className="grid size-8 place-items-center rounded-full bg-terra text-sm font-bold text-white">2</span>
              <div>
                <h3 className="text-lg font-bold">Pilih Kategori Kerajinan Tangan</h3>
                <p className="text-xs text-muted">Seluruh alat & bahan sudah termasuk dan menjadi milik peserta</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {CRAFT_PACKAGES.map((pkg) => {
                const isSelected = selectedCraft === pkg.id
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedCraft(pkg.id)}
                    className={cn(
                      'relative flex cursor-pointer flex-col justify-between rounded-2xl border p-4 transition',
                      isSelected
                        ? 'border-terra bg-blush/30 shadow-soft ring-2 ring-terra'
                        : 'border-line/70 bg-paper hover:border-terra/40'
                    )}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="terra" className="text-[10px]">{pkg.category}</Badge>
                        <span className="text-xs font-semibold text-muted flex items-center gap-1">
                          <Clock className="size-3" />{pkg.duration}
                        </span>
                      </div>
                      <h4 className="mt-2 text-base font-bold text-ink">{pkg.title}</h4>
                      <p className="mt-1 text-xs text-muted line-clamp-2 leading-relaxed">{pkg.desc}</p>
                    </div>

                    <div className="mt-4 border-t border-line/50 pt-3 flex items-center justify-between">
                      <span className="text-xs text-muted">Mulai dari</span>
                      <span className="text-sm font-bold text-terra-dark">{rupiah(pkg.basePrice)} <span className="text-[10px] font-normal text-muted">/ pax</span></span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Dynamic Brand Color Palette Selector */}
            <div className="mt-7 border-t border-line/70 pt-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Palette className="size-4 text-terra" />
                  <span className="text-sm font-bold text-ink">Nuansa Warna Benang (Brand Palette)</span>
                </div>
                <span className="text-xs font-semibold text-terra-dark">{palette.name}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {COLOR_PALETTES.map((p) => {
                  const isCur = colorPalette === p.id
                  return (
                    <div
                      key={p.id}
                      onClick={() => setColorPalette(p.id)}
                      className={cn(
                        'cursor-pointer rounded-xl border p-3 transition flex items-center gap-3',
                        isCur ? 'border-terra bg-paper shadow-soft ring-1 ring-terra' : 'border-line/70 bg-sand/30 hover:bg-paper'
                      )}
                    >
                      <div className="flex -space-x-1.5 shrink-0">
                        {p.colors.map((c, i) => (
                          <span
                            key={i}
                            className="size-5 rounded-full border border-paper shadow-xs"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate text-ink">{p.name}</div>
                        <div className="text-[10px] text-muted truncate">{p.desc}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Dynamic Duration Multiplier */}
            <div className="mt-6 border-t border-line/70 pt-5">
              <span className="text-sm font-bold text-ink block mb-3">Pilihan Durasi Sesi:</span>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {DURATION_FORMATS.map((df) => (
                  <div
                    key={df.id}
                    onClick={() => setDurationFormat(df.id)}
                    className={cn(
                      'cursor-pointer rounded-xl border p-3 transition flex flex-col justify-between',
                      durationFormat === df.id ? 'border-terra bg-blush/30 shadow-soft ring-1 ring-terra' : 'border-line/70 bg-paper hover:border-terra/40'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-ink">{df.label}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted">{df.desc}</p>
                    </div>
                    <div className="mt-2.5">
                      <span className="inline-block rounded-md bg-sand px-2 py-0.5 text-[10px] font-bold text-terra-dark">
                        {df.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Step 3: Jumlah Peserta & Tier Diskon */}
          <Card className="p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <span className="grid size-8 place-items-center rounded-full bg-terra text-sm font-bold text-white">3</span>
              <div>
                <h3 className="text-lg font-bold">Kapasitas Peserta & Rasio Instruktur</h3>
                <p className="text-xs text-muted">Kapasitas fleksibel mulai 10 hingga 200+ peserta</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="participants-input" className="text-sm font-semibold">
                  Jumlah Peserta:
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="participants-input"
                    type="number"
                    min={10}
                    max={300}
                    value={participants}
                    onChange={(e) => setParticipants(Math.max(10, Math.min(300, Number(e.target.value) || 10)))}
                    className="h-10 w-24 text-center font-display text-lg font-bold"
                  />
                  <span className="text-sm font-medium text-muted">Orang</span>
                </div>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min={10}
                max={150}
                step={5}
                value={participants}
                onChange={(e) => setParticipants(Number(e.target.value))}
                className="w-full accent-terra h-2 bg-sand rounded-lg cursor-pointer"
              />

              {/* Dynamic Staffing Counter */}
              <div className="rounded-2xl border border-line bg-paper/80 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-full bg-sage/20 text-sage-dark font-bold">
                    {instructorsCount}
                  </span>
                  <div>
                    <span className="font-bold text-ink">Tim Pengajar Ditugaskan</span>
                    <span className="text-muted block text-[11px]">Rasio ideal 1 instruktur per 8 peserta</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={tierDiscountPct > 0 ? 'sage' : 'outline'} className="font-bold">
                    {tierDiscountPct > 0 ? `Diskon Volume: ${tierDiscountPct * 100}%` : 'Harga Reguler'}
                  </Badge>
                </div>
              </div>

              {/* Tier status indicator */}
              <div className="grid grid-cols-4 gap-2 pt-1 text-center text-[11px]">
                <div className={cn('rounded-xl p-2 border transition', participants < 25 ? 'bg-ink text-cream border-ink font-bold' : 'border-line/60 bg-paper text-muted')}>
                  10 - 24 pax<br /><span className="text-[10px]">Standard</span>
                </div>
                <div className={cn('rounded-xl p-2 border transition', participants >= 25 && participants < 50 ? 'bg-sage-dark text-white border-sage-dark font-bold' : 'border-line/60 bg-paper text-muted')}>
                  25 - 49 pax<br /><span className="text-[10px]">Hemat 10%</span>
                </div>
                <div className={cn('rounded-xl p-2 border transition', participants >= 50 && participants < 100 ? 'bg-terra text-white border-terra font-bold' : 'border-line/60 bg-paper text-muted')}>
                  50 - 99 pax<br /><span className="text-[10px]">Hemat 15%</span>
                </div>
                <div className={cn('rounded-xl p-2 border transition', participants >= 100 ? 'bg-mustard text-ink border-mustard font-bold' : 'border-line/60 bg-paper text-muted')}>
                  100+ pax<br /><span className="text-[10px]">Hemat 20%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Step 4: Lokasi & Ketersediaan Jadwal Server */}
          <Card className="p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <span className="grid size-8 place-items-center rounded-full bg-terra text-sm font-bold text-white">4</span>
              <div>
                <h3 className="text-lg font-bold">Lokasi & Ketersediaan Jadwal</h3>
                <p className="text-xs text-muted">Didukung pengecekan ketersediaan jadwal terintegrasi</p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {LOCATION_OPTIONS.map((loc) => (
                <label
                  key={loc.id}
                  onClick={() => setLocationType(loc.id)}
                  className={cn(
                    'flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition',
                    locationType === loc.id
                      ? 'border-terra bg-blush/40 shadow-soft'
                      : 'border-line/70 bg-paper hover:border-terra/40'
                  )}
                >
                  <input
                    type="radio"
                    name="location-type"
                    checked={locationType === loc.id}
                    onChange={() => setLocationType(loc.id)}
                    className="mt-1 size-4 accent-terra"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-ink">{loc.label}</span>
                      {loc.travelCost > 0 && (
                        <span className="text-xs font-semibold text-terra">+{rupiah(loc.travelCost)}</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted leading-relaxed">{loc.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Dynamic Date Checker */}
            <div className="mt-6 border-t border-line/70 pt-5 space-y-2.5">
              <Label htmlFor="corporate-target-date" className="text-xs font-bold text-ink flex items-center gap-1.5">
                <CalendarCheck2 className="size-4 text-terra" /> Cek Ketersediaan Tanggal Rencana:
              </Label>
              <Input
                id="corporate-target-date"
                type="date"
                min={getTodayDateStr()}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="h-10 text-xs"
              />

              {dateAvailability && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={cn(
                    'rounded-xl p-3.5 text-xs border flex items-start gap-2.5',
                    dateAvailability.available
                      ? 'border-sage/40 bg-sage/10 text-sage-dark'
                      : 'border-mustard/60 bg-mustard/15 text-ink'
                  )}
                >
                  {dateAvailability.available ? (
                    <CheckCircle2 className="size-4 text-sage-dark shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="size-4 text-mustard shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{dateAvailability.message}</div>
                    <div className="mt-0.5 text-[11px] opacity-90">{dateAvailability.suggestion}</div>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>

          {/* Step 5: Layanan Tambahan (Add-ons) */}
          <Card className="p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <span className="grid size-8 place-items-center rounded-full bg-terra text-sm font-bold text-white">5</span>
              <div>
                <h3 className="text-lg font-bold">Kustomisasi & Add-ons Eksklusif</h3>
                <p className="text-xs text-muted">Personalisasi workshop agar sejalan dengan branding perusahaan</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {ADDONS.map((addon) => {
                const checked = selectedAddons.includes(addon.id)
                return (
                  <label
                    key={addon.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition select-none',
                      checked
                        ? 'border-terra bg-blush/30 shadow-soft'
                        : 'border-line/70 bg-paper hover:border-terra/40'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAddon(addon.id)}
                      className="mt-1 size-4 accent-terra rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-ink">{addon.label}</span>
                        <span className="text-xs font-bold text-terra-dark">
                          +{rupiah(addon.pricePerPax)} {addon.flat ? '(flat)' : '/ pax'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">{addon.desc}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Live Sticky Summary, Real-time Mockup & Contact Form */}
        <div className="space-y-6 lg:sticky lg:top-24">

          {/* Live Personalized Merchandise Mockup Preview */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="overflow-hidden border border-terra/30 bg-gradient-to-br from-paper to-sand/40 p-5 shadow-soft">
              <div className="flex items-center justify-between border-b border-line/60 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Eye className="size-3.5 text-terra" /> Live Merchandise Mockup
                </span>
                <span className="rounded-full bg-terra/10 px-2 py-0.5 text-[10px] font-bold text-terra">
                  Custom Kit Preview
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-line bg-paper p-4 text-center shadow-xs">
                <div className="text-[10px] uppercase tracking-widest text-muted">Exclusive Workshop Kit for</div>
                <div className="font-display text-lg font-bold text-ink mt-0.5 truncate">
                  {companyName.trim() || 'Nama Perusahaan / Komunitas Anda'}
                </div>
                <div className="mt-1 text-xs text-terra font-semibold">
                  {craft.title} · {duration.label.split('(')[0]}
                </div>

                {/* Swatches display */}
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-[11px] text-muted">Palette:</span>
                  <div className="flex -space-x-1">
                    {palette.colors.map((c, idx) => (
                      <span key={idx} className="size-4 rounded-full border border-paper shadow-xs" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-ink">{palette.name}</span>
                </div>

                <div className="mt-3 border-t border-line/60 pt-2.5 flex items-center justify-around text-[11px] text-muted">
                  <span>{effectivePax} Box Lengkap</span>
                  <span>•</span>
                  <span>{instructorsCount} Instruktur</span>
                  <span>•</span>
                  <span>100% Hak Milik</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Floating Price Card & Contact Form */}
          <Card className="overflow-hidden border-2 border-terra/20 shadow-lift">
            {/* Header with View Tabs */}
            <div className="bg-ink p-6 text-cream">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-cream/70">
                  Simulasi Penawaran Resmi
                </span>
                <div className="flex rounded-full bg-cream/10 p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setRightPanelView('breakdown')}
                    className={cn('rounded-full px-2.5 py-1 transition cursor-pointer', rightPanelView === 'breakdown' ? 'bg-terra text-white font-bold' : 'text-cream/70 hover:text-white')}
                  >
                    Rincian
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightPanelView('live-preview')}
                    className={cn('rounded-full px-2.5 py-1 transition cursor-pointer', rightPanelView === 'live-preview' ? 'bg-terra text-white font-bold' : 'text-cream/70 hover:text-white')}
                  >
                    Live Surat
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs text-cream/60">Estimasi Total Investasi</div>
                <div className="font-display text-3xl font-extrabold sm:text-4xl text-mustard">
                  {rupiah(calculation.total)}
                </div>
                <div className="mt-1 text-xs text-cream/80">
                  Setara <strong>{rupiah(calculation.perPax)}</strong> / peserta ({effectivePax} orang)
                </div>
              </div>
            </div>

            {/* Breakdown or Live Sheet */}
            {rightPanelView === 'breakdown' ? (
              <div className="space-y-3 border-b border-line bg-paper/70 p-6 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Craft Kit ({craft.title} × {effectivePax})</span>
                  <span>{rupiah(calculation.rawKitSubtotal)}</span>
                </div>
                {duration.multiplier !== 1 && (
                  <div className="flex justify-between text-xs text-muted italic">
                    <span>Penyesuaian Durasi ({duration.label.split('(')[0]})</span>
                    <span>{duration.multiplier < 1 ? '-15%' : '+25%'}</span>
                  </div>
                )}
                {calculation.discountAmount > 0 && (
                  <div className="flex justify-between font-medium text-sage-dark">
                    <span>Diskon Skala Besar ({tierDiscountPct * 100}%)</span>
                    <span>- {rupiah(calculation.discountAmount)}</span>
                  </div>
                )}
                {calculation.addonsTotal > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Add-ons Terpilih</span>
                    <span>+ {rupiah(calculation.addonsTotal)}</span>
                  </div>
                )}
                {calculation.travelFee > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Biaya Logistik Luar Kota</span>
                    <span>+ {rupiah(calculation.travelFee)}</span>
                  </div>
                )}

                <div className="border-t border-line/60 pt-3 flex justify-between font-bold text-base text-ink">
                  <span>Total Estimasi</span>
                  <span className="text-terra-dark">{rupiah(calculation.total)}</span>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-sand/30 border-b border-line text-xs space-y-2">
                <div className="font-bold text-ink border-b border-line/60 pb-2 flex items-center justify-between">
                  <span>Preview Surat Penawaran:</span>
                  <Badge variant="terra" className="text-[10px]">Draft Real-time</Badge>
                </div>
                <p>Kepada Yth. <strong>{companyName || '[Nama Perusahaan]'}</strong></p>
                <p>Up: <strong>{picName || '[Nama PIC]'}</strong> ({phone || '[Kontak]'})</p>
                <p>Bersama ini kami sampaikan penawaran <strong>{craft.title}</strong> untuk <strong>{effectivePax} peserta</strong> dengan total investasi <strong>{rupiah(calculation.total)}</strong>.</p>
                <p className="text-[11px] text-muted">Jadwal: {targetDate || 'Fleksibel'} · Lokasi: {location.label}</p>
              </div>
            )}

            {/* Inclusions summary list */}
            <div className="bg-sand/40 p-5 text-xs space-y-2 text-ink/80">
              <div className="font-semibold text-ink flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-sage-dark" /> Fasilitas Lengkap Termasuk:
              </div>
              <ul className="space-y-1 text-muted pl-5 list-disc">
                <li>Seluruh set alat & benang premium (100% dibawa pulang peserta).</li>
                <li>{instructorsCount} instruktur tersertifikasi Straweyi (rasio 1:8).</li>
                <li>Lembar panduan step-by-step & sertifikat kehadiran digital.</li>
                <li>Goodie bag ramah lingkungan.</li>
              </ul>
            </div>

            {/* Quick Contact Form */}
            <form onSubmit={handleSubmitQuotation} className="p-6 space-y-3 bg-paper">
              <h4 className="font-bold text-sm text-ink mb-1">Kirim Penawaran ke Kontak Anda</h4>

              <div>
                <Label htmlFor="b2b-company" className="text-xs">Nama Perusahaan / Komunitas *</Label>
                <Input
                  id="b2b-company"
                  required
                  placeholder="cth. PT Bank Central Asia / Tim Marketing"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="b2b-pic" className="text-xs">Nama PIC *</Label>
                  <Input
                    id="b2b-pic"
                    required
                    placeholder="cth. Amanda Putri"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="b2b-phone" className="text-xs">No. WhatsApp *</Label>
                  <Input
                    id="b2b-phone"
                    required
                    type="tel"
                    placeholder="0812xxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="b2b-email" className="text-xs">Email Kantor</Label>
                  <Input
                    id="b2b-email"
                    type="email"
                    placeholder="pic@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="b2b-date" className="text-xs">Perkiraan Tanggal</Label>
                  <Input
                    id="b2b-date"
                    type="date"
                    min={getTodayDateStr()}
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="b2b-notes" className="text-xs">Catatan Tambahan / Request Khusus</Label>
                <Textarea
                  id="b2b-notes"
                  rows={2}
                  placeholder="cth. Ingin warna benang khusus, request merchandise custom wooden tag."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  id="submit-proposal-btn"
                  type="submit"
                  size="lg"
                  className="w-full text-sm font-bold shadow-soft bg-terra text-white hover:bg-terra-dark transition-all cursor-pointer"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="size-4 animate-spin" /> Menyimpan Permintaan...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="size-4" /> Kirim atau Simpan
                    </span>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleWhatsAppClick}
                  className="w-full text-sm font-semibold border-sage-dark text-sage-dark hover:bg-sage/10"
                >
                  <PhoneCall className="mr-2 size-4" /> Hubungi via WhatsApp Bisnis
                </Button>
              </div>

              <p className="text-[11px] text-center text-muted pt-1">
                Respons cepat dalam 1×24 jam kerja. Format invoice & termin resmi tersedia.
              </p>
            </form>
          </Card>
        </div>
      </div>

      {/* Trusted By Client Brands */}
      <section className="mt-24 border-t border-line pt-16">
        <div className="text-center">
          <Badge variant="mustard" className="mb-3">Dipercaya oleh 170+ Instansi & Brand</Badge>
          <h2 className="text-2xl font-bold sm:text-3xl">Pilihan Utama Brand & Perusahaan Ternama</h2>
          <p className="mt-2 text-sm text-muted">
            Mulai dari aktivasi media multinasional hingga team-building BUMN dan instansi pemerintah.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {CLIENT_LOGOS.map((name) => (
            <span
              key={name}
              className="rounded-full border border-line bg-paper px-4 py-2 text-xs font-semibold text-ink shadow-soft hover:border-terra transition"
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* B2B Testimonials */}
      <section className="mt-20 grid gap-6 md:grid-cols-2">
        {B2B_TESTIMONIALS.map((t, idx) => (
          <Card key={idx} className="p-7 relative overflow-hidden bg-paper/80">
            <div className="text-3xl text-terra/30 font-display select-none">&ldquo;</div>
            <p className="text-sm leading-relaxed text-muted mt-1">{t.quote}</p>
            <div className="mt-5 flex items-center justify-between border-t border-line/60 pt-4 text-xs">
              <div>
                <div className="font-bold text-ink">{t.author}</div>
                <div className="text-muted">{t.role} · {t.company}</div>
              </div>
              <Badge variant="sage">{t.pax}</Badge>
            </div>
          </Card>
        ))}
      </section>

      {/* FAQ B2B */}
      <section className="mt-20 border-t border-line pt-16">
        <h2 className="text-2xl font-bold sm:text-3xl text-center mb-8">Pertanyaan Seputar Corporate Booking</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h4 className="font-bold text-base text-ink flex items-center gap-2">
              <HelpCircle className="size-4 text-terra" /> Apakah pemula tanpa pengalaman bisa ikut?
            </h4>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              Tentu saja! Kurikulum workshop Straweyi dirancang khusus agar peserta dari tingkat nol bisa menyelesaikan karyanya dalam satu sesi. Rasio pengajar 1:8 memastikan setiap peserta mendapat bimbingan intensif.
            </p>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold text-base text-ink flex items-center gap-2">
              <HelpCircle className="size-4 text-terra" /> Bagaimana mekanisme pembayaran & invoice resmi?
            </h4>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              Kami mendukung pembayaran korporat via Transfer Bank / VA dengan invoice resmi, SPK, dan kwitansi bertanda tangan basah / digital. Skema pembayaran standar adalah DP 50% untuk lock jadwal dan pelunasan H-3 acara.
            </p>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold text-base text-ink flex items-center gap-2">
              <HelpCircle className="size-4 text-terra" /> Bisakah warna benang dan kemasan disesuaikan logo kantor?
            </h4>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              Bisa! Anda dapat memilih palet warna khusus sesuai identitas brand dan box packaging custom sleeve dengan logo perusahaan Anda.
            </p>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold text-base text-ink flex items-center gap-2">
              <HelpCircle className="size-4 text-terra" /> Berapa minimal dan maksimal peserta yang bisa ditampung?
            </h4>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              Minimal peserta untuk private/corporate booking adalah 10 orang. Untuk acara besar (50 hingga 150+ peserta), kami menurunkan tim instruktur yang lebih banyak agar seluruh peserta terfasilitasi dengan optimal.
            </p>
          </Card>
        </div>
      </section>

      {/* 1. Modal Berhasil Simpan & Kirim */}
      <AnimatePresence>
        {showSuccessModal && submittedQuotation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-paper shadow-lift border border-line p-6 sm:p-7 text-center relative"
            >
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 grid size-8 place-items-center rounded-full text-muted hover:bg-sand hover:text-ink transition cursor-pointer"
                title="Tutup"
              >
                <X className="size-4" />
              </button>

              <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-sage/20 text-sage-dark shadow-xs">
                <CheckCircle2 className="size-9" />
              </div>

              <h3 className="font-bold text-xl text-ink">Permintaan Berhasil Disimpan!</h3>
              <p className="mt-1.5 text-xs text-muted leading-relaxed">
                Data pengajuan workshop B2B telah tersimpan ke sistem admin Straweyi. Tim konsultan kami siap memproses penawaran Anda.
              </p>

              {/* Ringkasan Pengajuan */}
              <div className="my-5 rounded-2xl bg-sand/40 border border-line p-4 text-left text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-line/60">
                  <span className="text-muted">No. Referensi:</span>
                  <Badge variant="terra" className="font-mono text-[11px] font-bold">
                    {submittedQuotation.id}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Perusahaan:</span>
                  <span className="font-semibold text-ink text-right">{submittedQuotation.companyName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">PIC:</span>
                  <span className="font-semibold text-ink text-right">{submittedQuotation.picName} ({submittedQuotation.phone})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Workshop & Peserta:</span>
                  <span className="font-semibold text-ink text-right">{submittedQuotation.craftTitle} · {submittedQuotation.participants} Pax</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-line/60 items-center">
                  <span className="font-semibold text-ink">Estimasi Investasi:</span>
                  <span className="font-bold text-terra-dark text-base">{rupiah(submittedQuotation.estimatedTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  id="view-quotation-letter-btn"
                  onClick={() => {
                    setShowSuccessModal(false)
                    setShowLetterModal(true)
                  }}
                  className="w-full gap-2 text-xs font-bold bg-terra text-white hover:bg-terra-dark shadow-soft cursor-pointer"
                >
                  <FileText className="size-4" /> Lihat Surat Penawaran
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    const text = generateWhatsAppMessage()
                    window.open(waLink(text, '6289601554639'), '_blank')
                  }}
                  className="w-full gap-2 text-xs font-semibold border-sage-dark text-sage-dark hover:bg-sage/10 cursor-pointer"
                >
                  <PhoneCall className="size-4" /> Kirim / Chat via WhatsApp
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full text-xs text-muted hover:text-ink cursor-pointer pt-1"
                >
                  Tutup
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Compact Pop-up Surat Penawaran Resmi */}
      <AnimatePresence>
        {showLetterModal && submittedQuotation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden rounded-3xl bg-paper shadow-lift border border-line"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-line bg-sand/30 px-5 py-3.5 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-8 place-items-center rounded-xl bg-terra/10 text-terra">
                    <FileText className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-ink leading-tight">Surat Penawaran Resmi (Quotation)</h3>
                    <p className="text-[11px] text-muted font-mono">{submittedQuotation.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setShowLetterModal(false)
                      setShowSuccessModal(true)
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-muted hover:text-ink rounded-lg hover:bg-sand transition cursor-pointer"
                  >
                    Ringkasan
                  </button>
                  <button
                    onClick={() => setShowLetterModal(false)}
                    className="grid size-8 cursor-pointer place-items-center rounded-full hover:bg-sand text-muted hover:text-ink transition"
                    title="Tutup"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Printable Document Area */}
              <div id="quotation-print-area" className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
                {/* Letterhead */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
                  <div>
                    <span className="font-display text-xl font-bold text-ink">Straweyi Workshop Hub</span>
                    <p className="text-[11px] text-muted mt-0.5">PT Straweyi Kreasi Indonesia · Bandung & Jakarta</p>
                    <p className="text-[11px] text-muted">Email: business@straweyi.com · WA: +62 896-0155-4639</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="terra" className="font-mono text-[11px] font-bold">
                      {submittedQuotation.id}
                    </Badge>
                    <div className="mt-1 text-[11px] text-muted">Tanggal: {getTodayDateStr()}</div>
                    <div className="text-[11px] text-muted">Masa Berlaku: 30 Hari</div>
                  </div>
                </div>

                {/* Client Info Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-sand/30 p-3.5 text-xs">
                  <div>
                    <span className="font-semibold text-muted text-[11px] uppercase tracking-wider">Kepada Yth:</span>
                    <div className="font-bold text-sm text-terra-dark mt-0.5">{submittedQuotation.companyName}</div>
                    <div className="text-muted mt-0.5">PIC: {submittedQuotation.picName} ({submittedQuotation.phone})</div>
                    {submittedQuotation.email && <div className="text-muted">{submittedQuotation.email}</div>}
                  </div>
                  <div>
                    <span className="font-semibold text-muted text-[11px] uppercase tracking-wider">Detail Acara:</span>
                    <div className="text-ink font-medium mt-0.5">{submittedQuotation.eventLabel}</div>
                    <div className="text-muted">Target: <strong>{submittedQuotation.targetDate}</strong></div>
                    <div className="text-muted">Lokasi: {submittedQuotation.locationLabel}</div>
                  </div>
                </div>

                {/* Breakdown Table */}
                <div className="rounded-xl border border-line/70 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-sand/40 border-b border-line text-muted">
                      <tr>
                        <th className="py-2 px-3 font-semibold">Deskripsi Layanan</th>
                        <th className="py-2 px-2 text-center font-semibold">Qty</th>
                        <th className="py-2 px-2 text-right font-semibold">Satuan</th>
                        <th className="py-2 px-3 text-right font-semibold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60">
                      <tr>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-ink">{submittedQuotation.craftTitle} Package</div>
                          <div className="text-muted text-[11px]">
                            {submittedQuotation.durationLabel} · Nuansa: {submittedQuotation.paletteName}
                          </div>
                          <div className="text-muted text-[11px]">Termasuk bahan premium, instruktur (rasio 1:8), & sertifikat.</div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-medium">{submittedQuotation.participants} Pax</td>
                        <td className="py-2.5 px-2 text-right">{rupiah(calculation.adjustedBasePrice)}</td>
                        <td className="py-2.5 px-3 text-right font-medium">{rupiah(calculation.adjustedBasePrice * submittedQuotation.participants)}</td>
                      </tr>

                      {tierDiscountPct > 0 && (
                        <tr className="text-sage-dark font-medium bg-sage/5">
                          <td className="py-2 px-3">
                            Potongan Harga Volume ({tierDiscountPct * 100}% Group Discount)
                          </td>
                          <td className="py-2 px-2 text-center">-</td>
                          <td className="py-2 px-2 text-right">-</td>
                          <td className="py-2 px-3 text-right">- {rupiah(calculation.discountAmount)}</td>
                        </tr>
                      )}

                      {submittedQuotation.addonsList.length > 0 && (
                        <tr>
                          <td className="py-2 px-3" colSpan={3}>
                            <div className="font-semibold text-ink">Add-ons Terpilih:</div>
                            <div className="text-muted text-[11px]">{submittedQuotation.addonsList.join(' • ')}</div>
                          </td>
                          <td className="py-2 px-3 text-right font-medium">{rupiah(calculation.addonsTotal)}</td>
                        </tr>
                      )}

                      {calculation.travelFee > 0 && (
                        <tr>
                          <td className="py-2 px-3" colSpan={3}>Biaya Logistik & Transportasi Luar Kota</td>
                          <td className="py-2 px-3 text-right font-medium">{rupiah(calculation.travelFee)}</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="border-t-2 border-ink bg-sand/20 font-bold">
                      <tr>
                        <td colSpan={3} className="py-2.5 px-3 text-ink text-xs">Total Estimasi Investasi</td>
                        <td className="py-2.5 px-3 text-right text-terra-dark text-sm font-extrabold">
                          {rupiah(submittedQuotation.estimatedTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Terms notes */}
                <div className="rounded-xl border border-line bg-sand/10 p-3 text-[11px] text-muted space-y-0.5">
                  <div className="font-semibold text-ink">Ketentuan & Konfirmasi:</div>
                  <p>1. Penawaran berlaku 30 hari sejak diterbitkan.</p>
                  <p>2. Konfirmasi jadwal via DP 50% dan pelunasan H-3 acara.</p>
                  <p>3. Invoice resmi & dokumen perpajakan (PPH/PPN) dapat diterbitkan sesuai NPWP perusahaan.</p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-line bg-sand/30 px-5 py-3 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1.5 text-xs h-8 cursor-pointer"
                >
                  <Printer className="size-3.5" /> Cetak / PDF
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyQuotationSummary}
                    className="gap-1.5 text-xs h-8 cursor-pointer"
                  >
                    <Copy className="size-3.5" /> {copiedLink ? 'Tersalin!' : 'Salin Rincian'}
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => {
                      const text = generateWhatsAppMessage()
                      window.open(waLink(text, '6289601554639'), '_blank')
                    }}
                    className="gap-1.5 text-xs h-8 bg-sage-dark text-white hover:bg-sage-dark/90 cursor-pointer"
                  >
                    <PhoneCall className="size-3.5" /> Chat WhatsApp
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
