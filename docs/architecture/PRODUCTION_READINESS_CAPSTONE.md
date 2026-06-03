# Production Readiness Capstone Checklist

Dokumen ini merangkum audit kesiapan produksi untuk kebutuhan **project capstone / demo evaluator**, bukan untuk trafik publik skala internet.

## Target Kesiapan
Aplikasi dianggap siap demo jika:
- frontend build dan navigasi inti stabil
- backend dapat start dengan `.env` lokal yang benar
- AIEngine dapat menjawab `/health` dan `/predict/web`
- alur analisis end-to-end berjalan
- env template aman dan cukup lengkap
- error utama tampil ramah pengguna

---

## 1. Service Topology

### Frontend
- Folder: `WebApplication/frontend-react`
- Stack: React + Vite + React Router + Axios + Framer Motion
- Variabel utama: `VITE_API_BASE_URL`

### Backend
- Folder: `WebApplication/backend-express`
- Stack: Express + PostgreSQL + JWT + rate limiting
- Variabel utama:
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - `JWT_SECRET`, `JWT_EXPIRES_IN`
  - `AI_CAREER_MATCH_URL`
  - `CORS_ORIGINS`, `FRONTEND_URL`

### AIEngine
- Folder: `AIEngine`
- Stack: FastAPI + TensorFlow/Keras
- Endpoint penting:
  - `GET /health`
  - `GET /genai/health`
  - `POST /predict/web`
- Artefak model:
  - `AIEngine/models/registry/career-match/v1/`

---

## 2. Temuan Audit Penting

### Sudah terverifikasi ada
- Backend source tersedia di `WebApplication/backend-express/src/...`
- AIEngine source tersedia di `AIEngine/services/career-match/src/career_match/...`
- Shared contract tersedia di `AIEngine/shared/schemas/career_match_contract.json`
- Model artifact tersedia di `AIEngine/models/registry/career-match/v1/...`

### Risiko utama
1. **Build/test command belum semuanya sempat diverifikasi otomatis** dari sesi ini karena permission classifier terminal sempat menolak eksekusi command tertentu.
2. **`.env` lokal mengandung credential sensitif** walaupun saat dicek tidak sedang ter-track git.
3. **Ketergantungan demo pada AIEngine lokal** berarti backend dan frontend tidak cukup tanpa service AI aktif.
4. **GenAI summary opsional** — demo harus tetap aman saat `GENAI_API_KEY` kosong dan `use_genai=false`.

---

## 3. Fix yang Sudah Dilakukan di Audit Ini

### Env & dokumentasi
- Memperjelas `WebApplication/backend-express/.env.example`
- Memperjelas `AIEngine/.env.example`
- Menambahkan quick demo setup di root `README.md`
- Menyesuaikan `WebApplication/README.md`
- Menambahkan catatan keamanan/deploy pada `AIEngine/README.md`

### Backend safety
- Rate limiter disesuaikan memakai `ipKeyGenerator` untuk menghindari masalah IPv6 pada `WebApplication/backend-express/src/middleware/rateLimit.js`

### Frontend stability/polish
- Route protection tetap aktif di `WebApplication/frontend-react/src/App.jsx`
- Accordion “Kenapa hasil ini muncul?” dibuat lebih terlihat dan default terbuka di `WebApplication/frontend-react/src/pages/AnalisisResultPage.jsx`
- Reusable UI primitives sudah ditambahkan untuk konsistensi komponen

---

## 4. Verifikasi Manual yang Wajib Dilakukan Sebelum Demo

### Frontend
Jalankan dari folder `WebApplication/frontend-react`:

```bash
npm install
npm run lint
npm run build
npm run dev
```

Checklist:
- landing page tampil normal
- sign in / sign up tidak error
- protected route redirect bekerja
- analisis result page render normal
- history/detail history tidak blank

### Backend
Jalankan dari folder `WebApplication/backend-express`:

```bash
npm install
npm test
npm run lint
npm start
```

Checklist:
- tidak ada error startup
- tidak ada warning rate limiter IPv6
- auth route bisa dipanggil
- analysis route bisa dipanggil
- koneksi ke AIEngine berhasil

### AIEngine
Jalankan dari folder `AIEngine`:

```bash
python -m pip install -r requirements.txt
python tests/integration/smoke_inference.py
uvicorn career_match.app:app --app-dir services/career-match/src --host 127.0.0.1 --port 8001
```

Checklist:
- `/health` return OK atau `model_not_found` yang valid
- `/predict/web` mengembalikan response schema yang sesuai
- `GENAI_API_KEY` kosong tidak menyebabkan crash selama `use_genai=false`

---

## 5. Urutan Menjalankan Full Stack Demo

1. Jalankan **AIEngine** di port `8001`
2. Jalankan **backend-express** di port `3000`
3. Jalankan **frontend-react** di port `5173`
4. Login
5. Isi form analisis
6. Submit analisis
7. Verifikasi result page
8. Verifikasi riwayat analisis

---

## 6. Catatan Secret Hygiene

Pastikan:
- file `.env` lokal tidak pernah di-commit
- `GENAI_API_KEY`, SMTP password, DB password, JWT secret disimpan hanya lokal / deployment secret manager
- jika key nyata pernah terekspos di luar tim, lakukan rotasi

---

## 7. Status Kelayakan Capstone

**Layak untuk capstone/demo setelah seluruh verifikasi manual lulus.**

Belum cukup untuk dianggap public-production-grade karena belum meng-cover:
- CI/CD penuh
- observability/log aggregation
- hardening public threat model
- backup/recovery strategy
- automated deployment verification

Namun untuk konteks penilaian capstone, fokus utama adalah kestabilan run/build, integrasi end-to-end, env setup yang rapi, dan error handling yang tidak merusak demo.
