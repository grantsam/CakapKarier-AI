# Laporan Gap Kontrak Frontend, Backend, dan Model AI

Status dokumen: arsip pra-implementasi. Untuk kontrak terkini setelah integrasi submit, smart evidence, history list, dan history detail, gunakan `docs/architecture/CAREER_MATCH_DATA_FLOW_CONTRACT.md`.

Tanggal review: 2026-05-13  
Scope: form analisis karier, backend gateway, AIEngine `career-match`  
Tujuan: menjelaskan perbedaan input/output frontend dengan input/output model, gap UX akibat faktor user, dan solusi titik tengah untuk penyampaian informasi.

## Ringkasan

Model AI tidak menerima input user dalam bentuk form mentah. Input user dari frontend harus diubah menjadi profil kandidat terstruktur, lalu AIEngine mengubahnya lagi menjadi `candidate_text`, `job_text`, dan `numeric_features` untuk TensorFlow.

Gap utama saat ini bukan hanya teknis field name, tetapi juga gap semantik:

- User berpikir dalam bahasa natural: pengalaman, minat, sertifikasi, skill campur dalam satu narasi.
- UI saat ini meminta beberapa textarea bebas, tetapi belum memaksa struktur yang cukup jelas.
- Model membutuhkan skill yang bisa diparsing, angka tahun pengalaman, level pendidikan, sertifikasi eksplisit, dan target role yang bisa dinormalisasi.
- Output model berupa readiness, skill gap, roadmap, dan top job matches, sedangkan UI result saat ini masih hardcoded dan belum menyampaikan ketidakpastian/interpretasi input.

Kesimpulan: backend sudah bisa menjadi adaptor, tetapi FE perlu menampilkan input confirmation dan result explanation supaya user paham kenapa model memberi skor tertentu.

## Alur Kontrak Saat Ini

```text
User
  -> Frontend form
  -> Express /api/analysis/career-match
  -> AIEngine /predict/web
  -> CareerMatchService.predict_from_web_form()
  -> CareerMatchService.predict()
  -> TensorFlow model
  -> AIEngine response
  -> Express response + DB history
  -> Frontend result page
```

## Kontrak Input Frontend Saat Ini

File UI utama: `WebApplication/frontend-react/src/pages/AnalisisPage.jsx`

| UI Label | Bentuk UI | Required UI | Nilai/Contoh | Masalah Saat Ini |
| --- | --- | --- | --- | --- |
| Pendidikan Terakhir | Select | Ya | `sma`, `d3`, `s1` | UI hanya menyediakan sampai S1, sedangkan model menerima S2/S3/master/phd. |
| Skill yang Dikuasai | Textarea | Ya | `JavaScript, Python, Figma, React, SQL, Git` | Bergantung pada user memisahkan dengan koma; rawan kalimat bebas. |
| Minat dan Bakat | Textarea | Ya | `UI/UX Design, Back-End Developer, Data Analyst` | UI mewajibkan field ini, model menganggap opsional. Maknanya campur antara role, minat, dan soft skill. |
| Pengalaman dan Sertifikasi | Textarea | Tidak | `1 tahun..., sertifikasi AWS...` | Model hanya bisa ekstrak pengalaman jika ada angka/tahun dan sertifikasi jika eksplisit. |
| Target Skill/Role | Select | Tidak | `fe`, `be`, `ds`, `ae` | Nama label "Target Skill/Role" ambigu; sebenarnya dipakai sebagai target role. |

Catatan implementasi: form existing belum memiliki `name`, `value`, state, submit API, atau Authorization header. Ini gap integrasi FE, bukan gap model.

## Kontrak Input Backend Express

Endpoint backend:

```http
POST /api/analysis/career-match
Authorization: Bearer <token>
Content-Type: application/json
```

Schema backend saat ini:

