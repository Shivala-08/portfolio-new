#!/usr/bin/env python3
"""
Build the portfolio's Bookshelf from the original shelf demo.

`shelf-demo/file.html` is the untouched original: a Three.js "Working Volumes"
library of seven conceptual hardcovers. This script generates
`public/shelf/index.html` — the same experience, with only its *contents*
swapped for this portfolio's real projects:

  1. Three.js is loaded from /shelf/vendor/ (vendored from three@0.165.0) so the
     shelf never depends on a CDN at runtime.
  2. The seven books come from lib/projects.ts (name, category, summary, sheets).
  3. Cover art is the project's own /covers/*.jpg, cover-cropped into the
     original cover canvas (3:4 art into a 2:3 canvas, never stretched) with the
     original edge shading on top.
  4. The interior page templates read the project's real sheets: Overview on the
     title page, then Problem / Build / Result as chapters, with the Links sheet
     closing the book in the colophon.
  5. Atmosphere pass (shelf-atmosphere-features-manual.md): an 8th RESERVED
     volume — The Skynet, whose write-up is still being written — bound in
     dull slate cloth with a chain-stamped RESERVED band instead of cover art,
     plus a faked volumetric light shaft with slow-drifting dust motes (the
     demo's addDust was dead code: defined, never called).

Everything else — geometry, cloth/foil materials, page physics, camera
choreography, the detail panel, keyboard and the static fallback — is the
original code, byte for byte. Re-run this after editing lib/projects.ts or after
replacing the demo:

    python3 shelf-demo/build-port.py
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEMO = ROOT / "shelf-demo" / "file.html"
OUT = ROOT / "public" / "shelf" / "index.html"

# ---------------------------------------------------------------------------
# 1. Read the portfolio's project data out of lib/projects.ts
# ---------------------------------------------------------------------------

src = (ROOT / "lib" / "projects.ts").read_text(encoding="utf-8")

project_re = re.compile(r'^    id: "([^"]+)",\n    name: "([^"]+)",', re.M)
marks = [(m.start(), m.group(1), m.group(2)) for m in project_re.finditer(src)]
if len(marks) != 7:
    sys.exit(f"expected 7 projects in lib/projects.ts, found {len(marks)}")


def field(chunk: str, pattern: str, default=None):
    m = re.search(pattern, chunk, re.S)
    return m.group(1) if m else default


projects = []
for index, (start, pid, name) in enumerate(marks):
    end = marks[index + 1][0] if index + 1 < len(marks) else len(src)
    chunk = src[start:end]
    sheets = re.findall(
        r'heading: "([^"]+)",\s*\n\s*body: "((?:[^"\\]|\\.)*)"', chunk
    )
    sheets = [(h, json.loads('"' + b + '"')) for h, b in sheets]
    if len(sheets) != 5:
        sys.exit(f"{pid}: expected 5 sheets, found {len(sheets)}")
    heads = [h for h, _ in sheets]
    if heads != ["Overview", "Problem", "Build", "Result", "Links"]:
        sys.exit(f"{pid}: unexpected sheet headings {heads}")
    projects.append(
        {
            "id": pid,
            "name": name,
            "category": field(chunk, r'category: "([^"]+)"'),
            "tagline": field(chunk, r'tagline: "((?:[^"\\]|\\.)*)"'),
            "summary": field(chunk, r'summary:\s*\n?\s*"((?:[^"\\]|\\.)*)"'),
            "spineColor": field(chunk, r'spineColor: "([^"]+)"'),
            "accent": field(chunk, r'fg: "([^"]+)"'),
            "coverImage": field(chunk, r'coverImage: "([^"]+)"'),
            "sheets": dict(sheets),
        }
    )

# ---------------------------------------------------------------------------
# 2. Cosmetics kept from the original design (binding copy, motif, geometry)
# ---------------------------------------------------------------------------

# Geometry + seeds are design, not content: taken from the demo's seven volumes
# in order so the shelf keeps its original proportions and staging.
GEOMETRY = [
    (1.02, 1.58, 0.26, 11),
    (1.10, 1.46, 0.29, 22),
    (0.92, 1.52, 0.22, 33),
    (1.08, 1.68, 0.25, 44),
    (1.00, 1.48, 0.30, 55),
    (0.96, 1.57, 0.24, 66),
    (1.12, 1.63, 0.28, 77),
]

# The demo supports six motif engravings; assigned one per volume.
MOTIFS = [
    ("Pipeline spine", "brackets"),
    ("Orbiting parts", "orbits"),
    ("Braided sync", "paths"),
    ("Folded context", "frames"),
    ("Stacked reels", "modules"),
    ("Linked modules", "caret"),
    ("Spatial rings", "orbits"),
]

# Binding copy is the shelf's own conceit — it describes the cloth, not the
# project, so nothing here makes a claim about the work.
BINDINGS = [
    "Oxide cloth · copper foil",
    "Pine cloth · brass foil",
    "Walnut cloth · bone foil",
    "Iron cloth · steel foil",
    "Terracotta cloth · brass foil",
    "Crimson cloth · bone foil",
    "Violet cloth · silver foil",
]

PALETTES = [
    "Oxide · bone · copper",
    "Pine · cream · brass",
    "Walnut · bone · ink",
    "Iron · sky · silver",
    "Terracotta · cream · ember",
    "Crimson · bone · ash",
    "Violet · mist · silver",
]

FORMATS = [
    "Volume I of VII · field edition",
    "Volume II of VII · field edition",
    "Volume III of VII · field edition",
    "Volume IV of VII · field edition",
    "Volume V of VII · field edition",
    "Volume VI of VII · field edition",
    "Volume VII of VII · field edition",
]

ROMANS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]


def shade(hex_color: str, factor: float) -> str:
    """Darken (factor < 1) or lighten (factor > 1) a #rrggbb colour."""
    h = hex_color.lstrip("#")
    r, g, b = (int(h[i : i + 2], 16) for i in (0, 2, 4))
    if factor <= 1:
        r, g, b = (int(c * factor) for c in (r, g, b))
    else:
        r, g, b = (int(c + (255 - c) * (factor - 1)) for c in (r, g, b))
    return f"#{r:02x}{g:02x}{b:02x}"


