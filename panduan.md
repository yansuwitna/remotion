# 📖 Panduan Menjalankan Remotion AutoStudio di VPS dengan PM2

Panduan lengkap ini menjelaskan langkah demi langkah cara men-deploy dan menjalankan aplikasi **Remotion AutoStudio** di server VPS (Ubuntu / Debian Linux) secara stabil, otomatis menyala saat server restart (*auto-start*), dan aman untuk produksi menggunakan **PM2 Process Manager**.

---

## 📋 Daftar Isi
1. [Spesifikasi Minimum & Rekomendasi VPS](#1-spesifikasi-minimum--rekomendasi-vps)
2. [Persiapan Server & Pengaturan Timezone](#2-persiapan-server--pengaturan-timezone)
3. [Setup Swap Memory (Penting untuk Mencegah OOM)](#3-setup-swap-memory-penting-untuk-mencegah-oom)
4. [Instalasi Node.js, Git, dan PM2](#4-instalasi-nodejs-git-dan-pm2)
5. [Instalasi Dependensi Headless Chromium & Font](#5-instalasi-dependensi-headless-chromium--font)
6. [Deploy & Konfigurasi Kode Aplikasi](#6-deploy--konfigurasi-kode-aplikasi)
7. [Menjalankan Aplikasi dengan PM2](#7-menjalankan-aplikasi-dengan-pm2)
8. [Setup Auto-Start Saat VPS Reboot](#8-setup-auto-start-saat-vps-reboot)
9. [Konfigurasi Nginx Reverse Proxy & SSL HTTPS (Opsional tapi Direkomendasikan)](#9-konfigurasi-nginx-reverse-proxy--ssl-https)
10. [Perintah Praktis PM2 untuk Operasional](#10-perintah-praktis-pm2-untuk-operasional)
11. [Panduan Update Aplikasi di Kemudian Hari](#11-panduan-update-aplikasi-di-kemudian-hari)
12. [Troubleshooting & Solusi Masalah Umum](#12-troubleshooting--solusi-masalah-umum)

---

## 1. Spesifikasi Minimum & Rekomendasi VPS

Remotion merender video menggunakan Chromium dan FFmpeg frame-by-frame. Oleh karena itu, resource CPU dan RAM perlu diperhatikan:

| Komponen | Spesifikasi Minimum | Rekomendasi Ideal |
| :--- | :--- | :--- |
| **Sistem Operasi** | Ubuntu 20.04 / 22.04 / 24.04 LTS atau Debian 11/12 | Ubuntu 22.04 LTS (64-bit) |
| **CPU** | 2 vCPU Core | 4 vCPU Core atau lebih |
| **RAM** | 2 GB (+ Wajib Swap 4 GB) | 4 GB - 8 GB RAM |
| **Penyimpanan** | SSD / NVMe 20 GB | SSD / NVMe 40 GB+ |
| **Akses** | Root / User dengan hak `sudo` | User `sudo` terdedikasi |

> [!IMPORTANT]
> Jika VPS Anda hanya memiliki RAM 1 GB atau 2 GB, **sangat wajib** mengaktifkan **Swap Memory 4 GB** (Langkah 3) agar server tidak mengalami *Crash/Killed Out of Memory* saat merender video Remotion.

---

## 2. Persiapan Server & Pengaturan Timezone

Login ke VPS Anda via SSH:
```bash
ssh root@IP_VPS_ANDA
```

### 2.1 Update Paket Sistem
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip software-properties-common
```

### 2.2 Sinkronisasi Timezone (Sangat Penting untuk Auto-Scheduler!)
Aplikasi ini menjalankan background scheduler untuk upload video pada jam-jam spesifik (contoh: `07:30`, `12:15`, `19:00`). Pastikan zona waktu VPS sesuai dengan zona waktu Anda (contoh: **WIB / Asia/Jakarta**):

```bash
# Set timezone ke Asia/Jakarta (WIB)
sudo timedatectl set-timezone Asia/Jakarta

# Untuk WITA: sudo timedatectl set-timezone Asia/Makassar
# Untuk WIT:  sudo timedatectl set-timezone Asia/Jayapura

# Verifikasi waktu saat ini
timedatectl
```

---

## 3. Setup Swap Memory (Penting untuk Mencegah OOM)

Langkah ini menyediakan memori cadangan virtual pada disk SSD VPS. Sangat dianjurkan untuk VPS dengan RAM ≤ 4 GB.

```bash
# 1. Cek apakah swap sudah ada
sudo swapon --show

# 2. Buat file swap sebesar 4 GB
sudo fallocate -l 4G /swapfile

# 3. Kunci izin akses file
sudo chmod 600 /swapfile

# 4. Format menjadi area swap
sudo mkswap /swapfile

# 5. Aktifkan swap
sudo swapon /swapfile

# 6. Jadikan permanen agar tetap aktif saat server di-reboot
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 7. Verifikasi kapasitas swap
free -h
```

---

## 4. Instalasi Node.js, Git, dan PM2

Aplikasi ini membutuhkan **Node.js versi 18 atau 20 LTS**.

### 4.1 Pasang Node.js 20 LTS via NodeSource
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Cek versi
node -v   # Harus v20.x.x
npm -v    # Harus v10.x.x
```

### 4.2 Pasang PM2 secara Global
PM2 adalah production process manager untuk Node.js yang memastikan aplikasi berjalan di background 24/7 dan me-restart aplikasi jika terjadi error.
```bash
sudo npm install -g pm2
```

---

## 5. Instalasi Dependensi Headless Chromium & Font

Remotion membutuhkan dependensi grafik Linux (GTK, NSS, GBM, X11) serta koleksi font dan emoji agar teks naskah dan ikon emoji pada video dirender dengan tajam tanpa karakter kotak (*tofu*):

```bash
sudo apt install -y \
  ffmpeg \
  libnss3 \
  libatk-bridge2.0-0 \
  libx11-xcb1 \
  libgbm1 \
  libasound2 \
  libpangocairo-1.0-0 \
  libxss1 \
  libgtk-3-0 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxi6 \
  libxtst6 \
  fonts-liberation \
  fonts-noto-color-emoji \
  fonts-dejavu-core \
  fontconfig

# Refresh cache font sistem
sudo fc-cache -f -v
```

---

## 6. Deploy & Konfigurasi Kode Aplikasi

### 6.1 Siapkan Direktori Aplikasi
Letakkan aplikasi di direktori `/var/www/video` (atau path sesuai preferensi Anda):

```bash
sudo mkdir -p /var/www/video
sudo chown -R $USER:$USER /var/www/video
cd /var/www/video
```

### 6.2 Salin atau Clone File Proyek
**Opsi A — Menggunakan Git (Direkomendasikan):**
```bash
git clone https://github.com/USERNAME/REPO_ANDA.git .
```

**Opsi B — Upload dari Komputer Lokal via SCP:**
Jalankan perintah ini di terminal komputer lokal Anda:
```bash
scp -r "D:\PROGRAMER\WEB\video\*" user@IP_VPS_ANDA:/var/www/video/
```

### 6.3 Instal Dependensi Node.js
Di server VPS (dalam direktori `/var/www/video`):
```bash
npm install
```

### 6.4 Unduh Binary Browser Remotion
Pastikan headless browser Remotion sudah terunduh di server:
```bash
npx remotion browser ensure
```

### 6.5 Konfigurasi File Lingkungan (`.env`)
Salin file `.env.example` ke `.env`:
```bash
cp .env.example .env
nano .env
```

Sesuaikan isi file `.env`:
```env
# Port aplikasi (default: 3000)
PORT=3000

# Google Gemini API Key
GEMINI_API_KEY=AIzaSy...KUNCI_GEMINI_ANDA

# YouTube Data API v3 OAuth2
YOUTUBE_CLIENT_ID=xxx.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-xxx
YOUTUBE_REFRESH_TOKEN=1//0gxxx
YOUTUBE_DEFAULT_PRIVACY=public

# TikTok Content Posting API
TIKTOK_CLIENT_KEY=awxxx
TIKTOK_CLIENT_SECRET=xxx
TIKTOK_ACCESS_TOKEN=act.xxx
TIKTOK_DEFAULT_PRIVACY=PUBLIC_TO_EVERYONE
```
*Tekan `CTRL + O`, lalu `ENTER` untuk menyimpan, kemudian `CTRL + X` untuk keluar dari nano.*

---

## 7. Menjalankan Aplikasi dengan PM2

Di dalam proyek telah disediakan file konfigurasi [`ecosystem.config.js`](file:///D:/PROGRAMER/WEB/video/ecosystem.config.js).

> [!IMPORTANT]
> **Mengapa wajib menggunakan 1 instance (`fork mode`)?**
> Aplikasi ini memiliki **Background Scheduler (Cron)** bawaan yang berjalan di background. Jika dijalankan dalam `cluster mode` dengan banyak instance, scheduler akan dieksekusi berulang kali sebanyak jumlah worker, yang dapat menyebabkan upload video duplikat ke YouTube/TikTok. File `ecosystem.config.js` sudah disetel ke 1 instance fork.

### 7.1 Jalankan Menggunakan Ecosystem File
```bash
pm2 start ecosystem.config.js
```

Atau jika ingin menjalankan secara manual via baris perintah langsung:
```bash
pm2 start server.js --name "remotion-autostudio" --max-memory-restart 1500M
```

### 7.2 Periksa Status Aplikasi
```bash
pm2 status
```
Output akan menunjukkan status aplikasi `online`:
```
┌────┬────────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┐
│ id │ name                   │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │
├────┼────────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┤
│ 0  │ remotion-autostudio    │ default     │ 1.0.0   │ fork    │ 12345    │ 10s    │ 0    │ online    │ 0%       │
└────┴────────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┘
```

### 7.3 Periksa Log Aplikasi
```bash
pm2 logs remotion-autostudio --lines 50
```
Anda akan melihat log inisialisasi:
```
======================================================
🎬 REMOTION VIDEO AUTOMATION STUDIO BERJALAN
🌐 Buka di Browser: http://localhost:3000
======================================================
[Scheduler] Mesin penjadwalan otomatis aktif.
```

---

## 8. Setup Auto-Start Saat VPS Reboot

Agar aplikasi otomatis hidup kembali jika VPS Anda restart, crash, atau di-reboot oleh penyedia hosting:

```bash
# 1. Generate skrip startup systemd
pm2 startup
```

PM2 akan mengeluarkan satu baris perintah seperti contoh berikut:
```bash
# Contoh output (COPY DAN JALANKAN DI TERMINAL ANDA):
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```
*Jalankan baris perintah yang muncul di terminal Anda.*

Setelah itu, simpan snapshot daftar proses yang sedang berjalan:
```bash
# 2. Simpan daftar proses saat ini
pm2 save
```

Sekarang aplikasi Anda aman dari gangguan restart server!

---

## 9. Konfigurasi Nginx Reverse Proxy & SSL HTTPS

Secara default aplikasi berjalan di port `3000` (`http://IP_VPS:3000`). Agar dashboard dapat diakses melalui port web standar `80` (HTTP), port `443` (HTTPS) dengan domain Anda sendiri, pasang **Nginx**.

### 9.1 Instal Nginx
```bash
sudo apt install -y nginx
```

### 9.2 Buat Konfigurasi Virtual Host
Buat file baru di `/etc/nginx/sites-available/video`:
```bash
sudo nano /etc/nginx/sites-available/video
```

Masukkan konfigurasi berikut (ganti `domainanda.com` dengan nama domain atau IP VPS Anda):
```nginx
server {
    listen 80;
    server_name domainanda.com www.domainanda.com; # Ganti dengan domain atau IP VPS

    # Izinkan upload data/video hingga 150 MB
    client_max_body_size 150M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeout panjang saat proses rendering video
        proxy_read_timeout 600s;
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
    }
}
```

### 9.3 Aktifkan Konfigurasi & Restart Nginx
```bash
# Buat symlink ke sites-enabled
sudo ln -s /etc/nginx/sites-available/video /etc/nginx/sites-enabled/

# Hapus konfigurasi default jika tidak digunakan
sudo rm /etc/nginx/sites-enabled/default

# Test sintaks konfigurasi nginx
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 9.4 Pasang SSL Gratis (Let's Encrypt / Certbot)
Jika Anda menggunakan domain:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domainanda.com -d www.domainanda.com
```
Certbot akan otomatis memperbarui sertifikat HTTPS Anda secara berkala.

### 9.5 Buka Firewall (UFW)
Pastikan port SSH dan Web terbuka di firewall VPS:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
# Jika tidak menggunakan Nginx dan ingin akses langsung ke port 3000:
# sudo ufw allow 3000/tcp
sudo ufw enable
```

---

## 10. Perintah Praktis PM2 untuk Operasional

Berikut ringkasan perintah yang sering digunakan saat mengelola aplikasi di VPS:

| Perintah | Deskripsi |
| :--- | :--- |
| `pm2 status` | Melihat status berjalan, penggunaan RAM, CPU, dan restart count |
| `pm2 logs` | Melihat log gabungan secara live (*real-time streaming*) |
| `pm2 logs remotion-autostudio` | Melihat log khusus aplikasi ini |
| `pm2 logs --lines 100` | Melihat 100 baris log terakhir |
| `pm2 flush` | Membersihkan log lama yang menumpuk |
| `pm2 restart remotion-autostudio` | Me-restart aplikasi |
| `pm2 reload remotion-autostudio` | Reload aplikasi dengan zero-downtime |
| `pm2 stop remotion-autostudio` | Menghentikan aplikasi sementara |
| `pm2 delete remotion-autostudio` | Menghapus aplikasi dari daftar proses PM2 |
| `pm2 monit` | Membuka antarmuka monitoring visual CPU & RAM di terminal |

---

## 11. Panduan Update Aplikasi di Kemudian Hari

Ketika Anda melakukan update kode atau perubahan naskah/komposisi Remotion:

```bash
# 1. Masuk ke direktori
cd /var/www/video

# 2. Tarik kode terbaru dari Git
git pull origin main

# 3. Instal dependensi baru jika ada penambahan package di package.json
npm install

# 4. Restart proses di PM2
pm2 restart remotion-autostudio

# 5. Cek log untuk memastikan server berjalan normal
pm2 logs remotion-autostudio --lines 30
```

---

## 12. Troubleshooting & Solusi Masalah Umum

### 1. Error: `Failed to launch the browser process: libnss3.so: cannot open shared object file`
* **Penyebab**: Headless Chromium membutuhkan pustaka GUI Linux.
* **Solusi**: Jalankan kembali perintah instalasi library Linux pada [Langkah 5](#5-instalasi-dependensi-headless-chromium--font).

### 2. Error: `Killed` atau Server Hang saat Rendering Video
* **Penyebab**: VPS kehabisan memori fisik (RAM) saat Chromium merender frame.
* **Solusi**:
  1. Pastikan **Swap Memory 4 GB** sudah aktif (`free -h`). Ikuti [Langkah 3](#3-setup-swap-memory-penting-untuk-mencegah-oom).
  2. Turunkan jumlah concurrency render jika diperlukan (aplikasi otomatis mendeteksi 2 concurrent workers pada CPU/VPS tanpa GPU eksternal).

### 3. Emoji atau Huruf pada Video Berubah Jadi Kotak-kotak (Tofu)
* **Penyebab**: Font emoji (`fonts-noto-color-emoji`) belum terpasang di sistem operasi VPS.
* **Solusi**:
  ```bash
  sudo apt install -y fonts-noto-color-emoji fonts-liberation
  sudo fc-cache -f -v
  pm2 restart remotion-autostudio
  ```

### 4. Jadwal Video Mengunggah di Jam yang Salah
* **Penyebab**: Zona waktu server VPS masih UTC atau tidak sesuai waktu lokal Indonesia.
* **Solusi**:
  ```bash
  sudo timedatectl set-timezone Asia/Jakarta
  pm2 restart remotion-autostudio
  ```

### 5. YouTube OAuth Error: `redirect_uri_mismatch`
* **Penyebab**: Domain atau IP VPS belum didaftarkan di Google Cloud Console.
* **Solusi**:
  1. Buka [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
  2. Buka kredensial **OAuth 2.0 Client IDs** Anda.
  3. Pada bagian **Authorized redirect URIs**, tambahkan URL callback server Anda:
     - `http://IP_VPS_ANDA:3000/auth/youtube/callback` atau
     - `https://domainanda.com/auth/youtube/callback`
  4. Simpan perubahan dan sambungkan ulang YouTube di dashboard web.
