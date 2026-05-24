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
GET /api/analysis/career-match/genai/health
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

## Reset Password

Frontend sudah memanggil endpoint berikut:

```http
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

Environment SMTP yang dibutuhkan untuk mengirim email reset password:

```env
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM="CakapKarier AI <no-reply@your-verified-domain.com>"
PASSWORD_RESET_TOKEN_EXPIRES_MINUTES=30
```

Token reset password disimpan sebagai hash, berlaku sekali pakai, dan default kedaluwarsa dalam 30 menit.

## Kontrak Output AIEngine 1.4.1

Backend meneruskan output utama AIEngine dan menambahkan metadata penyimpanan:

```json
{
  "analysis_id": "uuid",
  "saved_at": "2026-05-22T00:00:00.000Z",
  "predicted_role": "AI Engineer",
  "target_role": "ai engineer",
  "role_family": "data-ai",
  "readiness_score": 82.4,
  "readiness_status": "Cukup Siap",
  "match_confidence": 0.824,
  "top_matches": [
    {
      "job_id": "job-123",
      "job_title": "Machine Learning Engineer",
      "match_score": 0.824,
      "readiness_percentage": 82.4,
      "model_probability": 0.79,
      "readiness_features": {
        "skill_overlap": 0.72,
        "semantic_similarity": 0.31,
        "certification_required_overlap": 0.5,
        "certification_completeness_boost": 0.2
      }
    }
  ],
  "recommendations": [],
  "ai_summary": null,
  "input_interpretation": {}
}
```

`model_probability` dan `readiness_features` bersifat opsional untuk audit/debug skor. Frontend tidak perlu mengirim field tersebut kembali ke backend atau AIEngine.

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
