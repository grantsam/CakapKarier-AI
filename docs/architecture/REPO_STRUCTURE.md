# Repository Structure

## Top-level layout

- `ResearchData/`: area Data Science (dataset, notebooks, eksperimen).
- `AIEngine/`: area AI Engineering (services, pipelines, model registry).
- `WebApplication/`: area aplikasi web (backend + frontend).
- `infrastructure/`: deployment, database migration, dan operasional.
- `docs/`: dokumentasi arsitektur, SOP tim, dan handoff.

## Cross-team contracts

1. Data contract (Data Scientist -> AI Engineer)
- Referensi: `ResearchData/docs/` dan `AIEngine/shared/schemas/`.
- Format utama: schema feature, satuan nilai, handling missing value.

2. Inference contract (AI Engineer -> Backend)
- Referensi: `AIEngine/services/*/src/`.
- Format utama: request/response inference, kode error, SLA.

3. API contract (Backend -> Frontend)
- Referensi: `WebApplication/backend-express/src/api/`.
- Format utama: endpoint, payload, auth requirement, pagination.

## Naming conventions
- Gunakan `kebab-case` untuk nama folder.
- Gunakan `feature-based grouping` untuk frontend dan backend modules.
- Simpan dokumen domain di folder `docs` paling dekat dengan domain tersebut.