books = []
for i, p in enumerate(projects):
    width, height, depth, seed = GEOMETRY[i]
    motif_label, motif_key = MOTIFS[i]
    spine = p["spineColor"]
    accent = p["accent"]
    books.append(
        {
            "id": p["id"],
            "title": p["name"],
            "roman": ROMANS[i],
            "discipline": p["category"],
            "note": p["sheets"]["Overview"],
            "deck": p["summary"],
            "binding": BINDINGS[i],
            "format": FORMATS[i],
            "theme": p["tagline"],
            "motif": motif_label,
            "motifKey": motif_key,
            "paletteLabel": PALETTES[i],
            "color": spine,
            "foil": accent,
            "palette": {
                "paper": spine,
                "paperDeep": shade(spine, 0.72),
                "paperPale": "#f1eadf",
                "ink": "#f4eee6",
                "inkSoft": "#b9b4ae",
                "wall": spine,
                "shelf": "#3a2118",
                "shelfDark": "#1c0e0a",
                "light": shade(accent, 1.35),
                "fill": accent,
            },
            "width": width,
            "height": height,
            "depth": depth,
            "chapters": ["Problem", "Build", "Result"],
            "chapterBodies": [
                p["sheets"]["Problem"],
                p["sheets"]["Build"],
                p["sheets"]["Result"],
            ],
            # Real cover art + the Links sheet, which the original put in the
            # book's colophon.
            "coverUrl": p["coverImage"],
            "linksLine": p["sheets"]["Links"],
            "seed": seed,
        }
    )

# ---------------------------------------------------------------------------
# 2b. The reserved volume (atmosphere manual §2)
#
# The manual's example reserved an in-progress book called "Jarvis"; that
# project does not exist in the knowledge base, so the owner chose The Skynet
# (identity.txt §13-18 — the flagship whose hand-written WebGL renderer is
# real, shipped work, while its full write-up is not done). It is deliberately
# NOT a 5-sheet book: it opens as a reserved notice in the DOM shelf, and in
# the 3D shelf every spread honestly repeats "still being written". No cover
# art exists for it (the seven covers map to the seven featured repos), so
# makeCoverTexture is patched below to draw bound slate cloth with a
# RESERVED band for any book carrying reserved: true.
# ---------------------------------------------------------------------------

RESERVED_NOTE = (
    "Still being written — check back soon. The short version while you wait: "
    "the original Three.js + React Three Fiber stack measured 883 KB of "
    "JavaScript, so it was replaced with a ~500-line hand-written WebGL "
    "renderer — custom matrix math, raycast hit testing, shaded instancing — "
    "that ships the same scene in 24.9 KB, a ~97% reduction. The full case "
    "study is being written now; the volume un-reserves when it lands."
)

skynet_spine = "#26323a"
skynet_foil = "#9fb3bd"
books.append(
    {
        "id": "the-skynet",
        "title": "The Skynet",
        "roman": ROMANS[7],
        "reserved": True,
        "discipline": "WebGL / Performance / Graphics",
        "note": RESERVED_NOTE,
        "deck": RESERVED_NOTE,
        "binding": "Slate cloth · steel foil",
        "format": "Volume VIII · reserved edition",
        "theme": "Still being written",
        "motif": "Reserved volume",
        "motifKey": "orbits",
        "paletteLabel": "Slate · steel · dust",
        "color": skynet_spine,
        "foil": skynet_foil,
        "palette": {
            "paper": skynet_spine,
            "paperDeep": shade(skynet_spine, 0.72),
            "paperPale": "#e9e6df",
            "ink": "#eff2f3",
            "inkSoft": "#a7b2b8",
            "wall": "#222b31",
            "shelf": "#3a2118",
            "shelfDark": "#1c0e0a",
            "light": "#cddce1",
            "fill": skynet_foil,
        },
        "width": 1.05,
        "height": 1.62,
        "depth": 0.27,
        # Every spread tells the same honest story — there is no Problem/
        # Build/Result to show for an unfinished write-up.
        "chapters": ["Reserved", "Reserved", "Reserved"],
        "chapterBodies": [RESERVED_NOTE, RESERVED_NOTE, RESERVED_NOTE],
        # No cover art: the cover is drawn as bound cloth (see patch 3d').
        "coverUrl": "",
        "linksLine": "Reserved · do not circulate · progress: engine shipped, case study 0/12 sections",
        "seed": 88,
    }
)

