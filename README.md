# CakapKarier-AI

Monorepo untuk sistem rekomendasi karier dan readiness score berbasis AI.

## Tujuan
- Menyatukan pekerjaan Data Scientist, AI Engineer, Backend Engineer, dan Frontend Engineer dalam struktur yang jelas.
- Mengurangi konflik antar tim lewat ownership, kontrak integrasi, dan dokumentasi singkat.
- Mempercepat onboarding anggota tim baru.
- Tim bergerak independen sesuai kebutuhan area masing-masing, tanpa alur approval berlapis.

## Struktur Ringkas

```text
CakapKarier-AI/
|- ResearchData/        # Data Science
|- AIEngine/            # AI Engineer
|- WebApplication/
|  |- backend-express/  # Backend API
|  `- frontend-react/   # Frontend UI
|- infrastructure/      # Deployment and database
|- docs/                # One place for team guidance
```

## Ownership dan Governance
- Owner review otomatis diatur melalui `.github/CODEOWNERS`.
- Panduan kerja lintas tim ada di `docs/team-guides/TEAM_OPERATING_MODEL.md`.
- Semua aturan inti kerja ada di satu dokumen supaya mudah diikuti.

## Workflow Singkat
1. Ambil task kecil.
2. Kerjakan langsung di area yang kamu pegang.
3. Kalau menyentuh area bersama, buat PR singkat.
4. Minta review seperlunya.
5. Merge dan lanjut task berikutnya.

## Mode Tim Pemula (Rekomendasi Default)
Gunakan mode ini selama fase awal sampai ritme tim stabil.

1. Branching sederhana:
- `main` untuk kode stabil.
- `feature/<nama-tugas>` untuk semua pekerjaan harian.
- Hindari branch tambahan kecuali benar-benar perlu.

2. PR kecil dan cepat:
- Target 1 PR = 1 tujuan kecil.
- Jika terlalu besar, pecah saja.

3. Review ramah pemula:
- Minimal 1 reviewer bila menyentuh area bersama.
- Fokus review pada bug dan kejelasan perubahan.
- Hindari komentar yang terlalu abstrak; berikan contoh perbaikan langsung.

4. Aturan merge:
- Hindari push langsung ke `main`.
- Merge lewat PR kalau menyentuh area bersama atau kontrak.

5. Wajib update dokumentasi jika mengubah kontrak:
- Kontrak data berubah -> update dokumen di area `ResearchData/` dan `AIEngine/shared/schemas/`.
- Kontrak API berubah -> update dokumen backend dan informasikan ke frontend di deskripsi PR.

6. Kalau perubahan hanya lokal dan tidak memengaruhi tim lain:
- Kerjakan langsung di area tugasmu.
- Jangan tunggu koordinasi tambahan.
- Fokus ke deliverable, bukan proses.

## Catatan Implementasi
- Gunakan `kebab-case` untuk folder baru.
- Simpan dokumentasi di satu tempat yang mudah dicari.
- Jika ada perubahan kontrak data/API, update dokumen dan catat di PR.
