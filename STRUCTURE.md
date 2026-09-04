# 🏛️ CakapKarier-AI — Monorepo Architecture & Repository Structure

```text
CakapKarier-AI/
├── 🧠 AIEngine/                                # AI & Machine Learning Microservice (FastAPI & TensorFlow)
│   ├── data/                                  # Siklus dataset (raw -> interim -> processed)
│   │   ├── raw/                               # all_data_final.csv, Data_Dictionary.csv
│   │   └── processed/career-match-v1/         # jobs_processed.csv, data_dictionary.md
│   ├── models/registry/career-match/v1/       # Model registry terlatih (.keras, SavedModel, TensorBoard)
│   ├── pipelines/                             # Pipeline pemrosesan data & pelatihan model
│   │   ├── preprocess_jobs.py                 # Pipeline data cleaning, deduplikasi, & feature extraction
│   │   └── train_model.py                     # Custom training loop (GradientTape) & evaluasi
│   ├── services/career-match/src/             # Source code inti inferensi AI (career_match package)
│   │   └── career_match/                      
│   │       ├── app.py                         # FastAPI application entrypoint & API endpoints
│   │       ├── modeling.py                    # Arsitektur Keras Functional API & Custom Layers/Loss
│   │       ├── inference.py                   # Engine prediksi kesesuaian karier & gap analysis
│   │       ├── preprocessing.py               # Vektorisasi teks & ekstraksi 8 fitur numerik
│   │       ├── genai.py                       # Integrasi LLM (Gemini/OpenRouter) + Deterministic Fallback
│   │       └── schemas.py                     # Pydantic v2 data validation schemas
│   ├── shared/schemas/                        # Kontrak data terstandarisasi lintas servis
│   ├── tests/integration/                     # Pengujian integrasi & smoke inference test
│   ├── requirements.txt                       # Dependensi pustaka Python AI Engine
│   └── .env.example                           # Konfigurasi environment AI Engine
│
├── 🌐 WebApplication/                         # Web Application Platform (Frontend & Backend)
│   ├── ⚙️ backend-express/                    # API Gateway & Core Business Logic (Node.js & Express 5)
│   │   ├── src/
│   │   │   ├── config/                        # Enkapsulasi konfigurasi & validasi environment
│   │   │   ├── controllers/                   # Lapisan HTTP Request/Response Handler (Auth, User, Analysis)
│   │   │   ├── database/                      # Pool koneksi basis data relasional PostgreSQL (pg)
│   │   │   ├── docs/                          # Spesifikasi OpenAPI 3.0.3 & Swagger UI (/api-docs)
│   │   │   ├── middleware/                    # Middleware: Auth JWT, Rate Limiting, Zod Validate, Error Handler
│   │   │   ├── repositories/                  # Data Access Object (DAO) & parameterized SQL queries
│   │   │   ├── routes/                        # Definisi rute REST API (auth.routes, user.routes, analysis.routes)
│   │   │   ├── services/                      # Logika bisnis inti, orkestrasi AI, & layanan email SMTP
│   │   │   ├── utils/                         # Custom error handler (AppError) & fungsi normalisasi
│   │   │   ├── validations/                   # Skema validasi data masukan ketat berbasis Zod
│   │   │   └── index.js                       # Server entrypoint & bootstrapping Express app
│   │   ├── package.json                       # Dependensi & script backend Node.js
│   │   └── .env.example                       # Konfigurasi environment backend
│   │
│   └── 💻 frontend-react/                     # Client Single Page Application (React 19, Vite, Tailwind v4)
│       ├── src/
│       │   ├── assets/                        # Logo, vektor, dan aset visual aplikasi
│       │   ├── components/                    # Komponen UI modular (Navbar, Footer, Modal, Card)
│       │   ├── pages/                         # 11 Halaman aplikasi (Landing, Auth, Analisis, History, Profil)
│       │   │   ├── LandingPage.jsx            # Beranda & pengenalan platform
│       │   │   ├── SignUp.jsx & SignIn.jsx    # Autentikasi pendaftaran & masuk akun
│       │   │   ├── AnalisisPage.jsx           # Formulir asesmen interaktif bertahap (multi-step stepper)
│       │   │   ├── AnalisisResultPage.jsx     # Dasbor visualisasi skor kesiapan, gap skill, & roadmap
│       │   │   ├── HistoryPage.jsx            # Dasbor riwayat pengujian & tren perkembangan metrik
│       │   │   ├── ProfilPage.jsx & Edit.jsx  # Pengelolaan profil & identitas pengguna
│       │   │   └── ForgetPassword & Reset.jsx # Alur pemulihan kata sandi via token email
│       │   ├── utils/                         # Axios client (interceptor), Auth store, & Framer Motion variants
│       │   ├── App.jsx                        # Rute aplikasi & Protected Route Wrapper
│       │   ├── index.css                      # Styling global Tailwind CSS v4
│       │   └── main.jsx                       # React DOM entrypoint
│       ├── package.json                       # Dependensi & script frontend React
│       └── vite.config.js                     # Konfigurasi build tool Vite
│
├── 🗄️ infrastructure/                         # Manajemen Basis Data & Orkestrasi Infrastruktur
│   └── database/
│       ├── migrations/                        # Skrip DDL SQL migrasi skema tabel terversi (001 - 007)
│       │   ├── 001_create_users_table.sql
│       │   ├── 002_create_profiles_table.sql
│       │   ├── 003_create_career_analysis_results_table.sql
│       │   ├── 006_create_password_reset_tokens_table.sql
│       │   └── 007_enforce_case_insensitive_user_email.sql
│       └── migrate.js                         # Runner migrasi otomatis berbasis transaksi SQL
│
├── 📊 ResearchData/                           # Modul Penelitian Data Science & Streamlit Dashboard
│   ├── dashboard/                             # Streamlit web application untuk exploratory data analysis
│   └── docs/                                  # Data contract, data dictionary, & business questions
│
├── 🔬 DataScientist/                          # Eksplorasi dataset, jupyter notebooks, & eksperimen model
│
├── 📚 docs/                                   # Dokumentasi Arsitektur, Kontrak Data, & SOP Tim
│   └── architecture/                          # Kontrak aliran data (Data Flow), ERD, & Panduan VM Azure
│
├── 🐳 compose.yaml                            # Orkestrasi Docker container PostgreSQL 16 Alpine lokal
├── 📦 package.json                            # Root Monorepo configuration (NPM Workspaces)
└── 📄 README.md                               # Panduan teknis utama & dokumentasi onboarding repositori
```

