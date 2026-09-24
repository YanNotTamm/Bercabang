import { useState } from 'react'
import { Check, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Card, Eyebrow, PrimaryButton } from '../components/ui'
import { db } from '../lib/db'

export default function ConsentGate({ onPassed }: { onPassed: () => void }) {
  const [birth, setBirth] = useState('')
  const [process, setProcess] = useState(false)
  const [history, setHistory] = useState(false)
  const [research, setResearch] = useState(false)
  const age = birth ? new Date().getFullYear() - Number(birth) : null
  const canContinue = age !== null && age >= 18 && process

  async function handle() {
    if (!canContinue) return
    const timestamp = new Date().toISOString()
    await db.consents.bulkPut([
      { id: 'process_simulation', purpose: 'process_simulation', granted: process, textVersion: 'v1', timestamp },
      { id: 'store_history', purpose: 'store_history', granted: history, textVersion: 'v1', timestamp },
      { id: 'anonymous_research', purpose: 'anonymous_research', granted: research, textVersion: 'v1', timestamp },
    ])
    localStorage.setItem('bercabang_onboarded', '1')
    localStorage.setItem('bercabang_birthYear', birth)
    onPassed()
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2"><Eyebrow>Langkah kecil sebelum mulai</Eyebrow><h1 className="text-balance text-[30px] font-extrabold leading-tight text-[#172b3a]">Cek dulu, baru lanjut.</h1><p className="text-pretty text-[15px] leading-7 text-[#617383]">Kami hanya meminta izin yang memang diperlukan.</p></div>
      <Card className="space-y-5 p-5">
        <label className="block space-y-2"><span className="text-sm font-extrabold text-[#314b56]">Tahun lahirmu</span><input value={birth} onChange={(event) => setBirth(event.target.value)} placeholder="mis. 1996" inputMode="numeric" className="w-full rounded-2xl border border-[#dce9e6] bg-white px-4 py-3.5 text-sm" />{age !== null && age < 18 && <p className="text-sm leading-6 text-[#b64d32]">Bercabang hanya untuk usia 18 tahun ke atas. Kamu bisa kembali nanti.</p>}{age !== null && age >= 18 && <p className="text-sm font-bold text-[#16705a]">Terima kasih, kamu boleh lanjut.</p>}</label>
        <div className="flex gap-3 rounded-2xl bg-[#f2f8f6] p-4"><ShieldCheck className="mt-0.5 shrink-0 text-[#087f8c]" size={19} /><p className="text-sm leading-6 text-[#536c72]">Hasil Bercabang selalu berupa <b>kemungkinan</b>, bukan jawaban pasti. Kami juga tidak akan memberi diagnosis atau perintah.</p></div>
        <div className="space-y-2.5">
          <ConsentRow checked={process} onChange={setProcess} required title="Boleh memproses jawaban untuk membuat simulasi" description="Wajib. Jawaban tidak disimpan di server." />
          <ConsentRow checked={history} onChange={setHistory} title="Simpan riwayat di perangkat ini" description="Boleh dilewati. Kamu bisa menghapus kapan saja." />
          <ConsentRow checked={research} onChange={setResearch} title="Bantu riset anonim" description="Opsional, default tidak aktif. Hanya data agregat tanpa identitas." />
        </div>
        <PrimaryButton onClick={handle} disabled={!canContinue}>Mulai dengan aman <LockKeyhole size={16} className="ml-1 inline" /></PrimaryButton>
        <p className="text-center text-xs leading-5 text-[#8aa0a0]">Kamu bisa mengubah pilihan ini kapan saja di halaman Profil.</p>
      </Card>
    </div>
  )
}

function ConsentRow({ checked, onChange, title, description, required = false }: { checked: boolean; onChange: (value: boolean) => void; title: string; description: string; required?: boolean }) {
  return <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#dce9e6] bg-white p-4 transition hover:border-[#9fcac4]"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#087f8c]" /><span><span className="block text-sm font-extrabold text-[#314b56]">{title} {required && <em className="not-italic text-[#c9663c]">· wajib</em>}</span><span className="mt-1 block text-xs leading-5 text-[#71868a]">{description}</span></span>{checked && <Check className="ml-auto shrink-0 text-[#087f8c]" size={17} />}</label>
}
