from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]


def test_service_worker_network_refreshes_navigation_shell() -> None:
    source = (ROOT / "web" / "public" / "sw.js").read_text(encoding="utf-8")
    assert 'event.request.mode === "navigate"' in source
    assert 'url.pathname.endsWith("/sw.js")' in source


def test_dashboard_uses_an_absolute_base_so_trailing_slash_routes_resolve_assets() -> None:
    """A relative Vite base breaks every trailing-slash route.

    ``base: './'`` emits document-relative asset URLs, so on ``/fixtures/`` the
    browser asks for ``/fixtures/assets/index-*.js``. That path does not start
    with ``assets/``, so the SPA rewrite in vercel.json answers it with
    index.html under Content-Type text/html and the browser refuses to execute
    the module, leaving a blank page. The router deliberately supports
    trailing slashes, so this combination must never ship.
    """
    source = (ROOT / "web" / "vite.config.ts").read_text(encoding="utf-8")
    assert re.search(r"base:\s*['\"]/['\"]", source), "vite base must be an absolute path"

    routes = (ROOT / "web" / "src" / "lib" / "appRoute.ts").read_text(encoding="utf-8")
    assert 'pathname.replace(/\\/$/, "")' in routes, "router still tolerates trailing slashes"


def test_dashboard_document_never_uses_document_relative_asset_urls() -> None:
    html = (ROOT / "web" / "index.html").read_text(encoding="utf-8")
    relative = re.findall(r'(?:src|href|content)="\./[^"]+"', html)
    assert not relative, f"document-relative URLs break on trailing-slash routes: {relative}"


def test_service_worker_registration_handles_rejection() -> None:
    source = (ROOT / "web" / "src" / "main.tsx").read_text(encoding="utf-8")
    assert "serviceWorker" in source
    assert ".catch(" in source, "service worker registration must handle rejection"


def test_remote_dashboard_data_loader_has_a_bounded_request() -> None:
    source = (ROOT / "web" / "src" / "hooks" / "useEPLData.ts").read_text(encoding="utf-8")
    assert "AbortController" in source
    assert "setTimeout" in source
    assert "signal: controller.signal" in source
