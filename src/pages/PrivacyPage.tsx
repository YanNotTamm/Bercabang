import { useState } from 'react'
import {
  ShieldCheck,
  Download,
  Trash2,
  Lock,
  ArrowLeft,
  CheckCircle2,
  FileText,
  EyeOff,
  Cpu
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, Eyebrow } from '../components/ui'
import { db, clearAllData } from '../lib/db'

export default function PrivacyPage() {
  const nav = useNavigate()
  const [downloaded, setDownloaded] = useState(false)

  async function handleExportAllData() {
    const profile = (await db.profiles.toArray())[0] || null
    const scenarios = await db.scenarios.toArray()
    const results = await db.results.toArray()
    const consents = await db.consents.toArray()

    const exportBundle = {
      app: 'Bercabang PWA',
      exportDate: new Date().toISOString(),
      complianceLaw: 'UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)',
      dataSubject: {
        profile,
        scenariosCount: scenarios.length,
        resultsCount: results.length,
        consentsCount: consents.length,
      },
      records: {
        profile,
        scenarios,
        results,
        consents,
      },
    }

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bercabang-data-pribadi-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 3000)
  }

  async function handleClearAll() {
    if (window.confirm('Hapus seluruh profil, skenario, riwayat, dan data lokal secara permanen? Tindakan ini tidak dapat dibatalkan.')) {
      await clearAllData()
      alert('Seluruh data pribadi Anda telah berhasil dihapus dari perangkat.')
      nav('/', { replace: true })
      window.location.reload()
    }
  }

  return (
    <div className="space-y-5 pb-8">
      <button
        onClick={() => nav(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#71868a] hover:text-[#087f8c]"
      >
        <ArrowLeft size={15} /> Kembali
      </button>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-[#e0f2f1] text-[#087f8c]">
            <ShieldCheck size={16} />
          </span>
          <Eyebrow>Pelindungan Data Pribadi</Eyebrow>
        </div>
        <h1 className="text-balance text-[28px] font-extrabold leading-tight text-[#172b3a]">
          Hak Privasi & Kendali Penuh Milikmu
        </h1>
        <p className="text-pretty text-sm leading-6 text-[#617383]">
          Bercabang dirancang patuh pada <b>UU No. 27 Tahun 2022 (UU PDP)</b> dengan arsitektur <i>Local-First</i>. Kami tidak mengumpulkan data pribadimu ke server pusat.
        </p>
      </div>

      {/* UU PDP Rights Cards */}
      <Card className="divide-y divide-[#e5efed] overflow-hidden">
        <div className="p-5 flex items-start gap-3.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f2f8f6] text-[#087f8c]">
            <Lock size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#172b3a]">1. Prinsip Penyimpanan Lokal (Zero Server Capture)</h2>
            <p className="mt-1 text-xs leading-5 text-[#71868a]">
              Semua input profil, tabungan, dan cerita disimpan eksklusif di memori perangkatmu via IndexedDB. Kami tidak memiliki basis data pengguna di internet.
            </p>
          </div>
        </div>

        <div className="p-5 flex items-start gap-3.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f2f8f6] text-[#087f8c]">
            <EyeOff size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#172b3a]">2. Data Sensitif Tidak Pernah Diminta</h2>
            <p className="mt-1 text-xs leading-5 text-[#71868a]">
              Bercabang tidak pernah meminta Nama Lengkap, NIK KTP, Nomor Telepon, Rekening Bank, maupun Lokasi Presisi (GPS).
            </p>
          </div>
        </div>

        <div className="p-5 flex items-start gap-3.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f2f8f6] text-[#087f8c]">
            <Cpu size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#172b3a]">3. Keamanan API Key & Enkripsi Web Crypto</h2>
            <p className="mt-1 text-xs leading-5 text-[#71868a]">
              Kunci API penyedia AI tidak pernah disimpan polos. Kunci diamankan di memori sesi aktif atau dienkripsi dengan standar AES-GCM 256-bit berpasword pribadi.
            </p>
          </div>
        </div>
      </Card>

      {/* Action Center for Data Rights */}
      <Card className="p-5 space-y-4">
        <div>
          <Eyebrow>Eksekusi Hak Subjek Data (Pasal 5–13 UU PDP)</Eyebrow>
          <h2 className="mt-1 text-base font-extrabold text-[#172b3a]">Kelola Data Pribadimu</h2>
          <p className="mt-1 text-xs leading-5 text-[#71868a]">
            Kamu memegang hak penuh untuk mengunduh salinan data atau menghapusnya kapan saja.
          </p>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleExportAllData}
            className="flex w-full items-center justify-between rounded-2xl border border-[#dce9e6] bg-[#f8fbfa] p-4 text-left transition hover:border-[#9fcac4]"
          >
            <div className="flex items-center gap-3">
              <Download size={18} className="text-[#087f8c]" />
              <div>
                <strong className="block text-xs font-extrabold text-[#172b3a]">
                  Unduh Salinan Data Saya (Format JSON)
                </strong>
                <span className="text-[11px] text-[#71868a]">
                  Ekspor profil, skenario, dan riwayat simulasi untuk arsip pribadimu.
                </span>
              </div>
            </div>
            {downloaded && <CheckCircle2 size={18} className="text-[#16705a]" />}
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            className="flex w-full items-center justify-between rounded-2xl border border-[#f1c7b8] bg-[#fff3ee] p-4 text-left transition hover:bg-[#ffeae0]"
          >
            <div className="flex items-center gap-3">
              <Trash2 size={18} className="text-[#b64d32]" />
              <div>
                <strong className="block text-xs font-extrabold text-[#b64d32]">
                  Hapus Permanen Semua Data dari Perangkat
                </strong>
                <span className="text-[11px] text-[#a64f36]">
                  Menghapus seketika seluruh IndexedDB, cache lokal, dan persetujuan.
                </span>
              </div>
            </div>
          </button>
        </div>
      </Card>

      <div className="rounded-2xl border border-[#dce9e6] bg-white p-4 text-center">
        <a
          href="/metodologi"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#087f8c] hover:underline"
        >
          <FileText size={14} /> Pelajari Metodologi & Daftar Bukti Ilmiah
        </a>
      </div>
    </div>
  )
}
