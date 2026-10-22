import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Heart,
  Users,
  Building2,
  Search,
  ExternalLink,
  MessageCircle,
  Award,
  ChevronRight,
  ChevronDown,
  Maximize2,
  X,
  Compass,
  Palette,
  Briefcase,
  Layers,
  Star,
  Check,
  Feather,
} from 'lucide-react'
import { Badge, Button, Card, Input } from '@/components/ui'

type BrandCategory =
  | 'All'
  | 'Beauty & Skincare'
  | 'Fashion & Retail'
  | 'Corporate & Banking'
  | 'Malls & Venues'
  | 'F&B & FMCG'
  | 'Media, Tech & Events'
  | 'Institutions & Community'

interface BrandItem {
  name: string
  category: BrandCategory
  highlight?: boolean
}

const COLLAB_BRANDS: BrandItem[] = [
  // Beauty & Skincare
  { name: 'Yves Saint Laurent (YSL)', category: 'Beauty & Skincare', highlight: true },
  { name: 'Sulwhasoo', category: 'Beauty & Skincare', highlight: true },
  { name: "L'Oréal Paris", category: 'Beauty & Skincare', highlight: true },
  { name: 'Clarins', category: 'Beauty & Skincare', highlight: true },
  { name: 'Wardah', category: 'Beauty & Skincare', highlight: true },
  { name: 'Make Over', category: 'Beauty & Skincare', highlight: true },
  { name: 'Skintific', category: 'Beauty & Skincare', highlight: true },
  { name: 'Tarte Cosmetics', category: 'Beauty & Skincare', highlight: true },
  { name: 'Anessa', category: 'Beauty & Skincare', highlight: true },
  { name: 'Emina', category: 'Beauty & Skincare' },
  { name: 'Instaperfect', category: 'Beauty & Skincare' },
  { name: 'Erha Ultimate', category: 'Beauty & Skincare' },
  { name: 'Scarlett', category: 'Beauty & Skincare' },
  { name: 'Glad2Glow', category: 'Beauty & Skincare' },
  { name: 'Hanasui', category: 'Beauty & Skincare' },
  { name: 'Trueve', category: 'Beauty & Skincare' },
  { name: 'Somethinc BeautyHaul', category: 'Beauty & Skincare' },
  { name: 'Watsons', category: 'Beauty & Skincare', highlight: true },
  { name: 'Guardian', category: 'Beauty & Skincare', highlight: true },
  { name: 'Revlon', category: 'Beauty & Skincare' },
  { name: 'Clio', category: 'Beauty & Skincare' },
  { name: 'Peripera', category: 'Beauty & Skincare' },
  { name: 'Torriden', category: 'Beauty & Skincare' },
  { name: 'Tirtir', category: 'Beauty & Skincare' },
  { name: 'Mixsoon', category: 'Beauty & Skincare' },
  { name: 'Pyunkang Yul', category: 'Beauty & Skincare' },
  { name: 'Goodal', category: 'Beauty & Skincare' },
  { name: 'VT Cosmetics', category: 'Beauty & Skincare' },
  { name: 'Style Korean Indonesia', category: 'Beauty & Skincare' },
  { name: 'Obagi Medical', category: 'Beauty & Skincare' },
  { name: 'Dazzle Me', category: 'Beauty & Skincare' },
  { name: 'Tavi', category: 'Beauty & Skincare' },
  { name: 'Bening’s Indonesia', category: 'Beauty & Skincare' },
  { name: 'MS Glow', category: 'Beauty & Skincare' },
  { name: 'Sunsilk', category: 'Beauty & Skincare' },
  { name: 'Johnson’s Baby', category: 'Beauty & Skincare' },
  { name: 'Zwitsal', category: 'Beauty & Skincare' },
  { name: 'Juliette Has A Gun', category: 'Beauty & Skincare' },
  { name: 'Star Beauty', category: 'Beauty & Skincare' },
  { name: 'Ultima II', category: 'Beauty & Skincare' },
  { name: 'Vzuu Clinic', category: 'Beauty & Skincare' },
  { name: 'Ultherapy', category: 'Beauty & Skincare' },
  { name: 'Skin Eye', category: 'Beauty & Skincare' },
  { name: 'Soulyu', category: 'Beauty & Skincare' },
  { name: 'Emeron Lovely', category: 'Beauty & Skincare' },
  { name: 'CBD Professional', category: 'Beauty & Skincare' },
  { name: 'Fres & Natural', category: 'Beauty & Skincare' },
  { name: 'Posh', category: 'Beauty & Skincare' },
  { name: 'Charm', category: 'Beauty & Skincare' },
  { name: 'Secret Garden', category: 'Beauty & Skincare' },
  { name: 'N’CO by Hanasui', category: 'Beauty & Skincare' },

  // Fashion & Retail
  { name: 'Pull&Bear', category: 'Fashion & Retail', highlight: true },
  { name: 'Giordano', category: 'Fashion & Retail', highlight: true },
  { name: 'SOGO Department Store', category: 'Fashion & Retail', highlight: true },
  { name: 'MAP (Mitra Adiperkasa)', category: 'Fashion & Retail', highlight: true },
  { name: 'Guess', category: 'Fashion & Retail', highlight: true },
  { name: 'This Is April', category: 'Fashion & Retail', highlight: true },
  { name: 'RiaMiranda', category: 'Fashion & Retail' },
  { name: 'Adelle Jewellery', category: 'Fashion & Retail' },
  { name: 'Saturdays Eyewear', category: 'Fashion & Retail' },
  { name: 'Voila.id', category: 'Fashion & Retail' },
  { name: 'Nobby', category: 'Fashion & Retail' },
  { name: 'Zeta Bags', category: 'Fashion & Retail' },
  { name: 'Lands’ End', category: 'Fashion & Retail' },
  { name: 'Dekorumah', category: 'Fashion & Retail' },
  { name: 'Lumei', category: 'Fashion & Retail' },
  { name: 'Edene', category: 'Fashion & Retail' },
  { name: 'Avve', category: 'Fashion & Retail' },
  { name: 'Day By Sense', category: 'Fashion & Retail' },
  { name: 'Moida', category: 'Fashion & Retail' },
  { name: 'Stwd.', category: 'Fashion & Retail' },
  { name: 'Level', category: 'Fashion & Retail' },
  { name: 'Sway Away', category: 'Fashion & Retail' },
  { name: 'Sculpture', category: 'Fashion & Retail' },
  { name: 'Tally', category: 'Fashion & Retail' },
  { name: 'Esmée', category: 'Fashion & Retail' },
  { name: 'Mercredi', category: 'Fashion & Retail' },
  { name: 'Muzz', category: 'Fashion & Retail' },
  { name: 'Lino', category: 'Fashion & Retail' },
  { name: 'Camillia', category: 'Fashion & Retail' },
  { name: 'Enna & Kaia', category: 'Fashion & Retail' },
  { name: 'Indilane', category: 'Fashion & Retail' },
  { name: 'Raw', category: 'Fashion & Retail' },
  { name: 'Vigure', category: 'Fashion & Retail' },
  { name: 'NIC', category: 'Fashion & Retail' },
  { name: 'Rolla', category: 'Fashion & Retail' },

  // Corporate & Banking
  { name: 'Bank Mandiri', category: 'Corporate & Banking', highlight: true },
  { name: 'CIMB Niaga', category: 'Corporate & Banking', highlight: true },
  { name: 'Hana Bank', category: 'Corporate & Banking', highlight: true },
  { name: 'PLN (Perusahaan Listrik Negara)', category: 'Corporate & Banking', highlight: true },
  { name: 'Pertamina Power Indonesia', category: 'Corporate & Banking', highlight: true },
  { name: 'MyPertamina', category: 'Corporate & Banking' },
  { name: 'Astra Financial', category: 'Corporate & Banking', highlight: true },
  { name: 'AXA Mandiri', category: 'Corporate & Banking' },
  { name: 'Bank Kalbar', category: 'Corporate & Banking' },
  { name: 'Angkasa Pura (APS)', category: 'Corporate & Banking' },
  { name: 'BRI Consumer Expo 2026', category: 'Corporate & Banking', highlight: true },
  { name: 'TGA Capital', category: 'Corporate & Banking' },
  { name: 'Light+ by Wahana', category: 'Corporate & Banking' },

  // Malls & Venues
  { name: 'Central Park Mall', category: 'Malls & Venues', highlight: true },
  { name: 'Pacific Place Jakarta', category: 'Malls & Venues', highlight: true },
  { name: 'Lotte Mall Jakarta', category: 'Malls & Venues', highlight: true },
  { name: 'Lippo Mall Puri', category: 'Malls & Venues', highlight: true },
  { name: 'Living World Mall', category: 'Malls & Venues', highlight: true },
  { name: 'Summarecon Bogor', category: 'Malls & Venues', highlight: true },
  { name: 'Sinarmas Land', category: 'Malls & Venues', highlight: true },
  { name: 'WeWork Indonesia', category: 'Malls & Venues', highlight: true },
  { name: 'Urban Forest Cipete', category: 'Malls & Venues' },
  { name: 'Korea 360', category: 'Malls & Venues' },
  { name: 'CitraRaya Tangerang', category: 'Malls & Venues' },
  { name: 'Citra Sentul Raya', category: 'Malls & Venues' },
  { name: 'SouthCity', category: 'Malls & Venues' },
  { name: 'South71', category: 'Malls & Venues' },
  { name: 'Enjoy PIK', category: 'Malls & Venues' },
  { name: 'Hiera BSD', category: 'Malls & Venues' },
  { name: 'Sutera Rasuna', category: 'Malls & Venues' },
  { name: 'Hotel Brooklyn', category: 'Malls & Venues' },
  { name: 'Sotis Hotel', category: 'Malls & Venues' },
  { name: 'Luminor Hotel', category: 'Malls & Venues' },

  // F&B & FMCG
  { name: 'The Harvest Cakes', category: 'F&B & FMCG', highlight: true },
  { name: 'Nestle', category: 'F&B & FMCG', highlight: true },
  { name: 'Unilever Indonesia', category: 'F&B & FMCG', highlight: true },
  { name: 'Puyo Silky Desserts', category: 'F&B & FMCG', highlight: true },
  { name: 'Chatime Atealier', category: 'F&B & FMCG', highlight: true },
  { name: 'Vilo Gelato', category: 'F&B & FMCG' },
  { name: 'Sosro', category: 'F&B & FMCG' },
  { name: 'Ion Water (Pocari Sweat)', category: 'F&B & FMCG', highlight: true },
  { name: 'Realfood', category: 'F&B & FMCG' },
  { name: 'Indomilk Susu Steril', category: 'F&B & FMCG' },
  { name: 'Alfamart', category: 'F&B & FMCG' },
  { name: 'Alfamidi', category: 'F&B & FMCG' },
  { name: 'Ta Wan Restaurant', category: 'F&B & FMCG' },
  { name: 'Bagi Kopi', category: 'F&B & FMCG' },
  { name: 'Acaii Tea', category: 'F&B & FMCG' },
  { name: 'Wings', category: 'F&B & FMCG' },
  { name: 'Cap Lang', category: 'F&B & FMCG' },
  { name: 'Royale by So Klin', category: 'F&B & FMCG' },
  { name: 'Country Choice', category: 'F&B & FMCG' },
  { name: 'Balans', category: 'F&B & FMCG' },
  { name: 'Flour & Coffee', category: 'F&B & FMCG' },
  { name: 'Cafoy', category: 'F&B & FMCG' },
  { name: 'Moeloet', category: 'F&B & FMCG' },
  { name: 'Buka Bareng', category: 'F&B & FMCG' },
  { name: 'Wonder Wipes', category: 'F&B & FMCG' },
  { name: 'Aroma', category: 'F&B & FMCG' },

  // Media, Tech & Events
  { name: 'TikTok Indonesia', category: 'Media, Tech & Events', highlight: true },
  { name: 'Shopee Indonesia', category: 'Media, Tech & Events', highlight: true },
  { name: 'Lazada Indonesia', category: 'Media, Tech & Events', highlight: true },
  { name: 'DJI Indonesia', category: 'Media, Tech & Events', highlight: true },
  { name: 'FIFA', category: 'Media, Tech & Events', highlight: true },
  { name: 'Jakarta X Beauty 2026', category: 'Media, Tech & Events', highlight: true },
  { name: 'MNC Media Group', category: 'Media, Tech & Events', highlight: true },
  { name: 'IDN Times', category: 'Media, Tech & Events', highlight: true },
  { name: 'Female Daily', category: 'Media, Tech & Events', highlight: true },
  { name: 'Volix Media', category: 'Media, Tech & Events' },
  { name: 'SEA Today', category: 'Media, Tech & Events' },
  { name: 'XL Smart', category: 'Media, Tech & Events' },
  { name: 'Shokz', category: 'Media, Tech & Events' },
  { name: 'Bounce Street Asia', category: 'Media, Tech & Events' },
  { name: 'Prestige Indonesia', category: 'Media, Tech & Events' },
  { name: 'Exoticcon', category: 'Media, Tech & Events' },
  { name: 'Labelbox', category: 'Media, Tech & Events' },
  { name: 'The BFF 2026', category: 'Media, Tech & Events' },

  // Institutions & Community
  { name: 'Kementerian Perindustrian RI', category: 'Institutions & Community', highlight: true },
  { name: 'DJP (Direktorat Jenderal Pajak)', category: 'Institutions & Community', highlight: true },
  { name: 'IOM UN Migration', category: 'Institutions & Community', highlight: true },
  { name: '@america (US Embassy)', category: 'Institutions & Community', highlight: true },
  { name: 'Transjakarta', category: 'Institutions & Community', highlight: true },
  { name: 'Polisi Udara Indonesia', category: 'Institutions & Community' },
  { name: 'Polda Metro Jaya', category: 'Institutions & Community' },
  { name: 'Universitas Padjadjaran (Unpad)', category: 'Institutions & Community' },
  { name: 'Universitas Tarumanagara (Untar)', category: 'Institutions & Community' },
  { name: 'Universitas Bakrie', category: 'Institutions & Community' },
  { name: 'Impact Hub Jakarta', category: 'Institutions & Community' },
  { name: 'SMAN 48 Jakarta', category: 'Institutions & Community' },
  { name: 'Pemkab Lebak', category: 'Institutions & Community' },
  { name: 'The Catch-up Club', category: 'Institutions & Community' },
  { name: '#KitaGaruda', category: 'Institutions & Community' },
  { name: 'Humanis', category: 'Institutions & Community' },
  { name: 'IKA Alumni', category: 'Institutions & Community' },
  { name: 'English 1', category: 'Institutions & Community' },
]

