package org.bigbluebutton.core.apps

import org.bigbluebutton.core.UnitSpec
import org.bigbluebutton.core.apps.presentationpod.PresentationPagesInsertMath

class PresentationPagesInsertMathSpec extends UnitSpec {

  it should "leave target pages before the insert position unchanged" in {
    assert(PresentationPagesInsertMath.shiftedTargetPageNum(1, 2, 2) == 1)
  }

  it should "shift target pages at or after the insert position up by insertCount" in {
    // Inserting 2 pages at position 2 into pages [1,2,3]: page 1 stays, pages 2 and 3 become 4 and 5.
    assert(PresentationPagesInsertMath.shiftedTargetPageNum(2, 2, 2) == 4)
    assert(PresentationPagesInsertMath.shiftedTargetPageNum(3, 2, 2) == 5)
  }

  it should "preserve the relative order of shifted target pages" in {
    val position = 2
    val insertCount = 3
    val shifted = Seq(2, 3, 4).map(PresentationPagesInsertMath.shiftedTargetPageNum(_, position, insertCount))
    assert(shifted == Seq(5, 6, 7))
    assert(shifted == shifted.sorted)
  }

  it should "map inserted pages onto the freed slots starting at position" in {
    // 2 inserted pages placed at position 2 land on 2 and 3.
    assert(PresentationPagesInsertMath.insertedPageNum(1, 2) == 2)
    assert(PresentationPagesInsertMath.insertedPageNum(2, 2) == 3)
  }

  it should "prepend inserted pages when position is 1" in {
    assert(PresentationPagesInsertMath.insertedPageNum(1, 1) == 1)
    assert(PresentationPagesInsertMath.insertedPageNum(2, 1) == 2)
  }

  it should "produce a contiguous non-overlapping page set for a full splice" in {
    // Target [1,2,3] + 2 inserted at position 2 -> shifted {1,4,5} plus inserted {2,3} = 1..5.
    val position = 2
    val insertCount = 2
    val shifted = Seq(1, 2, 3).map(PresentationPagesInsertMath.shiftedTargetPageNum(_, position, insertCount))
    val inserted = (1 to insertCount).map(PresentationPagesInsertMath.insertedPageNum(_, position))
    val all = (shifted ++ inserted).sorted
    assert(all == Seq(1, 2, 3, 4, 5))
    assert(all.distinct == all) // no collisions
  }
}
