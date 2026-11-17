# Converts a presentation to PDF and saves the speaker notes of every visible
# slide, in a single LibreOffice run.
#
# Usage: python speaker-notes.py <uno pipe name> <input file>
#
# Writes <input file>.pdf, then <dir of input file>/speakernotes/slide-N.txt
# (UTF-8), where N is the page number of the visible slide in the PDF. Hidden
# slides are neither exported nor counted. A failure while reading notes
# removes the notes directory but keeps the PDF; the exit code is non-zero only
# when the PDF could not be written.
import os
import shutil
import sys
import time

import uno
from com.sun.star.beans import PropertyValue

MAX_NOTE_CHARS = 1024 * 1024
CONNECT_TIMEOUT_SECONDS = 30
NOTES_SHAPE = "com.sun.star.presentation.NotesShape"
PDF_FILTERS = (
    ("com.sun.star.presentation.PresentationDocument", "impress_pdf_Export"),
    ("com.sun.star.drawing.DrawingDocument", "draw_pdf_Export"),
    ("com.sun.star.text.TextDocument", "writer_pdf_Export"),
    ("com.sun.star.sheet.SpreadsheetDocument", "calc_pdf_Export"),
)


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


def notes_text(slide):
    notes_page = slide.NotesPage
    texts = []
    for index in range(notes_page.Count):
        shape = notes_page.getByIndex(index)
        if shape.ShapeType == NOTES_SHAPE:
            texts.append(shape.getString())
    text = "\n".join(texts).replace("\r\n", "\n").replace("\r", "\n").strip()
    return text[:MAX_NOTE_CHARS]


def write_notes(document, notes_dir):
    if not document.supportsService("com.sun.star.presentation.PresentationDocument"):
        return
    try:
        os.makedirs(notes_dir)
        page_number = 0
        slides = document.DrawPages
        for index in range(slides.Count):
            slide = slides.getByIndex(index)
            if not slide.Visible:
                continue
            page_number += 1
            path = os.path.join(notes_dir, "slide-%d.txt" % page_number)
            with open(path, "w", encoding="utf-8") as notes_file:
                notes_file.write(notes_text(slide))
    except Exception as exception:
        shutil.rmtree(notes_dir, ignore_errors=True)
        print("Could not save speaker notes: %s" % type(exception).__name__, file=sys.stderr)


def main(pipe_name, input_path):
    context = connect(pipe_name)
    desktop = context.ServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop", context)
    try:
        document = desktop.loadComponentFromURL(
            uno.systemPathToFileUrl(input_path), "_blank", 0,
            (property_value("Hidden", True), property_value("ReadOnly", True)))
        if document is None:
            raise ValueError("Document could not be loaded")
        try:
            document.storeToURL(
                uno.systemPathToFileUrl(input_path + ".pdf"),
                (property_value("FilterName", pdf_filter_for(document)),))
            write_notes(document, os.path.join(os.path.dirname(input_path), "speakernotes"))
        finally:
            document.close(True)
    finally:
        try:
            desktop.terminate()
        except Exception:
            # The office process exits while answering terminate(); the bridge then reports a dispose.
            pass


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
