#!/usr/bin/env python3
# Copy manually at e.g. /usr/local/bin/

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

        # Usually target is "slides/slide1.xml"
        slide_path = posixpath.normpath(posixpath.join("ppt", target)).lstrip("/")

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

        # Speaker note body placeholder
        if ph is None or ph.attrib.get("type") != "body":
            continue

        for p in sp.findall(".//a:p", NS):
            runs = []

            for t in p.findall(".//a:t", NS):
                if t.text:
                    runs.append(t.text)

            # Join runs inside the same paragraph.
            # Do not insert newline between runs, because PowerPoint may split words.
            line = "".join(runs).strip()

            if line:
                paragraphs.append(line)

    return "\n".join(paragraphs)


def extract_notes(pptx_path, output_dir):
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

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
                f"visible slide {visible_slide_num}: "
                f"{slide_path}, note={note_path or 'none'}"
            )

            visible_slide_num += 1

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("pptx")
    parser.add_argument(
        "-o",
        "--output",
        default="notes",
        help="output directory"
    )

    args = parser.parse_args()

    extract_notes(args.pptx, args.output)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
