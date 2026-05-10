from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

import numpy as np
import tensorflow as tf

if __package__ in {None, ""}:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from career_match.modeling import AbsoluteDifferenceLayer, CosineSimilarityLayer
    from career_match.preprocessing import (
        NUMERIC_FEATURES,
        build_candidate_text,
        education_to_level,
        learning_recommendations,
        missing_skills,
        numeric_feature_values,
        parse_skill_inputs,
    )
else:
    from .modeling import AbsoluteDifferenceLayer, CosineSimilarityLayer
    from .preprocessing import (
        NUMERIC_FEATURES,
        build_candidate_text,
        education_to_level,
        learning_recommendations,
        missing_skills,
        numeric_feature_values,
        parse_skill_inputs,
    )


class CareerMatchService:
    def __init__(self, model_dir: str | Path | None = None):
        ai_engine_root = Path(__file__).resolve().parents[4]
        self.model_dir = Path(model_dir or os.getenv("CAKAP_MODEL_DIR", ai_engine_root / "models" / "registry" / "career-match" / "v1"))
        self.model_path = self.model_dir / "career_match_model.keras"
        self.catalog_path = self.model_dir / "jobs_catalog.json"
        self.model = self._load_model()
        self.jobs = self._load_catalog()

    def _load_model(self) -> tf.keras.Model:
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
        return tf.keras.models.load_model(
            self.model_path,
            custom_objects={
                "AbsoluteDifferenceLayer": AbsoluteDifferenceLayer,
                "CosineSimilarityLayer": CosineSimilarityLayer,
            },
            compile=False,
        )

    def _load_catalog(self) -> list[dict[str, Any]]:
        if not self.catalog_path.exists():
            raise FileNotFoundError(f"Job catalog not found: {self.catalog_path}")
        return json.loads(self.catalog_path.read_text(encoding="utf-8"))

    def predict(
        self,
        *,
        skills: list[str] | str,
        experience_years: float,
        education_level: str | int = "bachelor",
        certifications: list[str] | None = None,
        preferred_location: str | None = None,
        top_k: int = 5,
    ) -> dict[str, Any]:
        candidate_skills = parse_skill_inputs(skills)
        certification_skills = parse_skill_inputs(certifications or [])
        combined_skills = candidate_skills + [skill for skill in certification_skills if skill not in candidate_skills]
        candidate_education_level = education_to_level(education_level)
        candidate_text = build_candidate_text(
            skills=combined_skills,
            experience_years=experience_years,
            education_level=candidate_education_level,
            certifications=certification_skills,
        )

        job_texts: list[str] = []
        numeric_rows: list[list[float]] = []
        location = (preferred_location or "").lower().strip()

        for job in self.jobs:
            job_texts.append(str(job["job_text"]))
            numeric_rows.append(
                numeric_feature_values(
                    candidate_skills=combined_skills,
                    job_skills=job.get("skills", []),
                    candidate_experience_years=float(experience_years),
                    required_min_experience_years=float(job.get("min_experience_years", 0.0)),
                    candidate_education_level=candidate_education_level,
                    required_education_level=int(job.get("education_level_required", 0)),
                )
            )

        inputs = {
            "candidate_text": tf.constant([candidate_text] * len(self.jobs), dtype=tf.string),
            "job_text": tf.constant(job_texts, dtype=tf.string),
            "numeric_features": np.array(numeric_rows, dtype="float32"),
        }
        raw_scores = self.model.predict(inputs, batch_size=128, verbose=0).reshape(-1)

        ranked: list[dict[str, Any]] = []
        for job, score in zip(self.jobs, raw_scores, strict=True):
            adjusted_score = float(score)
            if location and location in str(job.get("location", "")).lower():
                adjusted_score = min(1.0, adjusted_score + 0.025)
            gaps = missing_skills(combined_skills, job.get("skills", []), limit=8)
            ranked.append(
                {
                    "job_id": job.get("job_id"),
                    "job_title": job.get("job_title"),
                    "company": job.get("company"),
                    "location": job.get("location"),
                    "job_detail": job.get("job_detail"),
                    "role_family": job.get("role_family"),
                    "work_mode": job.get("work_mode"),
                    "required_experience_years": job.get("min_experience_years"),
                    "required_education": job.get("education_required"),
                    "match_score": round(adjusted_score, 4),
                    "readiness_percentage": round(adjusted_score * 100.0, 2),
                    "missing_skills": gaps,
                }
            )

        ranked.sort(key=lambda item: item["match_score"], reverse=True)
        top_matches = ranked[: max(1, min(int(top_k), 20))]
        best = top_matches[0]
        recommendations = learning_recommendations(best["missing_skills"])

        return {
            "predicted_role": best["job_title"],
            "role_family": best["role_family"],
            "readiness_score": best["readiness_percentage"],
            "match_confidence": best["match_score"],
            "numeric_features": NUMERIC_FEATURES,
            "top_matches": top_matches,
            "skill_gap": best["missing_skills"],
            "recommendations": recommendations,
        }


def main() -> None:
    service = CareerMatchService()
    result = service.predict(
        skills=["Python", "SQL", "Machine Learning", "Data Analysis"],
        experience_years=2,
        education_level="bachelor",
        certifications=["TensorFlow Developer"],
        top_k=3,
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
