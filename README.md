# Adobe Stock AI Metadata Assistant (Chrome Extension)

> **AI-powered metadata optimization for stock creators**  
> *Designed specifically for Adobe Stock Contributors submitting photos, generative AI assets, 3D renders, and stock footage.*

---

## 1. System Architecture

The extension follows a strictly modular pipeline to guarantee high-relevance metadata, eliminating hallucination, keyword stuffing, and IP risks:

```
ASSET (Image / Short Video)
        ↓
VISUAL ANALYSIS (Multi-stage breakdown)
        ↓
STRUCTURED VISUAL DATA (JSON representation)
        ↓
METADATA GENERATION (Title formula + concise description)
        ↓
KEYWORD RANKING & GROUPING (#1–10 Essential, #11–35 Supporting)
        ↓
COMPLIANCE & IP GUARD (Artist, brand, trademark & AI disclosure)
        ↓
QUALITY SCORING (Objective 0–100 score + actionable warnings)
        ↓
HUMAN REVIEW & DRAG-AND-DROP REORDER
        ↓
COPY / EXPORT (Single-click copy, CSV, TXT, JSON)
```

---

## 2. Project File Tree

```
adobe-stock-ai-assistant/
├── public/
│   ├── manifest.json            # Chrome Extension Manifest V3 configuration
│   └── icons/
│       ├── icon16.png           # 16x16 extension toolbar icon
│       ├── icon32.png           # 32x32 extension retina icon
│       ├── icon48.png           # 48x48 extensions management icon
│       ├── icon128.png          # 128x128 Chrome Web Store icon
│       └── icon32.svg           # High-resolution vector preview icon
├── src/
│   ├── ai/
│   │   ├── AIProvider.ts        # Modular AI provider abstraction interface
│   │   ├── GeminiProvider.ts    # Gemini Vision API provider implementation (Phase 2)
│   │   └── prompts/             # Standardized factual prompts (Phase 2)
│   ├── analysis/                # Image and video frame extraction (Phase 2 & 6)
│   ├── metadata/                # Title formulas, ranking, and validation (Phases 3-4)
│   ├── compliance/              # Strict IP and trademark rules (Phase 4)
│   ├── storage/
│   │   └── storageService.ts    # Universal storage (chrome.storage.local + localStorage fallback)
│   ├── types/
│   │   └── index.ts             # Complete TypeScript definitions for all phases
│   ├── popup/
│   │   ├── components/
│   │   │   ├── Header.tsx       # Brand header, model status, and view toggles
│   │   │   ├── AssetUpload.tsx  # Drag & drop asset uploader with instant test samples
│   │   │   ├── AssetPreview.tsx # Media viewer, resolution, aspect ratio, duration specs
│   │   │   ├── SettingsModal.tsx# Gemini API key, model selection, keyword count target
│   │   │   └── HistoryDrawer.tsx# Recent assets drawer
│   │   └── App.tsx
│   ├── utils/
│   │   ├── fileHelpers.ts       # Format checks, dimension & aspect ratio calculator
│   │   └── formatters.ts
│   ├── App.tsx                  # Root application controller
│   ├── index.css                # Tailwind styling & dark theme
│   └── main.tsx                 # React DOM mount point
├── manifest.json                # Root manifest reference
├── index.html                   # HTML entry point & extension popup DOM
├── package.json                 # Dependencies and build scripts
├── tsconfig.json                # TypeScript compilation config
├── vite.config.ts               # Vite build and asset bundler configuration
├── .env.example                 # Environment configuration template
└── README.md                    # Project documentation
```

---

## 3. Chrome Extension Manifest V3

The extension uses **Manifest V3**:
* `manifest_version: 3`
* Action default popup pointing to `index.html`
* Clean permissions: `storage` (local settings and history cache)
* Direct local asset processing without unnecessary external scraping

---

## 4. Installation & Build Instructions

### Prerequisites
* Node.js 18+ or 20+
* npm or pnpm

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Development Mode
To view and interact with the extension in the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. You can toggle between **Extension Popup Frame Mode** (420px fixed) and **Expanded Canvas Mode** using the device icon in the top right.

### Step 3: Build Chrome Extension
To compile the production-ready unpacked extension:
```bash
npm run build
```
This generates the self-contained `dist/` directory containing `manifest.json`, bundled assets, and HTML.

---

## 5. Loading Unpacked in Google Chrome

1. Open Google Chrome.
2. In the address bar, navigate to `chrome://extensions/`.
3. In the top-right corner, toggle **Developer mode** to **ON**.
4. Click the **Load unpacked** button in the top-left toolbar.
5. In the file dialog, select the **`dist`** folder from this project directory.
6. The extension **"Adobe Stock AI Metadata Assistant"** will appear in your extension list!
7. Pin the extension to your Chrome toolbar by clicking the puzzle piece icon.
8. Click the extension icon anytime to open the popup.

---

## 6. Packaging for Chrome Web Store Distribution

To create a single `.zip` file for Chrome Web Store Developer Dashboard upload:

```bash
npm run package
```

This compiles the project and generates `adobe-stock-ai-metadata-assistant.zip` in the root directory containing all necessary Manifest V3 assets, html, and icons.

---

## 7. Deploying as a Web App to Vercel

Aplikasi ini dapat dijalankan baik sebagai **Chrome Extension** maupun sebagai **Web Application (SaaS/Web Tool)** yang di-host di Vercel.