books_js = "    const BOOKS = [\n"
for b in books:
    books_js += "      {\n"
    for key, value in b.items():
        books_js += f"        {key}: {json.dumps(value, ensure_ascii=False)},\n"
    books_js += "      },\n"
books_js += "    ];\n"

# ---------------------------------------------------------------------------
# 3. Patch the demo
# ---------------------------------------------------------------------------

html = DEMO.read_text(encoding="utf-8")
report = []


def sub(pattern: str, replacement: str, label: str, count: int = 1, flags=0) -> None:
    global html
    new, n = re.subn(pattern, replacement, html, count=count, flags=flags)
    if n != count:
        sys.exit(f"patch failed: {label} (matched {n}, expected {count})")
    html = new
    report.append(label)


# --- 3a. Three.js from the local vendor copy instead of a CDN --------------
sub(
    r'"three": "https://cdn\.jsdelivr\.net/npm/three@0\.165\.0/build/three\.module\.js",',
    '"three": "/shelf/vendor/three.module.js",',
    "importmap: three -> local vendor",
)
sub(
    r'"three/addons/": "https://cdn\.jsdelivr\.net/npm/three@0\.165\.0/examples/jsm/"',
    '"three/addons/": "/shelf/vendor/"',
    "importmap: addons -> local vendor",
)

# --- 3b. Data array -------------------------------------------------------
sub(
    r"    const BOOKS = \[.*?\n    \];\n",
    books_js,
    "BOOKS array -> 8 volumes (7 projects + reserved)",
    flags=re.S,
)

# --- 3b'. Carousel geometry: widen the slot so eight volumes sit with the
# same per-book breathing room as the original seven, and set the reserved
# volume apart with a deliberate gap in front of slot 7 (atmosphere §2 —
# "position it slightly separated from the main 7 so it reads as deliberately
# set apart, not just another book").
sub(
    r'    const spacing = 1\.5;',
    "    // Contents patch (atmosphere §2): 8 volumes, wider slots, plus the\n"
    "    // reserved volume's deliberate gap. setSpacing() is defined here and\n"
    "    // called from snapRigToShelfSlot / updateShelfLayout below.\n"
    "    const BASE_SPACING = 1.5;\n"
    "    let spacing = BASE_SPACING * (8 / 7);\n"
    "    function setSpacing(count) {\n"
    "      spacing = BASE_SPACING * (count / 7);\n"
    "    }\n"
    "    function slotShift(index) {\n"
    "      return index >= 7 ? 0.42 : 0;\n"
    "    }",
    "carousel spacing: 8 slots + reserved gap",
)
sub(
    r"      rig\.root\.position\.set\(\n        offset \* spacing,",
    "      rig.root.position.set(\n        offset * spacing + slotShift(index),",
    "snapRigToShelfSlot: reserved gap",
)
sub(
    r"        const targetX = offset \* spacing;",
    "        const targetX = offset * spacing + slotShift(index);",
    "updateShelfLayout: reserved gap",
)

# --- 3c. Drop the embedded cover atlas; load the real covers instead -------
sub(
    r"    const COVER_ATLAS_DATA = \"data:image/webp;base64,[^\"]*\";\n",
    "    // Contents patch: the demo's embedded cover atlas is replaced by the\n"
    "    // portfolio's own cover art, loaded per book from /covers/*.jpg.\n",
    "removed embedded cover atlas",
)
sub(
    r"    const COVER_CROPS = \[.*?\n    \];\n    const coverAtlasImage = new Image\(\);\n"
    r"    coverAtlasImage\.decoding = \"async\";\n    coverAtlasImage\.src = COVER_ATLAS_DATA;\n"
    r"    let coverAtlasReady = false;\n",
    "    const coverImages = BOOKS.map((book) => {\n"
    "      // The reserved volume carries no coverUrl — null keeps it out of\n"
    "      // the decode set below (filter(Boolean) only works on nulls, and\n"
    "      // an Image with an empty src rejects decode() and would poison the\n"
    "      // whole Promise.all gate into procedural covers for every book).\n"
    "      if (!book.coverUrl) return null;\n"
    "      const image = new Image();\n"
    "      image.decoding = \"async\";\n"
    "      image.src = book.coverUrl;\n"
    "      return image;\n"
    "    });\n"
    "    // True once every real cover has decoded and can be drawn.\n"
    "    let coverAtlasReady = false;\n",
    "cover crops -> per-book cover images",
    flags=re.S,
)

