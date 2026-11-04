"""Shared helpers: output context, manifest writer, image encoders, zip normalisation.

Determinism notes:
- Pixel data is computed with integer arithmetic only (numpy PCG64 integers, no sin/exp),
  so it cannot depend on the CPU's SIMD or libm code paths.
- PNG files are encoded here with Python's zlib (Debian's zlib in the pinned image), not by
  Pillow's bundled zlib; JPEG uses libjpeg-turbo's integer DCT, which is bit-exact across
  SIMD variants.
- Office zips are rewritten with a fixed entry order, fixed timestamps and fixed compression.
"""
import io
import json
import os
import re
import struct
import zipfile
import zlib

import numpy as np
import yaml
from PIL import Image, ImageCms
from observed import OBSERVED

# Every manifest field, in the order of fixtures/README.md.
FIELD_ORDER = [
    "id", "title", "tier", "file", "issues", "catalog", "upload", "pages", "expect",
    "expectByProfile", "kind", "pageOverrides", "marker", "aspect", "checks", "tolerance",
    "profiles", "goldenProfiles", "createParams", "notes",
]
BLOCK_MAPS = {"upload", "expectByProfile", "pageOverrides", "createParams"}
EXPECT_RE = re.compile(r"^(converted|dropped|measure|rejected:[A-Z_]+)$")
KINDS = {"vector", "raster", "blank", "any"}
PROFILES = {"defaults", "rasterize-all", "low-thresholds", "tight-limits", "office-precheck"}
BASE64_LIMIT = 650000

ZIP_DATE = (1980, 1, 1, 0, 0, 0)
DOC_DATE = "2020-01-01T00:00:00Z"
DOC_AUTHOR = "pcf"


# --------------------------------------------------------------------------------------
# Output context
# --------------------------------------------------------------------------------------
class Ctx:
    def __init__(self, out_dir):
        self.out = out_dir
        self.files = {}     # name -> bytes
        self.ids = []

    def write(self, name, data):
        if name in self.files:
            raise ValueError(f"{name} written twice")
        with open(os.path.join(self.out, name), "wb") as f:
            f.write(data)
        self.files[name] = data
        return data

    def manifest(self, **m):
        m.update(OBSERVED.get(m["id"], {}))
        m.setdefault("tier", "synthetic")
        m.setdefault("upload", {"method": "create"})
        m.setdefault("profiles", ["defaults"])
        check_manifest(m, self)
        text = dump_manifest(m)
        if yaml.safe_load(text) != m:
            raise AssertionError(f"manifest {m['id']} does not round-trip through YAML")
        self.ids.append(m["id"])
        self.write(m["id"] + ".yaml", text.encode("utf-8"))


def check_manifest(m, ctx):
    unknown = set(m) - set(FIELD_ORDER)
    if unknown:
        raise ValueError(f"{m.get('id')}: unknown manifest fields {sorted(unknown)}")
    fid = m["id"]
    if not re.match(r"^[a-z0-9][a-z0-9-]*$", fid):
        raise ValueError(f"bad id {fid}")
    stem, _ = os.path.splitext(m["file"])
    if stem != fid:
        raise ValueError(f"{fid}: file stem {stem} differs from id")
    if m["file"] not in ctx.files:
        raise ValueError(f"{fid}: {m['file']} was not written")
    if m["upload"]["method"] in ("create", "insertDocument") and len(ctx.files[m["file"]]) >= BASE64_LIMIT:
        raise ValueError(f"{fid}: {len(ctx.files[m['file']])} bytes, over the base64 upload limit")
    for e in [m["expect"]] + list((m.get("expectByProfile") or {}).values()):
        if not EXPECT_RE.match(e):
            raise ValueError(f"{fid}: bad expect {e}")
    profiles = set(m["profiles"])
    if not profiles <= PROFILES:
        raise ValueError(f"{fid}: unknown profiles {profiles - PROFILES}")
    if not set(m.get("expectByProfile") or {}) <= profiles:
        raise ValueError(f"{fid}: expectByProfile names a profile the fixture does not run in")
    kinds = [m.get("kind")] + [po.get("kind") for po in (m.get("pageOverrides") or {}).values()]
    for k in kinds:
        if k is None:
            continue
        vals = k.values() if isinstance(k, dict) else [k]
        if isinstance(k, dict) and set(k) != profiles:
            raise ValueError(f"{fid}: kind map {sorted(k)} must name exactly the profiles {sorted(profiles)}")
        if not set(vals) <= KINDS:
            raise ValueError(f"{fid}: bad kind {k}")
    for page in (m.get("pageOverrides") or {}):
        if not isinstance(page, int) or not 1 <= page <= m["pages"]:
            raise ValueError(f"{fid}: pageOverrides page {page} outside 1..{m['pages']}")


