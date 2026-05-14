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
AI_CAREER_MATCH_URL=http://127.0.0.1:8001
AI_REQUEST_TIMEOUT_MS=30000
```

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

Jalankan AIEngine secara terpisah:

```bash
cd ../../AIEngine
uvicorn career_match.app:app --app-dir services/career-match/src --host 127.0.0.1 --port 8001
```