# --- 3d. Draw the real cover, cover-cropped (3:4 art into a 2:3 canvas) ----
sub(
    r"      if \(coverAtlasReady\) \{\n"
    r"        const \[sourceX, sourceY, sourceWidth, sourceHeight\] = COVER_CROPS\[BOOKS\.indexOf\(book\)\];\n"
    r"        ctx\.drawImage\(\n"
    r"          coverAtlasImage,\n"
    r"          sourceX,\n"
    r"          sourceY,\n"
    r"          sourceWidth,\n"
    r"          sourceHeight,\n"
    r"          0,\n"
    r"          0,\n"
    r"          canvasTexture\.width,\n"
    r"          canvasTexture\.height\n"
    r"        \);\n",
    "      const coverImage = coverImages[BOOKS.indexOf(book)];\n"
    "      if (coverAtlasReady && coverImage && coverImage.naturalWidth > 0) {\n"
    "        // Cover-crop the real art to this canvas: scale to fill, centre it,\n"
    "        // and let the overhang fall outside the panel. Never stretch it.\n"
    "        const artRatio = coverImage.naturalWidth / coverImage.naturalHeight;\n"
    "        const panelRatio = canvasTexture.width / canvasTexture.height;\n"
    "        let sourceWidth = coverImage.naturalWidth;\n"
    "        let sourceHeight = coverImage.naturalHeight;\n"
    "        let sourceX = 0;\n"
    "        let sourceY = 0;\n"
    "        if (artRatio > panelRatio) {\n"
    "          sourceWidth = coverImage.naturalHeight * panelRatio;\n"
    "          sourceX = (coverImage.naturalWidth - sourceWidth) / 2;\n"
    "        } else {\n"
    "          sourceHeight = coverImage.naturalWidth / panelRatio;\n"
    "          sourceY = (coverImage.naturalHeight - sourceHeight) / 2;\n"
    "        }\n"
    "        ctx.drawImage(\n"
    "          coverImage,\n"
    "          sourceX,\n"
    "          sourceY,\n"
    "          sourceWidth,\n"
    "          sourceHeight,\n"
    "          0,\n"
    "          0,\n"
    "          canvasTexture.width,\n"
    "          canvasTexture.height\n"
    "        );\n",
    "cover texture: real art, cover-cropped",
)

# --- 3d'. Reserved volume: draw bound slate cloth + a RESERVED band instead
# of cover art (atmosphere §2). The Skynet has no cover art — the seven
# /covers/*.jpg map to the seven featured repos — so its cover is painted:
# dull slate cloth, the motif ring, and a dashed RESERVED stamp. The demo's
# material system then does the rest (cloth bump, sheen, edge shading).
sub(
    r"      const coverImage = coverImages\[BOOKS\.indexOf\(book\)\];\n"
    r"      if \(coverAtlasReady && coverImage && coverImage\.naturalWidth > 0\) \{",
    "      const coverImage = coverImages[BOOKS.indexOf(book)];\n"
    "      if (book.reserved) {\n"
    "        // Contents patch (atmosphere §2): a reserved volume is bound, not\n"
    "        // illustrated — dull slate cloth with a chain-stamped RESERVED band,\n"
    "        // visibly duller than the seven finished covers beside it.\n"
    "        ctx.fillStyle = book.color;\n"
    "        ctx.fillRect(0, 0, canvasTexture.width, canvasTexture.height);\n"
    "        const reservedShade = ctx.createLinearGradient(0, 0, canvasTexture.width, 0);\n"
    "        reservedShade.addColorStop(0, \"rgba(0,0,0,0.3)\");\n"
    "        reservedShade.addColorStop(0.5, \"rgba(0,0,0,0.06)\");\n"
    "        reservedShade.addColorStop(1, \"rgba(0,0,0,0.26)\");\n"
    "        ctx.fillStyle = reservedShade;\n"
    "        ctx.fillRect(0, 0, canvasTexture.width, canvasTexture.height);\n"
    "        ctx.strokeStyle = book.foil;\n"
    "        ctx.globalAlpha = 0.5;\n"
    "        ctx.lineWidth = 2;\n"
    "        ctx.strokeRect(42, 42, canvasTexture.width - 84, canvasTexture.height - 84);\n"
    "        ctx.globalAlpha = 1;\n"
    "        drawMotif(ctx, book, canvasTexture.width, canvasTexture.height);\n"
    "        ctx.strokeStyle = book.foil;\n"
    "        ctx.lineWidth = 3;\n"
    "        ctx.setLineDash([14, 10]);\n"
    "        ctx.strokeRect(\n"
    "          canvasTexture.width * 0.18,\n"
    "          canvasTexture.height * 0.44,\n"
    "          canvasTexture.width * 0.64,\n"
    "          canvasTexture.height * 0.13\n"
    "        );\n"
    "        ctx.setLineDash([]);\n"
    "        ctx.fillStyle = book.foil;\n"
    "        ctx.textAlign = \"center\";\n"
    "        ctx.textBaseline = \"middle\";\n"
    "        ctx.font = '600 54px Inter, \"Helvetica Neue\", Arial, sans-serif';\n"
    "        ctx.letterSpacing = \"18px\";\n"
    "        ctx.fillText(\n"
    "          \"RESERVED\",\n"
    "          canvasTexture.width / 2,\n"
    "          canvasTexture.height * 0.505\n"
    "        );\n"
    "        ctx.font = '500 26px Inter, \"Helvetica Neue\", Arial, sans-serif';\n"
    "        ctx.letterSpacing = \"6px\";\n"
    "        ctx.fillText(\n"
    "          \"STILL BEING WRITTEN\",\n"
    "          canvasTexture.width / 2,\n"
    "          canvasTexture.height * 0.585\n"
    "        );\n"
    "        return configureCanvasTexture(new THREE.CanvasTexture(canvasTexture));\n"
    "      }\n"
    "      if (coverAtlasReady && coverImage && coverImage.naturalWidth > 0) {",
    "reserved cover: bound cloth + RESERVED band",
)

