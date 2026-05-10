from __future__ import annotations

import argparse
import json
import random
import sys
from pathlib import Path
from typing import Any

import pandas as pd
from sklearn.model_selection import train_test_split

AIENGINE_ROOT = Path(__file__).resolve().parents[1]
SERVICE_SRC = AIENGINE_ROOT / "services" / "career-match" / "src"
if str(SERVICE_SRC) not in sys.path:
    sys.path.insert(0, str(SERVICE_SRC))

from career_match.preprocessing import (  # noqa: E402
    NUMERIC_FEATURES,
    build_candidate_text,
    build_job_text,
    clean_text,
    education_label,
    extract_education_level,
    extract_experience_range,
    extract_work_mode,
    infer_role_family,
    numeric_feature_values,
    parse_skill_inputs,
    split_skills,
    strip_scraper_prefix,
)

DEFAULT_INPUT = AIENGINE_ROOT / "data" / "raw" / "glints_jobs.csv"
DEFAULT_OUTPUT_DIR = AIENGINE_ROOT / "data" / "processed" / "career-match-v1"


def build_clean_jobs(raw_path: Path) -> pd.DataFrame:
    raw = pd.read_csv(raw_path).fillna("")
    raw = raw.drop_duplicates(subset=["job_detail"]).reset_index(drop=True)
    records: list[dict[str, Any]] = []

    for idx, row in raw.iterrows():
        skills = split_skills(row.get("Skills", ""))
        if not skills:
            skills = split_skills(row.get("job_title", ""))

        requirements = strip_scraper_prefix(row.get("requirements", ""), "Job Requirements")
        description = clean_text(row.get("description", ""))
        min_exp, max_exp = extract_experience_range(requirements, description)
        education_required = extract_education_level(requirements, description)
        work_mode = extract_work_mode(requirements, description)
        role_family = infer_role_family(row.get("job_title", ""), row.get("Skills", ""), description)

        job_text = build_job_text(
            job_title=row.get("job_title", ""),
            description=description,
            requirements=requirements,
            skills=skills,
            work_mode=work_mode,
            min_experience=min_exp,
            education_level_required=education_required,
        )

        records.append(
            {
                "job_id": str(row.get("web_scraper_order") or f"job-{idx}"),
                "job_title": clean_text(row.get("job_title", "")),
                "company": clean_text(row.get("company", "")),
                "location": clean_text(row.get("location", "")),
                "job_detail": clean_text(row.get("job_detail", "")),
                "description": description,
                "requirements": requirements,
                "skills_text": clean_text(row.get("Skills", "")),
                "skills": skills,
                "skills_joined": ", ".join(skills),
                "job_benefits": clean_text(row.get("job_benefits", "")),
                "min_experience_years": float(min_exp),
                "max_experience_years": float(max_exp),
                "education_level_required": int(education_required),
                "education_required": education_label(education_required),
                "work_mode": work_mode,
                "role_family": role_family,
                "job_text": job_text,
            }
        )

    return pd.DataFrame(records)


def _safe_stratify(frame: pd.DataFrame):
    counts = frame["role_family"].value_counts()
    if (counts >= 2).all() and len(counts) > 1:
        return frame["role_family"]
    return None


def split_jobs(jobs: pd.DataFrame, seed: int) -> dict[str, pd.DataFrame]:
    train_val, test = train_test_split(
        jobs,
        test_size=0.15,
        random_state=seed,
        stratify=_safe_stratify(jobs),
    )
    train, val = train_test_split(
        train_val,
        test_size=0.1765,
        random_state=seed,
        stratify=_safe_stratify(train_val),
    )
    return {
        "train": train.reset_index(drop=True),
        "val": val.reset_index(drop=True),
        "test": test.reset_index(drop=True),
    }


