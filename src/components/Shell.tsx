import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Compass, History, BookOpen, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'

const tabs = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/simulasi', label: 'Mulai', icon: Compass },
  { to: '/riwayat', label: 'Riwayat', icon: History },
  { to: '/metodologi', label: 'Info', icon: BookOpen },
]

export default function Shell({ children }: { children: ReactNode }) {
  const loc = useLocation()
  const hideNav = loc.pathname.startsWith('/hasil') || loc.pathname.startsWith('/forcing')
  return (
    <div className="min-h-dvh bg-[#f7faf9] text-[#172b3a] paper-grid">
      <a href="#konten" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-bold">Lewati ke konten</a>
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-[#f7faf9]/95">
        <header className="sticky top-0 z-30 border-b border-[#dce9e6]/80 bg-[#f7faf9]/85 backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 py-3.5">
            <NavLink to="/" className="group flex items-center gap-2.5" aria-label="Bercabang, kembali ke beranda">
              <span className="grid h-9 w-9 place-items-center rounded-[13px] bg-[#087f8c] font-display text-xl font-extrabold text-white shadow-[0_6px_14px_rgba(8,127,140,0.24)] transition group-hover:rotate-[-4deg]">B</span>
              <span>
                <span className="block font-display text-[17px] font-extrabold leading-none tracking-[-0.03em]">Bercabang</span>
                <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#6b8589]">Ruang untuk berpikir</span>
              </span>
            </NavLink>
            <NavLink to="/profil" className="grid h-10 w-10 place-items-center rounded-2xl border border-[#dce9e6] bg-white text-[#46606a] shadow-sm transition hover:border-[#9fcac4] hover:text-[#087f8c]" aria-label="Buka profil dan pengaturan"><UserRound size={18} /></NavLink>
          </div>
        </header>

        <main id="konten" className="flex-1 px-5 pb-28 pt-6">
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
        </main>

        {!hideNav && <nav className="safe-bottom fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-[#dce9e6] bg-white/95 px-3 pt-2 shadow-[0_-8px_30px_rgba(23,43,58,0.06)] backdrop-blur-xl" aria-label="Navigasi utama">
          <div className="flex justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return <NavLink key={tab.to} to={tab.to} className={({ isActive }) => `flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-extrabold transition duration-200 ${isActive ? 'bg-[#e0f2f1] text-[#087f8c]' : 'text-[#7c9294] hover:text-[#087f8c]'}`}><Icon size={19} strokeWidth={2.1} />{tab.label}</NavLink>
            })}
          </div>
        </nav>}
      </div>
    </div>
  )
}