# --- 3e. Await all seven covers before building the shelf ------------------
sub(
    r"      try \{\n        await coverAtlasImage\.decode\(\);\n        coverAtlasReady = true;\n"
    r"      \} catch \(error\) \{\n        coverAtlasReady = false;\n      \}\n",
    "      try {\n"
    "        await Promise.all(coverImages.map((image) => image.decode()));\n"
    "        coverAtlasReady = coverImages.every((image) => image.naturalWidth > 0);\n"
    "      } catch (error) {\n"
    "        coverAtlasReady = false;\n"
    "      }\n",
    "load gate: decode the 7 real covers",
)

# --- 3e'. Load gate: only the seven featured covers decode. The reserved
# volume carries no coverUrl (patch 3d' paints its cover instead), so a
# filter + Boolean guard keeps the empty image out of the decode set.
sub(
    r"        await Promise\.all\(coverImages\.map\(\(image\) => image\.decode\(\)\)\);\n"
    r"        coverAtlasReady = coverImages\.every\(\(image\) => image\.naturalWidth > 0\);",
    "        await Promise.allSettled(\n"
    "          coverImages.filter(Boolean).map((image) => image.decode())\n"
    "        );\n"
    "        coverAtlasReady = coverImages.every(\n"
    "          (image) => !image || image.naturalWidth > 0\n"
    "        );",
    "load gate: skip the reserved volume's empty cover",
)

# --- 3f. Interior pages carry the real sheet copy -------------------------
sub(
    r"(\n\s*)chapterIndex === 0 \? book\.note : book\.deck,",
    r"\1book.chapterBodies[chapterIndex],",
    "chapter pages -> Problem / Build sheet bodies",
)
sub(
    r"(\n\s*)drawWrappedCanvasText\(ctx, book\.deck, 54, 438, 42, 28, 6\);",
    r"\1drawWrappedCanvasText(ctx, book.chapterBodies[2], 54, 438, 42, 28, 6);",
    "chapter 3 page -> Result sheet body",
)
sub(
    r"            `\$\{book\.binding\}\. \$\{book\.format\}\. Conceived as an original editorial study for Working Volumes\.`,",
    "            `${book.binding}. ${book.format}. ${book.linksLine}`,",
    "colophon -> Links sheet",
)

# --- 3g. Identity of the collection ---------------------------------------
sub(
    r"<title>Working Volumes — Seven Tools for Making</title>",
    "<title>Bookshelf — 47 Tabs Open</title>",
    "document title",
)
sub(
    r'    content="Working Volumes is an original interactive Three\.js library of seven tactile field guides for contemporary creative tools\."',
    '    content="Seven projects, bound as a tactile Three.js shelf — covers, cloth and the full write-up inside each volume."',
    "meta description",
)
sub(
    r"        <strong>Working Volumes</strong>\n        <span>Seven field guides for making</span>",
    "        <strong>47 Tabs Open</strong>\n        <span>Seven volumes · Pallav Dholariya</span>",
    "masthead identity",
)
sub(
    r"          <p class=\"fallback__kicker\">Working Volumes · Static catalog</p>\n"
    r"          <h2 id=\"fallback-title\">Seven tools for making\.</h2>",
    "          <p class=\"fallback__kicker\">47 Tabs Open · Static catalog</p>\n"
    "          <h2 id=\"fallback-title\">Seven projects, bound.</h2>",
    "fallback heading",
)

# --- 3g'. Collection copy mentions the reserved volume (atmosphere §2).
sub(
    r"        <strong>47 Tabs Open</strong>\n        <span>Seven volumes · Pallav Dholariya</span>",
    "        <strong>47 Tabs Open</strong>\n"
    "        <span>Seven volumes · one reserved · Pallav Dholariya</span>",
    "masthead identity (reserved)",
)
sub(
    r'          <h2 id="fallback-title">Seven projects, bound\.</h2>',
    "          <h2 id=\"fallback-title\">Seven projects, bound. One still being written.</h2>",
    "fallback heading (reserved)",
)
# --- 3h. Static fallback grid ---------------------------------------------
fallback_books = "\n".join(
    f'        <article class="fallback-book" style="--book-color:{b["color"]};'
    f'--book-foil:{b["foil"]};--book-height:{330 + (i % 4) * 22}px">'
    + (
        f'<span>Volume {b["roman"]} · reserved</span>'
        if b.get("reserved")
        else f'<span>Volume {b["roman"]}</span>'
    )
    + f'<strong>{b["title"]}</strong></article>'
    for i, b in enumerate(books)
)
sub(
    r"      <div class=\"fallback__grid\" aria-label=\"Seven conceptual hardcovers\">\n.*?\n      </div>\n",
    '      <div class="fallback__grid" aria-label="Seven project volumes, one reserved">\n'
    + fallback_books
    + "\n      </div>\n",
    "fallback grid -> 8 volumes (7 + reserved)",
    flags=re.S,
)
sub(
    r"        <span>All bindings, motifs, descriptions, geometry, and cover artworks are original to this conceptual study\.</span>\n"
    r"        <span>Product names are used editorially and remain the property of their respective owners\.</span>",
    "        <span>Seven real projects, each bound in its own cover art — plus one reserved volume, still being written.</span>\n"
    "        <span>Shelf engine: the original Working Volumes Three.js study.</span>",
    "fallback footer (reserved)",
)

