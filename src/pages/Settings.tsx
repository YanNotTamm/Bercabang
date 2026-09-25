import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  KeyRound,
  Server,
  Zap,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Lock,
  Info
} from 'lucide-react'
import { Card, Eyebrow, PrimaryButton } from '../components/ui'
import {
  getLLMConfig,
  saveLLMConfig,
  clearAllLLMConfig,
  setMemoryApiKey,
  getMemoryApiKey,
  testLLMConnection,
  getDailyUsageCount,
  getSessionUsage,
  getLLMUsageLogs,
} from '../lib/llm'
import { encryptSecret, decryptSecret } from '../lib/crypto'
import type { LLMConfig, LLMProvider, ConnectionTestResult, LLMUsageLog } from '../lib/llm-types'

const PRESET_PROVIDERS: Record<
  LLMProvider,
  { label: string; defaultBaseUrl: string; defaultModel: string; hint: string }
> = {
  openrouter: {
    label: 'OpenRouter',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-2.5-flash',
    hint: 'Akses berbagai model melalui gateway OpenRouter.',
  },
  kios: {
    label: 'Kios',
    defaultBaseUrl: 'https://api.kios.my.id/v1',
    defaultModel: 'gpt-4o-mini',
    hint: 'Provider lokal/regional Kios (OpenAI-compatible).',
  },
  openai_compatible: {
    label: 'OpenAI Compatible (Custom)',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    hint: 'Base URL kustom dipanggil langsung dari browser untuk mencegah SSRF server.',
  },
  proxy: {
    label: 'Proxy Bercabang (Server)',
    defaultBaseUrl: '/api/llm',
    defaultModel: 'google/gemini-2.5-flash',
    hint: 'API key disimpan aman di server backend produksi tanpa lewat browser.',
  },
}

