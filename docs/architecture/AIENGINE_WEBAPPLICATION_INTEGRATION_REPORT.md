# Laporan Integrasi AIEngine ke WebApplication

Tanggal review: 2026-05-13  
Reviewer: Backend integration handoff  
Area yang direview: `AIEngine/` dan `WebApplication/`

## Ringkasan Eksekutif

`AIEngine` sudah menyediakan service AI siap integrasi untuk fitur analisis kesiapan karier melalui FastAPI service `career-match`. Backend `WebApplication/backend-express` tidak perlu menjalankan model TensorFlow secara langsung. Pola integrasi yang paling aman adalah menjadikan Express sebagai API gateway yang menerima request dari frontend, melakukan validasi/auth, meneruskan payload ke FastAPI `/predict/web`, lalu mengembalikan response AI ke frontend.

Status saat ini:

- Model dan katalog lowongan sudah tersedia di `AIEngine/models/registry/career-match/v1/`.
- FastAPI endpoint sudah tersedia di `AIEngine/services/career-match/src/career_match/app.py`.
- Kontrak lintas service tersedia di `AIEngine/shared/schemas/career_match_contract.json`.
- Frontend halaman analisis masih memakai data dummy dan belum memanggil backend.
- Backend Express saat ini hanya punya auth, profile, dan health check. Belum ada route analisis AI.

## Artefak AIEngine yang Relevan

| Artefak | Fungsi |
| --- | --- |
| `AIEngine/services/career-match/src/career_match/app.py` | FastAPI app dengan endpoint `/health`, `/predict`, dan `/predict/web`. |
| `AIEngine/services/career-match/src/career_match/schemas.py` | Schema Pydantic untuk request dan response. |
| `AIEngine/services/career-match/src/career_match/inference.py` | Loader model, katalog lowongan, ranking job, readiness score, skill gap, roadmap. |
| `AIEngine/shared/schemas/career_match_contract.json` | Kontrak resmi request/response untuk integrasi lintas tim. |
| `AIEngine/models/registry/career-match/v1/career_match_model.keras` | Model Keras utama untuk inference. |
| `AIEngine/models/registry/career-match/v1/jobs_catalog.json` | Katalog lowongan yang dipakai untuk matching. |
| `AIEngine/tests/integration/smoke_inference.py` | Smoke test inference langsung tanpa HTTP. |
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

## Mapping Field Frontend ke AIEngine

Form saat ini berada di `WebApplication/frontend-react/src/pages/AnalisisPage.jsx`.

| Field UI | Payload ke backend | Diterima AI `/predict/web` | Catatan |
| --- | --- | --- | --- |
| Pendidikan Terakhir | `pendidikan_terakhir` | `education_level` alias | Nilai valid: `sma`, `d3`, `s1`, `s2`, `s3`, atau angka level. |
| Skill yang Dikuasai | `skill_yang_dikuasai` | `skills` alias | Wajib. Bisa string `"Python, SQL"` atau array. |
| Minat dan Bakat | `minat_bakat` | `interests` alias | Opsional secara model, tetapi UI saat ini wajib. |
| Pengalaman dan Sertifikasi | `pengalaman_sertifikasi` | `experience_text` alias | Opsional. Service mencoba ekstrak tahun dan sertifikasi dari teks ini. |
| Target Skill/Role | `target_role` | `target_role` | Opsional. Alias tersedia: `fe`, `be`, `ds`, `ae`. |
| Top K | `top_k` | `top_k` | Default 5, min 1, max 20. |
| GenAI summary | `use_genai` | `use_genai` | Default `false`. Jangan aktifkan di MVP kecuali env GenAI sudah siap. |

Contoh payload dari backend Express ke AI:

