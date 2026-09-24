import type { Interval, SimulationResult, ScenarioSpec, UserProfile } from './types'

function mulberry32(seed: number) {
  return function () {
    let value = seed += 0x6D2B79F5
    value = Math.imul(value ^ value >>> 15, value | 1)
    value ^= value + Math.imul(value ^ value >>> 7, value | 61)
    return ((value ^ value >>> 14) >>> 0) / 4294967296
  }
}

function interval(base: number, spread: number, random: () => number): Interval {
  const jitter = (random() - 0.5) * spread * 0.2
  const middle = Math.round(base + jitter)
  return { p10: Math.round(middle - spread * 0.6), p50: middle, p90: Math.round(middle + spread * 0.8), coverage: 0.8 }
}

function gradeFromESS(ess: number, horizon: number, provinceKnown: boolean): { grade: 'A' | 'B' | 'C' | 'D', reasons: string[] } {
  let score = 100
  const reasons: string[] = []
  if (ess < 200) { score -= 40; reasons.push('Kasus yang mirip terlalu sedikit untuk pola yang kuat.') }
  else if (ess < 500) { score -= 20; reasons.push('Jumlah kasus yang mirip terbatas, jadi rentangnya perlu dibaca dengan hati-hati.') }
  else if (ess < 1000) { score -= 10; reasons.push('Jumlah kasus yang mirip cukup untuk melihat pola, tetapi belum sangat kuat.') }
  if (!provinceKnown) { score -= 10; reasons.push('Provinsi belum diisi, jadi perbandingan memakai gambaran yang lebih umum.') }
  score -= 10
  reasons.push('Data referensi terakhir berasal dari 2014/15, jadi konteksnya sudah agak lama.')
  if (horizon === 10) { score -= 15; reasons.push('Horizon 10 tahun membuat ketidakpastian jauh lebih besar.') }
  else score -= 5
  score -= 10
  if (score >= 80) return { grade: 'A', reasons }
  if (score >= 65) return { grade: 'B', reasons }
  if (score >= 45) return { grade: 'C', reasons }
  return { grade: 'D', reasons }
}

export function checkSafety(profile: UserProfile | null, spec: Partial<ScenarioSpec>, freeText?: string): { flags: ('HIGH_RISK' | 'CRISIS')[], message?: string } {
  const text = (freeText ?? '').toLowerCase()
  const crisisWords = ['bunuh diri', 'ingin mati', 'menyakiti diri', 'self harm', 'akhiri hidup', 'putus asa sekali']
  if (crisisWords.some((word) => text.includes(word))) return { flags: ['CRISIS'], message: 'Bahasa yang Anda tulis membuat kami khawatir. Simulasi dihentikan agar Anda dapat berbicara dengan orang tepercaya atau tenaga profesional.' }
  const savings = profile?.emergencySavingsMonths ?? 6
  const dependents = profile?.dependents ?? 0
  const capital = Number(spec.params?.capitalAmountBracket ?? 0)
  if (savings < 3 && dependents >= 1 && capital >= 4) return { flags: ['HIGH_RISK'], message: 'Ada beberapa tanda bahwa keputusan ini sulit dibalik. Luangkan waktu untuk mengeceknya bersama orang tepercaya.' }
  return { flags: [] }
}

export function isOutOfScope(freeText?: string): boolean {
  if (!freeText) return false
  const text = freeText.toLowerCase()
  return ['selingkuh', 'pacar saya akan', 'jodoh', 'kecurangan pasangan'].some((word) => text.includes(word))
}

