# ---------------------------------------------------------------------------
# MCP Context Server — access layer for study materials from material-service
# (analogous to mcp_server.py in the MCP POC example)
# ---------------------------------------------------------------------------

from typing import Any, Dict, List, Optional

import httpx

from app.config import settings


async def get_material(material_id: int, token: str) -> Optional[Dict[str, Any]]:
    """Fetch a single material record from the material-service."""
    headers = {"Authorization": f"Bearer {token}"}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{settings.material_service_url}/materials/{material_id}",
                headers=headers,
                timeout=30.0,
            )
            if response.status_code == 200:
                return response.json()
        except Exception as exc:
            print(f"[context_server] Error fetching material {material_id}: {exc}")
    return None


async def get_materials(
    material_ids: List[int], token: str
) -> List[Dict[str, Any]]:
    """Fetch multiple material records from the material-service."""
    materials = []
    for mid in material_ids:
        material = await get_material(mid, token)
        if material:
            materials.append(material)
    return materials


async def get_teacher_materials(token: str) -> List[Dict[str, Any]]:
    """Fetch all materials belonging to the authenticated teacher."""
    headers = {"Authorization": f"Bearer {token}"}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{settings.material_service_url}/materials/my",
                headers=headers,
                timeout=30.0,
            )
            if response.status_code == 200:
                return response.json()
        except Exception as exc:
            print(f"[context_server] Error fetching teacher materials: {exc}")
    return []


def extract_text_from_material(material: Dict[str, Any]) -> str:
    """Extract usable text content from a material record.

    Prefers the stored transcript; falls back to title + description.
    """
    parts: List[str] = []

    if material.get("title"):
        parts.append(f"Title: {material['title']}")
    if material.get("description"):
        parts.append(f"Description: {material['description']}")
    if material.get("transcript"):
        parts.append(material["transcript"])

    return "\n\n".join(parts)
