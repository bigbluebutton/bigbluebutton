package org.bigbluebutton.api2.util

import java.nio.file.Files

import org.bigbluebutton.api2.MsgBuilder
import org.scalatest.flatspec.AnyFlatSpec

class SpeakerNotesJsonReaderTest extends AnyFlatSpec {
  private def file(value: String) = {
    val path = Files.createTempFile("speaker-notes-json", ".json")
    Files.writeString(path, value)
    path
  }

  it should "accept exactly the character cap and reject one character more" in {
    assert(SpeakerNotesJsonReader.readUtf8Capped(file("x" * 8), 8).contains("x" * 8))
    assert(SpeakerNotesJsonReader.readUtf8Capped(file("x" * 9), 8).isEmpty)
  }

  it should "count decoded UTF-16 characters instead of UTF-8 bytes" in {
    val value = "é€😀"
    assert(value.length == 4)
    assert(SpeakerNotesJsonReader.readUtf8Capped(file(value), 4).contains(value))
    assert(SpeakerNotesJsonReader.readUtf8Capped(file(value + "x"), 4).isEmpty)
  }

  it should "reject missing, malformed, and oversized JSON" in {
    assert(SpeakerNotesJsonReader.readValidJson(file("{\"version\":1}"), 20).nonEmpty)
    assert(SpeakerNotesJsonReader.readValidJson(file("{"), 20).isEmpty)
    assert(SpeakerNotesJsonReader.readValidJson(file("{\"version\":1}"), 3).isEmpty)
    assert(SpeakerNotesJsonReader.readUtf8Capped(file("missing").resolveSibling("absent"), 20).isEmpty)
  }

  it should "keep plain notes when structured JSON is malformed or oversized" in {
    val root = Files.createTempDirectory("speaker-notes-page")
    val notes = Files.createDirectories(root.resolve("speakernotes"))
    Files.writeString(notes.resolve("slide-1.txt"), "plain fallback")
    Files.writeString(notes.resolve("slide-1.json"), "x" * (SpeakerNotesJsonReader.DefaultCap + 1))

    val oversized = MsgBuilder.generatePresentationPage("presentation", "/presentation", root.toString, 1)
    assert(oversized.speakerNotes == "plain fallback")
    assert(oversized.speakerNotesJson.isEmpty)

    Files.writeString(notes.resolve("slide-1.json"), "{")
    val malformed = MsgBuilder.generatePresentationPage("presentation", "/presentation", root.toString, 1)
    assert(malformed.speakerNotes == "plain fallback")
    assert(malformed.speakerNotesJson.isEmpty)
  }
}