# --- 3k. Reserved volume rig additions (atmosphere §2): a chain-link icon
# stamped on the spine, and a dedicated hit target so the volume stays easy
# to grab despite sitting behind the deliberate gap.
sub(
    r"      hit\.userData\.index = index;\n      motion\.add\(hit\);\n      hitTargets\.push\(hit\);",
    "      hit.userData.index = index;\n"
    "      motion.add(hit);\n"
    "      hitTargets.push(hit);\n"
    "\n"
    "      if (book.reserved) {\n"
    "        // Contents patch (atmosphere §2): a chain-link icon on the spine —\n"
    "        // the reserved book's equivalent of the foil motif on finished covers.\n"
    "        const chainIcon = createMesh(\n"
    "          shared.plane,\n"
    "          new THREE.MeshBasicMaterial({\n"
    "            color: new THREE.Color(book.foil),\n"
    "            transparent: true,\n"
    "            opacity: 0.55,\n"
    "            depthWrite: false\n"
    "          }),\n"
    "          `${book.id}-chain-icon`,\n"
    "          false,\n"
    "          true\n"
    "        );\n"
    "        chainIcon.scale.set(0.055, 0.055, 1);\n"
    "        chainIcon.position.set(-spineWidth * 0.5 - 0.004, height * 0.32, pageDepth * 0.5 + 0.004);\n"
    "        chainIcon.rotation.y = Math.PI * 0.5;\n"
    "        const chainCanvas = document.createElement(\"canvas\");\n"
    "        chainCanvas.width = 64;\n"
    "        chainCanvas.height = 64;\n"
    "        const chainCtx = chainCanvas.getContext(\"2d\");\n"
    "        if (chainCtx) {\n"
    "          chainCtx.clearRect(0, 0, 64, 64);\n"
    "          chainCtx.strokeStyle = \"#ffffff\";\n"
    "          chainCtx.lineWidth = 7;\n"
    "          chainCtx.beginPath();\n"
    "          chainCtx.ellipse(23, 32, 13, 9, -0.5, 0, Math.PI * 2);\n"
    "          chainCtx.stroke();\n"
    "          chainCtx.beginPath();\n"
    "          chainCtx.ellipse(41, 32, 13, 9, -0.5, 0, Math.PI * 2);\n"
    "          chainCtx.stroke();\n"
    "          const chainTexture = new THREE.CanvasTexture(chainCanvas);\n"
    "          chainTexture.needsUpdate = true;\n"
    "          chainIcon.material.alphaMap = chainTexture;\n"
    "          chainIcon.material.needsUpdate = true;\n"
    "        }\n"
    "        motion.add(chainIcon);\n"
    "      }",
    "reserved rig: chain icon + hit target",
)
sub(
    r"        roughness: book\.id === \"cursor\" \? 0\.22 : 0\.2,\n"
    r"        metalness: book\.id === \"cursor\" \? 0\.34 : 0\.94,",
    "        roughness: book.reserved ? 0.62 : book.id === \"cursor\" ? 0.22 : 0.2,\n"
    "        metalness: book.reserved ? 0.32 : book.id === \"cursor\" ? 0.34 : 0.94,",
    "reserved foil: matte steel, not bright brass",
)
sub(
    r"        sheen: 0\.34,\n        sheenRoughness: 0\.76,",
    "        sheen: book.reserved ? 0.14 : 0.34,\n"
    "        sheenRoughness: book.reserved ? 0.92 : 0.76,",
    "reserved cloth: dull sheen",
)
sub(
    r'      <p class="eyebrow" id="detail-eyebrow">Volume I · Agentic craft</p>',
    '      <p class="eyebrow" id="detail-eyebrow">Volume I · Seven volumes</p>',
    "detail eyebrow placeholder",
)
sub(
    r'      <p class="detail-deck" id="detail-deck">\n'
    r"        A field manual for turning clear intent into working software, with verification treated as part of the craft\.\n"
    r"      </p>",
    '      <p class="detail-deck" id="detail-deck">\n'
    "        Select a volume to read its write-up.\n"
    "      </p>",
    "detail deck placeholder",
)
sub(
    r'          <dd id="detail-binding">Evergreen cloth · antique brass foil</dd>',
    '          <dd id="detail-binding">Oxide cloth · copper foil</dd>',
    "detail binding placeholder",
)
sub(
    r'          <dd id="detail-format">148 × 216 mm · imagined edition</dd>',
    '          <dd id="detail-format">Volume I of VII · field edition</dd>',
    "detail format placeholder",
)
sub(
    r'          <dd id="detail-theme">Intent into implementation</dd>',
    '          <dd id="detail-theme">Repo in, live site out</dd>',
    "detail theme placeholder",
)
sub(
    r'          <dd id="detail-motif">Nested brackets</dd>',
    '          <dd id="detail-motif">Pipeline spine</dd>',
    "detail motif placeholder",
)

# --- 3j. Pre-hydration placeholders in the live scene ----------------------
# These hold the demo's first volume ("Codex") in the served HTML, so they are
# what a crawler or a no-JS visitor sees: the page's <h1> was announcing a book
# that doesn't exist. Seed them with volume I instead.


