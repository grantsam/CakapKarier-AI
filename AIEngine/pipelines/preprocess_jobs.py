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
    extract_certifications_from_text,
    extract_education_level,
    extract_experience_range,
    extract_skills_from_text,
    extract_work_mode,
    infer_role_family,
    numeric_feature_values,
    parse_skill_inputs,
    split_skills,
    strip_scraper_prefix,
)

DEFAULT_DS_CLEAN_INPUT = AIENGINE_ROOT / "data" / "raw" / "all_data_clean.csv"
DEFAULT_OUTPUT_DIR = AIENGINE_ROOT / "data" / "processed" / "career-match-v1"
MAX_DESCRIPTION_CHARS = 3000
MAX_REQUIREMENTS_CHARS = 2000
DS_CLEAN_COLUMNS = {
    "job_title",
    "company",
    "location",
    "job_detail",
    "description",
    "requirements",
    "skills",
    "job_benefits",
    "source",
}


def truncate_text(value: str, max_chars: int) -> str:
    text = clean_text(value)
    if len(text) <= max_chars:
        return text
    return text[:max_chars].rsplit(" ", 1)[0]


def normalize_missing_strings(frame: pd.DataFrame) -> pd.DataFrame:
    return frame.replace(
        {
            "nan": "",
            "NaN": "",
            "None": "",
            "none": "",
            "NULL": "",
            "null": "",
            "N/A": "",
            "n/a": "",
        }
    )


def default_raw_paths() -> list[Path]:
    return [DEFAULT_DS_CLEAN_INPUT] if DEFAULT_DS_CLEAN_INPUT.exists() else []


def load_data_science_clean_jobs(path: Path) -> pd.DataFrame:
    raw = pd.read_csv(
        path,
        dtype=str,
        keep_default_na=False,
        encoding="utf-8-sig",
        engine="python",
    ).fillna("")
    raw = normalize_missing_strings(raw)
    source = raw.get("source", pd.Series(["data_science"] * len(raw), index=raw.index)).astype(str)
    source = source.str.strip().str.lower().replace({"": "data_science"})
    return pd.DataFrame(
        {
            "source": source,
            "source_sheet": "",
            "source_row_id": raw.get("web_scraper_order", pd.Series(range(len(raw)), index=raw.index)).astype(str),
            "job_title": raw.get("job_title", "").astype(str),
            "company": raw.get("company", "").astype(str),
            "location": raw.get("location", "").astype(str),
            "job_detail": raw.get("job_detail", "").astype(str),
            "description": raw.get("description", "").astype(str),
            "requirements": raw.get("requirements", "").astype(str),
            "skills_text": raw.get("skills", raw.get("skills_clean", "")).astype(str),
            "skills_clean_text": raw.get("skills_clean", "").astype(str),
            "job_benefits": raw.get("job_benefits", "").astype(str),
        }
    )


def load_raw_sources(raw_paths: list[Path]) -> pd.DataFrame:
    frames: list[pd.DataFrame] = []
    for path in raw_paths:
        if not path.exists():
            continue
        suffix = path.suffix.lower()
        if suffix == ".csv":
            header = pd.read_csv(path, nrows=0, encoding="utf-8-sig").columns
            if DS_CLEAN_COLUMNS.issubset(set(header)):
                frames.append(load_data_science_clean_jobs(path))
            else:
                raise ValueError(f"Unsupported CSV schema. Expected Data Science final clean columns in: {path}")
        else:
            raise ValueError(f"Unsupported data source: {path}")

    if not frames:
        raise FileNotFoundError("No dataset found. Expected AIEngine/data/raw/all_data_clean.csv or explicit --input files.")

    raw = pd.concat(frames, ignore_index=True).fillna("")
    raw["job_detail"] = raw["job_detail"].astype(str)
    raw["dedupe_key"] = raw.apply(
        lambda row: clean_text(row["job_detail"]).lower()
        or "|".join(
            [
                clean_text(row["job_title"]).lower(),
                clean_text(row["company"]).lower(),
                clean_text(row["location"]).lower(),
            ]
        ),
        axis=1,
    )
    raw = raw.drop_duplicates(subset=["dedupe_key"]).drop(columns=["dedupe_key"]).reset_index(drop=True)
    return raw