export function runSimulation(profile: UserProfile, spec: ScenarioSpec): SimulationResult {
  const random = mulberry32(spec.id.split('').reduce((total, character) => total + character.charCodeAt(0), 0) + profile.birthYear)
  const effectiveSampleSize = spec.useCase === 'CAREER' ? 320 + Math.floor(random() * 700) : Math.round((320 + Math.floor(random() * 700)) * 0.85)
  const provinceKnown = Boolean(profile.provinceCode)
  const { grade, reasons } = gradeFromESS(effectiveSampleSize, spec.horizonYears, provinceKnown)
  const baseIncome = (profile.incomeBracket ?? 3) * 1_800_000

  const strategies = spec.strategies.map((strategy, index) => {
    const isBusiness = strategy.key.includes('usaha') || strategy.key.includes('resign')
    const multiplier = isBusiness ? (index === 0 ? 0.82 : 0.95) : 1
    const points = ([1, 3, 5, 10] as const).filter((year) => spec.horizonYears === 5 ? year !== 10 : true).map((year) => {
      const yearMultiplier = year === 1 ? multiplier : year === 3 ? multiplier * 1.08 : year === 5 ? multiplier * 1.15 : multiplier * 1.22
      const base = baseIncome * yearMultiplier
      const spread = base * (isBusiness ? 0.45 : 0.28) * (year / 3)
      const pointESS = Math.round(effectiveSampleSize * (1 - year * 0.04))
      return { year, interval: interval(base, spread, random), ess: pointESS, grade: gradeFromESS(pointESS, year as 5 | 10, provinceKnown).grade }
    })
    const financial = [
      { metric: 'Pendapatan rumah tangga', unit: 'Rp / bulan', causalLabel: 'ASSOCIATION' as const, transferability: 'medium' as const, sources: ['ifls-rand', 'hamilton-2000-jpe'], points },
      { metric: 'Konsumsi rumah tangga', unit: 'Rp / bulan', causalLabel: 'ASSOCIATION' as const, transferability: 'medium' as const, sources: ['ifls-rand'], points: points.map((point) => ({ ...point, interval: interval(baseIncome * 0.78 * (point.year === 1 ? 0.98 : 1.02), baseIncome * 0.22, random) })) },
    ]
    const wellbeing = {
      populationFactors: [
        { factor: 'Dukungan sosial dan keluarga', direction: 'protective' as const, evidenceRef: 'wilson-gilbert-2005' },
        { factor: 'Pendapatan yang tidak stabil di awal', direction: 'risk' as const, evidenceRef: 'hamilton-2000-jpe' },
        { factor: 'Akses layanan kesehatan (JKN) yang lebih aman', direction: 'protective' as const, evidenceRef: 'ifls-rand' },
      ],
      biasCorrection: 'Dulu, kita sering mengira perubahan hidup akan terasa jauh lebih besar dan lebih lama. Namun, banyak orang beradaptasi setelah rutinitas baru terbentuk, biasanya dalam 6–18 bulan.',
    }
    return { key: strategy.key, label: strategy.label, outcomes: { financial, wellbeing } }
  })

  const summarySentence = grade === 'D'
    ? 'Data untuk profil ini belum cukup. Daripada menampilkan angka yang bisa membuatmu terlalu yakin, kami memilih memberi pertimbangan kualitatif, bukan angka rinci.'
    : `Pada kelompok dengan konteks yang mirip, pilihan-pilihan ini punya rentang yang masih saling berdekatan. Jadi, belum ada alasan kuat untuk menyebut satu pilihan pasti lebih baik.`

  const unforeseen = [
    'Biaya yang sering terlewat: izin usaha, pajak UMKM, iuran JKN mandiri, dan perawatan alat.',
    'Jaringan orang dan rujukan kerja bisa berubah beberapa bulan setelah keputusan.',
    'Kalau ingin kembali ke pekerjaan formal, cara menjelaskan pengalaman baru mungkin perlu disiapkan saat melamar kerja.',
    'Perubahan harga, aturan, atau kondisi keluarga bisa mengubah hasil lebih besar daripada yang terlihat.',
  ]
  const unpredictable = [
    'Perubahan ekonomi dan harga bahan baku',
    'Peluang atau kenalan baru yang muncul setelah keputusan',
    'Kondisi kesehatan yang tidak terduga',
    'Perubahan aturan atau situasi keluarga',
  ]
  const reflectionQuestions = [
    'Kalau kondisi yang lebih sulit terjadi, apa yang masih bisa kamu lakukan dalam 6 bulan ke depan?',
    'Dari tiga hal yang paling penting, pilihan mana yang paling sesuai dengan nilai-nilai kamu?',
    'Siapa orang yang pendapatnya paling kamu percaya untuk menguji asumsi ini?',
    'Apa langkah kecil yang bisa kamu coba dalam 30 hari tanpa mengunci keputusan besar?',
  ]
  const delta: Interval = { p10: -850_000, p50: 120_000, p90: 980_000, coverage: 0.8 }

  return {
    id: `res_${spec.id}`,
    scenarioId: spec.id,
    meta: { modelVersion: 'bercabang-ifls-v0.9', dataVersion: 'IFLS 2014/15 (data 2014/15)', trialSpecVersion: spec.useCase === 'CAREER' ? 'TTE-CAREER-v1' : 'TTE-RELOCATE-v1', seed: 42, generatedAt: new Date().toISOString() },
    overall: { confidenceGrade: grade, gradeReasons: reasons, summarySentence },
    strategies,
    contrasts: strategies.length >= 2 ? [{ a: strategies[0].key, b: strategies[1].key, metric: 'Pendapatan rumah tangga', year: 3, delta, label: 'ASSOCIATION' }] : [],
    unforeseen,
    reversibility: { score: spec.useCase === 'CAREER' ? 2 : 3, smallTests: spec.useCase === 'CAREER' ? ['Jalankan usaha sampingan selama 3 bulan sambil tetap bekerja', 'Coba menerima pre-order dari pelanggan yang nyata', 'Hitung ulang rencana jika pendapatan turun 30%'] : ['Tinggalkan percobaan singkat di kota tujuan', 'Kenali beberapa orang dan komunitas sebelum pindah', 'Hitung biaya makan, tinggal, dan perjalanan selama 3 bulan'] },
    unpredictable,
    reflectionQuestions,
    expectationVsData: { userExpectation: spec.userReflection.expectedOutcomeSelf, modelRange: { p10: 2.8, p50: 4.1, p90: 5.6, coverage: 0.8 }, note: 'Ini perbandingan perkiraanmu dengan pola kelompok yang mirip, bukan penilaian atas kamu.' },
    limitations: ['Data yang diamati bisa tidak mencakup hal-hal yang tidak kita ketahui.', 'Motivasi, jaringan, dan kesempatan pribadi bisa ikut memengaruhi hasil.', 'Untuk profil yang sangat khusus, jumlah kasusnya bisa sedikit.'],
    assumptions: ['Kondisi awal yang kamu isi cukup menggambarkan kelompok pembanding.', 'Tidak sedang terjadi guncangan ekonomi yang sangat besar.', 'Penghasilan dan pengeluaran dihitung dengan cara yang konsisten.'],
    safety: { flags: [] },
  }
}
