package org.bigbluebutton.core.models

case class GroupChats(chats: Vector[GroupChat]) {

}

case class GroupChat(id: String, name: String, open: Boolean, users: Vector[String], messages: Vector[GroupChatMsg])
case class GroupChatMsg(id: String, sender: String)
case class GroupChatMessage(msgId: String, timestamp: Long, from: UserIdAndName,
                            font: String, size: Int, color: String, message: String)
