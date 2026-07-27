#!/usr/bin/env python3
"""
Normalize selected PowerPoint bullet indentation, disable LibreOffice's
automatic Asian/non-Asian character spacing, trigger "Resize shape to fit
text" recalculation, and export the presentation to PDF.

The conversion has three independent fixes.

1. Bullet indentation normalization before LibreOffice opens the PPTX

   Some PPTX files omit DrawingML paragraph attributes ``marL`` and
   ``indent`` for a bullet level. PowerPoint can display such a list with zero
   hanging width, while LibreOffice may substitute its own non-zero default.

   This script safely handles locally defined bullet lists. For each bullet
   paragraph whose bullet definition can be resolved from the paragraph itself
   or the text body's local ``a:lstStyle``:

   * Explicit paragraph ``marL`` and ``indent`` values are preserved.
   * A missing value is copied from the matching local ``a:lvlNpPr``.
   * If that matching local level exists but omits the value, zero is written
     explicitly to the paragraph.

   Bullets that depend on slide-layout/master inheritance and cannot be
   resolved locally are left unchanged and reported in verbose mode.

2. Disable LibreOffice's automatic Asian/non-Asian character spacing

   For each paragraph whose ``ParaIsCharacterDistance`` value is True, the
   value is changed to False. This prevents LibreOffice from inserting extra
   spacing at Japanese/Latin and Japanese/digit boundaries that PowerPoint
   does not use for the affected PPTX files. Paragraphs already set to False
   or those without directly adjacent Japanese/CJK and ASCII characters are
   not changed.

3. LibreOffice auto-fit recalculation after loading the normalized PPTX

   For non-empty text shapes where ``TextWordWrap`` is originally False, each
   originally enabled auto-grow property is toggled:

       TextAutoGrowWidth / TextAutoGrowHeight: True -> False -> True

   This mimics unchecking and rechecking Impress's:

       Text Attributes -> Resize shape to fit text

   Shapes whose original ``TextWordWrap`` is True are not touched, avoiding
   the large geometry changes observed when wrapped body text is processed.

Run this script with LibreOffice's bundled Python, for example:

    /opt/libreoffice25.8/program/python \
        convert_pptx_with_bullet_and_autofit_fixes.py \
        PIPE_NAME input.pptx output.pdf --verbose

LibreOffice must already be running with the same UNO pipe. The companion
``run-pptx-fixes-in-container.sh`` script starts it automatically.
"""

from __future__ import annotations

import argparse
import io
import re
import shutil
import sys
import tempfile
import time
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET

try:
    import uno  # type: ignore
    from com.sun.star.connection import NoConnectException  # type: ignore
except ImportError:
    uno = None
    NoConnectException = Exception


A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"
P_NS = "http://schemas.openxmlformats.org/presentationml/2006/main"

A_P = f"{{{A_NS}}}p"
A_PPR = f"{{{A_NS}}}pPr"
A_LST_STYLE = f"{{{A_NS}}}lstStyle"
A_T = f"{{{A_NS}}}t"
A_BR = f"{{{A_NS}}}br"
A_BU_NONE = f"{{{A_NS}}}buNone"
A_BULLET_ON = {
    f"{{{A_NS}}}buChar",
    f"{{{A_NS}}}buAutoNum",
    f"{{{A_NS}}}buBlip",
}
TEXT_BODY_TAGS = {
    f"{{{P_NS}}}txBody",
    f"{{{A_NS}}}txBody",
}

AUTO_GROW_PROPERTIES = (
    "TextAutoGrowWidth",
    "TextAutoGrowHeight",
)

# PowerPoint ignores these paragraph-final spaces when determining wrapping,
# while LibreOffice may include them in the line width.
TRAILING_SPACES = " \u3000"

ASIAN_WESTERN_ADJACENCY = re.compile(
    r"(?:"
    r"[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]"
    r"[A-Za-z0-9]"
    r"|"
    r"[A-Za-z0-9]"
    r"[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]"
    r")"
)

class ConversionError(RuntimeError):
    """Raised when the presentation cannot be converted safely."""


