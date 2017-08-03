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

    // Add a message and check that there is only one message
    dc.append(dm)
    assert(dc.messages.length == 1)

    // Add another message and check that there are two messages
    dc.append(dm)
    assert(dc.messages.length == 2)

    // Find the direct chat
    val dc2 = DirectChats.find(between, directChats)
    dc2 match {
      case Some(directChat) => assert(directChat.messages.length == 2)
      case None             => fail("No direct chat found!")
    }

    // Append a third message and make sure there are three messages
    dc.append(dm)
    assert(dc.messages.length == 3)

    // Check that we are updating the correct direct chat in the model.
    val dc3 = DirectChats.find(between, directChats)
    dc3 match {
      case Some(directChat) => assert(directChat.messages.length == 3)
      case None             => fail("No direct chat found!")
    }

  }

}
