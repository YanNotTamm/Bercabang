import { useEffect, useState } from 'react'
import { Check, Info, Trash2 } from 'lucide-react'
import { Card, Eyebrow, PrimaryButton } from '../components/ui'
import { clearAllData, db } from '../lib/db'
import type { UserProfile } from '../lib/types'

const provinces = ['DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Bali', 'Sumatera Utara', 'Sulawesi Selatan', 'Kalimantan Timur', 'DI Yogyakarta', 'Banten', 'NTB', 'NTT']

export default function ProfilePage() {
  const [form, setForm] = useState<Partial<UserProfile>>({ birthYear: Number(localStorage.getItem('bercabang_birthYear') || 1996) })
  const [saved, setSaved] = useState(false)

  useEffect(() => { void db.profiles.toArray().then((items) => { if (items[0]) setForm(items[0]) }) }, [])

  async function save() {
    const profile: UserProfile = {
      id: 'local',
      birthYear: Number(form.birthYear) || 1996,
      gender: form.gender,
      education: form.education as UserProfile['education'],
      maritalStatus: form.maritalStatus as UserProfile['maritalStatus'],
      dependents: form.dependents,
      urbanRural: form.urbanRural as UserProfile['urbanRural'],
      provinceCode: form.provinceCode,
      employmentStatus: form.employmentStatus as UserProfile['employmentStatus'],
      sector: form.sector,
      incomeBracket: form.incomeBracket as UserProfile['incomeBracket'],
      emergencySavingsMonths: form.emergencySavingsMonths,
      debtToIncomeBracket: form.debtToIncomeBracket as UserProfile['debtToIncomeBracket'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await db.profiles.put(profile)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2"><Eyebrow>Profil & privasi</Eyebrow><h1 className="text-balance text-[30px] font-extrabold leading-tight text-[#172b3a]">Bantu kami membaca konteksmu.</h1><p className="text-pretty text-[15px] leading-7 text-[#617383]">Semua ini opsional. Isi yang membuat pola dalam hasil semakin relevan, dan biarkan sisanya kosong.</p></div>
      <Card className="space-y-5 p-5">
        <div className="flex gap-3 rounded-2xl bg-[#f2f8f6] p-4"><Info className="mt-0.5 shrink-0 text-[#087f8c]" size={18} /><p className="text-sm leading-6 text-[#536c72]">Kami tidak meminta nama, NIK, alamat, nomor telepon, atau koordinat. Data profil disimpan di perangkat ini.</p></div>
        <div className="space-y-2"><label className="text-sm font-extrabold text-[#314b56]">Tahun lahir</label><input value={form.birthYear ?? ''} onChange={(event) => setForm({ ...form, birthYear: Number(event.target.value) })} inputMode="numeric" className="w-full rounded-2xl border border-[#dce9e6] px-4 py-3.5 text-sm" /></div>
        <div className="grid gap-3 sm:grid-cols-2"><Field label="Jenis kelamin" hint="Boleh dilewati"><select value={form.gender ?? ''} onChange={(event) => setForm({ ...form, gender: event.target.value as UserProfile['gender'] })} className="w-full rounded-2xl border border-[#dce9e6] bg-white px-3 py-3.5 text-sm"><option value="">Tidak ingin menyebut</option><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></Field><Field label="Pendidikan terakhir" hint="Membantu membandingkan kelompok"><select value={form.education ?? ''} onChange={(event) => setForm({ ...form, education: event.target.value as UserProfile['education'] })} className="w-full rounded-2xl border border-[#dce9e6] bg-white px-3 py-3.5 text-sm"><option value="">Boleh dilewati</option><option value="sd">SD</option><option value="smp">SMP</option><option value="sma">SMA</option><option value="diploma">Diploma</option><option value="sarjana">Sarjana</option><option value="pascasarjana">Pascasarjana</option></select></Field></div>
        <div className="grid gap-3 sm:grid-cols-2"><Field label="Status pernikahan" hint="Tidak wajib"><select value={form.maritalStatus ?? ''} onChange={(event) => setForm({ ...form, maritalStatus: event.target.value as UserProfile['maritalStatus'] })} className="w-full rounded-2xl border border-[#dce9e6] bg-white px-3 py-3.5 text-sm"><option value="">Boleh dilewati</option><option value="single">Belum menikah</option><option value="married">Menikah</option><option value="divorced_widowed">Cerai/Janda/Duda</option></select></Field><Field label="Jumlah tanggungan" hint="Anak atau orang yang ditanggung"><input type="number" min={0} value={form.dependents ?? ''} onChange={(event) => setForm({ ...form, dependents: Number(event.target.value) })} placeholder="0" className="w-full rounded-2xl border border-[#dce9e6] px-4 py-3.5 text-sm" /></Field></div>
        <div className="grid gap-3 sm:grid-cols-2"><Field label="Tempat tinggal" hint="Perkotaan atau pedesaan"><select value={form.urbanRural ?? ''} onChange={(event) => setForm({ ...form, urbanRural: event.target.value as UserProfile['urbanRural'] })} className="w-full rounded-2xl border border-[#dce9e6] bg-white px-3 py-3.5 text-sm"><option value="">Boleh dilewati</option><option value="urban">Perkotaan</option><option value="rural">Pedesaan</option></select></Field><Field label="Provinsi" hint="Tidak perlu alamat lengkap"><select value={form.provinceCode ?? ''} onChange={(event) => setForm({ ...form, provinceCode: event.target.value })} className="w-full rounded-2xl border border-[#dce9e6] bg-white px-3 py-3.5 text-sm"><option value="">Boleh dilewati</option>{provinces.map((province) => <option key={province}>{province}</option>)}</select></Field></div>
        <div className="space-y-2"><label className="text-sm font-extrabold text-[#314b56]">Kondisi pekerjaan saat ini</label><select value={form.employmentStatus ?? ''} onChange={(event) => setForm({ ...form, employmentStatus: event.target.value as UserProfile['employmentStatus'] })} className="w-full rounded-2xl border border-[#dce9e6] bg-white px-4 py-3.5 text-sm"><option value="">Boleh dilewati</option><option value="employee">Karyawan</option><option value="self_employed">Wirausaha</option><option value="unemployed">Belum bekerja</option><option value="student">Pelajar atau mahasiswa</option><option value="homemaker">Ibu/bapak rumah tangga</option></select></div>
        <div className="grid gap-3 sm:grid-cols-2"><Field label="Kisaran penghasilan" hint="Relatif, bukan angka pasti"><select value={form.incomeBracket ?? ''} onChange={(event) => setForm({ ...form, incomeBracket: Number(event.target.value) as UserProfile['incomeBracket'] })} className="w-full rounded-2xl border border-[#dce9e6] bg-white px-3 py-3.5 text-sm"><option value="">Boleh dilewati</option>{[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value} dari 6</option>)}</select></Field><Field label="Tabungan untuk darurat" hint="Berapa bulan bisa bertahan?"><input type="number" min={0} value={form.emergencySavingsMonths ?? ''} onChange={(event) => setForm({ ...form, emergencySavingsMonths: Number(event.target.value) })} placeholder="mis. 4 bulan" className="w-full rounded-2xl border border-[#dce9e6] px-4 py-3.5 text-sm" /></Field></div>
        <PrimaryButton onClick={save}>{saved ? <><Check size={16} className="mr-1 inline" />Tersimpan di perangkat</> : 'Simpan perubahan'}</PrimaryButton>
        <div className="h-px bg-[#e5efed]" />
        <div>
          <p className="text-sm font-extrabold text-[#314b56]">Pengaturan AI & LLM (Opsional)</p>
          <p className="mt-1 text-xs leading-5 text-[#71868a]">Kelola kunci provider, batas harian, dan privasi AI.</p>
          <a href="/pengaturan" className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-[#dce9e6] bg-[#f8fbfa] px-4 py-3 text-sm font-extrabold text-[#087f8c] transition hover:bg-[#e0f2f1]">
            Buka Pengaturan AI
          </a>
        </div>
        <div className="h-px bg-[#e5efed]" />
        <div>
          <p className="text-sm font-extrabold text-[#314b56]">Pusat Hak Privasi & UU PDP</p>
          <p className="mt-1 text-xs leading-5 text-[#71868a]">Unduh salinan data pribadi format JSON atau pelajari jaminan pelindungan data.</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <a href="/privasi" className="inline-flex items-center gap-2 rounded-2xl border border-[#dce9e6] bg-white px-4 py-3 text-xs font-extrabold text-[#087f8c] transition hover:bg-[#e0f2f1]">
              Pusat Hak Privasi UU PDP
            </a>
            <a href="/krisis" className="inline-flex items-center gap-2 rounded-2xl border border-[#fad4c5] bg-[#fff5f2] px-4 py-3 text-xs font-extrabold text-[#b64d32] transition hover:bg-[#ffece6]">
              Layanan Darurat & Krisis
            </a>
          </div>
        </div>
        <div className="h-px bg-[#e5efed]" />
        <div><p className="text-sm font-extrabold text-[#314b56]">Data & privasi</p><p className="mt-1 text-xs leading-5 text-[#71868a]">Riwayat hanya tersimpan di perangkat ini. Tidak ada akun yang dibuat untuk MVP.</p><button onClick={async () => { if (window.confirm('Hapus semua data di perangkat ini?')) { await clearAllData(); window.location.reload() } }} className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-[#f1c7b8] bg-[#fff3ee] px-4 py-3 text-sm font-extrabold text-[#b64d32]"><Trash2 size={16} />Hapus semua data</button></div>
      </Card>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="space-y-2"><span className="block text-sm font-extrabold text-[#314b56]">{label}</span>{children}{hint && <span className="block text-xs leading-5 text-[#71868a]">{hint}</span>}</label>
}
