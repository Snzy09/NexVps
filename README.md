# 🚀 NexVps — Cloud VPS Webstore & Auto-Provisioning

> **NexVps** adalah platform webstore modern dan otomatis untuk penjualan Cloud VPS performa tinggi yang terintegrasi langsung dengan **UpCloud API 1.3** dan payment gateway **BuatQRIS Open API**.

---

## 🌟 Fitur Utama

- ⚡ **Otomatisasi Penuh (Zero Touch Provisioning):**
  - Pelanggan memilih konfigurasi VPS (Plan, Lokasi Data Center, OS Linux, Hostname, Password Root).
  - Sistem membuat pembayaran QRIS Dinamis melalui BuatQRIS Open API dengan kode unik otomatis.
  - Setelah pembayaran terkonfirmasi (via Webhook atau auto-check), backend langsung memanggil UpCloud API 1.3 untuk membangun server dalam hitungan detik.
  - Cloud-Init secara otomatis mengonfigurasi autentikasi password root dan SSH.
  - Detail IP Publik (IPv4 & IPv6) serta perintah SSH ditampilkan langsung kepada pelanggan.

- 🌐 **Infrastruktur UpCloud MaxIOPS Enterprise:**
  - Dukungan multi-region: Singapore 🇸🇬 (`sg-sin1`), Frankfurt 🇩🇪 (`de-fra1`), Helsinki 🇫🇮 (`fi-hel1`), London 🇬🇧 (`uk-lon1`), New York 🇺🇸 (`us-nyc1`), Sydney 🇦🇺 (`au-syd1`), dll.
  - Template OS siap pakai: Ubuntu 24.04 LTS, Ubuntu 22.04 LTS, Debian 12, Rocky Linux 9, AlmaLinux 9.
  - Kontrol daya instan dari dashboard: Start, Stop, dan Restart server.

- 💳 **Integrasi BuatQRIS Payment Gateway:**
  - Pembuatan QRIS instan (`action=api_create_qris`) dengan barcode QR jernih dan countdown kadaluarsa 15 menit.
  - Mendukung seluruh m-Banking (BCA, Mandiri, BRI, BNI) dan e-Wallet (GoPay, OVO, Dana, ShopeePay).
  - Penerima Webhook aman dengan validasi tanda tangan **HMAC-SHA256** (`X-BuatQris-Signature`) menggunakan raw body buffer sesuai dokumentasi resmi BuatQRIS.
  - Mode Sandbox (`test=1`) & Fitur Dev Simulator untuk pengujian tanpa uang sungguhan.

- 📊 **Admin Dashboard & Kontrol Finansial:**
  - Ringkasan metrik: Total Pendapatan, Server Aktif, Pesanan Menunggu Pembayaran.
  - Pengujian koneksi API 1-klik untuk UpCloud (`/1.3/account`) dan BuatQRIS.
  - Manajemen pesanan dan tabel audit transaksi lengkap.

---

## 📁 Struktur Direktori

```
NexVps/
├── client/                     # Frontend (React 19, TypeScript, Tailwind CSS v4, Lucide Icons)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Navigasi & status integrasi
│   │   │   ├── VpsConfigurator.tsx     # Katalog & configurator VPS interaktif
│   │   │   ├── QrisCheckoutModal.tsx   # Tampilan QRIS & live provisioning tracker
│   │   │   ├── ServersDashboard.tsx    # Dashboard kelola VPS pelanggan (Power actions & SSH)
│   │   │   └── AdminDashboard.tsx      # Kontrol panel admin & konfigurasi API
│   │   ├── services/
│   │   │   └── api.ts                  # REST API client
│   │   ├── types.ts                    # TypeScript interface frontend
│   │   ├── App.tsx                     # Aplikasi utama
│   │   └── index.css                   # Tailwind v4 tema dark glassmorphism
│   └── vite.config.ts                  # Konfigurasi Vite & proxy backend
│
├── server/                     # Backend API (Node.js, Express, TypeScript)
│   ├── src/
│   │   ├── db/
│   │   │   └── store.ts                # Persistent JSON store database
│   │   ├── services/
│   │   │   ├── upcloudService.ts       # Integrasi UpCloud API 1.3 (create, start, stop, restart)
│   │   │   ├── buatqrisService.ts      # Integrasi BuatQRIS Open API & webhook HMAC validator
│   │   │   └── orderManager.ts         # Siklus pesanan & auto-provisioning worker
│   │   ├── routes/
│   │   │   └── api.ts                  # Router REST API
│   │   ├── types.ts                    # Type definitions backend
│   │   └── index.ts                    # Server Express dengan rawBody parser
│   ├── data/                           # Direktori database lokal
│   └── .env                            # Konfigurasi environment backend
│
├── package.json                # Root package script
└── README.md                   # Dokumentasi proyek
```

