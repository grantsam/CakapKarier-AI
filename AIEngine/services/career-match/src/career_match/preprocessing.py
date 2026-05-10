from __future__ import annotations

import re
import unicodedata
from typing import Iterable

NUMERIC_FEATURES = [
    "skill_overlap",
    "experience_ratio",
    "education_match",
    "skill_count_ratio",
    "missing_skill_ratio",
    "seniority_gap",
]

EDUCATION_ALIASES = {
    "none": 0,
    "sma": 1,
    "smk": 1,
    "high school": 1,
    "senior high": 1,
    "diploma": 2,
    "d3": 2,
    "associate": 2,
    "bachelor": 3,
    "bachelors": 3,
    "bachelor's": 3,
    "s1": 3,
    "sarjana": 3,
    "master": 4,
    "masters": 4,
    "s2": 4,
    "phd": 5,
    "doctor": 5,
    "s3": 5,
}

EDUCATION_LABELS = {
    0: "not specified",
    1: "high school",
    2: "diploma",
    3: "bachelor",
    4: "master",
    5: "doctorate",
}

ROLE_PATTERNS = [
    (
        "data-ai",
        r"\b(data scientist|machine learning|ml engineer|ai engineer|artificial intelligence|"
        r"data analyst|data engineer|data pipeline|data warehouse|business intelligence|"
        r"bi analyst|etl|analytics)\b",
    ),
    (
        "software-engineering",
        r"\b(software engineer|software developer|frontend|front end|backend|back end|"
        r"fullstack|full stack|mobile developer|android|ios|programmer|web developer|devops)\b",
    ),
    (
        "qa-security",
        r"\b(quality assurance|qa\b|tester|testing|cyber security|cybersecurity|security analyst|"
        r"penetration|soc analyst|information security)\b",
    ),
    (
        "it-support-network",
        r"\b(it support|technical support|helpdesk|help desk|network|system administrator|sysadmin|"
        r"infrastructure|technical engineer|hardware|troubleshooting)\b",
    ),
    (
        "product-project-business",
        r"\b(project manager|product manager|scrum master|business analyst|system analyst|"
        r"solution analyst|implementation consultant|business consultant|erp consultant)\b",
    ),
    (
        "sales-account",
        r"\b(sales|account manager|account executive|business development|presales|pre sales|"
        r"customer success|marketing)\b",
    ),
    (
        "design-content",
        r"\b(ui/ux|ux designer|ui designer|graphic designer|content|technical writer|writer)\b",
    ),
    (
        "admin-operations",
        r"\b(secretary|administration|admin|operation|operations|finance|hr|human resource)\b",
    ),
]

GENERIC_SKILL_WORDS = {
    "and",
    "atau",
    "the",
    "with",
    "skill",
    "skills",
    "ability",
    "knowledge",
    "job",
    "requirements",
    "experience",
    "minimum",
    "degree",
    "year",
    "years",
    "good",
    "strong",
    "basic",
    "advanced",
}


