"""
Font resolution helper. Pillow's ImageFont.load_default() is a tiny bitmap
font unsuitable for posters, so we require a real TTF and fail loudly if
neither a requested nor bundled fallback font exists.
"""
from pathlib import Path

from PIL import ImageFont

_BUNDLED_FALLBACK = Path(__file__).resolve().parent.parent.parent / "templates" / "fonts" / "Poppins-Regular.ttf"

_cache: dict[tuple[str, int], ImageFont.FreeTypeFont] = {}


def load_font(font_path: str | None, size: int) -> ImageFont.FreeTypeFont:
    path = Path(font_path) if font_path else _BUNDLED_FALLBACK
    key = (str(path), size)
    if key in _cache:
        return _cache[key]

    if not path.exists():
        raise FileNotFoundError(
            f"Font not found at {path}. Place a .ttf/.otf there, or pass "
            f"'font_path' explicitly in the request, or add a bundled fallback "
            f"at templates/fonts/Inter-Regular.ttf."
        )

    font = ImageFont.truetype(str(path), size=size)
    _cache[key] = font
    return font
