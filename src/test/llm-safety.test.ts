import { describe, it, expect } from 'vitest'
import {
  detectCrisisText,
  detectOutOfScopeText,
} from '../lib/engine'
import {
  extractNumbersFromString,
  collectWhitelistNumbersFromResult,
  validateExplainedNumbers,
  sanitizeErrorMessage,
  fallbackScenarioParse,
  fallbackResultExplain,
} from '../lib/llm'
import { encryptSecret, decryptSecret } from '../lib/crypto'
import type { SimulationResult } from '../lib/types'

describe('1. Crisis & Scope Pre-checks (Red-Team)', () => {
  it('detects crisis keywords immediately and stops before calling LLM', () => {
    expect(detectCrisisText('Saya sangat putus asa dan ingin bunuh diri')).toBe(true)
    expect(detectCrisisText('Saya ingin mati saja rasanya')).toBe(true)
    expect(detectCrisisText('Terpikir untuk self harm')).toBe(true)
    expect(detectCrisisText('Mau resign dan buka warung kopi')).toBe(false)
  })

  it('detects out-of-scope queries (relationships, fortune-telling, medical, legal)', () => {
    // Romance / partner fidelity
    const romance = detectOutOfScopeText('Apakah pacar saya akan selingkuh kalau saya ke Jakarta?')
    expect(romance.outOfScope).toBe(true)

    // Fortune telling / astrology
    const fortune = detectOutOfScopeText('Ramal nasib dan jodoh saya di tahun 2026')
    expect(fortune.outOfScope).toBe(true)

    // Medical diagnosis
    const medical = detectOutOfScopeText('Tolong diagnosis penyakit pusing saya apakah kanker')
    expect(medical.outOfScope).toBe(true)

    // Legal advice
    const legal = detectOutOfScopeText('Bagaimana pasal pidana tuntut ke pengadilan?')
    expect(legal.outOfScope).toBe(true)

    // Allowed career / relocation query
    const valid = detectOutOfScopeText('Saya berniat resign dari bank BUMN dan merintis warung ayam geprek di Bandung')
    expect(valid.outOfScope).toBe(false)
  })
})

describe('2. Key Sanitization & Error Handling', () => {
  it('strips Bearer tokens from error messages', () => {
    const errorMsg = 'Failed upstream request: Authorization: Bearer sk-proj-1234567890abcdef1234567890'
    const sanitized = sanitizeErrorMessage(errorMsg)
    expect(sanitized).not.toContain('sk-proj-1234567890abcdef1234567890')
    expect(sanitized).toContain('Bearer [REDACTED]')
  })

  it('strips active API key substring if present in error message', () => {
    const myKey = 'kios-secret-key-998877'
    const errorMsg = `Connection reset with key ${myKey} during TLS handshake`
    const sanitized = sanitizeErrorMessage(errorMsg, myKey)
    expect(sanitized).not.toContain(myKey)
    expect(sanitized).toContain('[REDACTED_KEY]')
  })
})

describe('3. Web Crypto AES-GCM Key Protection', () => {
  it('encrypts and decrypts secret correctly with valid passphrase', async () => {
    const secretKey = 'sk-or-v1-abcdef1234567890_super_secret_token'
    const passphrase = 'my-secure-passphrase-2026'

    const encryptedBundle = await encryptSecret(secretKey, passphrase)
    expect(encryptedBundle).not.toEqual(secretKey)
    expect(encryptedBundle).not.toContain(secretKey)

    const decrypted = await decryptSecret(encryptedBundle, passphrase)
    expect(decrypted).toBe(secretKey)
  })

  it('fails decryption when provided wrong passphrase', async () => {
    const secretKey = 'sk-or-v1-abcdef1234567890_super_secret_token'
    const encryptedBundle = await encryptSecret(secretKey, 'correct-pass')

    await expect(decryptSecret(encryptedBundle, 'wrong-pass')).rejects.toThrow()
  })
})

