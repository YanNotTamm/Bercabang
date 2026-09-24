import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BarChart3, LockKeyhole, Sparkles } from 'lucide-react'
import { Card, PrimaryButton, ProgressDots } from '../components/ui'

const slides = [
  { icon: Sparkles, title: 'Lihat semua kemungkinan, bukan satu ramalan.', desc: 'Bercabang membantu kamu membandingkan pilihan, risiko, dan hal-hal yang sering terlewat.', color: 'bg-[#087f8c]' },
  { icon: BarChart3, title: 'Datanya lebar, jadi tidak ada angka yang dipaksakan.', desc: 'Kamu akan melihat rentang kemungkinan, bukan kepastian. Kalau datanya kurang, kami akan bilang terus terang.', color: 'bg-[#ef8354]' },
  { icon: LockKeyhole, title: 'Data pribadimu tetap di perangkat.', desc: 'Tidak ada iklan atau pelacak. Kamu bisa menghapus semua data kapan saja.', color: 'bg-[#172b3a]' },
]

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [active, setActive] = useState(0)
  const slide = slides[active]
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-5">
        <ProgressDots total={3} active={active} />
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-5 pt-7">
            <div className={`grid h-12 w-12 place-items-center rounded-2xl text-white ${slide.color}`}><slide.icon size={23} /></div>
            <h1 className="text-balance font-display text-[29px] font-extrabold leading-[1.08] text-[#172b3a]">{slide.title}</h1>
            <p className="text-pretty text-[15px] leading-7 text-[#617383]">{slide.desc}</p>
            <div className="rounded-2xl bg-[#f2f8f6] p-4 text-sm leading-6 text-[#536c72]"><b className="text-[#314b56]">Prinsipnya:</b> hasil membantu berpikir, bukan memberi instruksi. Kamu tetap pemilik keputusanmu.</div>
          </motion.div>
        </AnimatePresence>
        <div className="pt-6">
          {active < slides.length - 1 ? <PrimaryButton onClick={() => setActive((current) => current + 1)}>Lanjut <ArrowRight size={17} className="ml-1 inline" /></PrimaryButton> : <PrimaryButton onClick={onDone}>Saya mengerti, mulai</PrimaryButton>}
        </div>
        {active > 0 && <button onClick={() => setActive((current) => current - 1)} className="w-full py-3 text-sm font-bold text-[#71868a] transition hover:text-[#087f8c]">Kembali</button>}
      </Card>
      <p className="text-center text-xs leading-5 text-[#8aa0a0]">Bercabang hanya untuk pengguna berusia 18 tahun ke atas.</p>
    </div>
  )
}
