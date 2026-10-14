"""Makes a printable A4 symbol-key sheet (PNG + PDF) from data/case-symbol-key.txt and puts a copy in every drive folder.

Run: python deploy/make-key-sheet.py   (Windows fonts: Segoe UI Symbol draws the same glyphs the site shows)
Needs Pillow. Output: data/drives/symbol-key.png/.pdf and a copy in each data/drives/team-N/.
"""
import re
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = Path("C:/Windows/Fonts")
GREEN, INK, GREY = (21, 128, 61), (17, 17, 17), (115, 115, 115)

pairs = [m.groups() for m in (re.match(r"^(\S) = ([A-Z])$", l) for l in (ROOT / "data/case-symbol-key.txt").read_text(encoding="utf8").splitlines()) if m]
assert len(pairs) == 26, f"expected 26 symbols, found {len(pairs)}"

W, H = 1654, 2339  # A4 at 200 dpi
img = Image.new("RGB", (W, H), "white")
d = ImageDraw.Draw(img)
mono_b, mono = (ImageFont.truetype(str(FONTS / n), s) for n, s in (("consolab.ttf", 64), ("consola.ttf", 30)))
sym = ImageFont.truetype(str(FONTS / "seguisym.ttf"), 78)
letter = ImageFont.truetype(str(FONTS / "consolab.ttf"), 78)

d.text((110, 120), "SYMBOL KEY", font=mono_b, fill=INK)
d.text((110, 205), "Bea F. Wellington case file", font=mono, fill=GREEN)
d.line([(110, 265), (W - 110, 265)], fill=GREEN, width=4)

top, row_h, col_w = 330, 140, (W - 220) // 2
for i, (g, l) in enumerate(pairs):
    x, y = 110 + (i // 13) * col_w, top + (i % 13) * row_h
    d.text((x + 40, y), g, font=sym, fill=INK)
    d.text((x + 250, y), "=", font=letter, fill=GREY)
    d.text((x + 360, y), l, font=letter, fill=GREEN)
    d.line([(x, y + row_h - 20), (x + col_w - 60, y + row_h - 20)], fill=(220, 220, 220), width=2)

d.text((110, H - 150), "Cyber & Law Society", font=mono, fill=GREY)

out = ROOT / "data/drives"
out.mkdir(parents=True, exist_ok=True)
img.save(out / "symbol-key.png")
img.save(out / "symbol-key.pdf", resolution=200)
for team in sorted(out.glob("team-*")):
    shutil.copy(out / "symbol-key.png", team / "symbol-key.png")
    shutil.copy(out / "symbol-key.pdf", team / "symbol-key.pdf")
print("wrote", out / "symbol-key.png", "and copied to", len(list(out.glob("team-*"))), "drive folders")