```json
{
  "pendidikan_terakhir": "s1",
  "skill_yang_dikuasai": "Python, SQL, Machine Learning, TensorFlow",
  "minat_bakat": "AI Engineer, Data Analyst, Problem Solving",
  "pengalaman_sertifikasi": "1 tahun project machine learning, sertifikasi TensorFlow Developer",
  "target_role": "ae",
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
  "top_matches": [],
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

Frontend `AnalisisResultPage.jsx` sebaiknya mengganti data dummy dengan field berikut:

- Target role: `target_role || predicted_role`
- Skor kesiapan: `readiness_score`
- Label skor: `readiness_status`
- Skill dikuasai: `mastered_skills` dan `mastered_skill_count`
- Skill gap: `skill_gap_count`, `skill_gap`, dan `skill_gap_analysis`
- Roadmap: `roadmap`
- Tips sukses: `tips`
- Rekomendasi lowongan: `top_matches`

## Rekomendasi Desain Backend Express

Tambahkan module baru di `WebApplication/backend-express/src`:

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

Flow:

1. Frontend submit form ke Express.
2. Middleware `protect` memastikan user login.
3. Zod validation memvalidasi field minimal.
4. `ai.service.js` memanggil FastAPI `POST /predict/web`.
5. Controller mengembalikan response AI dalam wrapper standar backend.

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

Minimal Zod schema:

```js
pendidikan_terakhir: z.enum(['sma', 'smk', 'd3', 's1', 's2', 's3']).or(z.string().min(1)),
skill_yang_dikuasai: z.string().min(2),
minat_bakat: z.string().optional().nullable(),
pengalaman_sertifikasi: z.string().optional().nullable(),
target_role: z.enum(['', 'fe', 'be', 'ds', 'ae']).optional(),
top_k: z.number().int().min(1).max(20).optional()
```

Catatan penting: `/predict/web` bisa menerima `pengalaman_sertifikasi` kosong. Jika kosong dan `experience_years` tidak dikirim, service menganggap pengalaman `0`.

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
- `use_genai=false` disarankan untuk MVP. Jika `true`, perlu env `GENAI_API_URL`, `GENAI_API_KEY`, dan `GENAI_MODEL` di environment AI service.

## Risiko dan Gap

1. Dataset training memakai weak/synthetic supervision dari data lowongan, bukan histori kandidat nyata. Skor cocok untuk MVP, tetapi belum bisa dianggap validasi final produksi.
2. Frontend belum menyimpan state hasil analisis. Setelah submit perlu membawa result via route state, global state, atau simpan history ke database.
3. Backend belum memiliki tabel untuk riwayat analisis. Jika fitur History harus nyata, perlu desain tabel baru.
4. `requirements.txt` memakai versi dependency yang sangat baru. Pastikan environment deployment mendukung versi Python dan wheel TensorFlow yang kompatibel.
5. Metadata model menyimpan path absolut dari environment lama, tetapi loader runtime sudah memakai path relatif/`CAKAP_MODEL_DIR`, jadi ini bukan blocker.
6. CORS FastAPI belum dikonfigurasi. Karena browser sebaiknya hanya memanggil Express, ini tidak menjadi masalah selama frontend tidak memanggil AI service langsung.

## Checklist Implementasi Backend

- [ ] Tambahkan env `AI_CAREER_MATCH_URL` dan `AI_REQUEST_TIMEOUT_MS`.
- [ ] Tambahkan config `ai` di `backend-express/src/config/index.js`.
- [ ] Tambahkan `analysis.validation.js`.
- [ ] Tambahkan `ai.service.js` untuk call `POST /predict/web`.
- [ ] Tambahkan `analysis.controller.js`.
- [ ] Tambahkan `analysis.routes.js` dengan middleware `protect`.
- [ ] Register route di `index.js`: `app.use('/api/analysis', analysisRoutes)`.
- [ ] Tambahkan handling timeout dan mapping error AI.
- [ ] Update frontend submit form agar POST ke `/api/analysis/career-match`.
- [ ] Update halaman hasil agar memakai response AI, bukan data dummy.
- [ ] Jalankan smoke test AI: `python tests/integration/smoke_inference.py`.
- [ ] Jalankan manual E2E: submit form frontend -> Express -> FastAPI -> halaman hasil.

## Contoh cURL untuk Testing Integrasi

Tes langsung ke AI:

```bash
curl -X POST http://127.0.0.1:8001/predict/web \
  -H "Content-Type: application/json" \
  -d "{\"pendidikan_terakhir\":\"s1\",\"skill_yang_dikuasai\":\"Python, SQL, Machine Learning\",\"minat_bakat\":\"AI Engineer, Data Analyst\",\"pengalaman_sertifikasi\":\"1 tahun project machine learning, sertifikasi TensorFlow Developer\",\"target_role\":\"ae\",\"top_k\":5}"
```

Tes via Express setelah route dibuat:

```bash
curl -X POST http://localhost:3000/api/analysis/career-match \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d "{\"pendidikan_terakhir\":\"s1\",\"skill_yang_dikuasai\":\"Python, SQL, Machine Learning\",\"minat_bakat\":\"AI Engineer, Data Analyst\",\"pengalaman_sertifikasi\":\"1 tahun project machine learning, sertifikasi TensorFlow Developer\",\"target_role\":\"ae\",\"top_k\":5}"
```

## Kesimpulan

AIEngine sudah cukup siap untuk diintegrasikan sebagai microservice inference. Tugas utama backend adalah membuat gateway endpoint di Express, validasi request dari frontend, memanggil FastAPI `/predict/web`, dan menstabilkan error/timeout. Setelah itu frontend tinggal mengganti data dummy di halaman analisis dan hasil dengan response nyata dari backend.
