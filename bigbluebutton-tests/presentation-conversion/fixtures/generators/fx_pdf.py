"""PDF fixtures (pdf-*). Each function writes one file plus its manifest.

Predicted kinds follow bbb-web's per-page rules (SvgImageCreatorImp): a Type 3 font on the
page or more than 800 <image, 800 <path or 10000 <use tags in the pdftocairo SVG gives a
raster slide; a <filter tag starts a cairo-vs-splash comparison whose outcome cannot be
predicted, so such pages are `any`. The low-thresholds profile lowers the limits to 100
paths, 5 images, 500 uses, rasterises on the first <mask and skips the comparison.
"""
import io

import numpy as np
import img2pdf
import pikepdf
from PIL import Image

from pcf_common import jpeg_bytes, kind_by_profile, photo_like, srgb_icc
from pcf_pdfkit import (Doc, N, ext_gstate, form_xobject, gray_smask, helv_width, icc_stream,
                        jpeg_image, luminosity_gstate, marker_image, raw_image, stencil_mask,
                        vector_marker, widget)

W, H = 960, 540
RASTER_ALL = {"rasterize-all": "raster"}


def _profiles(*extra):
    return ["defaults"] + list(extra)


# --------------------------------------------------------------------------------------
# Shared pictures
# --------------------------------------------------------------------------------------
def camera_exif6_jpeg(ctx):
    """Phone-like photo: the portrait scene is stored sideways (480x320) with EXIF
    Orientation 6, as a camera does. Ported from the #26001 camera-portrait-exif6.jpg."""
    if "camera" not in ctx.__dict__:
        up = marker_image(320, 480, "PHOTO")
        stored = up.transpose(Image.Transpose.ROTATE_90)  # 90 degrees counter-clockwise
        ctx.camera = jpeg_bytes(stored, orientation=6)
    return ctx.camera


# --------------------------------------------------------------------------------------
# 1. Base-14 text
# --------------------------------------------------------------------------------------
PROSE = [
    "Presentation conversion keeps this text as vector glyphs.",
    "Helvetica is one of the fourteen standard PDF fonts.",
    "It is not embedded, so poppler substitutes a system font.",
    "Every line on this page is a separate text object.",
    "The next page holds nothing but a number.",
]


def pdf_base14_text_3p(ctx):
    fid = "pdf-base14-text-3p"
    doc = Doc(fid)
    p = doc.page(W, H)
    p.text(80, 320, "Base-14 Helvetica text", size=56)
    p.text(80, 230, "Page 1", size=36)
    p = doc.page(W, H)
    for i, line in enumerate(PROSE):
        p.text(80, 420 - i * 64, line, size=30)
    p = doc.page(W, H)
    p.text((W - helv_width("12", 96)) / 2, 236, "12", size=96)
    ctx.base14 = ctx.write(fid + ".pdf", doc.to_bytes())
    prof = _profiles("rasterize-all", "tight-limits")
    ctx.manifest(
        id=fid, title='Three pages of base-14 Helvetica text, page 3 holds only "12"',
        file=fid + ".pdf", issues=[15209, 24231],
        catalog=["Numeric-only slide text", "Timeout unit mismatch", "Non-embedded fonts in PDF"],
        pages=3, expect="converted", expectByProfile={"tight-limits": "converted"},
        kind=kind_by_profile(prof, "vector", RASTER_ALL), marker=False, aspect="auto", profiles=prof,
        notes="Non-embedded Helvetica (WinAnsiEncoding), one Tf/Td/Tj text object per line. "
              "Page 3 is the numeric-only text body of #15209. pdftocairo 24.02: no image, no filter, "
              "a few dozen <path (glyph outlines) and one <use per glyph, spaces included.")


# --------------------------------------------------------------------------------------
# 2. Page geometry
# --------------------------------------------------------------------------------------
GEOMETRY = [
    ((960, 540), (0, 0), "960 x 540 pt"),
    ((595, 842), (0, 0), "595 x 842 pt (A4)"),
    ((50, 50), (0, 0), "50 x 50 pt"),
    ((2384, 3370), (0, 0), "2384 x 3370 pt (A0)"),
    ((453, 225), (0, 0), "453 x 225 pt"),
    ((960, 540), (100, 100), "960 x 540 pt, origin 100 100"),
]


def pdf_marker_geometry_6p(ctx):
    fid = "pdf-marker-geometry-6p"
    doc = Doc(fid)
    for (w, h), (x0, y0), label in GEOMETRY:
        p = doc.page(w, h, origin=(x0, y0))
        vector_marker(p, x0, y0, w, h, label=label)
    ctx.write(fid + ".pdf", doc.to_bytes())
    prof = _profiles("rasterize-all")
    ctx.manifest(
        id=fid, title="Vector marker on six page sizes, one MediaBox with a non-zero origin",
        file=fid + ".pdf", issues=[24110, 25450, 22684],
        catalog=["Slide dimensions", "Portrait and mixed-orientation decks"],
        pages=6, expect="converted", kind=kind_by_profile(prof, "vector", RASTER_ALL), marker=True,
        aspect="auto", profiles=prof,
        notes="Pages: 960x540, 595x842 (A4 portrait), 50x50, 2384x3370 (A0), 453x225, and 960x540 "
              "with MediaBox [100 100 1060 640]. Each page is a full vector marker plus a Helvetica "
              "label naming its size.")


