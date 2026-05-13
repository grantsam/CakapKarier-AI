from __future__ import annotations

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class CandidateProfile(BaseModel):
    skills: list[str] = Field(..., min_length=1)
    experience_years: float = Field(..., ge=0, le=60)
    education_level: str | int = Field(default="bachelor")
    certifications: list[str] = Field(..., description="Daftar sertifikasi kandidat; kirim array kosong jika belum ada.")
    interests: list[str] | str | None = None
    target_role: str | None = None
    preferred_location: str | None = None
    top_k: int = Field(default=5, ge=1, le=20)
    use_genai: bool = False


class WebAnalysisRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    education_level: str | int = Field(
        default="bachelor",
        validation_alias=AliasChoices("education_level", "pendidikan_terakhir", "pendidikanTerakhir", "pendidikan"),
    )
    skills: list[str] | str = Field(
        ...,
        validation_alias=AliasChoices("skills", "skill_yang_dikuasai", "skillDikuasai"),
    )
    interests: list[str] | str | None = Field(
        default=None,
        validation_alias=AliasChoices("interests", "minat_bakat", "minatBakat"),
    )
    experience_text: str | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "experience_text",
            "pengalaman_sertifikasi",
            "pengalamanSertifikasi",
            "pengalaman_dan_sertifikasi",
        ),
    )
    experience_years: float | None = Field(default=None, ge=0, le=60)
    certifications: list[str] | str | None = Field(
        default=None,
        validation_alias=AliasChoices("certifications", "sertifikasi"),
    )
    target_role: str | None = Field(
        default=None,
        validation_alias=AliasChoices("target_role", "targetRole", "target_skill_role"),
    )
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
    matched_skills: list[str]
    missing_skills: list[str]


class SkillGapItem(BaseModel):
    name: str
    priority: str
    description: str


class RoadmapPhase(BaseModel):
    phase: str
    items: list[str]


class PredictionResponse(BaseModel):
    predicted_role: str | None = None
    target_role: str | None = None
    role_family: str | None = None
    readiness_score: float
    readiness_status: str
    match_confidence: float
    top_matches: list[MatchItem]
    skill_gap: list[str]
    skill_gap_count: int
    skill_gap_analysis: list[SkillGapItem]
    mastered_skills: list[str]
    mastered_skill_count: int
    roadmap: list[RoadmapPhase]
    recommendations: list[str]
    tips: list[str]
    ai_summary: str | None = None


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    catalog_size: int
