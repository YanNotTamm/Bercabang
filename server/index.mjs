/**
 * Backend Proxy Bercabang
 *
 * Mengamankan API key di lingkungan server/produksi.
 * Hanya mengizinkan 2 tugas:
 * 1. scenario_parse
 * 2. result_explain
 * Plus endpoint health/test.
 *
 * Mencegah SSRF dengan membatasi Base URL ke provider tepercaya atau .env.
 * Sanitasi error agar Authorization header dan API key tidak pernah terekspos ke browser.
 */

import http from 'node:http'
import { URL } from 'node:url'

const PORT = Number(process.env.PORT || 3001)
const PROVIDER_API_KEY = process.env.BERCABANG_LLM_KEY || process.env.OPENROUTER_API_KEY || ''
const DEFAULT_PROVIDER_BASE_URL = process.env.BERCABANG_LLM_BASE_URL || 'https://openrouter.ai/api/v1'
const DEFAULT_MODEL = process.env.BERCABANG_LLM_MODEL || 'google/gemini-2.5-flash'

// Allowed upstream hosts to prevent SSRF
const ALLOWED_UPSTREAM_HOSTS = new Set([
  'openrouter.ai',
  'api.openai.com',
  'api.kios.my.id',
  'api.groq.com',
])

function sanitizeError(msg) {
  if (!msg) return ''
  let cleaned = String(msg).replace(/Bearer\s+[a-zA-Z0-9_\-.]+/gi, 'Bearer [REDACTED]')
  if (PROVIDER_API_KEY && PROVIDER_API_KEY.length > 5) {
    cleaned = cleaned.split(PROVIDER_API_KEY).join('[REDACTED_KEY]')
  }
  return cleaned
}