---

### 🧩 Ringkasan Ekosistem & Stack Teknologi Terintegrasi

| Lapisan Sistem | Teknologi Utama | Peran & Tanggung Jawab Teknis |
|:---|:---|:---|
| **Frontend Client** | React 19, Vite, Tailwind CSS v4, Framer Motion | Antarmuka pengguna responsif (SPA), manajemen sesi lokal, visualisasi hasil asesmen |
| **Backend Gateway** | Node.js (ESM), Express.js v5, Zod, JWT, Helmet | API Gateway, autentikasi & otorisasi, sanitasi masukan, orkestrasi data AI |
| **AI Inference Engine** | Python 3.12, FastAPI, TensorFlow/Keras, Uvicorn | Komputasi prediksi kecocokan karier, kalkulasi kesenjangan skill (*skill gap*), roadmap |
| **Generative AI** | Google Gemini API (`gemini-2.5-flash-lite`) / OpenRouter | Pengayaan saran dan rekomendasi karier personalisasi berbasis LLM |
| **Basis Data Relasional** | PostgreSQL 16 (UUID v4, JSONB Payload) | Penyimpanan data pengguna, profil, token pemulihan, dan arsip riwayat analisis |
| **Infrastruktur Cloud** | Vercel (Frontend), Azure VM Ubuntu (Backend/AI/DB) | Topologi produksi *hybrid cloud* diorkestrasi Nginx Reverse Proxy (SSL) & PM2 |
