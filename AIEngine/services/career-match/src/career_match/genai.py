from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any

DEFAULT_OLLAMA_API_URL = "http://localhost:11434/v1/chat/completions"
DEFAULT_OLLAMA_MODEL = "llama3.1"
DEFAULT_GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite"
DEFAULT_TIMEOUT_SECONDS = 8.0
DEFAULT_MAX_RETRIES = 1
DEFAULT_SUMMARY_TEMPERATURE = 0.2
DEFAULT_SUMMARY_MAX_TOKENS = 220


def deterministic_summary(prediction: dict[str, Any]) -> str:
    role = prediction.get("predicted_role", "role teratas")
    score = prediction.get("readiness_score", 0)
    gaps = prediction.get("skill_gap", [])[:3]
    if gaps:
        gap_text = ", ".join(gaps)
        return f"Profil paling dekat dengan {role} dengan readiness {score}%. Fokus peningkatan awal: {gap_text}."
    return f"Profil paling dekat dengan {role} dengan readiness {score}%. Skill inti sudah selaras dengan lowongan teratas."


def genai_config() -> dict[str, Any]:
    provider = os.getenv("GENAI_PROVIDER", "gemini").strip().lower()

    if provider == "ollama":
        api_url = os.getenv("GENAI_API_URL", DEFAULT_OLLAMA_API_URL)
        api_key = os.getenv("GENAI_API_KEY", "")
        models = [os.getenv("GENAI_MODEL", DEFAULT_OLLAMA_MODEL)]
    elif provider == "gemini":
        api_url = os.getenv("GENAI_API_URL", DEFAULT_GEMINI_API_URL)
        api_key = os.getenv("GENAI_API_KEY", "")
        models = [os.getenv("GENAI_MODEL", DEFAULT_GEMINI_MODEL)]
    else:
        api_url = os.getenv("GENAI_API_URL", "")
        api_key = os.getenv("GENAI_API_KEY", "")
        # Parsing fallback models list from GENAI_MODELS or GENAI_MODEL
        env_models = os.getenv("GENAI_MODELS", "")
        if not env_models:
            env_models = os.getenv("GENAI_MODEL", "")

        models = [m.strip() for m in env_models.split(",") if m.strip()]

    try:
        timeout_seconds = float(os.getenv("GENAI_TIMEOUT_SECONDS", str(DEFAULT_TIMEOUT_SECONDS)))
    except ValueError:
        timeout_seconds = DEFAULT_TIMEOUT_SECONDS

    try:
        max_retries = int(os.getenv("GENAI_MAX_RETRIES", str(DEFAULT_MAX_RETRIES)))
    except ValueError:
        max_retries = DEFAULT_MAX_RETRIES

    return {
        "provider": provider,
        "api_url": api_url,
        "api_key_configured": bool(api_key),
        "models": models,
        "timeout_seconds": timeout_seconds,
        "max_retries": max(0, max_retries),
    }


def genai_health() -> dict[str, Any]:
    config = genai_config()
    if not config["api_url"] or not config["models"]:
        return {**config, "available": False, "error": "CONFIG_MISSING: GENAI_API_URL or GENAI_MODELS is empty"}
    if config["provider"] == "gemini" and not config["api_key_configured"]:
        return {**config, "available": False, "error": "CONFIG_MISSING: GENAI_API_KEY is required for Gemini"}

    request = urllib.request.Request(
        config["api_url"],
        data=json.dumps(
            {
                "model": config["models"][0],
                "messages": [{"role": "user", "content": "Balas satu kata: ok"}],
                "temperature": 0,
                "max_tokens": 5,
            }
        ).encode("utf-8"),
        headers=_request_headers(os.getenv("GENAI_API_KEY", "")),
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=config["timeout_seconds"]) as response:
            data = json.loads(response.read().decode("utf-8"))
        content = str(data["choices"][0]["message"]["content"]).strip()
        return {**config, "available": True, "sample": content}
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace") if exc.fp else ""
        return {
            **config,
            "available": False,
            "error": f"HTTPError {exc.code}: {exc.reason}",
            "details": error_body,
        }
    except Exception as exc:  # noqa: BLE001 - health must never crash the API.
        return {**config, "available": False, "error": f"{type(exc).__name__}: {exc}"}


def _request_headers(api_key: str | None) -> dict[str, str]:
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    return headers


def _error_type(exc: Exception) -> str:
    if isinstance(exc, urllib.error.HTTPError):
        return f"HTTP_{exc.code}"
    if isinstance(exc, urllib.error.URLError):
        return "URL_ERROR"
    if isinstance(exc, TimeoutError):
        return "TIMEOUT"
    if isinstance(exc, json.JSONDecodeError):
        return "INVALID_JSON"
    return type(exc).__name__.upper()


def _is_retryable(exc: Exception) -> bool:
    if isinstance(exc, urllib.error.HTTPError):
        return 500 <= exc.code <= 599
    return isinstance(exc, (urllib.error.URLError, TimeoutError))


