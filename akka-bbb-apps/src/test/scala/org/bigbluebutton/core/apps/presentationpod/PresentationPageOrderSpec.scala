package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.core.models.OrderChange
import org.scalatest.flatspec.AnyFlatSpec

class PresentationPageOrderSpec extends AnyFlatSpec {

  import PresentationPageOrder.numNow

  behavior of "PresentationPageOrder.numNow"

  it should "return the number unchanged when the order never changed" in {
    assert(numNow(3, 10, 10, Nil) == 3)
    assert(numNow(3, 8, 10, Nil) == 3)
  }

  it should "move a number at or after the position of a change, and keep one before it" in {
    val changes = List(OrderChange(prevTotal = 10, position = 4, count = 2))
    assert(numNow(3, 10, 12, changes) == 3)
    assert(numNow(4, 10, 12, changes) == 6)
    assert(numNow(7, 10, 12, changes) == 9)
  }

  it should "apply every change from the one whose previous total was seen" in {
    // seen 10; 3 pages entered at 2 (10 -> 13), then 1 at 4 (13 -> 14): page 3 became 6, then 7
    val changes = List(OrderChange(10, 2, 3), OrderChange(13, 4, 1))
    assert(numNow(3, 10, 14, changes) == 7)
  }

  it should "count a page moved by an earlier change against the next change" in {
    // seen 5; 1 page at 1 (5 -> 6), then 1 at 3 (6 -> 7): page 2 became 3, then 4
    val changes = List(OrderChange(5, 1, 1), OrderChange(6, 3, 1))
    assert(numNow(2, 5, 7, changes) == 4)
  }

  it should "apply only the changes made after the seen total" in {
    val changes = List(OrderChange(5, 1, 1), OrderChange(6, 3, 1))
    assert(numNow(2, 6, 7, changes) == 2)
    assert(numNow(3, 6, 7, changes) == 4)
  }

  it should "return the number unchanged for an unknown or unmatched seen total" in {
    val changes = List(OrderChange(10, 2, 3))
    assert(numNow(3, 0, 13, changes) == 3)
    assert(numNow(3, 11, 13, changes) == 3)
    assert(numNow(3, 0, 0, Nil) == 3)
  }

  it should "return the number unchanged when the seen total is the current one" in {
    assert(numNow(5, 13, 13, List(OrderChange(10, 2, 3))) == 5)
  }
}
