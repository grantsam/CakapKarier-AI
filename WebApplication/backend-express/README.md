# backend-express

Backend API utama untuk CakapKarier-AI.

## Lokasi
- Kode sumber: `src/`
- Route/API: `src/api/`
- Modul bisnis: `src/modules/`
- Helper bersama: `src/shared/`
- Test: `tests/`

## Integrasi AI Career Match

Backend menyediakan gateway terproteksi JWT untuk AIEngine:

```http
POST /api/analysis/career-match
GET /api/analysis/career-match/health
GET /api/analysis/career-match/history
GET /api/analysis/career-match/history/:id
```

Environment yang dibutuhkan:

```env
JWT_SECRET=change_this_to_a_random_secret_at_least_32_chars
JWT_EXPIRES_IN=90d
AI_CAREER_MATCH_URL=http://127.0.0.1:8001
AI_REQUEST_TIMEOUT_MS=30000
```

Backend akan gagal start jika `JWT_SECRET` kosong, kurang dari 32 karakter, atau `JWT_EXPIRES_IN` belum diisi.

## Dokumentasi API Frontend

Jalankan backend, lalu buka Swagger UI:

```text
http://localhost:3000/api-docs
```

Raw OpenAPI JSON tersedia di:

```text
http://localhost:3000/api-docs.json
```

Gunakan tombol **Authorize** di Swagger UI untuk memasukkan token JWT dari response login/signup.
Format token:

```text
Bearer <token>
```

## Menjalankan AIEngine (Prasyarat)

Sebelum menjalankan perintah `uvicorn`, pastikan *virtual environment* Python sudah diaktifkan agar perintah dikenali:

```bash
# 1. Masuk ke folder AIEngine
cd ../../AIEngine

# 2. Aktifkan venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# Mac/Linux:
source venv/bin/activate

# 3. Jalankan service
uvicorn career_match.app:app --app-dir services/career-match/src --host 127.0.0.1 --port 8001
```
