from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any

DEFAULT_GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"
DEFAULT_TIMEOUT_SECONDS = 8.0
DEFAULT_TEMPERATURE = 0.2
DEFAULT_MAX_TOKENS = 180


def deterministic_summary(prediction: dict[str, Any]) -> str:
    role = prediction.get("predicted_role", "role teratas")
    score = prediction.get("readiness_score", 0)
    gaps = prediction.get("skill_gap", [])[:3]
    if gaps:
        gap_text = ", ".join(gaps)
        return f"Profil paling dekat dengan {role} dengan readiness {score}%. Fokus peningkatan awal: {gap_text}."
    return f"Profil paling dekat dengan {role} dengan readiness {score}%. Skill inti sudah selaras dengan lowongan teratas."


def genai_config() -> dict[str, Any]:
    provider = "gemini"
    api_url = os.getenv("GENAI_API_URL", DEFAULT_GEMINI_API_URL)
    api_key = os.getenv("GENAI_API_KEY", "")
    model = os.getenv("GENAI_MODEL", DEFAULT_GEMINI_MODEL)

    try:
        timeout_seconds = float(os.getenv("GENAI_TIMEOUT_SECONDS", str(DEFAULT_TIMEOUT_SECONDS)))
    except ValueError:
        timeout_seconds = DEFAULT_TIMEOUT_SECONDS

    try:
        temperature = float(os.getenv("GENAI_TEMPERATURE", str(DEFAULT_TEMPERATURE)))
    except ValueError:
        temperature = DEFAULT_TEMPERATURE

    try:
        max_tokens = int(os.getenv("GENAI_MAX_TOKENS", str(DEFAULT_MAX_TOKENS)))
    except ValueError:
        max_tokens = DEFAULT_MAX_TOKENS

    return {
        "provider": provider,
        "api_url": api_url,
        "api_key_configured": bool(api_key),
        "model": model,
        "timeout_seconds": timeout_seconds,
        "temperature": max(0.0, min(1.0, temperature)),
        "max_tokens": max(16, min(1024, max_tokens)),
    }


def genai_health() -> dict[str, Any]:
    config = genai_config()
    request = urllib.request.Request(
        config["api_url"],
        data=json.dumps(
            {
                "model": config["model"],
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
    except Exception as exc:  # noqa: BLE001 - health must never crash the API.
        return {**config, "available": False, "error": f"{type(exc).__name__}: {exc}"}


def _request_headers(api_key: str | None) -> dict[str, str]:
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    return headers


def generate_summary(profile: dict[str, Any], prediction: dict[str, Any]) -> str:
    """Calls a configured OpenAI-compatible GenAI API, with deterministic fallback."""

    config = genai_config()
    api_url = config["api_url"]
    model = config["model"]
    api_key = os.getenv("GENAI_API_KEY", "")
    if not api_url or not model:
        return deterministic_summary(prediction)

    prompt = {
        "candidate_profile": profile,
        "prediction": {
            "predicted_role": prediction.get("predicted_role"),
            "readiness_score": prediction.get("readiness_score"),
            "skill_gap": prediction.get("skill_gap", []),
            "recommendations": prediction.get("recommendations", []),
        },
        "instruction": "Tulis ringkasan karier Bahasa Indonesia maksimal 3 kalimat, konkret, tanpa klaim berlebihan.",
    }
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "Anda adalah career readiness assistant untuk aplikasi CakapKarier AI. "
                    "Jawab dalam Bahasa Indonesia, ringkas, konkret, dan tidak berlebihan."
                ),
            },
            {"role": "user", "content": json.dumps(prompt, ensure_ascii=False)},
        ],
        "temperature": config["temperature"],
        "max_tokens": config["max_tokens"],
    }
    request = urllib.request.Request(
        api_url,
        data=json.dumps(payload).encode("utf-8"),
        headers=_request_headers(api_key),
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=config["timeout_seconds"]) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return deterministic_summary(prediction)

    try:
        return str(data["choices"][0]["message"]["content"]).strip() or deterministic_summary(prediction)
    except (KeyError, IndexError, TypeError):
        return deterministic_summary(prediction)
