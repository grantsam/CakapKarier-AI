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
    print(
        {
            "predicted_role": prediction["predicted_role"],
            "readiness_score": prediction["readiness_score"],
            "top_match_count": len(prediction["top_matches"]),
        }
    )


if __name__ == "__main__":
    main()