@dataclass
class BulletNormalizationStats:
    """Summary of DrawingML bullet normalization."""

    slide_parts: int = 0
    text_bodies: int = 0
    bullet_paragraphs: int = 0
    modified_paragraphs: int = 0
    attributes_added: int = 0
    unresolved_bullet_paragraphs: int = 0
    trailing_space_paragraphs: int = 0
    trailing_space_characters: int = 0


# ---------------------------------------------------------------------------
# PPTX / DrawingML bullet normalization
# ---------------------------------------------------------------------------


def local_name(tag: str) -> str:
    """Return the local name from an ElementTree expanded tag."""
    if "}" in tag:
        return tag.rsplit("}", 1)[1]
    return tag


def register_source_namespaces(xml_bytes: bytes) -> None:
    """Register prefixes found in one XML part before serializing it."""
    try:
        for _, (prefix, uri) in ET.iterparse(
            io.BytesIO(xml_bytes),
            events=("start-ns",),
        ):
            try:
                ET.register_namespace(prefix or "", uri)
            except ValueError:
                # ElementTree reserves prefixes such as ns0. A generated
                # prefix is still valid if the source happened to use one.
                pass
    except ET.ParseError:
        # The actual parse below will produce the useful error.
        pass


def paragraph_text(paragraph: ET.Element, limit: int = 70) -> str:
    """Return a compact text excerpt for logs."""
    text = "".join(
        node.text or ""
        for node in paragraph.iter(A_T)
    ).replace("\n", " ")

    if len(text) > limit:
        return text[: limit - 1] + "…"
    return text


def trim_trailing_spaces_from_paragraph(
    paragraph: ET.Element,
    *,
    part_name: str,
    body_index: int,
    paragraph_index: int,
    stats: BulletNormalizationStats,
    verbose: bool,
) -> bool:
    """
    Remove paragraph-final normal and ideographic spaces from a:t nodes.

    Explicit a:br elements, tabs, carriage returns and line feeds are not
    modified. Paragraphs consisting only of spaces are preserved.
    """
    # Only consider text after the final explicit line break. Spaces before
    # an a:br belong to the preceding line and are not paragraph-final.
    text_nodes: list[ET.Element] = []

    for child in paragraph:
        if child.tag == A_BR:
            text_nodes.clear()
            continue

        text_nodes.extend(child.iter(A_T))

    if not text_nodes:
        return False

    full_text = "".join(node.text or "" for node in text_nodes)
    trimmed_full_text = full_text.rstrip(TRAILING_SPACES)

    # Preserve paragraphs made entirely from spaces, because they may be used
    # intentionally to create visual spacing.
    if trimmed_full_text == full_text or not trimmed_full_text:
        return False

    removed_count = 0

    # The trailing spaces may be split across several formatted runs.
    for text_node in reversed(text_nodes):
        current_text = text_node.text or ""
        if not current_text:
            continue

        trimmed_text = current_text.rstrip(TRAILING_SPACES)
        removed_from_node = len(current_text) - len(trimmed_text)

        if removed_from_node:
            text_node.text = trimmed_text
            removed_count += removed_from_node

        if trimmed_text:
            break

        if removed_from_node == 0:
            break

    if removed_count == 0:
        return False

    stats.trailing_space_paragraphs += 1
    stats.trailing_space_characters += removed_count

    if verbose:
        print(
            "trailing spaces trim: "
            f"{part_name}, text body {body_index}, "
            f"paragraph {paragraph_index}: "
            f"removed {removed_count} character(s); "
            f"text={paragraph_text(paragraph)!r}"
        )

    return True


def trim_text_body_trailing_spaces(
    tx_body: ET.Element,
    *,
    part_name: str,
    body_index: int,
    stats: BulletNormalizationStats,
    verbose: bool,
) -> bool:
    """Trim paragraph-final normal and ideographic spaces in one text body."""
    changed = False

    for paragraph_index, paragraph in enumerate(
        tx_body.findall(A_P),
        start=1,
    ):
        if trim_trailing_spaces_from_paragraph(
            paragraph,
            part_name=part_name,
            body_index=body_index,
            paragraph_index=paragraph_index,
            stats=stats,
            verbose=verbose,
        ):
            changed = True

    return changed


