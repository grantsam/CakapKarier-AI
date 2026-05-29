# CakapKarier Career Match Model v1

## Tujuan

Model memprediksi kecocokan profil kandidat terhadap katalog lowongan final dari tim Data Science, lalu menghasilkan readiness score, rekomendasi role, serta skill gap.

## Data

- Sumber:
  - `AIEngine/data/raw/all_data_final.csv`
  - `AIEngine/data/raw/Data_Dictionary.csv`
- Jumlah baris dataset final DS: 5.865
- Jumlah lowongan bersih setelah dedupe model: 5.859
- Distribusi sumber setelah dedupe: Glints 5.630, LinkedIn 229
- Pair training sintetis: 17.577 kandidat-lowongan
- Split: train 12.303, validation 2.637, test 2.637

Dataset final DS berisi data lowongan yang sudah melalui gathering, assessing, cleaning, transforming, feature engineering awal, merging, EDA, dan export final dataset. Karena dataset tetap berupa lowongan, bukan histori kandidat berlabel, label model dibuat dengan weak supervision:

- `1`: profil kandidat sintetis relevan dengan skill, sertifikasi, pengalaman, dan pendidikan lowongan.
- `0`: profil kandidat lintas role atau belum memenuhi skill/sertifikasi/pengalaman minimum.

## Arsitektur

- TensorFlow/Keras Functional API
- Shared text encoder untuk `candidate_text` dan `job_text`
- Numeric readiness features:
  - `skill_overlap`
  - `certification_overlap`
  - `experience_ratio`
  - `education_match`
  - `skill_count_ratio`
  - `missing_skill_ratio`
  - `seniority_gap`
  - `semantic_similarity`
- `semantic_similarity` dihitung dari cosine similarity antara hashed text embedding kandidat dan job text. Fitur ini bersifat unsupervised/self-supervised style karena tidak membutuhkan label tambahan dan memberi sinyal kemiripan semantik teks.
- Custom layers:
  - `CosineSimilarityLayer`
  - `AbsoluteDifferenceLayer`
- Custom loss: `CareerMatchLoss`
- Custom callback: `QualityThresholdCallback`
- Custom loop: `tf.GradientTape`

## Evaluasi

Metric terakhir:

- Train accuracy: 0.9976
- Train MAE: 0.0113
- Validation accuracy: 0.9989
- Validation MAE: 0.0045
- Test accuracy: 0.9977
- Test MAE: 0.0050
- Test classification report:
  - `not_match` precision 0.9989, recall 1.0000, f1-score 0.9994, support 1.758
  - `match` precision 1.0000, recall 0.9977, f1-score 0.9989, support 879
- Training time:
  - Epochs run: 5
  - Total epoch time: 188.64 seconds
  - Mean epoch time: 37.73 seconds
  - Last epoch time: 37.65 seconds

Target checklist:

- Accuracy minimal 0.85: tercapai.
- MAE maksimal 0.02: tercapai.

## Artefak

- `.keras`: `career_match_model.keras`
- SavedModel: `saved_model/`
- TensorBoard log: `tensorboard/`
- Classification report: `classification_report.txt`, `classification_report.csv`
- Confusion matrix: `confusion_matrix.png`
- Test predictions: `test_predictions.csv`
- Katalog inference: `jobs_catalog.json`
- Riwayat training: `training_history.csv`
- Metrik: `metrics.json`

## Batasan

Metrik tinggi berasal dari task matching sintetis yang konsisten dengan aturan label. Untuk produksi nyata, model perlu dievaluasi ulang menggunakan data kandidat, histori apply/interview, atau feedback pengguna dari aplikasi.
