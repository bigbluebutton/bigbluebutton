"""Image upload fixtures (img-*). bbb-web turns an image into a one-page PDF with
`convert <file> -auto-orient slide-1.pdf` and then treats it like any PDF page."""
import io

from PIL import Image

from fx_pdf import camera_exif6_jpeg
from pcf_common import png_bytes
from pcf_pdfkit import BLUE, GREEN, RED, YELLOW, marker_image


def img_jpg_exif6_camera(ctx):
    fid = "img-jpg-exif6-camera"
    ctx.write(fid + ".jpg", camera_exif6_jpeg(ctx))
    ctx.manifest(
        id=fid, title="Phone-style JPEG stored sideways (480x320) with EXIF Orientation 6",
        file=fid + ".jpg", issues=[13351, 26001], catalog=["EXIF orientation, direct JPEG upload"],
        pages=1, expect="converted", kind={"defaults": "vector", "rasterize-all": "raster"},
        marker=True, aspect=0.6667, profiles=["defaults", "rasterize-all"],
        notes="Port of camera-portrait-exif6.jpg: a portrait marker rotated 90 degrees "
              "counter-clockwise into 480x320 sensor order, tagged Orientation 6. After "
              "`convert -auto-orient` the slide must be the upright 320x480 portrait (aspect 0.6667); "
              "ImageMagick 6.9.12-98 (noble) does that: a 320x480 page holding one image, no <filter.")


def img_png_alpha(ctx):
    fid = "img-png-alpha"
    canvas = Image.new("RGBA", (480, 320), (0, 0, 0, 0))
    canvas.paste(marker_image(448, 288, "PNG ALPHA").convert("RGBA"), (16, 16))
    ctx.write(fid + ".png", png_bytes(canvas))
    ctx.manifest(
        id=fid, title="480x320 RGBA PNG: marker inside a 16 px fully transparent margin",
        file=fid + ".png", issues=[18550], catalog=["Recording: transparent page background"],
        pages=1, expect="converted", kind="any", marker=True, aspect=1.5,
        notes="Opaque 448x288 marker centred on a transparent 480x320 canvas (alpha 0 in the "
              "margin). PNG written without ancillary chunks (no tIME, no gAMA). kind is any, not "
              "vector: ImageMagick 6.9.12-98 (noble) stores the alpha as an /SMask, and pdftocairo "
              "24.02 then writes 2 <filter and 1 <mask, so bbb-web runs its cairo-vs-splash "
              "comparison.")


def img_webp_lossless(ctx):
    fid = "img-webp-lossless"
    buf = io.BytesIO()
    marker_image(480, 320, "WEBP").save(buf, "WEBP", lossless=True, quality=100, method=4, exact=True)
    ctx.write(fid + ".webp", buf.getvalue())
    ctx.manifest(
        id=fid, title="480x320 lossless WebP marker", file=fid + ".webp", issues=[],
        catalog=["File-type detection"], pages=1, expect="measure", kind="any", marker=True,
        aspect=1.5,
        notes="webp is in bbb-web's image list. Measured locally: ImageMagick 6.9.12-98 (noble, "
              "libwebp 1.3.2) turns it into a 480x320 one-image PDF (1 <image, no <filter).")


SVG = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
  <rect width="480" height="320" fill="#ffffff"/>
  <rect x="0" y="0" width="480" height="45" fill="rgb({r})"/>
  <rect x="0" y="275" width="480" height="45" fill="rgb({b})"/>
  <rect x="0" y="49" width="68" height="222" fill="rgb({g})"/>
  <rect x="412" y="49" width="68" height="222" fill="rgb({y})"/>
  <circle cx="240" cy="190" r="40" fill="none" stroke="#000000" stroke-width="6"/>
  <polygon points="200,90 280,90 240,130" fill="#000000"/>
  <text x="240" y="265" font-family="sans-serif" font-size="22" text-anchor="middle" fill="#000000">SVG upload</text>
</svg>
"""


def img_svg_upload(ctx):
    fid = "img-svg-upload"
    c = {k: ",".join(str(v) for v in rgb) for k, rgb in (("r", RED), ("b", BLUE), ("g", GREEN), ("y", YELLOW))}
    ctx.write(fid + ".svg", SVG.format(**c).encode("ascii"))
    ctx.manifest(
        id=fid, title="Small hand-written SVG: marker bands, a circle, a triangle and text",
        file=fid + ".svg", issues=[], catalog=["File-type detection"], pages=1, expect="measure",
        kind="any", marker=True, aspect=1.5,
        notes="Under 1 KB. svg is in bbb-web's image list, so it goes through ImageMagick (librsvg "
              "or MSVG, whichever delegate the server has). Measured with 6.9.12-98 (noble): a "
              "480x320 page whose image carries an /SMask (2 <filter, 1 <mask in the SVG).")


def img_gif_2frame(ctx):
    fid = "img-gif-2frame"
    frames = [marker_image(480, 320, "GIF FRAME %d" % i).quantize(
        colors=32, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE) for i in (1, 2)]
    buf = io.BytesIO()
    frames[0].save(buf, "GIF", save_all=True, append_images=frames[1:], duration=800, loop=0,
                   optimize=False, disposal=1)
    ctx.write(fid + ".gif", buf.getvalue())
    ctx.manifest(
        id=fid, title="Two-frame animated GIF of the marker", file=fid + ".gif", issues=[],
        catalog=["File-type detection"], pages=1, expect="measure", kind="any", marker=True,
        aspect=1.5,
        notes="gif is not in bbb-web's supported extensions; this records how the upload is "
              "refused. If it were accepted, `convert -auto-orient` would write a 2-page PDF "
              "(measured with ImageMagick 6.9.12-98).")


def img_tiff_2page(ctx):
    fid = "img-tiff-2page"
    pages = [marker_image(480, 320, "TIFF PAGE %d" % i) for i in (1, 2)]
    buf = io.BytesIO()
    pages[0].save(buf, "TIFF", save_all=True, append_images=pages[1:], compression="tiff_lzw")
    ctx.write(fid + ".tiff", buf.getvalue())
    ctx.manifest(
        id=fid, title="Two-page LZW TIFF of the marker", file=fid + ".tiff", issues=[],
        catalog=["File-type detection"], pages=1, expect="measure", kind="any", marker=True,
        aspect=1.5,
        notes="tiff is not in bbb-web's supported extensions; this records how the upload is "
              "refused. ImageMagick 6.9.12-98 would turn it into a 2-page PDF.")


ALL = [img_jpg_exif6_camera, img_png_alpha, img_webp_lossless, img_svg_upload, img_gif_2frame,
       img_tiff_2page]
