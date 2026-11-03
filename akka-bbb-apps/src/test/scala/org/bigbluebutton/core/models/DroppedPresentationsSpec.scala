package org.bigbluebutton.core.models

import org.scalatest.flatspec.AnyFlatSpec

class DroppedPresentationsSpec extends AnyFlatSpec {

  it should "contain only presentations that were added" in {
    val dropped = new DroppedPresentations
    assert(!dropped.contains("p1"))
    dropped.addRefused("p1")
    dropped.addRemoved("p2")
    assert(dropped.contains("p1"))
    assert(dropped.contains("p2"))
    assert(!dropped.contains("p3"))
  }

  it should "tolerate adding the same presentation twice" in {
    val dropped = new DroppedPresentations
    dropped.addRefused("p1")
    dropped.addRefused("p1")
    assert(dropped.contains("p1"))
  }

  it should "forget the oldest presentation beyond MaxEntries" in {
    val dropped = new DroppedPresentations
    (0 to DroppedPresentations.MaxEntries).foreach(i => dropped.addRemoved(s"p$i"))
    assert(!dropped.contains("p0"))
    assert(dropped.contains("p1"))
    assert(dropped.contains(s"p${DroppedPresentations.MaxEntries}"))
  }

  it should "not count a presentation added twice against MaxEntries" in {
    val dropped = new DroppedPresentations
    dropped.addRemoved("p0")
    (1 to DroppedPresentations.MaxEntries).foreach(_ => dropped.addRemoved("p1"))
    assert(dropped.contains("p0"))
  }

  it should "not let removals push out a refused presentation" in {
    val dropped = new DroppedPresentations
    dropped.addRefused("refused")
    (0 to DroppedPresentations.MaxEntries).foreach(i => dropped.addRemoved(s"p$i"))
    assert(dropped.contains("refused"))
  }
}
