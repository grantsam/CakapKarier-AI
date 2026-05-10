from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any


def deterministic_summary(prediction: dict[str, Any]) -> str:
    role = prediction.get("predicted_role", "role teratas")
    score = prediction.get("readiness_score", 0)
    gaps = prediction.get("skill_gap", [])[:3]
    if gaps:
        gap_text = ", ".join(gaps)
        return f"Profil paling dekat dengan {role} dengan readiness {score}%. Fokus peningkatan awal: {gap_text}."
    return f"Profil paling dekat dengan {role} dengan readiness {score}%. Skill inti sudah selaras dengan lowongan teratas."


def generate_summary(profile: dict[str, Any], prediction: dict[str, Any]) -> str:
    """Calls a configured OpenAI-compatible GenAI API, with deterministic fallback."""

    api_url = os.getenv("GENAI_API_URL")
    api_key = os.getenv("GENAI_API_KEY")
    model = os.getenv("GENAI_MODEL")
    if not api_url or not api_key or not model:
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
            {"role": "system", "content": "You are a concise career readiness assistant."},
            {"role": "user", "content": json.dumps(prompt, ensure_ascii=False)},
        ],
        "temperature": 0.2,
    }
    request = urllib.request.Request(
        api_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return deterministic_summary(prediction)

    try:
        return str(data["choices"][0]["message"]["content"]).strip() or deterministic_summary(prediction)
    except (KeyError, IndexError, TypeError):
        return deterministic_summary(prediction)
