import { useState } from 'react'
import { BookOpen, ChevronDown, ExternalLink, LockKeyhole, ShieldCheck, HeartPulse, FileLock2 } from 'lucide-react'
import { Card, Eyebrow } from '../components/ui'
import { EVIDENCE } from '../lib/evidence'

export default function Methodology() {
  const [technical, setTechnical] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null)

  return (
    <div className="space-y-5 pb-8">
      <div className="space-y-2">
        <Eyebrow>Info & transparansi</Eyebrow>
        <h1 className="text-balance text-[30px] font-extrabold leading-tight text-[#172b3a]">
          Kenapa Bercabang tidak bisa menjawab dengan pasti?
        </h1>
        <p className="text-pretty text-[15px] leading-7 text-[#617383]">
          Karena hidup punya banyak variabel yang tidak bisa diamati dengan rapi. Kami memilih menunjukkan batas-batasnya secara jujur.
        </p>
      </div>

      <Card className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 shrink-0 text-[#087f8c]" size={21} />
          <div>
            <h2 className="font-extrabold text-[#314b56]">Cara Bercabang bekerja</h2>
            <p className="mt-2 text-sm leading-6 text-[#71868a]">
              Kami membandingkan pilihan dengan pola dari kelompok yang mirip (Target Trial Emulation), lalu menunjukkan rentang kemungkinan. Hasilnya bukan ramalan dan bukan instruksi.
            </p>
          </div>
        </div>
        <div className="space-y-2 text-sm leading-6 text-[#536c72]">
          <p><b>1. Isi konteks minimal.</b> Hanya data yang membantu memahami pilihan hidupmu.</p>
          <p><b>2. Tulis ekspektasi pribadi.</b> Kami membuatmu melihat jawaban sendiri sebelum data ditampilkan (Cognitive Forcing).</p>
          <p><b>3. Lihat rentang realistis.</b> Kami menampilkan pola distribusi, risiko, dan hal yang belum diketahui.</p>
        </div>
      </Card>

      <Card className="space-y-3 p-5">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 shrink-0 text-[#c9663c]" size={21} />
          <div>
            <h2 className="font-extrabold text-[#314b56]">Batasan Etis yang Dijaga Ketat</h2>
            <p className="mt-2 text-sm leading-6 text-[#71868a]">
              Kami tidak mendiagnosis penyakit fisik/mental, tidak memprediksi hubungan dengan orang ketiga, dan tidak memberi perintah mutlak “harus melakukan” atau “dilarang melakukan”.
            </p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-5">
        <button
          onClick={() => setTechnical((current) => !current)}
          className="flex w-full items-center justify-between text-left"
        >
          <div>
            <Eyebrow>Untuk yang ingin meninjau secara mendalam</Eyebrow>
            <h2 className="mt-1 text-lg font-extrabold text-[#314b56]">
              Metodologi, Tinjauan Ahli & Register Bukti
            </h2>
          </div>
          <ChevronDown
            size={19}
            className={`text-[#087f8c] transition ${technical ? 'rotate-180' : ''}`}
          />
        </button>

        {technical && (
          <div className="mt-5 space-y-5">
            <div className="rounded-2xl bg-[#172b3a] p-4 text-sm leading-6 text-white/80 space-y-2">
              <p className="font-extrabold text-white">Prinsip Target Trial Emulation (TTE)</p>
              <p>
                Bercabang menerapkan kerangka Target Trial Emulation (Hernán & Robins, 2016). Keputusan pengguna diframing sebagai uji acak hipotetis yang diestimasi menggunakan data panel longitudinal (IFLS-5).
              </p>
              <p className="text-xs text-white/60">
                Data utama: Indonesia Family Life Survey (RAND IFLS-5). Bukan data real-time seketika.
              </p>
            </div>

            <div>
              <p className="text-sm font-extrabold text-[#314b56]">
                8 Studi Ilmiah Primer (Klik untuk melihat limitasi)
              </p>
              <div className="mt-2 space-y-2.5">
                {EVIDENCE.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEvidence(selectedEvidence === item.id ? null : item.id)}
                    className="cursor-pointer rounded-2xl border border-[#dce9e6] bg-[#f8fbfa] p-4 text-sm leading-6 transition hover:border-[#9fcac4]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-extrabold text-[#314b56]">{item.citation}</p>
                      <span className="shrink-0 rounded-full bg-[#e0f2f1] px-2 py-0.5 text-[10px] font-bold text-[#087f8c]">
                        {item.domain}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#536c72]">{item.claim}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-[#8aa0a0]">
                      <span>Transferabilitas ID: <b>{item.transferabilityToID}</b></span>
                      {item.doi && <span className="font-mono">DOI: {item.doi}</span>}
                    </div>

                    {selectedEvidence === item.id && (
                      <div className="mt-3 rounded-xl bg-white p-3 text-xs leading-5 text-[#46606a] border border-[#e5efed]">
                        <p className="font-bold text-[#172b3a]">Batasan yang Dicatat Ahli Domain:</p>
                        <ul className="mt-1 list-disc pl-4 space-y-0.5">
                          {item.limitations.map((lim, idx) => (
                            <li key={idx}>{lim}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Direct Shortcuts for Privacy & Crisis */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href="/privasi"
          className="flex flex-col justify-between rounded-2xl border border-[#dce9e6] bg-white p-4 shadow-sm hover:border-[#9fcac4]"
        >
          <div className="space-y-1">
            <FileLock2 size={20} className="text-[#087f8c]" />
            <h3 className="text-xs font-extrabold text-[#172b3a]">Hak Privasi UU PDP</h3>
            <p className="text-[11px] text-[#71868a]">Kelola data & salinan arsip lokal</p>
          </div>
          <span className="mt-3 text-[10px] font-bold text-[#087f8c]">Buka Portal &rarr;</span>
        </a>

        <a
          href="/krisis"
          className="flex flex-col justify-between rounded-2xl border border-[#fad4c5] bg-[#fffbf9] p-4 shadow-sm hover:border-[#f1c7b8]"
        >
          <div className="space-y-1">
            <HeartPulse size={20} className="text-[#b64d32]" />
            <h3 className="text-xs font-extrabold text-[#b64d32]">Bantuan Darurat</h3>
            <p className="text-[11px] text-[#8f4633]">Kontak krisis Sejiwa 119 Ext 8</p>
          </div>
          <span className="mt-3 text-[10px] font-bold text-[#b64d32]">Lihat Hotline &rarr;</span>
        </a>
      </div>

      <Card className="space-y-3 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 shrink-0 text-[#16705a]" size={21} />
          <div>
            <h2 className="font-extrabold text-[#314b56]">Privasi Tanpa Kompromi</h2>
            <p className="mt-2 text-sm leading-6 text-[#71868a]">
              Profil dan riwayat disimpan lokal di perangkat. Tidak ada pelacak iklan, tidak ada akun sosial, dan kamu bisa menghapus semuanya dengan satu tombol.
            </p>
          </div>
        </div>
        <a
          href="https://www.rand.org/well-being/social-and-behavioral-policy/data/FLS/IFLS.html"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-[#087f8c]"
        >
          Dokumentasi Survei IFLS RAND <ExternalLink size={15} />
        </a>
      </Card>
    </div>
  )
}
