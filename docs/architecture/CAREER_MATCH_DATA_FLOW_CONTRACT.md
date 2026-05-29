# Kontrak Data Flow Career Match Per Layer

Tanggal: 2026-05-16  
Terakhir diperbarui: 2026-05-22  
Scope: Frontend analisis karier, Backend Express gateway, AIEngine `career-match`  
Tujuan: menjelaskan format input, output, logic tiap layer, dan batasan pemrosesan field pengalaman relevan.

## Ringkasan

Fitur analisis karier berjalan melalui alur berikut:

```text
User
  -> Frontend AnalisisPage
  -> Backend Express POST /api/analysis/career-match
  -> AIEngine POST /predict/web
  -> Backend enrich response + simpan history
  -> Frontend AnalisisResultPage
```

Riwayat analisis berjalan melalui alur berikut:

```text
Frontend HistoryPage
  -> Backend Express GET /api/analysis/career-match/history
  -> Database career_analysis_results
  -> Frontend HistoryPage

Frontend /riwayat/:id
  -> Backend Express GET /api/analysis/career-match/history/:id
  -> Database career_analysis_results
  -> Frontend AnalisisResultPage
```

Masalah lintas layer saat ini ada pada field pengalaman:

```text
Frontend label: Pengalaman Relevan
Frontend state: formData.pengalaman_text
Payload lama: pengalaman_sertifikasi
AI alias: experience_text
```

Secara produk, pengalaman relevan seharusnya berarti narasi job, project, atau organization experience yang berkorelasi dengan pekerjaan. Field ini tidak boleh dicampur dengan tahun pengalaman atau sertifikasi karena keduanya sudah punya input sendiri.

## Kotak Input Frontend

| UI Frontend | State Frontend Saat Ini | Payload Canonical | Makna Data |
| --- | --- | --- | --- |
| Pendidikan Terakhir | `pendidikan_terakhir` | `education_level` | Jenjang pendidikan user. |
| Skill yang Dikuasai | `selectedSkills` | `skills` | Skill eksplisit yang dipilih atau ditambahkan user. |
| Bidang Minat | `selectedInterests` | `interests` | Preferensi bidang, minat karier, atau role yang diminati. |
| Tahun Pengalaman | `pengalaman_tahun` | `experience_years` | Angka tahun pengalaman. |
| Pengalaman Relevan | `pengalaman_text` | `experience_text` | Narasi job, project, atau organization experience. |
| Sertifikasi | `sertifikasi` | `certifications` | Daftar sertifikasi eksplisit. |
| Target Role | `target_role` | `target_role` | Role tujuan user. |
| Preferensi Lokasi | `preferred_location` | `preferred_location` | Lokasi kerja yang diinginkan. |
| Jumlah Match | konfigurasi request `5` | `top_k` | Jumlah top match yang diminta dari AI. |

## Frontend Ke Backend

### Format yang Disarankan

Frontend sebaiknya mengirim payload canonical yang memisahkan pengalaman, tahun, dan sertifikasi:

```json
{
  "education_level": "s1",
  "skills": ["Python", "SQL", "REST API", "Docker"],
  "interests": ["Backend Developer", "API Development"],
  "experience_years": 2,
  "experience_text": "Pernah membangun REST API untuk sistem inventori organisasi kampus, membuat dashboard monitoring transaksi, dan melakukan deployment service internal dengan Docker.",
  "certifications": [
    "AWS Cloud Practitioner"
  ],
  "target_role": "be",
  "preferred_location": "Jakarta",
  "top_k": 5,
  "use_genai": false
}
```

### Format Legacy yang Masih Ada

Backend masih menerima pengalaman relevan legacy sebagai:

```json
{
  "pengalaman_sertifikasi": "Pernah membangun REST API untuk sistem inventori organisasi kampus..."
}
```

Field legacy seperti `pengalaman_sertifikasi`, `skill_yang_dikuasai`, `minat_bakat`, dan `pendidikan_terakhir` harus dipahami sebagai alias backward compatibility. Kontrak utama frontend-backend menggunakan `experience_text`, `skills`, `interests`, dan `education_level`.

## Backend Normalized Contract

Backend bertugas menjadi adapter agar field lama dan field baru tetap bisa dipakai. Normalisasi yang disarankan:

