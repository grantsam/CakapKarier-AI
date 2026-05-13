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
        extract_certifications_from_text,
        extract_experience_years_from_text,
        learning_recommendations,
        matched_skills,
        missing_skills,
        numeric_feature_values,
        normalize_target_role,
        parse_skill_inputs,
    )
else:
    from .modeling import AbsoluteDifferenceLayer, CosineSimilarityLayer
    from .preprocessing import (
        NUMERIC_FEATURES,
        build_candidate_text,
        education_to_level,
        extract_certifications_from_text,
        extract_experience_years_from_text,
        learning_recommendations,
        matched_skills,
        missing_skills,
        numeric_feature_values,
        normalize_target_role,
        parse_skill_inputs,
    )


TARGET_ROLE_FAMILIES = {
    "front end developer": "software-engineering",
    "back end developer": "software-engineering",
    "data scientist": "data-ai",
    "data analyst": "data-ai",
    "ai engineer": "data-ai",
    "machine learning engineer": "data-ai",
}

TARGET_ROLE_KEYWORDS = {
    "front end developer": ["front end", "frontend", "front-end", "react", "ui developer", "web developer", "wordpress"],
    "back end developer": ["back end", "backend", "back-end", "api developer", "server", "node", "laravel", "php developer"],
    "data scientist": ["data scientist", "data science", "data analyst", "research analyst", "analytics", "business intelligence", "bi analyst"],
    "data analyst": ["data analyst", "analytics", "business intelligence", "bi analyst", "research analyst"],
    "ai engineer": ["ai engineer", "artificial intelligence", "machine learning", "ml engineer", "deep learning", "computer vision", "nlp"],
    "machine learning engineer": ["machine learning", "ml engineer", "deep learning", "computer vision", "nlp"],
}