| Field Backend | Required | Tipe | Catatan |
| --- | --- | --- | --- |
| `pendidikan_terakhir` | Default `s1` | string | Menerima `sma`, `smk`, `d3`, `s1`, `s2`, `s3`, atau string non-empty. |
| `skill_yang_dikuasai` | Ya | string | Minimal 2 karakter. |
| `minat_bakat` | Tidak | string/null | Optional di backend. |
| `pengalaman_sertifikasi` | Tidak | string/null | Optional di backend. |
| `target_role` | Tidak | enum | `""`, `fe`, `be`, `ds`, `ae`. |
| `preferred_location` | Tidak | string/null | Sudah didukung backend, belum ada UI. |
| `top_k` | Tidak | integer | Default 5, min 1, max 20. |
| `use_genai` | Tidak | boolean | Default false. |

Backend juga menyimpan hasil ke tabel `career_analysis_results` dengan `user_id` dari JWT.

## Kontrak Input AIEngine `/predict/web`

Endpoint AI:

```http
POST /predict/web
```

Schema AIEngine `WebAnalysisRequest` menerima alias yang lebih luas:

| Field AI Normalized | Alias yang Diterima | Required | Catatan |
| --- | --- | --- | --- |
| `education_level` | `pendidikan_terakhir`, `pendidikanTerakhir`, `pendidikan` | Tidak | Default `bachelor`. |
| `skills` | `skill_yang_dikuasai`, `skillDikuasai` | Ya | Bisa string atau array. |
| `interests` | `minat_bakat`, `minatBakat` | Tidak | String atau array. |
| `experience_text` | `pengalaman_sertifikasi`, `pengalamanSertifikasi`, `pengalaman_dan_sertifikasi` | Tidak | Dipakai untuk ekstraksi pengalaman/sertifikasi. |
| `experience_years` | `experience_years` | Tidak | Jika ada, lebih presisi daripada parsing teks. |
| `certifications` | `sertifikasi`, `certifications` | Tidak | Jika ada, lebih presisi daripada parsing teks. |
| `target_role` | `targetRole`, `target_skill_role` | Tidak | Dinormalisasi ke role canonical. |
| `preferred_location` | `preferred_location` | Tidak | Menambah score kecil jika lokasi cocok. |
| `top_k` | `top_k` | Tidak | Default 5. |
| `use_genai` | `use_genai` | Tidak | Default false. |

Gap penting: AIEngine menerima `experience_years` dan `certifications` secara eksplisit, tetapi frontend/backend MVP lebih mengandalkan satu field gabungan `pengalaman_sertifikasi`.

## Kontrak Input Model TensorFlow

Model TensorFlow tidak menerima field form langsung. AIEngine membangun input berikut:

| Input Model | Tipe | Sumber |
| --- | --- | --- |
| `candidate_text` | batch `tf.string` | Gabungan skill, pengalaman, pendidikan, sertifikasi, minat, target role. |
| `job_text` | batch `tf.string` | Text lowongan dari `jobs_catalog.json`. |
| `numeric_features` | array float | Fitur numerik kandidat vs setiap job. |

`numeric_features`:

| Feature | Makna |
| --- | --- |
| `skill_overlap` | Rasio skill kandidat yang cocok dengan skill lowongan. |
| `certification_overlap` | Rasio sertifikasi kandidat yang cocok dengan skill/kebutuhan lowongan. |
| `experience_ratio` | Kecukupan tahun pengalaman terhadap minimum lowongan. |
| `education_match` | Apakah level pendidikan memenuhi requirement. |
| `skill_count_ratio` | Perbandingan jumlah skill kandidat terhadap jumlah skill lowongan. |
| `missing_skill_ratio` | Rasio skill lowongan yang belum terdeteksi dari kandidat. |
| `seniority_gap` | Jarak senioritas/pengalaman dari requirement. |

Contoh transformasi:

```json
{
  "pendidikan_terakhir": "s1",
  "skill_yang_dikuasai": "Python, SQL, Machine Learning",
  "pengalaman_sertifikasi": "1 tahun project machine learning, sertifikasi TensorFlow Developer",
  "target_role": "ae"
}
```

Menjadi kandidat model secara konseptual:

```text
candidate skills: python, sql, machine learning, tensorflow developer.
experience_years: 1.0.
education: bachelor.
certifications: tensorflow developer.
interests: ...
target_role: ai engineer.
```

Lalu dibandingkan terhadap setiap `job_text` di katalog lowongan.

## Gap User Factor pada Input

