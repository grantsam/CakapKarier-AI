from __future__ import annotations

import sys
from pathlib import Path

AIENGINE_ROOT = Path(__file__).resolve().parents[2]
SERVICE_SRC = AIENGINE_ROOT / "services" / "career-match" / "src"
if str(SERVICE_SRC) not in sys.path:
    sys.path.insert(0, str(SERVICE_SRC))

from career_match.inference import CareerMatchService  # noqa: E402


def main() -> None:
    service = CareerMatchService(AIENGINE_ROOT / "models" / "registry" / "career-match" / "v1")
    prediction = service.predict(
        skills=["Python", "SQL", "Machine Learning", "Data Analysis", "TensorFlow"],
        experience_years=2,
        education_level="bachelor",
        certifications=["TensorFlow Developer"],
        preferred_location="Jakarta",
        top_k=3,
    )
    assert prediction["top_matches"], "Expected at least one match"
    assert 0 <= prediction["readiness_score"] <= 100, "Readiness score must be 0..100"
    assert prediction["recommendations"], "Expected recommendation output"
    assert prediction["skill_gap_analysis"], "Expected web-ready skill gap analysis"
    assert prediction["roadmap"], "Expected roadmap output"

    web_prediction = service.predict_from_web_form(
        education_level="s1",
        skills="Python, SQL, Machine Learning, TensorFlow",
        interests="AI Engineer, Data Analyst, Problem Solving",
        experience_text="1 tahun project machine learning, sertifikasi TensorFlow Developer",
        target_role="ae",
        top_k=3,
    )
    assert web_prediction["top_matches"], "Expected at least one web match"
    assert web_prediction["mastered_skills"], "Expected mastered skills for web result"
    assert web_prediction["readiness_status"] in {"Siap", "Cukup Siap", "Perlu Ditingkatkan"}
    print(
        {
            "predicted_role": prediction["predicted_role"],
            "readiness_score": prediction["readiness_score"],
            "top_match_count": len(prediction["top_matches"]),
            "web_predicted_role": web_prediction["predicted_role"],
            "web_readiness_status": web_prediction["readiness_status"],
        }
    )


if __name__ == "__main__":
    main()
