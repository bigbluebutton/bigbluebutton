#!/usr/bin/env python3
"""Write every synthetic fixture and its manifest into an empty directory.

Usage: make_fixtures.py OUT_DIR    (normally through run.sh, inside the pinned image)

One function per fixture lives in fx_pdf.py, fx_images.py and fx_office.py; the PDF writer
is pcf_pdfkit.py and the shared helpers (manifest writer, encoders, zip normaliser) are in
pcf_common.py.
"""
import os
import sys

import fx_images
import fx_office
import fx_pdf
from pcf_common import Ctx

EXPECTED_IDS = [
    "pdf-base14-text-3p", "pdf-marker-geometry-6p", "pdf-rotate-cropbox-3p", "pdf-type3-mixed-3p",
    "pdf-path-threshold-2p", "pdf-image-tags-2p", "pdf-use-tags-2p", "pdf-smask-luminosity",
    "pdf-scanned-2p", "pdf-blend-modes", "pdf-transparent-bg", "pdf-ocg-annots-2p",
    "pdf-exif-1-to-8", "pdf-exif6-plus-control", "pdf-img2pdf-rotate90-exif6",
    "pdf-jpeg-passthrough-probes", "pdf-jpeg-icc-smask-2p", "pdf-201-pages", "pdf-zero-byte",
    "pdf-truncated-1000b", "pdf-header-only", "pdf-encrypted-user-pw", "pdf-encrypted-owner-only",
    "pdf-recursive-dicts", "pdf-text-order-poll-2p", "pdf-image-slide-300k",
    "img-jpg-exif6-camera", "img-png-alpha", "img-webp-lossless", "img-svg-upload",
    "img-gif-2frame", "img-tiff-2page",
    "off-rtf-one-page", "off-pptx-one-slide", "off-docx-lorem-a4", "off-xlsx-one-sheet",
    "off-odt-one-page", "off-odp-one-slide", "off-ods-one-sheet", "off-odg-one-page",
    "off-docx-rezipped", "off-pptx-phone-photo-exif6",
]


def main(out):
    if not os.path.isdir(out) or os.listdir(out):
        sys.exit(f"{out} must be an existing, empty directory")
    ctx = Ctx(out)
    for make in fx_pdf.ALL + fx_images.ALL + fx_office.ALL:
        make(ctx)
    if ctx.ids != EXPECTED_IDS:
        sys.exit(f"fixture list differs from EXPECTED_IDS: {sorted(set(ctx.ids) ^ set(EXPECTED_IDS))}")
    total = 0
    for name in sorted(ctx.files):
        size = len(ctx.files[name])
        total += size
        print(f"{size:>8}  {name}")
    print(f"{total:>8}  total, {len(ctx.ids)} fixtures, {len(ctx.files)} files")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