def explicit_bullet_state(properties: ET.Element | None) -> bool | None:
    """
    Return True for an explicit bullet, False for explicit buNone, or None.

    Bullet font/size/color helper elements do not establish that numbering is
    enabled, so only buChar, buAutoNum and buBlip count as bullet-on markers.
    """
    if properties is None:
        return None

    children = {child.tag for child in properties}
    if A_BU_NONE in children:
        return False
    if children.intersection(A_BULLET_ON):
        return True
    return None


def get_paragraph_level(p_pr: ET.Element | None) -> int | None:
    """Return the zero-based DrawingML paragraph level, or None if invalid."""
    if p_pr is None:
        return 0

    raw_level = p_pr.get("lvl", "0")
    try:
        level = int(raw_level)
    except ValueError:
        return None

    if not 0 <= level <= 8:
        return None
    return level


def find_level_properties(
    list_style: ET.Element | None,
    level: int,
) -> ET.Element | None:
    """Find local a:lvl1pPr ... a:lvl9pPr for a zero-based level."""
    if list_style is None:
        return None
    tag = f"{{{A_NS}}}lvl{level + 1}pPr"
    return list_style.find(tag)


def insert_paragraph_properties(paragraph: ET.Element) -> ET.Element:
    """Create a:pPr in the schema-correct first-child position."""
    p_pr = ET.Element(A_PPR)
    paragraph.insert(0, p_pr)
    return p_pr


def normalize_text_body_bullets(
    tx_body: ET.Element,
    *,
    part_name: str,
    body_index: int,
    stats: BulletNormalizationStats,
    verbose: bool,
) -> bool:
    """
    Normalize locally resolvable bullet paragraph indentation in one txBody.

    Returns True when the XML was changed.
    """
    changed = False
    list_style = tx_body.find(A_LST_STYLE)
    paragraphs = tx_body.findall(A_P)

    for paragraph_index, paragraph in enumerate(paragraphs, start=1):
        p_pr = paragraph.find(A_PPR)
        level = get_paragraph_level(p_pr)
        excerpt = paragraph_text(paragraph)

        if level is None:
            if verbose:
                print(
                    "bullet skip: "
                    f"{part_name}, text body {body_index}, "
                    f"paragraph {paragraph_index}: invalid lvl; "
                    f"text={excerpt!r}"
                )
            continue

        level_pr = find_level_properties(list_style, level)
        paragraph_bullet = explicit_bullet_state(p_pr)
        level_bullet = explicit_bullet_state(level_pr)

        if paragraph_bullet is False:
            continue

        if paragraph_bullet is True:
            is_bullet = True
        elif level_bullet is False:
            is_bullet = False
        elif level_bullet is True:
            is_bullet = True
        else:
            # The bullet may be inherited from a layout/master. Do not guess
            # its indentation in the safe local-normalization mode.
            continue

        if not is_bullet:
            continue

        stats.bullet_paragraphs += 1

        # A local level is required to resolve missing indentation safely.
        # Existing explicit paragraph values need no change and are preserved.
        missing = [
            name
            for name in ("marL", "indent")
            if p_pr is None or p_pr.get(name) is None
        ]

        if not missing:
            continue

        if level_pr is None:
            stats.unresolved_bullet_paragraphs += 1
            if verbose:
                print(
                    "bullet unresolved: "
                    f"{part_name}, text body {body_index}, "
                    f"paragraph {paragraph_index}, level {level + 1}: "
                    "no local lvlNpPr; unchanged; "
                    f"text={excerpt!r}"
                )
            continue

        if p_pr is None:
            p_pr = insert_paragraph_properties(paragraph)

        added: list[str] = []
        for attribute_name in missing:
            # An omitted value in an existing local level is made explicit as
            # zero. This is the case proven to align LibreOffice with
            # PowerPoint for the legacy-PPT-derived bullet text tested here.
            value = level_pr.get(attribute_name, "0")
            p_pr.set(attribute_name, value)
            stats.attributes_added += 1
            added.append(f"{attribute_name}={value}")

        stats.modified_paragraphs += 1
        changed = True

        if verbose:
            print(
                "bullet normalize: "
                f"{part_name}, text body {body_index}, "
                f"paragraph {paragraph_index}, level {level + 1}: "
                f"added {', '.join(added)}; text={excerpt!r}"
            )

    return changed