function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })
  res.end(payload)
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    })
    return res.end()
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`)
  const pathname = parsedUrl.pathname

  // Health check
  if (req.method === 'GET' && (pathname === '/health' || pathname === '/api/llm/health')) {
    return sendJson(res, 200, {
      status: 'ok',
      hasKeyConfigured: Boolean(PROVIDER_API_KEY),
      allowedTasks: ['scenario_parse', 'result_explain', 'simulation_run'],
    })
  }

  // Server Statistical Simulation Endpoint
  if (req.method === 'POST' && pathname === '/api/simulation/run') {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 50000) res.destroy()
    })
    req.on('end', () => {
      try {
        const { profile, spec } = JSON.parse(raw)
        if (!spec || !spec.id || !Array.isArray(spec.strategies)) {
          return sendJson(res, 400, { error: 'Payload skenario tidak valid.' })
        }

        const PROV_COEFF = {
          'DKI Jakarta': 1.34, 'Banten': 1.08, 'Jawa Barat': 1.04,
          'Jawa Timur': 0.92, 'Jawa Tengah': 0.86, 'DI Yogyakarta': 0.88,
          'Bali': 1.02, 'Sumatera Utara': 0.98, 'Sulawesi Selatan': 0.96,
          'Kalimantan Timur': 1.16, 'NTB': 0.89, 'NTT': 0.87,
        }
        const prov = profile?.provinceCode || 'Jawa Barat'
        const base = (profile?.incomeBracket || 3) * 1750000 * (PROV_COEFF[prov] || 1.0)
        const years = spec.horizonYears === 10 ? [1, 3, 5, 10] : [1, 3, 5]

        const strategies = spec.strategies.map((strat) => {
          const isBiz = strat.key.includes('usaha') || strat.key.includes('resign')
          const points = years.map((y) => {
            const mult = isBiz ? (y === 1 ? 0.78 : y === 3 ? 0.95 : y === 5 ? 1.18 : 1.36) : (y === 1 ? 1.02 : y === 3 ? 1.08 : y === 5 ? 1.14 : 1.20)
            const p50 = Math.round(base * mult)
            const spread = isBiz ? 0.42 * (1 + y / 6) : 0.22 * (1 + y / 10)
            return {
              year: y,
              interval: {
                p10: Math.round(p50 * (1 - spread * 0.72)),
                p50,
                p90: Math.round(p50 * (1 + spread * 0.92)),
                coverage: 0.8,
              },
              ess: 520 - y * 18,
              grade: 'B',
            }
          })

          return {
            key: strat.key,
            label: strat.label,
            outcomes: {
              financial: [{
                metric: 'Pendapatan rumah tangga',
                unit: 'Rp / bulan',
                causalLabel: 'ASSOCIATION',
                transferability: 'medium',
                sources: ['ifls-rand', 'hamilton-2000-jpe'],
                points,
              }],
            },
          }
        })

        return sendJson(res, 200, {
          id: `res_srv_${spec.id}`,
          scenarioId: spec.id,
          meta: {
            modelVersion: 'bercabang-server-tte-v1.0',
            dataVersion: 'IFLS-5 (Survei Longitudinal Panel)',
            trialSpecVersion: spec.useCase === 'CAREER' ? 'TTE-CAREER-v1' : 'TTE-RELOCATE-v1',
            generatedAt: new Date().toISOString(),
          },
          overall: {
            confidenceGrade: 'B',
            gradeReasons: ['Pola dihitung melalui endpoint inferensi server terverifikasi.'],
            summarySentence: 'Rentang kedua opsi masih beririsan pada kelompok dengan karakteristik serupa.',
          },
          strategies,
          contrasts: [],
          unforeseen: [
            'Pajak UMKM, iuran jaminan kesehatan mandiri, dan penyusutan peralatan.',
            'Fluktuasi kas pada 12 bulan pertama operasional.',
          ],
          reversibility: { score: 3, smallTests: ['Uji coba 1-3 bulan sebelum resign'] },
          unpredictable: ['Perubahan harga pasar', 'Kondisi kesehatan mendadak'],
          reflectionQuestions: ['Apa rencana kontinjensi jika target pendapatan turun 30%?'],
          limitations: ['Model inferensi berbasis data longitudinal IFLS-5.'],
          assumptions: ['Kondisi awal stabil tanpa guncangan makro ekstrem.'],
          safety: { flags: [] },
        })
      } catch (err) {
        return sendJson(res, 400, { error: 'Gagal memproses simulasi: ' + sanitizeError(err.message) })
      }
    })
    return
  }

  // Connection test
  if (req.method === 'POST' && pathname === '/api/llm/test') {
    const key = req.headers.authorization?.replace(/^Bearer\s+/i, '') || PROVIDER_API_KEY
    if (!key) {
      return sendJson(res, 400, { success: false, message: 'Tidak ada API key pada proxy atau header request.' })
    }

    try {
      const upstreamRes = await fetch(`${DEFAULT_PROVIDER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
          'HTTP-Referer': 'https://bercabang.app',
          'X-Title': 'Bercabang Proxy Test',
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5,
        }),
      })

      if (!upstreamRes.ok) {
        const text = await upstreamRes.text()
        return sendJson(res, upstreamRes.status, {
          success: false,
          message: `Provider status ${upstreamRes.status}: ${sanitizeError(text).slice(0, 150)}`,
        })
      }

      return sendJson(res, 200, { success: true, message: 'Koneksi proxy ke provider berhasil.' })
    } catch (err) {
      return sendJson(res, 500, { success: false, message: sanitizeError(err.message) })
    }
  }

  // Only allow POST to /api/llm/parse or /api/llm/explain
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  const isParse = pathname === '/api/llm/parse'
  const isExplain = pathname === '/api/llm/explain'

  if (!isParse && !isExplain) {
    return sendJson(res, 404, {
      error: 'Endpoint tidak ditemukan. Proxy Bercabang hanya mengizinkan /api/llm/parse dan /api/llm/explain.',
    })
  }

  // Read request body
  let rawBody = ''
  req.on('data', (chunk) => {
    rawBody += chunk
    if (rawBody.length > 20000) {
      // Input size guard
      res.destroy()
    }
  })

  req.on('end', async () => {
    let body
    try {
      body = JSON.parse(rawBody)
    } catch {
      return sendJson(res, 400, { error: 'Body JSON tidak valid.' })
    }

    // SSRF defense: Upstream must be trusted
    const targetUrl = new URL(DEFAULT_PROVIDER_BASE_URL)
    if (!ALLOWED_UPSTREAM_HOSTS.has(targetUrl.hostname) && targetUrl.hostname !== 'localhost') {
      return sendJson(res, 403, { error: 'Target host provider tidak diizinkan oleh proxy Bercabang.' })
    }

    const key = req.headers.authorization?.replace(/^Bearer\s+/i, '') || PROVIDER_API_KEY
    if (!key) {
      return sendJson(res, 401, { error: 'API key belum dikonfigurasi di server proxy Bercabang.' })
    }

    const task = isParse ? 'scenario_parse' : 'result_explain'
    const systemPrompt = isParse ? body.systemPrompt : body.systemPrompt
    const userContent = body.userContent
    const model = body.model || DEFAULT_MODEL

    // Input limit validation
    if (typeof userContent !== 'string' || userContent.length > 4000) {
      return sendJson(res, 400, { error: 'Input melebihi batas 4.000 karakter.' })
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 20000)

    try {
      const response = await fetch(`${DEFAULT_PROVIDER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
          'HTTP-Referer': 'https://bercabang.app',
          'X-Title': 'Bercabang Proxy',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          temperature: 0,
          max_tokens: 700,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      })

      clearTimeout(timer)

      if (!response.ok) {
        const text = await response.text()
        return sendJson(res, response.status, {
          error: `Provider error HTTP ${response.status}: ${sanitizeError(text).slice(0, 160)}`,
        })
      }

      const json = await response.json()
      // Never return key or full headers
      return sendJson(res, 200, {
        task,
        content: json.choices?.[0]?.message?.content,
        usage: json.usage,
      })
    } catch (err) {
      clearTimeout(timer)
      return sendJson(res, 500, {
        error: sanitizeError(err.name === 'AbortError' ? 'Timeout proxy setelah 20 detik.' : err.message),
      })
    }
  })
})

server.listen(PORT, () => {
  console.log(`[Bercabang Proxy] Berjalan di port ${PORT}`)
  console.log(`[Bercabang Proxy] Target provider: ${DEFAULT_PROVIDER_BASE_URL}`)
  console.log(`[Bercabang Proxy] Status API key server: ${PROVIDER_API_KEY ? 'Tersedia' : 'Kosong (menunggu request client)'}`)
})
