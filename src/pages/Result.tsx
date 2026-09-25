import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ChevronDown, CircleHelp, Download, Eye, Lightbulb, LockKeyhole, Share2, SlidersHorizontal, Sparkles, TriangleAlert } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Eyebrow, GradeBadge } from '../components/ui'
import { db } from '../lib/db'
import type { SimulationResult } from '../lib/types'
import { explainResultWithLLM, getLLMConfig, getMemoryApiKey } from '../lib/llm'
import type { ExplainedResult } from '../lib/llm-types'

function rupiah(value: number) {
  const sign = value < 0 ? '-' : ''
  const amount = Math.abs(value)
  if (amount >= 1_000_000_000) return `${sign}Rp ${(amount / 1_000_000_000).toFixed(1).replace('.', ',')} miliar`
  if (amount >= 1_000_000) return `${sign}Rp ${(amount / 1_000_000).toFixed(1).replace('.', ',')} juta`
  return `${sign}Rp ${Math.round(amount).toLocaleString('id-ID')}`
}

function rangeText(interval: { p10: number; p50: number; p90: number }) {
  return `${rupiah(interval.p10)} – ${rupiah(interval.p90)}`
}

const tabItems = [
  { key: 'uang', label: 'Uang & pekerjaan' },
  { key: 'perasaan', label: 'Perasaan & hubungan' },
  { key: 'terlewat', label: 'Yang sering terlewat' },
  { key: 'langkah', label: 'Langkah kecil' },
  { key: 'detail', label: 'Detail & sumber' },
] as const

type Tab = typeof tabItems[number]['key']

