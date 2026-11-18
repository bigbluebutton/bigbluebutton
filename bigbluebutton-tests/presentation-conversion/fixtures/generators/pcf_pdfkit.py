"""Tiny deterministic PDF writer for the presentation-conversion fixtures.

Ported from the #26001 work (scripts/pdfkit.py): it writes every object by hand, so
the fixtures carry exactly the PDF features they are meant to exercise and nothing a
library would add. JPEG bytes are embedded verbatim (DCTDecode), so EXIF, APP2 ICC
and APP14 segments survive the way a PDF producer such as macOS Quartz or img2pdf
leaves them.

Determinism: objects are numbered in creation order, there is no /CreationDate, no
/ModDate and no /ID, numbers are printed with at most four decimals and Flate uses
zlib level 9 (the zlib of the pinned generator image).
"""
import zlib

from PIL import Image, ImageDraw, ImageFont


# --------------------------------------------------------------------------------------
# Object model and serialisation
# --------------------------------------------------------------------------------------
class Name:
    """A PDF name, written as /value."""
    __slots__ = ("v",)

    def __init__(self, v):
        self.v = v


class Ref:
    """An indirect reference, written as `num 0 R`."""
    __slots__ = ("num",)

    def __init__(self, num):
        self.num = num


class Raw:
    """Bytes written verbatim, e.g. a pre-formatted array."""
    __slots__ = ("b",)

    def __init__(self, b):
        self.b = b


class Stream:
    """A stream object: a dictionary plus data, optionally Flate-compressed here."""

    def __init__(self, data, d=None, flate=False):
        self.dict = dict(d or {})
        if flate:
            data = zlib.compress(data, 9)
            self.dict["Filter"] = N("FlateDecode")
        self.data = data


def N(v):
    return Name(v)


def num(v):
    """Format a number: integers as integers, others with up to four decimals."""
    if isinstance(v, bool):
        raise TypeError("bool is not a PDF number")
    if isinstance(v, int):
        return b"%d" % v
    s = ("%.4f" % v).rstrip("0").rstrip(".")
    if s in ("", "-0"):
        s = "0"
    return s.encode()


def nums(*vals):
    return b" ".join(num(v) for v in vals)


def pdf_string(s):
    """Literal string. `str` is encoded as cp1252 (WinAnsi), `bytes` are kept as is."""
    if isinstance(s, str):
        s = s.encode("cp1252")
    out = bytearray(b"(")
    for c in s:
        if c in (0x28, 0x29, 0x5C):
            out += b"\\" + bytes([c])
        elif c == 0x0A:
            out += b"\\n"
        elif c == 0x0D:
            out += b"\\r"
        elif 0x20 <= c < 0x7F:
            out.append(c)
        else:
            out += b"\\%03o" % c
    out += b")"
    return bytes(out)


def ser(o):
    if isinstance(o, Name):
        return b"/" + o.v.encode("ascii")
    if isinstance(o, Ref):
        return b"%d 0 R" % o.num
    if isinstance(o, Raw):
        return o.b
    if o is None:
        return b"null"
    if o is True:
        return b"true"
    if o is False:
        return b"false"
    if isinstance(o, (int, float)):
        return num(o)
    if isinstance(o, (str, bytes)):
        return pdf_string(o)
    if isinstance(o, (list, tuple)):
        return b"[" + b" ".join(ser(x) for x in o) + b"]"
    if isinstance(o, dict):
        return b"<< " + b" ".join(b"/" + k.encode("ascii") + b" " + ser(v) for k, v in o.items()) + b" >>"
    raise TypeError(f"cannot serialise {type(o)}")


