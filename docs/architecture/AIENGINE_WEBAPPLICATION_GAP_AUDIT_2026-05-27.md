# Audit Gap AIEngine dan WebApplication

Tanggal audit: 2026-05-27  
Scope: `AIEngine/`, `WebApplication/backend-express/`, `WebApplication/frontend-react/`  
Fokus: gap integrasi field dan fitur yang sudah ada di sebagian layer tetapi belum tersambung penuh end-to-end.

## Ringkasan

Integrasi utama career match sudah berjalan secara konseptual:

```text
Frontend AnalisisPage
  -> Backend Express POST /api/analysis/career-match
  -> AIEngine POST /predict/web
  -> Backend simpan career_analysis_results
  -> Frontend AnalisisResultPage dan HistoryPage
```

Gap terbesar yang masih terlihat bukan lagi "belum ada endpoint", tetapi "field/fitur belum tersambung penuh sampai pengalaman user". Contoh paling jelas:

- `target_role` sudah dikirim sampai AIEngine, tetapi pilihan frontend dan validasi backend masih membatasi role ke `fe`, `be`, `ds`, `ae`, sementara AIEngine punya alias role lebih luas.
- `use_genai` dan `ai_summary` sudah didukung AIEngine/backend, tetapi frontend selalu mengirim `use_genai: false` dan tidak merender `ai_summary`.
- Level skill sudah ada di UI chip, tetapi payload frontend hanya mengirim nama skill, sehingga level hilang sebelum backend dan AIEngine.
- `experience_years` diwajibkan backend, tetapi frontend tidak punya input angka eksplisit; nilainya ditebak dari teks pengalaman dan bisa menjadi `0` tanpa user sadar.

## Status Koneksi Field Utama

| Field/Fitur | Frontend React | Backend Express | AIEngine | Gap tersisa |
| --- | --- | --- | --- | --- |
| `target_role` | Ada select, hanya 4 role plus kosong | Validasi enum `''`, `fe`, `be`, `ds`, `ae` | Menerima alias lebih luas dan menormalisasi role | Role yang didukung AI lebih luas daripada yang bisa dikirim dari web; hasil target ditampilkan sebagai raw normalized text. |
| `use_genai` | Hardcoded `false` | Diteruskan ke AIEngine | Jika `true`, mengisi `ai_summary` | Belum ada toggle/status di UI; `ai_summary` tidak ditampilkan. |
| `ai_summary` | Tidak dipakai | Disimpan dalam `response_payload` jika ada | Dibuat oleh provider GenAI atau fallback deterministik | Output GenAI invisible untuk user. |
| Skill level | UI punya Basic/Intermediate/Advanced | Schema bisa menerima `level`, tetapi normalisasi membuangnya | Tidak punya fitur skill level | User memilih level, tetapi tidak memengaruhi skor/output. |
| `experience_years` | Dihitung dari teks pengalaman | Wajib secara validasi, termasuk nilai `0` | Dipakai untuk `experience_ratio` dan `seniority_gap` | Tidak ada input angka eksplisit; parsing gagal menjadi skor pengalaman rendah. |
| `experience_text` | Ada textarea | Dipakai untuk ekstraksi skill evidence terbatas | Masuk tidak langsung sebagai sinyal semantic candidate/job | Belum ada matching pengalaman per proyek/per skill/per durasi. |
| `experiences[]` terstruktur | Tidak ada UI | Schema dan service sudah mendukung sebagian | Tidak diterima sebagai struktur native | Fitur backend belum tersambung ke form dan model. |
| `preferred_location` | Ada select lokasi | Diteruskan dan masuk input interpretation | Cek substring pada `job.location` | Lokasi seperti "Remote" atau "Jabodetabek" belum match ke `work_mode`/kawasan. |
| `recommendations` | Tidak dirender | Diteruskan dari AIEngine | Dibuat dari missing skills | User hanya melihat `tips`, bukan rekomendasi belajar spesifik. |
| `role_family` | Tidak dirender eksplisit | Disimpan | Dihitung dari job terbaik | Informasi kategori role belum membantu explainability. |
| Health AI/GenAI | Tidak dipakai UI | Endpoint ada, tetapi protected auth | Endpoint ada di AIEngine | Tidak ada preflight status di form; monitoring eksternal lebih sulit karena route backend dilindungi JWT. |
| Model/GenAI metadata | Tidak ditampilkan | Tidak disimpan sebagai kolom/metadata eksplisit | Service version ada di contract, bukan response prediksi | Riwayat sulit diaudit jika model/provider berubah. |

## Gap per Komponen

### AIEngine

1. Target role lebih luas daripada kontrak web.

