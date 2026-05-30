# CakapKarier-AI

Monorepo untuk sistem rekomendasi karier dan analisis readiness score berbasis kecerdasan buatan.

---

## 🛠️ Sistem Arsitektur & Teknologi Utama

Sistem ini dibangun menggunakan arsitektur **microservices-oriented monorepo** yang memisahkan ranah data science, inference engine, dan web platform secara modular.

```text
CakapKarier-AI/
├── ResearchData/         # Data Science & Exploratory Data Analysis (EDA)
├── AIEngine/             # AI Inference Service (FastAPI & TensorFlow Functional API)
└── WebApplication/       
    ├── backend-express/  # Core Web API (Node.js/Express, PostgreSQL, JWT Auth)
    └── frontend-react/   # Client Application (React, Vite, TailwindCSS)
```

### Stack Teknologi Aktif:
*   **Frontend**: React (Vite), TailwindCSS, Axios
*   **Backend**: Node.js, Express, PostgreSQL (node-postgres), Helmet, JWT
*   **AI Engine**: Python 3.12, FastAPI, TensorFlow (Functional API), Uvicorn, OpenRouter API
*   **DevOps & Infrastruktur**: Nginx (Reverse Proxy), PM2 (Process Manager), Azure Virtual Machines, Vercel

---

## 🎯 Fokus & Struktur Tata Kelola Monorepo

Struktur repositori ini dirancang khusus untuk memenuhi standar tata kelola proyek tingkat capstone:

1.  **Modularitas Kode (Separation of Concerns)**: Setiap komponen (Data Science, AI Engine, Backend, Frontend) diisolasi dalam direktori khusus demi menghindari konflik dependensi.
2.  **Integrasi Lintas Tim**: Menjamin keselarasan kontrak data lewat spesifikasi skema JSON yang terdokumentasi di `docs/architecture/CAREER_MATCH_DATA_FLOW_CONTRACT.md`.
3.  **Onboarding Efisien**: Memudahkan asisten, penguji, atau pengembang baru untuk memahami seluruh siklus hidup aplikasi (end-to-end data flow) langsung dalam satu tempat.

---

## ☁️ Panduan Deployment & Verifikasi (Production-Ready)

Arsitektur produksi sistem menggunakan topologi **Vercel + Single Azure VM (Standard_B2s)** untuk efisiensi biaya dan optimasi performa backend:

*   📘 **[Panduan Deployment Aktual (Azure VM)](docs/architecture/DEPLOYMENT_AZURE_VM.md)** — **(Gunakan Dokumen Ini)**
*   🚦 **[Checklist Kesiapan Produksi (Capstone)](docs/architecture/PRODUCTION_READINESS_CAPSTONE.md)**
*   🗄️ **[Arsip Konteks & Dokumentasi Lama](docs/archive/)**

---

## ⚡ Setup Pengembangan Lokal (Quick Start)

Untuk menjalankan seluruh lingkungan pengembangan di laptop lokal secara aman, ikuti urutan berikut:

### 1. AI Engine (FastAPI) — `Port 8001`
*Pastikan file `.env` di direktori `AIEngine/` telah dikonfigurasi.*
```bash
cd AIEngine
python -m venv venv
source venv/bin/activate # Di Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn career_match.app:app --app-dir services/career-match/src --host 127.0.0.1 --port 8001
```

### 2. Backend Express API — `Port 3000`
*Pastikan telah mengonfigurasi `.env` pada direktori `backend-express` beserta koneksi database PostgreSQL.*
```bash
cd WebApplication/backend-express
npm install
npm run dev
```

### 3. Frontend React (Vite) — `Port 5173`
*Pastikan `VITE_API_BASE_URL` mengarah ke backend API port lokal (`http://localhost:3000/api`).*
```bash
cd WebApplication/frontend-react
npm install
npm run dev
```

---

## 👥 Alur Kerja Kolaboratif (Workflow)

Branching model disederhanakan untuk mempercepat integrasi selama fase demo:

*   **Branch `main`**: Hanya menyimpan kode stabil yang siap digunakan untuk demo/produksi.
*   **Branch `feature/<nama-fitur>`**: Branch harian untuk pengembangan fitur atau perbaikan bug secara terisolasi.
*   **Review & Merge**: Modifikasi yang memengaruhi area tim lain (kontrak API/skema model AI) **wajib** melalui Pull Request dan minimal satu tahap *code review* demi menjaga integritas sistem.

---
*CakapKarier-AI — Capstone Project & Production Sandbox Environment (2026)*