def _profile_from_job(job: pd.Series, *, underqualified: bool = False) -> tuple[list[str], float, int]:
    skills = parse_skill_inputs(job["skills"])
    min_exp = float(job["min_experience_years"])
    max_exp = float(job["max_experience_years"])
    education = int(job["education_level_required"])

    if underqualified:
        subset_size = max(0, min(len(skills), max(1, len(skills) // 3)))
        skills = skills[:subset_size]
        experience = max(0.0, min_exp - 2.0)
        education = max(0, education - 1)
    else:
        experience = max(min_exp, (min_exp + max_exp) / 2.0 if max_exp else min_exp)
        education = max(education, 3 if education == 0 else education)

    return skills, float(experience), int(education)


def _make_pair(
    *,
    job: pd.Series,
    candidate_skills: list[str],
    candidate_experience: float,
    candidate_education: int,
    label: float,
    pair_type: str,
    source_job_id: str,
) -> dict[str, Any]:
    features = numeric_feature_values(
        candidate_skills=candidate_skills,
        job_skills=job["skills"],
        candidate_experience_years=candidate_experience,
        required_min_experience_years=float(job["min_experience_years"]),
        candidate_education_level=candidate_education,
        required_education_level=int(job["education_level_required"]),
    )
    record = {
        "job_id": job["job_id"],
        "source_job_id": source_job_id,
        "pair_type": pair_type,
        "candidate_text": build_candidate_text(
            skills=candidate_skills,
            experience_years=candidate_experience,
            education_level=candidate_education,
            certifications=[],
        ),
        "job_text": job["job_text"],
        "label": float(label),
        "job_title": job["job_title"],
        "role_family": job["role_family"],
    }
    record.update(dict(zip(NUMERIC_FEATURES, features, strict=True)))
    return record


def synthesize_pairs(jobs: pd.DataFrame, *, seed: int, negatives_per_job: int = 2) -> pd.DataFrame:
    rng = random.Random(seed)
    records: list[dict[str, Any]] = []

    for _, job in jobs.iterrows():
        positive_skills, positive_experience, positive_education = _profile_from_job(job)
        records.append(
            _make_pair(
                job=job,
                candidate_skills=positive_skills,
                candidate_experience=positive_experience,
                candidate_education=positive_education,
                label=1.0,
                pair_type="positive_market_fit",
                source_job_id=job["job_id"],
            )
        )

        other_family = jobs[(jobs["role_family"] != job["role_family"]) & (jobs["job_id"] != job["job_id"])]
        fallback_pool = jobs[jobs["job_id"] != job["job_id"]]
        negative_pool = other_family if not other_family.empty else fallback_pool

        for index in range(negatives_per_job):
            if index == 0 and not negative_pool.empty:
                donor = negative_pool.iloc[rng.randrange(len(negative_pool))]
                candidate_skills, candidate_experience, candidate_education = _profile_from_job(donor)
                pair_type = "negative_cross_role"
                source_job_id = donor["job_id"]
            else:
                candidate_skills, candidate_experience, candidate_education = _profile_from_job(job, underqualified=True)
                pair_type = "negative_underqualified"
                source_job_id = job["job_id"]

            records.append(
                _make_pair(
                    job=job,
                    candidate_skills=candidate_skills,
                    candidate_experience=candidate_experience,
                    candidate_education=candidate_education,
                    label=0.0,
                    pair_type=pair_type,
                    source_job_id=source_job_id,
                )
            )

    pairs = pd.DataFrame(records)
    return pairs.sample(frac=1.0, random_state=seed).reset_index(drop=True)


def write_json(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def build_catalog(jobs: pd.DataFrame) -> list[dict[str, Any]]:
    catalog_fields = [
        "job_id",
        "job_title",
        "company",
        "location",
        "job_detail",
        "skills",
        "skills_joined",
        "min_experience_years",
        "max_experience_years",
        "education_level_required",
        "education_required",
        "work_mode",
        "role_family",
        "job_text",
    ]
    return jobs[catalog_fields].to_dict(orient="records")


def run(raw_path: Path, output_dir: Path, seed: int, negatives_per_job: int) -> dict[str, Any]:
    output_dir.mkdir(parents=True, exist_ok=True)
    jobs = build_clean_jobs(raw_path)
    splits = split_jobs(jobs, seed)

    jobs_for_csv = jobs.copy()
    jobs_for_csv["skills"] = jobs_for_csv["skills"].apply(lambda values: json.dumps(values, ensure_ascii=False))
    jobs_for_csv.to_csv(output_dir / "jobs_processed.csv", index=False)
    write_json(output_dir / "jobs_catalog.json", build_catalog(jobs))

    pair_counts: dict[str, int] = {}
    for split_name, split_jobs_frame in splits.items():
        pairs = synthesize_pairs(
            split_jobs_frame,
            seed=seed + len(split_name),
            negatives_per_job=negatives_per_job,
        )
        pairs.to_csv(output_dir / f"{split_name}_pairs.csv", index=False)
        pair_counts[split_name] = int(len(pairs))

    metadata = {
        "raw_path": str(raw_path),
        "output_dir": str(output_dir),
        "seed": seed,
        "source_rows": int(len(jobs)),
        "pair_counts": pair_counts,
        "role_family_distribution": jobs["role_family"].value_counts().to_dict(),
        "work_mode_distribution": jobs["work_mode"].value_counts().to_dict(),
        "numeric_features": NUMERIC_FEATURES,
        "target": "binary career match score: 1=relevant candidate profile, 0=not ready/not relevant",
    }
    write_json(output_dir / "metadata.json", metadata)
    return metadata


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Preprocess Glints job data for CakapKarier career matching.")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--negatives-per-job", type=int, default=2)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    metadata = run(args.input, args.output_dir, args.seed, args.negatives_per_job)
    print(json.dumps(metadata, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
