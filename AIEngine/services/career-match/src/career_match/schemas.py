from __future__ import annotations

from pydantic import BaseModel, Field


class CandidateProfile(BaseModel):
    skills: list[str] = Field(..., min_length=1)
    experience_years: float = Field(..., ge=0, le=60)
    education_level: str | int = Field(default="bachelor")
    certifications: list[str] = Field(default_factory=list)
    preferred_location: str | None = None
    top_k: int = Field(default=5, ge=1, le=20)
    use_genai: bool = False


class MatchItem(BaseModel):
    job_id: str | None = None
    job_title: str | None = None
    company: str | None = None
    location: str | None = None
    job_detail: str | None = None
    role_family: str | None = None
    work_mode: str | None = None
    required_experience_years: float | None = None
    required_education: str | None = None
    match_score: float
    readiness_percentage: float
    missing_skills: list[str]


class PredictionResponse(BaseModel):
    predicted_role: str | None = None
    role_family: str | None = None
    readiness_score: float
    match_confidence: float
    top_matches: list[MatchItem]
    skill_gap: list[str]
    recommendations: list[str]
    ai_summary: str | None = None


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    catalog_size: int
