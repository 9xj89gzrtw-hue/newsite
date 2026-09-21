#!/usr/bin/env python3
"""c101 — email-логотип для HTML-писем (CID-вложение, тёмная шапка письма).

Source: public/brand/emblem-white-480.png (480x558, P-режим с прозрачностью:
белые буквы + золотые кольца — вариант логотипа для тёмного фона, тот же,
что в «печати шефа» ea-founder-story.tsx).

Output: public/brand/logo-email.png — 120x140 (2x от показа 60x70 в шапке
письма mail_html_wrap; retina-клиенты получают чёткость, обычные — те же
байты). Файл маленький (десятки КБ) — едет инлайн-вложением Content-ID
<logo@nilovcatering.ru>, НЕ внешней картинкой: ноль внешних запросов из
письма сохраняется (принцип c100), оффлайн-рендер и Gmail/Outlook/Apple
Mail показывают CID из multipart/related.

Детерминизм: единственный источник + LANCZOS-даунскейл → одинаковые байты
на каждой сборке (файл коммитится, как favicon-набор C77).
"""

import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "brand", "emblem-white-480.png")
DST = os.path.join(ROOT, "public", "brand", "logo-email.png")

W, H = 120, 140  # 2x от 60x70 в письме

im = Image.open(SRC).convert("RGBA")
bbox = im.getchannel("A").getbbox()
if bbox:
    im = im.crop(bbox)

w, h = im.size
scale = min(W / w, H / h)
nw, nh = max(1, round(w * scale)), max(1, round(h * scale))

# прогрессивный даунскейл (как gen-nilov-icons.py) — без алиасинга колец
cur = im
while min(cur.size) >= max(nw, nh) * 2:
    cur = cur.resize((max(nw, cur.size[0] // 2), max(nh, cur.size[1] // 2)), Image.LANCZOS)
cur = cur.resize((nw, nh), Image.LANCZOS)

canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
canvas.paste(cur, ((W - nw) // 2, (H - nh) // 2), cur)
canvas.save(DST, "PNG", optimize=True)

size = os.path.getsize(DST)
print(f"OK {DST}: {W}x{H}, {size} bytes")
assert size < 200_000, "email-лого подозрительно большое"
