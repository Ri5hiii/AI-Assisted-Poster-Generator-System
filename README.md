# AI-Assisted Poster Generation System

A FastAPI service that generates posters two ways:

1. **Prompt-based** — an AI image API (Stability AI SDXL or OpenAI
   `gpt-image-1`) generates the full artwork from a text prompt, with
   optional text overlay composited on top.
2. **Template-based** — a JSON layout spec drives a deterministic Pillow
   compositing pipeline (background + positioned text blocks + image/logo
   blocks). No AI call, no cost, fully reproducible.

## Architecture

```
app/
├── main.py                    # FastAPI app, mounts /output as static files
├── config.py                  # Settings (env vars / .env), pydantic-settings
├── api/routes.py              # /generate/prompt, /generate/template, /generate/template/{name}
├── schemas/poster.py          # Request/response Pydantic models
├── services/
│   ├── image_provider.py      # Abstract ImageProvider + StabilityAIProvider + OpenAIImageProvider
│   ├── prompt_generator.py    # AI artwork -> optional text overlay -> PNG
│   └── template_generator.py  # Pure Pillow layout engine (word-wrap, align, stroke, image paste)
└── utils/fonts.py             # TTF loading + caching, fails loudly if no font found
templates/
├── event_default.json         # Example layout spec (see below)
└── fonts/Poppins-Regular.ttf  # Bundled default font
```

## Setup

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in STABILITY_API_KEY or OPENAI_API_KEY
uvicorn app.main:app --reload
```

Interactive docs at `http://localhost:8000/docs`.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Liveness check |
| POST | `/api/v1/generate/prompt` | AI-generated artwork from a text prompt, with optional overlay text |
| POST | `/api/v1/generate/template` | Render an inline `TemplateGenerationRequest` JSON body |
| POST | `/api/v1/generate/template/{template_name}` | Load and render `templates/{template_name}.json` |

### Example: prompt-based

```bash
curl -X POST http://localhost:8000/api/v1/generate/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "minimalist tech conference poster, deep navy background, gold geometric accents, professional",
    "width": 1024,
    "height": 1536,
    "steps": 30,
    "cfg_scale": 7,
    "overlay_text": [
      {"content": "TECHNOVA 2026", "x": 60, "y": 120, "box_width": 900, "font_size": 90, "color": "#FFD166", "align": "center"}
    ]
  }'
```

### Example: template-based (saved spec)

```bash
curl -X POST http://localhost:8000/api/v1/generate/template/event_default
```

See `templates/event_default.json` for the layout schema: `canvas_width`,
`canvas_height`, `background_color` or `background_image_path`,
`text_blocks[]` (position, wrap width, font, color, alignment, stroke), and
`image_blocks[]` (logos/assets with position, size, opacity).

## Providers

Set `IMAGE_PROVIDER=stability` or `IMAGE_PROVIDER=openai` in `.env`.

- **Stability AI**: `POST {host}/v1/generation/{engine_id}/text-to-image`.
  SDXL only accepts specific width/height pairs — `StabilityAIProvider`
  snaps any requested size to the nearest valid one automatically.
- **OpenAI**: `POST https://api.openai.com/v1/images/generations` with
  `gpt-image-1`. No `steps`/`cfg_scale`/`seed` support — those fields are
  ignored for this provider, and `negative_prompt` is folded into the
  prompt text since the API has no native field for it.

## Fonts

`utils/fonts.py` requires a real `.ttf`/`.otf` and raises `FileNotFoundError`
if none is found — Pillow's built-in bitmap default is unusable for poster
text. `templates/fonts/Poppins-Regular.ttf` is bundled as the fallback;
override per-text-block with `font_path`.

## Tests

```bash
pytest tests/ -v
```

Covers the template pipeline end-to-end (no API key needed). The
prompt-based pipeline isn't covered offline since it requires a live
provider credential — mock `image_provider.get_image_provider` to add
coverage there.

## Docker

```bash
docker build -t poster-gen .
docker run -p 8000:8000 --env-file .env poster-gen
```

## Known limitations / next steps

- No persistence layer — generated posters live only in `output/` on disk.
- No auth on the API — add an API-key/OAuth dependency before exposing publicly.
- `overlay_text` in prompt-based generation doesn't know where the AI
  placed visual elements, so text can overlap artwork; for tighter control,
  reserve empty space in the prompt itself (e.g. "leave the top third empty
  for a title").
- Add a retry/backoff wrapper around the provider HTTP calls for production use
  (`settings.max_retries` is defined but not yet wired into `httpx.AsyncClient`).
