#!/usr/bin/env python3
"""Task 6-D — favicon / icons / og-image from the NILOV round badge logo.

Source: /home/z/my-project/download/nilov-logo/logo-round-transparent.png
        (2257x2277 RGBA, black circle ~2090px diameter, white "NILOV CATERING",
        gold arcs #D4A574 + triangle)

Outputs:
  public/brand/logo-{512,256,128,64}.png  — round badge, transparent bg
  public/favicon-32.png                   — 32x32 round, transparent
  public/favicon.ico                      — multi-size 16+32+48
  public/apple-touch-icon.png             — 180x180 black bg + badge + gold ring
  public/icon-{192,512}.png               — black bg + badge + gold ring (maskable-safe)
  public/og-image.jpg                     — 1200x630 dark gradient + badge + wordmark
"""

import os
from PIL import Image, ImageDraw, ImageFont

SRC = "/home/z/my-project/download/nilov-logo/logo-round-transparent.png"
BRAND = "/home/z/my-project/newsite/public/brand"
PUB = "/home/z/my-project/newsite/public"
PRATA = "/home/z/my-project/newsite/public/fonts/Prata-Regular.ttf"
DEJAVU_SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"

GOLD = (212, 165, 116, 255)   # #D4A574
BLACK = (10, 9, 8, 255)       # #0A0908
CREAM = (247, 245, 243, 255)  # #F7F5F5

os.makedirs(BRAND, exist_ok=True)