def normalize_space(value: object) -> str:
    text = "" if value is None else str(value)
    text = text.replace("\xa0", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def clean_text(value: object) -> str:
    text = normalize_space(value)
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[\r\n\t]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def strip_scraper_prefix(value: object, prefix: str) -> str:
    text = clean_text(value)
    return re.sub(rf"^\s*{re.escape(prefix)}\s*", "", text, flags=re.IGNORECASE).strip()


def split_title_case_chunks(value: str) -> str:
    text = value
    text = re.sub(r"(?<=[a-z0-9+#)])(?=[A-Z])", ",", text)
    text = re.sub(r"(?<=[A-Z])(?=[A-Z][a-z])", ",", text)
    return text


def normalize_known_skill_names(value: str) -> str:
    replacements = {
        r"PyTorch": "pytorch",
        r"TensorFlow": "tensorflow",
        r"JavaScript": "javascript",
        r"TypeScript": "typescript",
        r"PowerBI": "power bi",
        r"NodeJS": "node.js",
        r"ReactJS": "react.js",
        r"NextJS": "next.js",
        r"PostgreSQL": "postgresql",
        r"MySQL": "mysql",
        r"MongoDB": "mongodb",
        r"NoSQL": "nosql",
        r"CI/CD": "ci/cd",
        r"RESTAPI": "rest api",
        r"UI/UX": "ui/ux",
    }
    text = value
    for pattern, replacement in replacements.items():
        text = re.sub(pattern, f",{replacement},", text, flags=re.IGNORECASE)
    text = re.sub(r",{2,}", ",", text)
    return text


def clean_skill_phrase(value: object) -> str:
    text = normalize_space(value).lower()
    text = re.sub(r"[^a-z0-9+#./ -]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip(" -./")
    return text


def split_skills(value: object, *, max_items: int = 40) -> list[str]:
    text = strip_scraper_prefix(value, "Skills")
    text = re.sub(
        r"give it a try!\s*-\s*\d+\s+of\s+\d+\s+skills match your profile",
        " ",
        text,
        flags=re.IGNORECASE,
    )
    text = normalize_known_skill_names(text)
    text = split_title_case_chunks(text)
    text = re.sub(r"[|;/\n\r\t]+", ",", text)
    parts = [clean_skill_phrase(part) for part in text.split(",")]

    skills: list[str] = []
    seen: set[str] = set()
    for part in parts:
        if not part or part in seen:
            continue
        if len(part) < 2 or part in GENERIC_SKILL_WORDS:
            continue
        seen.add(part)
        skills.append(part)
        if len(skills) >= max_items:
            break
    return skills


def parse_skill_inputs(skills: Iterable[str] | str) -> list[str]:
    if isinstance(skills, str):
        pieces = re.split(r"[,;|\n\r\t]+", skills)
    else:
        pieces = list(skills)
    parsed: list[str] = []
    seen: set[str] = set()
    for piece in pieces:
        skill = clean_skill_phrase(piece)
        if skill and skill not in seen:
            seen.add(skill)
            parsed.append(skill)
    return parsed


def expand_skill_terms(skills: Iterable[str]) -> set[str]:
    terms: set[str] = set()
    for skill in skills:
        phrase = clean_skill_phrase(skill)
        if not phrase:
            continue
        terms.add(phrase)
        for token in re.split(r"[\s/.-]+", phrase):
            token = clean_skill_phrase(token)
            if len(token) >= 3 and token not in GENERIC_SKILL_WORDS:
                terms.add(token)
    return terms


def skill_overlap_ratio(candidate_skills: Iterable[str], job_skills: Iterable[str]) -> float:
    job_terms = expand_skill_terms(job_skills)
    if not job_terms:
        return 0.0
    candidate_terms = expand_skill_terms(candidate_skills)
    return min(1.0, len(job_terms.intersection(candidate_terms)) / len(job_terms))


def missing_skills(candidate_skills: Iterable[str], job_skills: Iterable[str], *, limit: int = 8) -> list[str]:
    candidate_terms = expand_skill_terms(candidate_skills)
    missing: list[str] = []
    seen: set[str] = set()
    for skill in job_skills:
        skill_key = clean_skill_phrase(skill)
        if not skill_key or skill_key in seen:
            continue
        skill_terms = expand_skill_terms([skill_key])
        if skill_key not in candidate_terms and not skill_terms.intersection(candidate_terms):
            seen.add(skill_key)
            missing.append(skill_key)
        if len(missing) >= limit:
            break
    return missing


def extract_experience_range(*values: object) -> tuple[float, float]:
    text = " ".join(clean_text(value).lower() for value in values if value is not None)
    if re.search(r"fresh graduate|freshgraduate|less than a year|<\s*1", text):
        return 0.0, 0.0

    match = re.search(r"(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*years?", text)
    if match:
        return float(match.group(1)), float(match.group(2))

    match = re.search(r"(?:minimum|min\.?|at least)\s*(\d+(?:\.\d+)?)\s*years?", text)
    if match:
        value = float(match.group(1))
        return value, max(value, value + 2.0)

    match = re.search(r"(\d+(?:\.\d+)?)\s*\+\s*years?", text)
    if match:
        value = float(match.group(1))
        return value, max(value, value + 2.0)

    return 0.0, 0.0


def education_to_level(value: object) -> int:
    if isinstance(value, (int, float)):
        return max(0, min(5, int(value)))
    text = clean_text(value).lower()
    for alias, level in sorted(EDUCATION_ALIASES.items(), key=lambda item: len(item[0]), reverse=True):
        if re.search(rf"\b{re.escape(alias)}\b", text):
            return level
    return 0


def education_label(level: int | float) -> str:
    return EDUCATION_LABELS.get(max(0, min(5, int(level))), "not specified")


def extract_education_level(*values: object) -> int:
    text = " ".join(clean_text(value) for value in values if value is not None)
    return education_to_level(text)


def extract_work_mode(*values: object) -> str:
    text = " ".join(clean_text(value).lower() for value in values if value is not None)
    if re.search(r"\b(remote|wfh|work from home)\b", text):
        return "remote"
    if re.search(r"\bhybrid\b", text):
        return "hybrid"
    if re.search(r"\b(on-site|onsite|on site)\b", text):
        return "onsite"
    return "unknown"


def infer_role_family(title: object, *extra_text: object) -> str:
    text = " ".join([clean_text(title).lower(), *(clean_text(value).lower() for value in extra_text)])
    for family, pattern in ROLE_PATTERNS:
        if re.search(pattern, text, flags=re.IGNORECASE):
            return family
    return "other-it"


def build_job_text(
    *,
    job_title: object,
    description: object,
    requirements: object,
    skills: Iterable[str],
    work_mode: str,
    min_experience: float,
    education_level_required: int,
) -> str:
    skill_text = ", ".join(skills)
    return clean_text(
        "role: "
        f"{job_title}. work_mode: {work_mode}. minimum_experience_years: {min_experience}. "
        f"education: {education_label(education_level_required)}. skills: {skill_text}. "
        f"requirements: {strip_scraper_prefix(requirements, 'Job Requirements')}. "
        f"description: {description}"
    )


def build_candidate_text(
    *,
    skills: Iterable[str],
    experience_years: float,
    education_level: int,
    certifications: Iterable[str] | None = None,
) -> str:
    certification_text = ", ".join(parse_skill_inputs(certifications or []))
    return clean_text(
        f"candidate skills: {', '.join(parse_skill_inputs(skills))}. "
        f"experience_years: {float(experience_years):.1f}. "
        f"education: {education_label(education_level)}. "
        f"certifications: {certification_text}."
    )


def numeric_feature_values(
    *,
    candidate_skills: Iterable[str],
    job_skills: Iterable[str],
    candidate_experience_years: float,
    required_min_experience_years: float,
    candidate_education_level: int,
    required_education_level: int,
) -> list[float]:
    candidate_skills = parse_skill_inputs(candidate_skills)
    job_skills = parse_skill_inputs(job_skills)
    overlap = skill_overlap_ratio(candidate_skills, job_skills)

    if required_min_experience_years <= 0:
        experience_ratio = 1.0
        seniority_gap = 0.0
    else:
        experience_ratio = min(1.0, max(0.0, candidate_experience_years / required_min_experience_years))
        seniority_gap = min(
            1.0,
            max(0.0, required_min_experience_years - candidate_experience_years)
            / max(required_min_experience_years, 1.0),
        )

    education_match = 1.0 if required_education_level <= 0 or candidate_education_level >= required_education_level else 0.0
    skill_count_ratio = 1.0 if not job_skills else min(1.0, len(candidate_skills) / max(len(job_skills), 1))
    missing_skill_ratio = max(0.0, 1.0 - overlap)

    return [
        float(overlap),
        float(experience_ratio),
        float(education_match),
        float(skill_count_ratio),
        float(missing_skill_ratio),
        float(seniority_gap),
    ]


def learning_recommendations(missing: Iterable[str], *, limit: int = 5) -> list[str]:
    recommendations: list[str] = []
    for skill in list(missing)[:limit]:
        recommendations.append(
            f"Bangun bukti portofolio untuk {skill} lewat mini project, latihan studi kasus, dan sertifikasi dasar."
        )
    if not recommendations:
        recommendations.append("Pertahankan skill inti dan tambah satu proyek portofolio yang relevan dengan role teratas.")
    return recommendations
