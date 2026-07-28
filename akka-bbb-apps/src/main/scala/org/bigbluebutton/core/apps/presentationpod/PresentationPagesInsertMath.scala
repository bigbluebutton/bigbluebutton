package org.bigbluebutton.core.apps.presentationpod

/**
 * Pure page-number arithmetic for splicing a converted presentation into a target presentation at a
 * 1-based position. bbb-web has already clamped the position to [1, targetTotal + 1], so these
 * functions only translate logical page numbers; they do not clamp.
 */
object PresentationPagesInsertMath {

  /** Clamps a 1-based insert position to the append slot after the target's last page. */
  def clampedInsertPosition(rawPosition: Int, targetPageCount: Int): Int =
    math.min(rawPosition, targetPageCount + 1)

  /**
   * New page number for an existing target page after `insertCount` pages are inserted at
   * `position`. Pages before the position keep their number; pages at/after it shift up by
   * `insertCount`, which preserves their relative order.
   */
  def shiftedTargetPageNum(currentNum: Int, position: Int, insertCount: Int): Int =
    if (currentNum >= position) currentNum + insertCount else currentNum

  /**
   * New page number for a 1-based page of the inserted presentation placed at `position`. Inserted
   * page 1 lands on `position`, page 2 on `position + 1`, and so on.
   */
  def insertedPageNum(insertPageNum: Int, position: Int): Int =
    position + (insertPageNum - 1)
}