describe('4. Number Whitelist Validation', () => {
  const dummyResult: SimulationResult = {
    id: 'res_test',
    scenarioId: 'scn_test',
    meta: {
      modelVersion: 'v1',
      dataVersion: 'IFLS 2014/15',
      trialSpecVersion: 'TTE-CAREER-v1',
      seed: 42,
      generatedAt: new Date().toISOString(),
    },
    overall: {
      confidenceGrade: 'B',
      gradeReasons: ['Pola cukup kuat'],
      summarySentence: 'Rentang kedua opsi masih saling beririsan.',
    },
    strategies: [
      {
        key: 'usaha',
        label: 'Buka usaha',
        outcomes: {
          financial: [
            {
              metric: 'Pendapatan',
              unit: 'Rp / bulan',
              causalLabel: 'ASSOCIATION',
              transferability: 'medium',
              sources: ['ifls'],
              points: [
                {
                  year: 1,
                  interval: { p10: 3000000, p50: 5000000, p90: 8000000, coverage: 0.8 },
                  ess: 450,
                  grade: 'B',
                },
              ],
            },
          ],
        },
      },
    ],
    contrasts: [],
    unforeseen: ['Biaya sewa toko'],
    reversibility: { score: 3, smallTests: ['Uji coba 1 bulan'] },
    unpredictable: ['Harga bahan'],
    reflectionQuestions: ['Apa rencana cadangan?'],
    assumptions: ['Stabil'],
    limitations: ['Data terbatas'],
    safety: { flags: [] },
  }

  it('approves explanation when numbers match the whitelist', () => {
    const allowed = collectWhitelistNumbersFromResult(dummyResult)
    const explanation = {
      summary: 'Pada tahun 1, pendapatan tengah berada di kisaran 5000000 dengan rentang 3000000 hingga 8000000.',
      keyTakeaways: ['Uji coba langkah kecil 1 bulan', 'Skor reversibilitas 3 dari 5'],
      questionsToAsk: ['Siapkan rencana darurat'],
      cautionNotes: ['Biaya sewa dapat bervariasi'],
      numbersUsed: [],
      source: 'llm' as const,
    }

    const check = validateExplainedNumbers(explanation, allowed)
    expect(check.valid).toBe(true)
    expect(check.unauthorizedNumbers).toHaveLength(0)
  })

  it('rejects explanation and flags unauthorized invented numbers', () => {
    const allowed = collectWhitelistNumbersFromResult(dummyResult)
    const explanation = {
      summary: 'Keuntungan Anda pasti mencapai 95000000 per bulan.', // Invented 95000000 not in result!
      keyTakeaways: ['Modal ekstra 25000000 sangat direkomendasikan'], // Invented 25000000
      questionsToAsk: ['Apa rencana cadangan?'],
      cautionNotes: ['Risiko tetap ada'],
      numbersUsed: [],
      source: 'llm' as const,
    }

    const check = validateExplainedNumbers(explanation, allowed)
    expect(check.valid).toBe(false)
    expect(check.unauthorizedNumbers).toContain(95000000)
    expect(check.unauthorizedNumbers).toContain(25000000)
  })

  it('correctly extracts integers and amounts from free text', () => {
    const nums = extractNumbersFromString('Target 5 tahun, modal Rp 15.000.000 dan 3 bulan tabungan')
    expect(nums).toContain(5)
    expect(nums).toContain(15000000)
    expect(nums).toContain(3)
  })
})

describe('5. Deterministic Local Fallbacks', () => {
  it('correctly maps story to career parameters in fallback mode', () => {
    const parsed = fallbackScenarioParse('Saya mau resign dari kantor dan buka kafe kopi dengan tabungan')
    expect(parsed.useCase).toBe('CAREER')
    expect(parsed.params.sectorTarget).toBe('kuliner')
    expect(parsed.params.capitalSource).toBe('tabungan')
  })

  it('correctly maps story to relocation parameters in fallback mode', () => {
    const parsed = fallbackScenarioParse('Mau pindah ke jogja ajak keluarga karena ingin biaya hidup lebih tenang')
    expect(parsed.useCase).toBe('RELOCATE')
    expect(parsed.params.destProvinceCode).toBe('DI Yogyakarta')
    expect(parsed.params.movingWithFamily).toBe(true)
  })

  it('produces valid deterministic explanation structure without calling LLM', () => {
    const dummyResult: any = {
      id: 'res_local',
      overall: { confidenceGrade: 'B', summarySentence: 'Rentang saling beririsan.' },
      strategies: [{ label: 'Usaha Kuliner' }, { label: 'Tetap Karyawan' }],
      reversibility: { smallTests: ['Jual pre-order 2 minggu'] },
      unforeseen: ['Iuran JKN mandiri'],
      unpredictable: ['Perubahan harga pasar'],
      reflectionQuestions: ['Apa rencana 6 bulan ke depan?'],
    }

    const expl = fallbackResultExplain(dummyResult)
    expect(expl.source).toBe('fallback')
    expect(expl.summary).toContain('Usaha Kuliner')
    expect(expl.keyTakeaways.length).toBeGreaterThan(0)
    expect(expl.questionsToAsk.length).toBeGreaterThan(0)
  })
})
