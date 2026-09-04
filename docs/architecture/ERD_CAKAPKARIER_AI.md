# Entity Relationship Diagram (ERD) — CakapKarier-AI

**Tanggal:** 2026-06-24 | **Database:** PostgreSQL | **4 Tabel, 3 Relasi, 5 Scope**

---

## ERD — 1 Diagram Mermaid

```mermaid
erDiagram
    users {
        uuid id PK
        varchar nama NN
        varchar email NN
        varchar password NN
        timestamptz created_at
        timestamptz updated_at
    }

    profiles {
        uuid id PK
        uuid user_id FK NN
        varchar nomor_telepon
        text bio
        timestamptz created_at
        timestamptz updated_at
    }

    career_analysis_results {
        uuid id PK
        uuid user_id FK NN
        jsonb request_payload NN
        jsonb response_payload NN
        text predicted_role
        text target_role
        numeric readiness_score
        varchar readiness_status
        integer mastered_skill_count
        integer skill_gap_count
        timestamptz created_at
    }

    password_reset_tokens {
        uuid id PK
        uuid user_id FK NN
        varchar token_hash NN
        timestamptz expires_at NN
        timestamptz used_at
        timestamptz created_at
    }

    users ||--|| profiles : "has profile"
    users ||--o{ career_analysis_results : "runs analysis"
    users ||--o{ password_reset_tokens : "requests reset"
```

---

## Detail Relasi & Scope

| # | Scope                    | Tabel                                         |
|---|--------------------------|-----------------------------------------------|
| 1 | Authentication           | `users`, `password_reset_tokens`              |
| 2 | User Profile (Basic)     | `users`                                       |
| 3 | Extended Profile         | `profiles`                                    |
| 4 | Career Match Analysis    | `career_analysis_results`                     |
| 5 | Analysis History         | `career_analysis_results`                     |

*CakapKarier-AI - ERD - 2026-06-24*