export default function Settings() {
  const [config, setConfig] = useState<LLMConfig>(() => getLLMConfig())
  const [inputKey, setInputKey] = useState<string>(() => getMemoryApiKey() || '')
  const [showKey, setShowKey] = useState(false)
  const [passphrase, setPassphrase] = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [isEncryptedSaved, setIsEncryptedSaved] = useState<boolean>(() => Boolean(localStorage.getItem('bercabang_llm_encrypted_bundle')))
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null)
  const [dailyUsage] = useState(() => getDailyUsageCount())
  const [sessionUsage] = useState(() => getSessionUsage())
  const [logs] = useState<LLMUsageLog[]>(() => getLLMUsageLogs())

  function handleProviderChange(newProvider: LLMProvider) {
    const preset = PRESET_PROVIDERS[newProvider]
    const updated = {
      ...config,
      provider: newProvider,
      baseUrl: preset.defaultBaseUrl,
      model: preset.defaultModel,
    }
    setConfig(updated)
    saveLLMConfig(updated)
  }

  async function handleSaveSettings() {
    saveLLMConfig(config)
    let maskedKeyLastFour = config.keyLastFour

    if (inputKey.trim()) {
      maskedKeyLastFour = inputKey.slice(-4)
      setMemoryApiKey(inputKey)

      if (config.storageMode === 'encrypted') {
        if (!passphrase || passphrase.length < 6) {
          setStatusMessage({
            type: 'error',
            text: 'Kata sandi enkripsi minimal 6 karakter untuk mengamankan key.',
          })
          return
        }
        try {
          const bundle = await encryptSecret(inputKey.trim(), passphrase)
          localStorage.setItem('bercabang_llm_encrypted_bundle', bundle)
          setIsEncryptedSaved(true)
          setStatusMessage({
            type: 'success',
            text: 'Key berhasil dienkripsi dengan sandi pribadimu (Web Crypto AES-GCM).',
          })
        } catch {
          setStatusMessage({
            type: 'error',
            text: 'Gagal mengenkripsi key.',
          })
          return
        }
      } else {
        // Memory only
        localStorage.removeItem('bercabang_llm_encrypted_bundle')
        setIsEncryptedSaved(false)
        setStatusMessage({
          type: 'success',
          text: 'Konfigurasi disimpan. API key aktif di memori sesi saat ini.',
        })
      }
    } else {
      setStatusMessage({
        type: 'info',
        text: 'Konfigurasi disimpan (tanpa perubahan API key).',
      })
    }

    saveLLMConfig({ ...config, keyLastFour: maskedKeyLastFour })
    setTimeout(() => setStatusMessage(null), 3500)
  }

  async function handleUnlockKey() {
    const bundle = localStorage.getItem('bercabang_llm_encrypted_bundle')
    if (!bundle) return

    try {
      const decrypted = await decryptSecret(bundle, passphrase)
      setMemoryApiKey(decrypted)
      setInputKey(decrypted)
      setStatusMessage({
        type: 'success',
        text: 'Key berhasil didekripsi ke memori sesi aktif.',
      })
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Kata sandi salah. Gagal membuka key.',
      })
    }
    setTimeout(() => setStatusMessage(null), 3000)
  }

  async function handleTestConnection() {
    const activeKey = inputKey.trim() || getMemoryApiKey()
    if (!activeKey && config.provider !== 'proxy') {
      setStatusMessage({
        type: 'error',
        text: 'Masukkan API key terlebih dahulu sebelum mengetes koneksi.',
      })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const res = await testLLMConnection(config, activeKey || '')
      setTestResult(res)
    } finally {
      setIsTesting(false)
    }
  }

  function handleClearAll() {
    if (window.confirm('Hapus semua konfigurasi AI dan key dari perangkat ini?')) {
      clearAllLLMConfig()
      setInputKey('')
      setPassphrase('')
      setIsEncryptedSaved(false)
      setTestResult(null)
      setConfig(getLLMConfig())
      setStatusMessage({
        type: 'info',
        text: 'Semua konfigurasi AI telah dibersihkan.',
      })
      setTimeout(() => setStatusMessage(null), 2500)
    }
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="space-y-2">
        <Eyebrow>Kendali & Privasi</Eyebrow>
        <h1 className="text-balance text-[30px] font-extrabold leading-tight text-[#172b3a]">
          Pengaturan AI & LLM
        </h1>
        <p className="text-pretty text-[15px] leading-7 text-[#617383]">
          Fitur AI bersifat <b>sepenuhnya opsional</b>. Bercabang tetap berjalan penuh dengan model deterministik lokal tanpa perlu koneksi AI.
        </p>
      </div>

      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2.5 rounded-2xl p-4 text-sm font-bold ${
            statusMessage.type === 'success'
              ? 'bg-[#e4f6ef] text-[#16705a]'
              : statusMessage.type === 'error'
              ? 'bg-[#fde9e3] text-[#b64d32]'
              : 'bg-[#e0f2f1] text-[#087f8c]'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0" />
          ) : statusMessage.type === 'error' ? (
            <XCircle size={18} className="shrink-0" />
          ) : (
            <Info size={18} className="shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </motion.div>
      )}

      {/* Security Notice Card */}
      <Card className="border border-[#cde6dd] bg-[#f4faf8] p-5">
        <div className="flex gap-3.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#087f8c] text-white shadow-sm">
            <ShieldCheck size={20} />
          </div>
          <div className="space-y-1.5 text-xs leading-5 text-[#3b575e]">
            <p className="font-extrabold text-[#172b3a]">Prinsip Keamanan Bercabang</p>
            <p>• API key Anda <b>tidak pernah disimpan polos</b> di localStorage atau database browser.</p>
            <p>• LLM <b>hanya</b> digunakan untuk memetakan teks cerita ke parameter atau menjelaskan ringkasan hasil simulasi.</p>
            <p>• Angka hasil simulasi diverifikasi dengan <i>number whitelist</i>; angka buatan AI langsung ditolak.</p>
          </div>
        </div>
      </Card>

      {/* Provider & Model Selection */}
      <Card className="space-y-5 p-5">
        <div>
          <Eyebrow>Layanan AI</Eyebrow>
          <h2 className="mt-1 text-lg font-extrabold text-[#172b3a]">Penyedia (Provider)</h2>
          <p className="mt-1 text-xs leading-5 text-[#71868a]">
            Pilih provider yang Anda miliki akses atau kuncinya.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {(Object.keys(PRESET_PROVIDERS) as LLMProvider[]).map((prov) => {
            const isSelected = config.provider === prov
            return (
              <button
                key={prov}
                type="button"
                onClick={() => handleProviderChange(prov)}
                className={`rounded-2xl p-3.5 text-left transition duration-200 ${
                  isSelected
                    ? 'border-2 border-[#087f8c] bg-[#e0f2f1] text-[#087f8c] shadow-sm'
                    : 'border border-[#dce9e6] bg-white text-[#46606a] hover:border-[#9fcac4]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold">{PRESET_PROVIDERS[prov].label}</span>
                  {isSelected && <CheckCircle2 size={16} />}
                </div>
                <p className="mt-1 text-[11px] leading-4 text-[#71868a]">
                  {PRESET_PROVIDERS[prov].hint}
                </p>
              </button>
            )
          })}
        </div>

        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-extrabold text-[#314b56]">Base URL</span>
            <div className="flex items-center rounded-2xl border border-[#dce9e6] bg-white px-3.5 py-3">
              <Server size={16} className="mr-2 text-[#7c9294]" />
              <input
                type="text"
                value={config.baseUrl}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                className="w-full text-sm outline-none"
                placeholder="https://..."
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-extrabold text-[#314b56]">Model ID</span>
            <input
              type="text"
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              className="w-full rounded-2xl border border-[#dce9e6] bg-white px-3.5 py-3 text-sm"
              placeholder="mis. google/gemini-2.5-flash atau gpt-4o-mini"
            />
          </label>
        </div>

        {/* API Key Management */}
        {config.provider !== 'proxy' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#314b56]">API Key</span>
              {config.keyLastFour && (
                <span className="text-[11px] font-bold text-[#087f8c]">
                  Tersimpan: ••••{config.keyLastFour}
                </span>
              )}
            </div>

            <div className="relative">
              <div className="flex items-center rounded-2xl border border-[#dce9e6] bg-white px-3.5 py-3">
                <KeyRound size={16} className="mr-2 text-[#7c9294]" />
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder={config.keyLastFour ? 'Masukkan key baru jika ingin mengganti' : 'sk-...'}
                  className="w-full text-sm outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 text-[#7c9294] hover:text-[#087f8c]"
                  aria-label="Toggle lihat API key"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Storage Mode Selector */}
            <div className="space-y-2 rounded-2xl bg-[#f8fbfa] p-4 border border-[#e5efed]">
              <span className="block text-xs font-extrabold text-[#314b56]">
                Metode Penyimpanan Key:
              </span>
              <div className="space-y-2">
                <label className="flex items-start gap-2.5 text-xs text-[#46606a] cursor-pointer">
                  <input
                    type="radio"
                    name="storageMode"
                    checked={config.storageMode === 'memory'}
                    onChange={() => setConfig({ ...config, storageMode: 'memory' })}
                    className="mt-0.5 accent-[#087f8c]"
                  />
                  <span>
                    <strong className="text-[#172b3a]">Memori Sesi Saja (Paling Aman)</strong>
                    <br />
                    Key hanya aktif di memori browser saat ini. Dihapus otomatis saat tab/browser ditutup.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-[#46606a] cursor-pointer">
                  <input
                    type="radio"
                    name="storageMode"
                    checked={config.storageMode === 'encrypted'}
                    onChange={() => setConfig({ ...config, storageMode: 'encrypted' })}
                    className="mt-0.5 accent-[#087f8c]"
                  />
                  <span>
                    <strong className="text-[#172b3a]">Enkripsi Sandi Pribadi (Web Crypto AES-GCM)</strong>
                    <br />
                    Key dienkripsi dengan kata sandi Anda sebelum disimpan di browser. Tidak bisa dibaca tanpa sandi.
                  </span>
                </label>
              </div>

              {config.storageMode === 'encrypted' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2 pt-2"
                >
                  <label className="block space-y-1">
                    <span className="text-[11px] font-bold text-[#314b56]">
                      Kata Sandi Pelindung Key (Minimal 6 karakter)
                    </span>
                    <div className="flex items-center rounded-2xl border border-[#dce9e6] bg-white px-3.5 py-2.5">
                      <Lock size={15} className="mr-2 text-[#7c9294]" />
                      <input
                        type={showPassphrase ? 'text' : 'password'}
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        placeholder="Sandi pribadi Anda"
                        className="w-full text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassphrase(!showPassphrase)}
                        className="p-1 text-[#7c9294]"
                      >
                        {showPassphrase ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </label>

                  {isEncryptedSaved && !getMemoryApiKey() && (
                    <button
                      type="button"
                      onClick={handleUnlockKey}
                      className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-[#087f8c] px-3 py-2 text-xs font-bold text-white"
                    >
                      <Lock size={14} /> Buka Kunci Key dengan Sandi
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Daily Limit Configuration */}
        <div className="space-y-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-extrabold text-[#314b56]">
              Batas Penggunaan Harian
            </span>
            <select
              value={config.dailyLimit}
              onChange={(e) => setConfig({ ...config, dailyLimit: Number(e.target.value) })}
              className="w-full rounded-2xl border border-[#dce9e6] bg-white px-3.5 py-3 text-sm font-bold text-[#314b56]"
            >
              <option value={3}>3 request / hari (sangat hemat)</option>
              <option value={5}>5 request / hari (disarankan)</option>
              <option value={10}>10 request / hari (standar)</option>
              <option value={20}>20 request / hari</option>
            </select>
          </label>
        </div>

        {/* Buttons: Test Connection & Save */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#087f8c] bg-[#e0f2f1] px-4 py-3.5 text-xs font-extrabold text-[#087f8c] transition hover:bg-[#b9e3df] disabled:opacity-50"
          >
            {isTesting ? (
              <>Mengetes...</>
            ) : (
              <>
                <Zap size={16} /> Tes Koneksi
              </>
            )}
          </button>

          <PrimaryButton onClick={handleSaveSettings} className="!py-3.5 !text-xs">
            Simpan Pengaturan
          </PrimaryButton>
        </div>

        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-4 text-xs font-bold ${
              testResult.success
                ? 'bg-[#e4f6ef] text-[#16705a] border border-[#b8e8d6]'
                : 'bg-[#fff0e8] text-[#c9663c] border border-[#f5ccba]'
            }`}
          >
            <p className="flex items-center gap-2">
              {testResult.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {testResult.message}
            </p>
          </motion.div>
        )}
      </Card>

      {/* Usage Monitor */}
      <Card className="space-y-4 p-5">
        <div>
          <Eyebrow>Penggunaan & Batas</Eyebrow>
          <h2 className="mt-1 text-lg font-extrabold text-[#172b3a]">Status Penggunaan</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#f2f8f6] p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b8589]">
              Hari Ini
            </span>
            <p className="mt-1 font-display text-2xl font-extrabold text-[#087f8c]">
              {dailyUsage} <span className="text-xs font-normal text-[#71868a]">/ {config.dailyLimit}</span>
            </p>
          </div>

          <div className="rounded-2xl bg-[#f8fbfa] p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b8589]">
              Sesi Ini
            </span>
            <p className="mt-1 font-display text-2xl font-extrabold text-[#172b3a]">
              {sessionUsage.sessionRequests}{' '}
              <span className="text-xs font-normal text-[#71868a]">
                / {sessionUsage.maxSessionRequests}
              </span>
            </p>
          </div>
        </div>

        <p className="text-xs leading-5 text-[#71868a]">
          Maksimal 3 panggilan per sesi browser untuk menjaga efisiensi dan keamanan. Jika batas tercapai, sistem secara otomatis beralih ke analisis lokal.
        </p>

        {/* Audit Log (Sanitized, non-sensitive) */}
        {logs.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#e5efed]">
            <span className="text-xs font-extrabold text-[#314b56]">
              Riwayat Permintaan AI (Terakhir {logs.length})
            </span>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-xl bg-white border border-[#e5efed] p-2.5 text-[11px]"
                >
                  <span className="font-bold text-[#314b56]">
                    {log.task === 'scenario_parse' ? 'Pemetaan Cerita' : 'Penjelasan Hasil'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        log.status === 'success'
                          ? 'bg-[#e4f6ef] text-[#16705a]'
                          : log.status === 'fallback'
                          ? 'bg-[#fff2d8] text-[#9a6810]'
                          : 'bg-[#fde9e3] text-[#b64d32]'
                      }`}
                    >
                      {log.status}
                    </span>
                    <span className="text-[#8aa0a0] font-mono">{log.durationMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#f1c7b8] bg-[#fff3ee] px-4 py-3 text-xs font-extrabold text-[#b64d32] transition hover:bg-[#ffeae0]"
          >
            <Trash2 size={15} /> Hapus Konfigurasi AI & Bersihkan Key
          </button>
        </div>
      </Card>
    </div>
  )
}
