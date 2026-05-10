# Career Match Service

FastAPI microservice untuk melayani model CakapKarier AI.

## Endpoint

- `GET /health`: cek model dan katalog lowongan.
- `POST /predict`: prediksi role terbaik, readiness score, skill gap, dan rekomendasi.

Contoh request:

```json
{
  "skills": ["Python", "SQL", "Machine Learning", "Data Analysis"],
  "experience_years": 2,
  "education_level": "bachelor",
  "certifications": ["TensorFlow Developer"],
  "preferred_location": "Jakarta",
  "top_k": 3,
  "use_genai": false
}
```

## Menjalankan API

```bash
cd AIEngine
uvicorn career_match.app:app --app-dir services/career-match/src --host 127.0.0.1 --port 8001
```

## GenAI Summary

Fitur `use_genai=true` memakai API generative AI kompatibel chat completions bila environment berikut tersedia:

```bash
GENAI_API_URL=https://provider.example/v1/chat/completions
GENAI_API_KEY=...
GENAI_MODEL=...
```

Jika environment belum diisi, service memakai ringkasan deterministik sehingga inference tetap berjalan.
