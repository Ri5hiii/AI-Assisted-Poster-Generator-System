"""
Request/response models for the poster generation API.
"""
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, model_validator


class TextAlign(str, Enum):
    LEFT = "left"
    CENTER = "center"
    RIGHT = "right"


class TextBlock(BaseModel):
    """A single positioned text element on the poster canvas."""
    content: str
    x: int = Field(..., description="Top-left X coordinate in px")
    y: int = Field(..., description="Top-left Y coordinate in px")
    box_width: int = Field(..., description="Max width in px for wrapping")
    font_path: Optional[str] = Field(
        default=None, description="Path to .ttf/.otf; falls back to bundled default"
    )
    font_size: int = 48
    color: str = Field(default="#FFFFFF", description="Hex color, e.g. #FFFFFF")
    align: TextAlign = TextAlign.LEFT
    line_spacing: float = 1.15
    stroke_width: int = 0
    stroke_color: str = "#000000"


class ImageBlock(BaseModel):
    """A logo/asset image to composite onto the poster."""
    source_path: str
    x: int
    y: int
    width: int
    height: int
    opacity: float = Field(default=1.0, ge=0.0, le=1.0)


class PromptGenerationRequest(BaseModel):
    """Prompt-based generation: AI produces the full background/artwork."""
    prompt: str = Field(..., min_length=3, max_length=2000)
    negative_prompt: Optional[str] = Field(default=None, max_length=2000)
    width: int = 1024
    height: int = 1536
    steps: int = Field(default=30, ge=10, le=150)
    cfg_scale: float = Field(default=7.0, ge=1.0, le=35.0)
    seed: Optional[int] = None
    # Optional overlay text rendered on top of the AI-generated artwork
    overlay_text: list[TextBlock] = Field(default_factory=list)


class TemplateGenerationRequest(BaseModel):
    """Template-based generation: deterministic composition from a JSON layout spec."""
    template_name: str = Field(..., description="Filename (without .json) under templates/")
    canvas_width: Optional[int] = None
    canvas_height: Optional[int] = None
    background_color: Optional[str] = Field(default=None, description="Hex, used if no background_image")
    background_image_path: Optional[str] = None
    text_blocks: list[TextBlock] = Field(default_factory=list)
    image_blocks: list[ImageBlock] = Field(default_factory=list)

    @model_validator(mode="after")
    def _require_some_content(self):
        if not self.text_blocks and not self.image_blocks and not self.background_image_path:
            raise ValueError("Template request must define at least one of: "
                              "background_image_path, text_blocks, image_blocks")
        return self


class GenerationResponse(BaseModel):
    status: str
    output_path: str
    width: int
    height: int
    provider: Optional[str] = None
    seed: Optional[int] = None