| Area | Perilaku User yang Mungkin Terjadi | Dampak ke Model | Solusi Tengah |
| --- | --- | --- | --- |
| Skill | User menulis "saya pernah bikin web pakai react dan node" | Parser lebih optimal jika skill dipisah koma; skill bisa tidak terdeteksi lengkap. | Gunakan chip/token input, bukan textarea murni. Tetap sediakan textarea fallback. |
| Skill level | User punya skill basic dan advanced, tetapi UI tidak bertanya level. | Model menganggap semua skill setara. | Tambahkan optional level: basic/intermediate/advanced, atau minimal "skill utama" vs "skill tambahan". |
| Pengalaman | User menulis "pernah magang" tanpa durasi. | `experience_years` jatuh ke 0. | Tambahkan field angka "Total pengalaman relevan" terpisah dari deskripsi. |
| Sertifikasi | User menulis "punya sertif Dicoding" tanpa kata sertifikasi yang dikenali. | Sertifikasi bisa tidak masuk fitur. | Tambahkan field sertifikasi terpisah berbentuk list. |
| Minat | User mencampur minat, role, soft skill. | Minat masuk ke candidate text, tetapi tidak sekuat skill/target role. | Pisahkan "target role", "bidang minat", dan "gaya kerja/minat aktivitas". |
| Target role | User belum tahu role target. | Model memilih role berdasarkan top match; ini valid. | UI beri mode: "Saya sudah punya target" vs "Bantu rekomendasikan role". |
| Pendidikan | UI hanya sampai S1. | User S2/S3 kehilangan sinyal pendidikan. | Tambahkan S2/S3 dan "Lainnya". |
| Lokasi | UI belum meminta preferensi lokasi. | `preferred_location` tidak dipakai, ranking lowongan kurang personal. | Tambahkan lokasi opsional jika output menampilkan top matches. |
| Confidence | User membaca skor sebagai kebenaran absolut. | Model berbasis weak/synthetic supervision; perlu konteks. | Tampilkan "indikasi kesiapan", "berdasarkan data yang Anda isi", dan input interpretation. |

## Gap Output Frontend vs Output Model

Frontend result saat ini hardcoded:

| Komponen UI Saat Ini | Data Dummy | Output Backend/AI yang Seharusnya |
| --- | --- | --- |
| Target role | `Frontend Developer` | `target_role` atau `predicted_role` |
| Skor kesiapan | `80` | `readiness_score` |
| Deskripsi skor | Static text | `readiness_status`, `match_confidence`, plus explanation FE |
| Skill dikuasai | `HTML`, `CSS`, `JavaScript`, `Git` | `mastered_skills`, `mastered_skill_count` |
| Skill gap count | `5` | `skill_gap_count` |
| Skill gap analysis | Repeated `TypeScript` | `skill_gap_analysis[]` |
| Roadmap | Static frontend roadmap | `roadmap[]` |
| Tips | Static tips | `tips[]` |
| Lowongan/top match | Belum ditampilkan | `top_matches[]` |
| Riwayat | Dummy | `GET /api/analysis/career-match/history` |

## Kontrak Output AIEngine

Response AIEngine:

| Field | Tipe | Fungsi UI |
| --- | --- | --- |
| `predicted_role` | string/null | Role/job title terbaik menurut ranking. |
| `target_role` | string/null | Role target hasil normalisasi input user. |
| `role_family` | string/null | Kelompok role, misalnya `data-ai`. |
| `readiness_score` | number 0-100 | Skor utama readiness. |
| `readiness_status` | string | Label `Siap`, `Cukup Siap`, atau `Perlu Ditingkatkan`. |
| `match_confidence` | number 0-1 | Confidence skor match terbaik. |
| `top_matches` | array | Daftar lowongan/role teratas. |
| `mastered_skills` | array string | Skill kandidat yang cocok dengan role terbaik. |
| `mastered_skill_count` | integer | Jumlah skill cocok. |
| `skill_gap` | array string | Skill yang belum terdeteksi. |
| `skill_gap_count` | integer | Jumlah skill gap. |
| `skill_gap_analysis` | array object | Gap dengan prioritas dan deskripsi. |
| `roadmap` | array object | Fase pengembangan skill. |
| `recommendations` | array string | Rekomendasi pembelajaran. |
| `tips` | array string | Tips umum. |
| `ai_summary` | string/null | Summary opsional bila GenAI aktif. |

