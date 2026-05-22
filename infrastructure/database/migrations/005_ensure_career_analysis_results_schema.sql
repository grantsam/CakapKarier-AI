-- Migration 005: Ensure career_analysis_results matches backend analysis repository
-- This migration is idempotent so it can repair an existing partial table safely.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS career_analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_payload JSONB NOT NULL,
    response_payload JSONB NOT NULL,
    predicted_role TEXT,
    target_role TEXT,
    readiness_score NUMERIC(5, 2),
    readiness_status VARCHAR(50),
    mastered_skill_count INTEGER,
    skill_gap_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE career_analysis_results
    ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4(),
    ADD COLUMN IF NOT EXISTS user_id UUID,
    ADD COLUMN IF NOT EXISTS request_payload JSONB,
    ADD COLUMN IF NOT EXISTS response_payload JSONB,
    ADD COLUMN IF NOT EXISTS predicted_role TEXT,
    ADD COLUMN IF NOT EXISTS target_role TEXT,
    ADD COLUMN IF NOT EXISTS readiness_score NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS readiness_status VARCHAR(50),
    ADD COLUMN IF NOT EXISTS mastered_skill_count INTEGER,
    ADD COLUMN IF NOT EXISTS skill_gap_count INTEGER,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE career_analysis_results
    ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
    ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN mastered_skill_count DROP DEFAULT,
    ALTER COLUMN skill_gap_count DROP DEFAULT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'career_analysis_results_pkey'
          AND conrelid = 'career_analysis_results'::regclass
    ) THEN
        ALTER TABLE career_analysis_results
            ADD CONSTRAINT career_analysis_results_pkey PRIMARY KEY (id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'career_analysis_results_user_id_fkey'
          AND conrelid = 'career_analysis_results'::regclass
    ) THEN
        ALTER TABLE career_analysis_results
            ADD CONSTRAINT career_analysis_results_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_career_analysis_results_user_id
    ON career_analysis_results(user_id);

CREATE INDEX IF NOT EXISTS idx_career_analysis_results_user_created_at
    ON career_analysis_results(user_id, created_at DESC);
