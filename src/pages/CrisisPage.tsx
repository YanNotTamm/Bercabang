import { motion } from 'framer-motion'
import { PhoneCall, ShieldAlert, Heart, ArrowLeft, LifeBuoy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, Eyebrow } from '../components/ui'

const CRISIS_CONTACTS = [
  {
    name: 'Layanan Sejiwa (Kemenkes RI)',
    desc: 'Layanan konseling darurat kesehatan jiwa resmi dari Kementerian Kesehatan RI. Gratis / Bebas Pulsa dari telepon rumah maupun ponsel.',
    number: '119 Ext 8',
    tel: 'tel:119,8',
    badge: 'Bebas Pulsa 24 Jam',
    theme: 'bg-[#fde9e3] text-[#b64d32] border-[#fad4c5]',
    btnColor: 'bg-[#b64d32]',
  },
  {
    name: 'Panggilan Darurat Nasional Indonesia',
    desc: 'Nomor tunggal panggilan darurat terpadu (medis, ambulans, keamanan) di seluruh Indonesia.',
    number: '112',
    tel: 'tel:112',
    badge: 'Bebas Pulsa',
    theme: 'bg-[#e0f2f1] text-[#087f8c] border-[#b9e3df]',
    btnColor: 'bg-[#087f8c]',
  },
  {
    name: 'Hotline LISA (Love Inside Suicide Awareness)',
    desc: 'Layanan pendampingan dan pencegahan bunuh diri 24 jam dalam Bahasa Indonesia dan Bahasa Inggris.',
    number: '0811-3815-472',
    tel: 'tel:08113815472',
    badge: 'Hotline 24 Jam',
    theme: 'bg-[#f4f7f6] text-[#172b3a] border-[#dce9e6]',
    btnColor: 'bg-[#172b3a]',
  },
  {
    name: 'Yayasan Pulih',
    desc: 'Lembaga nirlaba yang berfokus pada pemulihan trauma psikologis dan kesehatan mental masyarakat.',
    number: '0811-8436-633',
    tel: 'tel:08118436633',
    badge: 'Konseling WhatsApp',
    theme: 'bg-[#f8fbfa] text-[#2e5349] border-[#cde6dd]',
    btnColor: 'bg-[#236952]',
  },
]

export default function CrisisPage() {
  const nav = useNavigate()

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
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-[#fde9e3] text-[#b64d32]">
            <ShieldAlert size={16} />
          </span>
          <Eyebrow>Bantuan & Keselamatan</Eyebrow>
        </div>
        <h1 className="text-balance text-[28px] font-extrabold leading-tight text-[#172b3a]">
          Kamu tidak harus menghadapinya sendiri.
        </h1>
        <p className="text-pretty text-sm leading-6 text-[#617383]">
          Jika kamu atau orang di sekitarmu sedang berada dalam tekanan batin yang berat atau krisis emosional, bantuan profesional selalu tersedia.
        </p>
      </div>

      <div className="space-y-3">
        {CRISIS_CONTACTS.map((item) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-4.5 space-y-3 bg-white shadow-sm ${item.theme}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5">
                  {item.badge}
                </span>
                <h2 className="mt-1.5 text-base font-extrabold text-[#172b3a]">{item.name}</h2>
              </div>
              <a
                href={item.tel}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:opacity-90 ${item.btnColor}`}
              >
                <PhoneCall size={14} /> Panggil {item.number}
              </a>
            </div>
            <p className="text-xs leading-5 text-[#536c72]">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Grounding Protocol */}
      <Card className="border border-[#cde6dd] bg-[#f4faf8] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Heart size={18} className="text-[#087f8c]" />
          <h2 className="text-sm font-extrabold text-[#172b3a]">
            Jeda Sejenak: Teknik Grounding 5-4-3-2-1
          </h2>
        </div>
        <p className="text-xs leading-5 text-[#536c72]">
          Ketika pikiran terasa sangat penuh atau panik, coba tarik napas perlahan dan fokuskan panca inderamu ke sekeliling:
        </p>
        <ul className="space-y-1.5 text-xs text-[#3b575e] pl-1">
          <li><b>5 hal</b> yang bisa kamu lihat saat ini di sekitarmu.</li>
          <li><b>4 hal</b> yang bisa kamu sentuh atau rasakan fisiknya.</li>
          <li><b>3 suara</b> yang bisa kamu dengar secara nyata.</li>
          <li><b>2 aroma</b> yang bisa kamu cium di udara.</li>
          <li><b>1 napas panjang</b> dan ingatkan dirimu bahwa kamu berharga dan aman sekarang.</li>
        </ul>
      </Card>

      <div className="text-center pt-2">
        <button
          onClick={() => nav('/')}
          className="inline-flex items-center gap-2 rounded-2xl border border-[#dce9e6] bg-white px-5 py-3 text-xs font-extrabold text-[#46606a] hover:bg-[#f8fbfa]"
        >
          <LifeBuoy size={15} /> Kembali ke Beranda Bercabang
        </button>
      </div>
    </div>
  )
}
