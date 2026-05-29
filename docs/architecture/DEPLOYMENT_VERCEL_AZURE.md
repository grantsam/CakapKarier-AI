# Deployment Guide: Frontend Vercel + Backend & AIEngine Azure

Panduan ini menjelaskan deployment CakapKarier-AI untuk kebutuhan capstone/demo production-ready:

- **Frontend React**: Vercel
- **Backend Express API**: Azure App Service
- **AIEngine Career Match API**: Azure App Service terpisah
- **Database PostgreSQL**: Azure Database for PostgreSQL atau PostgreSQL lain yang dapat diakses backend

> Catatan: Panduan ini ditujukan untuk deployment demo/capstone, bukan public-scale production hardening.

---

## 1. Arsitektur Deployment

```text
User Browser
   |
   v
Vercel Frontend
   |
   | VITE_API_BASE_URL
   v
Azure App Service - Backend Express
   |
   | AI_CAREER_MATCH_URL
   v
Azure App Service - AIEngine FastAPI
   |
   v
Model artifacts di AIEngine/models/registry/career-match/v1

Backend Express
   |
   v
Azure PostgreSQL / External PostgreSQL
```

### Service URL contoh

```text
Frontend Vercel:
https://cakapkarier-ai.vercel.app

Backend Azure:
https://cakapkarier-backend.azurewebsites.net

AIEngine Azure:
https://cakapkarier-ai-engine.azurewebsites.net
```

Sesuaikan nama domain dengan nama service deployment Anda.

---

## 2. Persiapan Umum

Pastikan sebelum deploy:

```bash
npm run build --prefix WebApplication/frontend-react
npm test --prefix WebApplication/backend-express
```

Dan untuk AIEngine:

```bash
cd AIEngine
.\venv\Scripts\activate
python tests/integration/smoke_inference.py
```

Pastikan file `.env` lokal **tidak di-commit**.

---

## 3. Deploy Frontend React ke Vercel

### 3.1 Root Directory

Saat membuat project di Vercel, set:

```text
Root Directory: WebApplication/frontend-react
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3.2 Environment Variable Vercel

Tambahkan environment variable berikut di dashboard Vercel:

```env
VITE_API_BASE_URL=https://cakapkarier-backend.azurewebsites.net/api
```

Ganti URL backend sesuai Azure App Service backend Anda.

### 3.3 Deploy

Jika memakai GitHub integration:

1. Import repository ke Vercel.
2. Pilih root directory `WebApplication/frontend-react`.
3. Isi env var `VITE_API_BASE_URL`.
4. Deploy.

Jika deploy via CLI:

```bash
cd WebApplication/frontend-react
vercel
vercel --prod
```

---

## 4. Deploy Backend Express ke Azure App Service

### 4.1 Azure Resource

Buat Azure App Service untuk backend:

```text
Runtime stack: Node.js 20 LTS atau lebih baru
OS: Linux direkomendasikan
Startup command: npm start
```

Root aplikasi backend adalah:

```text
WebApplication/backend-express
```

### 4.2 Environment Variables Backend

Set environment variables berikut di Azure App Service Configuration:

```env
NODE_ENV=production
PORT=8080
TRUST_PROXY=true
API_DOCS_ENABLED=false
DEBUG_ERRORS=false
JSON_BODY_LIMIT=256kb

FRONTEND_URL=https://cakapkarier-ai.vercel.app
CORS_ORIGINS=https://cakapkarier-ai.vercel.app

JWT_SECRET=replace_with_very_long_random_secret_min_32_chars
JWT_EXPIRES_IN=1h

DB_HOST=your-postgres-host.postgres.database.azure.com
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=cakapkarier_db
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
DB_SSL_CA=

AI_CAREER_MATCH_URL=https://cakapkarier-ai-engine.azurewebsites.net
AI_REQUEST_TIMEOUT_MS=30000

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM="CakapKarier AI <no-reply@example.com>"
PASSWORD_RESET_TOKEN_EXPIRES_MINUTES=30
```

> Jika fitur forgot/reset password tidak dipakai saat demo, SMTP tetap boleh dikosongkan, tetapi endpoint forgot password akan gagal bila dipanggil karena backend memerlukan SMTP untuk mengirim email.

### 4.3 Database PostgreSQL

Backend membutuhkan PostgreSQL. Pastikan:

- Database sudah dibuat.
- Tabel sudah dimigrasi/dibuat sesuai kebutuhan aplikasi.
- Azure App Service backend diizinkan mengakses database.
- SSL database sesuai dengan setting `DB_SSL`.

Jika memakai Azure Database for PostgreSQL, umumnya gunakan:

```env
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
```

Jika koneksi SSL bermasalah saat demo, untuk sementara bisa gunakan:

```env
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

Namun untuk deployment yang lebih aman, gunakan CA certificate yang benar.

