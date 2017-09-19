package org.bigbluebutton.core.models

import org.bigbluebutton.core.{ UnitSpec }

class GroupsChatTests extends UnitSpec {

  "A GroupChat" should "be able to add and remove user" in {
    val gcId = "gc-id"
    val chatName = "Public"
    val userId = "uid-1"

    val gc = GroupChatFactory.create(gcId, chatName, open = true, userId)
    val user = GroupChatUser(userId, "User 1")
    val gc2 = gc.add(user)
    assert(gc2.users.size == 1)

    val gc3 = gc2.add(GroupChatUser("user-2", "User 2"))
    assert(gc3.users.size == 2)

    val gc4 = gc3.remove(userId)
    assert(!gc4.users.contains(userId))
    assert(gc4.users.size == 1)
  }

  "A GroupChat" should "be able to add, update, and remove msg" in {
    val gcId = "gc-id"
    val chatName = "Public"
    val userId = "uid-1"
    val gc = GroupChatFactory.create(gcId, chatName, open = true, userId)
    val msgId1 = "msgid-1"
    val ts = System.currentTimeMillis()
    val hello = "Hello World!"
    val msg1 = GroupChatMessage(id = msgId1, createdOn = ts, updatedOn = ts, sender = userId,
      font = "arial", size = 14, color = "red", message = hello)
    val gc2 = gc.add(msg1)

    assert(gc2.msgs.size == 1)

    val msgId2 = "msgid-2"
    val foo = "Foo bar"
    val now = System.currentTimeMillis()
    val msg2 = GroupChatMessage(id = msgId2, createdOn = now, updatedOn = now, sender = userId,
      font = "arial", size = 14, color = "red", message = foo)
    val gc3 = gc2.add(msg2)

    assert(gc3.msgs.size == 2)

    val baz = "Foo baz"
    val now2 = System.currentTimeMillis()
    val msg3 = GroupChatMessage(id = msgId2, createdOn = now2, updatedOn = now2, sender = userId,
      font = "arial", size = 14, color = "red", message = baz)
    val gc4 = gc3.update(msg3)

    gc4.msgs.get(msgId2) match {
      case Some(m) => assert(m.message == baz)
      case None    => fail("Could not find message with id=" + msgId2)
    }
  }

}
