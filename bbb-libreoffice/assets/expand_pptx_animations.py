#!/usr/bin/env python3
"""
Expand PowerPoint object and bullet-paragraph animations into static slides.

Supported scope
---------------
- Normal text boxes and body placeholders
- Bullet items animated one paragraph at a time
- Object-level entrance/exit animation
- p:set visibility changes and p:animEffect transition="in"/"out"
- Paragraph targets represented by p:txEl/p:pRg
- Effects themselves (fade, wipe, etc.) are ignored

The script keeps hidden paragraphs in the text box and makes their text/bullet
invisible. This preserves the original text-box layout better than deleting
paragraphs.

Not supported
-------------
- Character/word-by-word animation (p:charRg)
- SmartArt/chart sub-elements
- Trigger animations
- Motion, rotation, emphasis, color and media animations
- Complex build sequences that do not contain paragraph ranges

Usage
-----
    sudo apt install python3-lxml
    python3 expand_pptx_animations.py input.pptx output-expanded.pptx

Use --omit-initial to omit the pre-animation state of animated slides.
Use --strict to stop when an unsupported animation target is found.
"""

from __future__ import annotations

import argparse
import copy
import posixpath
import re
import sys
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Optional

from lxml import etree


NS = {
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
    "ct": "http://schemas.openxmlformats.org/package/2006/content-types",
}

P = f"{{{NS['p']}}}"
A = f"{{{NS['a']}}}"
R = f"{{{NS['r']}}}"
REL = f"{{{NS['rel']}}}"
CT = f"{{{NS['ct']}}}"

SLIDE_REL_TYPE = (
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide"
)
NOTES_REL_TYPE = (
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide"
)
SLIDE_CONTENT_TYPE = (
    "application/vnd.openxmlformats-officedocument.presentationml.slide+xml"
)
NOTES_CONTENT_TYPE = (
    "application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"
)

SHAPE_TAGS = {
    P + "sp",
    P + "pic",
    P + "graphicFrame",
    P + "cxnSp",
    P + "grpSp",
    P + "contentPart",
}

FILL_TAGS = {
    A + "noFill",
    A + "solidFill",
    A + "gradFill",
    A + "blipFill",
    A + "pattFill",
    A + "grpFill",
}

BULLET_TAGS = {
    A + "buClr",
    A + "buClrTx",
    A + "buSzPct",
    A + "buSzPts",
    A + "buSzTx",
    A + "buFont",
    A + "buFontTx",
    A + "buNone",
    A + "buAutoNum",
    A + "buChar",
    A + "buBlip",
}

SPACING_TAGS = {
    A + "lnSpc",
    A + "spcBef",
    A + "spcAft",
}


@dataclass(frozen=True)
class Target:
    spid: str
    start_paragraph: Optional[int] = None
    end_paragraph: Optional[int] = None

    @property
    def is_paragraph_target(self) -> bool:
        return self.start_paragraph is not None


@dataclass(frozen=True)
class Action:
    operation: str  # "show" or "hide"
    target: Target


class ConversionError(RuntimeError):
    pass


def parse_xml(data: bytes) -> etree._Element:
    parser = etree.XMLParser(remove_blank_text=False, resolve_entities=False)
    return etree.fromstring(data, parser=parser)


def serialize_xml(root: etree._Element) -> bytes:
    return etree.tostring(
        root,
        xml_declaration=True,
        encoding="UTF-8",
        standalone=True,
    )


def read_package(path: Path) -> dict[str, bytes]:
    with zipfile.ZipFile(path, "r") as archive:
        bad = archive.testzip()
        if bad:
            raise ConversionError(f"Broken ZIP member in input PPTX: {bad}")
        return {name: archive.read(name) for name in archive.namelist()}


