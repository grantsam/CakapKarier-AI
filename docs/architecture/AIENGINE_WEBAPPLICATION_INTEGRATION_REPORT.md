# Laporan Integrasi AIEngine ke WebApplication

Tanggal review awal: 2026-05-13  
Terakhir diperbarui: 2026-05-22  
Reviewer: Backend integration handoff  
Area yang direview: `AIEngine/` dan `WebApplication/`

## Ringkasan Eksekutif

`AIEngine` menyediakan service AI untuk fitur analisis kesiapan karier melalui FastAPI service `career-match`. Backend `WebApplication/backend-express` bertindak sebagai API gateway: menerima request dari frontend, melakukan validasi/auth, membangun smart evidence profile, meneruskan payload kompatibel ke FastAPI `/predict/web`, menyimpan history, lalu mengembalikan response siap render ke frontend.

Status saat ini:

- Model dan katalog lowongan sudah tersedia di `AIEngine/models/registry/career-match/v1/`.
- FastAPI endpoint sudah tersedia di `AIEngine/services/career-match/src/career_match/app.py`.
- Kontrak lintas service tersedia di `AIEngine/shared/schemas/career_match_contract.json`.
- Backend Express sudah memiliki endpoint analisis, health AI, history list, dan history detail di bawah `/api/analysis/career-match`.
- Frontend `AnalisisPage.jsx` sudah submit ke backend dengan canonical keys.
- Frontend `AnalisisResultPage.jsx` sudah render response backend/AI dan bisa mengambil detail history dari `/riwayat/:id`.
- Frontend `HistoryPage.jsx` sudah memakai API history real, bukan data dummy.
- Backend menyimpan `request_payload` dan `response_payload` ke `career_analysis_results`.
- Backend menambahkan `input_interpretation`, `skill_evidence`, dan `risk_flags` tanpa mengubah `AIEngine`.

## Artefak AIEngine yang Relevan

| Artefak | Fungsi |
| --- | --- |
| `AIEngine/services/career-match/src/career_match/app.py` | FastAPI app dengan endpoint `/health`, `/genai/health`, `/predict`, dan `/predict/web`. |
| `AIEngine/services/career-match/src/career_match/schemas.py` | Schema Pydantic untuk request dan response. |
| `AIEngine/services/career-match/src/career_match/inference.py` | Loader model, katalog lowongan, ranking job, readiness score, skill gap, roadmap. |
| `AIEngine/shared/schemas/career_match_contract.json` | Kontrak resmi request/response untuk integrasi lintas tim. |
| `AIEngine/models/registry/career-match/v1/career_match_model.keras` | Model Keras utama untuk inference. |
| `AIEngine/models/registry/career-match/v1/jobs_catalog.json` | Katalog lowongan yang dipakai untuk matching. |
| `AIEngine/tests/integration/smoke_inference.py` | Smoke test inference langsung tanpa HTTP. |
| `AIEngine/tests/integration/smoke_genai.py` | Smoke test GenAI summary dan deterministic fallback. |
| `AIEngine/requirements.txt` | Dependency Python untuk menjalankan service. |

## Cara Menjalankan AI Service

Dari root repository:

```bash
cd AIEngine
python -m pip install -r requirements.txt
uvicorn career_match.app:app --app-dir services/career-match/src --host 127.0.0.1 --port 8001
```

Health check:

```http
GET http://127.0.0.1:8001/health
```

Expected response:

```json
{
  "status": "ok",
  "model_loaded": true,
  "catalog_size": 2209
}
```

Jika model atau katalog tidak ditemukan, `/health` mengembalikan `model_loaded: false` atau endpoint prediksi mengembalikan `503`.

## Endpoint AI yang Harus Dipakai Backend

Gunakan endpoint berikut untuk form analisis web:

```http
POST http://127.0.0.1:8001/predict/web
Content-Type: application/json
```

Alasan memakai `/predict/web`:

- Sudah menerima nama field form Indonesia dari frontend.
- Bisa parsing `pengalaman_sertifikasi` untuk mengambil tahun pengalaman dan sertifikasi.
- Lebih toleran terhadap bentuk input string comma-separated.
- Response sudah siap ditampilkan di halaman hasil.

