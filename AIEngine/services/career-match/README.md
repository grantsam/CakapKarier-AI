# Career Match Service

FastAPI microservice untuk melayani model CakapKarier AI.

## Endpoint

- `GET /health`: cek model dan katalog lowongan.
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

## GenAI Summary

Fitur `use_genai=true` memakai API generative AI kompatibel chat completions bila environment berikut tersedia:

```bash
GENAI_API_URL=https://provider.example/v1/chat/completions
GENAI_API_KEY=...
GENAI_MODEL=...
```

Jika environment belum diisi, service memakai ringkasan deterministik sehingga inference tetap berjalan.
