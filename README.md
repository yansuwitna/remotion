# 🎬 Remotion AutoStudio - AI Video Generator & Multi-Platform Publisher

Aplikasi otomatisasi pembuatan video berbasis web menggunakan **Remotion**, terintegrasi dengan **AI (Gemini)** untuk pembuatan naskah, kode props animasi video, judul dan deskripsi viral, serta **penjadwalan otomatis** untuk langsung mengunggah (*auto-upload*) ke **YouTube Shorts** dan **TikTok**.

---

## 🚀 Fitur Utama

1. **Penjadwalan Waktu Fleksibel (Auto Scheduler)**
   - Atur jam tayang harian rutin (misal: `07:30`, `12:15`, `19:00`) atau tanggal & jam spesifik.
   - Engine mengecek waktu setiap 30 detik. Begitu waktu cocok, pipeline langsung dieksekusi tanpa perlu intervensi manual.

2. **Generasi Kode Props & Naskah Otomatis (Gemini AI)**
   - Berdasarkan topik yang ditentukan, AI merancang:
     - *Hook* pembuka video yang mencuri perhatian dalam 2-3 detik pertama.
     - Pembagian slide fakta/cerita (*scenes*) lengkap dengan kata kunci *highlight* dan emoji.
     - *Call to Action* (CTA) ajakan subscribe/follow.
     - Judul menarik (*click-worthy*), deskripsi ramah SEO, dan hashtag viral untuk YouTube & TikTok.
   - Dilengkapi generator cerdas bawaan (*smart fallback*) jika API Key belum diisi.

3. **Rendering Video Remotion (Format 9:16 Shorts / Reels / TikTok)**
   - Komposisi React Remotion modern resolusi **1080x1920 (30 FPS)**.
   - Animasi kinetik dengan fisika *spring*, efek *gradient mesh background*, *glow overlay*, *word highlight badge*, dan indikator *progress bar* dinamis.

4. **Multi-Platform Auto Upload**
   - **YouTube Data API v3**: Mengunggah video langsung sebagai YouTube Shorts dengan metadata lengkap (judul, deskripsi, tags, privasi).
   - **TikTok Content Posting API**: Mengunggah video langsung ke akun kreator TikTok.

5. **Dashboard Manajemen Berbasis Web**
   - Pengaturan jadwal & topik (tersedia *Topic Bank / Queue* rotasi otomatis).
   - Generator instan untuk uji coba langsung kapan saja.
   - Preview pemutar video hasil render langsung di browser.
   - Riwayat eksekusi, status pengunggahan, dan link langsung ke video yang tayang.
   - Antarmuka konfigurasi API Keys & OAuth terpadu.

---

## 📂 Struktur Proyek

```
D:\PROGRAMER\WEB\video\
├── package.json                   # Dependensi & skrip Node.js
├── server.js                      # Express backend API & web server
├── scheduler.js                   # Mesin cron scheduler berbasis waktu
├── .env.example                   # Contoh konfigurasi environment
├── services/
│   ├── ai-generator.js            # Generator naskah, judul, deskripsi & props via Gemini
│   ├── remotion-service.js        # Engine bundling & render video Remotion
│   ├── youtube-uploader.js        # Service upload YouTube Data API v3 & OAuth2
│   ├── tiktok-uploader.js         # Service upload TikTok Content Posting API
│   └── pipeline-orchestrator.js   # Konduktor utama alur otomatisasi
├── remotion/
│   ├── Root.jsx                   # Registrasi komposisi Remotion
│   ├── index.js                   # Entry point Remotion
│   └── compositions/
│       └── ShortVideo.jsx         # Template video 9:16 dinamis (Shorts/TikTok)
├── data/
│   ├── schedules.json             # Database daftar jadwal aktif
│   ├── settings.json              # Database konfigurasi & API keys
│   ├── topic-bank.json            # Antrean ide topik otomatis
│   └── logs.json                  # Catatan riwayat render & link upload
└── public/
    ├── index.html                 # Dashboard Web UI (Dark theme SaaS)
    ├── css/style.css              # Custom styling & animasi
    ├── js/app.js                  # Frontend reactive logic & polling
    └── outputs/                   # Direktori penyimpanan file video MP4
```

---

## 🛠️ Panduan Instalasi & Menjalankan

### 1. Prasyarat
- **Node.js** versi 18 atau lebih baru.
- Koneksi internet untuk unduhan paket npm dan pemanggilan API.

### 2. Instal Dependensi
Buka terminal (PowerShell atau Command Prompt) pada direktori proyek, lalu jalankan:
```bash
npm install
```

### 3. Jalankan Aplikasi
```bash
npm start
```
Buka peramban (browser) dan akses:
👉 **`http://localhost:3000`**

---

## ⚙️ Panduan Pengaturan Kredensial API

Buka tab **"Pengaturan & API"** di dashboard web untuk mengisi kunci API:

### 1. Google Gemini API (Untuk Naskah AI)
1. Kunjungi [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Buat API Key gratis lalu tempelkan ke kolom **Gemini API Key** di dashboard.

### 2. YouTube Data API v3 (Untuk Upload Otomatis ke YouTube)
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat project baru dan aktifkan **YouTube Data API v3**.
3. Di menu **Credentials**, buat **OAuth 2.0 Client ID** bertipe *Web application*.
4. Tambahkan Authorized Redirect URI:
   `http://localhost:3000/api/youtube/callback`
5. Masukkan **Client ID** dan **Client Secret** ke menu Pengaturan dashboard.
6. Klik tombol **"Hubungkan Akun YouTube"** di dashboard untuk login dan memberikan izin upload. Refresh token akan terisi secara otomatis!

### 3. TikTok Content Posting API (Untuk Upload Otomatis ke TikTok)
1. Buka portal [TikTok for Developers](https://developers.tiktok.com/).
2. Buat aplikasi dan aktifkan izin **Content Posting API**.
3. Masukkan **Client Key**, **Client Secret**, dan **Access Token** pada dashboard.

---

## 🎯 Cara Penggunaan

1. **Menambah Jadwal Otomatis**:
   - Masuk ke tab **"Jadwal & Topik Otomatis"** ➔ Klik **"Tambah Jadwal Baru"**.
   - Tentukan jam (misal: `08:00`), isi topik atau ketik `auto` agar mengambil dari bank topik.
   - Pilih platform (YouTube Shorts dan/atau TikTok).
   - Klik **Simpan Jadwal**.

2. **Uji Coba Instan (Tanpa Menunggu Jam Tayang)**:
   - Masuk ke tab **"Generator Instan"**.
   - Ketik topik apa saja (atau klik *Pilih Topik Acak*).
   - Klik **"Generate Video & Upload Sekarang"**.
   - Pantau indikator progres 3 langkah secara langsung: Pembuatan Naskah AI ➔ Rendering Remotion ➔ Pengunggahan ke Platform.
   - Putar video hasil render langsung di browser dan klik tautan untuk melihat hasil upload di YouTube / TikTok.
"# remotion" 
"# remotion" 
"# remotion" 
