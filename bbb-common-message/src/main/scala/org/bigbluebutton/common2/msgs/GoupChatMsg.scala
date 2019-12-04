package org.bigbluebutton.common2.msgs

object GroupChatAccess {
  val PUBLIC = "PUBLIC_ACCESS"
  val PRIVATE = "PRIVATE_ACCESS"
}

case class GroupChatUser(id: String, name: String)
case class GroupChatMsgFromUser(correlationId: String, sender: GroupChatUser, color: String, message: String)
case class GroupChatMsgToUser(id: String, timestamp: Long, correlationId: String, sender: GroupChatUser,
                              color: String, message: String)
case class GroupChatInfo(id: String, name: String, access: String, createdBy: GroupChatUser, users: Vector[GroupChatUser])

object OpenGroupChatWindowReqMsg { val NAME = "OpenGroupChatWindowReqMsg" }
case class OpenGroupChatWindowReqMsg(header: BbbClientMsgHeader, body: OpenGroupChatWindowReqMsgBody) extends StandardMsg
case class OpenGroupChatWindowReqMsgBody()

object OpenGroupChatWindowEvtMsg { val NAME = "OpenGroupChatWindowEvtMsg" }
case class OpenGroupChatWindowEvtMsg(header: BbbClientMsgHeader, body: OpenGroupChatWindowEvtMsgBody) extends StandardMsg
case class OpenGroupChatWindowEvtMsgBody(chatWindowId: String, openedBy: String)

object GetGroupChatsReqMsg { val NAME = "GetGroupChatsReqMsg" }
case class GetGroupChatsReqMsg(header: BbbClientMsgHeader, body: GetGroupChatsReqMsgBody) extends StandardMsg
case class GetGroupChatsReqMsgBody()

object GetGroupChatsRespMsg { val NAME = "GetGroupChatsRespMsg" }
case class GetGroupChatsRespMsg(header: BbbClientMsgHeader, body: GetGroupChatsRespMsgBody) extends BbbCoreMsg
case class GetGroupChatsRespMsgBody(chats: Vector[GroupChatInfo])

object GetGroupChatMsgsReqMsg { val NAME = "GetGroupChatMsgsReqMsg" }
case class GetGroupChatMsgsReqMsg(header: BbbClientMsgHeader, body: GetGroupChatMsgsReqMsgBody) extends StandardMsg
case class GetGroupChatMsgsReqMsgBody(chatId: String)

object GetGroupChatMsgsRespMsg { val NAME = "GetGroupChatMsgsRespMsg" }
case class GetGroupChatMsgsRespMsg(header: BbbClientMsgHeader, body: GetGroupChatMsgsRespMsgBody) extends BbbCoreMsg
case class GetGroupChatMsgsRespMsgBody(chatId: String, msgs: Vector[GroupChatMsgToUser])

object CreateGroupChatReqMsg { val NAME = "CreateGroupChatReqMsg" }
case class CreateGroupChatReqMsg(header: BbbClientMsgHeader, body: CreateGroupChatReqMsgBody) extends StandardMsg
case class CreateGroupChatReqMsgBody(correlationId: String, name: String, access: String,
                                     users: Vector[String], msg: Vector[GroupChatMsgFromUser])

object GroupChatCreatedEvtMsg { val NAME = "GroupChatCreatedEvtMsg" }
case class GroupChatCreatedEvtMsg(header: BbbClientMsgHeader, body: GroupChatCreatedEvtMsgBody) extends BbbCoreMsg
case class GroupChatCreatedEvtMsgBody(correlationId: String, chatId: String, createdBy: GroupChatUser,
                                      name: String, access: String,
                                      users: Vector[GroupChatUser], msg: Vector[GroupChatMsgToUser])

object DestroyGroupChatReqMsg { val NAME = "DestroyGroupChatReqMsg" }
case class DestroyGroupChatReqMsg(header: BbbClientMsgHeader, body: DestroyGroupChatReqMsgBody) extends StandardMsg
case class DestroyGroupChatReqMsgBody(chats: Vector[String])

object GroupChatDestroyedEvtMsg { val NAME = "GroupChatDestroyedEvtMsg" }
case class GroupChatDestroyedEvtMsg(header: BbbClientMsgHeader, body: GroupChatDestroyedEvtMsgBody) extends BbbCoreMsg
case class GroupChatDestroyedEvtMsgBody(requesterId: String, chatId: String)