Konfigurasi `vercel.json` telah disiapkan di root project.

### Cara 1: Menggunakan Vercel Dashboard (Rekomendasi / Termudah)
1. Push repository proyek ini ke **GitHub**, **GitLab**, atau **Bitbucket**.
2. Buka dashboard [Vercel](https://vercel.com) dan login/daftar.
3. Klik **"Add New..."** lalu pilih **"Project"**.
4. Import repositori git proyek ini.
5. Vercel akan otomatis mendeteksi:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Buka bagian **"Environment Variables"** lalu tambahkan:
   - **Name**: `VITE_GEMINI_API_KEY`
   - **Value**: Masukkan API key Gemini Anda.
   *(Catatan: Pengguna di web juga bisa langsung memasukkan API key mereka melalui ikon Pengaturan (Settings) di aplikasi).*
7. Klik **"Deploy"**. Dalam ~1 menit aplikasi web Anda aktif di URL publik (contoh: `https://your-project.vercel.app`).

### Cara 2: Menggunakan Vercel CLI dari Terminal
1. Install Vercel CLI jika belum ada:
   ```bash
   npm i -g vercel
   ```
2. Jalankan perintah deploy di root folder:
   ```bash
   vercel
   ```
3. Ikuti prompt interaktif untuk setup project.
4. Untuk deploy ke production:
   ```bash
   vercel --prod
   ```

---

## 8. Master Roadmap Verification Checklist (Phases 1–7 Complete)

- [x] **PHASE 1: Project Setup & Manifest V3**: React 19, TypeScript, Vite, Tailwind CSS, Manifest V3 (`public/manifest.json`), 16/32/48/128px icons, drag-and-drop asset uploader with image/video resolution & aspect ratio inspection.
- [x] **PHASE 2: Gemini Provider & Structured Visual Analysis**: Modular `AIProvider` abstraction, Gemini 3.8 Flash Vision, structured JSON schema (`primarySubject`, `actions`, `environment`, `visualStyle`, `concepts`, `generativeAIIndicators`, confidence scores).
- [x] **PHASE 3: Stock Metadata Generation**: Strict Subject + Action + Context title formula (no promotional words, no clickbait, no 4K/8K), concise 1-2 sentence description, 20-35 target keywords, Adobe Stock official category mapping.
- [x] **PHASE 4: Keyword Classification, IP Guard & Quality Scorer**: Keyword ranking (#1-10 essential, #11-35 supporting), classified keyword groups (Primary, Action, Environment, Concept, Style), trademark & copyright database validator, 0-100 quality scoring engine with actionable warnings.
- [x] **PHASE 5: Human Review & Export Tools**: Interactive drag-and-drop keyword reordering, quick arrow re-ranking, single-click copy buttons, multi-format export (Adobe Stock CSV, TXT, JSON), Generative AI disclosure toggle.
- [x] **PHASE 6: Multi-Frame Video Analysis**: HTML5 Canvas multi-frame sampler (0%, 25%, 50%, 75%, 100%), temporal synthesis for movement, camera pan, and state transition descriptions.
- [x] **PHASE 7: Final Polish & Resilient Error Handling**: Zero-crash fallback engine that synthesizes compliant metadata even during network or quota hiccups, seamless offline demo samples, and automated zip packager (`npm run package`).
- [x] **PHASE 8: PWA & Customizable UI Scaling**: Full Progressive Web App (PWA) support with service worker auto-update, offline caching, in-app install buttons (Chromium, Desktop, Android, iOS Safari), maskable/apple-touch icons, and a 5-step UI scale zoom selector (100%, 90%, 80%, 70%, 67%).

---

## 9. Progressive Web App (PWA) & Skala UI (Zoom 100%, 90%, 80%, 70%, 67%)

Aplikasi ini kini telah dilengkapi dengan kemampuan **Progressive Web App (PWA)** dan **Skala UI Adaptif**:

### Fitur PWA
- **Install App Langsung dari UI**: Tombol instalasi hadir di navbar atas (Chrome/Edge/Desktop/Android otomatis membuka install prompt, iOS Safari menyediakan panduan visual *Share &rarr; Add to Home Screen*).
- **Offline Capable**: Didukung Service Worker (`workbox`) untuk caching aset & runtime offline indicator.
- **Ikon Standar PWA**: Termasuk `pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png` (safe zone padding), dan `apple-touch-icon.png` (180x180).
- **Manifest Ganda yang Kompatibel**: File `manifest.json` tetap melayani mode Chrome Extension MV3, sedangkan `manifest.webmanifest` melayani browser web & instalasi PWA tanpa benturan.

### Pengaturan Skala UI (Zoom Presets)
Pengguna dapat memilih kerapatan tampilan antarmuka secara instan dari dropdown di Header atau melalui Settings:
1. **100%**: Skala standar / normal.
2. **90%**: Kompak, ideal untuk laptop 13–14 inci.
3. **80%**: Padat, menampilkan lebih banyak panel kata kunci sekaligus.
4. **70%**: Mikro, efisien untuk meninjau metadata dalam jumlah besar.
5. **67%**: Skala 2/3 (dua pertiga), sangat ideal bagi kontributor stok yang membuka dua jendela browser berdampingan (*split-screen/side-by-side*).

Pilihan skala UI otomatis disimpan di penyimpanan lokal sehingga tetap aktif saat halaman dimuat ulang.

