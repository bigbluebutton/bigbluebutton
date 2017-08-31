package org.bigbluebutton.core.models

import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.{ AppsTestFixtures, UnitSpec }
import scala.collection.immutable.List

class ChatModelTest extends UnitSpec with AppsTestFixtures {

  "A Stack" should "pop values in last-in-first-out order" in {
    var stack = List[Int]()
    stack = stack :+ 1
    stack = stack :+ 2
    assert(stack.length === 2)
    stack = stack.dropRight(1)
    assert(stack.length === 1)
    assert(stack.contains(1))
  }

}
