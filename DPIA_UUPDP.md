# Penilaian Dampak Pelindungan Data Pribadi (DPIA) & Kepatuhan UU PDP

**Dokumen Kepatuhan Hukum & Privasi Produk Bercabang**  
**Dasar Hukum Utama:** Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)  
**Versi Dokumen:** 1.0 (September 2026)  
**Status Produk:** Progressive Web App (PWA) — Local-First Privacy Architecture  

---

## 1. Ringkasan Eksekutif

Aplikasi **Bercabang** dirancang dengan prinsip dasar *Privacy by Design* dan *Privacy by Default*. Berbeda dengan aplikasi web konvensional yang mengumpulkan data pengguna ke peladen terpusat (*cloud server*), Bercabang beroperasi dengan arsitektur **Local-First**:
- Profil pengguna dan riwayat simulasi disimpan secara eksklusif di perangkat pengguna (*browser storage* via Dexie/IndexedDB).
- Tidak ada akun pengguna, tidak ada nomor identitas kependudukan (NIK), nama lengkap, nomor telepon, alamat rinci, maupun koordinat GPS yang diminta atau disimpan.
- Pemrosesan LLM (kecerdasan buatan) bersifat opsional (*opt-in*), tanpa penyimpanan kunci secara teks polos, dan terlindung melalui enkripsi Web Crypto API (AES-GCM 256-bit).

Dokumen ini menyajikan inventarisasi data, dasar hukum pemrosesan, penilaian risiko dampak data pribadi (DPIA), serta mekanisme pemenuhan hak subjek data sebagaimana diwajibkan oleh UU No. 27 Tahun 2022.

---

## 2. Inventarisasi & Klasifikasi Data Pribadi (Pasal 4 UU PDP)

### 2.1. Data Pribadi yang Bersifat Umum (Pasal 4 Ayat 3)
| Jenis Data | Sifat | Tujuan Pemrosesan | Lokasi Penyimpanan |
| :--- | :--- | :--- | :--- |
| **Tahun Lahir** | Wajib untuk batas usia | Menjamin usia pengguna >= 18 tahun dan mencocokkan kelompok umur pada data IFLS | Penyimpanan lokal perangkat (IndexedDB) |
| **Jenis Kelamin** | Opsional | Konteks perbandingan statistik kelompok | Penyimpanan lokal perangkat (IndexedDB) |
| **Pendidikan Terakhir** | Opsional | Konteks perbandingan kelompok sosial-ekonomi | Penyimpanan lokal perangkat (IndexedDB) |
| **Status Perkawinan** | Opsional | Konteks tanggungan keputusan | Penyimpanan lokal perangkat (IndexedDB) |
| **Provinsi Asal & Tujuan** | Opsional | Konteks perbandingan biaya dan mobilitas IFLS | Penyimpanan lokal perangkat (IndexedDB) |

### 2.2. Data Pribadi yang Bersifat Spesifik / Sensitif (Pasal 4 Ayat 2)
| Jenis Data | Sifat | Tujuan Pemrosesan | Perlindungan Khusus |
| :--- | :--- | :--- | :--- |
| **Data Keuangan Pribadi** (Rentang penghasilan relatif, estimasi tabungan darurat dalam bulan, kisaran modal usaha) | Opsional | Menghitung sensitivitas risiko finansial keputusan hidup | Hanya disimpan lokal dalam format skala 1–6 (tanpa nominal rekening, bank, atau saldo nyata). |
| **Teks Cerita Bebas Pengguna** | Opsional | Memetakan konteks skenario ke parameter formulir | Disaring dari indikasi krisis mental sebelum diproses. Maksimal 4.000 karakter. Dihapus saat reset data. |
| **Kunci API Provider Pengguna (API Key)** | Opsional | Menghubungkan ke penyedia AI pilihan pengguna | **Tidak pernah disimpan polos**. Disimpan di memori sesi aktif atau dienkripsi dengan kata sandi pengguna (Web Crypto AES-GCM 256-bit). |

### 2.3. Data yang Secara Tegas DILARANG Diminta oleh Sistem
- Nama lengkap dan nama keluarga.
- Nomor Induk Kependudukan (NIK) atau Nomor Paspor.
- Alamat rumah lengkap atau koordinat lokasi presisi (GPS/geolokasi).
- Nomor telepon atau alamat email.
- Informasi rekening bank, nomor kartu kredit, atau data biometrik.

---

## 3. Prinsip Pelindungan Data Pribadi (Pasal 16 UU PDP)

1. **Pengumpulan Terbatas & Spesifik (Pasal 16 Huruf a & b):**  
   Data yang dikumpulkan dibatasi hanya pada variabel yang esensial untuk perhitungan rentang probabilitas keputusan (minimisasi data).
2. **Jaminan Akurasi & Transparansi (Pasal 16 Huruf c):**  
   Pengguna dapat melihat, mengubah, dan memperbarui seluruh data profil setiap saat di halaman `/profil`.