def downscale(img: Image.Image, target: int) -> Image.Image:
    """High-quality progressive downscale (halving) to a square `target`."""
    w, h = img.size
    cur = img
    while min(w, h) >= target * 2:
        cur = cur.resize((max(target, w // 2), max(target, h // 2)), Image.LANCZOS)
        w, h = cur.size
    return cur.resize((target, target), Image.LANCZOS)


# ---------------------------------------------------------------- 1. square
im = Image.open(SRC).convert("RGBA")
bbox = im.getchannel("A").getbbox()
crop = im.crop(bbox)
side = max(crop.size)
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
sq.paste(crop, ((side - crop.width) // 2, (side - crop.height) // 2), crop)

# ------------------------------------------------- 2. public/brand/logo-*.png
for s in (512, 256, 128, 64):
    r = downscale(sq, s)
    r.save(f"{BRAND}/logo-{s}.png", optimize=True)
    print(f"brand/logo-{s}.png", r.size, os.path.getsize(f"{BRAND}/logo-{s}.png"), "bytes")

# --------------------------------------------------------- 3. favicon-32.png
f32 = downscale(sq, 32)
f32.save(f"{PUB}/favicon-32.png", optimize=True)
print("favicon-32.png", f32.size, os.path.getsize(f"{PUB}/favicon-32.png"), "bytes")

# ------------------------------------------------------------- 4. favicon.ico
f48 = downscale(sq, 48)
f16 = downscale(sq, 16)
f48.save(f"{PUB}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
print("favicon.ico", os.path.getsize(f"{PUB}/favicon.ico"), "bytes")


# --------------------------------------- 5. black-bg + gold ring icon builder
def badge_on_black(size: int, logo_ratio: float, ring_ratio: float, ss: int = 4) -> Image.Image:
    """Black square `size`, round badge centered at `logo_ratio` of the side,
    thin gold ring at `ring_ratio` (of half-side) radius — drawn ON TOP,
    OUTSIDE the badge edge (v2: v1 drew the ring under the badge where the
    opaque black circle completely hid it — pixel scan found zero gold
    pixels beyond the badge edge). ring_ratio must exceed logo_ratio/2.
    Drawn at 4x supersampling for smooth anti-aliased ring edges."""
    big = size * ss
    canvas = Image.new("RGBA", (big, big), BLACK)
    d = ImageDraw.Draw(canvas)
    half = big / 2
    # badge first
    ld = logo_ratio * big
    badge = downscale(sq, int(ld))
    canvas.paste(badge, (int(half - ld / 2), int(half - ld / 2)), badge)
    # gold ring frame on top, just outside the badge edge
    rr = ring_ratio * half
    rw = max(2, round(size * 0.011)) * ss  # 2px @180/192, 6px @512
    d.ellipse(
        [half - rr, half - rr, half + rr, half + rr],
        outline=GOLD, width=rw,
    )
    return canvas.resize((size, size), Image.LANCZOS)


# apple-touch-icon 180: solid black, ~12% field, gold ring frame OUTSIDE the
# badge (badge r=68.4, ring r=74.7 → 5px breathing gap, 2px stroke)
apple = badge_on_black(180, logo_ratio=0.76, ring_ratio=0.83)
apple.save(f"{PUB}/apple-touch-icon.png", optimize=True)
print("apple-touch-icon.png", apple.size, os.path.getsize(f"{PUB}/apple-touch-icon.png"), "bytes")

# manifest icons — maskable-safe geometry: ring outer edge (0.78 of
# half-side + half stroke) stays inside the 0.8-diameter maskable safe circle
for s in (192, 512):
    ic = badge_on_black(s, logo_ratio=0.72, ring_ratio=0.78)
    ic.save(f"{PUB}/icon-{s}.png", optimize=True)
    print(f"icon-{s}.png", ic.size, os.path.getsize(f"{PUB}/icon-{s}.png"), "bytes")

# ----------------------------------------------------------- 6. og-image.jpg
W, H = 1200, 630
og = Image.new("RGB", (W, H), (10, 9, 8))

# vertical gradient per brief: #111111 (top) -> #0A0908 (bottom)
top = (17, 17, 17)
bot = (10, 9, 8)
grad = Image.new("RGB", (1, H))
for y in range(H):
    t = y / (H - 1)
    grad.putpixel((0, y), tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
og = grad.resize((W, H))

# warm radial glow behind the logo (left-center)
glow = Image.new("L", (W, H), 0)
gd = ImageDraw.Draw(glow)
gd.ellipse([40, 315 - 300, 40 + 600, 315 + 300], fill=90)
glow = glow.filter(__import__("PIL.ImageFilter", fromlist=["GaussianBlur"]).GaussianBlur(160))
warm = Image.new("RGB", (W, H), (58, 46, 32))
og = Image.composite(warm, og, glow.point(lambda p: min(p, 70)))

d = ImageDraw.Draw(og)

# badge, 420px, center-left (center x=280)
badge = downscale(sq, 420).convert("RGBA")
bg = Image.new("RGB", (W, H))
bg.paste(og, (0, 0))
bg.paste(badge, (int(280 - 420 / 2), int(315 - 420 / 2)), badge)
og = bg

# gold ring around the badge on the og-image (echo of the icon design)
d = ImageDraw.Draw(og)
cx, cy, rr = 280, 315, 420 / 2 + 26
d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=(212, 165, 116), width=3)

# --- text block, right of the logo
tx = 590


def fit_font(path, text, max_w, start):
    size = start
    while size > 20:
        f = ImageFont.truetype(path, size)
        if f.getbbox(text)[2] <= max_w:
            return f
        size -= 4
    return ImageFont.truetype(path, 20)


f_brand = fit_font(PRATA, "nilov catering", 560, 120)
bb = f_brand.getbbox("nilov catering")
brand_y = 215
d.text((tx, brand_y), "nilov catering", font=f_brand, fill=(247, 245, 243))

# gold dot right after the wordmark (brand signature: "nilov catering.")
dot_bb = f_brand.getbbox(".")
d.text((tx + bb[2] + 4, brand_y), ".", font=f_brand, fill=(212, 165, 116))

# gold hairline separator under the wordmark (spans wordmark + dot)
d.rectangle([tx + 2, brand_y + bb[3] + 34, tx + bb[2] + dot_bb[2] + 4, brand_y + bb[3] + 37], fill=(212, 165, 116))

# subtitle per brief: ~36px, #C4956A (site --gold). Width-fitted so the right
# edge stays ≤1160 (v1 @36px was 627px wide → ended at x=1219, clipped 19px
# past the 1200px canvas edge — VLM caught the truncation).
sub = "Кейтеринг Санкт-Петербурга"
f_sub = fit_font(DEJAVU_SERIF, sub, 568, 36)
d.text((tx + 2, brand_y + bb[3] + 62), sub, font=f_sub, fill=(196, 149, 106))

og.save(f"{PUB}/og-image.jpg", quality=88, optimize=True, progressive=True)
print("og-image.jpg", og.size, os.path.getsize(f"{PUB}/og-image.jpg"), "bytes")