AIEngine punya `TARGET_ROLE_ALIASES` untuk `front end developer`, `back end developer`, `data scientist`, `data analyst`, `ai engineer`, dan `machine learning engineer` di `AIEngine/services/career-match/src/career_match/preprocessing.py`. Ranking juga memakai `TARGET_ROLE_FAMILIES` dan `TARGET_ROLE_KEYWORDS` di `AIEngine/services/career-match/src/career_match/inference.py`.

Gap: backend dan frontend hanya mengekspos `fe`, `be`, `ds`, `ae`. Role seperti `data analyst` dan `machine learning engineer` sebenarnya bisa dipahami AIEngine, tetapi tidak bisa dipilih dari UI utama dan akan ditolak validasi backend jika dikirim sebagai string canonical.

2. GenAI baru menjadi summary opsional, belum menjadi bagian UX utama.

AIEngine memanggil `generate_summary()` hanya ketika `use_genai` bernilai `true`. Jika provider gagal, AIEngine memakai deterministic fallback tanpa metadata sumber.

Gap: response hanya berisi `ai_summary`, tanpa `ai_summary_source`, `genai_provider_available`, atau `genai_model`. Akibatnya backend/frontend tidak bisa membedakan summary asli provider dengan fallback.

3. Pengalaman relevan belum dimodelkan secara granular.

AIEngine memakai `experience_years` sebagai angka global dan `candidate_text` untuk semantic similarity. Skill dari narasi pengalaman terutama diekstrak di backend dengan kamus keyword.

Gap: belum ada pemetaan "skill X dipakai selama Y bulan di project Z", kualitas project, senioritas tanggung jawab, atau relevansi organisasi. Ini membatasi akurasi untuk kandidat yang punya pengalaman naratif kuat tetapi skill eksplisit kurang lengkap.

4. Preferensi lokasi masih exact substring.

Di inference, `location_match` dihitung dari `preferred_location in job.location`. Ini bekerja untuk kota yang sama persis, tetapi tidak untuk kawasan atau mode kerja.

Gap: opsi frontend seperti "Remote (Kerja dari Rumah)" tidak otomatis match ke `work_mode: remote`, dan "Jabodetabek" tidak otomatis meliputi Jakarta, Bogor, Depok, Tangerang, Bekasi.

5. `non_it` dari frontend tidak punya mapping pendidikan di AIEngine.

Frontend menyediakan `non_it` untuk "Lulusan Non-IT / Bootcamp / Otodidak". AIEngine `EDUCATION_ALIASES` tidak mengenal `non_it`, sehingga nilainya jatuh ke `not specified`.

Gap: user non-IT/bootcamp kehilangan makna input yang lebih spesifik. Perlu keputusan produk apakah `non_it` dianggap `not specified`, `bootcamp`, atau tetap level pendidikan formal yang berbeda.

### Backend Express

1. Validasi `target_role` lebih sempit daripada AIEngine.

`careerMatchAnalysisSchema` hanya menerima enum `''`, `fe`, `be`, `ds`, `ae`.

Gap: backend menjadi bottleneck untuk alias role yang sudah didukung AIEngine. Jika nanti frontend menambah "Data Analyst" atau "Machine Learning Engineer", backend harus diubah dulu.

2. `use_genai` hanya pass-through boolean.

Backend menormalisasi `use_genai` dan meneruskannya ke AIEngine. Endpoint health GenAI juga ada.

Gap: belum ada policy/metadata di response untuk menyatakan apakah GenAI benar-benar aktif, provider apa yang dipakai, atau fallback terjadi. History list juga tidak membawa sinyal "analisis ini memakai GenAI".

3. Skill level diterima schema tetapi hilang di normalisasi.

Schema menerima object skill dengan `name` dan `level`, tetapi `careerEvidence.service.js` menormalisasi array menjadi daftar nama. Payload ke AIEngine memakai `skill_yang_dikuasai` string.

Gap: backend belum punya tempat untuk menyimpan atau meneruskan level skill. Ini membuat UI level terlihat fungsional, padahal belum memengaruhi hasil.

4. `experiences[]` terstruktur belum sampai ke AIEngine.

Backend sudah bisa menerima `experiences[]`, menghitung total durasi, dan mengambil `skills_used`.

Gap: data pengalaman terstruktur tidak dikirim sebagai struktur ke AIEngine. Yang sampai hanya skill gabungan, tahun global, dan teks pengalaman. Detail role, organisasi, durasi per pengalaman, dan skill per pengalaman belum memengaruhi scoring secara langsung.

5. Health endpoint AI/GenAI berada di balik JWT.

