package org.bigbluebutton.core.models

import org.bigbluebutton.common2.msgs.{ GroupChatAccess, GroupChatUser }
import org.bigbluebutton.core.UnitSpec

class GroupsChatTests extends UnitSpec {

  "A GroupChat" should "be able to add and remove user" in {
    val gcId = "gc-id"
    val chatName = "Public"
    val userId = "uid-1"
    val createBy = GroupChatUser("groupId", "groupname")
    val gc = GroupChatFactory.create(gcId, chatName, GroupChatAccess.PUBLIC, createBy, Vector.empty, Vector.empty)
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
    val createBy = GroupChatUser("groupId", "groupname")
    val gcId = "gc-id"
    val chatName = "Public"
    val gc = GroupChatFactory.create(gcId, chatName, GroupChatAccess.PUBLIC, createBy, Vector.empty, Vector.empty)
    val msgId1 = "msgid-1"
    val ts = System.currentTimeMillis()
    val hello = "Hello World!"

    val msg1 = GroupChatMessage(id = msgId1, timestamp = ts, correlationId = "cordId1", createdOn = ts,
      updatedOn = ts, sender = createBy, color = "red", message = hello)
    val gc2 = gc.add(msg1)

    assert(gc2.msgs.size == 1)

    val msgId2 = "msgid-2"
    val foo = "Foo bar"
    val ts2 = System.currentTimeMillis()
    val msg2 = GroupChatMessage(id = msgId2, timestamp = ts2, correlationId = "cordId2", createdOn = ts2,
      updatedOn = ts2, sender = createBy, color = "red", message = foo)
    val gc3 = gc2.add(msg2)

    assert(gc3.msgs.size == 2)

    val baz = "Foo baz"
    val msgId3 = "msgid-3"
    val ts3 = System.currentTimeMillis()
    val msg3 = GroupChatMessage(id = msgId3, timestamp = ts3, correlationId = "cordId3", createdOn = ts3,
      updatedOn = ts3, sender = createBy, color = "red", message = baz)
    val gc4 = gc3.update(msg3)

    gc4.findMsgWithId(msgId3) match {
      case Some(m) => assert(m.message == baz)
      case None    => fail("Could not find message with id=" + msgId3)
    }
  }

}