# --------------------------------------------------------------------------------------
# 3. /Rotate and /CropBox
# --------------------------------------------------------------------------------------
def pdf_rotate_cropbox_3p(ctx):
    fid = "pdf-rotate-cropbox-3p"
    doc = Doc(fid)
    # MediaBox 540x960 shown as 960x540. /Rotate 90 turns the page clockwise, so content
    # drawn through `0 1 -1 0 540 0 cm` appears upright.
    p = doc.page(540, 960, rotate=90)
    p.op("q 0 1 -1 0 540 0 cm")
    vector_marker(p, 0, 0, 960, 540, label="/Rotate 90")
    p.op("Q")
    p = doc.page(540, 960, rotate=270)
    p.op("q 0 -1 1 0 0 960 cm")
    vector_marker(p, 0, 0, 960, 540, label="/Rotate 270")
    p.op("Q")
    # A 960x540 CropBox inside a 1200x800 MediaBox filled with magenta.
    p = doc.page(1200, 800, crop=(120, 130, 1080, 670))
    p.rect(0, 0, 1200, 800, (1, 0, 1))
    vector_marker(p, 120, 130, 960, 540, label="CropBox")
    ctx.write(fid + ".pdf", doc.to_bytes())
    prof = _profiles("rasterize-all")
    ctx.manifest(
        id=fid, title="Upright marker through /Rotate 90, /Rotate 270 and a CropBox",
        file=fid + ".pdf", issues=[15035], catalog=["Recording: CropBox", "Slide dimensions"],
        pages=3, expect="converted", kind=kind_by_profile(prof, "vector", RASTER_ALL), marker=True,
        aspect="auto", profiles=prof,
        notes="Pages 1 and 2 have a 540x960 MediaBox with /Rotate 90 and /Rotate 270 and draw the "
              "marker through a compensating matrix, so the displayed 960x540 page is upright. Page 3 "
              "has MediaBox [0 0 1200 800] filled magenta and CropBox [120 130 1080 670] holding the "
              "marker; no magenta may show and the page box for the aspect check is the CropBox. "
              "Measured with poppler 24.02: pdftocairo -svg honours the CropBox (960x540 viewBox), "
              "but pdftoppm without -cropbox renders the whole MediaBox, so bbb-web's raster path "
              "(rasterize-all, or any rasterised page) shows the magenta frame at a 1.5 aspect ratio.")


# --------------------------------------------------------------------------------------
# 4. Type 3 fonts
# --------------------------------------------------------------------------------------
def pdf_type3_mixed_3p(ctx):
    fid = "pdf-type3-mixed-3p"
    doc = Doc(fid)
    t3 = doc.type3()
    p = doc.page(W, H)
    p.text(80, 300, "TYPE 3 FONT PAGE 1", size=48, font=t3)
    p = doc.page(W, H)
    p.text(80, 300, "Helvetica text on page 2", size=48)
    p = doc.page(3000, 500)
    p.text(120, 220, "TYPE 3 FONT ON A 3000 X 500 PT PAGE", size=96, font=t3)
    ctx.write(fid + ".pdf", doc.to_bytes())
    prof = _profiles("rasterize-all", "tight-limits")
    ctx.manifest(
        id=fid, title="Type 3 text on pages 1 and 3 (3000x500 pt), Helvetica on page 2",
        file=fid + ".pdf", issues=[8835, 12200, 15688], catalog=["Type3 fonts", "Slide dimensions"],
        pages=3, expect="converted", kind=kind_by_profile(prof, "raster"),
        pageOverrides={1: {"kind": "raster"},
                       2: {"kind": kind_by_profile(prof, "vector", RASTER_ALL)},
                       3: {"kind": "raster"}},
        marker=False, aspect="auto", profiles=prof,
        notes="Hand-made Type 3 font (pdffonts: PCFPixel, Type 3): 5x7 pixel glyphs drawn as filled "
              "rectangles from d1 glyph procs, with standard glyph names so pdftotext extracts "
              "'TYPE 3 FONT ...'. bbb-web rasterises pages whose pdffonts output lists Type 3, so "
              "only page 2 stays vector. tight-limits shortens pdfFontsTimeout to 1 s.")


