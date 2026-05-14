# CakapKarier Career Match Model v1

## Tujuan

Model memprediksi kecocokan profil kandidat terhadap katalog lowongan final dari tim Data Science, lalu menghasilkan readiness score, rekomendasi role, serta skill gap.

## Data

- Sumber:
  - `AIEngine/data/raw/all_data_clean.csv`
  - `AIEngine/data/raw/Data_Dictionary.xlsx`
- Jumlah baris dataset final DS: 2.215
- Jumlah lowongan bersih setelah dedupe model: 2.209
- Distribusi sumber setelah dedupe: Glints 1.980, LinkedIn 229
- Pair training sintetis: 6.627 kandidat-lowongan
- Split: train 4.635, validation 996, test 996

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
- Custom layers:
  - `CosineSimilarityLayer`
  - `AbsoluteDifferenceLayer`
- Custom loss: `CareerMatchLoss`
- Custom callback: `QualityThresholdCallback`
- Custom loop: `tf.GradientTape`

## Evaluasi

Metric terakhir:

- Train accuracy: 0.9962
- Train accuracy: 0.9972
- Train MAE: 0.0133
- Validation accuracy: 0.9970
- Validation MAE: 0.0128
- Test accuracy: 0.9990
- Test MAE: 0.0120
- Test classification report:
  - `not_match` precision 1.0000, recall 0.9985, f1-score 0.9992, support 664
  - `match` precision 0.9970, recall 1.0000, f1-score 0.9985, support 332
- Training time:
  - Epochs run: 6
  - Total epoch time: 58.02 seconds
  - Mean epoch time: 9.67 seconds
  - Last epoch time: 10.51 seconds

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