def _provider_metadata(
    config: dict[str, Any],
    *,
    source: str,
    available: bool,
    model_used: str | None = None,
    error: Exception | None = None,
    error_type: str | None = None,
) -> dict[str, Any]:
    metadata: dict[str, Any] = {
        "ai_summary_source": source,
        "genai_provider": config.get("provider"),
        "genai_model": model_used or (config.get("models")[0] if config.get("models") else None),
        "genai_available": available,
    }
    if error_type:
        metadata["genai_error_type"] = error_type
    elif error is not None:
        metadata["genai_error_type"] = _error_type(error)
    return metadata


def _fallback_result(
    config: dict[str, Any],
    prediction: dict[str, Any],
    error: Exception | None = None,
    error_type: str | None = None,
) -> dict[str, Any]:
    return {
        "ai_summary": deterministic_summary(prediction),
        **_provider_metadata(config, source="deterministic_fallback", available=False, error=error, error_type=error_type),
    }


def generate_summary_result(profile: dict[str, Any], prediction: dict[str, Any]) -> dict[str, Any]:
    """Calls configured OpenAI-compatible GenAI APIs and returns summary metadata."""

    config = genai_config()
    api_url = config["api_url"]
    models = config["models"]
    api_key = os.getenv("GENAI_API_KEY", "")
    if not api_url or not models:
        return _fallback_result(config, prediction, error_type="CONFIG_MISSING")
    if config["provider"] in {"gemini", "openrouter"} and not api_key:
        return _fallback_result(config, prediction, error_type="CONFIG_MISSING")

    prompt = {
        "candidate_profile": {
            "skills": profile.get("skills", []),
            "experience_years": profile.get("experience_years"),
            "education_level": profile.get("education_level"),
            "certifications": profile.get("certifications", []),
            "interests": profile.get("interests", []),
            "target_role": profile.get("target_role"),
            "preferred_location": profile.get("preferred_location"),
        },
        "prediction": {
            "predicted_role": prediction.get("predicted_role"),
            "readiness_score": prediction.get("readiness_score"),
            "skill_gap": prediction.get("skill_gap", []),
            "recommendations": prediction.get("recommendations", []),
            "top_matches": prediction.get("top_matches", [])[:3],
            "roadmap": prediction.get("roadmap", [])[:3],
            "skill_gap_analysis": prediction.get("skill_gap_analysis", {}),
        },
        "instruction": (
            "Tulis ringkasan karier dalam Bahasa Indonesia yang ringkas, konkret, dan bermanfaat. "
            "Maksimal 4 kalimat dengan struktur berikut: "
            "(1) Kecocokan kandidat dengan role yang paling sesuai beserta skor kesiapan. "
            "(2) Kekuatan utama kandidat berdasarkan skill, pengalaman, atau sertifikasi. "
            "(3) 1-2 gap paling penting yang perlu ditingkatkan segera. "
            "(4) Saran prioritas paling praktis dan realistis untuk langkah berikutnya. "
            "Jangan berlebihan, jangan generik, jangan bullet point, jangan mengulang data mentah."
        ),
    }
    base_payload = {
        "messages": [
            {
                "role": "system",
                "content": (
                    "Anda adalah career readiness assistant untuk aplikasi CakapKarier AI. "
                    "Berikan ringkasan karier dalam Bahasa Indonesia yang singkat, profesional, "
                    "konkret, dan relevan dengan data kandidat. "
                    "Fokus pada kecocokan role, kekuatan utama, gap prioritas, "
                    "dan langkah pengembangan paling praktis. "
                    "Hindari klaim berlebihan, motivasi kosong, dan kalimat generik."
                ),
            },
            {"role": "user", "content": json.dumps(prompt, ensure_ascii=False)},
        ],
        "temperature": DEFAULT_SUMMARY_TEMPERATURE,
        "max_tokens": DEFAULT_SUMMARY_MAX_TOKENS,
    }

    last_error: Exception | None = None
    for model in models:
        payload = {**base_payload, "model": model}
        request = urllib.request.Request(
            api_url,
            data=json.dumps(payload).encode("utf-8"),
            headers=_request_headers(api_key),
            method="POST",
        )

        for attempt in range(config["max_retries"] + 1):
            try:
                with urllib.request.urlopen(request, timeout=config["timeout_seconds"]) as response:
                    data = json.loads(response.read().decode("utf-8"))
                content = str(data["choices"][0]["message"]["content"]).strip()
                if content:
                    return {
                        "ai_summary": content,
                        **_provider_metadata(config, source="provider", available=True, model_used=model),
                    }
                last_error = ValueError("empty provider response")
                break
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, KeyError, IndexError, TypeError) as exc:
                last_error = exc
                if attempt < config["max_retries"] and _is_retryable(exc):
                    continue
                break

    return _fallback_result(config, prediction, last_error)


def generate_summary(profile: dict[str, Any], prediction: dict[str, Any]) -> str:
    """Calls a configured OpenAI-compatible GenAI API, with deterministic fallback."""
    return str(generate_summary_result(profile, prediction)["ai_summary"])