def kind_by_profile(profiles, default, overrides=None):
    """A kind for every profile; collapsed to one value when all profiles agree."""
    overrides = overrides or {}
    vals = {p: overrides.get(p, default) for p in profiles}
    if len(set(vals.values())) == 1:
        return default
    return vals


# --------------------------------------------------------------------------------------
# YAML emitter: fixed field order, flow style for leaves, notes as a folded block
# --------------------------------------------------------------------------------------
_PLAIN = re.compile(r"^[a-z][a-z0-9._-]*$")
_RESERVED = {"true", "false", "yes", "no", "on", "off", "null", "y", "n"}


def _scalar(v):
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, int):
        return str(v)
    if isinstance(v, float):
        return repr(v)
    if isinstance(v, str):
        if _PLAIN.match(v) and v not in _RESERVED:
            return v
        return json.dumps(v, ensure_ascii=False)
    raise TypeError(f"unsupported scalar {v!r}")


def _flow(v):
    if isinstance(v, dict):
        if not v:
            return "{}"
        return "{ " + ", ".join(f"{_scalar(k)}: {_flow(x)}" for k, x in v.items()) + " }"
    if isinstance(v, (list, tuple)):
        return "[" + ", ".join(_flow(x) for x in v) + "]"
    return _scalar(v)


def _folded(text, width=96):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        if cur and len(cur) + 1 + len(w) > width:
            lines.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}" if cur else w
    if cur:
        lines.append(cur)
    return lines


def dump_manifest(m):
    out = []
    for k in FIELD_ORDER:
        if k not in m:
            continue
        v = m[k]
        if k == "notes":
            m[k] = " ".join(v.split())
            out.append("notes: >-")
            out += ["  " + ln for ln in _folded(m[k])]
        elif k in BLOCK_MAPS and isinstance(v, dict) and v:
            out.append(f"{k}:")
            out += [f"  {_scalar(kk)}: {_flow(vv)}" for kk, vv in v.items()]
        else:
            out.append(f"{k}: {_flow(v)}")
    return "\n".join(out) + "\n"


# --------------------------------------------------------------------------------------
# Images
# --------------------------------------------------------------------------------------
def jpeg_bytes(im, orientation=None, quality=92, icc=None, **kw):
    buf = io.BytesIO()
    if orientation is not None:
        ex = Image.Exif()
        ex[0x0112] = orientation
        kw["exif"] = ex.tobytes()
    if icc is not None:
        kw["icc_profile"] = icc
    im.save(buf, "JPEG", quality=quality, **kw)
    return buf.getvalue()


def png_bytes(im):
    """PNG written with Python's zlib: no ancillary chunks, so no timestamps."""
    ct, bpp = {"L": (0, 1), "RGB": (2, 3), "RGBA": (6, 4)}[im.mode]
    w, h = im.size
    raw = im.tobytes()
    stride = w * bpp
    rows = b"".join(b"\x00" + raw[y * stride:(y + 1) * stride] for y in range(h))

    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)

    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, ct, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(rows, 9)) + chunk(b"IEND", b""))