def _merge_skills(row: pd.Series) -> list[str]:
    title = row.get("job_title", "")
    description = row.get("description", "")
    requirements = row.get("requirements", "")
    skills_text = row.get("skills_text", "")

    skills: list[str] = []
    if clean_text(skills_text):
        skills.extend(split_skills(skills_text))
    # `skills_clean_text` from DS is kept for traceability, but `skills_text`
    # preserves multi-word skill phrases better for model features.
    skills.extend(extract_skills_from_text(title, description, requirements))
    if not skills:
        skills.extend(split_skills(title))

    parsed: list[str] = []
    seen: set[str] = set()
    for skill in parse_skill_inputs(skills):
        if skill not in seen:
            seen.add(skill)
            parsed.append(skill)
    return parsed[:40]


def build_clean_jobs(raw_paths: list[Path]) -> pd.DataFrame:
    raw = load_raw_sources(raw_paths)
    records: list[dict[str, Any]] = []

    for idx, row in raw.iterrows():
        skills = _merge_skills(row)
        requirements = truncate_text(strip_scraper_prefix(row.get("requirements", ""), "Job Requirements"), MAX_REQUIREMENTS_CHARS)
        description = truncate_text(row.get("description", ""), MAX_DESCRIPTION_CHARS)
        certifications_required = extract_certifications_from_text(row.get("job_title", ""), requirements, description)
        min_exp, max_exp = extract_experience_range(requirements, description)
        education_required = extract_education_level(requirements, description)
        work_mode = extract_work_mode(requirements, description)
        role_family = infer_role_family(row.get("job_title", ""), row.get("skills_text", ""), description)

        job_text = build_job_text(
            job_title=row.get("job_title", ""),
            description=description,
            requirements=requirements,
            skills=skills,
            certifications=certifications_required,
            work_mode=work_mode,
            min_experience=min_exp,
            education_level_required=education_required,
        )

        source = clean_text(row.get("source", "unknown")) or "unknown"
        source_row_id = clean_text(row.get("source_row_id", "")) or f"{source}-{idx}"
        records.append(
            {
                "job_id": f"{source}-{source_row_id}",
                "source": source,
                "source_sheet": clean_text(row.get("source_sheet", "")),
                "job_title": clean_text(row.get("job_title", "")),
                "company": clean_text(row.get("company", "")),
                "location": clean_text(row.get("location", "")),
                "job_detail": clean_text(row.get("job_detail", "")),
                "description": description,
                "requirements": requirements,
                "skills_text": clean_text(row.get("skills_text", "")),
                "skills_clean_text": clean_text(row.get("skills_clean_text", "")),
                "skills": skills,
                "skills_joined": ", ".join(skills),
                "certifications_required": certifications_required,
                "certifications_required_joined": ", ".join(certifications_required),
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


def _profile_from_job(
    job: pd.Series,
    *,
    underqualified: bool = False,
) -> tuple[list[str], list[str], float, int]:
    skills = parse_skill_inputs(job["skills"])
    min_exp = float(job["min_experience_years"])
    max_exp = float(job["max_experience_years"])
    education = int(job["education_level_required"])
    required_certifications = parse_skill_inputs(job.get("certifications_required", []))

    if underqualified:
        subset_size = max(0, min(len(skills), max(1, len(skills) // 3)))
        profile_skills = skills[:subset_size]
        certifications: list[str] = []
        experience = max(0.0, min_exp - 2.0)
        education = max(0, education - 1)
    else:
        profile_skills = skills
        certifications = required_certifications or skills[: min(2, len(skills))]
        experience = max(min_exp, (min_exp + max_exp) / 2.0 if max_exp else min_exp)
        education = max(education, 3 if education == 0 else education)

    return profile_skills, certifications, float(experience), int(education)


def _make_pair(
    *,
    job: pd.Series,
    candidate_skills: list[str],
    candidate_certifications: list[str],
    candidate_experience: float,
    candidate_education: int,
    label: float,
    pair_type: str,
    source_job_id: str,
) -> dict[str, Any]:
    candidate_text = build_candidate_text(
        skills=candidate_skills,
        experience_years=candidate_experience,
        education_level=candidate_education,
        certifications=candidate_certifications,
    )
    features = numeric_feature_values(
        candidate_skills=candidate_skills,
        candidate_certifications=candidate_certifications,
        job_skills=job["skills"],
        candidate_experience_years=candidate_experience,
        required_min_experience_years=float(job["min_experience_years"]),
        candidate_education_level=candidate_education,
        required_education_level=int(job["education_level_required"]),
        candidate_text=candidate_text,
        job_text=job["job_text"],
    )
    record = {
        "job_id": job["job_id"],
        "source_job_id": source_job_id,
        "pair_type": pair_type,
        "candidate_text": candidate_text,
        "job_text": job["job_text"],
        "label": float(label),
        "job_title": job["job_title"],
        "source": job["source"],
        "role_family": job["role_family"],
        "candidate_certifications": ", ".join(candidate_certifications),
    }
    record.update(dict(zip(NUMERIC_FEATURES, features, strict=True)))
    return record


def synthesize_pairs(jobs: pd.DataFrame, *, seed: int, negatives_per_job: int = 2) -> pd.DataFrame:
    rng = random.Random(seed)
    records: list[dict[str, Any]] = []

    for _, job in jobs.iterrows():
        positive_skills, positive_certifications, positive_experience, positive_education = _profile_from_job(job)
        records.append(
            _make_pair(
                job=job,
                candidate_skills=positive_skills,
                candidate_certifications=positive_certifications,
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
                candidate_skills, candidate_certifications, candidate_experience, candidate_education = _profile_from_job(donor)
                pair_type = "negative_cross_role"
                source_job_id = donor["job_id"]
            else:
                candidate_skills, candidate_certifications, candidate_experience, candidate_education = _profile_from_job(
                    job,
                    underqualified=True,
                )
                pair_type = "negative_underqualified"
                source_job_id = job["job_id"]

            records.append(
                _make_pair(
                    job=job,
                    candidate_skills=candidate_skills,
                    candidate_certifications=candidate_certifications,
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
        "source",
        "source_sheet",
        "job_title",
        "company",
        "location",
        "job_detail",
        "skills",
        "skills_joined",
        "certifications_required",
        "certifications_required_joined",
        "min_experience_years",
        "max_experience_years",
        "education_level_required",
        "education_required",
        "work_mode",
        "role_family",
        "job_text",
    ]
    return jobs[catalog_fields].to_dict(orient="records")


def build_data_dictionary() -> list[dict[str, str]]:
    return [
        {"field": "job_id", "type": "string", "description": "Unique internal job id from source and source row id."},
        {"field": "source", "type": "string", "description": "Data origin, e.g. glints or linkedin."},
        {"field": "job_title", "type": "string", "description": "Job title after text cleaning."},
        {"field": "company", "type": "string", "description": "Company name."},
        {"field": "location", "type": "string", "description": "Job location."},
        {"field": "job_detail", "type": "string", "description": "Original job URL."},
        {"field": "description", "type": "string", "description": "Cleaned job description."},
        {"field": "requirements", "type": "string", "description": "Cleaned requirements text."},
        {"field": "skills_text", "type": "string", "description": "Original DS skill text used as the primary skill extraction source."},
        {"field": "skills_clean_text", "type": "string", "description": "Data Science cleaned skill text retained for audit/EDA traceability."},
        {"field": "skills", "type": "array<string>", "description": "Extracted hard and soft skills."},
        {"field": "skills_joined", "type": "string", "description": "Extracted skills joined for manual inspection and dashboard display."},
        {"field": "certifications_required", "type": "array<string>", "description": "Extracted certification signals from job text."},
        {"field": "certifications_required_joined", "type": "string", "description": "Certification signals joined for manual inspection and dashboard display."},
        {"field": "job_benefits", "type": "string", "description": "Cleaned job benefit text from Data Science final dataset when available."},
        {"field": "min_experience_years", "type": "float", "description": "Minimum required experience in years."},
        {"field": "max_experience_years", "type": "float", "description": "Maximum required experience in years when available."},
        {"field": "education_level_required", "type": "integer", "description": "Ordinal education level: 0 unknown, 2 diploma, 3 bachelor, 4 master."},
        {"field": "education_required", "type": "string", "description": "Human-readable education label for the extracted ordinal education level."},
        {"field": "work_mode", "type": "string", "description": "remote, hybrid, onsite, or unknown."},
        {"field": "role_family", "type": "string", "description": "Rule-based role family used for stratification and analysis."},
        {"field": "job_text", "type": "string", "description": "Combined production text input for the TensorFlow job encoder."},
        {
            "field": "semantic_similarity",
            "type": "float",
            "description": "Unsupervised hashed text-embedding cosine similarity between candidate profile and job text.",
        },
        {"field": "label", "type": "float", "description": "Training pair target: 1 match, 0 not match."},
    ]


def write_data_dictionary(output_dir: Path) -> None:
    dictionary = build_data_dictionary()
    write_json(output_dir / "data_dictionary.json", dictionary)
    rows = ["# Career Match Data Dictionary", "", "| Field | Type | Description |", "| --- | --- | --- |"]
    for item in dictionary:
        rows.append(f"| `{item['field']}` | `{item['type']}` | {item['description']} |")
    (output_dir / "data_dictionary.md").write_text("\n".join(rows) + "\n", encoding="utf-8")


def build_eda_summary(jobs: pd.DataFrame, pair_counts: dict[str, int], raw_paths: list[Path]) -> dict[str, Any]:
    return {
        "business_questions": [
            "Role pekerjaan IT apa yang paling sering muncul dari sumber Glints dan LinkedIn?",
            "Skill apa yang paling banyak diminta oleh pasar kerja?",
            "Bagaimana distribusi pengalaman minimum, work mode, dan lokasi lowongan?",
            "Seberapa siap profil kandidat terhadap lowongan berdasarkan skill, pengalaman, dan sertifikasi?",
        ],
        "raw_sources": [str(path) for path in raw_paths],
        "source_distribution": jobs["source"].value_counts().to_dict(),
        "source_rows": int(len(jobs)),
        "unique_job_titles": int(jobs["job_title"].nunique()),
        "pair_counts": pair_counts,
        "role_family_distribution": jobs["role_family"].value_counts().to_dict(),
        "work_mode_distribution": jobs["work_mode"].value_counts().to_dict(),
        "top_locations": jobs["location"].value_counts().head(15).to_dict(),
        "experience_distribution": jobs["min_experience_years"].value_counts().sort_index().to_dict(),
        "mandatory_parameters": ["experience_years", "skills", "certifications"],
    }


def run(
    raw_path: Path | None = None,
    output_dir: Path = DEFAULT_OUTPUT_DIR,
    seed: int = 42,
    negatives_per_job: int = 2,
    raw_paths: list[Path] | None = None,
) -> dict[str, Any]:
    output_dir.mkdir(parents=True, exist_ok=True)
    selected_paths = raw_paths or ([raw_path] if raw_path is not None else default_raw_paths())
    jobs = build_clean_jobs(selected_paths)
    splits = split_jobs(jobs, seed)

    jobs_for_csv = jobs.copy()
    jobs_for_csv["skills"] = jobs_for_csv["skills"].apply(lambda values: json.dumps(values, ensure_ascii=False))
    jobs_for_csv["certifications_required"] = jobs_for_csv["certifications_required"].apply(
        lambda values: json.dumps(values, ensure_ascii=False)
    )
    jobs_for_csv.to_csv(output_dir / "jobs_processed.csv", index=False)
    write_json(output_dir / "jobs_catalog.json", build_catalog(jobs))
    write_data_dictionary(output_dir)

    pair_counts: dict[str, int] = {}
    for split_name, split_jobs_frame in splits.items():
        pairs = synthesize_pairs(
            split_jobs_frame,
            seed=seed + len(split_name),
            negatives_per_job=negatives_per_job,
        )
        pairs.to_csv(output_dir / f"{split_name}_pairs.csv", index=False)
        pair_counts[split_name] = int(len(pairs))

    metadata = build_eda_summary(jobs, pair_counts, selected_paths)
    metadata.update(
        {
            "output_dir": str(output_dir),
            "seed": seed,
            "numeric_features": NUMERIC_FEATURES,
            "target": "binary career match score: 1=relevant candidate profile, 0=not ready/not relevant",
        }
    )
    write_json(output_dir / "metadata.json", metadata)
    write_json(output_dir / "eda_summary.json", metadata)
    return metadata


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Preprocess job data for CakapKarier career matching.")
    parser.add_argument(
        "--input",
        type=Path,
        nargs="*",
        default=None,
        help="CSV/XLSX input files. Defaults to AIEngine/data/raw/all_data_clean.csv from Data Science.",
    )
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--negatives-per-job", type=int, default=2)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    raw_paths = args.input if args.input else None
    metadata = run(raw_paths=raw_paths, output_dir=args.output_dir, seed=args.seed, negatives_per_job=args.negatives_per_job)
    print(json.dumps(metadata, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
