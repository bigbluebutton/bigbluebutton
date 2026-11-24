package org.bigbluebutton.api2.util

import java.nio.file.Files

import org.bigbluebutton.api2.MsgBuilder
import org.scalatest.flatspec.AnyFlatSpec

class SlideTitleTest extends AnyFlatSpec {
  it should "read the slide title saved next to the speaker notes" in {
    val root = Files.createTempDirectory("slide-title-page")
    val notes = Files.createDirectories(root.resolve("speakernotes"))
    Files.writeString(notes.resolve("slide-1.txt"), "Notes")
    Files.writeString(notes.resolve("slide-1.title.txt"), "Today’s Agenda")

    val page = MsgBuilder.generatePresentationPage("conference", "room", "presentation", "/presentation", root.toString, 1)
    assert(page.slideTitle == "Today’s Agenda")
  }

  it should "leave the title empty when no title was saved" in {
    val root = Files.createTempDirectory("slide-title-missing")
    Files.createDirectories(root.resolve("speakernotes"))

    val page = MsgBuilder.generatePresentationPage("conference", "room", "presentation", "/presentation", root.toString, 1)
    assert(page.slideTitle == "")
  }
}
