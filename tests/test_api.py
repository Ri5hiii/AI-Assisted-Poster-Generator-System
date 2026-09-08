"""
Tests for the template-based pipeline (no network calls / API keys needed).
The prompt-based pipeline is not covered here since it requires a live
Stability AI / OpenAI credential; mock `image_provider.get_image_provider`
in a follow-up test if you want offline coverage for that path.
"""
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_generate_template_minimal(tmp_path, monkeypatch):
    # Redirect output_dir to a tmp path so the test doesn't pollute /output.
    from app.config import get_settings
    settings = get_settings()
    monkeypatch.setattr(settings, "output_dir", tmp_path)

    payload = {
        "template_name": "adhoc",
        "canvas_width": 400,
        "canvas_height": 600,
        "background_color": "#101820",
        "text_blocks": [
            {
                "content": "Test Poster Heading",
                "x": 20,
                "y": 40,
                "box_width": 360,
                "font_size": 32,
                "color": "#FFFFFF",
                "align": "center",
            }
        ],
    }
    resp = client.post("/api/v1/generate/template", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "success"
    assert Path(body["output_path"]).exists()


def test_generate_template_rejects_empty_request():
    resp = client.post("/api/v1/generate/template", json={"template_name": "empty"})
    assert resp.status_code == 422
