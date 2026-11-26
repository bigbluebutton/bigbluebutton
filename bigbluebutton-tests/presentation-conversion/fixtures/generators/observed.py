"""Expectations frozen from what a server did with a fixture whose behaviour was first only measured.

Measured on 2026-10-09 against BBB 4.0.0-rc.5 (bbb-web built from 0a2ccd433e, poppler 24.02.0,
LibreOffice 25.8). A fixture keeps `expect: measure` until it appears here; when the server's
behaviour changes on purpose, update the entry and regenerate.
"""

OBSERVED = {
    "pdf-zero-byte": {"expect": "dropped", "pages": 0, "checks": ["outcome"]},
    "pdf-truncated-1000b": {"expect": "rejected:PAGE_COUNT_FAILED", "pages": 0, "checks": ["outcome"]},
    "pdf-header-only": {"expect": "rejected:PAGE_COUNT_FAILED", "pages": 0, "checks": ["outcome"]},
    "pdf-encrypted-user-pw": {"expect": "rejected:PAGE_COUNT_FAILED", "pages": 0, "checks": ["outcome"]},
    "pdf-encrypted-owner-only": {"expect": "converted", "pages": 3, "kind": "vector"},
    "pdf-recursive-dicts": {"expect": "converted", "pages": 2, "kind": "vector"},
    "img-webp-lossless": {"expect": "converted", "pages": 1, "kind": "vector"},
    "img-svg-upload": {"expect": "dropped", "pages": 0, "checks": ["outcome"]},
    "img-gif-2frame": {"expect": "dropped", "pages": 0, "checks": ["outcome"]},
    "img-tiff-2page": {"expect": "dropped", "pages": 0, "checks": ["outcome"]},
    "off-odg-one-page": {"expect": "converted", "pages": 1, "kind": "vector"},
    # pages that only had to be "any" because a <filter> triggers the cairo-vs-splash comparison
    "pdf-smask-luminosity": {"kind": {"defaults": "vector", "low-thresholds": "raster"}},
    "pdf-blend-modes": {"kind": "vector"},
    "pdf-ocg-annots-2p": {"kind": "vector"},
    "pdf-scanned-2p": {"kind": {"defaults": "vector", "low-thresholds": "raster"}},
    "pdf-jpeg-icc-smask-2p": {"kind": "vector"},
    "img-png-alpha": {"kind": "vector"},
    "off-rtf-one-page": {"kind": "vector"},
    "off-pptx-one-slide": {"kind": "vector"},
    "off-xlsx-one-sheet": {"kind": "vector"},
    "off-odt-one-page": {"kind": "vector"},
    "off-odp-one-slide": {"kind": "vector"},
    "off-ods-one-sheet": {"kind": "vector"},
    # correctness of this deck is the upright marker; a golden of today's sideways render would encode the bug
    "off-pptx-phone-photo-exif6": {"checks": ["outcome", "pages", "kind", "aspect", "exif", "text", "marker"]},
    # tight-limits: maxBigSvgSize=200000 turns these pages into the blank substitute slide
    "pdf-image-slide-300k": {"expectByProfile": {"tight-limits": "converted"},
                             "kind": {"defaults": "vector", "tight-limits": "blank"},
                             "goldenProfiles": ["defaults", "tight-limits"]},
    "pdf-use-tags-2p": {"expectByProfile": {"tight-limits": "converted"},
                        "pageOverrides": {1: {"kind": {"defaults": "vector", "low-thresholds": "raster", "tight-limits": "vector"}},
                                          2: {"kind": {"defaults": "raster", "low-thresholds": "raster", "tight-limits": "blank"}}},
                        "goldenProfiles": ["defaults", "low-thresholds", "tight-limits"]},
    # low-thresholds rasterizes pages whose vector golden draws small images smoothed; the raster keeps them crisp
    "pdf-image-tags-2p": {"goldenProfiles": ["defaults", "low-thresholds"]},
}