Response backend menambahkan:

| Field Backend Tambahan | Fungsi |
| --- | --- |
| `analysis_id` | ID hasil analisis yang tersimpan di database. |
| `saved_at` | Waktu penyimpanan hasil. |

## Gap Information Delivery

Masalah utama output bukan sekadar "field belum dirender", tetapi bagaimana hasil dijelaskan agar tidak menyesatkan user.

| Output Model | Risiko UX | Penyampaian yang Lebih Baik |
| --- | --- | --- |
| `readiness_score` | User menganggap skor final kemampuan diri. | Tampilkan sebagai "Estimasi kesiapan berdasarkan profil yang diisi". |
| `predicted_role` | User bingung jika target `AI Engineer` tetapi predicted `Machine Learning Researcher`. | Tampilkan dua label: "Target Anda" dan "Match terkuat dari katalog". |
| `match_confidence` | Angka 0-1 kurang bermakna. | Ubah ke persen atau label confidence, jangan tampilkan mentah kecuali perlu. |
| `skill_gap` | User merasa gagal karena banyak gap. | Kelompokkan prioritas: tinggi, menengah, rendah; tampilkan 3 teratas dulu. |
| `top_matches` | Bisa dianggap rekomendasi kerja final. | Jelaskan sebagai "lowongan pembanding dari katalog", bukan jaminan cocok. |
| `roadmap` | Bisa terlihat generik jika input kurang detail. | Tampilkan input interpretation agar user tahu data apa yang memengaruhi roadmap. |

## Solusi Titik Tengah yang Direkomendasikan

### 1. Backend Tetap Menjadi Adaptor Stabil

Jangan paksa frontend mengerti input tensor model. FE cukup kirim payload UX-friendly:

```json
{
  "pendidikan_terakhir": "s1",
  "skill_yang_dikuasai": "Python, SQL, Machine Learning",
  "minat_bakat": "AI Engineer, Data Analyst",
  "pengalaman_sertifikasi": "1 tahun project machine learning",
  "target_role": "ae",
  "preferred_location": "Jakarta",
  "top_k": 5
}
```

Backend/AIEngine bertanggung jawab melakukan normalisasi.

### 2. Tambahkan Input Interpretation ke Response Backend

Saat ini response hanya hasil akhir. Untuk mengurangi gap UX, backend dapat menambahkan metadata interpretasi dari payload user:

```json
{
  "input_interpretation": {
    "parsed_skills": ["python", "sql", "machine learning"],
    "parsed_experience_years": 1,
    "parsed_certifications": ["tensorflow developer"],
    "normalized_education": "bachelor",
    "normalized_target_role": "ai engineer",
    "missing_input_warnings": [
      "Sertifikasi tidak terdeteksi eksplisit",
      "Preferensi lokasi belum diisi"
    ]
  }
}
```

Manfaat:

- FE bisa menampilkan "Kami membaca profil Anda sebagai..."
- User bisa memperbaiki input jika interpretasi salah.
- Model tetap tidak perlu diubah.

### 3. Ubah Form Menjadi Hybrid Structured + Free Text

Rekomendasi field FE:

| Field | Bentuk UI | Alasan |
| --- | --- | --- |
| Pendidikan | Select lengkap SMA/SMK, D3, S1, S2, S3 | Menghindari kehilangan sinyal pendidikan. |
| Total pengalaman relevan | Number input / stepper | Menghindari parsing teks gagal. |
| Skill | Tag/chip input + autocomplete ringan | Lebih cocok untuk model daripada textarea bebas. |
| Sertifikasi | Tag/chip input | Lebih presisi untuk `certifications`. |
| Minat bidang | Multi-select/chip | Menghindari campuran role dan soft skill. |
| Target role | Segmented/select + "Belum tahu" | Jelas membedakan guided recommendation vs targeted analysis. |
| Pengalaman singkat | Textarea opsional | Tetap memberi ruang konteks manusia. |
| Preferensi lokasi | Optional input/select | Meningkatkan relevansi `top_matches`. |

### 4. Result Page Harus Menampilkan Dua Layer