```js
const normalized = {
  education_level: body.education_level || body.pendidikan_terakhir,
  skills: body.skills ?? parseSkills(body.skill_yang_dikuasai),
  interests: body.interests ?? parseInterests(body.minat_bakat),
  experience_years: Number(body.experience_years ?? body.pengalaman_tahun),
  experience_text: body.experience_text || body.pengalaman_sertifikasi,
  certifications: normalizeArray(body.certifications ?? body.sertifikasi),
  target_role: body.target_role || null,
  preferred_location: body.preferred_location || null,
  top_k: Number(body.top_k ?? 5),
  use_genai: Boolean(body.use_genai ?? false)
};
```

Prioritas field:

| Data | Prioritas 1 | Prioritas 2 | Jika Tidak Ada |
| --- | --- | --- | --- |
| Pendidikan | `education_level` | `pendidikan_terakhir` | request ditolak |
| Skill | `skills` | `skill_yang_dikuasai` | wajib ada |
| Minat | `interests` | `minat_bakat` | opsional |
| Tahun pengalaman | `experience_years` | `pengalaman_tahun` | request ditolak |
| Pengalaman relevan | `experience_text` | `pengalaman_sertifikasi` | request ditolak |
| Sertifikasi | `certifications` | `sertifikasi` | array kosong |

Kebijakan default:

- Backend tidak membuat default output profil seperti pendidikan `s1`, pengalaman `0 tahun`, role, readiness score, atau match confidence.
- Default yang masih boleh ada hanya parameter teknis request, misalnya `top_k: 5`, `use_genai: false`, dan pagination history.
- Jika AIEngine/backend tidak mengirim sebuah output, frontend menampilkan empty state, bukan nilai hasil buatan.

## Backend Ke AIEngine

Karena AIEngine saat ini menerima alias Indonesia di `/predict/web`, backend tetap bisa meneruskan payload kompatibel berikut:

```json
{
  "pendidikan_terakhir": "s1",
  "skill_yang_dikuasai": "Python, SQL, REST API, Docker",
  "minat_bakat": "Backend Developer, API Development",
  "pengalaman_sertifikasi": "Pernah membangun REST API untuk sistem inventori organisasi kampus...",
  "experience_years": 2,
  "certifications": [
    "AWS Cloud Practitioner"
  ],
  "target_role": "be",
  "preferred_location": "Jakarta",
  "top_k": 5,
  "use_genai": false
}
```

Catatan penting:

- `pengalaman_sertifikasi` pada request ke AIEngine harus diisi dari `experience_text`.
- `experience_years` tetap dikirim agar AIEngine tidak perlu menebak tahun dari narasi.
- `certifications` tetap dikirim agar sertifikasi tidak perlu ditebak dari narasi.
- Backend tidak perlu mengubah AIEngine.

## Logic Tiap Layer

### Frontend

Frontend bertanggung jawab untuk:

- Mengumpulkan input user dalam kotak data yang terpisah.
- Mengirim skill eksplisit sebagai `skills`.
- Mengirim tahun pengalaman sebagai `experience_years`.
- Mengirim pengalaman relevan sebagai `experience_text`.
- Mengirim sertifikasi sebagai `certifications`.
- Menampilkan response hasil analisis dari backend tanpa mengubah kontrak AI.
- Tidak menampilkan nilai hasil buatan ketika backend/AI tidak mengirim field tertentu; gunakan empty state.
- Mengambil riwayat dari `GET /api/analysis/career-match/history`.
- Mengambil detail riwayat dari `GET /api/analysis/career-match/history/:id`.
- Merender detail riwayat dengan komponen hasil yang sama, sehingga `/riwayat/:id` tetap berjalan saat URL dibuka langsung atau di-refresh.

Logic yang tidak boleh dilakukan frontend:

- Jangan menggabungkan tahun pengalaman, pengalaman relevan, dan sertifikasi ke satu string.
- Jangan menganggap pengalaman relevan otomatis menjadi skill kecuali backend mengirim hasil ekstraksi yang eksplisit.

### Backend Express

Backend bertanggung jawab untuk:

- Validasi JWT dan request body.
- Menormalisasi field canonical dan legacy.
- Mengirim request kompatibel ke AIEngine `/predict/web`.
- Menambahkan `input_interpretation` agar halaman hasil bisa menjelaskan data yang terbaca.
- Menyimpan `request_payload` dan `response_payload` ke history.
- Menyediakan endpoint list history dan detail history untuk user login.
- Tidak mengubah nilai kosong menjadi output buatan seperti skor `0`, pendidikan `s1`, atau count `0` jika field tidak dikirim oleh AI.

