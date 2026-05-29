from __future__ import annotations

import sys
from pathlib import Path

AIENGINE_ROOT = Path(__file__).resolve().parents[2]
SERVICE_SRC = AIENGINE_ROOT / "services" / "career-match" / "src"
if str(SERVICE_SRC) not in sys.path:
    sys.path.insert(0, str(SERVICE_SRC))

from career_match.genai import deterministic_summary, genai_health, generate_summary  # noqa: E402


def main() -> None:
    prediction = {
        "predicted_role": "Data Analyst",
        "readiness_score": 72.5,
        "skill_gap": ["communication", "power bi"],
        "recommendations": ["Bangun dashboard portofolio."],
    }
    profile = {
        "skills": ["Python", "SQL", "Data Analysis"],
        "experience_years": 1,
        "target_role": "ds",
    }

    summary = generate_summary(profile, prediction)
    fallback = deterministic_summary(prediction)
    assert summary, "Expected GenAI or fallback summary"

    health = genai_health()
    print(
        {
            "provider": health.get("provider"),
            "model": health.get("model"),
            "available": health.get("available"),
            "used_fallback": summary == fallback,
            "summary": summary,
        }
    )


if __name__ == "__main__":
    main()
