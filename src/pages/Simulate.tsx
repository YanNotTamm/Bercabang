import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowRight, BriefcaseBusiness, MapPinned, ShieldAlert, Sparkles, PhoneCall } from 'lucide-react'
import { Card, Eyebrow, Pill, PrimaryButton, ProgressDots } from '../components/ui'
import { db } from '../lib/db'
import { checkSafety, isOutOfScope, detectCrisisText, detectOutOfScopeText } from '../lib/engine'
import type { ScenarioSpec, UserProfile } from '../lib/types'
import { parseScenarioWithLLM, getLLMConfig, getMemoryApiKey } from '../lib/llm'
import type { ParsedScenarioDraft } from '../lib/llm-types'

const provinces = ['DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Bali', 'Sumatera Utara', 'Sulawesi Selatan', 'Kalimantan Timur', 'DI Yogyakarta', 'Banten', 'NTB', 'NTT', 'Lainnya']
const careerOptions = [
  { key: 'resign_usaha', label: 'Berhenti kerja dan mulai usaha' },
  { key: 'tetap_sampingan', label: 'Tetap kerja, coba usaha sampingan' },
  { key: 'tetap_kerja', label: 'Tetap kerja dulu' },
]
const relocateOptions = [
  { key: 'pindah_sekarang', label: 'Pindah sekarang' },
  { key: 'tunda_1th', label: 'Tunggu satu tahun' },
  { key: 'tidak_pindah', label: 'Tetap di kota sekarang' },
]