Output `input_interpretation` yang disarankan:

```json
{
  "education_level": "s1",
  "education_label": "Sarjana (S1)",
  "experience_years": 2,
  "experience_text": "Pernah membangun REST API untuk sistem inventori organisasi kampus...",
  "certifications": [
    "AWS Cloud Practitioner"
  ],
  "preferred_location": "Jakarta",
  "explicit_skills": ["Python", "SQL", "REST API", "Docker"],
  "experience_derived_skills": ["REST API", "Docker"],
  "certification_derived_skills": ["AWS"],
  "risk_flags": []
}
```

### AIEngine

AIEngine `/predict/web` saat ini memproses input web sebagai berikut:

| Field AI | Sumber Backend | Pemakaian Saat Ini |
| --- | --- | --- |
| `education_level` atau `pendidikan_terakhir` | Pendidikan user | Masuk ke `candidate_text` dan `education_match`. |
| `skills` atau `skill_yang_dikuasai` | Skill eksplisit user | Masuk ke `candidate_text`, overlap skill, matched skills, missing skills. |
| `interests` atau `minat_bakat` | Minat user | Masuk ke `candidate_text` sebagai interests. |
| `experience_years` | Tahun pengalaman | Masuk ke `candidate_text`, `experience_ratio`, dan `seniority_gap`. |
| `experience_text` atau `pengalaman_sertifikasi` | Pengalaman relevan | AIEngine tetap menerima narasi ini, tetapi backend lebih dulu mengekstrak evidence skill yang dikenal dari teks dan mengirimnya ke AI melalui `skill_yang_dikuasai`. |
| `certifications` atau `sertifikasi` | Sertifikasi eksplisit | Masuk ke `candidate_text` dan `certification_overlap`. |
| `target_role` | Target role | Normalisasi role dan bonus/ranking target alignment. |
| `preferred_location` | Lokasi preferensi | Bonus kecil jika lokasi job cocok. |

Batasan AIEngine saat ini:

- Narasi `experience_text` belum dicocokkan secara semantik dengan job description.
- Ekstraksi skill dari narasi pengalaman dilakukan di Backend Express dengan kamus skill terbatas, bukan di AIEngine.
- Kualitas pengalaman project, organisasi, freelance, atau pekerjaan belum diberi bobot khusus.

## AIEngine Output

AIEngine 1.4.1 mengembalikan struktur utama berikut. Field `model_probability` dan `readiness_features` pada `top_matches` bersifat opsional untuk audit/debug skor.

```json
{
  "predicted_role": "Backend Developer",
  "target_role": "back end developer",
  "role_family": "software-engineering",
  "readiness_score": 82.5,
  "readiness_status": "Cukup Siap",
  "match_confidence": 0.825,
  "top_matches": [
    {
      "job_id": "job-123",
      "job_title": "Backend Developer",
      "company": "Example Company",
      "location": "Jakarta",
      "match_score": 0.825,
      "readiness_percentage": 82.5,
      "model_probability": 0.79,
      "readiness_features": {
        "skill_overlap": 0.72,
        "certification_overlap": 0.2,
        "experience_ratio": 1,
        "education_match": 1,
        "skill_count_ratio": 0.8,
        "missing_skill_ratio": 0.28,
        "seniority_gap": 0,
        "semantic_similarity": 0.31,
        "certification_required_overlap": 0.5,
        "certification_completeness_boost": 0.2,
        "certification_signal": 0.32
      },
      "matched_skills": [
        "python",
        "sql",
        "api"
      ],
      "missing_skills": [
        "docker"
      ]
    }
  ],
  "skill_gap": [
    "docker"
  ],
  "skill_gap_count": 1,
  "skill_gap_analysis": [
    {
      "name": "docker",
      "priority": "Tinggi",
      "description": "Skill ini relevan untuk Backend Developer dan belum kuat terdeteksi dari profil kandidat."
    }
  ],
  "mastered_skills": [
    "python",
    "sql",
    "api"
  ],
  "mastered_skill_count": 3,
  "roadmap": [],
  "recommendations": [],
  "tips": [],
  "ai_summary": null
}
```

Frontend result page harus membaca:

- `top_matches[].job_title`, bukan hanya `title`.
- `top_matches[].match_score`, bukan hanya `score`.
- `skill_gap_analysis[].description`, bukan hanya `reason`.
- `top_matches[].readiness_features` hanya untuk transparansi/audit; frontend tidak perlu mengirim field ini kembali ke backend.

## Backend Ke Frontend

Backend mengembalikan AI output yang sudah diperkaya metadata penyimpanan dan transparansi input:

```json
{
  "status": "success",
  "data": {
    "analysis_id": "946cca29-97ac-4225-893a-b8310883c57d",
    "saved_at": "2026-05-16T06:43:24.727Z",
    "predicted_role": "Backend Developer",
    "role_family": "software-engineering",
    "target_role": "back end developer",
    "readiness_score": 82.5,
    "readiness_status": "Cukup Siap",
    "match_confidence": 0.825,
    "top_matches": [],
    "skill_gap_analysis": [],
    "mastered_skills": [],
    "roadmap": [],
    "recommendations": [],
    "tips": [],
    "ai_summary": null,
    "input_interpretation": {
      "education_level": "s1",
      "education_label": "Sarjana (S1)",
      "experience_years": 2,
      "experience_text": "Pernah membangun REST API untuk sistem inventori organisasi kampus...",
      "certifications": [
        "AWS Cloud Practitioner"
      ],
      "skills": [
        "Python",
        "SQL",
        "REST API"
      ],
      "pendidikan": "Sarjana (S1)",
      "pengalaman_tahun": 2,
      "pengalaman_text": "Pernah membangun REST API untuk sistem inventori organisasi kampus...",
      "sertifikasi": [
        "AWS Cloud Practitioner"
      ],
      "preferred_location": "Jakarta",
      "explicit_skills": [
        "Python",
        "SQL",
        "REST API"
      ],
      "experience_derived_skills": [
        "REST API"
      ],
      "certification_derived_skills": [
        "AWS"
      ],
      "risk_flags": []
    }
  }
}
```

## History API

History memakai tabel `career_analysis_results` dan selalu difilter berdasarkan `user_id` dari JWT.

### List History

```http
GET /api/analysis/career-match/history?limit=20&offset=0
Authorization: Bearer <jwt>
```

Response:

```json
{
  "status": "success",
  "results": 3,
  "summary": {
    "total_analysis": 3,
    "latest_score": 20.61,
    "previous_score": 100,
    "score_delta": -79.39,
    "latest_mastered_skill_count": 3,
    "mastered_skill_delta": -3
  },
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 3,
    "has_next": false
  },
  "data": [
    {
      "id": "8ec4580f-43da-465e-b66f-90b1739da87e",
      "predicted_role": "Backend Developer",
      "target_role": "back end developer",
      "readiness_score": 20.61,
      "readiness_status": "Perlu Ditingkatkan",
      "mastered_skill_count": 3,
      "skill_gap_count": 7,
      "created_at": "2026-05-16T08:24:52.691Z"
    }
  ]
}
```

### Detail History

```http
GET /api/analysis/career-match/history/:id
Authorization: Bearer <jwt>
```

Response:

```json
{
  "status": "success",
  "data": {
    "id": "8ec4580f-43da-465e-b66f-90b1739da87e",
    "created_at": "2026-05-16T08:24:52.691Z",
    "request": {
      "original": {},
      "normalized": {},
      "ai_payload": {}
    },
    "result": {
      "predicted_role": "Backend Developer",
      "readiness_score": 20.61,
      "input_interpretation": {}
    }
  }
}
```

Frontend detail history mengambil `data.result`, lalu menambahkan metadata tampilan:

```js
{
  ...detail.result,
  analysis_id: detail.id,
  saved_at: detail.created_at
}
```

## Data Flow Detail

```text
1. User isi form:
   - Tahun Pengalaman = 2
   - Pengalaman Relevan = narasi project/job/organization
   - Sertifikasi = daftar sertifikasi

2. Frontend bangun payload:
   - experience_years dari input angka
   - experience_text dari textarea Pengalaman Relevan
   - certifications dari chip Sertifikasi

3. Backend validasi dan normalisasi:
   - menerima field canonical dan legacy
   - memastikan pengalaman relevan tidak hilang
   - menyusun payload kompatibel AIEngine

4. Backend panggil AIEngine:
   - mengirim experience_years eksplisit
   - mengirim certifications eksplisit
   - mengirim pengalaman_sertifikasi sebagai alias dari experience_text

5. AIEngine inference:
   - menghitung match berdasarkan skill, pengalaman tahun, pendidikan, sertifikasi, target role, lokasi
   - belum memakai experience_text sebagai semantic project/job matching

6. Backend enrich response:
   - menambahkan analysis_id
   - menambahkan saved_at
   - menambahkan input_interpretation
   - menyimpan ke history

7. Frontend result:
   - menampilkan readiness
   - menampilkan top matches
   - menampilkan skill gap
   - menampilkan profil yang terbaca AI dari input_interpretation

8. Frontend history:
   - /riwayat mengambil list history real dari backend
   - /riwayat/:id mengambil detail history real dari backend
   - detail history dirender memakai AnalisisResultPage
```