Endpoint `/predict` tetap tersedia, tetapi lebih cocok untuk caller internal yang sudah memiliki payload terstruktur `skills`, `experience_years`, dan `certifications`.

## Mapping Field Frontend ke Backend ke AIEngine

Form saat ini berada di `WebApplication/frontend-react/src/pages/AnalisisPage.jsx`.

| Field UI | Payload frontend ke backend | Payload backend ke AI `/predict/web` | Catatan |
| --- | --- | --- | --- |
| Pendidikan Terakhir | `education_level` | `pendidikan_terakhir` | Wajib dari frontend; backend tetap menerima legacy `pendidikan_terakhir`. |
| Skill yang Dikuasai | `skills` | `skill_yang_dikuasai` | Wajib. Backend menggabungkan explicit skill, skill dari pengalaman, dan skill dari sertifikasi. |
| Bidang Minat | `interests` | `minat_bakat` | Opsional. |
| Tahun Pengalaman | `experience_years` | `experience_years` | Wajib. Tidak diekstrak dari narasi jika user sudah mengisi angka eksplisit. |
| Pengalaman Relevan | `experience_text` | `pengalaman_sertifikasi` | Wajib sebagai narasi job/project/organization experience, bukan gabungan sertifikasi. |
| Sertifikasi | `certifications` | `certifications` | Opsional array. |
| Target Role | `target_role` | `target_role` | Opsional. Alias tersedia: `fe`, `be`, `ds`, `ae`. |
| Preferensi Lokasi | `preferred_location` | `preferred_location` | Opsional. |
| Top K | `top_k` | `top_k` | Default teknis 5, min 1, max 20. |
| GenAI summary | `use_genai` | `use_genai` | Default teknis `false`. |

Contoh payload dari backend Express ke AI:

```json
{
  "pendidikan_terakhir": "s1",
  "skill_yang_dikuasai": "Python, SQL, REST API, Docker",
  "minat_bakat": "Backend Developer, API Development",
  "pengalaman_sertifikasi": "2 tahun membangun REST API dan deployment Docker untuk sistem inventori.",
  "experience_years": 2,
  "certifications": ["AWS Cloud Practitioner"],
  "target_role": "ae",
  "preferred_location": "Jakarta",
  "top_k": 5,
  "use_genai": false
}
```

## Response yang Dikonsumsi Frontend

Response utama dari AI:

```json
{
  "predicted_role": "AI Engineer",
  "target_role": "ai engineer",
  "role_family": "data-ai",
  "readiness_score": 82.45,
  "readiness_status": "Cukup Siap",
  "match_confidence": 0.8245,
  "top_matches": [
    {
      "job_id": "job-123",
      "job_title": "Machine Learning Engineer",
      "match_score": 0.8245,
      "readiness_percentage": 82.45,
      "model_probability": 0.79,
      "readiness_features": {
        "skill_overlap": 0.72,
        "semantic_similarity": 0.31,
        "certification_required_overlap": 0.5,
        "certification_completeness_boost": 0.2
      },
      "matched_skills": ["python", "sql"],
      "missing_skills": ["pytorch", "docker"]
    }
  ],
  "mastered_skills": ["python", "sql"],
  "mastered_skill_count": 2,
  "skill_gap": ["pytorch", "docker"],
  "skill_gap_count": 2,
  "skill_gap_analysis": [
    {
      "name": "pytorch",
      "priority": "Tinggi",
      "description": "Skill ini relevan untuk role teratas dan belum kuat terdeteksi dari profil kandidat."
    }
  ],
  "roadmap": [
    {
      "phase": "Fase 1: Dasar Prioritas (1-2 bulan)",
      "items": ["Pelajari fundamental pytorch dan buat catatan praktik singkat."]
    }
  ],
  "recommendations": [],
  "tips": [],
  "ai_summary": null
}
```

Frontend `AnalisisResultPage.jsx` mengonsumsi field berikut:

- Target role: `target_role || predicted_role`
- Skor kesiapan: `readiness_score`
- Label skor: `readiness_status`
- Skill dikuasai: `mastered_skills` dan `mastered_skill_count`
- Skill gap: `skill_gap_count`, `skill_gap`, dan `skill_gap_analysis`
- Roadmap: `roadmap`
- Tips sukses: `tips`
- Rekomendasi lowongan: `top_matches`

## Desain Backend Express Saat Ini