export default function Simulate() {
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [useCase, setUseCase] = useState<'CAREER' | 'RELOCATE'>(searchParams.get('type') === 'RELOCATE' ? 'RELOCATE' : 'CAREER')
  const [horizon, setHorizon] = useState<5 | 10>(5)
  const [showMore, setShowMore] = useState(false)
  const [freeText, setFreeText] = useState('')
  const [scopeMsg, setScopeMsg] = useState('')
  const [capitalSource, setCapitalSource] = useState('tabungan')
  const [capitalBracket, setCapitalBracket] = useState(3)
  const [sector, setSector] = useState('kuliner')
  const [experience, setExperience] = useState(2)
  const [sideTest, setSideTest] = useState(false)
  const [insurance] = useState('JKN')
  const [origin, setOrigin] = useState('DKI Jakarta')
  const [destination, setDestination] = useState('DI Yogyakarta')
  const [withFamily, setWithFamily] = useState(true)
  const [hasOffer, setHasOffer] = useState(false)
  const [reason, setReason] = useState('kerja')
  const [showPause, setShowPause] = useState(false)
  const [showCrisis, setShowCrisis] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [parsedDraft, setParsedDraft] = useState<ParsedScenarioDraft | null>(null)
  const [parseNotice, setParseNotice] = useState<string | null>(null)

  useEffect(() => {
    void db.profiles.toArray().then((items) => {
      const existing = items[0]
      setProfile(existing ?? ({ id: 'local', birthYear: Number(localStorage.getItem('bercabang_birthYear') || 1996), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as UserProfile))
    })
  }, [])

  const strategies = useCase === 'CAREER' ? careerOptions : relocateOptions

  function buildSpec(): ScenarioSpec {
    const params: Record<string, string | number | boolean> = useCase === 'CAREER'
      ? { capitalSource, capitalAmountBracket: capitalBracket, sectorTarget: sector, experienceYearsInSector: experience, hasSideIncomeTest: sideTest, healthInsuranceStatus: insurance }
      : { originProvinceCode: origin, destProvinceCode: destination, movingWithFamily: withFamily, hasJobOffer: hasOffer, reason }
    return { id: `scn_${Date.now()}`, useCase, horizonYears: horizon, strategies, params, userReflection: { expectedOutcomeSelf: 4, confidencePct: 50, topValues: [] }, freeText, createdAt: new Date().toISOString() }
  }

  function continueToReflection(draft = buildSpec()) {
    sessionStorage.setItem('bercabang_draft', JSON.stringify(draft))
    nav('/forcing')
  }

  async function handleParseStory() {
    if (!freeText.trim()) {
      setParseNotice('Tuliskan dulu beberapa kalimat ceritamu di kotak teks.')
      return
    }

    if (detectCrisisText(freeText)) {
      setShowCrisis(true)
      return
    }

    const scope = detectOutOfScopeText(freeText)
    if (scope.outOfScope) {
      setScopeMsg(scope.reason || 'Cerita ini di luar cakupan Bercabang.')
      return
    }

    setScopeMsg('')
    setParseNotice(null)
    setIsParsing(true)

    try {
      const config = getLLMConfig()
      const key = getMemoryApiKey()
      const parsed = await parseScenarioWithLLM(freeText, config, key)
      setParsedDraft(parsed)
    } catch (err: any) {
      setParseNotice(`Gagal memetakan: ${err.message || 'Terjadi kesalahan'}`)
    } finally {
      setIsParsing(false)
    }
  }

  function applyParsedDraft() {
    if (!parsedDraft) return

    setUseCase(parsedDraft.useCase)
    if (parsedDraft.horizonYears) setHorizon(parsedDraft.horizonYears)

    const p = parsedDraft.params
    if (parsedDraft.useCase === 'CAREER') {
      if (p.sectorTarget) setSector(String(p.sectorTarget))
      if (p.capitalAmountBracket) setCapitalBracket(Number(p.capitalAmountBracket))
      if (p.capitalSource) setCapitalSource(String(p.capitalSource))
      if (p.hasSideIncomeTest !== undefined) setSideTest(Boolean(p.hasSideIncomeTest))
      if (p.experienceYearsInSector !== undefined) setExperience(Number(p.experienceYearsInSector))
    } else {
      if (p.destProvinceCode) setDestination(String(p.destProvinceCode))
      if (p.originProvinceCode) setOrigin(String(p.originProvinceCode))
      if (p.movingWithFamily !== undefined) setWithFamily(Boolean(p.movingWithFamily))
      if (p.hasJobOffer !== undefined) setHasOffer(Boolean(p.hasJobOffer))
      if (p.reason) setReason(String(p.reason))
    }

    setParsedDraft(null)
    setParseNotice('Parameter berhasil diterapkan ke formulir. Silakan periksa kembali.')
    setTimeout(() => setParseNotice(null), 4000)
  }

  function handleContinue() {
    if (isOutOfScope(freeText)) {
      setScopeMsg('Bercabang belum bisa membantu memprediksi hubungan atau keputusan orang lain. Fokuskan cerita pada pilihan karier atau perpindahan Anda sendiri.')
      return
    }
    setScopeMsg('')
    const draft = buildSpec()
    const safety = checkSafety(profile, draft, freeText)
    if (safety.flags.includes('CRISIS')) { setShowCrisis(true); return }
    if (safety.flags.includes('HIGH_RISK')) { setShowPause(true); return }
    continueToReflection(draft)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><ProgressDots total={3} active={0} /><span className="text-xs font-bold text-[#8aa0a0]">Langkah 1 dari 3</span></div>
      <div className="space-y-2"><Eyebrow>Mari mulai dari konteksmu</Eyebrow><h1 className="text-balance text-[30px] font-extrabold leading-tight text-[#172b3a]">Apa yang sedang kamu pertimbangkan?</h1><p className="text-pretty text-[15px] leading-7 text-[#617383]">Tidak harus lengkap. Pilih yang paling mendekati kondisi keluarmu.</p></div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setUseCase('CAREER')} className={`rounded-[22px] p-4 text-left transition duration-200 ${useCase === 'CAREER' ? 'bg-[#087f8c] text-white shadow-[0_10px_24px_rgba(8,127,140,0.2)]' : 'border border-[#dce9e6] bg-white text-[#172b3a]'}`}><BriefcaseBusiness size={22} className={useCase === 'CAREER' ? 'text-white' : 'text-[#087f8c]'} /><p className="mt-3 font-extrabold">Karier / usaha</p><p className={`mt-1 text-xs leading-5 ${useCase === 'CAREER' ? 'text-white/80' : 'text-[#71868a]'}`}>Resign, wirausaha, atau pindah arah.</p></button>
        <button onClick={() => setUseCase('RELOCATE')} className={`rounded-[22px] p-4 text-left transition duration-200 ${useCase === 'RELOCATE' ? 'bg-[#087f8c] text-white shadow-[0_10px_24px_rgba(8,127,140,0.2)]' : 'border border-[#dce9e6] bg-white text-[#172b3a]'}`}><MapPinned size={22} className={useCase === 'RELOCATE' ? 'text-white' : 'text-[#c9663c]'} /><p className="mt-3 font-extrabold">Pindah kota</p><p className={`mt-1 text-xs leading-5 ${useCase === 'RELOCATE' ? 'text-white/80' : 'text-[#71868a]'}`}>Kota, provinsi, atau gaya hidup.</p></button>
      </div>

      <Card className="space-y-5 p-5">
        <div><Eyebrow>Bagian 1 dari 2</Eyebrow><h2 className="mt-1 text-lg font-extrabold">Pilih yang ingin dibandingkan</h2><p className="mt-1 text-sm leading-6 text-[#71868a]">Kami membandingkan tiga jalan agar trade-off-nya terlihat.</p></div>
        <div className="space-y-2.5">
          {strategies.map((option, index) => <div key={option.key} className="flex items-center gap-3 rounded-2xl border border-[#dce9e6] bg-[#f8fbfa] px-4 py-3.5"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-sm font-extrabold text-[#087f8c] shadow-sm">{index + 1}</span><span className="flex-1 text-sm font-bold text-[#314b56]">{option.label}</span><span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8aa0a0]">pembanding</span></div>)}
        </div>

        <div><p className="font-extrabold text-[#314b56]">Seberapa jauh ke depan?</p><div className="mt-3 flex flex-wrap gap-2"><Pill active={horizon === 5} onClick={() => setHorizon(5)}>5 tahun · lebih stabil</Pill><Pill active={horizon === 10} onClick={() => setHorizon(10)}>10 tahun · lebih spekulatif</Pill></div></div>

        <div className="h-px bg-[#e5efed]" />

        <AnimatePresence mode="wait">
          <motion.div key={useCase} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }} className="space-y-4">
            <div><Eyebrow>Bagian 2 dari 2</Eyebrow><h2 className="mt-1 text-lg font-extrabold">{useCase === 'CAREER' ? 'Ceritakan sedikit soal usaha' : 'Ceritakan sedikit soal perpindahan'}</h2></div>
            {useCase === 'CAREER' ? <div className="space-y-4">
              <label className="block space-y-2"><span className="text-sm font-bold text-[#314b56]">Dari mana modalnya?</span><select value={capitalSource} onChange={(e) => setCapitalSource(e.target.value)} className="w-full rounded-2xl border border-[#dce9e6] bg-white px-4 py-3.5 text-sm text-[#314b56]"><option value="tabungan">Tabungan sendiri</option><option value="pinjaman">Pinjaman</option><option value="investor">Investor</option><option value="gaji_lanjut">Gaji selama beberapa bulan</option></select></label>
              <label className="block space-y-2"><span className="text-sm font-bold text-[#314b56]">Perkiraan modal</span><select value={capitalBracket} onChange={(e) => setCapitalBracket(Number(e.target.value))} className="w-full rounded-2xl border border-[#dce9e6] bg-white px-4 py-3.5 text-sm text-[#314b56]"><option value={1}>Relatif kecil</option><option value={3}>Cukup untuk mulai</option><option value={5}>Relatif besar</option></select></label>
              <div className="grid grid-cols-2 gap-3"><label className="block space-y-2"><span className="text-sm font-bold text-[#314b56]">Jenis usaha</span><input value={sector} onChange={(e) => setSector(e.target.value)} placeholder="mis. kuliner" className="w-full rounded-2xl border border-[#dce9e6] bg-white px-4 py-3.5 text-sm" /></label><label className="block space-y-2"><span className="text-sm font-bold text-[#314b56]">Pengalaman (tahun)</span><input type="number" min={0} value={experience} onChange={(e) => setExperience(Number(e.target.value))} className="w-full rounded-2xl border border-[#dce9e6] bg-white px-4 py-3.5 text-sm" /></label></div>
              <label className="flex items-center gap-3 rounded-2xl border border-[#dce9e6] bg-[#f8fbfa] px-4 py-3.5 text-sm font-bold text-[#314b56]"><input type="checkbox" checked={sideTest} onChange={(e) => setSideTest(e.target.checked)} className="h-4 w-4 accent-[#087f8c]" />Saya sudah pernah mencoba usaha sampingan</label>
            </div> : <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3"><label className="block space-y-2"><span className="text-sm font-bold text-[#314b56]">Dari kota</span><select value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full rounded-2xl border border-[#dce9e6] bg-white px-3 py-3.5 text-sm"><option value={origin}>{origin}</option>{provinces.filter((item) => item !== origin).map((item) => <option key={item}>{item}</option>)}</select></label><label className="block space-y-2"><span className="text-sm font-bold text-[#314b56]">Ke kota</span><select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full rounded-2xl border border-[#dce9e6] bg-white px-3 py-3.5 text-sm">{provinces.map((item) => <option key={item}>{item}</option>)}</select></label></div>
              <label className="block space-y-2"><span className="text-sm font-bold text-[#314b56]">Alasan utamanya</span><select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-2xl border border-[#dce9e6] bg-white px-4 py-3.5 text-sm"><option value="kerja">Pekerjaan</option><option value="keluarga">Keluarga</option><option value="biaya_hidup">Biaya hidup</option><option value="lainnya">Lainnya</option></select></label>
              <label className="flex items-center gap-3 rounded-2xl border border-[#dce9e6] bg-[#f8fbfa] px-4 py-3.5 text-sm font-bold text-[#314b56]"><input type="checkbox" checked={withFamily} onChange={(e) => setWithFamily(e.target.checked)} className="h-4 w-4 accent-[#087f8c]" />Pindah bersama pasangan atau keluarga</label>
              <label className="flex items-center gap-3 rounded-2xl border border-[#dce9e6] bg-[#f8fbfa] px-4 py-3.5 text-sm font-bold text-[#314b56]"><input type="checkbox" checked={hasOffer} onChange={(e) => setHasOffer(e.target.checked)} className="h-4 w-4 accent-[#087f8c]" />Saya sudah menerima tawaran kerja</label>
            </div>}
          </motion.div>
        </AnimatePresence>

        <div className="rounded-2xl bg-[#f2f8f6] p-4">
          <button onClick={() => setShowMore((value) => !value)} className="flex w-full items-center justify-between text-left text-sm font-extrabold text-[#087f8c]">
            <span className="inline-flex items-center gap-2"><Sparkles size={16} />{showMore ? 'Sembunyikan cerita tambahan' : 'Punya cerita sendiri? Tambahkan di sini'}</span>
            <span className="text-xs">{showMore ? 'Tutup' : 'Opsional'}</span>
          </button>
          {showMore && (
            <div className="mt-4 space-y-3">
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                rows={4}
                maxLength={4000}
                placeholder="Ceritakan keputusan yang sedang kamu pikirkan dengan bahasamu sendiri…"
                className="w-full resize-none rounded-2xl border border-[#dce9e6] bg-white px-4 py-3 text-sm leading-6 placeholder:text-[#a7b8b8]"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs leading-5 text-[#71868a]">
                  Cerita ini membantu kami memahami konteks. Maksimal 4.000 karakter.
                </p>
                <button
                  type="button"
                  onClick={handleParseStory}
                  disabled={isParsing || !freeText.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#087f8c] px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-[#066e79] disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  {isParsing ? 'Memetakan...' : 'Bantu petakan dari cerita'}
                </button>
              </div>

              {parseNotice && (
                <div className="rounded-xl bg-[#e0f2f1] p-3 text-xs font-bold text-[#087f8c]">
                  {parseNotice}
                </div>
              )}

              {parsedDraft && (
                <div className="mt-2 space-y-2.5 rounded-2xl border border-[#9fcac4] bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#087f8c] uppercase tracking-wider">
                      ✨ Usulan Pemetaan dari Cerita
                    </span>
                    <span className="rounded-full bg-[#e0f2f1] px-2 py-0.5 text-[10px] font-extrabold text-[#087f8c]">
                      {parsedDraft.useCase === 'CAREER' ? 'Karier / Usaha' : 'Pindah Kota'}
                    </span>
                  </div>
                  <p className="text-xs leading-5 text-[#314b56]">
                    {parsedDraft.detectedSummary}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={applyParsedDraft}
                      className="rounded-xl bg-[#087f8c] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#066e79]"
                    >
                      Terapkan ke formulir
                    </button>
                    <button
                      type="button"
                      onClick={() => setParsedDraft(null)}
                      className="rounded-xl border border-[#dce9e6] px-3 py-2 text-xs font-bold text-[#71868a]"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {scopeMsg && <div className="flex gap-2 rounded-2xl border border-[#f1c7b8] bg-[#fff3ee] p-3.5 text-sm leading-6 text-[#a64f36]"><AlertTriangle size={18} className="mt-0.5 shrink-0" />{scopeMsg}</div>}
        <PrimaryButton onClick={handleContinue}>Lanjut: tulis harapanmu <ArrowRight size={17} className="ml-1 inline" /></PrimaryButton>
        <p className="text-center text-xs leading-5 text-[#8aa0a0]">Kamu bisa berhenti kapan saja. Tidak ada yang disimpan ke server tanpa persetujuan.</p>
      </Card>

      <AnimatePresence>
        {showPause && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-[#172b3a]/35 p-5 backdrop-blur-sm" onClick={() => setShowPause(false)}><motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-[440px] space-y-4 rounded-[26px] bg-white p-6 shadow-2xl"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0e8] text-[#c9663c]"><ShieldAlert /></div><div><h2 className="font-display text-2xl font-extrabold">Sebelum lanjut, mari cek risikonya</h2><p className="mt-2 text-sm leading-6 text-[#617383]">Kondisi tabungan, tanggungan, dan modal membuat keputusan ini lebih sulit dibalik. Tidak apa-apa untuk excruciating dulu.</p></div><div className="space-y-2 rounded-2xl bg-[#f2f8f6] p-4 text-sm leading-6 text-[#314b56]"><p>• Bicarakan dengan orang yang Anda percaya.</p><p>• Hitung biaya hidup jika pendapatan turun 30%.</p><p>• Pertimbangkan mencoba pilihan yang lebih kecil lebih dulu.</p></div><div className="grid grid-cols-2 gap-3"><button onClick={() => setShowPause(false)} className="rounded-2xl border border-[#dce9e6] px-4 py-3.5 font-extrabold text-[#46606a]">Saya ingin-thinking ulang</button><button onClick={() => { setShowPause(false); continueToReflection() }} className="rounded-2xl bg-[#087f8c] px-4 py-3.5 font-extrabold text-white">Saya mengerti, lanjut</button></div></motion.div></motion.div>}
        {showCrisis && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 grid place-items-center bg-[#172b3a]/45 p-5 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[460px] space-y-4 rounded-[26px] bg-white p-6 shadow-2xl">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fde9e3] text-[#b64d32]">
                <ShieldAlert size={26} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-extrabold text-[#172b3a]">Kamu tidak sendirian</h2>
                <p className="mt-2 text-sm leading-6 text-[#617383]">
                  Kami mendeteksi bahasa yang membuat kami khawatir. Simulasi kami hentikan agar kamu bisa fokus pada keselamatan diri dan mendapatkan dukungan dari orang tepercaya atau profesional.
                </p>
              </div>

              <div className="space-y-2.5 rounded-2xl border border-[#f1c7b8] bg-[#fff3ee] p-4 text-xs leading-5 text-[#8f4633]">
                <p className="font-extrabold text-sm text-[#b64d32]">Layanan Bantuan Krisis Terverifikasi (Indonesia):</p>
                
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-[#fad4c5]">
                    <div>
                      <strong className="block text-[#172b3a]">Layanan Sejiwa (Kemenkes RI)</strong>
                      <span className="text-[#71868a]">Konseling kesehatan jiwa darurat (Bebas Pulsa)</span>
                    </div>
                    <a
                      href="tel:119,8"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#b64d32] px-3 py-1.5 text-xs font-extrabold text-white"
                    >
                      <PhoneCall size={12} /> 119 Ext 8
                    </a>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-[#fad4c5]">
                    <div>
                      <strong className="block text-[#172b3a]">Panggilan Darurat Nasional</strong>
                      <span className="text-[#71868a]">Medis & keadaan mendesak (Bebas Pulsa)</span>
                    </div>
                    <a
                      href="tel:112"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#172b3a] px-3 py-1.5 text-xs font-extrabold text-white"
                    >
                      <PhoneCall size={12} /> 112
                    </a>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-[#fad4c5]">
                    <div>
                      <strong className="block text-[#172b3a]">Hotline LISA (Love Inside Suicide Awareness)</strong>
                      <span className="text-[#71868a]">Konseling pencegahan bunuh diri 24 jam</span>
                    </div>
                    <a
                      href="tel:08113815472"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#087f8c] px-2.5 py-1.5 text-xs font-extrabold text-white"
                    >
                      <PhoneCall size={12} /> Hubungi
                    </a>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCrisis(false)}
                className="w-full rounded-2xl bg-[#172b3a] px-4 py-3.5 font-extrabold text-white transition hover:bg-[#253d4f]"
              >
                Kembali dan ubah tulisan saya
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