const CATEGORY_TABS: BrandCategory[] = [
  'All',
  'Beauty & Skincare',
  'Fashion & Retail',
  'Corporate & Banking',
  'Malls & Venues',
  'F&B & FMCG',
  'Media, Tech & Events',
  'Institutions & Community',
]

const COLLAB_POSTERS = [
  {
    title: 'Brand Collaboration Highlights I',
    date: '14 Februari',
    src: '/img/brands/brand-collab-1.jpg',
    desc: 'Kerjasama dengan Pertamina, DJP, Lippo Mall, Skintific, Shopee, Wardah, dan ratusan institusi terkemuka.',
  },
  {
    title: 'Brand Collaboration Highlights II',
    date: '18 Agustus',
    src: '/img/brands/brand-collab-2.jpg',
    desc: 'Kolaborasi eksklusif bersama Johnson’s Baby, Sogo, Tarte, BRI Consumer Expo, dan Summarecon Bogor.',
  },
  {
    title: 'Brand Collaboration Highlights III',
    date: '18 Agustus',
    src: '/img/brands/brand-collab-3.jpg',
    desc: 'Aktivasi kreatif bersama YSL, L’Oréal, Bank Mandiri, TikTok, Astra Financial, Sulwhasoo, dan Kemenperin.',
  },
]

