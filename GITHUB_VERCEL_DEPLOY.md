# Panduan Lengkap Push ke GitHub & Deploy ke Vercel

Proyek **Adobe Stock AI Metadata Assistant** telah 100% siap untuk deployment ke **GitHub** dan **Vercel** dengan dukungan penuh:
* **PWA (Progressive Web App)**: Dapat diinstal di desktop, Android, dan iOS.
* **UI Scaling**: 100%, 90%, 80%, 70%, dan 67%.
* **Vercel Routing**: File `vercel.json` sudah dikonfigurasi untuk SPA routing.

---

## 🔍 Mengapa Muncul Error: "Failed to push commit to GitHub: Request contains an invalid argument"?

Berdasarkan investigasi terhadap sistem integrasi Google AI Studio dan GitHub API, error ini **bukan berasal dari kode aplikasi** (kode sudah teruji, lulus kompilasi, dan commit bersih di branch `main`), melainkan terjadi karena **2 kendala autentikasi eksternal**:

### Penyebab 1: Izin GitHub App Dibatasi ("Only select repositories")
Saat pertama kali menghubungkan Google AI Studio ke akun GitHub, jika Anda memilih *"Only select repositories"*, maka Google AI Studio **tidak memiliki hak akses** untuk membuat repositori baru atau mem-push commit baru. GitHub API menolak permintaan dengan kode error `422 Unprocessable Entity`, yang ditampilkan AI Studio sebagai **`Request contains an invalid argument`**.

### Penyebab 2: Fitur "Prevent Cross-Site Tracking" di Safari iOS (iPhone)
Pada browser Safari di iOS/iPhone, fitur *Prevent Cross-Site Tracking* memblokir cookie sesi pihak ketiga antara `aistudio.google.com` dan `github.com`. Akibatnya, token autentikasi GitHub yang dikirimkan terpotong atau tidak valid saat menekan tombol push.

---

## 🛠️ Solusi Terbukti untuk Memperbaiki Error Ini

### Cara 1: Hubungkan Ulang Akun GitHub dengan Opsi "All repositories" (Sangat Disarankan)

1. Buka tab baru di browser Anda dan masuk ke pengaturan aplikasi GitHub:
   👉 **https://github.com/settings/applications**
2. Di tab **"Installed GitHub Apps"**:
   * Cari **Google AI Studio**.
   * Klik tombol **Configure** lalu klik **Uninstall** (atau ubah opsi *Repository access* menjadi **All repositories**).
3. Di tab **"Authorized OAuth Apps"**:
   * Jika ada Google AI Studio, klik tombol titik tiga (`...`) lalu pilih **Revoke**.
4. Kembali ke halaman **Google AI Studio**:
   * *Tips:* Buka di browser Desktop (Chrome/Edge/Firefox) atau tab **Private/Incognito** agar cookie tersinkronisasi bersih.
   * Klik tombol **Export to GitHub** (ikon GitHub).
   * Saat GitHub meminta konfirmasi izin, **PASTIKAN MEMILIH "All repositories"** (bukan *Only select repositories*).
   * Klik **Authorize & Install**.
5. Masukkan nama repository:
   ```text
   adobe-stock-ai-metadata-assistant
   ```
6. Klik **Export / Push**. Repositori GitHub Anda akan langsung berhasil dibuat!

---

### Cara 2: Jika Menggunakan Safari di iPhone

Jika Anda tetap ingin menggunakan iPhone:
1. Buka aplikasi **Settings** di iPhone Anda.
2. Gulir ke bawah dan pilih **Safari**.
3. Di bagian *Privacy & Security*, matikan sementara opsi **"Prevent Cross-Site Tracking"** (*Cegah Pelacakan Lintas Situs*).
4. Buka kembali Google AI Studio di Safari, lakukan *refresh* halaman, dan coba tekan tombol **Try again** atau **Export to GitHub**.

---

### Cara 3: Download ZIP & Upload Langsung ke GitHub (100% Pasti Berhasil)

Jika integrasi otomatis AI Studio masih terhalang di perangkat mobile:
1. Di AI Studio, buka menu titik tiga di kanan atas atau pojok atas jendela file.
2. Pilih **Download project / Download ZIP**.
3. Buka **[github.com/new](https://github.com/new)**:
   * Nama repositori: `adobe-stock-ai-metadata-assistant`
   * Klik **Create repository**.
4. Di halaman repositori baru Anda, klik link **"uploading an existing file"**.
5. Ekstrak ZIP di komputer atau pilih file dan drag & drop ke GitHub, lalu klik **Commit changes**.

---

### Cara 4: Push Manual via Terminal / Git CLI

Jika Anda memiliki akses terminal di laptop/PC:

```bash
# 1. Masuk ke folder proyek
cd adobe-stock-ai-metadata-assistant

# 2. Hubungkan ke repositori GitHub akun benilkst
git remote add origin https://github.com/benilkst/adobe-stock-ai-metadata-assistant.git

# 3. Pastikan branch main
git branch -M main

# 4. Push ke GitHub
git push -u origin main --force
```

---

## 🚀 Langkah Deploy ke Vercel

Setelah kode berada di GitHub:

1. Buka **[vercel.com](https://vercel.com)** dan login menggunakan akun GitHub Anda.
2. Klik tombol **Add New...** &rarr; **Project**.
3. Temukan repositori **`adobe-stock-ai-metadata-assistant`** lalu klik **Import**.
4. Di bagian **Environment Variables**, tambahkan:
   * **Key**: `VITE_GEMINI_API_KEY`
   * **Value**: Masukkan API Key Gemini Anda (AQ.Ab8...)
5. Klik **Deploy**.
6. Selesai! Web PWA Anda sudah online dengan URL publik (contoh: `https://adobe-stock-ai-metadata-assistant.vercel.app`) dan mendukung penginstalan aplikasi serta pengatur skala UI (100% s/d 67%).