Layer 1, ringkasan untuk user:

- Skor kesiapan
- Status kesiapan
- Target user
- Match terkuat dari katalog
- 3 skill gap prioritas tinggi
- Roadmap 3 fase

Layer 2, detail untuk transparansi:

- Skill yang terdeteksi
- Sertifikasi yang terdeteksi
- Pengalaman yang terbaca
- Top matches
- Tombol "Perbaiki input" jika interpretasi kurang tepat

### 5. Naming UI Perlu Dibedakan

Ubah label:

| Saat Ini | Rekomendasi |
| --- | --- |
| Target Skill/Role yang Dituju | Target Role yang Dituju |
| Minat dan Bakat | Bidang Minat / Role yang Diminati |
| Skill yang Dikuasai | Skill Teknis yang Dikuasai |
| Pengalaman dan Sertifikasi | Pengalaman Relevan dan Sertifikasi |

Alasannya: model tidak benar-benar mengukur "bakat". Model membaca skill, pengalaman, pendidikan, sertifikasi, minat, dan kecocokan terhadap katalog job.

## Perbandingan Ringkas FE vs Backend vs AI vs Model

| Layer | Input Utama | Output Utama | Gap |
| --- | --- | --- | --- |
| Frontend saat ini | Form visual tanpa state/API | Halaman dummy | Belum real integration. |
| Backend Express | Payload Indonesia + JWT | AI result + `analysis_id` | Belum menambahkan input interpretation. |
| AIEngine `/predict/web` | Alias form web | Web-ready prediction response | Parsing pengalaman/sertifikasi dari teks masih probabilistik. |
| TensorFlow model | `candidate_text`, `job_text`, `numeric_features` | `match_score` | Tidak memahami user intent di luar teks/fitur yang berhasil diekstrak. |

## Prioritas Penyelesaian Gap

1. FE submit real payload ke backend dan attach JWT.
2. FE render output real dari backend, bukan dummy.
3. FE tambahkan state/loading/error dan fallback jika result kosong.
4. Backend tambahkan `input_interpretation` supaya FE bisa menjelaskan hasil ke user.
5. FE ubah input skill/sertifikasi menjadi chip input.
6. FE tambahkan field pengalaman tahun dan lokasi.
7. History page ambil data dari backend.
8. Di fase berikutnya, AIEngine expose parser endpoint atau parser metadata resmi agar interpretasi input konsisten.

## Rekomendasi Kontrak Handoff untuk FE

FE cukup menganggap backend sebagai satu-satunya kontrak publik.

Request:

```json
{
  "pendidikan_terakhir": "s1",
  "skill_yang_dikuasai": "Python, SQL, Machine Learning",
  "minat_bakat": "AI Engineer, Data Analyst",
  "pengalaman_sertifikasi": "1 tahun project machine learning, sertifikasi TensorFlow Developer",
  "target_role": "ae",
  "preferred_location": "Jakarta",
  "top_k": 5
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "analysis_id": "uuid",
    "saved_at": "timestamp",
    "predicted_role": "Machine Learning Researcher",
    "target_role": "ai engineer",
    "readiness_score": 82.45,
    "readiness_status": "Cukup Siap",
    "mastered_skills": ["python", "sql"],
    "skill_gap_analysis": [
      {
        "name": "pytorch",
        "priority": "Tinggi",
        "description": "..."
      }
    ],
    "roadmap": [
      {
        "phase": "Fase 1: Dasar Prioritas (1-2 bulan)",
        "items": ["..."]
      }
    ],
    "tips": ["..."],
    "top_matches": []
  }
}
```

## Kesimpulan

Model dan UI saat ini berada di tingkat abstraksi yang berbeda. UI meminta cerita karier, sedangkan model membutuhkan sinyal terstruktur. Titik tengah terbaik adalah mempertahankan backend sebagai adaptor, memperbaiki form agar lebih structured, dan menambahkan informasi interpretasi input di response agar user memahami bagaimana sistem membaca profilnya.

Dengan pendekatan ini, FE tidak perlu memahami tensor model, BE tetap menjaga kontrak stabil, dan output AI menjadi lebih dapat dipercaya karena disertai konteks input yang terbaca.
