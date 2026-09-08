"""
Centralized configuration, loaded from environment variables / .env.
"""
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- General ---
    app_name: str = "AI-Assisted-Poster-Generation-System"
    environment: Literal["dev", "prod"] = "dev"
    output_dir: Path = Path("output")
    templates_dir: Path = Path("templates")

    # --- AI image provider selection ---
    # "stability" -> Stability AI SDXL/SD3 REST API
    # "openai"    -> OpenAI Images API (DALL-E 3 / gpt-image-1)
    image_provider: Literal["stability", "openai"] = "stability"

    # --- Stability AI ---
    stability_api_key: str = ""
    stability_api_host: str = "https://api.stability.ai"
    # v2beta endpoint, model selectable per-request; default engine below
    stability_engine_id: str = "stable-diffusion-xl-1024-v1-0"

    # --- OpenAI ---
    openai_api_key: str = ""
    openai_image_model: str = "gpt-image-1"

    # --- Generation defaults ---
    default_canvas_width: int = 1024
    default_canvas_height: int = 1536  # 2:3 poster aspect ratio
    request_timeout_seconds: int = 60
    max_retries: int = 3


@lru_cache
def get_settings() -> Settings:
    return Settings()