def esc(text: str) -> str:
    """The `html` name is taken by the document itself, so escape by hand."""
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


first = books[0]
sub(
    r'<strong id="pointer-label-title">Codex</strong>',
    f'<strong id="pointer-label-title">{esc(first["title"])}</strong>',
    "pointer label placeholder",
)
sub(
    r'<h1 class="selection__title" id="selection-title">Codex</h1>',
    f'<h1 class="selection__title" id="selection-title">{esc(first["title"])}</h1>',
    "selection title placeholder (the page h1)",
)
sub(
    r'<p class="selection__note" id="selection-note">Precise intent, translated into tested systems\.</p>',
    f'<p class="selection__note" id="selection-note">{esc(first["note"])}</p>',
    "selection note placeholder",
)
sub(
    r'<h2 class="detail-title" id="detail-title">Codex</h2>',
    f'<h2 class="detail-title" id="detail-title">{esc(first["title"])}</h2>',
    "detail title placeholder",
)

# --- 3l. Light shaft + slow-drifting motes (atmosphere §6) -----------------
# The demo's addDust() was dead code: defined, never called, and its dust was
# an unbounded 110-point cloud spread across the whole room. Replaced with a
# warm, fake-volumetric shaft off to the right of the shelf — additive-blend
# gradient shader on a quad, no occlusion of any book — plus 44 motes
# (manual: "keep particle count low, 30-60") drifting inside the shaft's
# bounds with a shared uTime. updateDust() is patched to drive both.
sub(
    r"    function addDust\(\) \{.*?\n    \}\n",
    "    // Contents patch (atmosphere §6): faked volumetric light shaft + motes.\n"
    "    // The demo's addDust was dead code; this replaces it with a bounded,\n"
    "    // additive-blend shaft (off to the side, never in front of a book) and\n"
    "    // 44 drifting motes — atmosphere, not a showcase.\n"
    "    const DUST_COUNT = 44;\n"
    "    let motes = null;\n"
    "    let moteMaterial = null;\n"
    "    let shaft = null;\n"
    "\n"
    "    function makeMoteTexture() {\n"
    "      const canvas = document.createElement(\"canvas\");\n"
    "      canvas.width = 32;\n"
    "      canvas.height = 32;\n"
    "      const ctx = canvas.getContext(\"2d\");\n"
    "      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);\n"
    "      gradient.addColorStop(0, \"rgba(255,244,220,0.9)\");\n"
    "      gradient.addColorStop(0.5, \"rgba(255,238,205,0.28)\");\n"
    "      gradient.addColorStop(1, \"rgba(255,238,205,0)\");\n"
    "      ctx.fillStyle = gradient;\n"
    "      ctx.fillRect(0, 0, 32, 32);\n"
    "      const texture = new THREE.CanvasTexture(canvas);\n"
    "      texture.needsUpdate = true;\n"
    "      return texture;\n"
    "    }\n"
    "\n"
    "    function addDust() {\n"
    "      // The shaft: a tilted quad with an additive gradient shader,\n"
    "      // implying a window off-scene to the upper right.\n"
    "      const shaftGeometry = new THREE.PlaneGeometry(1.35, 5.4, 1, 1);\n"
    "      const shaftMaterial = new THREE.ShaderMaterial({\n"
    "        transparent: true,\n"
    "        depthWrite: false,\n"
    "        blending: THREE.AdditiveBlending,\n"
    "        side: THREE.DoubleSide,\n"
    "        uniforms: { uTime: { value: 0 } },\n"
    "        vertexShader: `\n"
    "          varying vec2 vUv;\n"
    "          void main() {\n"
    "            vUv = uv;\n"
    "            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n"
    "          }\n"
    "        `,\n"
    "        fragmentShader: `\n"
    "          varying vec2 vUv;\n"
    "          uniform float uTime;\n"
    "          void main() {\n"
    "            float across = smoothstep(0.0, 0.42, vUv.x) * (1.0 - smoothstep(0.58, 1.0, vUv.x));\n"
    "            float along = pow(1.0 - vUv.y, 1.45);\n"
    "            float shimmer = 0.965 + 0.035 * sin(uTime * 0.6 + vUv.y * 3.1);\n"
    "            float intensity = across * along * 0.16 * shimmer;\n"
    "            gl_FragColor = vec4(vec3(1.0, 0.925, 0.78), intensity);\n"
    "          }\n"
    "        `\n"
    "      });\n"
    "      shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);\n"
    "      shaft.name = \"reading-light-shaft\";\n"
    "      shaft.position.set(3.15, 2.9, -0.9);\n"
    "      shaft.rotation.set(0, -0.5, 0.3);\n"
    "      scene.add(shaft);\n"
    "\n"
    "      // The motes: a few dozen softly-textured points inside the shaft,\n"
    "      // each with a slow vertical drift and slight horizontal sway.\n"
    "      const random = seededRandom(20260926);\n"
    "      const positions = new Float32Array(DUST_COUNT * 3);\n"
    "      const seeds = new Float32Array(DUST_COUNT);\n"
    "      for (let index = 0; index < DUST_COUNT; index += 1) {\n"
    "        const localX = (random() - 0.5) * 1.0;\n"
    "        const localY = random() * 4.6;\n"
    "        positions[index * 3] = 3.15 + localX * 0.82 + localY * 0.29;\n"
    "        positions[index * 3 + 1] = 0.7 + localY;\n"
    "        positions[index * 3 + 2] = -0.9 + (random() - 0.5) * 0.55 - localY * 0.16;\n"
    "        seeds[index] = random() * Math.PI * 2.0;\n"
    "      }\n"
    "      const moteGeometry = new THREE.BufferGeometry();\n"
    "      moteGeometry.setAttribute(\"position\", new THREE.BufferAttribute(positions, 3));\n"
    "      moteGeometry.setAttribute(\"aSeed\", new THREE.BufferAttribute(seeds, 1));\n"
    "      moteMaterial = new THREE.ShaderMaterial({\n"
    "        transparent: true,\n"
    "        depthWrite: false,\n"
    "        blending: THREE.AdditiveBlending,\n"
    "        uniforms: {\n"
    "          uTime: { value: 0 },\n"
    "          uMap: { value: makeMoteTexture() }\n"
    "        },\n"
    "        vertexShader: `\n"
    "          attribute float aSeed;\n"
    "          uniform float uTime;\n"
    "          varying float vFade;\n"
    "          void main() {\n"
    "            vec3 pos = position;\n"
    "            pos.y = mod(pos.y - 0.7 - uTime * 0.062 - aSeed * 0.09, 4.6) + 0.7;\n"
    "            pos.x += sin(uTime * 0.23 + aSeed * 2.7) * 0.09;\n"
    "            pos.z += cos(uTime * 0.19 + aSeed * 1.9) * 0.05;\n"
    "            vec4 viewPos = modelViewMatrix * vec4(pos, 1.0);\n"
    "            gl_Position = projectionMatrix * viewPos;\n"
    "            float dist = -viewPos.z;\n"
    "            gl_PointSize = (5.1 + aSeed * 2.4) * (3.4 / max(dist, 0.6));\n"
    "            vFade = clamp(1.0 - abs(pos.y - 3.0) / 2.6, 0.15, 1.0);\n"
    "          }\n"
    "        `,\n"
    "        fragmentShader: `\n"
    "          uniform sampler2D uMap;\n"
    "          uniform float uTime;\n"
    "          varying float vFade;\n"
    "          void main() {\n"
    "            float twinkle = 0.78 + 0.22 * sin(uTime * 0.9 + vFade * 5.2);\n"
    "            vec4 texel = texture2D(uMap, gl_PointCoord);\n"
    "            gl_FragColor = vec4(texel.rgb, texel.a * vFade * twinkle * 0.5);\n"
    "          }\n"
    "        `\n"
    "      });\n"
    "      motes = new THREE.Points(moteGeometry, moteMaterial);\n"
    "      motes.name = \"reading-motes\";\n"
    "      motes.userData.isDust = true;\n"
    "      scene.add(motes);\n"
    "    }\n",
    "light shaft + motes replace dead addDust",
    flags=re.S,
)