def normalize_slide_xml(
    xml_bytes: bytes,
    *,
    part_name: str,
    stats: BulletNormalizationStats,
    verbose: bool,
) -> tuple[bytes, bool]:
    """Normalize bullet indentation in one slide XML part."""
    register_source_namespaces(xml_bytes)

    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError as exc:
        raise ConversionError(
            f"Invalid XML in {part_name}: {exc}"
        ) from exc

    changed = False
    body_index = 0

    for element in root.iter():
        if element.tag not in TEXT_BODY_TAGS:
            continue

        body_index += 1
        stats.text_bodies += 1

        if trim_text_body_trailing_spaces(
            element,
            part_name=part_name,
            body_index=body_index,
            stats=stats,
            verbose=verbose,
        ):
            changed = True

        if normalize_text_body_bullets(
            element,
            part_name=part_name,
            body_index=body_index,
            stats=stats,
            verbose=verbose,
        ):
            changed = True

    if not changed:
        return xml_bytes, False

    normalized = ET.tostring(
        root,
        encoding="utf-8",
        xml_declaration=True,
    )
    return normalized, True


def is_slide_xml_part(name: str) -> bool:
    """Return True for ppt/slides/slideN.xml, excluding relationship parts."""
    if not name.startswith("ppt/slides/slide"):
        return False
    if not name.endswith(".xml"):
        return False
    leaf = name.rsplit("/", 1)[-1]
    number = leaf[len("slide") : -len(".xml")]
    return number.isdigit()


def normalize_pptx_bullet_indentation(
    input_path: Path,
    output_path: Path,
    *,
    verbose: bool = False,
) -> BulletNormalizationStats:
    """Create a PPTX whose locally defined bullet indents are explicit."""
    stats = BulletNormalizationStats()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        source = zipfile.ZipFile(input_path, "r")
    except (OSError, zipfile.BadZipFile) as exc:
        raise ConversionError(
            f"Input is not a readable PPTX ZIP package: {input_path}: {exc}"
        ) from exc

    try:
        with source, zipfile.ZipFile(output_path, "w") as target:
            for info in source.infolist():
                data = source.read(info)

                if is_slide_xml_part(info.filename):
                    stats.slide_parts += 1
                    data, _ = normalize_slide_xml(
                        data,
                        part_name=info.filename,
                        stats=stats,
                        verbose=verbose,
                    )

                # Reuse ZipInfo to preserve timestamps, permissions,
                # compression method and other per-entry metadata.
                target.writestr(info, data)

    except (OSError, zipfile.BadZipFile) as exc:
        raise ConversionError(
            f"Could not create normalized PPTX {output_path}: {exc}"
        ) from exc

    if not output_path.is_file() or output_path.stat().st_size == 0:
        raise ConversionError(
            f"Bullet normalization produced no valid PPTX: {output_path}"
        )

    return stats


# ---------------------------------------------------------------------------
# LibreOffice UNO conversion, paragraph spacing fix, and auto-fit relayout
# ---------------------------------------------------------------------------


def require_uno() -> None:
    """Raise a clear error when not run with a PyUNO-enabled Python."""
    if uno is None:
        raise ConversionError(
            "The UNO module is unavailable. Run this script with "
            "LibreOffice's bundled Python, for example "
            "/opt/libreoffice25.8/program/python."
        )


def make_property(name: str, value: Any):
    """Create a UNO PropertyValue structure."""
    require_uno()
    prop = uno.createUnoStruct("com.sun.star.beans.PropertyValue")
    prop.Name = name
    prop.Value = value
    return prop


def connect_to_office(
    pipe_name: str,
    timeout_seconds: float = 15.0,
):
    """Connect to a running LibreOffice process through a UNO pipe."""
    require_uno()
    local_context = uno.getComponentContext()

    resolver = local_context.ServiceManager.createInstanceWithContext(
        "com.sun.star.bridge.UnoUrlResolver",
        local_context,
    )

    connection_url = (
        f"uno:pipe,name={pipe_name};"
        "urp;StarOffice.ComponentContext"
    )

    deadline = time.monotonic() + timeout_seconds
    last_error: Exception | None = None

    while time.monotonic() < deadline:
        try:
            remote_context = resolver.resolve(connection_url)
            service_manager = remote_context.ServiceManager
            desktop = service_manager.createInstanceWithContext(
                "com.sun.star.frame.Desktop",
                remote_context,
            )

            if desktop is None:
                raise ConversionError(
                    "UNO connected, but the Desktop service is unavailable"
                )

            return remote_context, desktop

        except NoConnectException as exc:
            last_error = exc
            time.sleep(0.1)

    raise ConversionError(
        f"Could not connect to LibreOffice pipe {pipe_name!r}: "
        f"{last_error}"
    )


