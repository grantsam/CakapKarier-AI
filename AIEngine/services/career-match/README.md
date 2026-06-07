# Career Match Service

FastAPI microservice untuk melayani model CakapKarier AI.

## Endpoint

- `GET /health`: cek model dan katalog lowongan.
- `GET /genai/health`: cek koneksi GenAI provider, default Gemini API.
- `POST /predict`: prediksi role terbaik, readiness score, skill gap, dan rekomendasi.
- `POST /predict/web`: adapter untuk form `WebApplication` halaman analisis.

Contoh request:

```json
{
  "skills": ["Python", "SQL", "Machine Learning", "Data Analysis"],
  "experience_years": 2,
  "education_level": "bachelor",
  "certifications": ["TensorFlow Developer"],
  "interests": ["AI Engineer", "Problem Solving"],
  "target_role": "ae",
  "preferred_location": "Jakarta",
  "top_k": 3,
  "use_genai": false
}
```

Contoh request dari form web:

```json
{
  "pendidikan_terakhir": "s1",
  "skill_yang_dikuasai": "Python, SQL, Machine Learning, TensorFlow",
  "minat_bakat": "AI Engineer, Data Analyst, Problem Solving",
  "pengalaman_sertifikasi": "1 tahun project machine learning, sertifikasi TensorFlow Developer",
  "target_role": "ae",
  "top_k": 5
}
```

Parameter mandatory untuk integrasi aplikasi:

- `experience_years`
- `skills`
- `certifications`

Jika pengguna belum memiliki sertifikasi, backend tetap perlu mengirim `certifications: []`.
Untuk `/predict/web`, sertifikasi dan tahun pengalaman bisa diparsing dari `pengalaman_sertifikasi`; jika tidak ada sertifikasi, service akan memakai array kosong.

Response sudah disiapkan untuk halaman hasil:

- `readiness_score` dan `readiness_status`
- `mastered_skills` dan `mastered_skill_count`
- `skill_gap`, `skill_gap_count`, dan `skill_gap_analysis`
- `roadmap`
- `tips`
- `top_matches`

## Menjalankan API

```bash
cd AIEngine
uvicorn career_match.app:app --app-dir services/career-match/src --host 127.0.0.1 --port 8001
```

## GenAI Summary dengan Gemini

Fitur `use_genai=true` diarahkan untuk memakai Gemini API melalui OpenAI-compatible Chat Completions API. Jika provider tidak tersedia, service otomatis memakai ringkasan deterministik sehingga inference tetap berjalan.

Konfigurasi PowerShell:

```powershell
$env:GENAI_PROVIDER="gemini"
$env:GENAI_API_URL="https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
$env:GENAI_MODEL="gemini-2.5-flash-lite"
$env:GENAI_API_KEY="<google-ai-studio-api-key>"
$env:GENAI_TIMEOUT_SECONDS="8"
$env:GENAI_MAX_RETRIES="1"
```

Untuk local/offline development, Ollama tetap bisa dipakai:

```powershell
$env:GENAI_PROVIDER="ollama"
$env:GENAI_API_URL="http://localhost:11434/v1/chat/completions"
$env:GENAI_MODEL="llama3.1"
$env:GENAI_API_KEY=""
```

Cek koneksi:

```bash
curl http://127.0.0.1:8001/genai/health
```

Contoh request dengan GenAI aktif:

```json
{
  "pendidikan_terakhir": "s1",
  "skill_yang_dikuasai": "Python, SQL, Data Analysis, Machine Learning",
  "minat_bakat": "Data Analyst, Data Scientist",
  "pengalaman_sertifikasi": "1 tahun project dashboard data",
  "target_role": "ds",
  "top_k": 3,
  "use_genai": true
}
```

Jika Gemini berjalan, response akan berisi `ai_summary` dengan metadata seperti `ai_summary_source`, `genai_provider`, dan `genai_model`. Jika Gemini gagal atau API key belum tersedia, `ai_summary_source` menjadi `deterministic_fallback`.

Provider OpenAI-compatible lain tetap bisa dipakai dengan environment:

```bash
GENAI_API_URL=https://provider.example/v1/chat/completions
GENAI_API_KEY=...
GENAI_MODEL=...
```

## Recent Improvements

### v1.1

- Added Gemini AI integration through OpenAI-compatible API.
- Added `/genai/health` endpoint for provider monitoring.
- Improved skill gap analysis output.
- Added personalized roadmap recommendations.
- Added deterministic fallback summary when AI provider is unavailable.
- Improved web form compatibility through `/predict/web`.
