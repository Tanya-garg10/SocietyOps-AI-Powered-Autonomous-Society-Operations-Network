"""HTTP client for submitting incidents to the SocietyOps server."""

import os
from typing import Any

import requests


class SocietyOpsClient:
    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = (base_url or os.getenv("SOCIETYOPS_API_URL", "http://localhost:3000")).rstrip("/")

    def switch_status(self) -> dict[str, Any]:
        response = requests.get(f"{self.base_url}/api/switch/status", timeout=10)
        response.raise_for_status()
        return response.json()

    def create_incident(self, description: str) -> dict[str, Any]:
        response = requests.post(
            f"{self.base_url}/api/incidents",
            json={
                "description": description,
                "building": "Block B (Maple)",
                "flat": "B-204",
                "residentName": "Priya Sharma",
            },
            timeout=30,
        )
        response.raise_for_status()
        result = response.json()
        if not result.get("success"):
            raise RuntimeError(result.get("error", "SocietyOps rejected the incident."))
        return result["data"]