# --------------------------------------------------------------------------------------
# 5. <path threshold
# --------------------------------------------------------------------------------------
def _distinct_rgb(i):
    return ((20 + (i % 12) * 19) / 255.0, (20 + ((i // 12) % 12) * 19) / 255.0, (20 + (i // 144) * 38) / 255.0)


def _rect_grid(p, count, cols, top):
    rows = -(-count // cols)
    cw, ch = W / cols, top / rows
    for i in range(count):
        r, c = divmod(i, cols)
        p.rect(c * cw + 1, top - (r + 1) * ch + 1, cw - 2, ch - 2, _distinct_rgb(i))


def pdf_path_threshold_2p(ctx):
    fid = "pdf-path-threshold-2p"
    doc = Doc(fid)
    for count, cols in ((700, 35), (850, 50)):
        p = doc.page(W, H)
        p.text(20, 512, "%d separately filled rectangles" % count, size=18)
        _rect_grid(p, count, cols, 500)
    ctx.write(fid + ".pdf", doc.to_bytes())
    prof = _profiles("low-thresholds")
    ctx.manifest(
        id=fid, title="700 and 850 separately filled rectangles around the 800 <path threshold",
        file=fid + ".pdf", issues=[24143, 11651],
        catalog=["Path-heavy plots blurry", "SVG too complex for the client"],
        pages=2, expect="converted", kind=kind_by_profile(prof, "vector", {"low-thresholds": "raster"}),
        pageOverrides={1: {"kind": kind_by_profile(prof, "vector", {"low-thresholds": "raster"})},
                       2: {"kind": "raster"}},
        marker=False, aspect="auto", profiles=prof,
        notes="Each rectangle has its own colour and its own fill operator, so cairo writes one <path "
              "per rectangle; the label adds one <path per distinct glyph. bbb-web rasterises above "
              "placementsThreshold (800 <path, misnamed); low-thresholds lowers it to 100.")


# --------------------------------------------------------------------------------------
# 6. <image threshold
# --------------------------------------------------------------------------------------
def pdf_image_tags_2p(ctx):
    fid = "pdf-image-tags-2p"
    doc = Doc(fid)
    rng = np.random.default_rng(6)
    for count, cols in ((10, 10), (820, 41)):
        p = doc.page(W, H)
        p.text(20, 512, "%d distinct 4x4 px images" % count, size=18)
        rows = -(-count // cols)
        cw, ch = W / cols, 500 / rows
        side = min(cw, ch) - 2
        for i in range(count):
            px = rng.integers(0, 256, size=(4, 4, 3), dtype=np.uint8)
            px[0, 0] = (i % 256, i // 256, 7)   # guarantees distinct samples
            im = raw_image(doc, 4, 4, px.tobytes())
            r, c = divmod(i, cols)
            p.draw(im, side, 0, 0, side, c * cw + 1, 500 - (r + 1) * ch + 1)
    ctx.write(fid + ".pdf", doc.to_bytes())
    prof = _profiles("low-thresholds")
    ctx.manifest(
        id=fid, title="10 and 820 distinct tiny images around the 800 <image threshold",
        file=fid + ".pdf", issues=[24143], catalog=["SVG too complex for the client"],
        pages=2, expect="converted", kind=kind_by_profile(prof, "vector", {"low-thresholds": "raster"}),
        pageOverrides={1: {"kind": kind_by_profile(prof, "vector", {"low-thresholds": "raster"})},
                       2: {"kind": "raster"}},
        marker=False, aspect="auto", profiles=prof,
        notes="Each image is its own 4x4 RGB Flate XObject with different samples: cairo writes one "
              "<image per distinct XObject (re-drawing one XObject reuses a single <image) plus one "
              "<use per drawing. imageTagThreshold is 800 (5 in low-thresholds).")


# --------------------------------------------------------------------------------------
# 7. <use threshold
# --------------------------------------------------------------------------------------
LOREM = ("Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt "
         "ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco "
         "laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in "
         "voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat "
         "non proident sunt in culpa qui officia deserunt mollit anim id est laborum ")


def _text_block(p, glyphs, size, leading, x0=20, top=500, width=920):
    """Fill lines with LOREM until `glyphs` characters are drawn; returns the count."""
    pos, drawn, y = 0, 0, top
    while drawn < glyphs:
        line = ""
        while drawn + len(line) < glyphs:
            ch = LOREM[pos % len(LOREM)]
            if helv_width(line + ch, size) > width:
                break
            line += ch
            pos += 1
        p.text(x0, y, line, size=size)
        drawn += len(line)
        y -= leading
    return drawn


def pdf_use_tags_2p(ctx):
    fid = "pdf-use-tags-2p"
    doc = Doc(fid)
    p = doc.page(W, H)
    p.text(20, 512, "About 2000 glyphs", size=18)
    _text_block(p, 2000, 9.5, 11)
    p = doc.page(W, H)
    p.text(20, 512, "More than 10100 glyphs", size=18)
    _text_block(p, 10400, 4.6, 5.4)
    ctx.write(fid + ".pdf", doc.to_bytes())
    prof = _profiles("low-thresholds", "tight-limits")
    ctx.manifest(
        id=fid, title="About 2000 and more than 10100 Helvetica glyphs around the 10000 <use threshold",
        file=fid + ".pdf", issues=[24143, 24189], catalog=["SVG too complex for the client"],
        pages=2, expect="converted", expectByProfile={"tight-limits": "measure"},
        kind=kind_by_profile(prof, "vector", {"low-thresholds": "raster"}),
        pageOverrides={1: {"kind": kind_by_profile(prof, "vector", {"low-thresholds": "raster"})},
                       2: {"kind": "raster"}},
        marker=False, aspect="auto", profiles=prof,
        notes="cairo writes one <use per glyph, spaces included. useTagThreshold is 10000 (500 in "
              "low-thresholds). Under tight-limits, maxBigSvgSize of 200000 bytes turns the dense page-2 "
              "raster (a 2048 px PNG embedded as base64) into the blank slide (observed on 4.0.0-rc.5).")


# --------------------------------------------------------------------------------------
# 8. Luminosity soft mask
# --------------------------------------------------------------------------------------
def pdf_smask_luminosity(ctx):
    fid = "pdf-smask-luminosity"
    doc = Doc(fid)
    p = doc.page(W, H)
    p.text(40, 490, "Shapes under a luminosity soft mask", size=28)
    group = form_xobject(
        doc, [0, 0, W, H],
        b"1 g 60 60 260 380 re f\n0.6 g 350 60 260 380 re f\n0.3 g 640 60 260 380 re f\n"
        b"0 g 150 200 80 100 re f 440 200 80 100 re f 730 200 80 100 re f\n",
        group={"S": N("Transparency"), "CS": N("DeviceGray")})
    gs = luminosity_gstate(doc, group, backdrop=[0])
    p.op("q /%s gs" % p.gstate(gs))
    p.rect(40, 40, 880, 420, (0.85, 0.1, 0.1))
    p.rect(200, 120, 560, 260, (0.1, 0.2, 0.85))
    p.op("Q")
    ctx.write(fid + ".pdf", doc.to_bytes())
    prof = _profiles("low-thresholds")
    ctx.manifest(
        id=fid, title="Red and blue fills under a luminosity soft mask (white, 60 %, 30 % columns)",
        file=fid + ".pdf", issues=[25996], catalog=["Export: soft masks", "Soft mask in transparency group"],
        pages=1, expect="converted", kind=kind_by_profile(prof, "any", {"low-thresholds": "raster"}),
        marker=False, aspect="auto", profiles=prof,
        notes="ExtGState /SMask << /S /Luminosity /G group /BC [0] >> over two filled rectangles: three "
              "columns at full, 60 % and 30 % opacity, each with a fully masked hole. The SVG has <mask "
              "and <filter tags, so with the defaults bbb-web compares the cairo and splash renders "
              "(kind any); low-thresholds rasterises on the first <mask.")


# --------------------------------------------------------------------------------------
# 9. Scanned-style images: /SMask and stencil /ImageMask
# --------------------------------------------------------------------------------------
def _feather_alpha(w, h, edge):
    y = np.arange(h)[:, None]
    x = np.arange(w)[None, :]
    d = np.minimum(np.minimum(x, w - 1 - x), np.minimum(y, h - 1 - y))
    return np.clip(d * 255 // edge, 0, 255).astype(np.uint8)


def _text_strokes(w, h, seed):
    """1-bit page of black 'handwriting' strokes: rows of random-length words."""
    rng = np.random.default_rng(seed)
    ink = np.zeros((h, w), dtype=bool)
    for top in range(40, h - 40, 34):
        x = 60
        while x < w - 120:
            n = int(rng.integers(20, 110))
            ink[top:top + 14, x:x + n] = True
            # ascenders and descenders
            for k in range(x, x + n, int(rng.integers(9, 17))):
                ink[top - int(rng.integers(0, 8)):top + 14 + int(rng.integers(0, 6)), k:k + 3] = True
            ink[top + 4:top + 10, x + 2:x + n - 2] = False
            x += n + int(rng.integers(14, 30))
    return np.packbits(~ink, axis=1).tobytes()   # 0 = paint with the fill colour


def pdf_scanned_2p(ctx):
    fid = "pdf-scanned-2p"
    doc = Doc(fid)
    p = doc.page(W, H)
    pw, ph = 640, 360
    photo = jpeg_bytes(photo_like(pw, ph, seed=91), quality=85)
    sm = gray_smask(doc, pw, ph, _feather_alpha(pw, ph, 40).tobytes())
    p.draw(jpeg_image(doc, photo, pw, ph, smask=sm), W, 0, 0, H, 0, 0)
    p = doc.page(W, H)
    paper = np.clip(232 + np.random.default_rng(92).integers(-10, 11, size=(270, 480, 3)), 0, 255)
    scan = jpeg_bytes(Image.fromarray(paper.astype(np.uint8), "RGB"), quality=80)
    p.draw(jpeg_image(doc, scan, 480, 270), W, 0, 0, H, 0, 0)
    p.op("0 g")
    p.draw(stencil_mask(doc, 960, 540, _text_strokes(960, 540, 93)), W, 0, 0, H, 0, 0)
    ctx.write(fid + ".pdf", doc.to_bytes())
    prof = _profiles("low-thresholds")
    ctx.manifest(
        id=fid, title="Photo JPEG with a feathered /SMask; stencil /ImageMask strokes over a paper JPEG",
        file=fid + ".pdf", issues=[24393, 23598, 9680, 25513], catalog=["Scanned / masked PDFs"],
        pages=2, expect="converted", kind=kind_by_profile(prof, "any", {"low-thresholds": "raster"}),
        marker=False, aspect="auto", profiles=prof,
        notes="Page 1: 640x360 DCT image whose /SMask is an 8-bit alpha image with feathered edges. "
              "Page 2: 1-bit /ImageMask (black text-like strokes, painted with 0 g) over a 480x270 "
              "paper-texture JPEG. Both pages produce <mask and <filter tags: render comparison with "
              "the defaults (kind any), raster in low-thresholds (maskTagThreshold 1).")


# --------------------------------------------------------------------------------------
# 10. Blend modes
# --------------------------------------------------------------------------------------
def pdf_blend_modes(ctx):
    fid = "pdf-blend-modes"
    doc = Doc(fid)
    p = doc.page(W, H)
    p.text(40, 490, "Blend modes: Screen (left), Multiply (right)", size=28)
    p.rect(60, 60, 400, 360, (0.95, 0.75, 0.1))
    p.rect(500, 60, 400, 360, (0.1, 0.75, 0.95))
    screen = ext_gstate(doc, BM="Screen")
    multiply = ext_gstate(doc, BM="Multiply")
    p.op("q /%s gs" % p.gstate(screen))
    p.rect(160, 140, 400, 200, (0.2, 0.3, 0.9))
    p.op("Q", "q /%s gs" % p.gstate(multiply))
    p.rect(400, 200, 400, 200, (0.9, 0.2, 0.6))
    p.op("Q")
    ctx.write(fid + ".pdf", doc.to_bytes())
    ctx.manifest(
        id=fid, title="Overlapping fills with /BM /Screen and /BM /Multiply",
        file=fid + ".pdf", issues=[10016], catalog=["Blend modes"],
        pages=1, expect="converted", kind="any", marker=False, aspect="auto",
        notes="Two opaque base rectangles; a blue one painted with /BM /Screen and a magenta one with "
              "/BM /Multiply overlap them. cairo expresses the blend modes with <filter tags, so "
              "bbb-web compares the cairo and splash renders (kind any).")


# --------------------------------------------------------------------------------------
# 11. Transparent background
# --------------------------------------------------------------------------------------
def pdf_transparent_bg(ctx):
    fid = "pdf-transparent-bg"
    doc = Doc(fid)
    p = doc.page(W, H)
    p.text(60, 450, "No background fill on this page", size=40)
    p.op("0 G 6 w 60 80 320 300 re S")
    p.op("0 g 640 80 m 900 80 l 770 380 l h f")
    p.op("0 g 520 230 m 520 285.2 475.2 330 420 330 c 420 130 l 475.2 130 520 174.8 520 230 c f")
    ctx.write(fid + ".pdf", doc.to_bytes())
    ctx.manifest(
        id=fid, title="Black text and shapes with no background fill",
        file=fid + ".pdf", issues=[18550], catalog=["Recording: transparent page background"],
        pages=1, expect="converted", kind="vector", marker=False, aspect="auto",
        notes="Nothing paints the page background: black text, a stroked rectangle, a filled "
              "triangle and a filled half disc. A viewer that composites the slide on a dark or "
              "transparent canvas shows black on black (#18550).")


# --------------------------------------------------------------------------------------
# 12. Optional content and a widget annotation
# --------------------------------------------------------------------------------------
def pdf_ocg_annots_2p(ctx):
    fid = "pdf-ocg-annots-2p"
    doc = Doc(fid)
    p = doc.page(W, H)
    p.text(60, 450, "Optional content: the red block is OFF", size=36)
    p.rect(60, 100, 300, 240, (0.1, 0.6, 0.1))
    oc = doc.ocg("Hidden red block", off=True)
    p.op("/OC /%s BDC" % p.prop(oc))
    p.rect(500, 100, 400, 240, (1, 0, 0))
    p.op("EMC")
    p = doc.page(W, H)
    p.text(60, 450, "A form widget below", size=36)
    helv = doc.helvetica()
    ap = form_xobject(
        doc, [0, 0, 500, 160],
        b"0 0 0.85 rg 0 0 500 160 re f\nBT /Helv 40 Tf 1 g 40 62 Td (Widget appearance) Tj ET\n",
        resources={"Font": {"Helv": helv}})
    widget(p, [230, 120, 730, 280], ap, "pcfButton", tooltip="Blue box drawn from /AP /N")
    ctx.write(fid + ".pdf", doc.to_bytes())
    ctx.manifest(
        id=fid, title="Red block in an OCG that is OFF by default; Widget annotation drawn from /AP",
        file=fid + ".pdf", issues=[9486], catalog=["Optional content", "Form fields"],
        pages=2, expect="converted", kind="any", marker=False, aspect="auto",
        notes="Page 1: green block visible, red block inside /OC BDC ... EMC whose OCG is listed in "
              "/OCProperties /D /OFF; the red block must not show. Page 2: push-button Widget (/F 4, "
              "printable) whose /AP /N form draws a blue box with white Helvetica text; the catalog "
              "has an /AcroForm without NeedAppearances. pdftocairo 24.02 hides the OCG and draws the "
              "widget.")


# --------------------------------------------------------------------------------------
# 13-17. JPEG passthrough family (#26001)
# --------------------------------------------------------------------------------------
def pdf_exif_1_to_8(ctx):
    fid = "pdf-exif-1-to-8"
    doc = Doc(fid)
    w, h = 240, 160
    for o in range(1, 9):
        jp = jpeg_bytes(marker_image(w, h, "EXIF %d" % o), orientation=o)
        p = doc.page(w, h)
        p.draw(jpeg_image(doc, jp, w, h), w, 0, 0, h, 0, 0)
    ctx.write(fid + ".pdf", doc.to_bytes())
    prof = _profiles("rasterize-all")
    ctx.manifest(
        id=fid, title="Eight pages, the same upright JPEG tagged EXIF Orientation 1 to 8",
        file=fid + ".pdf", issues=[26001], catalog=["EXIF orientation, JPEG inside a PDF"],
        pages=8, expect="converted", kind=kind_by_profile(prof, "vector", RASTER_ALL), marker=True,
        aspect="auto", profiles=prof,
        notes="Port of exif-orientation-1-to-8.pdf with 240x160 px pictures on 240x160 pt pages. The "
              "pixels are upright and the content stream does not compensate: PDF ignores EXIF, so "
              "every page must show the marker upright. pdftocairo copies the JPEG bytes, EXIF "
              "included, into the SVG and browsers then apply the orientation (#26001).")


def pdf_exif6_plus_control(ctx):
    fid = "pdf-exif6-plus-control"
    cam = camera_exif6_jpeg(ctx)
    ctrl = jpeg_bytes(marker_image(320, 480, "CONTROL"))
    doc = Doc(fid)
    p = doc.page(720, 540)
    p.draw(jpeg_image(doc, cam, 480, 320), 0, -400, 266.67, 0, 40, 470)
    p.draw(jpeg_image(doc, ctrl, 320, 480), 266.67, 0, 0, 400, 400, 70)
    ctx.write(fid + ".pdf", doc.to_bytes())
    prof = _profiles("rasterize-all")
    ctx.manifest(
        id=fid, title="Phone photo (EXIF 6, rotated upright by the content stream) next to a control photo",
        file=fid + ".pdf", issues=[26001], catalog=["EXIF orientation, JPEG inside a PDF"],
        pages=1, expect="converted", kind=kind_by_profile(prof, "vector", RASTER_ALL),
        marker={"split": 2}, aspect="auto", profiles=prof,
        notes="Port of slide-photo-plus-control.pdf: 720x540 slide. Left: the sideways-stored 480x320 "
              "camera JPEG with EXIF Orientation 6, drawn with matrix [0 -400 266.67 0 40 470] so it "
              "appears upright. Right: an EXIF-free 320x480 control photo.")


def pdf_img2pdf_rotate90_exif6(ctx):
    fid = "pdf-img2pdf-rotate90-exif6"
    cam = camera_exif6_jpeg(ctx)
    data = img2pdf.convert(cam, rotation=img2pdf.Rotation.auto, nodate=True,
                           engine=img2pdf.Engine.internal)
    ctx.write(fid + ".pdf", data)
    ctx.manifest(
        id=fid, title="img2pdf output: camera JPEG kept verbatim with EXIF 6, page /Rotate 90",
        file=fid + ".pdf", issues=[26001], catalog=["EXIF orientation, JPEG inside a PDF"],
        pages=1, expect="converted", kind="vector", marker=True, aspect="auto",
        notes="Port of img2pdf-camera-exif6.pdf. img2pdf 0.6.3 with rotation=auto maps EXIF 6 to "
              "/Rotate 90 and embeds the JPEG unchanged. Made with the internal engine and "
              "nodate=True, which is byte-reproducible (the pikepdf engine writes a random /ID).")


def pdf_jpeg_passthrough_probes(ctx):
    fid = "pdf-jpeg-passthrough-probes"
    w, h = 480, 320
    plain = jpeg_bytes(marker_image(w, h, "DECODE INV"))
    cmyk = jpeg_bytes(marker_image(w, h, "CMYK").convert("CMYK"))
    doc = Doc(fid)
    for jp, cs, decode in ((plain, "DeviceRGB", [1, 0, 1, 0, 1, 0]),
                           (cmyk, "DeviceCMYK", None),
                           (cmyk, "DeviceCMYK", [1, 0, 1, 0, 1, 0, 1, 0])):
        p = doc.page(w, h)
        p.draw(jpeg_image(doc, jp, w, h, cs=cs, decode=decode), w, 0, 0, h, 0, 0)
    ctx.write(fid + ".pdf", doc.to_bytes())
    ctx.manifest(
        id=fid, title="JPEG passthrough probes: inverting /Decode, CMYK, CMYK with /Decode",
        file=fid + ".pdf", issues=[26001], catalog=["EXIF orientation, JPEG inside a PDF"],
        pages=3, expect="converted", kind="vector", marker=False, aspect="auto",
        notes="Port of jpeg-passthrough-probes.pdf. Page 1: RGB JPEG with /Decode [1 0 1 0 1 0] "
              "(shown inverted). Page 2: Pillow CMYK JPEG as /DeviceCMYK. Page 3: the same with an "
              "inverting /Decode. A fix that copies JPEG bytes verbatim into the SVG must leave these "
              "re-encoded; the goldens record poppler's colours, not the marker.")


def pdf_jpeg_icc_smask_2p(ctx):
    fid = "pdf-jpeg-icc-smask-2p"
    icc = srgb_icc()
    doc = Doc(fid)
    pw, ph = 480, 320
    p = doc.page(W, H)
    jp = jpeg_bytes(photo_like(pw, ph, seed=171), quality=88, icc=icc)
    p.draw(jpeg_image(doc, jp, pw, ph, cs=[N("ICCBased"), icc_stream(doc, icc)]), 810, 0, 0, 540, 75, 0)
    p = doc.page(W, H)
    jp2 = jpeg_bytes(photo_like(pw, ph, seed=172), quality=88)
    alpha = np.broadcast_to((np.arange(pw) * 255 // (pw - 1)).astype(np.uint8)[None, :], (ph, pw))
    sm = gray_smask(doc, pw, ph, np.ascontiguousarray(alpha).tobytes())
    p.draw(jpeg_image(doc, jp2, pw, ph, smask=sm), 810, 0, 0, 540, 75, 0)
    ctx.write(fid + ".pdf", doc.to_bytes())
    ctx.manifest(
        id=fid, title="JPEG with an APP2 sRGB ICC profile; JPEG with a horizontal-gradient /SMask",
        file=fid + ".pdf", issues=[26001],
        catalog=["EXIF orientation, JPEG inside a PDF", "Scanned / masked PDFs"],
        pages=2, expect="converted", kind="any", marker=False, aspect="auto",
        notes="Page 1: JPEG carrying an APP2 ICC profile (Pillow ImageCms sRGB, header date fixed to "
              "2020-01-01) embedded verbatim, colour space [/ICCBased] with the same profile. Page 2: "
              "JPEG whose /SMask fades from transparent (left) to opaque (right); its SVG has <filter "
              "tags, hence kind any. Guards JPEG passthrough changes that could drop the profile or "
              "the mask.")


# --------------------------------------------------------------------------------------
# 18-24. Limits and malformed files
# --------------------------------------------------------------------------------------
def pdf_201_pages(ctx):
    fid = "pdf-201-pages"
    doc = Doc(fid)
    shared = None
    for i in range(201):
        p = doc.page(W, H)
        if shared is None:
            p.text(60, 260, "One of 201 identical pages", size=40)
            p.finish()
            shared = p.contents
        else:
            p.contents = shared
            p.res = doc.pages[0].res
    ctx.write(fid + ".pdf", doc.to_bytes())
    prof = _profiles("tight-limits")
    ctx.manifest(
        id=fid, title="201 pages sharing one content stream, one over the default maxNumPages",
        file=fid + ".pdf", issues=[7202, 25817], catalog=["Page-count limit"],
        pages=0, expect="rejected:PAGE_COUNT_EXCEEDED",
        expectByProfile={"tight-limits": "rejected:PAGE_COUNT_EXCEEDED"},
        kind="any", marker=False, aspect="auto", profiles=prof,
        notes="maxNumPages is 200 by default and 5 in tight-limits; pdfinfo reports 201 pages.")


def pdf_zero_byte(ctx):
    fid = "pdf-zero-byte"
    ctx.write(fid + ".pdf", b"")
    ctx.manifest(
        id=fid, title="Empty file named .pdf", file=fid + ".pdf", issues=[4218, 9867],
        catalog=["Empty or malformed file"], pages=0, expect="measure", kind="any", marker=False,
        aspect="auto",
        notes="Zero bytes. Once blocked the upload modal for minutes (#4218).")


def pdf_truncated_1000b(ctx):
    fid = "pdf-truncated-1000b"
    ctx.write(fid + ".pdf", ctx.base14[:1000])
    ctx.manifest(
        id=fid, title="First 1000 bytes of pdf-base14-text-3p", file=fid + ".pdf", issues=[4218, 9867],
        catalog=["Empty or malformed file"], pages=0, expect="measure", kind="any", marker=False,
        aspect="auto",
        notes="Cut inside the first page's objects: no xref table, no trailer. poppler 24.02 "
              "pdfinfo fails with 'Couldn't find trailer dictionary'.")


def pdf_header_only(ctx):
    fid = "pdf-header-only"
    ctx.write(fid + ".pdf", b"%PDF-1.7\n")
    ctx.manifest(
        id=fid, title="Nine bytes: a bare %PDF-1.7 header", file=fid + ".pdf", issues=[4218, 9867],
        catalog=["Empty or malformed file"], pages=0, expect="measure", kind="any", marker=False,
        aspect="auto",
        notes="Detected as application/pdf by its magic bytes, but holds no objects.")


def _encrypt(src, **enc):
    pdf = pikepdf.open(io.BytesIO(src))
    out = io.BytesIO()
    # RC4-128 (R=3) has no random IV or salt, so with static_id the bytes are reproducible.
    # qpdf's AES modes (R=4, R=6) draw random IVs on every save.
    pdf.save(out, encryption=pikepdf.Encryption(R=3, aes=False, metadata=False, **enc), static_id=True)
    return out.getvalue()


def pdf_encrypted_user_pw(ctx):
    fid = "pdf-encrypted-user-pw"
    ctx.write(fid + ".pdf", _encrypt(ctx.base14, user="x", owner="pcf-owner"))
    ctx.manifest(
        id=fid, title='pdf-base14-text-3p encrypted with user password "x"', file=fid + ".pdf",
        issues=[], catalog=["Encrypted PDF"], pages=3, expect="measure", kind="any", marker=False,
        aspect="auto",
        notes="RC4 128-bit (R=3) through pikepdf, owner password pcf-owner, qpdf's static /ID. "
              "Nothing can be rendered without the password; pdfinfo reports 'Incorrect password'.")


def pdf_encrypted_owner_only(ctx):
    fid = "pdf-encrypted-owner-only"
    perms = pikepdf.Permissions(extract=False, modify_annotation=False, modify_form=False,
                                modify_other=False, modify_assembly=False)
    ctx.write(fid + ".pdf", _encrypt(ctx.base14, user="", owner="x", allow=perms))
    ctx.manifest(
        id=fid, title='pdf-base14-text-3p with owner password "x" and an empty user password',
        file=fid + ".pdf", issues=[], catalog=["Encrypted PDF"], pages=3, expect="measure", kind="any",
        marker=False, aspect="auto",
        notes="RC4 128-bit (R=3), empty user password, so every poppler tool opens it without "
              "asking. Printing is allowed; copying and editing are not (pdfinfo: print:yes copy:no "
              "change:no). poppler 24.02's pdftotext ignores the copy restriction and extracts the "
              "text.")


def pdf_recursive_dicts(ctx):
    fid = "pdf-recursive-dicts"
    doc = Doc(fid)
    helv = doc.helvetica()
    for i in (1, 2):
        p = doc.page(W, H)
        res = doc.pdf.reserve()
        doc.pdf.set(res, {"Font": {"F1": helv}, "Self": res})
        p.resources_ref = res
        p.op("BT /F1 40 Tf 60 300 Td (Resources that reference themselves, page %d) Tj ET" % i)
    ctx.write(fid + ".pdf", doc.to_bytes())
    ctx.manifest(
        id=fid, title="Two pages whose /Resources dictionary holds a /Self reference to itself",
        file=fid + ".pdf", issues=[12839], catalog=["Child-process pipe fill"], pages=2,
        expect="measure", kind="any", marker=False, aspect="auto",
        notes="Each page's indirect /Resources dictionary has /Self pointing at its own object. "
              "Measured with poppler 24.02: pdfinfo, pdfseparate, pdftocairo and pdftoppm print no "
              "warning and render normally (every indirect reference starts a fresh recursion set in "
              "PDFDoc::markObject), so this guards against regressions rather than reproducing the "
              "'Found recursive dicts' flood of #12839.")


# --------------------------------------------------------------------------------------
# 25-26. Smart-slide text and a photo slide
# --------------------------------------------------------------------------------------
def pdf_text_order_poll_2p(ctx):
    fid = "pdf-text-order-poll-2p"
    doc = Doc(fid)
    p = doc.page(W, H)
    # Body first, title last: content-stream order differs from reading order.
    p.text(80, 370, "Which fruit do you eat (one per day)?", size=34)
    p.text(120, 310, "A. Apple", size=30)
    p.text(120, 265, "B. Banana", size=30)
    p.text(120, 220, "C. Cherry", size=30)
    p.text_runs(80, 130, [("Area in m", 30, 0), ("3", 18, 13)])
    p.text(80, 450, "Quick poll", size=48)
    p = doc.page(W, H)
    p.text(60, 460, "Left column", size=36)
    p.text(500, 460, "Right column", size=36)
    for i, (left, right) in enumerate((("First point", "Second point"),
                                       ("Third point", "Fourth point"),
                                       ("Fifth point", "Sixth point"))):
        p.text(60, 380 - i * 60, left, size=28)
        p.text(500, 380 - i * 60, right, size=28)
    ctx.write(fid + ".pdf", doc.to_bytes())
    ctx.manifest(
        id=fid, title="Quick-poll text drawn body-first with a superscript; two text columns",
        file=fid + ".pdf", issues=[23304, 25320, 24613], catalog=["Smart-slide / quick-poll text"],
        pages=2, expect="converted", kind="vector", marker=False, aspect="auto",
        notes="Page 1 draws the question 'Which fruit do you eat (one per day)?', the answers "
              "'A. Apple', 'B. Banana', 'C. Cherry' and 'Area in m' + superscript '3' (Ts rise 13) "
              "before the title 'Quick poll', which sits at the top. Page 2 has two columns, each "
              "with its own heading, drawn row by row. The text goldens show what pdftotext gives "
              "the smart-slide parser.")


def pdf_image_slide_300k(ctx):
    fid = "pdf-image-slide-300k"
    jp = jpeg_bytes(photo_like(800, 600, seed=26, noise=42, cell=20), quality=92)   # ~305 KB
    if not 250000 <= len(jp) <= 350000:
        raise AssertionError(f"photo JPEG is {len(jp)} bytes, outside 250-350 KB: retune noise/quality")
    doc = Doc(fid)
    p = doc.page(W, H)
    p.draw(jpeg_image(doc, jp, 800, 600), 720, 0, 0, 540, 120, 0)
    ctx.write(fid + ".pdf", doc.to_bytes())
    prof = _profiles("tight-limits")
    ctx.manifest(
        id=fid, title="One slide holding an 800x600 photo-like JPEG of about 300 KB",
        file=fid + ".pdf", issues=[], catalog=["Oversized single page", "Preupload via create API"],
        pages=1, expect="converted", expectByProfile={"tight-limits": "measure"}, kind="vector",
        marker=False, aspect="auto", profiles=prof,
        notes="Seeded gradients, blobs and grain so the JPEG stays between 250 and 350 KB. "
              "Under tight-limits the page exceeds maxBigPdfPageSize (50000), so bbb-web first downscales "
              "it, and its SVG exceeds maxBigSvgSize (200000) and becomes the blank slide (observed on 4.0.0-rc.5).")


ALL = [
    pdf_base14_text_3p, pdf_marker_geometry_6p, pdf_rotate_cropbox_3p, pdf_type3_mixed_3p,
    pdf_path_threshold_2p, pdf_image_tags_2p, pdf_use_tags_2p, pdf_smask_luminosity, pdf_scanned_2p,
    pdf_blend_modes, pdf_transparent_bg, pdf_ocg_annots_2p, pdf_exif_1_to_8, pdf_exif6_plus_control,
    pdf_img2pdf_rotate90_exif6, pdf_jpeg_passthrough_probes, pdf_jpeg_icc_smask_2p, pdf_201_pages,
    pdf_zero_byte, pdf_truncated_1000b, pdf_header_only, pdf_encrypted_user_pw,
    pdf_encrypted_owner_only, pdf_recursive_dicts, pdf_text_order_poll_2p, pdf_image_slide_300k,
]
