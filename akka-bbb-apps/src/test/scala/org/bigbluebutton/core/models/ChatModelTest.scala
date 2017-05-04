package org.bigbluebutton.core.models

import org.scalatest._
import org.bigbluebutton.core.UnitSpec
import scala.collection.mutable.Stack

class ChatModelTest extends UnitSpec {

  "A Stack" should "pop values in last-in-first-out order" in {
    val stack = new Stack[Int]
    stack.push(1)
    stack.push(2)
    assert(stack.pop() === 2)
    assert(stack.pop() === 1)
  }

}
