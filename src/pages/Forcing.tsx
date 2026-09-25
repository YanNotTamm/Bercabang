import { useEffect, useState } from 'react'
import { ArrowRight, Check, HeartHandshake, MessageCircleQuestion, Scale, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, Eyebrow, PrimaryButton, ProgressDots } from '../components/ui'
import { db } from '../lib/db'
import { runProductionSimulation } from '../lib/engine'
import type { ScenarioSpec } from '../lib/types'

const values = [
  { key: 'stabilitas', label: 'Kondisi keuangan stabil', icon: Scale },
  { key: 'kebebasan', label: 'Bisa mengatur waktu sendiri', icon: Sparkles },
  { key: 'waktu_keluarga', label: 'Waktu untuk keluarga', icon: HeartHandshake },
  { key: 'makna_kerja', label: 'Perasaannya berarti', icon: Sparkles },
  { key: 'kesehatan', label: 'Kesehatan yang lebih baik', icon: Sparkles },
  { key: 'jaringan_sosial', label: 'Tetap dekat dengan orang terdekat', icon: Sparkles },
  { key: 'penghasilan', label: 'Penghasilan lebih besar', icon: Sparkles },
  { key: 'pertumbuhan', label: 'Belajar dan berkembang', icon: Sparkles },
]

const outcomeLabels = ['Jauh lebih sulit', 'Lebih sulit', 'Agak lebih sulit', 'Relatif sama', 'Agak lebih baik', 'Lebih baik', 'Jauh lebih baik']

export default function Forcing() {
  const nav = useNavigate()
  const [draft] = useState<ScenarioSpec | null>(() => {
    const raw = sessionStorage.getItem('bercabang_draft')
    return raw ? JSON.parse(raw) as ScenarioSpec : null
  })
  const [outcome, setOutcome] = useState(4)
  const [certainty, setCertainty] = useState(60)
  const [chosen, setChosen] = useState<string[]>([])

  useEffect(() => {
    if (!draft) nav('/simulasi')
  }, [draft, nav])

  function toggle(key: string) {
    setChosen((current) => current.includes(key) ? current.filter((item) => item !== key) : current.length < 3 ? [...current, key] : current)
  }

  async function handle() {
    if (!draft || chosen.length !== 3) return
    const spec: ScenarioSpec = { ...draft, userReflection: { expectedOutcomeSelf: outcome, confidencePct: certainty, topValues: chosen } }
    await db.scenarios.put(spec)
    const savedProfile = (await db.profiles.toArray())[0]
    const profile = savedProfile ?? { id: 'local', birthYear: Number(localStorage.getItem('bercabang_birthYear') || 1996), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as any
    const result = await runProductionSimulation(profile, spec)
    await db.results.put(result)
    sessionStorage.removeItem('bercabang_draft')
    nav(`/hasil/${result.id}`)
  }

  if (!draft) return null
  const ready = chosen.length === 3

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><ProgressDots total={3} active={1} /><span className="text-xs font-bold text-[#8aa0a0]">Langkah 2 dari 3</span></div>
      <div className="space-y-2"><Eyebrow>Dulu, tulis ekspektasi Anda</Eyebrow><h1 className="text-balance text-[30px] font-extrabold leading-tight text-[#172b3a]">Menurutmu, seperti apa 3 tahun lagi?</h1><p className="text-pretty text-[15px] leading-7 text-[#617383]">Tidak harus tepat. Yang penting, kita bisa membandingkan cermin yang kamu punya dengan pola dari kelompok yang mirip.</p></div>

      <Card className="space-y-6 p-5">
        <div className="rounded-2xl bg-[#f2f8f6] p-4"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#6b8589]">Skenario yang sedang kamu bawa</p><p className="mt-2 text-sm font-extrabold text-[#314b56]">{draft.strategies[0]?.label}</p><p className="mt-1 text-sm leading-6 text-[#71868a]">vs {draft.strategies.slice(1).map((item) => item.label).join(' · ')}</p></div>

        <section><div className="flex items-start gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#087f8c] text-sm font-extrabold text-white">1</span><div><h2 className="font-extrabold text-[#314b56]">Kondisimu 3 tahun lagi terasa seperti apa?</h2><p className="mt-1 text-sm leading-6 text-[#71868a]">Pilih yang paling dekat dengan perasaanmu.</p></div></div><div className="mt-4 grid grid-cols-7 gap-1.5">{[1, 2, 3, 4, 5, 6, 7].map((value) => <button key={value} onClick={() => setOutcome(value)} className={`rounded-xl border py-3 text-xs font-extrabold transition ${outcome === value ? 'border-[#087f8c] bg-[#087f8c] text-white' : 'border-[#dce9e6] bg-white text-[#71868a] hover:border-[#9fcac4]'}`}>{value}</button>)}</div><div className="mt-2 flex justify-between gap-2 text-[10px] font-bold text-[#8aa0a0]"><span>Lebih sulit</span><span className="text-[#087f8c]">{outcomeLabels[outcome - 1]}</span><span>Lebih baik</span></div></section>

        <section><div className="flex items-start gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#087f8c] text-sm font-extrabold text-white">2</span><div><h2 className="font-extrabold text-[#314b56]">Seberapa yakin kamu tahu jawabannya?</h2><p className="mt-1 text-sm leading-6 text-[#71868a]">Tidak yakin juga jawaban yang valid.</p></div></div><input type="range" min={0} max={100} value={certainty} onChange={(event) => setCertainty(Number(event.target.value))} className="mt-5 w-full accent-[#087f8c]" /><div className="flex justify-between text-xs font-bold text-[#8aa0a0]"><span>Masih spekulatif</span><span className="text-[#087f8c]">{certainty}% yakin</span><span>Yakin</span></div></section>

        <section><div className="flex items-start gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#087f8c] text-sm font-extrabold text-white">3</span><div><h2 className="font-extrabold text-[#314b56]">Tiga hal yang paling penting buat kamu</h2><p className="mt-1 text-sm leading-6 text-[#71868a]">Pilih tepat tiga. Ini membantu kami menyoroti trade-off yang relevan.</p></div></div><div className="mt-4 flex flex-wrap gap-2">{values.map((item) => { const active = chosen.includes(item.key); return <button key={item.key} onClick={() => toggle(item.key)} className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-sm font-bold transition ${active ? 'border-[#172b3a] bg-[#172b3a] text-white' : 'border-[#dce9e6] bg-white text-[#536c72] hover:border-[#9fcac4]'}`}>{active && <Check size={14} />}{item.label}</button> })}</div><p className={`mt-3 text-xs font-extrabold ${ready ? 'text-[#16705a]' : 'text-[#9a6810]'}`}>{ready ? 'Sudah lengkap. Lihat kemungkinan di bawah.' : `${chosen.length}/3 dipilih · Pilih ${3 - chosen.length} lagi`}</p></section>

        <div className="h-px bg-[#e5efed]" />
        <PrimaryButton onClick={handle} disabled={!ready}>{ready ? <>Lihat kemungkinan <ArrowRight size={17} className="ml-1 inline" /></> : 'Pilih 3 hal terlebih dahulu'}</PrimaryButton>
        <p className="flex items-start justify-center gap-2 text-center text-xs leading-5 text-[#8aa0a0]"><MessageCircleQuestion size={15} className="mt-0.5 shrink-0" />Hasilnya bukan skor. Ini bahan untuk berpikir dan berdiskusi.</p>
      </Card>
    </div>
  )
}