3. **Keamanan & Kerahasiaan (Pasal 16 Huruf d):**  
   Penyimpanan menggunakan standar IndexedDB yang terisolasi oleh mekanisme *Same-Origin Policy* peramban web modern.
4. **Pembatasan Penyimpanan (Pasal 16 Huruf f):**  
   Bercabang tidak memiliki basis data terpusat (*cloud database*) untuk data pengguna. Data sepenuhnya berada dalam kendali fisik pemilik perangkat.
5. **Penghapusan Data (Pasal 16 Huruf e):**  
   Fungsi satu ketukan `Hapus semua data` di halaman profil dan pengaturan menghapus seluruh IndexedDB dan `localStorage` secara permanen.

---

## 4. Pemenuhan Hak Subjek Data Pribadi (Pasal 5 – 13 UU PDP)

| Hak Subjek Data (UU PDP) | Implementasi Nyata di Bercabang |
| :--- | :--- |
| **Hak Informasi (Pasal 5)** | Halaman *Onboarding*, *ConsentGate*, dan *Methodology* menjelaskan secara transparan tujuan simulasi, batasan model, dan nihilnya server pengumpul data. |
| **Hak Akses & Salinan (Pasal 6 & 7)** | Pengguna dapat mengunduh seluruh skenario dan hasil kalkulasi dalam format baku `JSON` kapan saja melalui tombol **Unduh Catatan**. |
| **Hak Pemutakhiran Data (Pasal 8)** | Formulir di halaman `/profil` dan `/simulasi` dapat disunting dan disimpan ulang sewaktu-waktu. |
| **Hak Penghapusan Data (Pasal 8 Ayat 1)** | Fitur **Hapus Semua Data** menghapus profil, skenario, hasil, dan catatan persetujuan secara instan dari perangkat. |
| **Hak Penarikan Persetujuan (Pasal 9)** | Pengguna dapat menolak atau menarik persetujuan pemrosesan kapan saja melalui reset aplikasi atau penutupan sesi. |

---

## 5. Penilaian Dampak Risiko & Mitigasi (DPIA Matrix)

| Potensi Risiko | Tingkat Risiko | Mekanisme Mitigasi Teknis di Bercabang |
| :--- | :---: | :--- |
| **Kebocoran Kunci API Provider Pengguna** | Tinggi | • Kunci tidak pernah disimpan polos di `localStorage` atau Dexie.<br>• Default: Disimpan di memori runtime (`memoryApiKey`), hilang saat tab ditutup.<br>• Opsi persisten: Terenkripsi AES-GCM 256 dengan PBKDF2 100.000 iterasi.<br>• Pesan error jaringan disanitasi dari header `Authorization: Bearer`. |
| **Penyalahgunaan Data Cerita Sensitif / Krisis Mental** | Sangat Tinggi | • Filter krisis (`detectCrisisText`) berjalan di sisi klien *sebelum* request jaringan dilakukan.<br>• Input krisis **tidak pernah diteruskan** ke LLM provider.<br>• Pengguna diarahkan ke layanan bantuan resmi terverifikasi (119 Ext 8, 112, Hotline LISA). |
| **Halusinasi Angka oleh Model AI** | Sedang | • **Number Whitelist Engine**: Seluruh angka dalam penjelasan AI dicocokkan dengan payload simulasi.<br>• Jika model mengarang angka di luar data (misal janji keuntungan), respons ditolak dan diganti fallback mesin lokal. |
| **Serangan SSRF via Custom Base URL** | Tinggi | • Backend proxy membatasi domain upstream hanya ke provider terpercaya.<br>• URL kustom dari browser dipanggil langsung oleh browser pengguna dengan peringatan risiko, tanpa lewat proxy server. |
| **Prompt Injection / Jailbreak** | Sedang | • Format input terisolasi: `DATA_JSON` + `USER_TEXT` sebagai data terisolasi, bukan instruksi sistem.<br>• System prompt dibentuk deterministik dari kode dan tidak dapat disunting pengguna. |

---

## 6. Pernyataan Kepatuhan Hukum

Pengembang aplikasi Bercabang menyatakan bahwa:
1. Tidak melakukan transfer data pribadi lintas batas negara (*cross-border data transfer*) dari pihak pengembang, karena data operasional aplikasi tidak dikirimkan ke server pengembang.
2. Setiap panggilan eksternal ke provider AI pihak ketiga (OpenRouter, Kios, atau OpenAI) hanya terjadi atas inisiatif dan otorisasi langsung dari pengguna dengan kunci API pribadi yang dimasukkan sendiri oleh pengguna.
3. Aplikasi ini bebas dari pelacak pihak ketiga (*third-party trackers*), cookie iklan, analitik berbasis sidik jari peramban (*fingerprinting*), atau kode pelacak telemetri invasif.