def photo_like(w, h, seed, noise=24, cell=24):
    """A busy, photo-like RGB picture from integer maths only (gradients, blobs, noise)."""
    rng = np.random.default_rng(seed)
    y = np.arange(h, dtype=np.int32)[:, None]
    x = np.arange(w, dtype=np.int32)[None, :]
    base = np.stack(np.broadcast_arrays(40 + (170 * x) // w + 0 * y,
                                        50 + (160 * y) // h + 0 * x,
                                        210 - (150 * (x + y)) // (w + h)), axis=-1)
    coarse = rng.integers(-60, 61, size=(h // cell + 2, w // cell + 2, 3), dtype=np.int32)
    # bilinear-ish upsampling of the coarse field with integer weights
    yy, xx = np.arange(h) // cell, np.arange(w) // cell
    fy = (np.arange(h) % cell)[:, None, None]
    fx = (np.arange(w) % cell)[None, :, None]
    c00 = coarse[yy][:, xx]
    c01 = coarse[yy][:, xx + 1]
    c10 = coarse[yy + 1][:, xx]
    c11 = coarse[yy + 1][:, xx + 1]
    blobs = ((c00 * (cell - fx) + c01 * fx) * (cell - fy) + (c10 * (cell - fx) + c11 * fx) * fy) // (cell * cell)
    grain = rng.integers(-noise, noise + 1, size=(h, w, 3), dtype=np.int32)
    img = np.clip(base + blobs + grain, 0, 255).astype(np.uint8)
    return Image.fromarray(img, "RGB")


def srgb_icc():
    """Pillow/LittleCMS sRGB profile with its creation date fixed to 2020-01-01 00:00:00."""
    prof = bytearray(ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes())
    prof[24:36] = struct.pack(">6H", 2020, 1, 1, 0, 0, 0)
    if prof[84:100] != bytes(16):
        raise AssertionError("profile ID is set; it would have to be recomputed after the date patch")
    return bytes(prof)


# --------------------------------------------------------------------------------------
# Office zips
# --------------------------------------------------------------------------------------
CORE_XML = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '
    'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" '
    'xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
    '<dc:title>{title}</dc:title><dc:creator>{author}</dc:creator><cp:lastModifiedBy>{author}</cp:lastModifiedBy>'
    '<cp:revision>1</cp:revision>'
    '<dcterms:created xsi:type="dcterms:W3CDTF">{date}</dcterms:created>'
    '<dcterms:modified xsi:type="dcterms:W3CDTF">{date}</dcterms:modified>'
    '</cp:coreProperties>'
)


def ooxml_core(title):
    return CORE_XML.format(title=title, author=DOC_AUTHOR, date=DOC_DATE).encode("utf-8")


def zip_entries(data):
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        return {i.filename: z.read(i.filename) for i in z.infolist() if not i.is_dir()}


def write_zip(entries, order):
    """Zip with the given entry order, 1980-01-01 timestamps, deflate level 9
    (`mimetype` is stored, as ODF requires)."""
    if sorted(order) != sorted(entries):
        raise ValueError("entry order does not list every entry exactly once")
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        for name in order:
            zi = zipfile.ZipInfo(name, date_time=ZIP_DATE)
            zi.create_system = 3
            zi.external_attr = 0o100644 << 16
            if name == "mimetype":
                zi.compress_type = zipfile.ZIP_STORED
                z.writestr(zi, entries[name])
            else:
                zi.compress_type = zipfile.ZIP_DEFLATED
                z.writestr(zi, entries[name], compresslevel=9)
    return buf.getvalue()


def normalize_ooxml(data, title, order=None):
    """Rewrite an OOXML package: fixed core properties, sorted entries (so
    [Content_Types].xml comes first) unless `order` is given."""
    entries = zip_entries(data)
    if "docProps/core.xml" not in entries:
        raise ValueError("package has no docProps/core.xml")
    entries["docProps/core.xml"] = ooxml_core(title)
    return write_zip(entries, order or sorted(entries))
