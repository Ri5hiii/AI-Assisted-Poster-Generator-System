import logging

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.config import get_settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="Prompt-based and template-based AI poster generation service.",
    version="0.1.0",
)

settings.output_dir.mkdir(parents=True, exist_ok=True)
app.mount("/output", StaticFiles(directory=str(settings.output_dir)), name="output")

app.include_router(router, prefix="/api/v1")


@app.get("/")
def root() -> dict:
    return {"service": settings.app_name, "docs": "/docs"}
