package org.bigbluebutton.core.models

import org.bigbluebutton.common2.domain.{ SimplePollResultOutVO, SimpleVoteOutVO }
import org.scalatest.flatspec.AnyFlatSpec

class PollResultShapeSpec extends AnyFlatSpec {

  private val result = SimplePollResultOutVO("poll-1", "YN", Some("Ready?"),
    Array(SimpleVoteOutVO(0, "Yes", 2, isCorrectAnswer = false)), quiz = false, None, 2, 2)

  private val page = PresentationPage(id = "3f2b8c1e-5d4a-4f6b-9c7d-0e1a2b3c4d5e", num = 4, urls = Map.empty, content = "")

  behavior of "Polls.pollResultToWhiteboardShape"

  it should "make the page itself the parent of the shape, not its position" in {
    val shape = Polls.pollResultToWhiteboardShape(result, page, "pres-1", quiz = false, showAnswer = false)
    assert(shape("parentId") == "page:3f2b8c1e-5d4a-4f6b-9c7d-0e1a2b3c4d5e")
  }

  it should "put the presentation of the page in meta" in {
    val shape = Polls.pollResultToWhiteboardShape(result, page, "pres-1", quiz = false, showAnswer = false)
    assert(shape("meta") == Map("presentationId" -> "pres-1"))
  }

  it should "keep the shape id stamped from the poll" in {
    val shape = Polls.pollResultToWhiteboardShape(result, page, "pres-1", quiz = false, showAnswer = false)
    assert(shape("id") == "shape:poll-result-poll-1")
  }
}