`analysis.routes.js` memakai `router.use(protect)` sebelum route `/career-match/health` dan `/career-match/genai/health`.

Gap: ini konsisten untuk fitur user, tetapi kurang ideal untuk monitoring sistem atau readiness check deployment. Frontend juga belum memanggilnya untuk memberi status sebelum submit.

6. History menyimpan payload besar, tetapi metadata audit belum eksplisit.

Tabel `career_analysis_results` menyimpan `request_payload` dan `response_payload`, plus kolom ringkas seperti `predicted_role`, `target_role`, dan `readiness_score`.

Gap: belum ada kolom atau metadata standar untuk `model_version`, `catalog_version`, `ai_service_version`, `genai_provider`, `genai_model`, dan `summary_source`. Jika model berubah, riwayat lama sulit dibandingkan secara akurat.

### Frontend React

1. GenAI belum terhubung ke UI.

Di `AnalisisPage.jsx`, payload selalu mengirim `use_genai: false`. Pencarian pemakaian `ai_summary` di frontend tidak menemukan renderer.

Gap: meskipun AIEngine/backend siap, user tidak bisa mengaktifkan GenAI dan tidak bisa melihat summary yang dihasilkan.

2. Target role ada, tetapi UX masih terbatas.

Frontend punya pilihan kosong, Front-End, Back-End, Data Scientist/Data Analyst, dan AI Engineer/Prompt Engineer.

Gap: tidak ada mode eksplisit "Saya belum punya target" vs "Saya punya target". Hasil dan riwayat menampilkan raw normalized target seperti `ai engineer`, bukan label user-friendly. Role yang didukung AIEngine lebih banyak daripada opsi UI.

3. Level skill terlihat aktif tetapi tidak dikirim.

Chip skill punya dropdown Basic/Intermediate/Advanced. Namun saat submit, payload memakai `selectedSkills.map(s => s.name)`.

Gap: user mengira level skill ikut dipertimbangkan, tetapi backend/AI hanya menerima nama skill.

4. Tahun pengalaman hanya ditebak dari textarea.

`AnalisisPage.jsx` menghitung `experience_years` dari teks `pengalaman_text`. Jika user menulis "pernah magang sebagai frontend" tanpa angka, hasilnya `0`.

Gap: tidak ada input angka eksplisit. Ini berisiko membuat kandidat terlihat tanpa pengalaman walau punya pengalaman, hanya karena durasi tidak tertulis dalam format yang dikenali parser.

5. Output `recommendations`, `role_family`, dan `readiness_features` belum dimanfaatkan.

AIEngine mengirim `recommendations`, `role_family`, dan `readiness_features` pada `top_matches`. Result page saat ini merender `tips`, roadmap, gap, dan top matches dasar.

Gap: rekomendasi belajar spesifik dari missing skill tidak terlihat. `role_family` dan feature explainability belum membantu user memahami kenapa skor muncul.

6. Progress visual memakai `match_confidence`, bukan `readiness_score`.

Result page menghitung `confidencePercent` dari `match_confidence` dan memakainya sebagai width progress bar pada card skor, sementara angka besar yang tampil adalah `readiness_score`.

Gap: ini bisa membuat bar visual tidak konsisten dengan skor utama. Jika ingin bar kesiapan, gunakan `readiness_score`; jika ingin confidence, beri label terpisah.

7. API base URL masih hardcoded local.

`src/utils/api.js` memakai `baseURL: 'http://localhost:3000/api'`. Reference page juga memakai hardcoded `http://localhost:3000`.

Gap: deployment frontend butuh env seperti `VITE_API_BASE_URL`. Tanpa itu, build produksi tetap mengarah ke localhost.

8. Profile belum menjadi sumber data career form.

Profile saat ini hanya menyimpan nama, email, nomor telepon, dan bio. Analisis form tidak prefill dari profile dan profile tidak menyimpan career attributes.

Gap: user harus mengisi ulang pendidikan, skill, pengalaman, sertifikasi, target role, dan lokasi di setiap analisis. History menyimpan snapshot, tetapi tidak ada career profile reusable.

9. Reference page real API tidak terdaftar route.

`AnalisisRealDataReferencePage.jsx` ada, tetapi tidak diimport/diroute di `App.jsx`.

Gap: halaman referensi kontrak tidak bisa diakses dari aplikasi utama kecuali developer menambahkan route manual. Jika masih diperlukan, jadikan route internal/dev; jika tidak, arsipkan agar tidak membingungkan.

## Prioritas Perbaikan

### P0 - Harus dibereskan agar fitur yang sudah terlihat tidak menyesatkan