def write_package(path: Path, files: dict[str, bytes]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for name in sorted(files):
            archive.writestr(name, files[name])

    with zipfile.ZipFile(path, "r") as archive:
        bad = archive.testzip()
        if bad:
            raise ConversionError(f"Broken ZIP member in output PPTX: {bad}")


def rel_target_to_part(base_part: str, target: str) -> str:
    return posixpath.normpath(
        posixpath.join(posixpath.dirname(base_part), target)
    )


def part_to_rel_target(base_part: str, target_part: str) -> str:
    return posixpath.relpath(target_part, posixpath.dirname(base_part))


def relationships_part(part: str) -> str:
    return posixpath.join(
        posixpath.dirname(part),
        "_rels",
        posixpath.basename(part) + ".rels",
    )


def numeric_suffix(names: Iterable[str], pattern: str) -> int:
    rx = re.compile(pattern)
    values = []
    for name in names:
        match = rx.fullmatch(name)
        if match:
            values.append(int(match.group(1)))
    return max(values, default=0)


def max_relationship_number(rels_root: etree._Element) -> int:
    values = []
    for rel in rels_root.findall("rel:Relationship", NS):
        match = re.fullmatch(r"rId(\d+)", rel.get("Id", ""))
        if match:
            values.append(int(match.group(1)))
    return max(values, default=0)


def ensure_override(
    content_types: etree._Element,
    part: str,
    content_type: str,
) -> None:
    part_name = "/" + part
    existing = content_types.xpath(
        "./ct:Override[@PartName=$name]",
        namespaces=NS,
        name=part_name,
    )
    if existing:
        return

    override = etree.Element(CT + "Override")
    override.set("PartName", part_name)
    override.set("ContentType", content_type)
    content_types.append(override)


def remove_timing(slide_root: etree._Element) -> None:
    for timing in slide_root.xpath("./p:timing", namespaces=NS):
        timing.getparent().remove(timing)


def find_shape(slide_root: etree._Element, spid: str) -> Optional[etree._Element]:
    matches = slide_root.xpath(
        ".//p:cNvPr[@id=$spid]",
        namespaces=NS,
        spid=str(spid),
    )
    if not matches:
        return None

    node = matches[0]
    while node is not None:
        if node.tag in SHAPE_TAGS:
            return node
        node = node.getparent()
    return None


def shape_paragraphs(shape: etree._Element) -> list[etree._Element]:
    # A normal p:sp has a direct p:txBody. Descendant search also handles
    # a few grouped/placeholder variants without affecting ordinary shapes.
    return shape.xpath(".//p:txBody/a:p", namespaces=NS)


def get_target(effect: etree._Element) -> tuple[Optional[Target], Optional[str]]:
    targets = effect.xpath(
        ".//p:tgtEl/p:spTgt",
        namespaces=NS,
    )
    if not targets:
        return None, "animation has no shape target"

    sp_tgt = targets[0]
    spid = sp_tgt.get("spid")
    if not spid:
        return None, "animation shape target has no spid"

    if sp_tgt.xpath("./p:txEl/p:charRg", namespaces=NS):
        return None, f"shape {spid}: character-range animation is unsupported"

    ranges = sp_tgt.xpath("./p:txEl/p:pRg", namespaces=NS)
    if ranges:
        paragraph_range = ranges[0]
        try:
            start = int(paragraph_range.get("st", "0"))
            end = int(paragraph_range.get("end", str(start)))
        except ValueError:
            return None, f"shape {spid}: invalid paragraph range"

        if end < start:
            start, end = end, start
        return Target(spid, start, end), None

    return Target(spid), None


def set_visibility_value(effect: etree._Element) -> Optional[str]:
    attributes = [
        (node.text or "").strip()
        for node in effect.xpath(".//p:attrName", namespaces=NS)
    ]
    if "style.visibility" not in attributes:
        return None

    values = effect.xpath(".//p:to//*[@val]/@val", namespaces=NS)
    if not values:
        values = effect.xpath(".//p:to/@val", namespaces=NS)
    if not values:
        return None

    return str(values[0]).strip().lower()


def action_from_effect(
    effect: etree._Element,
) -> tuple[Optional[Action], Optional[str]]:
    target, warning = get_target(effect)
    if target is None:
        return None, warning

    local_name = etree.QName(effect).localname

    if local_name == "set":
        value = set_visibility_value(effect)
        if value in {"visible", "true", "1"}:
            return Action("show", target), None
        if value in {"hidden", "false", "0"}:
            return Action("hide", target), None
        return None, None

    if local_name == "animEffect":
        transition = (effect.get("transition") or "").strip().lower()
        if transition == "in":
            return Action("show", target), None
        if transition == "out":
            return Action("hide", target), None

    return None, None


def direct_time_node(container: etree._Element) -> Optional[etree._Element]:
    if container.tag in {P + "set", P + "animEffect"}:
        nodes = container.xpath("./p:cBhvr/p:cTn", namespaces=NS)
    else:
        nodes = container.xpath("./p:cTn", namespaces=NS)
    return nodes[0] if nodes else None


def click_anchor(effect: etree._Element) -> Optional[etree._Element]:
    """
    Return the nearest timing container whose direct cTn is clickEffect.

    With/after effects nested below that container are therefore grouped into
    the same generated slide.
    """
    candidates = [effect, *effect.iterancestors()]
    for container in candidates:
        c_tn = direct_time_node(container)
        if c_tn is not None and c_tn.get("nodeType") == "clickEffect":
            return container
    return None


def nearest_node_type(effect: etree._Element) -> Optional[str]:
    for container in [effect, *effect.iterancestors()]:
        c_tn = direct_time_node(container)
        if c_tn is not None and c_tn.get("nodeType"):
            return c_tn.get("nodeType")
    return None


def extract_click_groups(
    slide_root: etree._Element,
) -> tuple[list[list[Action]], list[str]]:
    warnings: list[str] = []
    effects = slide_root.xpath(
        ".//p:set | .//p:animEffect",
        namespaces=NS,
    )
    groups: list[list[Action]] = []
    anchor_groups: dict[etree._Element, list[Action]] = {}
    current_fallback: Optional[list[Action]] = None
    for effect in effects:
        action, warning = action_from_effect(effect)
        if warning:
            warnings.append(warning)
        if action is None:
            continue
        anchor = click_anchor(effect)
        if anchor is not None:
            group = anchor_groups.get(anchor)
            if group is None:
                group = []
                anchor_groups[anchor] = group
                groups.append(group)
            group.append(action)
            current_fallback = None
            continue
        node_type = nearest_node_type(effect)

        if current_fallback is None or node_type == "clickEffect":
            current_fallback = []
            groups.append(current_fallback)
        current_fallback.append(action)
    deduplicated: list[list[Action]] = []

    for group in groups:
        seen: set[Action] = set()
        cleaned: list[Action] = []
        for action in group:
            if action in seen:
                continue
            seen.add(action)
            cleaned.append(action)
        if cleaned:
            deduplicated.append(cleaned)

    return deduplicated, warnings


def remove_fill(properties: etree._Element) -> None:
    for child in list(properties):
        if child.tag in FILL_TAGS:
            properties.remove(child)
    properties.insert(0, etree.Element(A + "noFill"))

    # Prevent a text outline from remaining visible.
    line = properties.find(A + "ln")
    if line is not None:
        for child in list(line):
            if child.tag in FILL_TAGS:
                line.remove(child)
        line.insert(0, etree.Element(A + "noFill"))

    highlight = properties.find(A + "highlight")
    if highlight is not None:
        properties.remove(highlight)


def ensure_run_properties(run: etree._Element) -> etree._Element:
    properties = run.find(A + "rPr")
    if properties is None:
        properties = etree.Element(A + "rPr")
        run.insert(0, properties)
    return properties


def hide_bullet(paragraph: etree._Element) -> None:
    p_pr = paragraph.find(A + "pPr")
    if p_pr is None:
        p_pr = etree.Element(A + "pPr")
        paragraph.insert(0, p_pr)

    for child in list(p_pr):
        if child.tag in BULLET_TAGS:
            p_pr.remove(child)

    insertion_index = 0
    for index, child in enumerate(list(p_pr)):
        if child.tag in SPACING_TAGS:
            insertion_index = index + 1
    p_pr.insert(insertion_index, etree.Element(A + "buNone"))

    default_properties = p_pr.find(A + "defRPr")
    if default_properties is None:
        default_properties = etree.Element(A + "defRPr")
        # defRPr should be after bullet/tab settings and before extLst.
        ext = p_pr.find(A + "extLst")
        if ext is None:
            p_pr.append(default_properties)
        else:
            p_pr.insert(p_pr.index(ext), default_properties)
    remove_fill(default_properties)


def hide_paragraph(paragraph: etree._Element) -> None:
    hide_bullet(paragraph)

    for run in paragraph.findall(A + "r"):
        remove_fill(ensure_run_properties(run))

    for field in paragraph.findall(A + "fld"):
        remove_fill(ensure_run_properties(field))

    for line_break in paragraph.findall(A + "br"):
        remove_fill(ensure_run_properties(line_break))

    end_properties = paragraph.find(A + "endParaRPr")
    if end_properties is None:
        end_properties = etree.Element(A + "endParaRPr")
        paragraph.append(end_properties)
    remove_fill(end_properties)


def expanded_indices(
    target: Target,
    slide_root: etree._Element,
    warnings: list[str],
) -> list[int]:
    if not target.is_paragraph_target:
        return []

    shape = find_shape(slide_root, target.spid)
    if shape is None:
        warnings.append(f"shape {target.spid}: target shape was not found")
        return []

    paragraphs = shape_paragraphs(shape)
    if not paragraphs:
        warnings.append(f"shape {target.spid}: target has no text paragraphs")
        return []

    start = target.start_paragraph or 0
    end = target.end_paragraph if target.end_paragraph is not None else start

    if start >= len(paragraphs):
        warnings.append(
            f"shape {target.spid}: paragraph {start} is outside "
            f"0..{len(paragraphs) - 1}"
        )
        return []

    end = min(end, len(paragraphs) - 1)
    return list(range(start, end + 1))


def initial_state(
    slide_root: etree._Element,
    groups: list[list[Action]],
    warnings: list[str],
) -> tuple[dict[str, bool], dict[str, dict[int, bool]]]:
    object_state: dict[str, bool] = {}
    paragraph_state: dict[str, dict[int, bool]] = {}

    first_object_action: dict[str, str] = {}
    first_paragraph_action: dict[tuple[str, int], str] = {}

    for group in groups:
        for action in group:
            target = action.target
            if target.is_paragraph_target:
                for index in expanded_indices(target, slide_root, warnings):
                    first_paragraph_action.setdefault(
                        (target.spid, index),
                        action.operation,
                    )
            else:
                first_object_action.setdefault(target.spid, action.operation)

    for spid, operation in first_object_action.items():
        # Entrance => initially hidden; exit => initially visible.
        object_state[spid] = operation != "show"

    for (spid, index), operation in first_paragraph_action.items():
        paragraph_state.setdefault(spid, {})[index] = operation != "show"

    return object_state, paragraph_state


def apply_action(
    action: Action,
    slide_root: etree._Element,
    object_state: dict[str, bool],
    paragraph_state: dict[str, dict[int, bool]],
    warnings: list[str],
) -> None:
    visible = action.operation == "show"
    target = action.target

    if target.is_paragraph_target:
        for index in expanded_indices(target, slide_root, warnings):
            paragraph_state.setdefault(target.spid, {})[index] = visible
    else:
        object_state[target.spid] = visible


def render_state(
    base_root: etree._Element,
    object_state: dict[str, bool],
    paragraph_state: dict[str, dict[int, bool]],
    warnings: list[str],
) -> etree._Element:
    root = copy.deepcopy(base_root)

    for spid, visible in object_state.items():
        if visible:
            continue
        shape = find_shape(root, spid)
        if shape is None:
            warnings.append(f"shape {spid}: object target was not found")
            continue
        parent = shape.getparent()
        if parent is not None:
            parent.remove(shape)

    for spid, states in paragraph_state.items():
        # If the whole shape is hidden, there is nothing else to do.
        if object_state.get(spid) is False:
            continue

        shape = find_shape(root, spid)
        if shape is None:
            warnings.append(f"shape {spid}: paragraph target was not found")
            continue

        paragraphs = shape_paragraphs(shape)
        for index, visible in states.items():
            if not visible and 0 <= index < len(paragraphs):
                hide_paragraph(paragraphs[index])

    remove_timing(root)
    return root


def visual_signature(
    object_state: dict[str, bool],
    paragraph_state: dict[str, dict[int, bool]],
) -> tuple:
    return (
        tuple(sorted(object_state.items())),
        tuple(
            (spid, tuple(sorted(states.items())))
            for spid, states in sorted(paragraph_state.items())
        ),
    )


def expand_slide(
    slide_xml: bytes,
    omit_initial: bool,
    strict: bool,
) -> tuple[list[etree._Element], list[str], int]:
    base_root = parse_xml(slide_xml)
    groups, warnings = extract_click_groups(base_root)

    if strict and warnings:
        raise ConversionError("; ".join(warnings))

    if not groups:
        root = copy.deepcopy(base_root)
        remove_timing(root)
        return [root], warnings, 0

    object_state, paragraph_state = initial_state(
        base_root, groups, warnings
    )

    roots: list[etree._Element] = []
    previous_signature = None

    if not omit_initial:
        roots.append(
            render_state(
                base_root,
                object_state,
                paragraph_state,
                warnings,
            )
        )
        previous_signature = visual_signature(object_state, paragraph_state)

    for group in groups:
        for action in group:
            apply_action(
                action,
                base_root,
                object_state,
                paragraph_state,
                warnings,
            )

        signature = visual_signature(object_state, paragraph_state)
        if signature == previous_signature:
            continue

        roots.append(
            render_state(
                base_root,
                object_state,
                paragraph_state,
                warnings,
            )
        )
        previous_signature = signature

    if not roots:
        root = copy.deepcopy(base_root)
        remove_timing(root)
        roots.append(root)

    if strict and warnings:
        raise ConversionError("; ".join(warnings))

    return roots, warnings, len(groups)


def clone_notes_for_slide(
    files: dict[str, bytes],
    slide_part: str,
    cloned_slide_part: str,
    cloned_slide_rels: etree._Element,
    content_types: etree._Element,
    next_notes_number: int,
) -> int:
    """
    Clone the original notes slide for an additional generated slide.
    """
    notes_relationships = [
        rel
        for rel in cloned_slide_rels.findall(
            "rel:Relationship",
            NS,
        )
        if rel.get("Type") == NOTES_REL_TYPE
    ]

    if not notes_relationships:
        return next_notes_number

    if len(notes_relationships) > 1:
        raise ConversionError(
            f"Slide has multiple notes relationships: {slide_part}"
        )

    notes_relationship = notes_relationships[0]
    target = notes_relationship.get("Target")

    if not target:
        raise ConversionError(
            f"Notes relationship has no target: {slide_part}"
        )

    original_notes_part = rel_target_to_part(
        slide_part,
        target,
    )

    if original_notes_part not in files:
        raise ConversionError(
            f"Missing notes slide referenced by {slide_part}: "
            f"{original_notes_part}"
        )

    original_notes_rels_part = relationships_part(
        original_notes_part
    )

    if original_notes_rels_part not in files:
        raise ConversionError(
            f"Missing notes relationships: "
            f"{original_notes_rels_part}"
        )

    new_notes_part = (
        f"ppt/notesSlides/notesSlide{next_notes_number}.xml"
    )
    new_notes_rels_part = relationships_part(new_notes_part)

    notes_rels = parse_xml(
        files[original_notes_rels_part]
    )

    slide_back_references = [
        rel
        for rel in notes_rels.findall(
            "rel:Relationship",
            NS,
        )
        if rel.get("Type") == SLIDE_REL_TYPE
    ]

    if not slide_back_references:
        raise ConversionError(
            f"Notes slide has no back-reference to its slide: "
            f"{original_notes_rels_part}"
        )

    for rel in slide_back_references:
        rel.set(
            "Target",
            part_to_rel_target(
                new_notes_part,
                cloned_slide_part,
            ),
        )

    files[new_notes_part] = files[original_notes_part]
    files[new_notes_rels_part] = serialize_xml(notes_rels)

    ensure_override(
        content_types,
        new_notes_part,
        NOTES_CONTENT_TYPE,
    )

    notes_relationship.set(
        "Target",
        part_to_rel_target(
            cloned_slide_part,
            new_notes_part,
        ),
    )

    return next_notes_number + 1


def convert(
    input_path: Path,
    output_path: Path,
    omit_initial: bool,
    strict: bool,
) -> None:
    files = read_package(input_path)

    required = {
        "[Content_Types].xml",
        "ppt/presentation.xml",
        "ppt/_rels/presentation.xml.rels",
    }
    missing = required.difference(files)
    if missing:
        raise ConversionError(
            "Input is not a normal PPTX package; missing: "
            + ", ".join(sorted(missing))
        )

    presentation = parse_xml(files["ppt/presentation.xml"])
    presentation_rels = parse_xml(
        files["ppt/_rels/presentation.xml.rels"]
    )
    content_types = parse_xml(files["[Content_Types].xml"])

    slide_id_list = presentation.find("p:sldIdLst", NS)
    if slide_id_list is None:
        raise ConversionError("presentation.xml has no p:sldIdLst")

    relationship_by_id = {
        rel.get("Id"): rel
        for rel in presentation_rels.findall("rel:Relationship", NS)
    }

    original_entries = []
    for slide_id in list(slide_id_list):
        rid = slide_id.get(R + "id")
        relationship = relationship_by_id.get(rid)
        if relationship is None or relationship.get("Type") != SLIDE_REL_TYPE:
            continue
        slide_part = rel_target_to_part(
            "ppt/presentation.xml",
            relationship.get("Target", ""),
        )
        original_entries.append((slide_id, slide_part))

    if not original_entries:
        raise ConversionError("No slides were found in the PPTX")

    next_slide_number = numeric_suffix(
        files,
        r"ppt/slides/slide(\d+)\.xml",
    ) + 1
    next_notes_number = numeric_suffix(
        files,
        r"ppt/notesSlides/notesSlide(\d+)\.xml",
    ) + 1
    next_rid_number = max_relationship_number(presentation_rels) + 1
    next_slide_id = max(
        (int(node.get("id", "255")) for node, _ in original_entries),
        default=255,
    ) + 1

    new_slide_id_nodes = []
    total_generated = 0
    total_clicks = 0

    for original_index, (original_slide_id, slide_part) in enumerate(
        original_entries,
        start=1,
    ):
        if slide_part not in files:
            raise ConversionError(f"Missing slide part: {slide_part}")

        roots, warnings, click_count = expand_slide(
            files[slide_part],
            omit_initial=omit_initial,
            strict=strict,
        )
        total_clicks += click_count

        print(
            f"Slide {original_index}: "
            f"{click_count} click group(s) -> {len(roots)} generated slide(s)"
        )
        for warning in sorted(set(warnings)):
            print(f"  Warning: {warning}", file=sys.stderr)

        # Reuse the original slide part and relationship for the first state.
        files[slide_part] = serialize_xml(roots[0])
        new_slide_id_nodes.append(original_slide_id)
        total_generated += 1

        original_slide_rels_part = relationships_part(slide_part)
        original_slide_rels = files.get(original_slide_rels_part)

        if len(roots) > 1 and original_slide_rels is None:
            raise ConversionError(
                f"Missing relationships for slide to be cloned: "
                f"{original_slide_rels_part}"
            )

        # Additional states become newly numbered slide parts.
        for root in roots[1:]:
            cloned_slide_part = (
                f"ppt/slides/slide{next_slide_number}.xml"
            )
            files[cloned_slide_part] = serialize_xml(root)
            ensure_override(
                content_types,
                cloned_slide_part,
                SLIDE_CONTENT_TYPE,
            )

            if original_slide_rels is not None:
                cloned_rels = parse_xml(original_slide_rels)

                next_notes_number = clone_notes_for_slide(
                    files,
                    slide_part,
                    cloned_slide_part,
                    cloned_rels,
                    content_types,
                    next_notes_number,
                )

                files[relationships_part(cloned_slide_part)] = (
                    serialize_xml(cloned_rels)
                )

            rid = f"rId{next_rid_number}"
            relationship = etree.Element(REL + "Relationship")
            relationship.set("Id", rid)
            relationship.set("Type", SLIDE_REL_TYPE)
            relationship.set(
                "Target",
                part_to_rel_target(
                    "ppt/presentation.xml",
                    cloned_slide_part,
                ),
            )
            presentation_rels.append(relationship)

            slide_id = etree.Element(P + "sldId")
            slide_id.set("id", str(next_slide_id))
            slide_id.set(R + "id", rid)
            new_slide_id_nodes.append(slide_id)

            next_slide_number += 1
            next_rid_number += 1
            next_slide_id += 1
            total_generated += 1

    for child in list(slide_id_list):
        slide_id_list.remove(child)
    for child in new_slide_id_nodes:
        slide_id_list.append(child)

    files["ppt/presentation.xml"] = serialize_xml(presentation)
    files["ppt/_rels/presentation.xml.rels"] = serialize_xml(
        presentation_rels
    )
    files["[Content_Types].xml"] = serialize_xml(content_types)

    write_package(output_path, files)

    print(f"Output: {output_path}")
    print(f"Original slides: {len(original_entries)}")
    print(f"Recognized click groups: {total_clicks}")
    print(f"Generated slides: {total_generated}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Expand simple object and bullet-paragraph animations "
            "into static PPTX slides."
        )
    )
    parser.add_argument("input", type=Path, help="input .pptx")
    parser.add_argument("output", type=Path, help="output .pptx")
    parser.add_argument(
        "--omit-initial",
        action="store_true",
        help="omit the pre-animation state on animated slides",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="stop if an unsupported animation target is detected",
    )
    args = parser.parse_args()

    if args.input.resolve() == args.output.resolve():
        parser.error("input and output paths must be different")
    if args.input.suffix.lower() != ".pptx":
        parser.error("input must have a .pptx extension")
    if args.output.suffix.lower() != ".pptx":
        parser.error("output must have a .pptx extension")
    if not args.input.is_file():
        parser.error(f"input file does not exist: {args.input}")

    try:
        convert(
            args.input,
            args.output,
            omit_initial=args.omit_initial,
            strict=args.strict,
        )
    except (ConversionError, etree.XMLSyntaxError, zipfile.BadZipFile) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
