import json
import logging
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException

from app.config import Settings, get_settings
from app.schemas.poster import (
    GenerationResponse,
    PromptGenerationRequest,
    TemplateGenerationRequest,
)
from app.services.image_provider import ImageProviderError
from app.services.prompt_generator import generate_from_prompt
from app.services.template_generator import generate_from_template

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.post("/generate/prompt", response_model=GenerationResponse)
async def generate_prompt_poster(
    request: PromptGenerationRequest, settings: Settings = Depends(get_settings)
) -> GenerationResponse:
    filename = f"prompt_{uuid.uuid4().hex[:12]}.png"
    try:
        out_path, generated = await generate_from_prompt(request, settings, filename)
    except ImageProviderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return GenerationResponse(
        status="success",
        output_path=str(out_path),
        width=request.width,
        height=request.height,
        provider=generated.provider,
        seed=generated.seed,
    )


@router.post("/generate/template", response_model=GenerationResponse)
def generate_template_poster(
    request: TemplateGenerationRequest, settings: Settings = Depends(get_settings)
) -> GenerationResponse:
    filename = f"template_{uuid.uuid4().hex[:12]}.png"
    try:
        out_path = generate_from_template(request, settings, filename)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return GenerationResponse(
        status="success",
        output_path=str(out_path),
        width=request.canvas_width or settings.default_canvas_width,
        height=request.canvas_height or settings.default_canvas_height,
    )


@router.post("/generate/template/{template_name}", response_model=GenerationResponse)
def generate_from_saved_template(
    template_name: str, settings: Settings = Depends(get_settings)
) -> GenerationResponse:
    """
    Convenience endpoint: loads a pre-authored JSON layout spec from
    templates/<template_name>.json and renders it as-is.
    """
    template_path = settings.templates_dir / f"{template_name}.json"
    if not template_path.exists():
        raise HTTPException(status_code=404, detail=f"Template not found: {template_path}")

    with open(template_path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    request = TemplateGenerationRequest(**raw)
    filename = f"{template_name}_{uuid.uuid4().hex[:12]}.png"
    out_path = generate_from_template(request, settings, filename)

    return GenerationResponse(
        status="success",
        output_path=str(out_path),
        width=request.canvas_width or settings.default_canvas_width,
        height=request.canvas_height or settings.default_canvas_height,
    )