export default function About() {
  const [activeTab, setActiveTab] = useState<BrandCategory>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [activePosterModal, setActivePosterModal] = useState<string | null>(null)
  const [displayLimit, setDisplayLimit] = useState(20)

  // Reset pagination back to 20 whenever category or search query changes
  useEffect(() => {
    setDisplayLimit(20)
  }, [activeTab, searchQuery])

  const filteredBrands = useMemo(() => {
    return COLLAB_BRANDS.filter((brand) => {
      const matchCategory = activeTab === 'All' || brand.category === activeTab
      const matchSearch =
        !searchQuery ||
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [activeTab, searchQuery])

  const visibleBrands = useMemo(() => {
    return filteredBrands.slice(0, displayLimit)
  }, [filteredBrands, displayLimit])

  const hasMore = displayLimit < filteredBrands.length

  const waCollabUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(
    'Halo Tim Straweyi, saya tertarik untuk kolaborasi workshop / brand activation / corporate session.'
  )}`

  return (
    <div className="mx-auto max-w-6xl space-y-24 px-5 py-12 md:py-20">
      {/* 1. Hero Company Profile Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-line bg-gradient-to-b from-paper to-sand/40 p-8 shadow-soft md:p-14">
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-blush/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 size-80 rounded-full bg-sage/30 blur-3xl" />

        <div className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="terra" className="mb-5 gap-1.5 px-4 py-1.5 text-xs font-semibold">
                <Sparkles className="size-3.5" /> Company Profile & Portofolio Straweyi
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl"
            >
              Making Artful Connections Through <em className="not-italic text-terra">Modern Crafts</em>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-6 text-lg leading-relaxed text-muted"
            >
              <strong>Straweyi</strong> adalah creative craft studio yang menghadirkan workshop seni rajut modern
              (Crochet, Knitting, Amigurumi, Macramé) dan aktivasi kreatif kustom bagi publik, korporat terkemuka,
              serta brand global di Indonesia.
            </motion.p>

            {/* Quick CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button asChild size="lg" className="gap-2">
                <a href={waCollabUrl} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" /> Hubungi Kerjasama Brand
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/#workshops">Lihat Jadwal Workshop</Link>
              </Button>
            </motion.div>

            {/* Credibility Highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-10 grid grid-cols-2 gap-4 border-t border-line pt-8 sm:grid-cols-4"
            >
              <div>
                <div className="font-display text-3xl font-bold text-terra-dark">170+</div>
                <div className="mt-0.5 text-xs text-muted">Brand Collaborations</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-terra-dark">5,000+</div>
                <div className="mt-0.5 text-xs text-muted">Happy Participants</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-terra-dark">250+</div>
                <div className="mt-0.5 text-xs text-muted">Workshops Hosted</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-terra-dark">4.9 / 5</div>
                <div className="mt-0.5 text-xs text-muted">Satisfaction Rate</div>
              </div>
            </motion.div>
          </div>

          {/* Visual Showcase Reel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border-4 border-paper bg-sand shadow-lift">
              <img
                src="/img/brands/brand-collab-1.jpg"
                alt="Brand Collaboration with Straweyi"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-cream">
                <Badge variant="terra" className="mb-2 text-xs">
                  Official Partners
                </Badge>
                <div className="font-display text-xl font-bold">Brand Collaboration with Straweyi</div>
                <p className="mt-1 text-xs text-cream/80">
                  Dipercaya oleh institusi, BUMN, dan brand gaya hidup & kecantikan global.
                </p>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, type: 'spring' }}
              className="floaty absolute -bottom-6 -left-6 rounded-2xl border border-line bg-paper/95 p-4 shadow-lift backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-blush text-terra-dark">
                  <Award className="size-6" />
                </span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted">Aktivasi Brand</div>
                  <div className="font-display font-bold text-ink">Modern & Aesthetic Craft</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. About Story & Founder Philosophy */}
      <section className="grid gap-12 md:grid-cols-2 md:items-center">
        <div>
          <Badge variant="terra" className="mb-4">
            <Heart className="size-3" /> Nilai & Filosofi
          </Badge>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Seni Kerajinan Tangan Sebagai Ruang Bernafas & Berekspresi.
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            Straweyi lahir dari keyakinan bahwa di tengah dunia digital yang serba cepat, proses membuat sesuatu dengan
            tangan sendiri (<em>slow craft</em>) menghadirkan ketenangan, kepuasan emosional, dan ruang mindfulness yang
            berharga.
          </p>
          <p className="mt-3 leading-relaxed text-muted">
            Mulai dari satu simpul benang pertama, kami menemani setiap peserta — dari pemula mutlak hingga mahir — untuk
            mengeksplorasi potensi kreatif mereka tanpa rasa takut salah, dalam suasana yang hangat, aesthetic, dan intim.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-line bg-paper p-4 shadow-soft">
              <span className="grid size-9 place-items-center rounded-xl bg-blush text-terra-dark">
                <Palette className="size-5" />
              </span>
              <h4 className="mt-3 font-semibold text-ink">Aesthetic & Modern</h4>
              <p className="mt-1 text-xs text-muted">
                Pilihan warna pastel, pola tas kekinian, dan ornamen yang siap dipakai dalam keseharian.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-paper p-4 shadow-soft">
              <span className="grid size-9 place-items-center rounded-xl bg-sage/30 text-sage-dark">
                <Compass className="size-5" />
              </span>
              <h4 className="mt-3 font-semibold text-ink">Beginner Friendly</h4>
              <p className="mt-1 text-xs text-muted">
                Instruktur ramah dan sabar yang mendampingi tusukan demi tusukan sampai karya selesai.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <img
            src="/img/crochet-bag.jpg"
            alt="Crochet Tote Bag by Straweyi"
            className="aspect-[3/4] w-full rounded-3xl border border-line object-cover shadow-soft transition hover:scale-[1.02]"
          />
          <img
            src="/img/amigurumi.jpg"
            alt="Amigurumi Dolls Workshop"
            className="mt-8 aspect-[3/4] w-full rounded-3xl border border-line object-cover shadow-soft transition hover:scale-[1.02]"
          />
        </div>
      </section>

      {/* 3. Artisan Profile & Craftsmanship Showcase */}
      <section id="artisan-profile" className="space-y-12">
        <div className="text-center">
          <Badge variant="terra" className="mb-3 gap-1.5 px-3.5 py-1 text-xs font-semibold">
            <Feather className="size-3.5" /> Artisan Profile & Creative Minds
          </Badge>
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            Sentuhan Tangan & Keahlian Para Artisan Straweyi
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            Dibalik setiap simpul yang presisi, ada dedikasi para artisan yang bersemangat membagikan kehangatan dan ketenangan seni tekstil kepada ribuan peserta di Indonesia.
          </p>
        </div>

        {/* Lead Artisan Featured Spotlight */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-line bg-gradient-to-br from-paper via-sand/30 to-paper p-8 shadow-soft md:p-12">
          <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-blush/40 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_1.3fr]">
            <div className="relative mx-auto w-full max-w-sm">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border-4 border-paper bg-sand shadow-lift">
                <img
                  src="/img/crochet-bag.jpg"
                  alt="Lead Artisan & Founder Straweyi"
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-cream">
                  <Badge variant="terra" className="mb-1 text-[11px]">
                    Founder & Master Crafter
                  </Badge>
                  <div className="font-display text-2xl font-bold">Sylvia Angelina</div>
                  <div className="text-xs text-cream/80">Lead Fiber Artist & Creative Director</div>
                </div>
              </div>

              {/* Floating Stat Chip */}
              <div className="floaty absolute -bottom-5 -right-5 rounded-2xl border border-line bg-paper p-3.5 shadow-lift">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-blush text-terra-dark">
                    <Star className="size-5 fill-terra text-terra" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-ink">6+ Tahun Dedikasi</div>
                    <div className="text-[10px] text-muted">5.000+ Peserta Terbimbing</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-terra">Cerita & Visi Artisan</span>
                <h3 className="mt-1.5 text-2xl font-bold text-ink sm:text-3xl">
                  Membawa Seni Tangan Menjadi Media Ketenangan & Ekspresi Bernilai Tinggi
                </h3>
                <p className="mt-3.5 leading-relaxed text-muted">
                  Bagi Sylvia, merajut bukan sekadar menyatukan benang, melainkan sebuah meditasi visual yang menghadirkan ketenangan di tengah rutinitas perkotaan. Mengawali kecintaan dari seni benang klasik, Lintang telah membimbing ribuan pemula hingga mahir dan dipercaya memimpin aktivasi workshop untuk brand internasional seperti YSL, L’Oréal, Clarins, hingga institusi terkemuka seperti Bank Mandiri dan Kementerian Perindustrian.
                </p>
              </div>

              {/* Signature Specialties */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Keahlian & Spesialisasi</h4>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {[
                    'Master of Modern Structured Bags',
                    '3D Amigurumi Soft Sculpture',
                    'Color Harmony & Custom Brand Palette',
                    'Bespoke Brand Activation Workshops',
                    'Zero-Waste Fiber Crafting',
                  ].map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-full border border-terra/30 bg-paper px-3 py-1 text-xs font-medium text-ink shadow-xs"
                    >
                      <Check className="size-3 text-terra" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Artisan Quote Box */}
              <blockquote className="rounded-2xl border-l-4 border-terra bg-sand/50 p-4 italic text-sm text-ink/90">
                &ldquo;Seni rajut mengajarkan kita untuk hadir seutuhnya di setiap tusukan. Karya yang indah lahir dari kesabaran tangan dan ketulusan hati yang menikmatinya.&rdquo;
              </blockquote>
            </div>
          </div>
        </div>

        {/* The Artisan Collective / Instructors Team */}
        <div>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-terra">Tim Instruktur & Kreator</span>
              <h3 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">The Artisan Collective</h3>
              <p className="mt-1 text-sm text-muted">
                Tim instruktur berdedikasi yang mendampingi setiap sesi workshop publik maupun acara korporat.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: 'Nadhira Putri',
                role: 'Senior Crochet Artisan & Bag Stylist',
                img: '/img/crochet-bag.jpg',
                experience: '4+ Tahun Pengalaman · 1.500+ Peserta',
                specialties: ['Structural Cotton Tote Bags', 'Granny Square Wearables', 'Lace & Texture Stitching'],
                desc: 'Ahli dalam struktur tas rajut yang kokoh, fungsional, dan tetap fashionable untuk OOTD sehari-hari.',
              },
              {
                name: 'Syifa Rahmania',
                role: 'Amigurumi & Soft-Sculpture Specialist',
                img: '/img/amigurumi.jpg',
                experience: '3+ Tahun Pengalaman · 1.200+ Peserta',
                specialties: ['3D Character Crafting', 'Seamless Joining Technique', 'Facial Expression Embroidery'],
                desc: 'Menciptakan boneka rajut karakter dengan ekspresi manis dan proporsi simetris yang disukai segala usia.',
              },
              {
                name: 'Karin Anindita',
                role: 'Macramé & Bohemian Fiber Artist',
                img: '/img/macrame.jpg',
                experience: '4+ Tahun Pengalaman · 1.000+ Peserta',
                specialties: ['Bohemian Wall Hangings', 'Botanical Plant Hangers', 'Spatial Decor & Large Installations'],
                desc: 'Spesialis simpul tali katun alami untuk mempercantik interior ruangan dan kafe bernuansa estetik.',
              },
            ].map((artisan, i) => (
              <Card key={i} className="group overflow-hidden p-6 transition duration-300 hover:shadow-lift">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand/60">
                  <img
                    src={artisan.img}
                    alt={artisan.name}
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3">
                    <Badge variant="terra" className="bg-paper/90 text-[10px] font-semibold text-ink shadow-xs">
                      {artisan.role.split(' ')[0]}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-xl font-bold text-ink">{artisan.name}</h4>
                  <div className="mt-0.5 text-xs font-semibold text-terra-dark">{artisan.role}</div>
                  <div className="mt-1 text-[11px] font-medium text-muted">{artisan.experience}</div>

                  <p className="mt-3 text-xs leading-relaxed text-muted">{artisan.desc}</p>

                  <div className="mt-4 border-t border-line/60 pt-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Fokus Keahlian:</div>
                    <ul className="mt-1.5 space-y-1 text-xs text-ink/80">
                      {artisan.specialties.map((s, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="size-1 rounded-full bg-terra" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 4 Artisan Craftsmanship Standards */}
        <div className="rounded-3xl border border-line bg-paper p-8 shadow-soft md:p-10">
          <div className="mb-6 text-center">
            <h4 className="text-xl font-bold text-ink sm:text-2xl">Standar Kualitas & Filosofi Pengajaran Artisan</h4>
            <p className="mt-1 text-xs text-muted">Setiap workshop dirancang untuk memberikan pengalaman terbaik tanpa kompromi.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Benang Katun Pilihan',
                desc: 'Hanya menggunakan serat premium yang lembut di kulit, tidak mudah berserabut, dan kuat.',
              },
              {
                title: 'Metode Ramah Pemula',
                desc: 'Kurikulum bertahap tanpa jargon rumit. 100% peserta berhasil membawa pulang karya jadi.',
              },
              {
                title: 'Palet Warna Aesthetic',
                desc: 'Kombinasi warna soft pastel & earth tones kontemporer yang selaras dengan tren gaya hidup modern.',
              },
              {
                title: 'Pendampingan Personal',
                desc: 'Rasio instruktur yang terjaga agar setiap pertanyaan peserta langsung terjawab dengan sabar.',
              },
            ].map((pillar, idx) => (
              <div key={idx} className="rounded-2xl border border-line bg-sand/30 p-4">
                <span className="grid size-7 place-items-center rounded-lg bg-terra text-white text-xs font-bold">
                  0{idx + 1}
                </span>
                <div className="mt-3 font-semibold text-sm text-ink">{pillar.title}</div>
                <p className="mt-1 text-xs leading-relaxed text-muted">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Services / What Straweyi Does */}
      <section className="rounded-3xl border border-line bg-sand/30 p-8 md:p-12">
        <div className="mb-10 text-center">
          <Badge variant="terra" className="mb-3">
            <Briefcase className="size-3" /> Layanan Straweyi
          </Badge>
          <h2 className="text-3xl font-bold sm:text-4xl">Solusi Kreatif untuk Publik & Korporat</h2>
          <p className="mt-2 text-muted">
            Kami merancang pengalaman workshop yang disesuaikan dengan kebutuhan Anda.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Users,
              title: 'Public Workshops',
              desc: 'Workshop reguler di kafe dan creative space di Bandung & Jakarta untuk siapa saja yang ingin belajar merajut.',
            },
            {
              icon: Building2,
              title: 'Corporate Team Building',
              desc: 'Sesi mindfulness & team bonding yang menyegarkan untuk kantor BUMN, perbankan, dan perusahaan multinasional.',
            },
            {
              icon: Award,
              title: 'Brand Activation & PR Event',
              desc: 'Instore workshop, booth activation, VIP media gathering, dan peluncuran produk kecantikan serta fashion.',
            },
            {
              icon: Layers,
              title: 'Bespoke Kits & Hampers',
              desc: 'Paket DIY craft kit kustom dengan branding perusahaan untuk hadiah eksklusif maupun merchandise acara.',
            },
          ].map((item, i) => (
            <Card key={i} className="flex flex-col justify-between p-6">
              <div>
                <span className="grid size-12 place-items-center rounded-2xl bg-blush text-terra-dark">
                  <item.icon className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.desc}</p>
              </div>
              <div className="mt-5 border-t border-line/60 pt-3">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-terra">
                  Tersedia untuk booking <ChevronRight className="size-3" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Brand Collaboration Showcase Posters (Official Screenshots from Instagram Story) */}
      <section id="brand-posters">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="terra" className="mb-2">
              <Award className="size-3" /> Rekam Jejak Kolaborasi
            </Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">Official Brand Collaboration Showcase</h2>
            <p className="mt-2 text-muted">
              Dokumentasi visual kolaborasi resmi Straweyi bersama brand dan institusi lintas industri.
            </p>
          </div>
          <span className="text-xs text-muted">Klik gambar untuk melihat lebih detail</span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {COLLAB_POSTERS.map((poster, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-line bg-paper shadow-soft transition"
              onClick={() => setActivePosterModal(poster.src)}
            >
              <div className="relative aspect-[9/16] overflow-hidden bg-sand/60">
                <img
                  src={poster.src}
                  alt={poster.title}
                  className="size-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-ink/20 opacity-0 transition group-hover:opacity-100" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                  <span className="flex items-center gap-2 rounded-full bg-paper/90 px-4 py-2 text-xs font-bold text-ink shadow-lift backdrop-blur-sm">
                    <Maximize2 className="size-4 text-terra" /> Perbesar Poster
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-ink">{poster.title}</h3>
                  <Badge variant="outline" className="text-[10px]">
                    {poster.date}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-muted">{poster.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Complete 170+ Brand Directory & Interactive Search */}
      <section id="brands-directory" className="space-y-8">
        <div className="text-center">
          <Badge variant="terra" className="mb-3">
            <Building2 className="size-3" /> Directory Mitra & Klien
          </Badge>
          <h2 className="text-3xl font-bold sm:text-4xl">170+ Brand Collaboration with Straweyi</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            Mulai dari brand kecantikan internasional, institusi perbankan, BUMN, pusat perbelanjaan, hingga media
            kreatif yang telah mempercayakan aktivasi kerajinan tangan mereka kepada Straweyi.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-4 rounded-3xl border border-line bg-paper p-5 shadow-soft">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              id="search-brand"
              aria-label="Cari Brand"
              placeholder="Cari nama brand, contoh: Wardah, Mandiri, TikTok, Shopee, Sogo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 pt-2">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold transition ${activeTab === cat
                  ? 'border-terra bg-terra text-white'
                  : 'border-line bg-paper text-muted hover:bg-sand hover:text-ink'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted">
            <span>
              Menampilkan <strong>{visibleBrands.length}</strong> dari <strong>{filteredBrands.length}</strong> brand
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="cursor-pointer text-terra hover:underline"
              >
                Reset pencarian
              </button>
            )}
          </div>
        </div>

        {/* Brand Grid (20 items at a time) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visibleBrands.map((brand, i) => (
            <motion.div
              key={brand.name + i}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min((i % 20) * 0.02, 0.4) }}
              className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition ${brand.highlight
                ? 'border-terra/40 bg-gradient-to-br from-paper to-sand/40 shadow-soft hover:border-terra hover:shadow-lift'
                : 'border-line bg-paper hover:border-terra/30 hover:bg-sand/20'
                }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-[10px] font-medium uppercase tracking-wider text-muted">
                    {brand.category}
                  </span>
                  {brand.highlight && (
                    <span className="size-1.5 shrink-0 rounded-full bg-terra" title="Featured Partner" />
                  )}
                </div>
                <div className="mt-2 text-sm font-bold text-ink transition group-hover:text-terra-dark">
                  {brand.name}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More Button (+20 per click) */}
        {hasMore ? (
          <div className="flex flex-col items-center justify-center pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setDisplayLimit((prev) => prev + 20)}
              className="group cursor-pointer gap-2 rounded-full border-2 border-terra/30 bg-paper px-8 py-3 text-sm font-semibold text-terra-dark shadow-soft transition hover:border-terra hover:bg-sand hover:shadow-lift"
            >
              <ChevronDown className="size-4 transition duration-300 group-hover:translate-y-0.5" />
              More (+20 Brand Lainnya)
            </Button>
            <p className="mt-2 text-xs text-muted">
              Tersisa {filteredBrands.length - displayLimit} brand lainnya
            </p>
          </div>
        ) : displayLimit > 20 && (
          <div className="pt-2 text-center">
            <p className="text-xs text-muted">Semua {filteredBrands.length} brand telah ditampilkan.</p>
            <button
              type="button"
              onClick={() => setDisplayLimit(20)}
              className="mt-2 cursor-pointer text-xs font-semibold text-terra hover:underline"
            >
              Tampilkan 20 brand pertama
            </button>
          </div>
        )}
      </section>

      {/* 6. Call to Action (CTA) Collaboration Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-ink p-8 text-cream shadow-lift sm:p-14">
        <div className="pointer-events-none absolute -bottom-16 -right-16 size-72 rounded-full bg-terra/40 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <Badge variant="terra" className="mb-4">
            <Sparkles className="size-3" /> Mari Berkolaborasi
          </Badge>
          <h2 className="text-3xl font-bold sm:text-5xl">
            Wujudkan Aktivasi Brand & Workshop Eksklusif Bersama Straweyi.
          </h2>
          <p className="mt-4 text-cream/70 sm:text-lg">
            Apakah Anda mewakili brand kecantikan, korporat, agensi PR, mall, atau komunitas? Tim Straweyi siap
            merancang workshop yang aesthetic, berkesan, dan selaras dengan identitas brand Anda.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="gap-2 bg-terra text-white hover:bg-terra-dark shadow-soft">
              <Link to="/corporate">
                <Building2 className="size-5" /> Form & Simulasi Biaya Corporate Workshop
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-cream/30 text-cream hover:bg-cream/10">
              <a href={waCollabUrl} target="_blank" rel="noreferrer">
                <MessageCircle className="size-5" /> Chat WhatsApp Bisnis
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-cream/30 text-cream hover:bg-cream/10">
              <Link to="/#workshops">
                Lihat Jadwal Workshop <ExternalLink className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {activePosterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-md"
            onClick={() => setActivePosterModal(null)}
          >
            <div
              className="relative max-h-[90vh] max-w-lg overflow-hidden rounded-3xl border border-line bg-paper shadow-lift"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActivePosterModal(null)}
                className="absolute right-4 top-4 z-10 grid size-10 cursor-pointer place-items-center rounded-full bg-ink/70 text-cream transition hover:bg-ink"
                aria-label="Tutup"
              >
                <X className="size-5" />
              </button>
              <img
                src={activePosterModal}
                alt="Brand Collaboration Poster Preview"
                className="max-h-[85vh] w-auto object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
