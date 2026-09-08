"""
Deterministic, template-driven poster composition using Pillow.
No AI call involved here -- pure raster layout, so it's fast and free
to iterate on.
"""
import logging
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw

from app.config import Settings
from app.schemas.poster import ImageBlock, TemplateGenerationRequest, TextBlock
from app.utils.fonts import load_font

logger = logging.getLogger(__name__)


def _hex_to_rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return (r, g, b, alpha)


def _wrap_to_width(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
    """Greedy word-wrap using actual glyph measurement rather than char count."""
    words = text.split()
    if not words:
        return [""]

    lines: list[str] = []
    current = words[0]
    for word in words[1:]:
        trial = f"{current} {word}"
        bbox = draw.textbbox((0, 0), trial, font=font)
        if (bbox[2] - bbox[0]) <= max_width:
            current = trial
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def _draw_text_block(draw: ImageDraw.ImageDraw, block: TextBlock) -> None:
    font = load_font(block.font_path, block.font_size)
    lines = _wrap_to_width(draw, block.content, font, block.box_width)
    fill = _hex_to_rgba(block.color)
    stroke_fill = _hex_to_rgba(block.stroke_color) if block.stroke_width else None

    line_height = int(block.font_size * block.line_spacing)
    y = block.y
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        line_width = bbox[2] - bbox[0]

        if block.align == "center":
            x = block.x + (block.box_width - line_width) // 2
        elif block.align == "right":
            x = block.x + (block.box_width - line_width)
        else:
            x = block.x

        draw.text(
            (x, y), line, font=font, fill=fill,
            stroke_width=block.stroke_width, stroke_fill=stroke_fill,
        )
        y += line_height


def _paste_image_block(canvas: Image.Image, block: ImageBlock) -> None:
    asset_path = Path(block.source_path)
    if not asset_path.exists():
        raise FileNotFoundError(f"Image asset not found: {asset_path}")

    asset = Image.open(asset_path).convert("RGBA")
    asset = asset.resize((block.width, block.height), Image.LANCZOS)

    if block.opacity < 1.0:
        alpha = asset.getchannel("A").point(lambda p: int(p * block.opacity))
        asset.putalpha(alpha)

    canvas.alpha_composite(asset, dest=(block.x, block.y))


def generate_from_template(
    request: TemplateGenerationRequest, settings: Settings, output_filename: str
) -> Path:
    width = request.canvas_width or settings.default_canvas_width
    height = request.canvas_height or settings.default_canvas_height

    if request.background_image_path:
        bg_path = Path(request.background_image_path)
        if not bg_path.exists():
            raise FileNotFoundError(f"Background image not found: {bg_path}")
        canvas = Image.open(bg_path).convert("RGBA").resize((width, height), Image.LANCZOS)
    else:
        bg_color = _hex_to_rgba(request.background_color or "#111111")
        canvas = Image.new("RGBA", (width, height), bg_color)

    for image_block in request.image_blocks:
        _paste_image_block(canvas, image_block)

    draw = ImageDraw.Draw(canvas)
    for text_block in request.text_blocks:
        _draw_text_block(draw, text_block)

    settings.output_dir.mkdir(parents=True, exist_ok=True)
    out_path = settings.output_dir / output_filename
    canvas.convert("RGB").save(out_path, format="PNG")
    logger.info("Template-based poster written to %s", out_path)
    return out_path