object ChangeGroupChatAccessReqMsg { val NAME = "ChangeGroupChatAccessReqMsg" }
case class ChangeGroupChatAccessReqMsg(header: BbbClientMsgHeader, body: ChangeGroupChatAccessReqMsgBody) extends StandardMsg
case class ChangeGroupChatAccessReqMsgBody(chatId: String, publicChat: Boolean)

object GroupChatAccessChangedEvtMsg { val NAME = "GroupChatAccessChangedEvtMsg" }
case class GroupChatAccessChangedEvtMsg(header: BbbClientMsgHeader, body: GroupChatAccessChangedEvtMsgBody) extends BbbCoreMsg
case class GroupChatAccessChangedEvtMsgBody(requesterId: String, chatId: String, public: Boolean)

object GroupChatAddUserReqMsg { val NAME = "GroupChatAddUserReqMsg" }
case class GroupChatAddUserReqMsg(header: BbbClientMsgHeader, body: GroupChatAddUserReqMsgBody) extends StandardMsg
case class GroupChatAddUserReqMsgBody(chats: Vector[String])

object GroupChatUserAddedEvtMsg { val NAME = "GroupChatUserAddedEvtMsg" }
case class GroupChatUserAddedEvtMsg(header: BbbClientMsgHeader, body: GroupChatUserAddedEvtMsgBody) extends BbbCoreMsg
case class GroupChatUserAddedEvtMsgBody(requesterId: String, chats: Vector[GroupChatUser])

object GroupChatRemoveUserReqMsg { val NAME = "GroupChatRemoveUserReqMsg" }
case class GroupChatRemoveUserReqMsg(header: BbbClientMsgHeader, body: GroupChatRemoveUserReqMsgBody) extends StandardMsg
case class GroupChatRemoveUserReqMsgBody(chats: Vector[String])

object GroupChatUserRemovedEvtMsg { val NAME = "GroupChatUserRemovedEvtMsg" }
case class GroupChatUserRemovedEvtMsg(header: BbbClientMsgHeader, body: GroupChatUserRemovedEvtMsgBody) extends BbbCoreMsg
case class GroupChatUserRemovedEvtMsgBody(requesterId: String, chats: Vector[String])

object SendGroupChatMessageMsg { val NAME = "SendGroupChatMessageMsg" }
case class SendGroupChatMessageMsg(header: BbbClientMsgHeader, body: SendGroupChatMessageMsgBody) extends StandardMsg
case class SendGroupChatMessageMsgBody(chatId: String, msg: GroupChatMsgFromUser)

object GroupChatMessageBroadcastEvtMsg { val NAME = "GroupChatMessageBroadcastEvtMsg" }
case class GroupChatMessageBroadcastEvtMsg(header: BbbClientMsgHeader, body: GroupChatMessageBroadcastEvtMsgBody) extends BbbCoreMsg
case class GroupChatMessageBroadcastEvtMsgBody(chatId: String, msg: GroupChatMsgToUser)

object UserTypingPubMsg { val NAME = "UserTypingPubMsg" }
case class UserTypingPubMsg(header: BbbClientMsgHeader, body: UserTypingPubMsgBody) extends StandardMsg
case class UserTypingPubMsgBody(chatId: String)

// html5 client only
object SyncGetGroupChatsRespMsg { val NAME = "SyncGetGroupChatsRespMsg" }
case class SyncGetGroupChatsRespMsg(header: BbbClientMsgHeader, body: SyncGetGroupChatsRespMsgBody) extends BbbCoreMsg
case class SyncGetGroupChatsRespMsgBody(chats: Vector[GroupChatInfo])

object SyncGetGroupChatMsgsRespMsg { val NAME = "SyncGetGroupChatMsgsRespMsg" }
case class SyncGetGroupChatMsgsRespMsg(header: BbbClientMsgHeader, body: SyncGetGroupChatMsgsRespMsgBody) extends BbbCoreMsg
case class SyncGetGroupChatMsgsRespMsgBody(chatId: String, msgs: Vector[GroupChatMsgToUser])
