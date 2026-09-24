# Bercabang

> Bukan meramal masa depan. Membantu Anda melihat lebih banyak kemungkinan.

Bercabang adalah Progressive Web App (PWA) mobile-first untuk membantu pengguna mengambil keputusan besar tentang karier, usaha, dan perpindahan tempat. Aplikasi ini tidak memberikan ramalan, diagnosis, atau instruksi. Aplikasi menampilkan rentang kemungkinan, asumsi, batasan, dan pertanyaan refleksi agar keputusan tetap milik pengguna.

> **Status:** frontend product prototype dengan mesin simulasi deterministik lokal. Angka pada prototype belum merupakan estimasi produksi yang tervalidasi oleh ekonom, psikolog, atau epidemiolog.

## Daftar Isi

- [Tentang Produk](#tentang-produk)
- [Prinsip](#prinsip-produk)
- [Fitur](#fitur)
- [Alur Pengguna](#alur-pengguna)
- [Stack Teknologi](#stack-teknologi)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Perintah npm](#perintah-npm)
- [Struktur Project](#struktur-project)
- [Model Data Lokal](#model-data-lokal)
- [Privacy dan Safety](#privacy-dan-safety)
- [Kualitas dan Build](#kualitas-dan-build)
- [Deploy PWA](#deploy-pwa)
- [Upload ke GitHub](#upload-ke-github)
- [Roadmap](#roadmap)
- [Referensi Produk](#referensi-produk)

## Tentang Produk

Bercabang membantu pengguna menjawab pertanyaan seperti:

- Bagaimana jika saya resign dan membuka usaha?
- Apakah tetap bekerja sambil mencoba usaha sampingan memberi Jazeera yang berbeda?
- Bagaimana jika saya pindah kota bersama keluarga?
- Apa risiko yang belum terlihat dari keputusan tersebut?

Hasilnya sengaja tidak berbentuk satu angka pasti. Aplikasi menggunakan pola kelompok, rentang probabilitas, dan ketidakpastian untuk membantu pengguna melihat trade-off.

## Prinsip Produk

1. **Ketidakpastian adalah fitur.** Hasil menunjukkan rentang, bukan kepastian.
2. **Refleksi sebelum jawaban.** Pengguna menulis ekspektasi dan nilai mereka sebelum melihat hasil.
3. **Bahasa manusiawi.** Istilah teknis berada di balik disclosure “Lihat angka & detail”.
4. **Keputusan milik pengguna.** Aplikasi tidak memberi perintah untuk melakukan atau tidak melakukan.
5. **Privasi sejak awal.** Profil dan riwayat disimpan lokal di perangkat.
6. **Jujur tentang batasan.** Data yang tidak cukup ditampilkan sebagai data yang tidak cukup.
7. **Tidak 민감한 dan tidak leverage.** Aplikasi tidak memprediksi orang ketiga, pasangan, kondisi medis, atau kejadian spesifik yang berisiko tinggi.

## Fitur

### Onboarding dan privasi

- Onboarding tiga tahap dengan bahasa sederhana.
- Age gate 18+ menggunakan tahun lahir.
- Consent granular tanpa checkbox yang sudah tercentang.
- Penjelasan singkat cara membaca rentang kemungkinan.
- Penyimpanan lokal menggunakan IndexedDB melalui Dexie.
- Hapus semua data dalam satu tindakan.
- Tidak meminta nama, NIK, alamat lengkap, nomor telepon, atau koordinat presisi.

### Simulasi

- Use case karier dan usaha.
- Use case pindah kota atau provinsi.
- Perbandingan tiga pilihan dalam bahasa sehari-hari.
- Horizon 5 atau 10 tahun.
- Form terstruktur dengan opsi yang mudah dipahami.
- Cerita bebas opsional dengan validasi cakupan.
- Safety Gate untuk input berisiko tinggi dan indikasi krisis.
- Pause & Verify untuk keputusan yang sulit dibalik.

### Forcing function

Sebelum hasil dibuka, pengguna diminta:

1. Menilai kondisi tiga tahun ke depan pada skala tujuh.
2. Men menyatakan tingkat keyakinan.
3. Memilih tepat tiga hal yang paling penting.

### Hasil

- Ringkasan probabilistik yang mudah dipahami.
- Fan chart P10–P90 sebagai detail lanjutan.
- Confidence Grade diterjemahkan menjadi label bahasa sehari-hari.
- Ringkasan cepat tentang risiko, sensitivitas, dan langkah kecil.
- Dimensi uang dan pekerjaan.
- Faktor pendapatan dan perlindungan yang umum.
- Hal yang sering terlewat.
- Skenario sulit sebagai what-if overlay.
- Pertanyaan refleksi.
- Ekspor JSON.
- Bagikan atau simpan catatan untuk didiskusikan.

## Alur Pengguna

```text
Beranda
  → Pilih karier / usaha atau pindah kota
  → Isi konteks minimal
  → Safety check
  → Pause & Verify bila diperlukan
  → Tulis ekspektasi dan pilih 3 nilai
  → Lihat ringkasan kemungkinan
  → Buka detail angka bila diperlukan
  → Simpan, unduh, atau diskusikan
```

### Skenario karier / usaha

Pilihan yang dibandingkan:

- Berhenti kerja dan mulai usaha.
- Tetap kerja, mencoba usaha sampingan.
- Tetap kerja dulu.

Konteks yang digunakan antara lain sumber modal, perkiraan modal, jenis usaha, pengalaman, dan pengalaman usaha sampingan.

### Skenario pindah kota

Pilihan yang dibandingkan:

- Pindah sekarang.
- Tunggu satu tahun.
- Tetap di kota sekarang.

Konteks yang digunakan antara lain kota asal, kota tujuan, alasan utama,Moves bersama keluarga, dan tawaran kerja.

## Stack Teknologi

| Lapisan | Teknologi |
|---|---|
| Frontend | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Routing | React Router DOM |
| Visualisasi | Recharts |
| Local database | Dexie + IndexedDB |
| PWA | vite-plugin-pwa + Workbox |
| Lint | Oxlint |
| Type check | TypeScript project references |
| Icons | Lucide React |

Dependency runtime dan development dikelola dengan npm serta dikunci pada `package-lock.json`.

## Menjalankan Secara Lokal

### Prasyarat

- Node.js `20.19+`
- npm `10+`
- Browser modern: Chrome, Edge, Firefox, atau Safari terbaru

### Install dependency

```bash
npm install
```

### Development server

```bash
npm run dev
```

Buka:

```text
http://localhost:5173
```

Server development dikonfigurasi dengan host `0.0.0.0`, sehingga dapat diakses dari perangkat mobile pada jaringan Wi-Fi yang sama. Gunakan alamat Network yang ditampilkan terminal, misalnya:

```text
http://192.168.x.x:5173
```

### Build production

```bash
npm run build
```

Output production berada di:

```text
dist/
```

### Preview hasil production

```bash
npm run preview
```

## Perintah npm

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan Vite development server |
| `npm run build` | Type check dan membuat production build |
| `npm run typecheck` | Menjalankan TypeScript tanpa membuat bundle |
| `npm run lint` | Menjalankan Oxlint |
| `npm run check` | Menjalankan lint dan build |
| `npm run preview` | Melayani hasil production build secara lokal |

## Struktur Project

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
├── PRD.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Model Data Lokal

Data profil, consent, skenario, dan hasil disimpan di IndexedDB melalui Dexie. Repository ini tidak memiliki backend dan tidak mengirim data pengguna ke server.

### Tabel lokal

| Tabel | Isi |
|---|---|
| `profiles` | Profil minimal pengguna |
| `scenarios` | Skenario dan refleksi awal |
| `results` | Hasil simulasi tersimpan |
| `consents` | Log persetujuan lokal |

### Data yang dikumpulkan

Hanya data yang diperlukan untuk membantu simulasi, seperti:

- Tahun lahir.
- Pendidikan.
- Status pekerjaan.
- Kondisi perkotaan/pedesaan.
- Provinsi.
- Tanggungan.
- Kisaran penghasilan.
- Tabungan darurat.

Tidak ada field nama, NIK, alamat lengkap, telepon, email, atau koordinat presisi.

## Privacy dan Safety

### Guardrails yang diterapkan

- Tidak menampilkan satu angka pasti.
- Menampilkan rentang probabilistik dan batasannya.
- Menampilkan keyakinan data dengan label yang mudah dipahami.
- Menyembunyikan angka rinci ketika keyakinan data terlalu rendah.
- Menampilkan hal yang tidak dapat diprediksi.
- Tidak memberi rekomendasi direktif.
- Tidak mendiagnosis kondisi mental atau medis.
- Tidak memprediksi orang ketiga.
- Menghentikan simulasi ketika terdapat indikasi krisis.
- Menampilkan Pause & Verify untuk keputusan berisiko tinggi.
- Tidak ada pelacak iklan atau analytics pihak ketiga.

### Batasan prototype

- Mesin simulasi saat ini berjalan di browser dan menggunakan model deterministik sederhana.
- Angka belum berasal dari pipeline inferensi statistik produksi.
- Belum ada LLM extraction atau explanation service yang terhubung.
- Nomor layanan krisis perlu diverifikasi oleh tim produk sebelum rilis.
- Sebelum rilis, seluruh evidence claim harus ditinjau oleh ahli domain.
- DPIA dan tinjauan hukum UU PDP harus disiapkan sebelum publikasi.

## Kualitas dan Build

Jalankan pemeriksaan lengkap:

```bash
npm run check
```

Build saat ini menggunakan Vite, React, Recharts, dan Framer Motion. Build dapat menampilkan warning ukuran bundle dari dependency visualisasi. Untuk produksi, pertimbangkan code splitting pada level route dan lazy loading untuk halaman yang tidak membutuhkan Recharts atau Framer Motion.

Checklist sebelum rilis:

- [ ] Ganti ikon PWA SVG dengan PNG 192×192 dan 512×512 yang sesuai.
- [ ] Verifikasi service worker pada HTTPS.
- [ ] Jalankan audit accessibility dengan axe-core.
- [ ] Uji TalkBack dan VoiceOver.
- [ ] Verifikasi format Rupiah, tanggal, dan timezone Indonesia.
- [ ] Verifikasi nomor layanan krisis.
- [ ] Tinjau evidence registry oleh ahli.
- [ ] Tambahkan test red-team minimal 100 kasus.
- [ ] Pastikan tidak ada PII pada log dan payload.
- [ ] Tinjau ulang privasi dan persetujuan sebelum publikasi.

## Deploy PWA

Build dapat dideploy sebagai static site ke layanan seperti:

- GitHub Pages.
- Vercel.
- Netlify.
- Cloudflare Pages.
- Firebase Hosting.

### Catatan routing

Aplikasi menggunakan React Router dengan path `/simulasi`, `/forcing`, `/riwayat`, dan `/hasil/:id`. Pastikan hosting dikonfigurasi untuk fallback ke `index.html` agar route langsung tidak menghasilkan 404.

### Catatan PWA

Service worker dan manifest aktif pada production build. Untuk menjalankan service worker dengan aman, gunakan HTTPS atau `localhost`.

## Upload ke GitHub

Project sudah disiapkan untuk repository Git, tetapi belum memiliki remote karena URL repository belum ditentukan.

### Inisialisasi lokal

```bash
git init
git branch -M main
git add .
git commit -m "feat: initialize Bercabang PWA"
```

### Tambahkan remote

Ganti `<repository-url>` dengan URL repository GitHub yang dibuat atau sudah dimiliki:

```bash
git remote add origin <repository-url>
git push -u origin main
```

### Jika repository GitHub sudah dibuat melalui browser

1. Buat repository kosong.
2. Jangan pilih README, `.gitignore`, atau license saat membuat repository.
3. Jalankan perintah `git remote add origin` di atas.
4. Jalankan `git push -u origin main`.

### Jika ingin membuat repository melalui GitHub CLI

GitHub CLI belum harus di-install untuk workflow manual. Jika ingin memakai `gh`, install GitHub CLI terlebih dahulu, lalu jalankan:

```bash
gh auth login
gh repo create bercabang --private --source=. --remote=origin --push
```

Jangan memasukkan token, password, API key, atau credential ke dalam source code.

## Roadmap

### Production-ready

- Integrasi model statistik dan evidence registry tervalidasi.
- Backend API dengan schema validation dan rate limiting.
- LLM zero-retention untuk ekstraksi dan penjelasan.
- Enkripsi IndexedDB yang benar dan key management.
- Validasi crisis service yang terkurasi.
- PDF export dan share link yang aman.
- E2E test, accessibility audit, Lighthouse CI, dan red-team suite.
- DPIA, tinjauan hukum, dan review ahli domain.

### Next product iterations

- Dashboard kalibrasi expectation vs data.
- Pengingat refleksi 6 dan 12 bulan.
- Perbandingan simulasi yang lebih ergonomic.
- Ekspor ringkas untuk diskusi keluarga atau konselor.
- Local backup dan restore yang terenkripsi.
- PWA install prompt dan update notification yang lebih jelas.

## Referensi Produk

Spesifikasi lengkap tersedia di [`PRD.md`](./PRD.md).

Evidence awal yang ditampilkan aplikasi berasal dari referensi yang dirangkum dalam PRD, termasuk IFLS, Target Trial Emulation, penelitian wirausaha, penelitian perpindahan, affective forecasting, dan algorithm overreliance.

> Klaim ilmiah harus selalu ditampilkan bersama sumber, asumsi, batasan, dan kemampuan untuk ditinjau. Jangan menghapus disclaimer ini hanya agar hasil terlihat lebih yakin.