Module integrasi berada di `WebApplication/backend-express/src`:

```text
src/
|- controllers/
|  `- analysis.controller.js
|- routes/
|  `- analysis.routes.js
|- services/
|  `- ai.service.js
|- validations/
|  `- analysis.validation.js
```

Route yang disarankan:

```http
POST /api/analysis/career-match
Authorization: Bearer <jwt>
Content-Type: application/json
```

Route history:

```http
GET /api/analysis/career-match/history?limit=20&offset=0
GET /api/analysis/career-match/history/:id
GET /api/analysis/career-match/genai/health
Authorization: Bearer <jwt>
```

Flow:

1. Frontend submit form ke Express.
2. Middleware `protect` memastikan user login.
3. Zod validation memvalidasi field minimal.
4. `ai.service.js` memanggil FastAPI `POST /predict/web`.
5. Controller memperkaya response dengan `input_interpretation`.
6. Backend menyimpan request dan response ke database.
7. Controller mengembalikan response AI dalam wrapper standar backend.

Contoh response Express:

```json
{
  "status": "success",
  "data": {
    "predicted_role": "AI Engineer",
    "readiness_score": 82.45,
    "readiness_status": "Cukup Siap",
    "skill_gap": ["pytorch", "docker"],
    "roadmap": []
  }
}
```

## Environment Variable Backend

Tambahkan konfigurasi berikut di `WebApplication/backend-express/.env`:

```env
AI_CAREER_MATCH_URL=http://127.0.0.1:8001
AI_REQUEST_TIMEOUT_MS=30000
```

Tambahkan ke `src/config/index.js`:

```js
ai: {
  careerMatchUrl: process.env.AI_CAREER_MATCH_URL || 'http://127.0.0.1:8001',
  requestTimeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS || 30000),
}
```

## Validasi Backend yang Disarankan

Validasi Zod saat ini menerima canonical keys dan legacy aliases. Field profil wajib:

- `education_level` atau legacy `pendidikan_terakhir`
- `skills` atau legacy `skill_yang_dikuasai`
- `experience_years` atau legacy `pengalaman_tahun`
- `experience_text` atau legacy `pengalaman_sertifikasi`

Backend tidak membuat default output profil seperti pendidikan `s1`, pengalaman `0 tahun`, readiness `0`, atau count `0` jika AI/backend tidak mengirim field tersebut.

## Error Handling

Backend Express perlu menerjemahkan error AI supaya frontend mendapat pesan yang stabil.

| Kondisi | Sumber | Response Express yang disarankan |
| --- | --- | --- |
| AI service mati / connection refused | Express fetch gagal | `503`, pesan: `Layanan analisis AI sedang tidak tersedia` |
| Timeout | Express abort request | `504`, pesan: `Analisis AI melewati batas waktu` |
| Payload invalid | Zod atau FastAPI 422 | `400`, pesan validasi field |
| Model/katalog tidak ditemukan | FastAPI 503 | `503`, pesan: `Model AI belum siap digunakan` |
| Error tak terduga | Express atau FastAPI 500 | `500`, pesan umum tanpa expose stack trace |

Gunakan timeout eksplisit. Jangan biarkan request menggantung karena inference TensorFlow bisa lebih berat saat cold start.

## Catatan Performa dan Operasional

- `CareerMatchService` diload lazy singleton di FastAPI. Request pertama bisa lebih lambat karena load model.
- Service menghitung skor terhadap seluruh katalog lowongan. Katalog saat ini sekitar 2.209 lowongan.
- Jalankan AI service sebagai proses terpisah dari Express. Jangan import Python/model dari Node.js.
- Untuk local development, jalankan Express di port `3000` dan AI service di port `8001`.
- Untuk deployment, gunakan internal network URL, bukan `127.0.0.1`, kecuali Express dan AI service berada dalam container/proses host yang sama.
- `use_genai=false` tetap aman untuk flow utama. Jika `true`, AIEngine memakai provider OpenAI-compatible seperti Ollama via `GENAI_API_URL`, `GENAI_MODEL`, `GENAI_TIMEOUT_SECONDS`, dan opsional `GENAI_API_KEY`. Jika provider tidak tersedia, AIEngine memakai deterministic fallback untuk `ai_summary`.

## Risiko dan Gap

