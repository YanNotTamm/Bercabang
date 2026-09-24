import { motion } from 'framer-motion'
import { ArrowUpRight, BriefcaseBusiness, MapPinned, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react'
import { Card, Eyebrow } from '../components/ui'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const nav = useNavigate()
  return (
    <div className="space-y-5">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="noise-layer overflow-hidden rounded-[28px] bg-[#087f8c] px-6 pb-6 pt-7 text-white shadow-[0_18px_44px_rgba(8,127,140,0.18)]">
        <div className="absolute -right-16 -top-14 h-44 w-44 rounded-full border-[24px] border-white/10" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold tracking-wide"><Sparkles size={13} /> alat bantu berpikir</span>
          <h1 className="mt-5 max-w-[21rem] text-balance font-display text-[34px] font-extrabold leading-[1.02] tracking-[-0.04em]">Keputusan besar terasa lebih ringan setelah melihat semua pilihannya.</h1>
          <p className="mt-4 max-w-[22rem] text-[15px] leading-7 text-white/85">Bercabang membantu Anda memahami risiko, peluang, dan hal yang belum terpikirkan — tanpa memberi jawaban pasti.</p>
          <button onClick={() => nav('/simulasi')} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-extrabold text-[#087f8c] shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5">Mulai dari keputusanmu <ArrowRight size={17} /></button>
        </div>
      </motion.section>

      <section className="space-y-3">
        <div className="flex items-end justify-between"><div><Eyebrow>Mulai dari sini</Eyebrow><h2 className="mt-1 text-xl font-extrabold text-[#172b3a]">Kamu sedang mempertimbangkan apa?</h2></div></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={() => nav('/simulasi?type=CAREER')} className="group flex items-center gap-4 rounded-[22px] border border-[#dce9e6] bg-white p-4 text-left shadow-[0_8px_24px_rgba(23,43,58,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#9fcac4] hover:shadow-[0_12px_28px_rgba(8,127,140,0.09)]">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e0f2f1] text-[#087f8c]"><BriefcaseBusiness size={21} /></span>
            <span className="min-w-0 flex-1"><span className="block font-extrabold text-[#172b3a]">Karier atau usaha</span><span className="mt-1 block text-sm leading-5 text-[#71868a]">Resign, buka usaha, atau ganti arah karier.</span></span><ArrowUpRight className="shrink-0 text-[#9bb2b2] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#087f8c]" size={18} />
          </button>
          <button onClick={() => nav('/simulasi?type=RELOCATE')} className="group flex items-center gap-4 rounded-[22px] border border-[#dce9e6] bg-white p-4 text-left shadow-[0_8px_24px_rgba(23,43,58,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#9fcac4] hover:shadow-[0_12px_28px_rgba(8,127,140,0.09)]">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#fff0e8] text-[#c9663c]"><MapPinned size={21} /></span>
            <span className="min-w-0 flex-1"><span className="block font-extrabold text-[#172b3a]">Pindah kota</span><span className="mt-1 block text-sm leading-5 text-[#71868a]">Pindah kota atau provinsi untuk pekerjaan, keluarga, atau biaya hidup.</span></span><ArrowUpRight className="shrink-0 text-[#9bb2b2] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#087f8c]" size={18} />
          </button>
        </div>
      </section>

      <Card className="overflow-hidden p-5">
        <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#fff2d8] text-[#9a6810]"><ShieldCheck size={20} /></span><div><Eyebrow>Cara kerjanya</Eyebrow><h2 className="mt-1 text-lg font-extrabold">Bukan ramalan. Bukan nasihat.</h2></div></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[['01', 'Ceritakan konteks', 'Isi yang penting saja. Tidak perlu nama atau alamat.'], ['02', 'Tulis harapanmu', 'Ceritakan perkiraanmu sendiri sebelum melihat data.'], ['03', 'Lihat rentang', 'Lihat kemungkinan, risiko, dan apa yang belum diketahui.']].map(([num, title, desc]) => <div key={num} className="rounded-2xl bg-[#f2f8f6] p-3.5"><span className="font-display text-xl font-extrabold text-[#9bb2b2]">{num}</span><p className="mt-2 text-sm font-extrabold text-[#172b3a]">{title}</p><p className="mt-1 text-xs leading-5 text-[#71868a]">{desc}</p></div>)}
        </div>
        <p className="mt-4 text-xs leading-5 text-[#71868a]">Bercabang memakai data Indonesia dan penelitian untuk menunjukkan pola pada kelompok — bukan meramal hasil pribadi.</p>
      </Card>

      <Card className="p-5">
        <Eyebrow>Hal yang perlu diingat</Eyebrow>
        <h2 className="mt-1 text-lg font-extrabold">Tidak semua yang belum terlihat bisa dihitung.</h2>
        <div className="mt-4 space-y-3 text-sm leading-6 text-[#617383]">
          <p><b className="text-[#172b3a]">Rentang, bukan satu angka.</b> Hasil menunjukkan pola yang mungkin terjadi, bukan Kepastian.</p>
          <p><b className="text-[#172b3a]">Keputusan tetap milikmu.</b> Aplikasi ini membantu berpikir, bukan memberi instruksi.</p>
          <p><b className="text-[#172b3a]">Data tersimpan di perangkatmu.</b> Tidak ada iklan atau pelacak yang mengikutimu.</p>
        </div>
      </Card>
    </div>
  )
}