def has_property(obj, property_name: str) -> bool:
    """Return True if a UNO object exposes a named property."""
    try:
        info = obj.getPropertySetInfo()
        return bool(
            info is not None
            and info.hasPropertyByName(property_name)
        )
    except Exception:
        return False


def get_property(obj, property_name: str):
    """Read a UNO property."""
    return obj.getPropertyValue(property_name)


def set_property(obj, property_name: str, value: Any) -> None:
    """Write a UNO property."""
    obj.setPropertyValue(property_name, value)


def get_shape_label(shape) -> str:
    """Return a useful shape name for logs."""
    for property_name in ("Name", "Title", "Description"):
        if not has_property(shape, property_name):
            continue
        try:
            value = get_property(shape, property_name)
            if value:
                return str(value)
        except Exception:
            pass
    return shape.__class__.__name__


def get_shape_text(shape) -> str:
    """Return the shape's text, or an empty string if it has none."""
    try:
        return str(shape.getString())
    except Exception:
        return ""


def is_group_shape(shape) -> bool:
    """Return True for a LibreOffice drawing group shape."""
    try:
        return bool(
            shape.supportsService(
                "com.sun.star.drawing.GroupShape"
            )
        )
    except Exception:
        return False


def get_shape_size(shape) -> tuple[int, int] | None:
    """Return shape size as (width, height), in 1/100 mm."""
    try:
        size = shape.getSize()
        return int(size.Width), int(size.Height)
    except Exception:
        return None


def format_size(size: tuple[int, int] | None) -> str:
    """Format a shape size for logs."""
    if size is None:
        return "unknown"
    width, height = size
    return (
        f"{width}x{height} "
        f"({width / 100:.2f} mm x {height / 100:.2f} mm)"
    )


def get_original_auto_grow_values(shape) -> dict[str, bool]:
    """Return boolean auto-grow values exposed by a shape."""
    values: dict[str, bool] = {}

    for property_name in AUTO_GROW_PROPERTIES:
        if not has_property(shape, property_name):
            continue
        try:
            value = get_property(shape, property_name)
        except Exception:
            continue
        if type(value) is bool:
            values[property_name] = value

    return values


def restore_properties(shape, original_values: dict[str, bool]) -> None:
    """Best-effort restoration of original auto-grow properties."""
    for property_name, original_value in original_values.items():
        try:
            set_property(shape, property_name, original_value)
        except Exception:
            pass


def paragraph_excerpt(paragraph, limit: int = 70) -> str:
    """Return a compact UNO paragraph excerpt for logs."""
    try:
        text = str(paragraph.getString()).replace("\n", " ")
    except Exception:
        return ""

    if len(text) > limit:
        return text[: limit - 1] + "…"
    return text


def has_adjacent_asian_western_text(text: str) -> bool:
    """Return True for adjacent Japanese/CJK and ASCII alphanumeric text."""
    return bool(ASIAN_WESTERN_ADJACENCY.search(text))


