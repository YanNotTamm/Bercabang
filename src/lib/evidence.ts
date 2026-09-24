export type EvidenceItem = {
  id: string
  citation: string
  doi?: string
  year: number
  domain: string
  designType: string
  country: string
  claim: string
  limitations: string[]
  transferabilityToID: 'low'|'medium'|'high'
}

export const EVIDENCE: EvidenceItem[] = [
  { id:'salganik-2020-ffc', citation:'Salganik et al., PNAS 2020 — Fragile Families Challenge', doi:'10.1073/pnas.1915006117', year:2020, domain:'method', designType:'review', country:'AS', claim:'Prediksi luaran hidup sangat terbatas — model terbaik hanya sedikit lebih baik dari benchmark sederhana.', limitations:['Batas prediktabilitas bukan kegagalan teknik'], transferabilityToID:'medium' },
  { id:'hernan-robins-2016', citation:'Hernán & Robins, Am J Epidemiol 2016 — Target Trial Emulation', year:2016, domain:'method', designType:'method', country:'AS', claim:'Pertanyaan kausal harus diframing sebagai uji acak hipotetis lalu ditiru dengan data observasional.', limitations:['Perbaikan desain, bukan sihir data'], transferabilityToID:'high' },
  { id:'hamilton-2000-jpe', citation:'Hamilton, J Polit Econ 2000 — Does entrepreneurship pay?', year:2000, domain:'career', designType:'cohort', country:'AS', claim:'Banyak wirausaha bertahan meski pendapatan awal lebih rendah; manfaat non-finansial signifikan.', limitations:['Underreporting pendapatan wirausaha'], transferabilityToID:'low' },
  { id:'chetty-hendren-katz-2016', citation:'Chetty, Hendren & Katz, AER 2016 — MTO exposure effects', year:2016, domain:'relocate', designType:'RCT', country:'AS', claim:'Efek pindah sangat bergantung usia: positif kuat untuk anak <13 tahun, tidak ada efek paparan dewasa.', limitations:['Konteks perumahan bersubsidi AS'], transferabilityToID:'low' },
  { id:'wilson-gilbert-2005', citation:'Wilson & Gilbert, Curr Dir Psychol Sci 2005 — Affective forecasting', year:2005, domain:'wellbeing', designType:'review', country:'AS', claim:'Orang akurat soal valence emosi, tetapi melebih-lebihkan intensitas & durasi (focalism, immune neglect).', limitations:['Perdebatan pengukuran intensitas'], transferabilityToID:'medium' },
  { id:'ifls-rand', citation:'RAND — Indonesia Family Life Survey (IFLS) 1993–2015', year:2015, domain:'data', designType:'cohort', country:'ID', claim:'Sumber longitudinal representatif 83% populasi — dasar estimasi untuk konteks Indonesia.', limitations:['Gelombang terakhir 2014/15 — sudah >10 tahun', 'Hanya 13 provinsi'], transferabilityToID:'high' },
  { id:'logg-2019-appreciation', citation:'Logg, Minson & Moore, OBHDP 2019 — Algorithm appreciation', year:2019, domain:'ux', designType:'experiment', country:'AS', claim:'Orang cenderung lebih patuh pada saran algoritma dibanding saran manusia.', limitations:['Konteks lab, tidak semua domain'], transferabilityToID:'medium' },
  { id:'bucinca-2021-forcing', citation:'Buçinca et al. 2021 — Cognitive forcing functions', year:2021, domain:'ux', designType:'experiment', country:'AS', claim:'Forcing function (menulis prediksi dulu) mengurangi overreliance pada AI.', limitations:['Efek moderat, tergantung desain'], transferabilityToID:'medium' },
]
