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
}