### 4.4 Deploy Backend

Opsi umum:

#### Opsi A: GitHub Deployment Center

1. Buka Azure App Service backend.
2. Masuk ke **Deployment Center**.
3. Hubungkan repository GitHub.
4. Set working directory ke:

```text
WebApplication/backend-express
```

5. Deploy.

#### Opsi B: Azure CLI Zip Deploy

Dari folder backend:

```bash
cd WebApplication/backend-express
npm install --omit=dev
az webapp up --name cakapkarier-backend --resource-group <resource-group> --runtime "NODE:20-lts"
```

Atau gunakan zip deploy sesuai workflow Azure Anda.

### 4.5 Backend Smoke Test

Setelah deploy, cek:

```bash
curl https://cakapkarier-backend.azurewebsites.net/health
```

Cek root:

```bash
curl https://cakapkarier-backend.azurewebsites.net/
```

Jika API docs diaktifkan sementara:

```bash
curl https://cakapkarier-backend.azurewebsites.net/api-docs.json
```

---

## 5. Deploy AIEngine FastAPI ke Azure App Service

### 5.1 Azure Resource

Buat Azure App Service terpisah untuk AIEngine:

```text
Runtime stack: Python 3.11 atau 3.12
OS: Linux direkomendasikan
Startup command:
uvicorn career_match.app:app --app-dir services/career-match/src --host 0.0.0.0 --port 8000
```

> Azure App Service umumnya meneruskan traffic ke port yang ditentukan platform. Jika Azure menyediakan env `PORT`, gunakan startup command yang membaca port tersebut bila diperlukan.

Alternatif startup command:

```bash
python -m uvicorn career_match.app:app --app-dir services/career-match/src --host 0.0.0.0 --port 8000
```

### 5.2 Root Directory

Root deployment AIEngine:

```text
AIEngine
```

Pastikan file berikut ikut ter-deploy:

```text
requirements.txt
services/career-match/src/career_match/app.py
services/career-match/src/career_match/inference.py
services/career-match/src/career_match/schemas.py
models/registry/career-match/v1/
```

AIEngine membutuhkan model artifacts di:

```text
AIEngine/models/registry/career-match/v1/
```

Jika model artifact terlalu besar untuk deployment Git biasa, gunakan salah satu opsi:

1. Upload artifact sebagai bagian dari release/deploy package.
2. Simpan artifact di Azure Blob Storage lalu download saat startup.
3. Gunakan container image agar artifact sudah termasuk di image.

Untuk capstone, opsi paling sederhana adalah memastikan folder `models/registry/career-match/v1/` ikut dalam deployment package.

### 5.3 Environment Variables AIEngine

Set di Azure App Service AIEngine:

```env
GENAI_PROVIDER=gemini
GENAI_API_URL=https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
GENAI_MODEL=gemini-2.5-flash-lite
GENAI_TIMEOUT_SECONDS=8
GENAI_MAX_RETRIES=1
GENAI_API_KEY=replace_with_google_ai_studio_key_if_genai_enabled
```

Jika tidak ingin memakai GenAI summary saat demo, boleh kosongkan:

```env
GENAI_API_KEY=
```

Pastikan backend/frontend mengirim:

```json
{"use_genai": false}
```

atau biarkan default `false`.

Opsional jika path model perlu dioverride:

```env
CAKAP_MODEL_DIR=/home/site/wwwroot/models/registry/career-match/v1
```

### 5.4 Deploy AIEngine

#### Opsi A: GitHub Deployment Center

1. Buka Azure App Service AIEngine.
2. Hubungkan repository.
3. Set working directory ke:

```text
AIEngine
```

4. Pastikan Azure menjalankan:

```bash
pip install -r requirements.txt
```

5. Set startup command seperti di atas.

#### Opsi B: Azure CLI

```bash
cd AIEngine
az webapp up --name cakapkarier-ai-engine --resource-group <resource-group> --runtime "PYTHON:3.11"
```

Lalu set startup command di Configuration.

### 5.5 AIEngine Smoke Test

Setelah deploy:

```bash
curl https://cakapkarier-ai-engine.azurewebsites.net/health
```

Expected response contoh:

```json
{
  "status": "ok",
  "model_loaded": true,
  "catalog_size": 5859
}
```

Cek GenAI health:

```bash
curl https://cakapkarier-ai-engine.azurewebsites.net/genai/health
```

Cek predict web:

```bash
curl -X POST https://cakapkarier-ai-engine.azurewebsites.net/predict/web \
  -H "Content-Type: application/json" \
  -d '{
    "pendidikan_terakhir": "s1",
    "skill_yang_dikuasai": "Python, SQL, Machine Learning, TensorFlow",
    "minat_bakat": "AI Engineer, Data Analyst",
    "pengalaman_sertifikasi": "1 tahun project machine learning dan sertifikasi TensorFlow Developer",
    "target_role": "ae",
    "top_k": 3,
    "use_genai": false
  }'
```