# --- 3m. Drive the shaft's uTime + mote drift from the existing dust tick --
sub(
    r"    function updateDust\(elapsed\) \{\n"
    r"      if \(reducedMotion\) return;\n"
    r"      const dust = scene\.getObjectByName\(\"paper-dust\"\);\n"
    r"      if \(dust\) \{\n"
    r"        dust\.rotation\.y = elapsed \* 0\.012;\n"
    r"        dust\.position\.y = Math\.sin\(elapsed \* 0\.17\) \* 0\.025;\n"
    r"      \}\n"
    r"    \}",
    "    function updateDust(elapsed) {\n"
    "      if (reducedMotion) {\n"
    "        // Atmosphere §6/testing: reduced motion freezes the shaft and the\n"
    "        // motes in place instead of animating them — presence without motion.\n"
    "        if (shaft) shaft.material.uniforms.uTime.value = 0;\n"
    "        if (moteMaterial) moteMaterial.uniforms.uTime.value = 0;\n"
    "        return;\n"
    "      }\n"
    "      if (shaft) shaft.material.uniforms.uTime.value = elapsed;\n"
    "      if (moteMaterial) moteMaterial.uniforms.uTime.value = elapsed;\n"
    "    }",
    "updateDust: drive shaft + motes",
)

# --- 3n. Actually call it (the demo never did) -----------------------------
sub(
    r"      addRoom\(\);\n      addLights\(\);\n      buildMarkers\(\);",
    "      addRoom();\n"
    "      addLights();\n"
    "      addDust(); // Contents patch (atmosphere §6): the demo defined this but never called it.\n"
    "      buildMarkers();",
    "setup calls addDust",
)

# ---------------------------------------------------------------------------
# 4. Write it
# ---------------------------------------------------------------------------

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(html, encoding="utf-8")

print(f"wrote {OUT.relative_to(ROOT)}  ({len(html.encode('utf-8')) // 1024} KB)")
print(f"patches applied: {len(report)}")
for label in report:
    print(f"  - {label}")
print("\nvolumes:")
for b in books:
    print(f"  {b['roman']:>3}  {b['title']:<16} {b['coverUrl']:<34} {b['discipline']}")
