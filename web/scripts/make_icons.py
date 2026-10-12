"""Generate the dashboard favicon and app icons from one shield geometry.

Run from the repo root:

    .venv\\Scripts\\python.exe web/scripts/make_icons.py

Writes web/public/{favicon.svg, favicon.ico, icon-192.png, icon-512.png,
maskable-512.png, apple-touch-icon.png}: an ink tile, a paper shield outline and
one signal rising line, the same geometry as BrandMark.tsx.
"""

from __future__ import annotations

import os

from PIL import Image, ImageDraw

INK = "#13233A"
PAPER = "#FFFFFF"
SIGNAL = "#F2B705"

SCALE = 0.58          # shield scale inside the 64 tile
CENTER = (32, 32)     # tile centre
SHIELD_CENTER = (32, 36)
SHIELD_D = "M32 3L58 12V36C58 52 46 63 32 69C18 63 6 52 6 36V12Z"
TREND = ((16, 51), (24, 44), (32, 48), (41, 38), (49, 29))

# The shield's two curved sides, sampled for the raster outline.
_CUBICS = (
    ((58, 36), (58, 52), (46, 63), (32, 69)),
    ((32, 69), (18, 63), (6, 52), (6, 36)),
)

TILE_R = 14           # tile corner radius (64 space)
STROKE_W = 7          # shield outline weight (shield space)
LINE_W = 8.5          # rising-line weight (shield space)
SS = 4                # supersample factor


def _cubic(p0, p1, p2, p3, n=40):
    pts = []
    for i in range(n + 1):
        t = i / n
        m = 1 - t
        x = m**3 * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t**3 * p3[0]
        y = m**3 * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t**3 * p3[1]
        pts.append((x, y))
    return pts


def _shield_outline():
    pts = [(32, 3), (58, 12), (58, 36)]
    for cubic in _CUBICS:
        pts.extend(_cubic(*cubic)[1:])
    pts.append((6, 12))
    return pts


def _fit(pts, size):
    """Shield-space points -> pixel points for a size x size tile."""
    px = size / 64
    return [
        ((CENTER[0] + SCALE * (x - SHIELD_CENTER[0])) * px,
         (CENTER[1] + SCALE * (y - SHIELD_CENTER[1])) * px)
        for x, y in pts
    ]


def render(size, *, radius=TILE_R, ss=SS):
    """Draw one icon. radius 0 = full-bleed square (mask/apple), else rounded."""
    big = size * ss
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    px = big / 64

    if radius:
        d.rounded_rectangle([0, 0, big - 1, big - 1], radius=radius * px, fill=INK)
    else:
        d.rectangle([0, 0, big, big], fill=INK)

    shield = _fit(_shield_outline(), big)
    w = max(1, round(STROKE_W * SCALE * px))
    d.line(shield + [shield[0]], fill=PAPER, width=w, joint="curve")
    for x, y in shield:
        d.ellipse([x - w / 2, y - w / 2, x + w / 2, y + w / 2], fill=PAPER)

    trend = _fit(TREND, big)
    lw = max(1, round(LINE_W * SCALE * px))
    d.line(trend, fill=SIGNAL, width=lw, joint="curve")
    for x, y in (trend[0], trend[-1]):
        d.ellipse([x - lw / 2, y - lw / 2, x + lw / 2, y + lw / 2], fill=SIGNAL)

    return img.resize((size, size), Image.LANCZOS)


def _svg():
    """Emit favicon.svg from the same numbers render() draws with."""
    trend = " ".join(f"{x},{y}" for x, y in TREND)
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" '
        'aria-label="EPL Predictor">'
        f'<rect width="64" height="64" rx="{TILE_R}" fill="{INK}"/>'
        f'<g transform="translate(32 32) scale({SCALE}) translate(-32 -36)">'
        f'<path d="{SHIELD_D}" fill="none" stroke="{PAPER}" '
        f'stroke-width="{STROKE_W}" stroke-linejoin="round"/>'
        f'<polyline points="{trend}" fill="none" stroke="{SIGNAL}" '
        f'stroke-width="{LINE_W}" stroke-linecap="round" stroke-linejoin="round"/>'
        "</g></svg>\n"
    )


def main():
    public = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")
    with open(os.path.join(public, "favicon.svg"), "w", encoding="utf-8") as fh:
        fh.write(_svg())
    render(256).save(os.path.join(public, "favicon.ico"),
                     sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    render(180, radius=0).save(os.path.join(public, "apple-touch-icon.png"))
    render(192, radius=0).save(os.path.join(public, "icon-192.png"))
    render(512, radius=0).save(os.path.join(public, "icon-512.png"))
    render(512, radius=0).save(os.path.join(public, "maskable-512.png"))
    print("wrote favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, maskable-512.png")


if __name__ == "__main__":
    main()
