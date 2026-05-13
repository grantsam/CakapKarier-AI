# AIEngine

Area kerja AI Engineer.

## Fokus
- Inference services untuk matching dan readiness.
- Data pipeline untuk ingestion dan feature generation.
- Model versioning dan shared schema lintas tim.

## Struktur penting
- `services/`: service inference per domain.
- `pipelines/`: alur data otomatis.
- `models/registry/`: metadata model dan versi.
- `shared/schemas/`: kontrak data lintas service.
- `tests/integration/`: pengujian lintas komponen.

## Deliverable Career Match v1

Model AI yang sudah dibuat berada di domain `career-match` untuk fitur prediksi role, readiness score, skill gap, dan rekomendasi pengembangan skill.
Service juga menyediakan adapter `/predict/web` untuk kebutuhan integrasi `WebApplication`, sehingga backend web bisa mengirim bentuk data dari form analisis tanpa mengubah model inti.

### Checklist AI Engineer

| Checklist | Status | Artefak |
| --- | --- | --- |
| TensorFlow Functional API | Selesai | `services/career-match/src/career_match/modeling.py` |
| Custom Layer | Selesai | `CosineSimilarityLayer`, `AbsoluteDifferenceLayer` |
| Custom Loss Function | Selesai | `CareerMatchLoss` |
| Custom Callback | Selesai | `QualityThresholdCallback` |
| Export `.keras` | Selesai | `models/registry/career-match/v1/career_match_model.keras` |
| Export SavedModel | Selesai | `models/registry/career-match/v1/saved_model/` |
| Kode inference sederhana | Selesai | `services/career-match/src/career_match/inference.py` |
| FastAPI REST API | Selesai | `services/career-match/src/career_match/app.py` |
| Custom training loop `tf.GradientTape` | Selesai | `pipelines/train_model.py` |
| Generative AI optional summary | Selesai | `services/career-match/src/career_match/genai.py` |
| TensorBoard log | Selesai | `models/registry/career-match/v1/tensorboard/` |
| Classification report visual | Selesai | `models/registry/career-match/v1/classification_report.png` |
| Confusion matrix visual | Selesai | `models/registry/career-match/v1/confusion_matrix.png` |
| Target performa | Selesai | test accuracy `0.9990`, test MAE `0.0120` |
| Notebook ringkas | Selesai | `notebooks/career_match_experiment.ipynb` |

Catatan data: dataset utama sekarang memakai final clean dataset dari tim Data Science. Dataset tetap berisi lowongan, bukan histori kandidat yang sudah berlabel. Karena itu label training dibuat sebagai weak/synthetic supervision dari kecocokan skill, sertifikasi, role family, pengalaman minimum, dan pendidikan. Ini cukup untuk MVP career matching, tetapi versi produksi berikutnya sebaiknya ditingkatkan dengan data kandidat nyata dan feedback pengguna.

### Data Gabungan

- Final clean dataset DS: `data/raw/all_data_clean.csv`
- Data dictionary DS: `data/raw/Data_Dictionary.xlsx`
- Processed jobs: `data/processed/career-match-v1/jobs_processed.csv`
- Jumlah baris final DS: 2.215
- Jumlah lowongan bersih setelah dedupe model: 2.209
- Sumber data setelah dedupe: Glints 1.980, LinkedIn 229
- Training pairs sintetis: 6.627
- Mandatory inference parameters: `experience_years`, `skills`, `certifications`
- Web adapter: `POST /predict/web` menerima `pendidikan_terakhir`, `skill_yang_dikuasai`, `minat_bakat`, `pengalaman_sertifikasi`, dan `target_role`
- Data dictionary: `data/processed/career-match-v1/data_dictionary.md`

### Cara Menjalankan

Install dependency:

```bash
cd AIEngine
python -m pip install -r requirements.txt
```

Preprocessing:

```bash
python pipelines/preprocess_jobs.py
```

Training, evaluasi, export model, dan TensorBoard log:

```bash
python pipelines/train_model.py
```

Inference langsung:

```bash
python services/career-match/src/career_match/inference.py
```

REST API:

```bash
uvicorn career_match.app:app --app-dir services/career-match/src --host 127.0.0.1 --port 8001
```

TensorBoard:

```bash
tensorboard --logdir models/registry/career-match/v1/tensorboard
```

Smoke test:

```bash
python tests/integration/smoke_inference.py
```