---

## 6. Hubungkan Backend ke AIEngine

Di Azure App Service backend, pastikan:

```env
AI_CAREER_MATCH_URL=https://cakapkarier-ai-engine.azurewebsites.net
```

Backend akan memanggil:

```text
POST {AI_CAREER_MATCH_URL}/predict/web
GET  {AI_CAREER_MATCH_URL}/health
GET  {AI_CAREER_MATCH_URL}/genai/health
```

Setelah mengubah env var, restart backend App Service.

---

## 7. Hubungkan Frontend ke Backend

Di Vercel, pastikan:

```env
VITE_API_BASE_URL=https://cakapkarier-backend.azurewebsites.net/api
```

Setelah mengubah env var, redeploy frontend.

---

## 8. CORS Checklist

Backend harus mengizinkan domain Vercel.

Di backend Azure env:

```env
FRONTEND_URL=https://cakapkarier-ai.vercel.app
CORS_ORIGINS=https://cakapkarier-ai.vercel.app
```

Jika memakai preview deployment Vercel, tambahkan preview URL juga:

```env
CORS_ORIGINS=https://cakapkarier-ai.vercel.app,https://cakapkarier-ai-git-main-yourteam.vercel.app
```

Hindari memakai wildcard `*` untuk deployment demo final.

---

## 9. Full Deployment Smoke Test

Setelah semua service deploy:

1. Buka frontend Vercel.
2. Sign up atau sign in.
3. Buka halaman analisis.
4. Isi form analisis.
5. Submit.
6. Pastikan result page muncul.
7. Buka riwayat.
8. Buka detail riwayat.
9. Pastikan bagian “Kenapa hasil ini muncul?” terbuka dan menampilkan detail.

Jika analisis gagal, cek berurutan:

1. Browser console frontend.
2. Azure App Service logs backend.
3. Azure App Service logs AIEngine.
4. PostgreSQL connection log / firewall.

---

## 10. Troubleshooting Umum

### Frontend terkena CORS

Gejala:

```text
Access to XMLHttpRequest has been blocked by CORS policy
```

Solusi:

- Pastikan `CORS_ORIGINS` backend berisi domain Vercel.
- Restart backend Azure App Service.
- Redeploy frontend jika `VITE_API_BASE_URL` salah.

### Backend tidak bisa akses AIEngine

Gejala:

```text
Layanan analisis AI sedang tidak tersedia
```

Solusi:

- Pastikan `AI_CAREER_MATCH_URL` benar.
- Cek `/health` AIEngine secara langsung.
- Cek model artifact ikut ter-deploy.
- Cek startup logs AIEngine.

### AIEngine lambat saat pertama diakses

Azure free/basic tier bisa cold start. Untuk demo:

- akses `/health` beberapa menit sebelum presentasi
- pastikan service tidak idle terlalu lama
- jika perlu gunakan tier yang tidak agresif sleep

### TensorFlow install/deploy lama

TensorFlow berat untuk deploy. Untuk capstone:

- gunakan deployment package/container bila memungkinkan
- hindari install ulang setiap demo
- pastikan Python runtime cocok dengan TensorFlow di `requirements.txt`

### Database connection gagal

Solusi:

- cek DB firewall allow Azure service
- cek `DB_SSL`
- cek username format Azure PostgreSQL
- cek database sudah dibuat

---

## 11. Final Pre-Demo Checklist

- [ ] Frontend Vercel deploy sukses
- [ ] Backend Azure start tanpa error
- [ ] AIEngine Azure start tanpa error
- [ ] Backend `/health` sukses
- [ ] AIEngine `/health` sukses
- [ ] Frontend `VITE_API_BASE_URL` menunjuk backend Azure
- [ ] Backend `AI_CAREER_MATCH_URL` menunjuk AIEngine Azure
- [ ] Backend `CORS_ORIGINS` berisi domain Vercel
- [ ] PostgreSQL bisa diakses backend
- [ ] Login/signup berhasil
- [ ] Submit analisis berhasil
- [ ] Result page tampil
- [ ] History dan detail history tampil
- [ ] Tidak ada `.env` berisi secret yang ikut commit

---

## 12. Catatan Keamanan untuk Capstone

Untuk kebutuhan capstone, minimal pastikan:

- `JWT_SECRET` kuat dan bukan placeholder
- `DEBUG_ERRORS=false`
- `API_DOCS_ENABLED=false` kecuali sengaja ditampilkan
- `CORS_ORIGINS` tidak wildcard untuk demo final
- secrets disimpan di Vercel/Azure environment variables, bukan di repository
- jika API key pernah terekspos, rotasi sebelum deployment
