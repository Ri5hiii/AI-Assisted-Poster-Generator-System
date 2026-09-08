"""
AI image generation providers, behind a common interface so the API layer
doesn't care which backend produced the artwork.
"""
import base64
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional

import httpx

from app.config import Settings

logger = logging.getLogger(__name__)


class ImageProviderError(RuntimeError):
    """Raised when the upstream image generation API fails."""


@dataclass
class GeneratedImage:
    image_bytes: bytes
    seed: Optional[int]
    provider: str


class ImageProvider(ABC):
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        negative_prompt: Optional[str],
        width: int,
        height: int,
        steps: int,
        cfg_scale: float,
        seed: Optional[int],
    ) -> GeneratedImage:
        raise NotImplementedError


class StabilityAIProvider(ImageProvider):
    """
    Wraps Stability AI's REST v1 text-to-image endpoint:
    POST {host}/v1/generation/{engine_id}/text-to-image
    Docs: https://platform.stability.ai/docs/api-reference#tag/Text-to-Image
    """

    # Stability's SDXL engine only accepts specific width/height pairs.
    SDXL_VALID_DIMENSIONS = {
        (1024, 1024), (1152, 896), (1216, 832), (1344, 768),
        (1536, 640), (640, 1536), (768, 1344), (832, 1216), (896, 1152),
    }

    def __init__(self, settings: Settings):
        self._settings = settings
        if not settings.stability_api_key:
            logger.warning("STABILITY_API_KEY is not set; requests will fail with 401.")

    def _snap_dimensions(self, width: int, height: int) -> tuple[int, int]:
        if (width, height) in self.SDXL_VALID_DIMENSIONS:
            return width, height
        # Snap to nearest valid SDXL dimension pair by aspect ratio distance.
        target_ratio = width / height
        best = min(
            self.SDXL_VALID_DIMENSIONS,
            key=lambda wh: abs((wh[0] / wh[1]) - target_ratio),
        )
        logger.info("Requested %sx%s not valid for SDXL; snapped to %sx%s", width, height, *best)
        return best

    async def generate(
        self,
        prompt: str,
        negative_prompt: Optional[str],
        width: int,
        height: int,
        steps: int,
        cfg_scale: float,
        seed: Optional[int],
    ) -> GeneratedImage:
        w, h = self._snap_dimensions(width, height)

        text_prompts = [{"text": prompt, "weight": 1.0}]
        if negative_prompt:
            text_prompts.append({"text": negative_prompt, "weight": -1.0})

        payload = {
            "text_prompts": text_prompts,
            "width": w,
            "height": h,
            "steps": steps,
            "cfg_scale": cfg_scale,
            "samples": 1,
        }
        if seed is not None:
            payload["seed"] = seed

        url = f"{self._settings.stability_api_host}/v1/generation/{self._settings.stability_engine_id}/text-to-image"
        headers = {
            "Authorization": f"Bearer {self._settings.stability_api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        async with httpx.AsyncClient(timeout=self._settings.request_timeout_seconds) as client:
            resp = await client.post(url, headers=headers, json=payload)

        if resp.status_code != 200:
            raise ImageProviderError(
                f"Stability AI request failed [{resp.status_code}]: {resp.text[:500]}"
            )

        data = resp.json()
        artifacts = data.get("artifacts", [])
        if not artifacts:
            raise ImageProviderError("Stability AI returned no artifacts.")

        artifact = artifacts[0]
        image_bytes = base64.b64decode(artifact["base64"])
        returned_seed = artifact.get("seed", seed)

        return GeneratedImage(image_bytes=image_bytes, seed=returned_seed, provider="stability")


class OpenAIImageProvider(ImageProvider):
    """
    Wraps OpenAI's Images API: POST https://api.openai.com/v1/images/generations
    Docs: https://platform.openai.com/docs/api-reference/images/create
    Note: this endpoint does not accept steps/cfg_scale/seed — those are
    silently ignored to keep the interface uniform across providers.
    """

    def __init__(self, settings: Settings):
        self._settings = settings
        if not settings.openai_api_key:
            logger.warning("OPENAI_API_KEY is not set; requests will fail with 401.")

    def _nearest_supported_size(self, width: int, height: int) -> str:
        # gpt-image-1 supports: 1024x1024, 1024x1536, 1536x1024
        if width == height:
            return "1024x1024"
        return "1024x1536" if height > width else "1536x1024"

    async def generate(
        self,
        prompt: str,
        negative_prompt: Optional[str],
        width: int,
        height: int,
        steps: int,
        cfg_scale: float,
        seed: Optional[int],
    ) -> GeneratedImage:
        size = self._nearest_supported_size(width, height)
        full_prompt = prompt
        if negative_prompt:
            # OpenAI's API has no native negative-prompt field; fold it in as an instruction.
            full_prompt = f"{prompt}\n\nAvoid: {negative_prompt}"

        payload = {
            "model": self._settings.openai_image_model,
            "prompt": full_prompt,
            "size": size,
            "n": 1,
        }
        headers = {
            "Authorization": f"Bearer {self._settings.openai_api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=self._settings.request_timeout_seconds) as client:
            resp = await client.post(
                "https://api.openai.com/v1/images/generations", headers=headers, json=payload
            )

        if resp.status_code != 200:
            raise ImageProviderError(
                f"OpenAI Images request failed [{resp.status_code}]: {resp.text[:500]}"
            )

        data = resp.json()
        b64 = data["data"][0]["b64_json"]
        image_bytes = base64.b64decode(b64)

        return GeneratedImage(image_bytes=image_bytes, seed=None, provider="openai")


def get_image_provider(settings: Settings) -> ImageProvider:
    if settings.image_provider == "stability":
        return StabilityAIProvider(settings)
    if settings.image_provider == "openai":
        return OpenAIImageProvider(settings)
    raise ValueError(f"Unknown image_provider: {settings.image_provider}")
