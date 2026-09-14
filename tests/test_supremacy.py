"""Unit tests for the supremacy/totals head and three-source blend."""

import numpy as np
import pandas as pd

from src.feature_engineering import get_feature_column_names
from src.models import (
    MatchPredictorModel,
    blend_weights,
    supremacy_to_means,
)


def _tiny_model():
    rng = np.random.RandomState(2)
    cols = get_feature_column_names()
    X = pd.DataFrame(rng.randn(40, len(cols)), columns=cols)
    y = pd.Series(rng.choice([0, 1, 2], size=40))
    hg = pd.Series(rng.poisson(1.4, size=40))
    ag = pd.Series(rng.poisson(1.1, size=40))
    model = MatchPredictorModel("rf").apply_params({"n_estimators": 10})
    model.fit(X, y, hg, ag)
    return model, X


def test_supremacy_totals_decomposition_identity():
    lam_h, lam_a = supremacy_to_means(
        np.array([0.5, -1.0, 0.0]), np.array([2.5, 2.0, 0.0])
    )
    assert np.allclose(lam_h + lam_a, [2.5, 2.0, 0.1])  # floored totals
    assert np.allclose(lam_h - lam_a, [0.5, -1.0, 0.0])
    assert bool((lam_h >= 0.05).all() and (lam_a >= 0.05).all())
    # Extreme supremacy beyond totals clips the weak side at the floor.
    lam_h, lam_a = supremacy_to_means(np.array([10.0]), np.array([1.0]))
    assert lam_a == 0.05
    assert abs(float(lam_h[0]) - 5.5) < 1e-12


def test_blend_weights_normalize_and_default(monkeypatch):
    assert blend_weights() == (0.6, 0.0, 0.4)
    # Partial config: missing keys fall back, then normalize.
    import src.config as config_mod

    monkeypatch.setattr(
        config_mod, "get_config",
        lambda: {"model": {"blend_classifier": 3.0}},
        raising=False,
    )
    # NOTE: models.blend_weights imports get_config from src.config at call
    # time, so patching src.config.get_config takes effect. Beware the
    # lru_cache on the real get_config in other tests (untouched here).
    w = blend_weights()
    assert abs(sum(w) - 1.0) < 1e-12
    assert w[0] == 3.0 / 3.4  # 3.0 classifier over 3.0 + 0.0 + 0.4 defaults


def test_source_probas_cover_three_sources():
    model, X = _tiny_model()
    sources = model._source_probas(X)
    assert set(sources) == {"clf", "poisson", "supremacy"}
    for matrix in sources.values():
        assert matrix.shape == (len(X), 3)
        assert np.allclose(matrix.sum(axis=1), 1.0)
    blended = model.predict_outcome_proba(X)
    assert blended.shape == (len(X), 3)
    assert np.allclose(blended.sum(axis=1), 1.0)


def test_save_load_roundtrips_new_regressors(tmp_path):
    model, X = _tiny_model()
    path = str(tmp_path / "sup.joblib")
    model.save(path)
    import joblib

    payload = joblib.load(path)
    assert "supremacy_regressor" in payload
    assert "totals_regressor" in payload
    loaded = MatchPredictorModel.load(path)
    assert np.allclose(
        loaded.predict_outcome_proba(X), model.predict_outcome_proba(X)
    )


def test_old_checkpoint_without_head_is_rejected(tmp_path):
    import joblib

    model, _ = _tiny_model()
    path = str(tmp_path / "legacy.joblib")
    model.save(path)
    payload = joblib.load(path)
    del payload["supremacy_regressor"]
    joblib.dump(payload, path)
    import pytest

    with pytest.raises(RuntimeError, match="predates the supremacy"):
        MatchPredictorModel.load(path)
