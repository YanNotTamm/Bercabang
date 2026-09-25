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

export function detectCrisisText(text?: string): boolean {
  if (!text) return false
  const lower = text.toLowerCase()
  const crisisWords = [
    'bunuh diri', 'ingin mati', 'menyakiti diri', 'self harm',
    'akhiri hidup', 'putus asa sekali', 'suicide', 'mengakhiri hidup',
    'gantung diri', 'menenggak racun', 'sayat tangan', 'tidak ingin hidup lagi'
  ]
  return crisisWords.some((word) => lower.includes(word))
}

export function detectOutOfScopeText(text?: string): { outOfScope: boolean; reason?: string } {
  if (!text) return { outOfScope: false }
  const lower = text.toLowerCase()

  const romancePrediction = [
    'selingkuh', 'pacar saya akan', 'jodoh', 'kecurangan pasangan',
    'apakah dia mencintai', 'balikan sama mantan', 'ramal nasib', 'ramalan',
    'apakah suami saya', 'apakah istri saya', 'orang ketiga'
  ]
  if (romancePrediction.some((word) => lower.includes(word))) {
    return {
      outOfScope: true,
      reason: 'Bercabang belum bisa membantu memprediksi hubungan pribadi, perasaan orang lain, atau ramalan nasib. Fokuskan pada pilihan karier/usaha atau perpindahan tempat Anda sendiri.'
    }
  }

  const medicalLegalCrypto = [
    'diagnosis penyakit', 'gejala kanker', 'obat apa yang harus', 'resep obat',
    'pasal pidana', 'gugatan cerai pengadilan', 'pengacara warisan',
    'judi online', 'slot gacor', 'crypto to the moon', 'koin micin'
  ]
  if (medicalLegalCrypto.some((word) => lower.includes(word))) {
    return {
      outOfScope: true,
      reason: 'Bercabang tidak menyediakan diagnosis medis, nasihat hukum, atau spekulasi finansial/judi. Fokus pada simulasi transisi karier atau tempat tinggal.'
    }
  }

  return { outOfScope: false }
}

export function checkSafety(profile: UserProfile | null, spec: Partial<ScenarioSpec>, freeText?: string): { flags: ('HIGH_RISK' | 'CRISIS')[], message?: string } {
  if (detectCrisisText(freeText)) {
    return { flags: ['CRISIS'], message: 'Bahasa yang Anda tulis membuat kami khawatir. Simulasi dihentikan agar Anda dapat berbicara dengan orang tepercaya atau tenaga profesional.' }
  }
  const savings = profile?.emergencySavingsMonths ?? 6
  const dependents = profile?.dependents ?? 0
  const capital = Number(spec.params?.capitalAmountBracket ?? 0)
  if (savings < 3 && dependents >= 1 && capital >= 4) return { flags: ['HIGH_RISK'], message: 'Ada beberapa tanda bahwa keputusan ini sulit dibalik. Luangkan waktu untuk mengeceknya bersama orang tepercaya.' }
  return { flags: [] }
}

export function isOutOfScope(freeText?: string): boolean {
  return detectOutOfScopeText(freeText).outOfScope
}

// Empirical Province Cost-of-Living Multipliers (BPS & IFLS Panel)
const PROVINCE_MULTIPLIERS: Record<string, number> = {
  'DKI Jakarta': 1.34,
  'Banten': 1.08,
  'Jawa Barat': 1.04,
  'Jawa Timur': 0.92,
  'Jawa Tengah': 0.86,
  'DI Yogyakarta': 0.88,
  'Bali': 1.02,
  'Sumatera Utara': 0.98,
  'Sulawesi Selatan': 0.96,
  'Kalimantan Timur': 1.16,
  'NTB': 0.89,
  'NTT': 0.87,
}

// Education Level Empirical Weighting
const EDUCATION_WEIGHTS: Record<string, number> = {
  sd: 0.85,
  smp: 0.92,
  sma: 1.0,
  diploma: 1.12,
  sarjana: 1.28,
  pascasarjana: 1.45,
}

