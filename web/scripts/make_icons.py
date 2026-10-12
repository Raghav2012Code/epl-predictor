"""Generate the dashboard favicon and app icons from one shield geometry.

Run from the repo root:

    .venv\\Scripts\\python.exe web/scripts/make_icons.py

Writes web/public/{favicon.svg, favicon.ico, icon-192.png, icon-512.png,
maskable-512.png, apple-touch-icon.png}. favicon.svg is generated from the same
parameters as the rasters (rx 14, shield scale 0.58, outline 7, line 8.5) so the
tab icon, the PNG icons and the in-app BrandMark stay in step.

`--candidates` renders throwaway layout options to a temp contact sheet for
visual review; it writes nothing into the repo.
"""

from __future__ import annotations

import os
import sys

from PIL import Image, ImageDraw, ImageFont

INK = "#13233A"
PAPER = "#FFFFFF"
SIGNAL = "#F2B705"

# Shield path from web/public/favicon.svg, in its own 64x72 space.
_CUBICS = (
    ((58, 36), (58, 52), (46, 63), (32, 69)),
    ((32, 69), (18, 63), (6, 52), (6, 36)),
)
_STRAIGHT = ((32, 3), (58, 12), (58, 36), (6, 36), (6, 12))
TREND = ((16, 51), (24, 44), (32, 48), (41, 38), (49, 29))

SCALE = 0.58          # shield scale inside the 64 tile
CENTER = (32, 32)     # tile centre
SHIELD_CENTER = (32, 36)
SHIELD_D = "M32 3L58 12V36C58 52 46 63 32 69C18 63 6 52 6 36V12Z"


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


def _fit(pts, size, scale=SCALE):
    """Shield-space points -> pixel points for a size x size tile."""
    px = size / 64
    out = []
    for x, y in pts:
        tx = CENTER[0] + scale * (x - SHIELD_CENTER[0])
        ty = CENTER[1] + scale * (y - SHIELD_CENTER[1])
        out.append((tx * px, ty * px))
    return out


def render(size, *, tile=INK, radius=14, shield_fill=None, shield_stroke=None,
           stroke_w=0, line=INK, line_w=9, scale=SCALE, ss=4):
    """Draw one icon. `radius` 0 = full-bleed square (mask/apple), >0 = rounded."""
    big = size * ss
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    px = big / 64
    if shield_fill or shield_stroke:
        if radius:
            d.rounded_rectangle([0, 0, big - 1, big - 1], radius=radius * px, fill=tile)
        else:
            d.rectangle([0, 0, big, big], fill=tile)

    shield = _fit(_shield_outline(), big, scale)
    if shield_fill:
        d.polygon(shield, fill=shield_fill)
    if shield_stroke and stroke_w:
        w = max(1, round(stroke_w * scale * px))
        d.line(shield + [shield[0]], fill=shield_stroke, width=w, joint="curve")
        for x, y in shield:
            d.ellipse([x - w / 2, y - w / 2, x + w / 2, y + w / 2], fill=shield_stroke)

    if line_w:
        trend = _fit(TREND, big, scale)
        lw = max(1, round(line_w * scale * px))
        d.line(trend, fill=line, width=lw, joint="curve")
        for x, y in (trend[0], trend[-1]):
            d.ellipse([x - lw / 2, y - lw / 2, x + lw / 2, y + lw / 2], fill=line)

    return img.resize((size, size), Image.LANCZOS)


def _svg(**kw):
    """Emit favicon.svg from the same parameters render() draws with."""
    scale = kw.get("scale", SCALE)
    tile = kw.get("tile", INK)
    radius = kw.get("radius", 14)
    stroke_w = kw.get("stroke_w", 0)
    line_w = kw.get("line_w", 0)
    line = kw.get("line", INK)
    body = ""
    if kw.get("shield_fill"):
        body += f'<path d="{SHIELD_D}" fill="{kw["shield_fill"]}"/>'
    if kw.get("shield_stroke") and stroke_w:
        body += (f'<path d="{SHIELD_D}" fill="none" stroke="{kw["shield_stroke"]}" '
                 f'stroke-width="{stroke_w}" stroke-linejoin="round"/>')
    if line_w:
        trend = " ".join(f"{x},{y}" for x, y in TREND)
        body += (f'<polyline points="{trend}" fill="none" stroke="{line}" '
                 f'stroke-width="{line_w}" stroke-linecap="round" stroke-linejoin="round"/>')
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" '
        'aria-label="EPL Predictor">'
        f'<rect width="64" height="64" rx="{radius}" fill="{tile}"/>'
        f'<g transform="translate(32 32) scale({scale}) translate(-32 -36)">{body}</g>'
        "</svg>\n"
    )


# name -> kwargs. Palette stays navy / white / amber; layouts vary only.
VARIANTS = {
    "A outline shield, amber line": dict(shield_fill=None, shield_stroke=PAPER,
                                         stroke_w=7, line=SIGNAL, line_w=8.5, scale=0.58),
    "B solid white shield, navy line": dict(shield_fill=PAPER, line=INK, line_w=9),
    "C solid amber shield, navy line": dict(shield_fill=SIGNAL, line=INK, line_w=9),
    "D white tile, navy shield, amber line": dict(tile=PAPER, shield_fill=INK,
                                                  line=SIGNAL, line_w=9),
}


def _contact_sheet(path):
    cols, big, small = len(VARIANTS), 192, 32
    gap, pad, label_h = 16, 16, 22
    w = pad + cols * (big + gap)
    h = pad + label_h + big + gap + label_h + small + pad
    sheet = Image.new("RGB", (w, h), "#E9ECF1")
    d = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("arial.ttf", 13)
    except OSError:
        font = ImageFont.load_default()
    for c, (name, kw) in enumerate(VARIANTS.items()):
        x = pad + c * (big + gap)
        sheet.paste(render(big, **kw), (x, pad + label_h), render(big, **kw))
        sheet.paste(render(small, **kw), (x, pad + label_h + big + gap + label_h),
                    render(small, **kw))
        d.text((x, pad), name, fill="#13233A", font=font)
        d.text((x, pad + label_h + big + gap), "16px", fill="#55657A", font=font)
    sheet.save(path)
    print(path)


def main():
    public = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")
    if "--candidates" in sys.argv:
        _contact_sheet(os.path.join(os.environ.get("TEMP", "."), "favicon_candidates.png"))
        return

    chosen = VARIANTS["A outline shield, amber line"]
    with open(os.path.join(public, "favicon.svg"), "w", encoding="utf-8") as fh:
        fh.write(_svg(**chosen))
    render(256, **chosen).save(os.path.join(public, "favicon.ico"),
                               sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    render(180, radius=0, **chosen).save(os.path.join(public, "apple-touch-icon.png"))
    render(192, radius=0, **chosen).save(os.path.join(public, "icon-192.png"))
    render(512, radius=0, **chosen).save(os.path.join(public, "icon-512.png"))
    render(512, radius=0, **chosen).save(os.path.join(public, "maskable-512.png"))
    print("wrote favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, maskable-512.png")


if __name__ == "__main__":
    main()
