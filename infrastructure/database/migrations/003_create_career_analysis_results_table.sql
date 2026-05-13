-- Migration 003: Store career analysis results from AIEngine
CREATE TABLE IF NOT EXISTS career_analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_payload JSONB NOT NULL,
    response_payload JSONB NOT NULL,
    predicted_role TEXT,
    target_role TEXT,
    readiness_score NUMERIC(5, 2),
    readiness_status VARCHAR(50),
    mastered_skill_count INTEGER DEFAULT 0,
    skill_gap_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_career_analysis_results_user_id
    ON career_analysis_results(user_id);

CREATE INDEX IF NOT EXISTS idx_career_analysis_results_user_created_at
    ON career_analysis_results(user_id, created_at DESC);