## Known Limitation

AIEngine 1.4.1 sudah menambahkan `semantic_similarity` sebagai salah satu readiness feature untuk membandingkan teks kandidat dengan teks job. Namun fitur ini belum menggantikan kebutuhan evidence eksplisit dari skill, tahun pengalaman, pendidikan, dan sertifikasi.

Contoh:

```text
"Pernah membangun REST API, CI/CD pipeline, dan deployment Docker"
```

Backend saat ini tetap melakukan ekstraksi keyword terbatas dari narasi tersebut menjadi `experience_derived_skills`, lalu mengirim skill hasil ekstraksi ke AIEngine melalui `skill_yang_dikuasai`.

Namun batasannya masih jelas:

- Ekstraksi berbasis alias/kamus, bukan semantic job description matching.
- Durasi pengalaman belum dibagi per skill; `experience_years` tetap angka profil global.
- Kualitas proyek, senioritas tanggung jawab, dan relevansi organisasi belum diberi bobot khusus.
- Skill dari sertifikasi tidak otomatis berarti pengalaman kerja; backend mengirim `risk_flags` untuk transparansi.

Alur smart evidence yang sekarang dipakai:

```text
experience_text
  -> backend keyword extraction
  -> experience_derived_skills
  -> digabung ke skill_yang_dikuasai saat request ke AIEngine
  -> ditampilkan transparan di input_interpretation
```

Enhancement tersebut harus transparan ke user supaya skill manual dan skill hasil deteksi pengalaman tidak tercampur diam-diam.

## Skenario Validasi

### 1. Payload Canonical Baru

Input:

```json
{
  "experience_years": 2,
  "experience_text": "Pernah menjadi backend developer untuk project inventori.",
  "certifications": [
    "AWS Cloud Practitioner"
  ]
}
```

Ekspektasi:

- Backend menyimpan `experience_text` sebagai pengalaman relevan.
- Backend mengisi `input_interpretation.pengalaman_text`.
- Backend tetap mengirim payload kompatibel ke AIEngine.

### 2. Payload Legacy

Input:

```json
{
  "pengalaman_sertifikasi": "Pernah menjadi backend developer untuk project inventori."
}
```

Ekspektasi:

- Backend memperlakukan field ini sebagai alias dari `experience_text`.
- Backend tidak menganggap field ini sebagai sertifikasi eksplisit.

### 3. Canonical dan Legacy Ada Bersamaan

Input:

```json
{
  "experience_text": "Pengalaman canonical",
  "pengalaman_sertifikasi": "Pengalaman legacy"
}
```

Ekspektasi:

- Backend memprioritaskan `experience_text`.
- `pengalaman_sertifikasi` hanya fallback.

### 4. Sertifikasi Kosong

Input:

```json
{
  "certifications": []
}
```

Ekspektasi:

- Backend meneruskan array kosong.
- Frontend result menampilkan empty state sertifikasi, bukan hasil buatan.

### 5. Result Field Mapping

Ekspektasi frontend:

- Top match title dibaca dari `top_matches[].job_title`.
- Match score dibaca dari `top_matches[].match_score`.
- Skill gap reason dibaca dari `skill_gap_analysis[].description`.
- Transparansi profil dibaca dari `input_interpretation`.

### 6. History List dan Detail

Ekspektasi frontend:

- `/riwayat` membaca `GET /api/analysis/career-match/history`.
- Tombol detail mengarah ke `/riwayat/:id`.
- `/riwayat/:id` membaca `GET /api/analysis/career-match/history/:id`.
- Detail history memakai `data.result`, bukan dummy route state.
- Jika detail dibuka langsung atau halaman di-refresh, frontend tetap dapat mengambil data dari backend.