---

## ⚙️ Cara Menjalankan Proyek

### 1. Prasyarat
- Node.js versi 18+ (Disarankan v20 atau v24)
- npm versi 9+

### 2. Menjalankan Backend Server
```bash
cd server
npm install
npm run dev
```
Backend berjalan di: `http://localhost:5000`

### 3. Menjalankan Frontend Webstore
```bash
cd client
npm install
npm run dev
```
Frontend berjalan di: `http://localhost:3000` (atau port otomatis yang tersedia)

---

## 🔑 Konfigurasi Environment (`server/.env`)

Salin atau sesuaikan file `server/.env`:

```env
PORT=5000
APP_URL=http://localhost:5000

# ==========================================
# UpCloud Cloud Provider API 1.3
# Docs: https://developers.upcloud.com/api/1.3
# ==========================================
# Opsi 1: Bearer Token (Rekomendasi dari UpCloud Hub -> Account -> API tokens)
UPCLOUD_API_TOKEN=ucat_your_token_here

# Opsi 2: Basic Auth Subaccount
UPCLOUD_USERNAME=
UPCLOUD_PASSWORD=

# ==========================================
# BuatQRIS Payment Gateway Open API
# Dashboard: https://app.buatqris.site/dasbort
# ==========================================
BUATQRIS_ACCOUNT_ID=YOUR_ACCOUNT_ID
BUATQRIS_SECRET_TOKEN=your_buatqris_secret_token_here
BUATQRIS_SIGNING_SECRET=YOUR_SIGNING_SECRET
BUATQRIS_METHOD=qris_two
BUATQRIS_FEE_BY=user
IS_SANDBOX=true
```

> **Catatan:** Anda juga dapat mengisi atau mengubah kredensial ini langsung dari halaman **Admin Panel** di antarmuka web, lengkap dengan tombol **Tes Koneksi** real-time.

---

## 📡 Pengaturan Webhook BuatQRIS

1. Buka dasbor BuatQRIS: `https://app.buatqris.site/dasbort`
2. Masuk ke menu **Open API** → kartu **Webhook / Callback**.
3. Masukkan URL Webhook server Anda:
   ```
   https://domain-anda.com/api/webhook/buatqris
   ```
4. Catat **Signing Secret** dan masukkan ke konfigurasi backend (`BUATQRIS_SIGNING_SECRET`).
5. Backend NexVps memverifikasi header `X-BuatQris-Signature` menggunakan HMAC-SHA256 dari body mentah (`raw body`) dan menerapkan penanganan idempoten untuk mencegah duplikasi eksekusi.

---

## 🛠️ Alur Kerja Pemesanan & Provisioning

```
[ Pelanggan di Webstore ]
          │
          ▼
Pilih Paket, Lokasi, OS & Hostname
          │
          ▼
Sistem buat Order + BuatQRIS QRIS Dinamis
          │
          ▼
Pelanggan scan QRIS (m-Banking / e-Wallet)
          │
          ├──> [ Webhook BuatQRIS (payment.success) ]
          │                    │
          │                    ▼
          └───> Order status: PAID
                               │
                               ▼
               Panggil UpCloud API: POST /1.3/server
               (Clone MaxIOPS Template + Cloud-Init)
                               │
                               ▼
               Server UpCloud: Started & Alokasi IP Publik
                               │
                               ▼
               Notifikasi Pelanggan: Kredensial & Akses SSH Aktif!
```

---

## 📄 Lisensi
Hak Cipta © 2026 NexVps Team. Lisensi MIT.
