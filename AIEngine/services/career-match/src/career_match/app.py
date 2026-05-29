from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv

from .genai import genai_health, generate_summary_result
from .inference import CareerMatchService
from .schemas import CandidateProfile, HealthResponse, PredictionResponse, WebAnalysisRequest

AIENGINE_ROOT = Path(__file__).resolve().parents[4]
load_dotenv(AIENGINE_ROOT / ".env")

app = FastAPI(title="CakapKarier AI Career Match API", version="1.4.1")
_service: CareerMatchService | None = None


def get_service() -> CareerMatchService:
    global _service
    if _service is None:
        _service = CareerMatchService()
    return _service


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    try:
        service = get_service()
    except FileNotFoundError:
        return HealthResponse(status="model_not_found", model_loaded=False, catalog_size=0)
    return HealthResponse(status="ok", model_loaded=True, catalog_size=len(service.jobs))


@app.get("/genai/health")
def health_genai() -> dict:
    return genai_health()


@app.post("/predict", response_model=PredictionResponse)
def predict(profile: CandidateProfile) -> PredictionResponse:
    try:
        service = get_service()
        prediction = service.predict(
            skills=profile.skills,
            experience_years=profile.experience_years,
            education_level=profile.education_level,
            certifications=profile.certifications,
            interests=profile.interests,
            target_role=profile.target_role,
            preferred_location=profile.preferred_location,
            top_k=profile.top_k,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    if profile.use_genai:
        prediction.update(generate_summary_result(profile.model_dump(), prediction))

    return PredictionResponse(**prediction)


@app.post("/predict/web", response_model=PredictionResponse)
def predict_web(profile: WebAnalysisRequest) -> PredictionResponse:
    try:
        service = get_service()
        prediction = service.predict_from_web_form(
            education_level=profile.education_level,
            skills=profile.skills,
            interests=profile.interests,
            experience_text=profile.experience_text,
            experience_years=profile.experience_years,
            certifications=profile.certifications,
            target_role=profile.target_role,
            preferred_location=profile.preferred_location,
            top_k=profile.top_k,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    if profile.use_genai:
        prediction.update(generate_summary_result(profile.model_dump(), prediction))

    return PredictionResponse(**prediction)
