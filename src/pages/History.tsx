import { useEffect, useState } from 'react'
import { ArrowRight, Clock3, FolderHeart, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, Eyebrow, GradeBadge } from '../components/ui'
import { clearAllData, db } from '../lib/db'
import type { SimulationResult } from '../lib/types'

export default function History() {
  const nav = useNavigate()
  const [items, setItems] = useState<SimulationResult[]>([])
  useEffect(() => { void db.results.reverse().toArray().then(setItems) }, [])

  return (
    <div className="space-y-5">
      <div className="space-y-2"><Eyebrow>Simpananmu</Eyebrow><h1 className="text-balance text-[30px] font-extrabold leading-tight text-[#172b3a]">Catatan keputusan yang pernah kamu bahas.</h1><p className="text-pretty text-[15px] leading-7 text-[#617383]">Tersimpan hanya di perangkat ini. Buka, hapus, atau unduh kapan saja.</p></div>
      {items.length === 0 ? <Card className="space-y-4 p-8 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f2f8f6] text-[#087f8c]"><FolderHeart size={26} /></div><h2 className="text-lg font-extrabold text-[#314b56]">Belum ada catatan</h2><p className="mx-auto max-w-[17rem] text-sm leading-6 text-[#71868a]">Setelah kamu menyelesaikan satu simulasi, ringkasannya akan muncul di sini.</p><button onClick={() => nav('/simulasi')} className="inline-flex items-center gap-2 rounded-2xl bg-[#087f8c] px-5 py-3.5 text-sm font-extrabold text-white">Mulai dari keputusan <ArrowRight size={17} /></button></Card> : <div className="space-y-3">{items.map((item) => <Card key={item.id} className="space-y-3 p-5"><div className="flex items-center justify-between gap-3"><GradeBadge grade={item.overall.confidenceGrade} /><span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8aa0a0]"><Clock3 size={13} />{new Date(item.meta.generatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div><p className="text-sm font-extrabold leading-6 text-[#314b56]">{item.strategies[0]?.label}</p><p className="text-sm leading-6 text-[#71868a]">{item.overall.summarySentence}</p><div className="flex gap-2"><button onClick={() => nav(`/hasil/${item.id}`)} className="flex-1 rounded-2xl bg-[#087f8c] px-4 py-3 text-sm font-extrabold text-white">Buka catatan</button><button onClick={() => void db.results.delete(item.id).then(() => db.results.reverse().toArray().then(setItems))} className="grid h-11 w-11 place-items-center rounded-2xl border border-[#dce9e6] text-[#71868a] transition hover:border-[#f1c7b8] hover:text-[#b64d32]" aria-label="Hapus catatan"><Trash2 size={16} /></button></div></Card>)}<button onClick={async () => { if (window.confirm('Hapus semua catatan dan data di perangkat ini?')) { await clearAllData(); setItems([]) } }} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#f1c7b8] bg-[#fff3ee] px-4 py-3.5 text-sm font-extrabold text-[#b64d32]"><Trash2 size={16} />Hapus semua data</button></div>}
    </div>
  )
}
