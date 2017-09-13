package org.bigbluebutton.common2.msgs

object GroupChatAccess {
  val PUBLIC = "PUBLIC_ACCESS"
  val PRIVATE = "PRIVATE_ACCESS"
}

case class GroupChatUser(id: String, name: String)

case class GroupChatMsgFromUser(correlationId: String, sender: GroupChatUser,
                                font: String, size: Int, color: String, message: String)
case class GroupChatMsgToUser(id: String, timestamp: Long, sender: GroupChatUser,
                              font: String, size: Int, color: String, message: String)
case class GroupChatInfo(id: String, name: String, access: String, createdBy: GroupChatUser)


object GetGroupChatsReqMsg { val NAME = "GetGroupChatsReqMsg"}
case class GetGroupChatsReqMsg(header: BbbClientMsgHeader, body: GetGroupChatsReqMsgBody) extends StandardMsg
case class GetGroupChatsReqMsgBody(requesterId: String)

object GetGroupChatsRespMsg { val NAME = "GetGroupChatsRespMsg"}
case class GetGroupChatsRespMsg(header: BbbClientMsgHeader, body: GetGroupChatsRespMsgBody) extends BbbCoreMsg
case class GetGroupChatsRespMsgBody(requesterId: String, publicChats: Vector[GroupChatInfo], privateChats: Vector[GroupChatInfo])

object GetGroupChatMsgsReqMsg { val NAME = "GetGroupChatMsgsReqMsg"}
case class GetGroupChatMsgsReqMsg(header: BbbClientMsgHeader, body: GetGroupChatMsgsReqMsgBody) extends StandardMsg
case class GetGroupChatMsgsReqMsgBody(requesterId: String, chatId: String)

object GetGroupChatMsgsRespMsg { val NAME = "GetGroupChatMsgsRespMsg"}
case class GetGroupChatMsgsRespMsg(header: BbbClientMsgHeader, body: GetGroupChatMsgsRespMsgBody) extends BbbCoreMsg
case class GetGroupChatMsgsRespMsgBody(requesterId: String, msgs: Vector[GroupChatMsgToUser])

object CreateGroupChatReqMsg { val NAME = "CreateGroupChatReqMsg"}
case class CreateGroupChatReqMsg(header: BbbClientMsgHeader, body: CreateGroupChatReqMsgBody) extends StandardMsg
case class CreateGroupChatReqMsgBody(access: String, requesterId: String, name: String, correlationId: String)

object CreateGroupChatRespMsg { val NAME = "CreateGroupChatRespMsg"}
case class CreateGroupChatRespMsg(header: BbbClientMsgHeader, body: CreateGroupChatRespMsgBody) extends BbbCoreMsg
case class CreateGroupChatRespMsgBody(correlationId: String, chatId: String, name: String, access: String)

object DestroyGroupChatReqMsg { val NAME = "DestroyGroupChatReqMsg"}
case class DestroyGroupChatReqMsg(header: BbbClientMsgHeader, body: DestroyGroupChatReqMsgBody) extends StandardMsg
case class DestroyGroupChatReqMsgBody(requesterId: String, chats: Vector[String])

object GroupChatDestroyedEvtMsg { val NAME = "GroupChatDestroyedEvtMsg"}
case class GroupChatDestroyedEvtMsg(header: BbbClientMsgHeader, body: GroupChatDestroyedEvtMsgBody) extends BbbCoreMsg
case class GroupChatDestroyedEvtMsgBody(requesterId: String, chatId: String)

object ChangeGroupChatAccessReqMsg { val NAME = "ChangeGroupChatAccessReqMsg"}
case class ChangeGroupChatAccessReqMsg(header: BbbClientMsgHeader, body: ChangeGroupChatAccessReqMsgBody) extends StandardMsg
case class ChangeGroupChatAccessReqMsgBody(requesterId: String, chatId: String, publicChat: Boolean)

object GroupChatAccessChangedEvtMsg { val NAME = "GroupChatAccessChangedEvtMsg"}
case class GroupChatAccessChangedEvtMsg(header: BbbClientMsgHeader, body: GroupChatAccessChangedEvtMsgBody) extends BbbCoreMsg
case class GroupChatAccessChangedEvtMsgBody(requesterId: String, chatId: String, public: Boolean)

object GroupChatAddUserReqMsg { val NAME = "GroupChatAddUserReqMsg"}
case class GroupChatAddUserReqMsg(header: BbbClientMsgHeader, body: GroupChatAddUserReqMsgBody) extends StandardMsg
case class GroupChatAddUserReqMsgBody(requesterId: String, chats: Vector[String])

object GroupChatUserAddedEvtMsg { val NAME = "GroupChatUserAddedEvtMsg"}
case class GroupChatUserAddedEvtMsg(header: BbbClientMsgHeader, body: GroupChatUserAddedEvtMsgBody) extends BbbCoreMsg
case class GroupChatUserAddedEvtMsgBody(requesterId: String, chats: Vector[String])

object GroupChatRemoveUserReqMsg { val NAME = "GroupChatRemoveUserReqMsg"}
case class GroupChatRemoveUserReqMsg(header: BbbClientMsgHeader, body: GroupChatRemoveUserReqMsgBody) extends StandardMsg
case class GroupChatRemoveUserReqMsgBody(requesterId: String, chats: Vector[String])

object GroupChatUserRemovedEvtMsg { val NAME = "GroupChatUserRemovedEvtMsg"}
case class GroupChatUserRemovedEvtMsg(header: BbbClientMsgHeader, body: GroupChatUserRemovedEvtMsgBody) extends BbbCoreMsg
case class GroupChatUserRemovedEvtMsgBody(requesterId: String, chats: Vector[String])

object SendGroupChatMessageMsg { val NAME = "SendGroupChatMessageMsg"}
case class SendGroupChatMessageMsg(header: BbbClientMsgHeader, body: SendGroupChatMessageMsgBody) extends StandardMsg
case class SendGroupChatMessageMsgBody(chatId: String, chatMsg: GroupChatMsgFromUser)

object GroupChatMessageBroadcastEvtMsg { val NAME = "GroupChatMessageBroadcastEvtMsg"}
case class GroupChatMessageBroadcastEvtMsg(header: BbbClientMsgHeader, body: GroupChatMessageBroadcastEvtMsgBody) extends BbbCoreMsg
case class GroupChatMessageBroadcastEvtMsgBody(chatId: String, chatMsg: Vector[GroupChatMsgToUser])
