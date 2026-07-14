#!/usr/bin/env python3
# Copy manually to /usr/local/bin/ for instance.

import argparse
import posixpath
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def read_xml(z, name):
    return ET.fromstring(z.read(name))


def rels_path_for_part(part_path):
    dirname = posixpath.dirname(part_path)
    basename = posixpath.basename(part_path)
    return posixpath.join(dirname, "_rels", basename + ".rels")


def resolve_target(base_part_path, target):
    base_dir = posixpath.dirname(base_part_path)
    resolved = posixpath.normpath(posixpath.join(base_dir, target))
    return resolved.lstrip("/")


def load_rels(z, rels_path):
    if rels_path not in z.namelist():
        return {}

    root = read_xml(z, rels_path)
    rels = {}

    for rel in root.findall("rel:Relationship", NS):
        rid = rel.attrib.get("Id")
        target = rel.attrib.get("Target")
        rtype = rel.attrib.get("Type")

        if rid and target:
            rels[rid] = {
                "target": target,
                "type": rtype,
            }

    return rels


def get_slide_paths_in_order(z):
    """
    Return slide XML paths in presentation order:
      ppt/slides/slide1.xml
      ppt/slides/slide2.xml
      ...
    """
    if "ppt/presentation.xml" not in z.namelist():
        return []

    presentation = read_xml(z, "ppt/presentation.xml")
    presentation_rels = load_rels(z, "ppt/_rels/presentation.xml.rels")
    slide_paths = []

    for sld_id in presentation.findall(".//p:sldIdLst/p:sldId", NS):
        rid = sld_id.attrib.get(f"{{{NS['r']}}}id")

        if not rid or rid not in presentation_rels:
            continue

        target = presentation_rels[rid]["target"]

        # Usually target is "slides/slide1.xml".
        slide_path = posixpath.normpath(
            posixpath.join("ppt", target)
        ).lstrip("/")

        if slide_path in z.namelist():
            slide_paths.append(slide_path)

    return slide_paths


def is_hidden_slide(z, slide_path):
    """
    Hidden PowerPoint slides usually have:
      <p:sld show="0">
    If show is absent, the slide is visible.
    """
    root = read_xml(z, slide_path)
    return root.attrib.get("show") == "0"


def get_note_path_for_slide(z, slide_path):
    """
    Find notesSlide linked from the slide relationship file:
      ppt/slides/_rels/slideN.xml.rels
    """
    rels_path = rels_path_for_part(slide_path)
    rels = load_rels(z, rels_path)

    for rel in rels.values():
        rtype = rel.get("type") or ""
        target = rel.get("target") or ""

        if rtype.endswith("/notesSlide"):
            note_path = resolve_target(slide_path, target)

            if note_path in z.namelist():
                return note_path

    return None


def extract_note_from_xml(xml_bytes):
    root = ET.fromstring(xml_bytes)
    paragraphs = []

    for sp in root.findall(".//p:sp", NS):
        ph = sp.find(".//p:ph", NS)

        # Speaker note body placeholder.
        if ph is None or ph.attrib.get("type") != "body":
            continue

        for paragraph in sp.findall(".//a:p", NS):
            runs = []

            for text_node in paragraph.findall(".//a:t", NS):
                if text_node.text:
                    runs.append(text_node.text)

            # Join runs inside the same paragraph.
            # Do not insert a newline between runs because PowerPoint may split words.
            line = "".join(runs).strip()

            if line:
                paragraphs.append(line)

    return "\n".join(paragraphs)


def animation_marker_path(original_pptx):
    """
    Return the marker path created by PresentationController:
      original.pptx.expand-animations
    """
    return Path(f"{original_pptx}.expand-animations")


def expanded_pptx_path(original_pptx):
    """
    Return the persistent expanded PPTX path created before LibreOffice:
      original.expanded.pptx
    """
    original_pptx = Path(original_pptx)
    return original_pptx.with_name(
        f"{original_pptx.stem}.expanded.pptx"
    )


def is_complete_pptx(path):
    """
    Return True only when the file looks like a complete PPTX package.
    """
    path = Path(path)

    if not path.is_file() or path.stat().st_size == 0:
        return False

    if not zipfile.is_zipfile(path):
        return False

    try:
        with zipfile.ZipFile(path) as z:
            if z.testzip() is not None:
                return False

            required_parts = {
                "[Content_Types].xml",
                "ppt/presentation.xml",
                "ppt/_rels/presentation.xml.rels",
            }
            return required_parts.issubset(z.namelist())
    except (OSError, zipfile.BadZipFile):
        return False


def select_pptx_for_notes(original_pptx):
    """
    Select the same PPTX that is used for PDF conversion.

    If animation expansion was not requested, return the original PPTX.

    If the marker exists, use the persistent expanded PPTX. Do not fall back
    to the original PPTX, because that would produce notes whose slide numbers
    do not match the expanded PDF/SVG presentation.
    """
    original_pptx = Path(original_pptx)
    marker = animation_marker_path(original_pptx)

    if not marker.exists():
        print(f"Using original PPTX for note extraction: {original_pptx}")
        return original_pptx

    expanded = expanded_pptx_path(original_pptx)

    if not is_complete_pptx(expanded):
        raise FileNotFoundError(
            "Animation expansion was requested, but the expanded PPTX "
            f"does not exist or is invalid: {expanded}"
        )

    print(f"Using expanded PPTX for note extraction: {expanded}")
    return expanded

def remove_existing_note_files(output_dir):
    """
    Remove old numbered note files so that a previous extraction with a
    different slide count cannot leave extra files behind.
    """
    for path in output_dir.glob("*.txt"):
        if path.stem.isdigit():
            path.unlink()


def extract_notes(original_pptx_path, output_dir):
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    remove_existing_note_files(output_dir)

    pptx_path = select_pptx_for_notes(original_pptx_path)

    with zipfile.ZipFile(pptx_path) as z:
        slide_paths = get_slide_paths_in_order(z)
        visible_slide_num = 1

        for slide_path in slide_paths:
            if is_hidden_slide(z, slide_path):
                print(f"{slide_path}: hidden, skipped")
                continue

            note_path = get_note_path_for_slide(z, slide_path)

            note_text = ""
            if note_path:
                note_text = extract_note_from_xml(z.read(note_path))

            out_file = output_dir / f"{visible_slide_num}.txt"
            out_file.write_text(note_text, encoding="utf-8")

            print(
                f"Visible slide {visible_slide_num}: "
                f"{slide_path}, note={note_path or 'none'}"
            )

            visible_slide_num += 1

    print(f"Extracted notes for {visible_slide_num - 1} visible slide(s)")


def main():
    parser = argparse.ArgumentParser(
        description=(
            "Extract PowerPoint speaker notes while keeping slide numbering "
            "aligned with an animation-expanded BBB presentation."
        )
    )
    parser.add_argument(
        "pptx",
        help="path to the original uploaded PPTX",
    )
    parser.add_argument(
        "-o",
        "--output",
        default="notes",
        help="output directory",
    )
    args = parser.parse_args()

    extract_notes(args.pptx, args.output)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        sys.exit(1)
