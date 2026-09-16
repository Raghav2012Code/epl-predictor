from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_service_worker_network_refreshes_navigation_shell() -> None:
    source = (ROOT / "web" / "public" / "sw.js").read_text(encoding="utf-8")
    assert 'event.request.mode === "navigate"' in source
    assert 'url.pathname.endsWith("/sw.js")' in source


def test_remote_dashboard_data_loader_has_a_bounded_request() -> None:
    source = (ROOT / "web" / "src" / "hooks" / "useEPLData.ts").read_text(encoding="utf-8")
    assert "AbortController" in source
    assert "setTimeout" in source
    assert "signal: controller.signal" in source
