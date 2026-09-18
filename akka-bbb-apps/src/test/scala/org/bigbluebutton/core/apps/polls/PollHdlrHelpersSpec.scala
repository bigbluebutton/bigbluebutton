package org.bigbluebutton.core.apps.polls

import org.scalatest.flatspec.AnyFlatSpec

// Exercises the answer-id bounds filter that keeps a malformed poll vote from
// reaching the indexed answer access in the handler (which would crash the
// meeting actor) or the poll_response foreign key on persistence. The logic
// lives in the PollHdlrHelpers object so it can be tested in isolation, without
// standing up a LiveMeeting / MessageBus / poll fixtures.
//
// NOTE: extends AnyFlatSpec directly rather than the shared UnitSpec, which
// currently does not compile against the resolved ScalaTest 3.2.x (UnitSpec
// still imports the pre-3.2 org.scalatest.FlatSpec / Matchers packages). Same
// choice WhiteboardModelSpec made.
class PollHdlrHelpersSpec extends AnyFlatSpec {

  import PollHdlrHelpers.selectValidAnswerIds

  // A two-option question: valid indices are 0 and 1.
  private val validAnswerIds = 0 until 2

  it should "drop an id past the last option (999)" in {
    assert(selectValidAnswerIds(Seq(999), multiResponse = false, validAnswerIds) == Seq.empty)
  }

  it should "drop a negative id (-1)" in {
    assert(selectValidAnswerIds(Seq(-1), multiResponse = false, validAnswerIds) == Seq.empty)
  }

  it should "drop Int.MaxValue without an index-out-of-bounds crash" in {
    assert(selectValidAnswerIds(Seq(2147483647), multiResponse = false, validAnswerIds) == Seq.empty)
  }

  it should "keep a valid id (0)" in {
    assert(selectValidAnswerIds(Seq(0), multiResponse = false, validAnswerIds) == Seq(0))
  }

  it should "return empty for an empty vote (no-op)" in {
    assert(selectValidAnswerIds(Seq.empty, multiResponse = false, validAnswerIds) == Seq.empty)
  }

  it should "keep every valid id when the question is multi-response" in {
    assert(selectValidAnswerIds(Seq(0, 1), multiResponse = true, validAnswerIds) == Seq(0, 1))
  }

  it should "keep only the first id when the question is single-response" in {
    assert(selectValidAnswerIds(Seq(0, 1), multiResponse = false, validAnswerIds) == Seq(0))
  }

  it should "drop a single-response vote whose first id is out of range" in {
    // Single-response keeps only the head, then bounds-filters it: an
    // out-of-range head leaves nothing, it does not fall through to a later id.
    assert(selectValidAnswerIds(Seq(999, 0), multiResponse = false, validAnswerIds) == Seq.empty)
  }

  it should "drop every id when the question has no answers (empty valid range)" in {
    // Mirrors the handler's answers=None path: with no answer options the valid
    // range is empty, so nothing survives the filter.
    val noOptions = 0 until 0
    assert(selectValidAnswerIds(Seq(0, 1, 999), multiResponse = true, noOptions) == Seq.empty)
  }

  it should "collapse duplicate valid ids on a multi-response vote" in {
    assert(selectValidAnswerIds(Seq(1, 1, 0), multiResponse = true, validAnswerIds) == Seq(1, 0))
  }
}
