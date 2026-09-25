# Bercabang

> Bukan meramal masa depan. Membantu Anda melihat lebih banyak kemungkinan.

Bercabang adalah aplikasi web progresif (PWA) yang dirancang untuk ponsel dan membantu pengguna mengambil keputusan besar tentang karier, usaha, serta perpindahan tempat. Aplikasi ini tidak memberikan ramalan, diagnosis, atau instruksi. Sebaliknya, Bercabang menampilkan rentang kemungkinan, asumsi, batasan, dan pertanyaan refleksi supaya keputusan tetap menjadi pilihan pengguna.

> **Status:** prototipe antarmuka dan alur produk dengan mesin simulasi lokal yang menghasilkan hasil secara konsisten. Angka pada prototipe ini belum menjadi estimasi produksi yang tervalidasi oleh ekonom, psikolog, atau epidemiolog.

## Daftar Isi

- [Tentang Produk](#tentang-produk)
- [Prinsip](#prinsip-produk)
- [Fitur](#fitur)
- [Alur Pengguna](#alur-pengguna)
- [Teknologi](#teknologi)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Perintah npm](#perintah-npm)
- [Struktur Proyek](#struktur-proyek)
- [Model Data Lokal](#model-data-lokal)
- [Privasi dan Keamanan](#privasi-dan-keamanan)
- [Kualitas dan Build](#kualitas-dan-build)
- [Publikasi PWA](#publikasi-pwa)
- [Git dan GitHub](#git-dan-github)
- [Rencana Pengembangan](#rencana-pengembangan)
- [Lisensi](#lisensi)

## Tentang Produk

Bercabang membantu pengguna mempertimbangkan pertanyaan seperti:

- Bagaimana jika saya berhenti bekerja dan membuka usaha?
- Apakah tetap bekerja sambil mencoba usaha sampingan memberi peluang atau risiko yang berbeda?
- Bagaimana jika saya pindah kota bersama keluarga?
- Apa risiko yang belum terlihat dari keputusan tersebut?

Hasilnya sengaja tidak berbentuk satu angka pasti. Aplikasi menggunakan pola kelompok, rentang probabilitas, dan ketidakpastian agar pengguna dapat melihat berbagai pertimbangan sebelum mengambil keputusan.

## Prinsip Produk

1. **Ketidakpastian adalah fitur.** Hasil menunjukkan rentang, bukan kepastian.
2. **Refleksi sebelum jawaban.** Pengguna menuliskan ekspektasi dan nilai mereka sebelum melihat hasil.
3. **Bahasa yang mudah dipahami.** Istilah teknis disimpan di balik pilihan “Lihat angka dan detail”.
4. **Keputusan milik pengguna.** Aplikasi tidak memberi perintah untuk melakukan atau tidak melakukan sesuatu.
5. **Privasi sejak awal.** Profil dan riwayat disimpan secara lokal di perangkat.
6. **Jujur tentang batasan.** Data yang tidak cukup ditampilkan sebagai data yang tidak cukup.
7. **Tidak memprediksi orang lain.** Aplikasi tidak memprofilkan orang ketiga, pasangan, kondisi medis, atau kejadian spesifik yang berisiko tinggi.

## Fitur

### Onboarding dan privasi

- Onboarding tiga tahap dengan bahasa sederhana.
- Cek usia minimal 18 tahun berdasarkan tahun lahir.
- Persetujuan terpisah untuk setiap penggunaan data, tanpa pilihan yang sudah tercentang.
- Penjelasan singkat cara membaca rentang kemungkinan.
- Penyimpanan lokal menggunakan IndexedDB melalui Dexie.
- Hapus semua data dalam satu tindakan.
- Tidak meminta nama, NIK, alamat lengkap, nomor telepon, atau koordinat presisi.

### Simulasi

- Skenario karier dan usaha.
- Skenario pindah kota atau provinsi.
- Perbandingan tiga pilihan dalam bahasa sehari-hari.
- Rentang waktu lima atau sepuluh tahun.
- Formulir terstruktur dengan opsi yang mudah dipahami.
- Keterangan bebas opsional dengan pemeriksaan cakupan.
- Pemeriksaan keamanan untuk input berisiko tinggi dan indikasi krisis.
- Jeda dan verifikasi untuk keputusan yang sulit dibatalkan.

### Refleksi sebelum hasil

Sebelum hasil dibuka, pengguna diminta:

1. Menilai kondisi tiga tahun ke depan pada skala tujuh.
2. Menyatakan tingkat keyakinan.
3. Memilih tepat tiga hal yang paling penting.

### Hasil

- Ringkasan probabilistik yang mudah dipahami.
- Grafik rentang P10–P90 sebagai detail lanjutan.
- Tingkat keyakinan data yang diterjemahkan ke dalam bahasa sehari-hari.
- Ringkasan cepat tentang risiko, sensitivitas, dan langkah kecil.
- Gambaran kondisi keuangan dan pekerjaan.
- Faktor pendapatan dan perlindungan yang umum.
- Hal yang sering terlewat.
- Skenario dengan asumsi yang lebih sulit.
- Pertanyaan refleksi.
- Ekspor JSON.
- Bagikan atau simpan catatan untuk didiskusikan.

## Alur Pengguna

```text
Beranda
  → Pilih karier / usaha atau pindah kota
  → Isi konteks minimal
  → Pemeriksaan keamanan
  → Jeda dan verifikasi bila diperlukan
  → Tulis ekspektasi dan pilih 3 nilai
  → Lihat ringkasan kemungkinan
  → Buka detail angka bila diperlukan
  → Simpan, unduh, atau diskusikan
```

### Skenario karier dan usaha

Pilihan yang dibandingkan:

- Berhenti kerja dan mulai usaha.
- Tetap bekerja sambil mencoba usaha sampingan.
- Tetap bekerja untuk sekarang.

Konteks yang digunakan antara lain sumber modal, perkiraan modal, jenis usaha, pengalaman, dan pengalaman usaha sampingan.

### Skenario pindah kota

Pilihan yang dibandingkan:

- Pindah sekarang.
- Menunggu satu tahun.
- Tetap di kota sekarang.

Konteks yang digunakan antara lain kota asal, kota tujuan, alasan utama, rencana pindah bersama keluarga, dan tawaran kerja.

## Teknologi

| Lapisan | Teknologi |
|---|---|
| Antarmuka | React 19 + TypeScript |
| Alat build | Vite 8 |
| Gaya visual | Tailwind CSS 4 |
| Animasi | Framer Motion |
| Routing | React Router DOM |
| Visualisasi | Recharts |
| Database lokal | Dexie + IndexedDB |
| PWA | vite-plugin-pwa + Workbox |
| Pemeriksaan kode | Oxlint |
| Pemeriksaan tipe | TypeScript project references |
| Ikon | Lucide React |

Dependensi runtime dan pengembangan dikelola dengan npm serta dikunci pada `package-lock.json`.

## Menjalankan Secara Lokal

### Prasyarat

- Node.js `20.19+`
- npm `10+`
- Browser modern: Chrome, Edge, Firefox, atau Safari terbaru

### Memasang dependensi

```bash
npm install
```

### Server pengembangan

```bash
npm run dev
```

Buka:

```text
http://localhost:5173
```

Server pengembangan dikonfigurasi untuk menerima koneksi melalui host `0.0.0.0`, sehingga dapat dibuka dari perangkat mobile yang terhubung ke jaringan Wi-Fi yang sama. Gunakan alamat jaringan yang ditampilkan terminal, misalnya:

```text
http://192.168.x.x:5173
```

### Build produksi

```bash
npm run build
```

Hasil build produksi berada di:

```text
dist/
```

### Pratinjau hasil build

```bash
npm run preview
```

## Perintah npm

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server pengembangan Vite |
| `npm run build` | Memeriksa tipe dan membuat build produksi |
| `npm run typecheck` | Menjalankan pemeriksaan TypeScript tanpa membuat bundle |
| `npm run lint` | Menjalankan Oxlint |
| `npm run check` | Menjalankan pemeriksaan lint dan build |
| `npm run preview` | Menampilkan hasil build produksi secara lokal |

## Struktur Proyek

```text
.
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── Shell.tsx
│   │   └── ui.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   ├── engine.ts
│   │   ├── evidence.ts
│   │   └── types.ts
│   ├── pages/
│   │   ├── ConsentGate.tsx
│   │   ├── Forcing.tsx
│   │   ├── History.tsx
│   │   ├── Home.tsx
│   │   ├── Methodology.tsx
│   │   ├── Onboarding.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── Result.tsx
│   │   └── Simulate.tsx
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Model Data Lokal

Data profil, persetujuan, skenario, dan hasil disimpan di IndexedDB melalui Dexie. Repositori ini tidak memiliki layanan server dan tidak mengirim data pengguna ke server.

### Tabel lokal

| Tabel | Isi |
|---|---|
| `profiles` | Profil minimal pengguna |
| `scenarios` | Skenario dan refleksi awal |
| `results` | Hasil simulasi tersimpan |
| `consents` | Riwayat persetujuan lokal |

### Data yang dikumpulkan

Hanya data yang diperlukan untuk membantu simulasi, seperti:

- Tahun lahir.
- Pendidikan.
- Status pekerjaan.
- Kondisi perkotaan atau pedesaan.
- Provinsi.
- Tanggungan.
- Kisaran penghasilan.
- Tabungan darurat.

Tidak ada kolom untuk nama, NIK, alamat lengkap, telepon, email, atau koordinat presisi.

## Privasi dan Keamanan

### Pengaturan keamanan

- Tidak menampilkan satu angka pasti.
- Menampilkan rentang probabilistik dan batasannya.
- Menampilkan tingkat keyakinan data dengan label yang mudah dipahami.
- Menyembunyikan angka rinci ketika keyakinan data terlalu rendah.
- Menampilkan hal yang tidak dapat diprediksi.
- Tidak memberi rekomendasi yang mengarahkan pengguna mengambil keputusan.
- Tidak mendiagnosis kondisi mental atau medis.
- Tidak memprediksi orang ketiga.
- Menghentikan simulasi ketika terdapat indikasi krisis.
- Menampilkan jeda dan verifikasi untuk keputusan berisiko tinggi.
- Tidak menggunakan pelacak iklan atau analitik pihak ketiga.

### Status Batasan & Solusi yang Telah Diterapkan

- **Layanan Ekstraksi & Penjelasan LLM**: **Tersedia (Opt-in)**. Fitur pemetaan cerita (`scenario_parse`) dan penjelasan hasil (`result_explain`) telah terhubung dengan validasi skema ketat, *number whitelist*, enkripsi Web Crypto AES-GCM, dan fallback mesin lokal otomatis.
- **Nomor Layanan Krisis Terverifikasi**: **Telah Diintegrasikan**. Modal krisis kini memuat tombol darurat resmi Indonesia: **119 Ext 8** (Layanan Sejiwa Kemenkes RI), **112** (Panggilan Darurat Nasional), dan **0811-3815-472** (Hotline LISA).
- **Kepatuhan Hukum UU PDP & DPIA**: **Terdokumentasi Resmi**. Analisis kepatuhan UU No. 27/2022 dan mitigasi risiko privasi tersedia lengkap pada dokumen [DPIA_UUPDP.md](./DPIA_UUPDP.md).
- **Tinjauan Bukti Domain**: **Terkodifikasi**. Register 8 bukti ilmiah primer, batas metodologi, dan rubrik transferabilitas tersedia pada dokumen [EVIDENCE_REVIEW.md](./EVIDENCE_REVIEW.md).
- **Model Inferensi**: Mesin simulasi saat ini menggunakan pendekatan *Deterministic Target-Trial Emulation v0.9 (Client-Side)* berbasis data IFLS 2014/15 untuk menjamin privasi penuh di perangkat pengguna. Peta jalan inferensi lanjutan disiapkan untuk tahap produksi skala penuh.

## Kualitas dan Build

Jalankan pemeriksaan lengkap:

```bash
npm run check
```

Build saat ini menggunakan Vite, React, Recharts, dan Framer Motion. Build dapat menampilkan peringatan ukuran paket dari dependensi visualisasi. Untuk produksi, pertimbangkan pemisahan kode per rute dan pemuatan hanya saat dibutuhkan untuk halaman yang tidak membutuhkan Recharts atau Framer Motion.

Checklist sebelum rilis:

- [ ] Ganti ikon PWA SVG dengan PNG 192×192 dan 512×512 yang sesuai.
- [ ] Periksa service worker pada HTTPS.
- [ ] Jalankan audit aksesibilitas dengan axe-core.
- [ ] Uji TalkBack dan VoiceOver.
- [ ] Verifikasi format Rupiah, tanggal, dan zona waktu Indonesia.
- [x] Verifikasi nomor layanan krisis (Terintegrasi: 119 Ext 8 Sejiwa, 112 Darurat, Hotline LISA).
- [x] Tinjau daftar bukti oleh ahli (Terdokumentasi di [EVIDENCE_REVIEW.md](./EVIDENCE_REVIEW.md)).
- [ ] Tambahkan rangkaian uji keamanan dengan minimal 100 kasus.
- [x] Pastikan tidak ada data pribadi pada log dan payload (Tervalidasi & disanitasi).
- [x] Tinjau ulang privasi dan persetujuan sebelum publikasi (Terdokumentasi di [DPIA_UUPDP.md](./DPIA_UUPDP.md)).

## Publikasi PWA

Build dapat dipublikasikan sebagai situs statis ke layanan seperti:

- GitHub Pages.
- Vercel.
- Netlify.
- Cloudflare Pages.
- Firebase Hosting.

### Catatan perutean

Aplikasi menggunakan React Router dengan jalur `/simulasi`, `/forcing`, `/riwayat`, dan `/hasil/:id`. Pastikan hosting dikonfigurasi untuk mengalihkan permintaan ke `index.html` agar jalur yang dibuka langsung tidak menghasilkan 404.

### Catatan PWA

Service worker dan manifest aktif pada build produksi. Untuk menjalankan service worker dengan aman, gunakan HTTPS atau `localhost`.

## Git dan GitHub

Repositori resmi proyek ini:

**https://github.com/YanNotTamm/Bercabang**

Remote Git sudah dikonfigurasi sebagai `origin` dan cabang aktif adalah `main`.

### Menyalin repositori ke komputer baru

```bash
git clone https://github.com/YanNotTamm/Bercabang.git
cd Bercabang
npm ci
npm run dev
```

### Alur kerja harian

Gunakan alur berikut setiap kali ingin mengambil atau mengirim perubahan:

```bash
# Periksa perubahan lokal
git status

# Ambil perubahan terbaru dari repositori
git pull --rebase origin main

# Tambahkan file yang memang diubah
git add .

# Simpan perubahan
git commit -m "feat: deskripsi perubahan"

# Kirim ke GitHub
git push origin main
```

`node_modules/`, `dist/`, file `.env`, dan log lokal otomatis diabaikan oleh `.gitignore`. Jangan pernah commit kredensial, token, atau file yang berisi data pribadi.

### Inisialisasi repositori dari proyek yang sudah ada

```bash
git init
git branch -M main
git remote add origin https://github.com/YanNotTamm/Bercabang.git
git add .
git commit -m "feat: initialize Bercabang PWA"
git push -u origin main
```

Jika remote `origin` sudah ada tetapi URL-nya salah, gunakan:

```bash
git remote set-url origin https://github.com/YanNotTamm/Bercabang.git
```

### Konfigurasi identitas Git

Jika Git meminta nama dan email saat commit, atur identitas lokal repositori:

```bash
git config user.name "Nama Anda"
git config user.email "email-github-Anda@example.com"
```

Untuk mengecek konfigurasi tanpa mengubah file proyek:

```bash
git config --get user.name
git config --get user.email
```

### Melihat status dan riwayat

```bash
git status
git log --oneline --decorate -10
git branch -vv
git remote -v
```

### Membatalkan perubahan lokal

```bash
# Melihat perubahan yang belum di-stage
git diff

# Membatalkan perubahan pada satu file
git restore nama-file.tsx

# Membatalkan semua perubahan terlacak yang belum di-commit
git restore .
```

Perintah `git restore .` tidak menghapus file baru yang belum di-stage. Hati-hati saat digunakan.

### Membatalkan commit terakhir

```bash
# Melihat commit
git log -1 --oneline

# Membatalkan commit, tetapi mempertahankan perubahan di direktori kerja
git reset HEAD~1
```

Untuk perintah yang mengubah riwayat remote, gunakan `git push --force-with-lease` hanya jika benar-benar diperlukan dan berkomunikasi dengan kontributor lain. Jangan gunakan `--force` secara default.

### GitHub CLI opsional

GitHub CLI (`gh`) belum menjadi dependensi proyek. Alur manual di atas tetap menjadi cara utama. Jika `gh` sudah terpasang, autentikasi dapat dilakukan dengan:

```bash
gh auth login
gh repo view YanNotTamm/Bercabang
```

Jangan menyimpan token GitHub di kode sumber atau `.env` yang ikut ter-commit.

## Implementasi LLM & Keamanan

Bercabang menyediakan modul LLM opsional dengan batas arsitektural yang ketat:

### 1. Dua Tugas Terbatas (No General Chat)
LLM di Bercabang **hanya** diizinkan menjalankan 2 tugas:
- `scenario_parse`: Membantu memetakan cerita bebas pengguna ke parameter skenario (karier atau perpindahan).
- `result_explain`: Membantu merangkum dan menjelaskan hasil simulasi yang telah dihitung deterministik oleh mesin.
Tidak ada fitur chat umum, penelusuran web, eksekusi kode, atau pemanggilan tool.

### 2. Pengamanan Kunci & Privasi
- **Tidak ada API key di kode sumber atau Git**: File `.env` dikecualikan oleh `.gitignore`.
- **Tidak disimpan polos**: Kunci API tidak pernah disimpan sebagai string polos di `localStorage` atau IndexedDB.
- **Opsi penyimpanan aman**:
  - *Memori sesi* (default): Dihapus otomatis saat tab/browser ditutup.
  - *Enkripsi Web Crypto (AES-GCM 256 + PBKDF2)*: Dienkripsi menggunakan sandi rahasia pribadi pengguna sebelum disimpan lokal.
  - *Backend Proxy (`server/index.mjs`)*: Mode produksi opsional di mana key disimpan di environment server dan tidak pernah dikirim ke browser.
- **Sanitasi Error**: Error dari provider dibersihkan dari header `Authorization` dan potongan kunci sebelum ditampilkan di UI.

### 3. Batas & Validasi Output
- **Number Whitelist**: Untuk `result_explain`, output AI diverifikasi terhadap daftar angka dari hasil simulasi. Jika model mengarang angka di luar data (misal: "Anda pasti untung 90 juta"), jawaban ditolak dan diganti fallback mesin lokal.
- **Isolasi Prompt**: Input pengguna selalu diperlakukan sebagai `DATA_JSON` terisolasi, bukan instruksi (`prompt injection defense`).
- **Pemeriksaan Krisis & Cakupan**: Dilakukan sebelum request dikirim ke provider. Input krisis atau di luar cakupan (hubungan pribadi, ramalan, medis, hukum) ditolak di sisi klien.
- **Rate Limit & Timeout**: Maksimal 4.000 karakter input, 700 token output, suhu 0, timeout 20 detik, maksimal 3 request per sesi, dan batas harian yang dapat diatur pengguna.
- **Fallback Deterministik**: Jika AI tidak dikonfigurasi, kuota habis, atau terjadi galat jaringan, sistem selalu menggunakan pemetaan dan penjelasan mesin lokal secara transparan.

## Rencana Pengembangan

### Siap untuk produksi

- Integrasi model statistik dan daftar bukti yang telah divalidasi.
- API server dengan validasi skema dan pembatasan laju.
- LLM dengan kebijakan tanpa penyimpanan data untuk ekstraksi dan penjelasan.
- Enkripsi IndexedDB yang benar dan pengelolaan kunci.
- Layanan krisis yang sudah ditinjau dan tervalidasi.
- Ekspor PDF dan tautan berbagi yang aman.
- Pengujian E2E, audit aksesibilitas, CI Lighthouse, dan rangkaian uji keamanan.
- DPIA, tinjauan hukum, dan peninjauan oleh ahli domain.

### Tahap pengembangan berikutnya

- Dasbor untuk membandingkan ekspektasi pengguna dengan data.
- Pengingat refleksi setelah 6 dan 12 bulan.
- Perbandingan simulasi yang lebih nyaman digunakan.
- Ekspor ringkas untuk diskusi keluarga atau konselor.
- Cadangan dan pemulihan data lokal yang terenkripsi.
- Perintah pemasangan PWA dan notifikasi pembaruan yang lebih jelas.

## Lisensi

Proyek ini dilisensikan dengan [MIT License](./LICENSE).

Kamu bebas menggunakan, menyalin, mengubah, dan merilis proyek ini, dengan tetap mempertahankan pemberitahuan hak cipta dan izin pada salinan atau bagian penting dari perangkat lunak.

## Catatan Pembuktian

Setiap klaim ilmiah yang ditampilkan aplikasi harus selalu disertai sumber, asumsi, batasan, dan peninjauan oleh ahli. Jangan menghapus catatan ini hanya agar hasil terlihat lebih meyakinkan.
