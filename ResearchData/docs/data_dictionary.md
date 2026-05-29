# Data Dictionary - Career Match Dataset

Data processed tersedia di:

`AIEngine/data/processed/career-match-v1/jobs_processed.csv`

Input final dari tim Data Science:

- Dataset: `AIEngine/data/raw/all_data_clean.csv`
- Data dictionary asli: `AIEngine/data/raw/Data_Dictionary.xlsx`

| Field | Type | Description |
| --- | --- | --- |
| `job_id` | string | Unique internal job id dari sumber dan row id. |
| `source` | string | Sumber data: `glints` atau `linkedin`. |
| `source_sheet` | string | Nama sheet untuk sumber Excel LinkedIn. |
| `job_title` | string | Judul pekerjaan setelah cleaning. |
| `company` | string | Nama perusahaan. |
| `location` | string | Lokasi lowongan. |
| `job_detail` | string | URL lowongan. |
| `description` | string | Deskripsi lowongan yang sudah dibersihkan dan dipotong agar stabil untuk training. |
| `requirements` | string | Teks requirement yang sudah dibersihkan. |
| `skills_text` | string | Kolom skill final DS yang dipakai sebagai sumber utama ekstraksi skill model. |
| `skills_clean_text` | string | Kolom `skills_clean` dari DS yang disimpan untuk audit dan EDA. |
| `skills` | array string | Skill hasil ekstraksi dari kolom skill atau deskripsi pekerjaan. |
| `skills_joined` | string | Skill dalam bentuk string untuk inspeksi manual. |
| `certifications_required` | array string | Sinyal sertifikasi yang terdeteksi dari teks lowongan. |
| `certifications_required_joined` | string | Sertifikasi dalam bentuk string untuk inspeksi manual. |
| `min_experience_years` | float | Minimum pengalaman kerja dalam tahun. |
| `max_experience_years` | float | Maksimum pengalaman kerja dalam tahun jika tersedia. |
| `education_level_required` | integer | Level pendidikan ordinal: 0 unknown, 2 diploma, 3 bachelor, 4 master. |
| `education_required` | string | Label pendidikan minimum. |
| `work_mode` | string | `remote`, `hybrid`, `onsite`, atau `unknown`. |
| `role_family` | string | Kategori role berbasis rule untuk analisis dan stratifikasi split. |
| `job_text` | string | Gabungan teks lowongan yang menjadi input model. |

Mandatory parameter untuk inference:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `experience_years` | number | yes | Pengalaman kandidat dalam tahun. |
| `skills` | array string | yes | Minimal satu skill kandidat. |
| `certifications` | array string | yes | Kirim array kosong `[]` jika belum ada sertifikasi. |
