# CakapKarier Career Match Model v1

## Tujuan

Model memprediksi kecocokan profil kandidat terhadap katalog lowongan Glints dan menghasilkan readiness score, rekomendasi role, serta skill gap.

## Data

- Sumber: `AIEngine/data/raw/glints_jobs.csv`
- Jumlah lowongan: 990
- Pair training sintetis: 2.970 kandidat-lowongan
- Split: train 2.076, validation 447, test 447

Dataset awal hanya berisi data lowongan. Label dibuat dengan weak supervision:

- `1`: profil kandidat sintetis relevan dengan skill, pengalaman, dan pendidikan lowongan.
- `0`: profil kandidat lintas role atau belum memenuhi skill/pengalaman minimum.

## Arsitektur

- TensorFlow/Keras Functional API
- Shared text encoder untuk `candidate_text` dan `job_text`
- Numeric readiness features:
  - `skill_overlap`
  - `experience_ratio`
  - `education_match`
  - `skill_count_ratio`
  - `missing_skill_ratio`
  - `seniority_gap`
- Custom layers:
  - `CosineSimilarityLayer`
  - `AbsoluteDifferenceLayer`
- Custom loss: `CareerMatchLoss`
- Custom callback: `QualityThresholdCallback`
- Custom loop: `tf.GradientTape`

## Evaluasi

Metric terakhir:

- Train accuracy: 0.9995
- Train MAE: 0.0082
- Validation accuracy: 0.9933
- Validation MAE: 0.0159
- Test accuracy: 0.9955
- Test MAE: 0.0156

Target checklist:

- Accuracy minimal 0.85: tercapai.
- MAE maksimal 0.02: tercapai.

## Artefak

- `.keras`: `career_match_model.keras`
- SavedModel: `saved_model/`
- TensorBoard log: `tensorboard/`
- Katalog inference: `jobs_catalog.json`
- Riwayat training: `training_history.csv`
- Metrik: `metrics.json`

## Batasan

Metrik tinggi berasal dari task matching sintetis yang konsisten dengan aturan label. Untuk produksi nyata, model perlu dievaluasi ulang menggunakan data kandidat, histori apply/interview, atau feedback pengguna dari aplikasi.