export default function Result() {
  const { id } = useParams()
  const nav = useNavigate()
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [tab, setTab] = useState<Tab>('uang')
  const [showDetails, setShowDetails] = useState(false)
  const [stress, setStress] = useState(false)
  const [adjustment, setAdjustment] = useState(0)
  const [explanation, setExplanation] = useState<ExplainedResult | null>(null)
  const [isExplaining, setIsExplaining] = useState(false)
  const [explainError, setExplainError] = useState<string | null>(null)

  async function handleRequestExplanation() {
    if (!result) return
    setIsExplaining(true)
    setExplainError(null)

    try {
      const config = getLLMConfig()
      const key = getMemoryApiKey()
      const res = await explainResultWithLLM(result, config, key)
      setExplanation(res)
    } catch (err: any) {
      setExplainError(err.message || 'Gagal menyiapkan penjelasan AI.')
    } finally {
      setIsExplaining(false)
    }
  }

  useEffect(() => {
    if (!id) return
    void db.results.get(id).then((item) => {
      if (item) setResult(item)
      else setNotFound(true)
    })
  }, [id])

  const chartData = useMemo(() => {
    const first = result?.strategies[0]?.outcomes.financial[0]
    return (first?.points ?? []).map((point) => ({
      year: `Tahun ${point.year}`,
      low: Math.round(point.interval.p10 * (1 - (stress ? 0.12 : 0)) * (1 + adjustment / 100)),
      middle: Math.round(point.interval.p50 * (1 - (stress ? 0.06 : 0)) * (1 + adjustment / 100)),
      high: point.interval.p90,
    }))
  }, [result, stress, adjustment])

  if (notFound) return <Card className="space-y-4 p-8 text-center"><p className="text-sm font-extrabold text-[#314b56]">Catatan ini tidak ditemukan</p><p className="text-sm leading-6 text-[#71868a]">Mungkin catatan sudah dihapus atau dibuka dari perangkat lain.</p><button onClick={() => nav('/riwayat')} className="rounded-2xl bg-[#087f8c] px-5 py-3.5 text-sm font-extrabold text-white">Kembali ke simpanan</button></Card>

  if (!result) return <div className="grid min-h-[50vh] place-items-center text-sm font-bold text-[#8aa0a0]">Menyiapkan ringkasan…</div>

  const isLowConfidence = result.overall.confidenceGrade === 'D'
  const firstStrategy = result.strategies[0]
  const firstStrategyLabel = firstStrategy?.label ?? 'Pilihan utama'
  const comparison = result.strategies[1]?.label ?? 'pilihan lain'
  const smallTest = result.reversibility.smallTests[0]

  return (
    <div className="space-y-5">
      <button onClick={() => nav('/riwayat')} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#71868a] transition hover:text-[#087f8c]"><ArrowLeft size={16} />Simpanan saya</button>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="noise-layer overflow-hidden rounded-[28px] bg-[#172b3a] p-6 text-white shadow-[0_18px_44px_rgba(23,43,58,0.14)]">
        <div className="flex flex-wrap items-center gap-2"><GradeBadge grade={result.overall.confidenceGrade} /><span className="text-[11px] font-bold text-white/55">Bercabang · bukan ramalan</span></div>
        <h1 className="mt-5 max-w-[22rem] text-balance font-display text-[29px] font-extrabold leading-[1.08]">Gambaran awalnya: belum ada pilihan yang menang jelas.</h1>
        <p className="mt-4 text-[15px] leading-7 text-white/75">{result.overall.summarySentence}</p>
        <button onClick={() => setShowDetails((current) => !current)} className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white/15">Lihat angka & detail <ChevronDown size={16} className={`transition ${showDetails ? 'rotate-180' : ''}`} /></button>
      </motion.section>

      <section className="space-y-3"><Eyebrow>Inti hasil</Eyebrow><h2 className="text-xl font-extrabold text-[#172b3a]">Yang perlu kamu tahu sekarang</h2>
        <Card className="divide-y divide-[#e5efed] overflow-hidden">
          <div className="flex gap-4 p-5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e0f2f1] text-sm font-extrabold text-[#087f8c]">1</span><div><p className="font-extrabold text-[#314b56]">Pilihan belum bisa dibedakan dengan yakin</p><p className="mt-1 text-sm leading-6 text-[#71868a]">Rentang untuk <b>{firstStrategyLabel}</b> dan <b>{comparison}</b> masih banyak beririsan. Jadi, data belum memberi alasan kuat untuk memilih salah satu.</p></div></div>
          <div className="flex gap-4 p-5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fff2d8] text-sm font-extrabold text-[#9a6810]">2</span><div><p className="font-extrabold text-[#314b56]">Bagian paling sensitif: keadaan awal</p><p className="mt-1 text-sm leading-6 text-[#71868a]">Modal, tabungan, dan beberapa konteks lain dapat mengubah risiko lebih besar daripada detail kecil.</p></div></div>
          <div className="flex gap-4 p-5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fff0e8] text-sm font-extrabold text-[#c9663c]">3</span><div><p className="font-extrabold text-[#314b56]">Cara paling aman untuk belajar</p><p className="mt-1 text-sm leading-6 text-[#71868a]">{smallTest ?? 'Coba versi kecil dari pilihan ini sebelum mengambil langkah besar.'}</p></div></div>
        </Card>
      </section>

      {/* Guided AI Explanation (Opt-in) */}
      <Card className="border border-[#cde6dd] bg-[#f8fbfa] p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#087f8c] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                <Sparkles size={11} /> Opt-In
              </span>
              <Eyebrow>Penjelasan Terpandu AI</Eyebrow>
            </div>
            <h3 className="text-lg font-extrabold text-[#172b3a]">
              Ingin ringkasan yang fokus pada langkah belajar?
            </h3>
            <p className="text-xs leading-5 text-[#617383]">
              AI hanya merangkum angka yang sudah dihitung mesin tanpa mengubah hasil atau memberi ramalan pasti. Semua angka diverifikasi dengan <i>number whitelist</i>.
            </p>
          </div>
        </div>

        {!explanation ? (
          <div className="pt-1">
            <button
              type="button"
              onClick={handleRequestExplanation}
              disabled={isExplaining}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#087f8c] px-5 py-3 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(8,127,140,0.2)] transition hover:bg-[#066e79] disabled:opacity-60"
            >
              <Sparkles size={15} />
              {isExplaining ? 'Menganalisis hasil dan memvalidasi angka...' : 'Minta Penjelasan Terpandu'}
            </button>
            {explainError && (
              <p className="mt-2 text-xs font-bold text-[#b64d32]">{explainError}</p>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-1">
            <div className="rounded-2xl bg-white p-4 border border-[#dce9e6] space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#eef5f3] pb-2">
                <span className="text-xs font-extrabold text-[#087f8c] uppercase tracking-wider">
                  Ringkasan Situasi
                </span>
                <span className="text-[10px] font-bold text-[#6b8589] rounded-full bg-[#f2f8f6] px-2.5 py-0.5">
                  {explanation.source === 'llm' ? 'Model AI + Whitelist Validated' : 'Mesin Lokal'}
                </span>
              </div>
              <p className="text-sm font-semibold leading-6 text-[#172b3a]">
                {explanation.summary}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-extrabold text-[#314b56]">Poin Utama Berakar Data</p>
              <div className="space-y-1.5">
                {explanation.keyTakeaways.map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 rounded-xl bg-white p-3 text-xs leading-5 text-[#46606a] border border-[#e5efed]">
                    <span className="font-extrabold text-[#087f8c]">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-extrabold text-[#314b56]">Pertanyaan untuk Didiskusikan</p>
              <div className="space-y-1.5">
                {explanation.questionsToAsk.map((q, idx) => (
                  <div key={idx} className="flex gap-2.5 rounded-xl bg-[#fffaf5] p-3 text-xs leading-5 text-[#795714] border border-[#faedd8]">
                    <span className="font-extrabold text-[#c9663c]">?</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#8aa0a0]">
                Terverifikasi: Tidak ada angka tambahan yang dihasilkan di luar simulasi.
              </span>
              <button
                type="button"
                onClick={() => setExplanation(null)}
                className="text-xs font-bold text-[#71868a] hover:text-[#087f8c]"
              >
                Tutup ringkasan
              </button>
            </div>
          </motion.div>
        )}
      </Card>

      <section className="rounded-[22px] border border-[#f1c7b8] bg-[#fff3ee] p-5"><div className="flex gap-3"><TriangleAlert className="mt-0.5 shrink-0 text-[#c9663c]" size={20} /><div><p className="font-extrabold text-[#8f4633]">Yang tidak bisa diprediksi dari sini</p><p className="mt-1 text-sm leading-6 text-[#9c5a46]">Kejadian tak terduga, perubahan ekonomi, kesehatan, dan peluang yang muncul setelah keputusan. Tidak ada model yang bisa memastikannya.</p></div></div></section>

      {isLowConfidence && <Card className="border-[#f1c7b8] p-5"><div className="flex gap-3"><LockKeyhole className="mt-0.5 shrink-0 text-[#c9663c]" size={20} /><div><p className="font-extrabold text-[#8f4633]">Data untuk profil ini belum cukup</p><p className="mt-1 text-sm leading-6 text-[#9c5a46]">Kami tidak menampilkan angka yang bisa membuatmu terlalu yakin. Coba lengkapi profil atau ubah asumsi di halaman profil.</p></div></div></Card>}

      <section className="space-y-3"><div className="flex items-end justify-between"><div><Eyebrow>Kalau ingin melihat lebih dalam</Eyebrow><h2 className="mt-1 text-xl font-extrabold text-[#172b3a]">Pilih bagian yang kamu butuhkan</h2></div><Sparkles className="text-[#c3d5d1]" size={22} /></div><div className="flex gap-2 overflow-x-auto pb-1">{tabItems.map((item) => <button key={item.key} onClick={() => setTab(item.key)} className={`whitespace-nowrap rounded-full border px-3.5 py-2.5 text-xs font-extrabold transition ${tab === item.key ? 'border-[#087f8c] bg-[#087f8c] text-white' : 'border-[#dce9e6] bg-white text-[#617383]'}`}>{item.label}</button>)}</div></section>

      {tab === 'uang' && <MoneySection result={result} chartData={chartData} showDetails={showDetails} stress={stress} setStress={setStress} adjustment={adjustment} setAdjustment={setAdjustment} />}
      {tab === 'perasaan' && <WellbeingSection result={result} />}
      {tab === 'terlewat' && <ForgottenSection result={result} />}
      {tab === 'langkah' && <StepsSection result={result} />}
      {tab === 'detail' && <DetailsSection result={result} showDetails={showDetails} setShowDetails={setShowDetails} />}

      <Card className="p-5"><div className="flex gap-3"><Lightbulb className="mt-0.5 shrink-0 text-[#c9663c]" size={20} /><div><p className="font-extrabold text-[#314b56]">Bawa pertanyaan ini ke percakapan</p><p className="mt-1 text-sm leading-6 text-[#71868a]">Hasil paling berguna ketika kamu membicarakannya dengan orang yang kamu percaya.</p><ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-[#536c72]">{result.reflectionQuestions.slice(0, 3).map((question) => <li key={question}>{question.replace('P10', 'skenario yang lebih sulit')}</li>)}</ol></div></div></Card>

      <div className="grid gap-3 sm:grid-cols-2"><button onClick={async () => { const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `bercabang-${result.id}.json`; link.click(); URL.revokeObjectURL(url) }} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#dce9e6] bg-white px-4 py-3.5 text-sm font-extrabold text-[#46606a] transition hover:border-[#9fcac4]"><Download size={17} />Unduh catatan</button><button onClick={() => { navigator.share?.({ title: 'Catatan Bercabang', text: result.overall.summarySentence }).catch(() => undefined) }} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#087f8c] px-4 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(8,127,140,0.2)] transition hover:bg-[#066e79]"><Share2 size={17} />Simpan & bahas</button></div>
      <button onClick={() => nav('/simulasi')} className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold text-[#087f8c] transition hover:bg-[#e0f2f1]">Coba dengan asumsi lain <ArrowRight size={16} /></button>
    </div>
  )
}

function MoneySection({ result, chartData, showDetails, stress, setStress, adjustment, setAdjustment }: { result: SimulationResult; chartData: { year: string; low: number; middle: number; high: number }[]; showDetails: boolean; stress: boolean; setStress: (value: boolean) => void; adjustment: number; setAdjustment: (value: number) => void }) {
  const metric = result.strategies[0]?.outcomes.financial[0]
  const point = metric?.points[1] ?? metric?.points[0]
  return <div className="space-y-3"><Card className="p-5"><div className="flex items-start justify-between gap-4"><div><Eyebrow>Kondisi setelah beberapa tahun</Eyebrow><h3 className="mt-1 text-lg font-extrabold text-[#314b56]">Pendapatan rumah tangga</h3><p className="mt-1 text-sm leading-6 text-[#71868a]">Ini pola kelompok yang mirip, bukan ramalan untuk kamu.</p></div><Eye className="shrink-0 text-[#9bb2b2]" size={20} /></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[#f2f8f6] p-4"><p className="text-xs font-extrabold uppercase tracking-wider text-[#6b8589]">Kisaran yang sering muncul</p><p className="mt-2 font-display text-2xl font-extrabold text-[#087f8c]">{point ? rangeText(point.interval) : '—'}</p><p className="mt-1 text-xs leading-5 text-[#71868a]">Kasus tengah: {point ? rupiah(point.interval.p50) : '—'}</p></div><div className="rounded-2xl bg-[#fff7e8] p-4"><p className="text-xs font-extrabold uppercase tracking-wider text-[#9a6810]">Yang perlu diingat</p><p className="mt-2 text-sm font-extrabold leading-6 text-[#795714]">Jangan fokus pada satu angka. Lihat seberapa lebar rentangnya.</p></div></div></Card>{showDetails && <Card className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><Eyebrow>Kalau ingin melihat polanya</Eyebrow><h3 className="mt-1 text-lg font-extrabold text-[#314b56]">Rentang dari tahun ke tahun</h3></div><label className="flex items-center gap-2 text-xs font-extrabold text-[#617383]"><input type="checkbox" checked={stress} onChange={(event) => setStress(event.target.checked)} className="h-4 w-4 accent-[#ef8354]" />Kondisi lebih sulit</label></div><div className="mt-3 h-56"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#e1ece9" /><XAxis dataKey="year" tick={{ fontSize: 11, fill: '#7c9294' }} tickLine={false} axisLine={false} /><YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1_000_000)} jt`} tick={{ fontSize: 10, fill: '#7c9294' }} tickLine={false} axisLine={false} width={42} /><Tooltip formatter={(value) => rupiah(Number(value))} /><Area dataKey="high" type="monotone" stroke="#9bb2b2" fill="transparent" strokeDasharray="5 5" /><Area dataKey="low" type="monotone" stroke="#72bdb6" fill="#e0f2f1" strokeWidth={2} /><Area dataKey="middle" type="monotone" stroke="#087f8c" fill="#b9e3df" strokeWidth={2} /></AreaChart></ResponsiveContainer></div><div className="mt-3 flex items-center gap-3 text-[10px] font-extrabold text-[#71868a]"><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-[#087f8c]" />kasus tengah</span><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-[#b9e3df]" />kisaran</span></div><div className="mt-5 rounded-2xl bg-[#f2f8f6] p-4"><div className="flex items-center gap-2"><SlidersHorizontal size={16} className="text-[#087f8c]" /><p className="text-sm font-extrabold text-[#314b56]">Coba ubah pendapatan awal</p></div><div className="mt-3 flex items-center gap-3"><span className="text-xs font-bold text-[#71868a]">-30%</span><input type="range" min={-30} max={30} value={adjustment} onChange={(event) => setAdjustment(Number(event.target.value))} className="flex-1 accent-[#087f8c]" /><span className="text-xs font-bold text-[#71868a]">+30%</span></div></div><p className="mt-4 text-xs leading-5 text-[#8aa0a0]">Angka P10, P50, dan P90 berarti: kasus lebih sulit, kasus tengah, dan kasus lebih tinggi dalam distribusi kelompok.</p></Card>}</div>
}

function WellbeingSection({ result }: { result: SimulationResult }) {
  const wellbeing = result.strategies[0]?.outcomes.wellbeing
  return <Card className="space-y-4 p-5"><div><Eyebrow>Yang bisa membantu</Eyebrow><h3 className="mt-1 text-lg font-extrabold text-[#314b56]">Hal yang sering membantu atau membebani</h3><p className="mt-1 text-sm leading-6 text-[#71868a]">Kami menampilkan faktor umum, bukan diagnosis.</p></div><div className="space-y-2">{wellbeing?.populationFactors.map((factor) => <div key={factor.factor} className={`rounded-2xl p-4 ${factor.direction === 'protective' ? 'bg-[#e4f6ef] text-[#236952]' : 'bg-[#fff2d8] text-[#795714]'}`}><p className="text-sm font-extrabold">{factor.direction === 'protective' ? 'Membantu' : 'Perlu diwaspadai'}</p><p className="mt-1 font-bold">{factor.factor}</p></div>)}</div><div className="rounded-2xl border border-[#d5e6e2] bg-[#f2f8f6] p-4 text-sm leading-6 text-[#536c72]"><p className="font-extrabold text-[#314b56]">Catatan tentang emosi</p><p className="mt-1">{wellbeing?.biasCorrection}</p></div></Card>
}

function ForgottenSection({ result }: { result: SimulationResult }) {
  return <Card className="p-5"><Eyebrow>Yang sering terlewat</Eyebrow><h3 className="mt-1 text-lg font-extrabold text-[#314b56]">Beberapa hal tidak masuk ke hitungan sederhana</h3><div className="mt-4 space-y-2">{result.unforeseen.map((item) => <div key={item} className="flex gap-3 rounded-2xl bg-[#f2f8f6] p-4 text-sm leading-6 text-[#536c72]"><span className="text-[#c9663c]">•</span><span>{item}</span></div>)}</div></Card>
}

function StepsSection({ result }: { result: SimulationResult }) {
  return <Card className="p-5"><Eyebrow>Belum harus besar</Eyebrow><h3 className="mt-1 text-lg font-extrabold text-[#314b56]">Coba langkah kecil untuk belajar</h3><p className="mt-1 text-sm leading-6 text-[#71868a]">Opsi, bukan perintah. Pilih yang terasa masuk akal untuk hidupmu.</p><div className="mt-4 space-y-2">{result.reversibility.smallTests.map((item, index) => <div key={item} className="flex gap-3 rounded-2xl border border-[#cde6dd] bg-[#f2fbf7] p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-sm font-extrabold text-[#16705a]">{index + 1}</span><p className="pt-0.5 text-sm font-bold leading-6 text-[#31584d]">{item}</p></div>)}</div></Card>
}

function DetailsSection({ result, showDetails, setShowDetails }: { result: SimulationResult; showDetails: boolean; setShowDetails: (value: boolean) => void }) {
  return <div className="space-y-3"><Card className="p-5"><div className="flex items-start gap-3"><CircleHelp className="mt-0.5 shrink-0 text-[#087f8c]" size={20} /><div><h3 className="font-extrabold text-[#314b56]">Kenapa hasilnya begitu lebar?</h3><p className="mt-1 text-sm leading-6 text-[#71868a]">Orang dengan profil serupa punya kondisi awal, kesempatan, dan lingkungan yang berbeda. Karena itu kita menunjukkan rentang, bukan satu kepastian.</p></div></div></Card><Card className="p-5"><div className="flex items-center justify-between gap-3"><div><Eyebrow>Untuk yang ingin memeriksa</Eyebrow><h3 className="mt-1 text-lg font-extrabold text-[#314b56]">Asumsi, batasan & sumber</h3></div><button onClick={() => setShowDetails(!showDetails)} className="text-xs font-extrabold text-[#087f8c]">{showDetails ? 'Sembunyikan' : 'Buka'}</button></div>{showDetails && <div className="mt-4 space-y-4"><div><p className="text-sm font-extrabold text-[#314b56]">Asumsi</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#71868a]">{result.assumptions.map((item) => <li key={item}>{item}</li>)}</ul></div><div><p className="text-sm font-extrabold text-[#314b56]">Batasan</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#71868a]">{result.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="rounded-2xl bg-[#f2f8f6] p-4 text-xs leading-5 text-[#617383]"><p><b>Data:</b> {result.meta.dataVersion}</p><p><b>Model:</b> {result.meta.modelVersion}</p><p><b>Metode:</b> Target trial emulation + rentang ketidakpastian</p><p><b>Sumber utama:</b> IFLS, Hamilton 2000, Chetty dkk. 2016, Wilson & Gilbert 2005</p></div></div>}</Card></div>
}
