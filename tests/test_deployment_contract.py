import json
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]


def test_vercel_configuration_builds_the_web_dashboard_from_repository_root():
    config = json.loads((REPOSITORY_ROOT / "vercel.json").read_text(encoding="utf-8"))

    assert config["framework"] == "vite"
    assert config["installCommand"] == "npm --prefix web ci"
    assert config["buildCommand"] == "npm --prefix web run build"
    assert config["outputDirectory"] == "web/dist"


def test_vercel_configuration_serves_direct_dashboard_routes_through_the_spa_entrypoint():
    config = json.loads((REPOSITORY_ROOT / "vercel.json").read_text(encoding="utf-8"))

    assert {
        "source": "/((?!assets/|visuals/|sw\\.js$).*)",
        "destination": "/index.html",
    } in config["rewrites"]


def test_vercel_configuration_does_not_publish_backend_functions_accidentally():
    config = json.loads((REPOSITORY_ROOT / "vercel.json").read_text(encoding="utf-8"))

    assert "functions" not in config
    assert "api" not in config


def test_render_build_warms_the_gitignored_context_cache_before_training():
    """A fresh clone cannot populate the openfootball cache offline.

    The cache is gitignored, so `run_pipeline.py --offline` skipped every cup
    file and trained on plain league history while reporting success.
    """
    config = (REPOSITORY_ROOT / "render.yaml").read_text(encoding="utf-8")

    warm = config.index("--warm-cache")
    train = config.index("--offline", warm)
    assert warm < train, "the cache must be warmed before the offline pipeline run"
    # Runtime must read the warmed cache, not re-download inside the lifespan.
    assert "EPL_OFFLINE" in config


def test_production_requires_both_host_and_c_origin_env_vars():
    config = (REPOSITORY_ROOT / "render.yaml").read_text(encoding="utf-8")

    assert "EPL_ALLOWED_HOSTS" in config
    assert "EPL_CORS_ORIGINS" in config


def test_vercel_configuration_caches_hashed_assets_and_refreshes_the_service_worker():
    config = json.loads((REPOSITORY_ROOT / "vercel.json").read_text(encoding="utf-8"))
    headers = {
        entry["source"]: {
            header["key"]: header["value"] for header in entry["headers"]
        }
        for entry in config["headers"]
    }

    assert headers["/assets/(.*)"]["Cache-Control"].endswith("immutable")
    assert headers["/sw.js"]["Cache-Control"] == "no-cache, no-store, must-revalidate"
