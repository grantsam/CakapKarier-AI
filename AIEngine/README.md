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
| Target performa | Selesai | test accuracy `0.9955`, test MAE `0.0156` |
| Notebook ringkas | Selesai | `notebooks/career_match_experiment.ipynb` |

Catatan data: dataset Glints berisi lowongan, bukan histori kandidat yang sudah berlabel. Karena itu label training dibuat sebagai weak/synthetic supervision dari kecocokan skill, role family, pengalaman minimum, dan pendidikan. Ini cukup untuk MVP career matching, tetapi versi produksi berikutnya sebaiknya ditingkatkan dengan data kandidat nyata dan feedback pengguna.

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
