-- Migration 004: Avoid fabricated zero counts when AIEngine does not send output metrics
ALTER TABLE career_analysis_results
    ALTER COLUMN mastered_skill_count DROP DEFAULT,
    ALTER COLUMN skill_gap_count DROP DEFAULT;