1. Hubungkan GenAI end-to-end atau sembunyikan klaim GenAI.
   - Tambahkan toggle `use_genai`.
   - Render `ai_summary` di result page.
   - Tampilkan status provider/fallback jika tersedia.

2. Jangan tampilkan skill level sebagai fitur aktif sampai benar-benar dipakai.
   - Opsi cepat: kirim skill sebagai object `{ name, level }` dan simpan di `input_interpretation`.
   - Opsi model: tambah fitur level skill di backend/AI scoring.
   - Jika belum dikerjakan, hapus dropdown level dari chip.

3. Tambahkan input angka `experience_years` eksplisit.
   - Textarea tetap untuk narasi.
   - Parser teks boleh menjadi fallback, bukan sumber utama.

4. Samakan progress bar dengan metric yang ditampilkan.
   - Jika card menampilkan readiness, width bar harus dari `readiness_score`.
   - Jika ingin menampilkan confidence, buat label "Confidence" terpisah.

### P1 - Penting untuk kualitas rekomendasi

1. Perluas kontrak `target_role`.
   - Backend menerima alias canonical yang sudah didukung AIEngine.
   - Frontend menambah opsi role atau mengambil daftar role dari backend.
   - Result/history mapping raw role ke label Indonesia.

2. Normalisasi lokasi.
   - Buat mapping `Remote` -> `work_mode=remote`.
   - Buat kawasan `Jabodetabek` -> daftar kota.
   - Tampilkan lokasi preferensi di transparency panel.

3. Render `recommendations`.
   - Bedakan `recommendations` sebagai langkah belajar spesifik.
   - Biarkan `tips` sebagai saran umum.

4. Tambahkan metadata audit.
   - `model_version`, `catalog_version`, `ai_service_version`.
   - `genai_provider`, `genai_model`, `ai_summary_source`.

### P2 - Improvement pengalaman pengguna dan operasional

1. Gunakan `VITE_API_BASE_URL` untuk frontend.
2. Tambahkan career profile reusable atau prefill dari analisis terakhir.
3. Expose health check operasional tanpa JWT atau melalui route admin/internal.
4. Putuskan nasib `AnalisisRealDataReferencePage`: route dev-only atau arsip.
5. Tambahkan mapping pendidikan untuk `non_it` atau ubah value frontend agar sesuai kontrak AI.

## Checklist Gap yang Belum Dihubungkan

- [ ] UI GenAI toggle -> `use_genai`
- [ ] AIEngine `ai_summary` -> Result page
- [ ] GenAI health -> UI status/preflight atau admin health
- [ ] Skill `level` UI -> backend normalization -> AI scoring atau transparency
- [ ] `experience_years` explicit input -> backend -> AIEngine
- [ ] `target_role` alias luas -> backend validation -> frontend options
- [ ] Raw target role -> label user-friendly di result/history
- [ ] `preferred_location` -> normalized region/work mode matching
- [ ] `recommendations` -> result page
- [ ] `role_family` / readiness explainability -> result page transparency
- [ ] `non_it` education option -> backend/AI mapping
- [ ] `experiences[]` structured -> frontend form dan/atau AIEngine structured scoring
- [ ] Model/GenAI metadata -> response dan history
- [ ] Frontend API URL -> environment variable
- [ ] Profile/career attributes -> prefill analisis atau reusable career profile

## Referensi File

- AIEngine FastAPI endpoints: `AIEngine/services/career-match/src/career_match/app.py`
- AIEngine schema: `AIEngine/services/career-match/src/career_match/schemas.py`
- AIEngine target role, scoring, location match: `AIEngine/services/career-match/src/career_match/inference.py`
- AIEngine aliases dan preprocessing: `AIEngine/services/career-match/src/career_match/preprocessing.py`
- AIEngine GenAI summary: `AIEngine/services/career-match/src/career_match/genai.py`
- Backend validation: `WebApplication/backend-express/src/validations/analysis.validation.js`
- Backend AI bridge: `WebApplication/backend-express/src/services/ai.service.js`
- Backend evidence normalization: `WebApplication/backend-express/src/services/careerEvidence.service.js`
- Backend routes: `WebApplication/backend-express/src/routes/analysis.routes.js`
- Frontend form: `WebApplication/frontend-react/src/pages/AnalisisPage.jsx`
- Frontend result: `WebApplication/frontend-react/src/pages/AnalisisResultPage.jsx`
- Frontend history: `WebApplication/frontend-react/src/pages/HistoryPage.jsx`
- Frontend API client: `WebApplication/frontend-react/src/utils/api.js`
- Frontend routes: `WebApplication/frontend-react/src/App.jsx`
