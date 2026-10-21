package org.bigbluebutton.presentation.imp

import java.io.File
import java.nio.file.Files

import org.bigbluebutton.presentation.UploadedPresentation
import org.scalatest.flatspec.AnyFlatSpec

class SpeakerNotesExtractorTest extends AnyFlatSpec {

  private def resource(name: String): File =
    new File(getClass.getResource(s"/presentation/$name").toURI)

  private def extractedNotes(name: String): (Int, List[String]) = {
    val output = Files.createTempDirectory("speaker-notes-extractor")
    val count = SpeakerNotesExtractor.extract(resource(name), output.toFile).getAsInt
    val notes = (1 to count).map { page =>
      Files.readString(output.resolve(s"speakernotes/slide-$page.txt"))
    }.toList
    (count, notes)
  }

  it should "extract PPTX notes in visible slide order" in {
    val (count, notes) = extractedNotes("speaker-notes.pptx")

    assert(count == 11)
    assert(notes.head == "First paragraph\nSecond paragraph")
    assert(notes(1).isEmpty)
    assert(!notes.exists(_.contains("Hidden note")))
  }

  it should "extract ODP notes in visible slide order" in {
    val (count, notes) = extractedNotes("speaker-notes.odp")

    assert(count == 11)
    assert(notes.head == "First paragraph\nSecond paragraph")
    assert(notes(1).isEmpty)
    assert(!notes.exists(_.contains("Hidden note")))
  }

  it should "ignore unsupported and corrupt files without throwing" in {
    val output = Files.createTempDirectory("speaker-notes-extractor-corrupt")
    val corrupt = Files.createTempFile("speaker-notes-corrupt", ".pptx")
    Files.writeString(corrupt, "not a presentation")

    assert(SpeakerNotesExtractor.extract(corrupt.toFile, output.toFile).isEmpty)
    assert(!output.resolve("speakernotes").toFile.exists())
  }

  it should "discard notes when visible slide and PDF page counts differ" in {
    val output = Files.createTempDirectory("speaker-notes-count-mismatch")
    val notesDirectory = Files.createDirectory(output.resolve("speakernotes"))
    Files.writeString(notesDirectory.resolve("slide-1.txt"), "must be discarded")
    val convertedPdf = Files.createFile(output.resolve("converted.pdf"))
    val presentation = new UploadedPresentation("pod", "meeting", "presentation", "deck.pptx", "", true, "", false, new java.util.ArrayList[String]())
    presentation.setUploadedFile(convertedPdf.toFile)
    presentation.setSpeakerNotesVisibleSlideCount(2)
    presentation.setNumberOfPages(1)
    val processor = new PresentationFileProcessor(1)
    val method = classOf[PresentationFileProcessor].getDeclaredMethod("validateSpeakerNotesPageCount", classOf[UploadedPresentation])
    method.setAccessible(true)

    method.invoke(processor, presentation)

    assert(!notesDirectory.toFile.exists())
  }
}
