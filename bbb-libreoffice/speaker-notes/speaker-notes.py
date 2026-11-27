# Converts a presentation to PDF and saves the speaker notes of every visible
# slide, in a single LibreOffice run.
#
# Usage: python speaker-notes.py <uno pipe name> <input file> [notes deadline in seconds]
#
# Writes <input file>.pdf, then <dir of input file>/speakernotes/slide-N.txt
# (UTF-8), where N is the page number of the visible slide in the PDF. Hidden
# slides are neither exported nor counted. A failure while reading notes
# removes the notes directory but keeps the PDF; the exit code is non-zero only
# when the PDF could not be written.
#
# The PDF is written under a temporary name and renamed when complete, so a
# killed run never leaves a truncated PDF behind. Reading the notes stops at the
# deadline, counted from the start of this script: the notes are then dropped and
# the script still exits 0, so the caller keeps the PDF within its own time limit.
# The notes directory gets a .complete marker last, once every slide was saved.
#
# Next to each non-empty slide-N.txt it also writes slide-N.json, the same notes
# with their formatting (version 1: paragraphs with list level and marker, runs
# with emphasis and direct colors). A slide whose formatting cannot be read, that
# uses a list numbering the JSON cannot reproduce, or whose JSON would pass
# MAX_NOTE_JSON_BYTES in UTF-8, keeps only its plain text.
#
# It also writes slide-N.title.txt with the text of the slide's title placeholder,
# whitespace collapsed to single spaces; empty when the slide has no title. A title
# that cannot be read is left empty and does not affect the notes.
import json
import os
import shutil
import sys
import time

import uno
from com.sun.star.beans import PropertyValue

STARTED_AT = time.monotonic()

MAX_NOTE_CHARS = 1024 * 1024
# bbb-web reads the JSON with the same limit (SpeakerNotesJsonReader.DefaultCap)
MAX_NOTE_JSON_BYTES = 1024 * 1024
CONNECT_TIMEOUT_SECONDS = 30
NOTES_SHAPE = "com.sun.star.presentation.NotesShape"
TITLE_SHAPE = "com.sun.star.presentation.TitleTextShape"
MAX_TITLE_CHARS = 1024
STRUCTURED_NOTES_VERSION = 1
MAX_LIST_LEVELS = 10
DEFAULT_BULLET = "\u2022"
# com.sun.star.style.NumberingType values. A, B, ... Z, AA, AB for 0 and 1;
# A, B, ... Z, AA, BB for 9 and 10, as LibreOffice numbers them
NUMBERING_UPPER_LETTERS = 0
NUMBERING_LOWER_LETTERS = 1
NUMBERING_UPPER_ROMAN = 2
NUMBERING_LOWER_ROMAN = 3
NUMBERING_ARABIC = 4
NUMBERING_NONE = 5
NUMBERING_CHAR_SPECIAL = 6
NUMBERING_BITMAP = 8
NUMBERING_UPPER_LETTERS_REPEATED = 9
NUMBERING_LOWER_LETTERS_REPEATED = 10
NUMBERED_TYPES = (NUMBERING_UPPER_LETTERS, NUMBERING_LOWER_LETTERS, NUMBERING_UPPER_ROMAN,
                  NUMBERING_LOWER_ROMAN, NUMBERING_ARABIC, NUMBERING_UPPER_LETTERS_REPEATED,
                  NUMBERING_LOWER_LETTERS_REPEATED)