def disable_asian_western_spacing_in_shape(
    shape,
    *,
    verbose: bool = False,
) -> int:
    """
    Disable Asian/non-Asian spacing only in paragraphs containing directly
    adjacent East Asian and ASCII alphanumeric characters.
    """
    if is_group_shape(shape):
        count = 0
        try:
            for index in range(shape.getCount()):
                count += disable_asian_western_spacing_in_shape(
                    shape.getByIndex(index),
                    verbose=verbose,
                )
        except Exception as exc:
            if verbose:
                print(
                    "asian-western spacing skip group: "
                    f"{get_shape_label(shape)}: {exc}"
                )
        return count

    if not get_shape_text(shape):
        return 0

    try:
        paragraphs = shape.getText().createEnumeration()
    except Exception:
        return 0

    changed = 0
    paragraph_index = 0

    while paragraphs.hasMoreElements():
        paragraph_index += 1
        paragraph = paragraphs.nextElement()

        if not has_property(paragraph, "ParaIsCharacterDistance"):
            continue

        try:
            value = get_property(
                paragraph,
                "ParaIsCharacterDistance",
            )
        except Exception as exc:
            if verbose:
                print(
                    "asian-western spacing skip: "
                    f"{get_shape_label(shape)}, "
                    f"paragraph {paragraph_index}: {exc}"
                )
            continue

        if value is not True:
            continue

        try:
            text = str(paragraph.getString())
        except Exception:
            continue

        if not has_adjacent_asian_western_text(text):
            continue

        try:
            set_property(
                paragraph,
                "ParaIsCharacterDistance",
                False,
            )
        except Exception as exc:
            if verbose:
                print(
                    "asian-western spacing skip: "
                    f"{get_shape_label(shape)}, "
                    f"paragraph {paragraph_index}: {exc}"
                )
            continue

        changed += 1

        if verbose:
            print(
                "asian-western spacing: "
                f"{get_shape_label(shape)}, "
                f"paragraph {paragraph_index}: True -> False; "
                f"text={paragraph_excerpt(paragraph)!r}"
            )

    return changed


def disable_asian_western_spacing(
    document,
    *,
    verbose: bool = False,
) -> int:
    """Disable automatic Asian/non-Asian spacing in all eligible paragraphs."""
    try:
        pages = document.getDrawPages()
    except Exception as exc:
        raise ConversionError(
            "The loaded document is not an Impress or Draw document"
        ) from exc

    changed_count = 0

    for page_index in range(pages.getCount()):
        page = pages.getByIndex(page_index)
        for shape_index in range(page.getCount()):
            changed_count += disable_asian_western_spacing_in_shape(
                page.getByIndex(shape_index),
                verbose=verbose,
            )

    return changed_count


def trigger_resize_shape_to_fit_text(
    shape,
    *,
    verbose: bool = False,
) -> bool:
    """
    Recalculate Resize shape to fit text for originally non-wrapping shapes.

    Only originally True auto-grow properties are toggled, and shapes whose
    original TextWordWrap is True are skipped.
    """
    text = get_shape_text(shape)
    if not text:
        return False

    label = get_shape_label(shape)

    if not has_property(shape, "TextWordWrap"):
        if verbose:
            print(f"skip: {label}: TextWordWrap property unavailable")
        return False

    try:
        word_wrap = get_property(shape, "TextWordWrap")
    except Exception as exc:
        if verbose:
            print(f"skip: {label}: could not read TextWordWrap: {exc}")
        return False

    if type(word_wrap) is not bool:
        if verbose:
            print(
                f"skip: {label}: unexpected TextWordWrap value "
                f"{word_wrap!r}"
            )
        return False

    if word_wrap is True:
        if verbose:
            print(f"skip: {label}: TextWordWrap=True")
        return False

    original_values = get_original_auto_grow_values(shape)
    enabled_properties = [
        property_name
        for property_name, value in original_values.items()
        if value is True
    ]

    if not enabled_properties:
        if verbose:
            shown_values = ", ".join(
                f"{name}={value}"
                for name, value in original_values.items()
            ) or "no supported auto-grow properties"
            print(f"skip: {label}: {shown_values}")
        return False

    original_size = get_shape_size(shape)

    try:
        for property_name in enabled_properties:
            set_property(shape, property_name, False)

        disabled_size = get_shape_size(shape)

        for property_name in enabled_properties:
            set_property(shape, property_name, True)

        resulting_size = get_shape_size(shape)

        for property_name, original_value in original_values.items():
            current_value = get_property(shape, property_name)
            if current_value != original_value:
                raise ConversionError(
                    f"{label}: failed to restore {property_name}: "
                    f"expected {original_value!r}, got {current_value!r}"
                )

        if verbose:
            toggled = ", ".join(enabled_properties)
            print(
                f"relayout: {label}: TextWordWrap=False; "
                f"{toggled}: True -> False -> True"
            )
            print(f"  size before:   {format_size(original_size)}")
            print(f"  size disabled: {format_size(disabled_size)}")
            print(f"  size after:    {format_size(resulting_size)}")

        return True

    except Exception:
        restore_properties(shape, original_values)
        raise


