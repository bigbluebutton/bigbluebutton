package org.bigbluebutton.core.models

import org.scalatest.flatspec.AnyFlatSpec

// Extends AnyFlatSpec directly, like PollHdlrHelpersSpec: the shared UnitSpec does not
// compile against the resolved ScalaTest 3.2.x.
class PollShapeSizeSpec extends AnyFlatSpec {

  // The default slide (16:9) scaled to the whiteboard.
  private val slideWidth = 1440.0
  private val slideHeight = 810.0

  it should "keep the base size for a short question and three answers" in {
    assert(Polls.pollShapeSize(20, 3, slideWidth, slideHeight) == ((300, 200)))
  }

  it should "grow with a long question and with every answer past three" in {
    // 500 characters: 600 wide, 6 extra lines of 45 and 2 extra answers of 40.
    assert(Polls.pollShapeSize(500, 5, slideWidth, slideHeight) == ((600, 550)))
  }

  it should "never grow past the slide" in {
    assert(Polls.pollShapeSize(1200, 5, slideWidth, slideHeight) == ((600, 810)))
    assert(Polls.pollShapeSize(1200, 5, 500.0, 400.0) == ((500, 400)))
  }
}
