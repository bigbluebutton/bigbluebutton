package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.core.UnitSpec
import org.bigbluebutton.core.models._

class GroupChatAppSpec extends UnitSpec {

  "pinGroupChatMessage" should "evict oldest pinned message when limit reached and add the new pin" in {
    val chat = GroupChat(id = "chat1", access = "PUBLIC", createdBy = GroupChatUser("system"), users = Vector.empty, msgs = Vector.empty, pinnedMessageIds = Vector("m1","m2","m3"))
    val chats = GroupChats(Map(chat.id -> chat))

    val msg = GroupChatMessage(id = "m4", timestamp = 0L, correlationId = "c4", createdOn = 0L, updatedOn = 0L,
      sender = GroupChatUser("u1"), chatEmphasizedText = false, message = "four", messageAsHtml = "four", replyToMessageId = "", messageType = "default", metadata = Map())

    val (updatedChats, evictedOpt) = GroupChatApp.pinGroupChatMessage("meeting1", chat, chats, msg, "u1", 3)

    val updated = updatedChats.find("chat1").get
    updated.pinnedMessageIds shouldBe Vector("m2","m3","m4")
    evictedOpt shouldBe Some("m1")
  }

  it should "do nothing when pinning a message that's already pinned" in {
    val chat = GroupChat(id = "chat1", access = "PUBLIC", createdBy = GroupChatUser("system"), users = Vector.empty, msgs = Vector.empty, pinnedMessageIds = Vector("m1","m2"))
    val chats = GroupChats(Map(chat.id -> chat))

    val msg = GroupChatMessage(id = "m2", timestamp = 0L, correlationId = "c2", createdOn = 0L, updatedOn = 0L,
      sender = GroupChatUser("u1"), chatEmphasizedText = false, message = "two", messageAsHtml = "two", replyToMessageId = "", messageType = "default", metadata = Map())

    val (updatedChats, evictedOpt) = GroupChatApp.pinGroupChatMessage("meeting1", chat, chats, msg, "u1", 3)

    val updated = updatedChats.find("chat1").get
    updated.pinnedMessageIds shouldBe Vector("m1","m2")
    evictedOpt shouldBe None
  }

}