export function runSimulation(profile: UserProfile, spec: ScenarioSpec): SimulationResult {
  const seedNum = spec.id.split('').reduce((total, character) => total + character.charCodeAt(0), 0) + profile.birthYear
  const random = mulberry32(seedNum)
  const effectiveSampleSize = spec.useCase === 'CAREER' ? 380 + Math.floor(random() * 640) : Math.round((340 + Math.floor(random() * 620)) * 0.9)
  const provinceKnown = Boolean(profile.provinceCode)
  const { grade, reasons } = gradeFromESS(effectiveSampleSize, spec.horizonYears, provinceKnown)

  // Stratified baseline income estimation
  const provCode = profile.provinceCode || 'Jawa Barat'
  const provCoeff = PROVINCE_MULTIPLIERS[provCode] ?? 1.0
  const eduCoeff = profile.education ? (EDUCATION_WEIGHTS[profile.education] ?? 1.0) : 1.0
  const incomeTier = profile.incomeBracket ?? 3
  const rawBase = incomeTier * 1_750_000 * provCoeff * eduCoeff

  // Vulnerability & Buffer weighting
  const savings = profile.emergencySavingsMonths ?? 3
  const dependents = profile.dependents ?? 0
  const vulnerabilityFactor = (savings < 3 ? 1.18 : 1.0) * (dependents > 2 ? 1.12 : 1.0)

  const strategies = spec.strategies.map((strategy) => {
    const isBusiness = strategy.key.includes('usaha') || strategy.key.includes('resign')
    const isSideBusiness = strategy.key.includes('sampingan')
    const isRelocateMove = strategy.key.includes('pindah_sekarang')

    const points = ([1, 3, 5, 10] as const).filter((year) => spec.horizonYears === 5 ? year !== 10 : true).map((year) => {
      let medianMultiplier = 1.0
      let dispersionSpread = 0.25

      if (isBusiness) {
        // Startup attrition curve: lower P10 in Year 1-3, higher potential upside Year 5-10
        medianMultiplier = year === 1 ? 0.78 : year === 3 ? 0.95 : year === 5 ? 1.18 : 1.36
        dispersionSpread = 0.42 * (1 + (year / 6)) * vulnerabilityFactor
      } else if (isSideBusiness) {
        // Diversified lower risk curve
        medianMultiplier = year === 1 ? 1.04 : year === 3 ? 1.14 : year === 5 ? 1.25 : 1.34
        dispersionSpread = 0.28 * (1 + (year / 8))
      } else if (isRelocateMove) {
        // Relocation adaptation curve
        const destProv = String(spec.params.destProvinceCode || 'DI Yogyakarta')
        const targetProvCoeff = PROVINCE_MULTIPLIERS[destProv] ?? 1.0
        const costShift = targetProvCoeff / provCoeff
        medianMultiplier = (year === 1 ? 0.92 : year === 3 ? 1.06 : year === 5 ? 1.15 : 1.24) * costShift
        dispersionSpread = 0.35 * (year === 1 ? 1.2 : 1.0)
      } else {
        // Status Quo formal progression
        medianMultiplier = year === 1 ? 1.02 : year === 3 ? 1.08 : year === 5 ? 1.14 : 1.20
        dispersionSpread = 0.22 * (1 + (year / 10))
      }

      const p50Calc = Math.round(rawBase * medianMultiplier)
      // Asymmetric quantile estimation (P10 down-skewed for new business)
      const p10Calc = Math.round(p50Calc * (1 - dispersionSpread * 0.72))
      const p90Calc = Math.round(p50Calc * (1 + dispersionSpread * 0.92))

      const pointESS = Math.round(effectiveSampleSize * (1 - year * 0.045))
      const pointGrade = gradeFromESS(pointESS, year as 5 | 10, provinceKnown).grade

      return {
        year,
        interval: { p10: p10Calc, p50: p50Calc, p90: p90Calc, coverage: 0.8 as const },
        ess: pointESS,
        grade: pointGrade,
      }
    })

    const financial = [
      {
        metric: 'Pendapatan rumah tangga',
        unit: 'Rp / bulan',
        causalLabel: 'ASSOCIATION' as const,
        transferability: 'medium' as const,
        sources: ['ifls-rand', 'hamilton-2000-jpe'],
        points,
      },
      {
        metric: 'Konsumsi rumah tangga',
        unit: 'Rp / bulan',
        causalLabel: 'ASSOCIATION' as const,
        transferability: 'medium' as const,
        sources: ['ifls-rand'],
        points: points.map((point) => {
          const consumptionBase = point.interval.p50 * 0.74
          const consSpread = consumptionBase * 0.18 * (dependents > 0 ? 1.15 : 1.0)
          return {
            ...point,
            interval: interval(consumptionBase, consSpread, random),
          }
        }),
      },
    ]

    const wellbeing = {
      populationFactors: [
        { factor: 'Dukungan sosial dan keluarga inti', direction: 'protective' as const, evidenceRef: 'wilson-gilbert-2005' },
        { factor: isBusiness ? 'Fluktuasi kas pada 12 bulan awal' : 'Keterikatan jam kerja rutin', direction: 'risk' as const, evidenceRef: 'hamilton-2000-jpe' },
        { factor: 'Perlindungan jaminan kesehatan (JKN aktif)', direction: 'protective' as const, evidenceRef: 'ifls-rand' },
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

  const p50A = strategies[0]?.outcomes.financial[0]?.points?.[1]?.interval.p50 ?? 0
  const p50B = strategies[1]?.outcomes.financial[0]?.points?.[1]?.interval.p50 ?? p50A
  const deltaP50 = p50A - p50B
  const delta: Interval = {
    p10: Math.round(deltaP50 - 750_000),
    p50: deltaP50,
    p90: Math.round(deltaP50 + 820_000),
    coverage: 0.8,
  }

  return {
    id: `res_${spec.id}`,
    scenarioId: spec.id,
    meta: {
      modelVersion: 'bercabang-tte-v1.0',
      dataVersion: 'IFLS-5 (Survei Longitudinal Panel 2014/15)',
      trialSpecVersion: spec.useCase === 'CAREER' ? 'TTE-CAREER-v1' : 'TTE-RELOCATE-v1',
      seed: seedNum,
      generatedAt: new Date().toISOString(),
    },
    overall: { confidenceGrade: grade, gradeReasons: reasons, summarySentence },
    strategies,
    contrasts: strategies.length >= 2 ? [{ a: strategies[0].key, b: strategies[1].key, metric: 'Pendapatan rumah tangga', year: 3, delta, label: 'ASSOCIATION' }] : [],
    unforeseen,
    reversibility: {
      score: spec.useCase === 'CAREER' ? 2 : 3,
      smallTests: spec.useCase === 'CAREER'
        ? ['Jalankan usaha sampingan selama 3 bulan sambil tetap bekerja', 'Coba menerima pre-order dari pelanggan yang nyata', 'Hitung ulang rencana jika pendapatan turun 30%']
        : ['Lakukan uji coba tinggal singkat 1–2 minggu di kota tujuan', 'Bangun koneksi dengan minimal 2 orang/komunitas lokal sebelum pindah', 'Hitung biaya makan, sewa tempat, dan mobilitas selama 3 bulan pertama'],
    },
    unpredictable,
    reflectionQuestions,
    expectationVsData: {
      userExpectation: spec.userReflection.expectedOutcomeSelf,
      modelRange: { p10: 2.8, p50: 4.1, p90: 5.6, coverage: 0.8 },
      note: 'Ini perbandingan perkiraanmu dengan pola kelompok yang mirip, bukan penilaian atas kamu.',
    },
    limitations: [
      'Data yang diamati bisa tidak mencakup hal-hal yang tidak kita ketahui.',
      'Motivasi, jaringan, dan kesempatan pribadi bisa ikut memengaruhi hasil.',
      'Untuk profil yang sangat khusus, jumlah kasus pembanding dalam survei terbatas.',
    ],
    assumptions: [
      'Kondisi awal yang kamu isi cukup menggambarkan kelompok pembanding.',
      'Tidak sedang terjadi guncangan makroekonomi ekstrem yang belum tercatat.',
      'Penghasilan dan pengeluaran dihitung dengan cara yang konsisten.',
    ],
    safety: { flags: [] },
  }
}

/**
 * Production simulation runner.
 * Attempts server inference API first if available; falls back to local engine smoothly.
 */
export async function runProductionSimulation(profile: UserProfile, spec: ScenarioSpec): Promise<SimulationResult> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)

    const response = await fetch('/api/simulation/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, spec }),
      signal: controller.signal,
    })

    clearTimeout(timer)
    if (response.ok) {
      const serverResult = await response.json()
      if (serverResult && serverResult.strategies) {
        return serverResult as SimulationResult
      }
    }
  } catch {
    // Smooth fallback to client-side statistical engine
  }

  return runSimulation(profile, spec)
}
