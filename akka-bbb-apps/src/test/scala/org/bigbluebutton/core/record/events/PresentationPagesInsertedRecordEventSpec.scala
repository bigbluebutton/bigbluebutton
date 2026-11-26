package org.bigbluebutton.core.record.events

import org.scalatest.flatspec.AnyFlatSpec

class PresentationPagesInsertedRecordEventSpec extends AnyFlatSpec {

  "PresentationPagesInsertedRecordEvent" should "record every page id of the presentation, in page order" in {
    val ev = new PresentationPagesInsertedRecordEvent()
    ev.setMeetingId("meeting-1")
    ev.setPodId("DEFAULT_PRESENTATION_POD")
    ev.setPresentationName("presentation-1")
    ev.setPageIds(Vector("c3", "a1", "b2"))

    val map = ev.toMap()
    assert(map("eventName") == "PresentationPagesInsertedEvent")
    assert(map("module") == "PRESENTATION")
    assert(map("meetingId") == "meeting-1")
    assert(map("podId") == "DEFAULT_PRESENTATION_POD")
    assert(map("presentationName") == "presentation-1")
    assert(map("pageIds") == "c3,a1,b2")
  }
}
