package org.bigbluebutton.core.models

import org.bigbluebutton.core.UnitSpec

class DirectChatModelTest extends UnitSpec {

  "A DirectChat" should "be able to add a message" in {
    val msg = ChatMessage("arial", 10, "red", "Hello")
    val from = UserIdAndName("user1", "User 1")
    val to = UserIdAndName("user2", "User 2")
    val dm = new DirectChatMessage("msgId", System.currentTimeMillis(), from, to, msg)

    val between = Set("user1", "user2")
    val directChats = new DirectChats()
    val dc = DirectChats.create(between, directChats)
    val dm2 = dc.append(dm)
    assert(dc.messages.length == 1)

    val dm3 = dc.append(dm)
    assert(dc.messages.length == 2)

    val dc2 = DirectChats.find(between, directChats)
    dc2 match {
      case Some(directChat) => assert(directChat.messages.length == 2)
      case None => fail("No direct chat found!")
    }

    val dm4 = dc.append(dm)
    assert(dc.messages.length == 3)

    val dc3 = DirectChats.find(between, directChats)
    dc3 match {
      case Some(directChat) => assert(directChat.messages.length == 3)
      case None => fail("No direct chat found!")
    }

  }

}
