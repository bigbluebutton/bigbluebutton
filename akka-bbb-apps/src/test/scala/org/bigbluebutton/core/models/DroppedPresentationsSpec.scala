package org.bigbluebutton.core.models

import org.scalatest.flatspec.AnyFlatSpec

class DroppedPresentationsSpec extends AnyFlatSpec {

  it should "contain only presentations that were added" in {
    val dropped = new DroppedPresentations
    assert(!dropped.contains("p1"))
    dropped.add("p1")
    assert(dropped.contains("p1"))
    assert(!dropped.contains("p2"))
  }

  it should "tolerate adding the same presentation twice" in {
    val dropped = new DroppedPresentations
    dropped.add("p1")
    dropped.add("p1")
    assert(dropped.contains("p1"))
  }

  it should "forget the oldest presentation beyond MaxEntries" in {
    val dropped = new DroppedPresentations
    (0 to DroppedPresentations.MaxEntries).foreach(i => dropped.add(s"p$i"))
    assert(!dropped.contains("p0"))
    assert(dropped.contains("p1"))
    assert(dropped.contains(s"p${DroppedPresentations.MaxEntries}"))
  }

  it should "not count a presentation added twice against MaxEntries" in {
    val dropped = new DroppedPresentations
    dropped.add("p0")
    (1 to DroppedPresentations.MaxEntries).foreach(_ => dropped.add("p1"))
    assert(dropped.contains("p0"))
  }

  it should "accept a generated presentation id" in {
    assert(DroppedPresentations.isPresentationId("0123456789abcdef0123456789abcdef01234567-1793037924284"))
  }

  it should "reject anything else as a presentation id" in {
    assert(!DroppedPresentations.isPresentationId(""))
    assert(!DroppedPresentations.isPresentationId("not-a-presentation-id"))
    assert(!DroppedPresentations.isPresentationId("0123456789ABCDEF0123456789abcdef01234567-1793037924284"))
    assert(!DroppedPresentations.isPresentationId("0123456789abcdef0123456789abcdef01234567-1793037924284x"))
  }
}