def process_shape(shape, *, verbose: bool = False) -> int:
    """Process one shape, recursively descending into group shapes."""
    if is_group_shape(shape):
        count = 0
        try:
            for index in range(shape.getCount()):
                count += process_shape(
                    shape.getByIndex(index),
                    verbose=verbose,
                )
        except Exception as exc:
            if verbose:
                print(f"skip group: {get_shape_label(shape)}: {exc}")
        return count

    try:
        return int(
            trigger_resize_shape_to_fit_text(
                shape,
                verbose=verbose,
            )
        )
    except Exception as exc:
        if verbose:
            print(
                f"skip: {get_shape_label(shape)}: "
                f"auto-fit recalculation failed: {exc}"
            )
        return 0


def relayout_presentation(document, *, verbose: bool = False) -> int:
    """Process every text shape on every slide."""
    try:
        pages = document.getDrawPages()
    except Exception as exc:
        raise ConversionError(
            "The loaded document is not an Impress or Draw document"
        ) from exc

    changed_count = 0

    for page_index in range(pages.getCount()):
        page = pages.getByIndex(page_index)
        if verbose:
            print(
                f"page {page_index + 1}: "
                f"{page.getCount()} top-level shape(s)"
            )

        for shape_index in range(page.getCount()):
            changed_count += process_shape(
                page.getByIndex(shape_index),
                verbose=verbose,
            )

    return changed_count


def load_document(desktop, input_path: Path):
    """Open a PPTX as an editable hidden LibreOffice document."""
    input_url = uno.systemPathToFileUrl(str(input_path.resolve()))
    load_options = (
        make_property("Hidden", True),
        make_property("ReadOnly", False),
    )

    document = desktop.loadComponentFromURL(
        input_url,
        "_blank",
        0,
        load_options,
    )

    if document is None:
        raise ConversionError(
            f"LibreOffice could not open {input_path}"
        )
    return document


def refresh_document(document) -> None:
    """Best-effort document refresh before export."""
    try:
        document.refresh()
    except Exception:
        pass