BULLET_TYPES = (NUMBERING_CHAR_SPECIAL, NUMBERING_BITMAP)
FONT_WEIGHT_NORMAL = 100.0
# com.sun.star.awt.FontUnderline values that mean "no underline": NONE=0, DONTKNOW=4
NO_UNDERLINE_VALUES = (0, 4)
# com.sun.star.awt.FontStrikeout values that mean "no strikeout": NONE=0, DONTKNOW=3
NO_STRIKEOUT_VALUES = (0, 3)
COMPLETE_MARKER = ".complete"
ROMAN_NUMERALS = ((1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"),
                  (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"))
PDF_FILTERS = (
    ("com.sun.star.presentation.PresentationDocument", "impress_pdf_Export"),
    ("com.sun.star.drawing.DrawingDocument", "draw_pdf_Export"),
    ("com.sun.star.text.TextDocument", "writer_pdf_Export"),
    ("com.sun.star.sheet.SpreadsheetDocument", "calc_pdf_Export"),
)


class NotesDeadlineReached(Exception):
    pass


class UnsupportedNumbering(Exception):
    # A list numbered in a way the structured notes cannot reproduce; that slide keeps only its plain text
    pass


def check_deadline(deadline):
    if deadline is not None and time.monotonic() > deadline:
        raise NotesDeadlineReached()


def property_value(name, value):
    prop = PropertyValue()
    prop.Name = name
    prop.Value = value
    return prop


def connect(pipe_name):
    local_context = uno.getComponentContext()
    resolver = local_context.ServiceManager.createInstanceWithContext(
        "com.sun.star.bridge.UnoUrlResolver", local_context)
    deadline = time.monotonic() + CONNECT_TIMEOUT_SECONDS
    while True:
        try:
            return resolver.resolve(
                "uno:pipe,name=%s;urp;StarOffice.ComponentContext" % pipe_name)
        except Exception:
            if time.monotonic() > deadline:
                raise
            time.sleep(0.1)


def pdf_filter_for(document):
    for service, filter_name in PDF_FILTERS:
        if document.supportsService(service):
            return filter_name
    raise ValueError("Unsupported document type")


def notes_shapes(slide):
    notes_page = slide.NotesPage
    shapes = []
    for index in range(notes_page.Count):
        shape = notes_page.getByIndex(index)
        if shape.ShapeType == NOTES_SHAPE:
            shapes.append(shape)
    return shapes


def slide_title(slide):
    try:
        for index in range(slide.Count):
            shape = slide.getByIndex(index)
            if shape.ShapeType == TITLE_SHAPE:
                return " ".join(shape.getString().split())[:MAX_TITLE_CHARS]
    except Exception as exception:
        print("Could not read slide title: %s" % type(exception).__name__, file=sys.stderr)
    return ""


def notes_text(slide):
    texts = [shape.getString() for shape in notes_shapes(slide)]
    text = "\n".join(texts).replace("\r\n", "\n").replace("\r", "\n").strip()
    return text[:MAX_NOTE_CHARS]


def property_or(source, name, fallback):
    try:
        return source.getPropertyValue(name)
    except Exception:
        return fallback


def color_hex(value):
    return "#%06X" % (value & 0xFFFFFF)


def run_value(portion):
    run = {"text": portion.getString().replace("\r\n", "\n").replace("\r", "\n")}
    if property_or(portion, "CharWeight", FONT_WEIGHT_NORMAL) > FONT_WEIGHT_NORMAL:
        run["bold"] = True
    posture = property_or(portion, "CharPosture", None)
    if posture is not None and posture.value != "NONE":
        run["italic"] = True
    if property_or(portion, "CharUnderline", 0) not in NO_UNDERLINE_VALUES:
        run["underline"] = True
    if property_or(portion, "CharStrikeout", 0) not in NO_STRIKEOUT_VALUES:
        run["strikethrough"] = True
    escapement = property_or(portion, "CharEscapement", 0)
    if escapement > 0:
        run["superscript"] = True
    elif escapement < 0:
        run["subscript"] = True
    color = property_or(portion, "CharColor", -1)
    if color != -1:
        run["color"] = color_hex(color)
    highlight = property_or(portion, "CharBackColor", -1)
    if highlight != -1 and not property_or(portion, "CharBackTransparent", True):
        run["highlight"] = color_hex(highlight)
    return run


def letters(value):
    result = ""
    current = max(1, value)
    while current > 0:
        result = chr(ord("A") + (current - 1) % 26) + result
        current = (current - 1) // 26
    return result


def repeated_letters(value):
    current = max(1, value)
    return chr(ord("A") + (current - 1) % 26) * ((current - 1) // 26 + 1)


def roman(value):
    result = ""
    remaining = max(1, value)
    for number, numeral in ROMAN_NUMERALS:
        while remaining >= number:
            result += numeral
            remaining -= number
    return result


def format_number(value, numbering_type):
    if numbering_type == NUMBERING_UPPER_LETTERS:
        return letters(value)
    if numbering_type == NUMBERING_LOWER_LETTERS:
        return letters(value).lower()
    if numbering_type == NUMBERING_UPPER_LETTERS_REPEATED:
        return repeated_letters(value)
    if numbering_type == NUMBERING_LOWER_LETTERS_REPEATED:
        return repeated_letters(value).lower()
    if numbering_type == NUMBERING_UPPER_ROMAN:
        return roman(value)
    if numbering_type == NUMBERING_LOWER_ROMAN:
        return roman(value).lower()
    return str(value)


def numbering_rule(paragraph, level):
    try:
        rules = paragraph.getPropertyValue("NumberingRules")
        rule = {item.Name: item.Value for item in rules.getByIndex(level)}
    except Exception:
        # Paragraphs outside a list have no numbering rules
        return None
    if rule.get("NumberingType", NUMBERING_NONE) == NUMBERING_NONE:
        return None
    return rule


def reset_deeper_counters(counters, level):
    for index in range(level + 1, len(counters)):
        counters[index] = -1


def list_value(rule, level, counters, restart_value=None):
    reset_deeper_counters(counters, level)
    if rule is None:
        return None
    numbering_type = rule.get("NumberingType")
    if numbering_type in NUMBERED_TYPES:
        start = max(1, rule.get("StartWith") or 1)
        if restart_value is not None:
            counters[level] = restart_value if restart_value > 0 else start
        else:
            # -1 marks a level not numbered yet; a counter below StartWith after a restart still continues
            counters[level] = start if counters[level] < 0 else counters[level] + 1
        marker = (rule.get("Prefix") or "") + format_number(counters[level], numbering_type) + (rule.get("Suffix") or "")
        return {"type": "number", "marker": marker}
    if numbering_type not in BULLET_TYPES:
        raise UnsupportedNumbering()
    bullet = rule.get("BulletChar") if numbering_type == NUMBERING_CHAR_SPECIAL else ""
    return {"type": "bullet", "marker": bullet or DEFAULT_BULLET}


def paragraph_value(paragraph, counters):
    # LibreOffice leaves NumberingLevel empty for paragraphs that are not list items, even
    # when the notes style defines numbering rules
    numbering_level = property_or(paragraph, "NumberingLevel", None)
    level = min(max(0, numbering_level or 0), MAX_LIST_LEVELS - 1)
    rule = None if numbering_level is None else numbering_rule(paragraph, level)
    runs = []
    portions = paragraph.createEnumeration()
    while portions.hasMoreElements():
        run = run_value(portions.nextElement())
        if run["text"]:
            runs.append(run)
    if rule is not None and not property_or(paragraph, "NumberingIsNumber", True):
        # A list paragraph with its label turned off: no marker, and the counter does not move
        return {"level": level, "list": None, "runs": runs}
    restart_value = None
    if rule is not None and property_or(paragraph, "ParaIsNumberingRestart", False):
        restart_value = property_or(paragraph, "NumberingStartValue", -1)
    return {"level": level, "list": list_value(rule, level, counters, restart_value), "runs": runs}


def structured_notes(slide, deadline):
    paragraphs = []
    for shape in notes_shapes(slide):
        counters = [-1] * MAX_LIST_LEVELS
        enumeration = shape.Text.createEnumeration()
        while enumeration.hasMoreElements():
            check_deadline(deadline)
            paragraphs.append(paragraph_value(enumeration.nextElement(), counters))
    return {"version": STRUCTURED_NOTES_VERSION, "paragraphs": paragraphs}


def write_structured_notes(slide, path, deadline):
    try:
        value = json.dumps(structured_notes(slide, deadline), ensure_ascii=False, separators=(",", ":"))
        if len(value.encode("utf-8")) > MAX_NOTE_JSON_BYTES:
            return
        with open(path, "w", encoding="utf-8") as notes_file:
            notes_file.write(value)
    except NotesDeadlineReached:
        raise
    except Exception as exception:
        if os.path.exists(path):
            os.remove(path)
        print("Could not save formatted speaker notes: %s" % type(exception).__name__, file=sys.stderr)


def write_notes(document, notes_dir, deadline):
    if not document.supportsService("com.sun.star.presentation.PresentationDocument"):
        return
    try:
        os.makedirs(notes_dir)
        page_number = 0
        slides = document.DrawPages
        for index in range(slides.Count):
            check_deadline(deadline)
            slide = slides.getByIndex(index)
            if not slide.Visible:
                continue
            page_number += 1
            text = notes_text(slide)
            path = os.path.join(notes_dir, "slide-%d" % page_number)
            with open(path + ".txt", "w", encoding="utf-8") as notes_file:
                notes_file.write(text)
            if text:
                write_structured_notes(slide, path + ".json", deadline)
            with open(path + ".title.txt", "w", encoding="utf-8") as title_file:
                title_file.write(slide_title(slide))
        open(os.path.join(notes_dir, COMPLETE_MARKER), "w").close()
    except NotesDeadlineReached:
        shutil.rmtree(notes_dir, ignore_errors=True)
        print("Speaker notes dropped: the notes deadline was reached", file=sys.stderr)
    except Exception as exception:
        shutil.rmtree(notes_dir, ignore_errors=True)
        print("Could not save speaker notes: %s" % type(exception).__name__, file=sys.stderr)


def main(pipe_name, input_path, deadline_seconds=None):
    deadline = None if deadline_seconds is None else STARTED_AT + deadline_seconds
    context = connect(pipe_name)
    desktop = context.ServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop", context)
    try:
        document = desktop.loadComponentFromURL(
            uno.systemPathToFileUrl(input_path), "_blank", 0,
            (property_value("Hidden", True), property_value("ReadOnly", True)))
        if document is None:
            raise ValueError("Document could not be loaded")
        try:
            partial_pdf = input_path + ".pdf.part"
            document.storeToURL(
                uno.systemPathToFileUrl(partial_pdf),
                (property_value("FilterName", pdf_filter_for(document)),))
            os.replace(partial_pdf, input_path + ".pdf")
            write_notes(document, os.path.join(os.path.dirname(input_path), "speakernotes"), deadline)
        finally:
            document.close(True)
    finally:
        try:
            desktop.terminate()
        except Exception:
            # The office process exits while answering terminate(); the bridge then reports a dispose.
            pass


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else None)
