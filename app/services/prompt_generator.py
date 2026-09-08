"""
Prompt-based poster pipeline: calls an AI image provider for the full
artwork, then optionally composites text blocks on top using the same
Pillow drawing logic as the template pipeline.
"""
import io
import logging
from pathlib import Path

from PIL import Image, ImageDraw

from app.config import Settings
from app.schemas.poster import PromptGenerationRequest
from app.services.image_provider import GeneratedImage, get_image_provider
from app.services.template_generator import _draw_text_block  # reuse layout logic

logger = logging.getLogger(__name__)


async def generate_from_prompt(
    request: PromptGenerationRequest, settings: Settings, output_filename: str
) -> tuple[Path, GeneratedImage]:
    provider = get_image_provider(settings)

    generated = await provider.generate(
        prompt=request.prompt,
        negative_prompt=request.negative_prompt,
        width=request.width,
        height=request.height,
        steps=request.steps,
        cfg_scale=request.cfg_scale,
        seed=request.seed,
    )

    canvas = Image.open(io.BytesIO(generated.image_bytes)).convert("RGBA")

    if request.overlay_text:
        draw = ImageDraw.Draw(canvas)
        for block in request.overlay_text:
            _draw_text_block(draw, block)

    settings.output_dir.mkdir(parents=True, exist_ok=True)
    out_path = settings.output_dir / output_filename
    canvas.convert("RGB").save(out_path, format="PNG")
    logger.info("Prompt-based poster (%s) written to %s", generated.provider, out_path)
    return out_path, generated