def export_pdf(document, output_path: Path) -> None:
    """Export the currently open presentation to PDF."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_url = uno.systemPathToFileUrl(str(output_path.resolve()))
    export_options = (
        make_property("FilterName", "impress_pdf_Export"),
        make_property("Overwrite", True),
    )

    document.storeToURL(output_url, export_options)

    if not output_path.is_file() or output_path.stat().st_size == 0:
        raise ConversionError(
            f"PDF export did not create a valid file: {output_path}"
        )


def close_document(document) -> None:
    """Close or dispose of a UNO document."""
    try:
        document.close(True)
        return
    except Exception:
        pass
    try:
        document.dispose()
    except Exception:
        pass


# ---------------------------------------------------------------------------
# Command line and orchestration
# ---------------------------------------------------------------------------


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Normalize locally defined PPTX bullet indentation, disable "
            "LibreOffice Asian/non-Asian character spacing, trigger "
            "Resize-shape-to-fit-text recalculation, and export to PDF."

        )
    )

    parser.add_argument(
        "pipe_name",
        help="UNO pipe name used by the running soffice process",
    )
    parser.add_argument(
        "input_pptx",
        type=Path,
        help="Input .pptx file",
    )
    parser.add_argument(
        "output_pdf",
        type=Path,
        help="Output PDF file",
    )
    parser.add_argument(
        "--keep-normalized-pptx",
        type=Path,
        help=(
            "Optionally save the intermediate bullet-normalized PPTX "
            "for inspection"
        ),
    )
    parser.add_argument(
        "--skip-bullet-normalization",
        action="store_true",
        help="Open the original PPTX without the bullet indentation fix",
    )
    parser.add_argument(
        "--skip-asian-western-spacing-fix",
        action="store_true",
        help=(
            "Do not set ParaIsCharacterDistance=False before PDF export"
        ),
    )
    parser.add_argument(
        "--skip-autofit-relayout",
        action="store_true",
        help="Do not toggle Resize shape to fit text before PDF export",
    )
    parser.add_argument(
        "--connect-timeout",
        type=float,
        default=15.0,
        help="UNO connection timeout in seconds; default: 15",
    )
    parser.add_argument(
        "--settle-time",
        type=float,
        default=0.1,
        help=(
            "Delay after relayout before PDF export in seconds; "
            "default: 0.1"
        ),
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print bullet decisions and shape geometry changes",
    )

    return parser.parse_args()


def validate_args(args: argparse.Namespace) -> None:
    if not args.input_pptx.is_file():
        raise ConversionError(
            f"Input file not found: {args.input_pptx}"
        )

    if args.input_pptx.suffix.lower() != ".pptx":
        raise ConversionError(
            "The integrated bullet normalization currently supports "
            f".pptx input only: {args.input_pptx}"
        )

    if args.connect_timeout <= 0:
        raise ConversionError(
            "--connect-timeout must be greater than zero"
        )

    if args.settle_time < 0:
        raise ConversionError(
            "--settle-time must be zero or greater"
        )

    try:
        if args.input_pptx.resolve() == args.output_pdf.resolve():
            raise ConversionError(
                "Input PPTX and output PDF paths must differ"
            )
    except OSError:
        pass


def print_bullet_summary(stats: BulletNormalizationStats) -> None:
    print(
        "Bullet indentation normalization: "
        f"{stats.modified_paragraphs} paragraph(s) modified, "
        f"{stats.attributes_added} attribute(s) added, "
        f"{stats.unresolved_bullet_paragraphs} unresolved local "
        "bullet paragraph(s) left unchanged."
    )


def print_trailing_space_summary(
    stats: BulletNormalizationStats,
) -> None:
    print(
        "Trailing paragraph spaces normalization: "
        f"{stats.trailing_space_paragraphs} paragraph(s) modified, "
        f"{stats.trailing_space_characters} character(s) removed."
    )


def main() -> int:
    args = parse_args()
    document = None

    try:
        validate_args(args)
        _, desktop = connect_to_office(
            args.pipe_name,
            timeout_seconds=args.connect_timeout,
        )

        with tempfile.TemporaryDirectory(
            prefix="bbb-pptx-fix-"
        ) as temp_dir_name:
            temp_dir = Path(temp_dir_name)
            normalized_path = temp_dir / args.input_pptx.name

            if args.skip_bullet_normalization:
                input_for_libreoffice = args.input_pptx
                stats = BulletNormalizationStats()
                if args.keep_normalized_pptx:
                    args.keep_normalized_pptx.parent.mkdir(
                        parents=True,
                        exist_ok=True,
                    )
                    shutil.copy2(
                        args.input_pptx,
                        args.keep_normalized_pptx,
                    )
            else:
                stats = normalize_pptx_bullet_indentation(
                    args.input_pptx,
                    normalized_path,
                    verbose=args.verbose,
                )
                input_for_libreoffice = normalized_path
                print_bullet_summary(stats)
                print_trailing_space_summary(stats)

                if args.keep_normalized_pptx:
                    args.keep_normalized_pptx.parent.mkdir(
                        parents=True,
                        exist_ok=True,
                    )
                    shutil.copy2(
                        normalized_path,
                        args.keep_normalized_pptx,
                    )
                    print(
                        "Normalized PPTX written to: "
                        f"{args.keep_normalized_pptx}"
                    )

            document = load_document(
                desktop,
                input_for_libreoffice,
            )

            if args.skip_asian_western_spacing_fix:
                spacing_count = 0
            else:
                spacing_count = disable_asian_western_spacing(
                    document,
                    verbose=args.verbose,
                )

            if args.skip_autofit_relayout:
                relayout_count = 0
            else:
                relayout_count = relayout_presentation(
                    document,
                    verbose=args.verbose,
                )

            refresh_document(document)
            if args.settle_time:
                time.sleep(args.settle_time)

            export_pdf(document, args.output_pdf)

            print(
                "Asian/non-Asian character spacing disabled for "
                f"{spacing_count} paragraph(s)."
            )
            print(
                "Resize-shape-to-fit-text recalculation triggered for "
                f"{relayout_count} text shape(s)."
            )
            print(f"PDF written to: {args.output_pdf}")

        return 0

    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    finally:
        if document is not None:
            close_document(document)


if __name__ == "__main__":
    raise SystemExit(main())