def _unique(values: list[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()
    for value in values:
        if value and value not in seen:
            seen.add(value)
            result.append(value)
    return result


def _compact(value: object) -> str:
    return "".join(ch for ch in str(value).lower().replace("-", " ") if ch.isalnum())


def _matches_target_role(job: dict[str, Any], target_role: str) -> bool:
    if not target_role:
        return False
    target_compact = _compact(target_role)
    title_compact = _compact(job.get("job_title", ""))
    return bool(target_compact and (target_compact in title_compact or title_compact in target_compact))


def _matches_target_family(job: dict[str, Any], target_role: str) -> bool:
    family = TARGET_ROLE_FAMILIES.get(target_role)
    return bool(family and job.get("role_family") == family)


def _target_alignment(job: dict[str, Any], target_role: str) -> int:
    if not target_role:
        return 0
    if _matches_target_role(job, target_role):
        return 3

    title = str(job.get("job_title", "")).lower().replace("-", " ")
    if any(keyword in title for keyword in TARGET_ROLE_KEYWORDS.get(target_role, [])):
        return 2
    if _matches_target_family(job, target_role):
        return 1
    return 0


def _target_score_adjustment(job: dict[str, Any], target_role: str) -> float:
    alignment = _target_alignment(job, target_role)
    if alignment == 3:
        return 0.18
    if alignment == 2:
        return 0.12
    if alignment == 1:
        return 0.035
    return 0.0


def _readiness_status(score: float) -> str:
    if score >= 85:
        return "Siap"
    if score >= 70:
        return "Cukup Siap"
    return "Perlu Ditingkatkan"


def _gap_priority(index: int) -> str:
    if index < 2:
        return "Tinggi"
    if index < 5:
        return "Menengah"
    return "Rendah"


def _skill_gap_analysis(missing: list[str], role: str | None) -> list[dict[str, str]]:
    role_text = role or "role teratas"
    return [
        {
            "name": skill,
            "priority": _gap_priority(index),
            "description": f"Skill ini relevan untuk {role_text} dan belum kuat terdeteksi dari profil kandidat.",
        }
        for index, skill in enumerate(missing)
    ]


def _roadmap(missing: list[str]) -> list[dict[str, Any]]:
    focus = missing[:6]
    if not focus:
        return [
            {
                "phase": "Fase 1: Penguatan Portofolio (1-2 bulan)",
                "items": [
                    "Tambahkan satu proyek portofolio yang relevan dengan role teratas.",
                    "Dokumentasikan proses kerja, hasil, dan metrik dampak proyek.",
                ],
            },
            {
                "phase": "Fase 2: Validasi Industri (2-3 bulan)",
                "items": [
                    "Bandingkan profil dengan lowongan sejenis dan perbarui CV berdasarkan keyword utama.",
                    "Latihan studi kasus atau technical interview sesuai role target.",
                ],
            },
        ]

    first = focus[:2]
    second = focus[2:4] or focus[:2]
    third = focus[4:6] or focus[:2]
    return [
        {
            "phase": "Fase 1: Dasar Prioritas (1-2 bulan)",
            "items": [f"Pelajari fundamental {skill} dan buat catatan praktik singkat." for skill in first],
        },
        {
            "phase": "Fase 2: Praktik Terarah (2-3 bulan)",
            "items": [f"Terapkan {skill} dalam mini project yang bisa masuk portofolio." for skill in second],
        },
        {
            "phase": "Fase 3: Validasi dan Optimasi (3-4 bulan)",
            "items": [f"Latih studi kasus interview yang menuntut penggunaan {skill}." for skill in third],
        },
    ]


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
        interests: list[str] | str | None = None,
        target_role: str | None = None,
        preferred_location: str | None = None,
        top_k: int = 5,
    ) -> dict[str, Any]:
        candidate_skills = parse_skill_inputs(skills)
        certification_skills = parse_skill_inputs(certifications or [])
        interest_skills = parse_skill_inputs(interests or [])
        combined_skills = _unique(candidate_skills + [skill for skill in certification_skills if skill not in candidate_skills])
        candidate_education_level = education_to_level(education_level)
        target_role_text = normalize_target_role(target_role)
        candidate_text = build_candidate_text(
            skills=combined_skills,
            experience_years=experience_years,
            education_level=candidate_education_level,
            certifications=certification_skills,
            interests=interest_skills,
            target_role=target_role_text,
        )

        job_texts: list[str] = []
        numeric_rows: list[list[float]] = []
        location = (preferred_location or "").lower().strip()

        for job in self.jobs:
            job_texts.append(str(job["job_text"]))
            numeric_rows.append(
                numeric_feature_values(
                    candidate_skills=combined_skills,
                    candidate_certifications=certification_skills,
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
            target_alignment = _target_alignment(job, target_role_text)
            adjusted_score = min(1.0, adjusted_score + _target_score_adjustment(job, target_role_text))
            gaps = missing_skills(combined_skills, job.get("skills", []), limit=8)
            matches = matched_skills(combined_skills, job.get("skills", []), limit=12)
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
                    "target_alignment": target_alignment,
                    "matched_skills": matches,
                    "missing_skills": gaps,
                }
            )

        ranked.sort(key=lambda item: item["match_score"], reverse=True)
        result_count = max(1, min(int(top_k), 20))
        if target_role_text:
            aligned = [item for item in ranked if item["target_alignment"] >= 2]
            if not aligned:
                aligned = [item for item in ranked if item["target_alignment"] >= 1]
            if aligned:
                aligned_ids = {id(item) for item in aligned}
                top_matches = (aligned + [item for item in ranked if id(item) not in aligned_ids])[:result_count]
            else:
                top_matches = ranked[:result_count]
        else:
            top_matches = ranked[:result_count]
        best = top_matches[0]
        recommendations = learning_recommendations(best["missing_skills"])
        mastered = best["matched_skills"] or candidate_skills[:12]
        readiness_score = best["readiness_percentage"]

        return {
            "predicted_role": best["job_title"],
            "target_role": target_role_text or None,
            "role_family": best["role_family"],
            "readiness_score": readiness_score,
            "readiness_status": _readiness_status(readiness_score),
            "match_confidence": best["match_score"],
            "numeric_features": NUMERIC_FEATURES,
            "top_matches": top_matches,
            "skill_gap": best["missing_skills"],
            "skill_gap_count": len(best["missing_skills"]),
            "skill_gap_analysis": _skill_gap_analysis(best["missing_skills"], best["job_title"]),
            "mastered_skills": mastered,
            "mastered_skill_count": len(mastered),
            "roadmap": _roadmap(best["missing_skills"]),
            "recommendations": recommendations,
            "tips": [
                'Fokus pada skill dengan prioritas "Tinggi" terlebih dahulu untuk impact maksimal.',
                "Bangun portofolio project yang mendemonstrasikan skill baru.",
                "Update profil secara berkala agar hasil analisis tetap relevan dengan perkembangan skill.",
            ],
        }

    def predict_from_web_form(
        self,
        *,
        education_level: str | int = "bachelor",
        skills: list[str] | str,
        interests: list[str] | str | None = None,
        experience_text: str | None = None,
        experience_years: float | None = None,
        certifications: list[str] | str | None = None,
        target_role: str | None = None,
        preferred_location: str | None = None,
        top_k: int = 5,
    ) -> dict[str, Any]:
        explicit_certifications = parse_skill_inputs(certifications or [])
        extracted_certifications = extract_certifications_from_text(experience_text or "")
        certification_skills = _unique(explicit_certifications + extracted_certifications)

        resolved_experience = (
            float(experience_years)
            if experience_years is not None
            else extract_experience_years_from_text(experience_text or "")
        )

        return self.predict(
            skills=skills,
            experience_years=resolved_experience,
            education_level=education_level,
            certifications=certification_skills,
            interests=interests,
            target_role=target_role,
            preferred_location=preferred_location,
            top_k=top_k,
        )


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