1. Dataset training memakai weak/synthetic supervision dari data lowongan, bukan histori kandidat nyata. Skor cocok untuk MVP, tetapi belum bisa dianggap validasi final produksi.
2. Backend smart evidence masih memakai keyword/alias extraction; AIEngine 1.4.1 sudah menambahkan `semantic_similarity`, tetapi durasi/kualitas pengalaman masih belum dimodelkan per skill.
3. Durasi pengalaman masih level profil global, belum dibagi per skill atau per pengalaman terstruktur.
4. `requirements.txt` memakai versi dependency yang sangat baru. Pastikan environment deployment mendukung versi Python dan wheel TensorFlow yang kompatibel.
5. Metadata model menyimpan path absolut dari environment lama, tetapi loader runtime sudah memakai path relatif/`CAKAP_MODEL_DIR`, jadi ini bukan blocker.
6. CORS FastAPI belum dikonfigurasi. Karena browser sebaiknya hanya memanggil Express, ini tidak menjadi masalah selama frontend tidak memanggil AI service langsung.

## Checklist Implementasi Backend

- [X] Tambahkan env `AI_CAREER_MATCH_URL` dan `AI_REQUEST_TIMEOUT_MS`.
- [X] Tambahkan config `ai` di `backend-express/src/config/index.js`.
- [X] Tambahkan `analysis.validation.js`.
- [X] Tambahkan `ai.service.js` untuk call `POST /predict/web`.
- [X] Tambahkan `analysis.controller.js`.
- [X] Tambahkan `analysis.routes.js` dengan middleware `protect`.
- [X] Register route di `index.js`: `app.use('/api/analysis', analysisRoutes)`.
- [X] Tambahkan handling timeout dan mapping error AI.
- [X] Update frontend submit form agar POST ke `/api/analysis/career-match`.
- [X] Update halaman hasil agar memakai response AI, bukan data dummy.
- [X] Tambahkan penyimpanan history `career_analysis_results`.
- [X] Tambahkan endpoint history list.
- [X] Tambahkan endpoint history detail.
- [X] Integrasikan `HistoryPage.jsx` dengan endpoint history real.
- [X] Integrasikan `/riwayat/:id` dengan detail history real.
- [X] Jalankan smoke test AI: `python tests/integration/smoke_inference.py`.
- [X] Jalankan manual E2E: submit form frontend -> Express -> FastAPI -> halaman hasil/history.

## Contoh cURL untuk Testing Integrasi

Tes langsung ke AI:

```bash
curl -X POST http://127.0.0.1:8001/predict/web \
  -H "Content-Type: application/json" \
  -d "{\"pendidikan_terakhir\":\"s1\",\"skill_yang_dikuasai\":\"Python, SQL, Machine Learning\",\"minat_bakat\":\"AI Engineer, Data Analyst\",\"pengalaman_sertifikasi\":\"1 tahun project machine learning, sertifikasi TensorFlow Developer\",\"target_role\":\"ae\",\"top_k\":5}"
```

Tes via Express:

```bash
curl -X POST http://localhost:3000/api/analysis/career-match \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"education_level\":\"s1\",\"skills\":[\"Python\",\"SQL\",\"REST API\",\"Docker\"],\"interests\":[\"Backend Developer\"],\"experience_years\":2,\"experience_text\":\"2 tahun membangun REST API dan deployment Docker untuk sistem inventori.\",\"certifications\":[\"AWS Cloud Practitioner\"],\"target_role\":\"be\",\"preferred_location\":\"Jakarta\",\"top_k\":5,\"use_genai\":false}"
```

Tes history list:

```bash
curl http://localhost:3000/api/analysis/career-match/history?limit=5 \
  -H "Authorization: Bearer <token>"
```

Tes history detail:

```bash
curl http://localhost:3000/api/analysis/career-match/history/<analysis_id> \
  -H "Authorization: Bearer <token>"
```

## Kesimpulan

AIEngine sudah terintegrasi sebagai microservice inference melalui Backend Express. Frontend submit, halaman hasil, history list, dan detail history sudah memakai data backend/AI real. Area yang masih perlu dikembangkan berikutnya adalah peningkatan semantic evidence di backend atau AIEngine, terutama untuk mencocokkan narasi pengalaman dengan job description secara lebih dalam.