class PDF:
    """Indirect objects numbered in creation order; written with a classic xref table."""

    def __init__(self, version="1.7"):
        self.version = version
        self._objs = [None]

    def reserve(self):
        self._objs.append(None)
        return Ref(len(self._objs) - 1)

    def set(self, ref, obj):
        self._objs[ref.num] = obj
        return ref

    def add(self, obj):
        return self.set(self.reserve(), obj)

    def to_bytes(self, root, info=None):
        out = bytearray(b"%PDF-" + self.version.encode() + b"\n%\xe2\xe3\xcf\xd3\n")
        offsets = [0] * len(self._objs)
        for i in range(1, len(self._objs)):
            o = self._objs[i]
            if o is None:
                raise ValueError(f"object {i} was reserved but never set")
            offsets[i] = len(out)
            out += b"%d 0 obj\n" % i
            if isinstance(o, Stream):
                d = dict(o.dict)
                d["Length"] = len(o.data)
                out += ser(d) + b"\nstream\n" + o.data + b"\nendstream"
            else:
                out += ser(o)
            out += b"\nendobj\n"
        xref = len(out)
        out += b"xref\n0 %d\n0000000000 65535 f \n" % len(self._objs)
        for i in range(1, len(self._objs)):
            out += b"%010d 00000 n \n" % offsets[i]
        trailer = {"Size": len(self._objs), "Root": root}
        if info is not None:
            trailer["Info"] = info
        out += b"trailer\n" + ser(trailer) + b"\nstartxref\n%d\n%%%%EOF\n" % xref
        return bytes(out)


# --------------------------------------------------------------------------------------
# Fonts
# --------------------------------------------------------------------------------------
# Helvetica advance widths (AFM, 1/1000 em) for WinAnsi codes 32..126, used for layout.
_HELV_W = [
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
    1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
    333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
    556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
]


def helv_width(s, size):
    """Width in points of `s` set in Helvetica at `size` (unknown characters count 556)."""
    return sum(_HELV_W[ord(c) - 32] if 32 <= ord(c) <= 126 else 556 for c in s) * size / 1000.0


