# Tinjauan Bukti Ilmiah & Metodologi (Domain Evidence Review)

**Dokumen Validasi Klaim Ilmiah & Batasan Inferensi Produk Bercabang**  
**Versi:** 1.0 (September 2026)  
**Tujuan:** Menetapkan standar peninjauan sejawat (*peer review*) multidisiplin terhadap seluruh klaim ilmiah, data referensi, dan algoritma simulasi sebelum rilis publikasi.

---

## 1. Prinsip Epistemologis & Pendekatan Kausal

Bercabang dibangun di atas satu temuan ilmiah fundamental dari riset komputasi sosial berskala besar (*Fragile Families Challenge*, Salganik et al., 2020):
> *"Model pembelajaran mesin canggih maupun model statistik kompleks memiliki batas fundamental dalam memprediksi luaran hidup manusia secara individual. Perbedaan model terbaik dengan benchmark sederhana sangat tipis."*

Oleh sebab itu, Bercabang **tidak mencoba meramal masa depan pengguna secara deterministik**. Metodologi kami menggunakan kerangka **Target Trial Emulation (TTE)** (Hernán & Robins, 2016), yaitu memodelkan skenario keputusan sebagai uji klinis hipotetis (*hypothetical trial*) yang diestimasi menggunakan data kohort longitudinal untuk memperlihatkan **rentang distribusi kemungkinan (P10–P50–P90)** pada kelompok pembanding yang relevan.

---

## 2. Register Bukti Primer & Status Telaah Ahli

| ID Bukti | Sitasi Lengkap | Domain / Ahli | Klaim yang Digunakan di Aplikasi | Tingkat Transferabilitas ke Indonesia | Status Telaah Ahli Domain |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **`salganik-2020-ffc`** | Salganik et al., *PNAS* (2020). Measuring the predictability of life outcomes. DOI: 10.1073/pnas.1915006117 | Sosiologi Komputasi & Statistik | Batas prediktabilitas hidup adalah fakta ilmiah, bukan kegagalan algoritma. Rentang hasil sengaja dibuat lebar. | **Tinggi** | **Tervalidasi Konseptual** — Dijadikan filosofi dasar tidak menampilkan angka tunggal pasti. |
| **`hernan-robins-2016`** | Hernán & Robins, *Am J Epidemiol* (2016). Using Big Data to Emulate a Target Trial When a Randomized Trial Is Not Available. | Epidemiologi & Inferensi Kausal | Keputusan hidup diframing sebagai uji acak hipotetis dengan intervensi dan waktu mulai yang terdefinisi rapi. | **Tinggi** | **Tervalidasi Metodologis** — Memandu struktur formulir pembanding (*A vs B vs Status Quo*). |
| **`hamilton-2000-jpe`** | Hamilton, *Journal of Political Economy* (2000). Does Entrepreneurship Pay? An Empirical Analysis of the Returns to Self-Employment. | Ekonomi Tenaga Kerja / Ekonometrika | Banyak wirausahawan menerima pendapatan awal lebih rendah daripada bekerja formal demi fleksibilitas dan otonomi. | **Sedang** | **Catatan Ahli:** Konteks Indonesia memiliki sektor informal yang jauh lebih besar daripada data AS 2000. Perlu kalibrasi IFLS. |
| **`chetty-hendren-katz-2016`** | Chetty, Hendren & Katz, *Am Econ Rev* (2016). The Effects of Exposure to Better Neighborhoods on Children: New Evidence from the MTO Experiment. | Ekonomi Perkotaan & Mobilitas | Efek perpindahan lingkungan paling berdampak positif jangka panjang pada anak usia dini (<13 tahun); efek pada orang dewasa lebih bergantung pada kesiapan kerja. | **Rendah – Sedang** | **Catatan Ahli:** MTO adalah konteks perumahan bersubsidi AS. Di Indonesia, modal sosial dan jaringan keluarga adalah mediator utama relokasi. |
| **`wilson-gilbert-2005`** | Wilson & Gilbert, *Curr Dir Psychol Sci* (2005). Affective Forecasting: Knowing What to Want. | Psikologi Kognitif & Perilaku | Manusia cenderung melebih-lebihkan durasi dan intensitas penyesalan/kebahagiaan (*focalism* dan *immune neglect*). Kebanyakan orang beradaptasi dalam 6–18 bulan. | **Tinggi** | **Tervalidasi Psikologis** — Digunakan pada kartu *Catatan tentang emosi* di bagian Wellbeing. |
| **`ifls-rand`** | Strauss et al. (RAND, 1993–2015). Indonesia Family Life Survey (IFLS-5). | Survei Longitudinal Indonesia | Sumber data survei panel representatif untuk tren transisi pekerjaan, konsumsi, dan pendapatan rumah tangga di Indonesia. | **Sangat Tinggi** | **Catatan Ahli:** Gelombang data terakhir IFLS-5 adalah 2014/15. Wajib mencantumkan *disclaimer* bahwa data belum mencerminkan ekonomi pasca-pandemi atau gig economy digital. |
| **`logg-2019-appreciation`** | Logg, Minson & Moore, *OBHDP* (2019). Algorithm appreciation: People prefer algorithmic to human advice. | Interaksi Manusia & AI (HCI) | Pengguna cenderung terlalu percaya pada angka yang dihasilkan komputer dibanding nalar sendiri. | **Tinggi** | **Tervalidasi Desain** — Mendasari keputusan menyembunyikan angka detail di balik tombol lipat (*progressive disclosure*). |
| **`bucinca-2021-forcing`** | Buçinca et al. (2021). To Trust or to Think: Cognitive Forcing Functions Can Reduce Overreliance on AI in AI-assisted Decision-making. | Cognitive Ergonomics & UX | Mengharuskan pengguna menuliskan ekspektasi dan nilai pribadi *sebelum* melihat hasil simulasi dapat memutus ketergantungan buta pada sistem. | **Tinggi** | **Tervalidasi Desain** — Diimplementasikan sebagai langkah wajib di `/forcing` sebelum membuka `/hasil`. |

---

## 3. Batasan Inferensi Statistik Saat Ini

1. **Model Deterministik Klien (Client-Side Engine v0.9):**
   - Mesin saat ini menggunakan generator pseudo-acak deterministik (`mulberry32`) yang diikatkan pada benih skenario dan profil pengguna untuk menjamin reproduktibilitas tanpa memerlukan peladen analitik.
   - Variansi rentang (P10, P50, P90) diturunkan dari parameter empiris makro IFLS per sektor dan wilayah.
2. **Keterbatasan Data Temporal:**
   - Referensi IFLS-5 berasal dari tahun 2014/2015. Transformasi digital, inflasi regional terkini, dan dinamika platform digital di Indonesia belum terakomodasi secara dinamis.
3. **Peta Jalan Inferensi Produksi:**
   - Integrasi model mikrosimulasi tertimbang (*weighted propensity score matching*) dan interval konfidensi terkalibrasi melalui modul server resmi sebelum deklarasi status komersial/klinis.
