import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[24px] bg-white shadow-[0_12px_36px_rgba(23,43,58,0.06)] ${className}`}>{children}</section>
}

export function Pill({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} className={`rounded-full px-4 py-2.5 text-sm font-bold transition duration-200 ${active ? 'bg-[#087f8c] text-white shadow-[0_6px_16px_rgba(8,127,140,0.22)]' : 'bg-[#edf4f2] text-[#46606a] hover:bg-[#e2efec]'}`}>{children}</button>
}

export function PrimaryButton({ children, onClick, disabled, className = '' }: { children: ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return <motion.button type="button" whileHover={disabled ? undefined : { y: -1 }} whileTap={disabled ? undefined : { scale: 0.985 }} onClick={onClick} disabled={disabled} className={`w-full rounded-2xl px-5 py-4 font-extrabold text-white bg-[#087f8c] shadow-[0_10px_24px_rgba(8,127,140,0.22)] transition duration-200 hover:bg-[#066e79] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none ${className}`}>{children}</motion.button>
}

export function SectionTitle({ kicker, title, desc }: { kicker?: string; title: string; desc?: string }) {
  return <div className="space-y-2">
    {kicker && <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#087f8c]">{kicker}</p>}
    <h1 className="text-balance text-[28px] font-extrabold leading-[1.08] text-[#172b3a]">{title}</h1>
    {desc && <p className="max-w-[38rem] text-pretty text-[15px] leading-7 text-[#617383]">{desc}</p>}
  </div>
}

const gradeMap: Record<string, { label: string; className: string; dot: string }> = {
  A: { label: 'Sangat yakin', className: 'bg-[#e4f6ef] text-[#16705a]', dot: 'bg-[#28a37b]' },
  B: { label: 'Cukup yakin', className: 'bg-[#e0f2f1] text-[#087f8c]', dot: 'bg-[#087f8c]' },
  C: { label: 'Perlu hati-hati', className: 'bg-[#fff2d8] text-[#9a6810]', dot: 'bg-[#e5a82d]' },
  D: { label: 'Data belum cukup', className: 'bg-[#fde9e3] text-[#b64d32]', dot: 'bg-[#ef8354]' },
}

export function GradeBadge({ grade }: { grade: string }) {
  const item = gradeMap[grade] ?? { label: 'Keyakinan data', className: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' }
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold ${item.className}`}><i className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />{item.label}</span>
}

export function ProgressDots({ total, active }: { total: number; active: number }) {
  return <div className="flex gap-1.5" aria-label={`Tahap ${active + 1} dari ${total}`}>{Array.from({ length: total }).map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-8 bg-[#087f8c]' : 'w-5 bg-[#dce9e6]'}`} />)}</div>
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#6b8589]">{children}</p>
}