# A 5x7 pixel font for the hand-made Type 3 font. Each glyph proc fills one rectangle
# per horizontal run of lit pixels, so the text stays readable when rasterised.
_PIXEL_FONT = {
    "A": [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    "E": ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
    "F": ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
    "G": [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".###."],
    "H": ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    "N": ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
    "O": [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    "P": ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
    "R": ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
    "T": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
    "X": ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
    "Y": ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
    "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
    "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
    "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
    "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
    "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
    " ": ["....."] * 7,
}
_GLYPH_NAMES = {"0": "zero", "1": "one", "2": "two", "3": "three", "5": "five", " ": "space"}


# --------------------------------------------------------------------------------------
# Document and pages
# --------------------------------------------------------------------------------------
class Doc:
    def __init__(self, title=None, version="1.7"):
        self.pdf = PDF(version)
        self.catalog = self.pdf.reserve()
        self.pages_ref = self.pdf.reserve()
        self.pages = []
        self.title = title
        self.ocgs = []          # (ref, off)
        self.fields = []        # AcroForm field refs
        self._helv = None
        self._type3 = None

    # -- shared resources --------------------------------------------------------------
    def helvetica(self):
        """Base-14 Helvetica, not embedded, WinAnsiEncoding."""
        if self._helv is None:
            self._helv = self.pdf.add({"Type": N("Font"), "Subtype": N("Type1"),
                                       "BaseFont": N("Helvetica"), "Encoding": N("WinAnsiEncoding")})
        return self._helv

    def type3(self):
        """Hand-made Type 3 font: 5x7 pixel glyphs, 100 units per pixel, advance 600."""
        if self._type3 is None:
            procs = {}
            for ch in sorted(_PIXEL_FONT, key=ord):
                rows = _PIXEL_FONT[ch]
                ops = [b"600 0 0 0 500 700 d1"]
                for r, row in enumerate(rows):
                    y = (6 - r) * 100
                    c = 0
                    while c < 5:
                        if row[c] == "#":
                            start = c
                            while c < 5 and row[c] == "#":
                                c += 1
                            ops.append(b"%d %d %d 100 re" % (start * 100, y, (c - start) * 100))
                        else:
                            c += 1
                if len(ops) > 1:
                    ops.append(b"f")
                gname = _GLYPH_NAMES.get(ch, ch)
                procs[gname] = self.pdf.add(Stream(b"\n".join(ops) + b"\n"))
            codes = sorted(ord(c) for c in _PIXEL_FONT)
            first, last = codes[0], codes[-1]
            diffs = []
            for code in codes:
                diffs += [code, N(_GLYPH_NAMES.get(chr(code), chr(code)))]
            widths = [600 if chr(c) in _PIXEL_FONT else 0 for c in range(first, last + 1)]
            self._type3 = self.pdf.add({
                "Type": N("Font"), "Subtype": N("Type3"), "Name": N("PCFPixel"),
                "FontBBox": [0, 0, 500, 700], "FontMatrix": [0.001, 0, 0, 0.001, 0, 0],
                "CharProcs": {k: procs[k] for k in sorted(procs)},
                "Encoding": {"Type": N("Encoding"), "Differences": diffs},
                "FirstChar": first, "LastChar": last, "Widths": widths,
                "Resources": {},
            })
        return self._type3

    def ocg(self, name, off=True):
        ref = self.pdf.add({"Type": N("OCG"), "Name": name})
        self.ocgs.append((ref, off))
        return ref

    # -- pages -----------------------------------------------------------------------
    def page(self, width, height, origin=(0, 0), rotate=0, crop=None, flate=True):
        p = Page(self, width, height, origin, rotate, crop, flate)
        self.pages.append(p)
        return p

    def to_bytes(self):
        for p in self.pages:
            p.finish()
        cat = {"Type": N("Catalog"), "Pages": self.pages_ref}
        if self.ocgs:
            refs = [r for r, _ in self.ocgs]
            cat["OCProperties"] = {"OCGs": refs,
                                   "D": {"Order": refs, "OFF": [r for r, off in self.ocgs if off]}}
        if self.fields:
            cat["AcroForm"] = {"Fields": self.fields,
                               "DR": {"Font": {"Helv": self.helvetica()}},
                               "DA": "/Helv 0 Tf 0 g"}
        self.pdf.set(self.catalog, cat)
        self.pdf.set(self.pages_ref, {"Type": N("Pages"), "Kids": [p.ref for p in self.pages],
                                      "Count": len(self.pages)})
        info = {"Producer": "pcf-generators"}
        if self.title:
            info["Title"] = self.title
        return self.pdf.to_bytes(self.catalog, self.pdf.add(info))

    def save(self, path):
        data = self.to_bytes()
        with open(path, "wb") as f:
            f.write(data)
        return data


class Page:
    def __init__(self, doc, width, height, origin, rotate, crop, flate):
        self.doc = doc
        self.ref = doc.pdf.reserve()
        x0, y0 = origin
        self.x0, self.y0, self.w, self.h = x0, y0, width, height
        self.media = [x0, y0, x0 + width, y0 + height]
        self.rotate = rotate
        self.crop = crop
        self.flate = flate
        self.ops = []
        self.res = {}
        self.annots = []
        self.contents = None      # set to a Ref to share one content stream between pages
        self.resources_ref = None  # set to a Ref to use an indirect /Resources dictionary
        self._done = False

    # -- resources -------------------------------------------------------------------
    def name_for(self, category, ref, prefix):
        names = self.res.setdefault(category, {})
        for k, v in names.items():
            if isinstance(v, Ref) and v.num == ref.num:
                return k
        k = "%s%d" % (prefix, len(names) + 1)
        names[k] = ref
        return k

    def font(self, ref):
        return self.name_for("Font", ref, "F")

    def xobject(self, ref):
        return self.name_for("XObject", ref, "Im")

    def gstate(self, ref):
        return self.name_for("ExtGState", ref, "GS")

    def prop(self, ref):
        return self.name_for("Properties", ref, "oc")

    # -- content ---------------------------------------------------------------------
    def op(self, *lines):
        for ln in lines:
            self.ops.append(ln if isinstance(ln, bytes) else ln.encode("ascii"))
        return self

    def rect(self, x, y, w, h, rgb):
        self.op(b"%s rg %s re f" % (nums(*rgb), nums(x, y, w, h)))
        return self

    def text(self, x, y, s, size=12, font=None, rgb=(0, 0, 0), rise=0):
        """One line of text with Tf, Td and Tj (Ts when `rise` is set)."""
        fref = font or self.doc.helvetica()
        fn = self.font(fref)
        ops = b"BT /%s %s Tf %s rg %s Td " % (fn.encode(), num(size), nums(*rgb), nums(x, y))
        if rise:
            ops += b"%s Ts " % num(rise)
        ops += pdf_string(s) + b" Tj ET"
        self.op(ops)
        return self

    def text_runs(self, x, y, runs, font=None, rgb=(0, 0, 0)):
        """One text object holding several runs: [(text, size, rise), ...] shown with TJ."""
        fn = self.font(font or self.doc.helvetica())
        ops = b"BT %s rg %s Td" % (nums(*rgb), nums(x, y))
        for s, size, rise in runs:
            ops += b" /%s %s Tf %s Ts [%s] TJ" % (fn.encode(), num(size), num(rise), pdf_string(s))
        self.op(ops + b" 0 Ts ET")
        return self

    def draw(self, xobj_ref, a, b, c, d, e, f):
        n = self.xobject(xobj_ref)
        self.op(b"q %s cm /%s Do Q" % (nums(a, b, c, d, e, f), n.encode()))
        return self

    def finish(self):
        if self._done:
            return
        self._done = True
        pdf = self.doc.pdf
        if self.contents is None:
            self.contents = pdf.add(Stream(b"\n".join(self.ops) + b"\n", flate=self.flate))
        d = {"Type": N("Page"), "Parent": self.doc.pages_ref, "MediaBox": self.media}
        if self.crop:
            d["CropBox"] = list(self.crop)
        if self.rotate:
            d["Rotate"] = self.rotate
        if self.resources_ref is not None:
            d["Resources"] = self.resources_ref
        else:
            d["Resources"] = {k: self.res[k] for k in sorted(self.res)}
        d["Contents"] = self.contents
        if self.annots:
            d["Annots"] = self.annots
        pdf.set(self.ref, d)


# --------------------------------------------------------------------------------------
# XObjects, graphics states, annotations
# --------------------------------------------------------------------------------------
def jpeg_image(doc, jpeg, w, h, cs="DeviceRGB", decode=None, smask=None, bpc=8):
    """JPEG embedded verbatim (DCTDecode). `cs` is a name or an ICCBased array."""
    d = {"Type": N("XObject"), "Subtype": N("Image"), "Width": w, "Height": h,
         "ColorSpace": N(cs) if isinstance(cs, str) else cs, "BitsPerComponent": bpc,
         "Filter": N("DCTDecode")}
    if decode is not None:
        d["Decode"] = decode
    if smask is not None:
        d["SMask"] = smask
    return doc.pdf.add(Stream(jpeg, d))


def raw_image(doc, w, h, data, cs="DeviceRGB", bpc=8, smask=None):
    """Uncompressed samples stored with FlateDecode."""
    d = {"Type": N("XObject"), "Subtype": N("Image"), "Width": w, "Height": h,
         "ColorSpace": N(cs), "BitsPerComponent": bpc}
    if smask is not None:
        d["SMask"] = smask
    return doc.pdf.add(Stream(data, d, flate=True))


def gray_smask(doc, w, h, data):
    """An 8-bit DeviceGray image used as /SMask (alpha) of another image."""
    return raw_image(doc, w, h, data, cs="DeviceGray")


def stencil_mask(doc, w, h, bits, decode=None):
    """1-bit stencil mask (/ImageMask true): painted with the current fill colour."""
    d = {"Type": N("XObject"), "Subtype": N("Image"), "Width": w, "Height": h,
         "ImageMask": True, "BitsPerComponent": 1}
    if decode is not None:
        d["Decode"] = decode
    return doc.pdf.add(Stream(bits, d, flate=True))


def icc_stream(doc, icc, n=3):
    return doc.pdf.add(Stream(icc, {"N": n}, flate=True))


def form_xobject(doc, bbox, content, resources=None, group=None, matrix=None):
    d = {"Type": N("XObject"), "Subtype": N("Form"), "BBox": list(bbox)}
    if matrix is not None:
        d["Matrix"] = list(matrix)
    if group is not None:
        d["Group"] = group
    d["Resources"] = resources or {}
    return doc.pdf.add(Stream(content, d, flate=True))


def ext_gstate(doc, **entries):
    d = {"Type": N("ExtGState")}
    for k, v in entries.items():
        d[k] = N(v) if k == "BM" else v
    return doc.pdf.add(d)


def luminosity_gstate(doc, group_ref, backdrop=None):
    """ExtGState whose /SMask is a luminosity mask computed from a transparency group."""
    mask = {"Type": N("Mask"), "S": N("Luminosity"), "G": group_ref}
    if backdrop is not None:
        mask["BC"] = list(backdrop)
    return doc.pdf.add({"Type": N("ExtGState"), "SMask": mask})


def widget(page, rect, ap_ref, field_name, tooltip=None):
    """A push-button Widget annotation drawn from its /AP /N appearance stream."""
    d = {"Type": N("Annot"), "Subtype": N("Widget"), "FT": N("Btn"), "Ff": 65536,
         "T": field_name, "Rect": list(rect), "F": 4, "P": page.ref,
         "AP": {"N": ap_ref}}
    if tooltip:
        d["TU"] = tooltip
    ref = page.doc.pdf.add(d)
    page.annots.append(ref)
    page.doc.fields.append(ref)
    return ref


# --------------------------------------------------------------------------------------
# The marker picture: red top band, blue bottom band, green left band, yellow right band
# --------------------------------------------------------------------------------------
RED = (230, 0, 0)
BLUE = (0, 0, 230)
GREEN = (0, 190, 0)
YELLOW = (240, 220, 0)


def rgb01(c):
    return tuple(round(v / 255.0, 4) for v in c)


def vector_marker(page, x, y, w, h, label=None, background=True, label_size=None):
    """Draw the marker picture upright in the box (x, y, w, h) of the current user space."""
    bx, by = w / 7.0, h / 7.0
    gap = h / 80.0
    page.op(b"q")
    if background:
        page.rect(x, y, w, h, (1, 1, 1))
    page.rect(x, y + h - by, w, by, rgb01(RED))
    page.rect(x, y, w, by, rgb01(BLUE))
    page.rect(x, y + by + gap, bx, h - 2 * by - 2 * gap, rgb01(GREEN))
    page.rect(x + w - bx, y + by + gap, bx, h - 2 * by - 2 * gap, rgb01(YELLOW))
    if label:
        size = label_size or h / 14.0
        room = w - 2 * bx - w / 20.0
        tw = helv_width(label, size)
        if tw > room:
            size *= room / tw
            tw = helv_width(label, size)
        page.text(x + (w - tw) / 2.0, y + h / 2.0 - size * 0.35, label, size=size)
    page.op(b"Q")
    return page


def _pil_font(size):
    # Pillow's bundled font: identical glyphs on every machine running the pinned image.
    return ImageFont.load_default(size=size)


def marker_image(w, h, label="", mode="RGB"):
    """Raster marker picture (ported from scripts/pdfkit.py, with Pillow's bundled font)."""
    im = Image.new(mode, (w, h), "white")
    d = ImageDraw.Draw(im)
    bx, by = max(8, w // 7), max(8, h // 7)
    d.rectangle([0, 0, w - 1, by], fill=RED)
    d.rectangle([0, h - by, w - 1, h - 1], fill=BLUE)
    d.rectangle([0, by + 4, bx, h - by - 5], fill=GREEN)
    d.rectangle([w - bx, by + 4, w - 1, h - by - 5], fill=YELLOW)
    size = max(10, h // 14)
    d.text((bx + 10, h // 2 - h // 14), label or "UP", fill="black", font=_pil_font(size))
    return im
