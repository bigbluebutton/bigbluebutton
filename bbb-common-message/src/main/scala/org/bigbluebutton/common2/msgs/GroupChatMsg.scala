package org.bigbluebutton.common2.msgs

object GroupChatAccess {
  val PUBLIC = "PUBLIC_ACCESS"
  val PRIVATE = "PRIVATE_ACCESS"
}

object GroupChatMessageType {
  val DEFAULT = "default"
  val API = "api"
  val PRESENTATION = "presentation"
  val POLL = "poll"
  val BREAKOUTROOM_MOD_MSG = "breakoutRoomModeratorMsg"
  val PUBLIC_CHAT_HIST_CLEARED = "publicChatHistoryCleared"
  val USER_AWAY_STATUS_MSG = "userAwayStatusMsg"
  val USER_IS_PRESENTER_MSG = "userIsPresenterMsg"
  val PLUGIN = "plugin"
}

case class GroupChatUser(id: String, name: String = "", role: String = "VIEWER")
case class GroupChatMsgFromUser(
    correlationId:    String,
    sender:           GroupChatUser,
    message:          String,
    replyToMessageId: String,
    metadata:         Map[String, Any] = Map.empty
)
case class GroupChatMsgToUser(
    id:                 String,
    timestamp:          Long,
    correlationId:      String,
    sender:             GroupChatUser,
    chatEmphasizedText: Boolean       = false,
    message:            String,
    replyToMessageId:   String,
)
case class GroupChatInfo(id: String, access: String, createdBy: GroupChatUser, users: Vector[GroupChatUser])

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
case class CreateGroupChatReqMsgBody(correlationId: String, access: String,
                                     users: Vector[String], msg: Vector[GroupChatMsgFromUser])

object GroupChatCreatedEvtMsg { val NAME = "GroupChatCreatedEvtMsg" }
case class GroupChatCreatedEvtMsg(header: BbbClientMsgHeader, body: GroupChatCreatedEvtMsgBody) extends BbbCoreMsg
case class GroupChatCreatedEvtMsgBody(correlationId: String, chatId: String, createdBy: GroupChatUser,
                                      access: String,
                                      users:  Vector[GroupChatUser], msg: Vector[GroupChatMsgToUser])

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

object SendGroupChatMessageFromApiSysPubMsg { val NAME = "SendGroupChatMessageFromApiSysPubMsg" }
case class SendGroupChatMessageFromApiSysPubMsg(
    header: BbbClientMsgHeader,
    body:   SendGroupChatMessageFromApiSysPubMsgBody
) extends StandardMsg
case class SendGroupChatMessageFromApiSysPubMsgBody(
    userName: String,
    message:  String
)

object GroupChatMessageBroadcastEvtMsg { val NAME = "GroupChatMessageBroadcastEvtMsg" }
case class GroupChatMessageBroadcastEvtMsg(header: BbbClientMsgHeader, body: GroupChatMessageBroadcastEvtMsgBody) extends BbbCoreMsg
case class GroupChatMessageBroadcastEvtMsgBody(chatId: String, msg: GroupChatMsgToUser)

object EditGroupChatMessageReqMsg { val NAME = "EditGroupChatMessageReqMsg" }
case class EditGroupChatMessageReqMsg(header: BbbClientMsgHeader, body: EditGroupChatMessageReqMsgBody) extends StandardMsg
case class EditGroupChatMessageReqMsgBody(chatId: String, messageId: String, message: String)

object GroupChatMessageEditedEvtMsg { val NAME = "GroupChatMessageEditedEvtMsg" }
case class GroupChatMessageEditedEvtMsg(header: BbbClientMsgHeader, body: GroupChatMessageEditedEvtMsgBody) extends BbbCoreMsg
case class GroupChatMessageEditedEvtMsgBody(chatId: String, messageId: String, message: String)

object DeleteGroupChatMessageReqMsg { val NAME = "DeleteGroupChatMessageReqMsg" }
case class DeleteGroupChatMessageReqMsg(header: BbbClientMsgHeader, body: DeleteGroupChatMessageReqMsgBody) extends StandardMsg
case class DeleteGroupChatMessageReqMsgBody(chatId: String, messageId: String)

object GroupChatMessageDeletedEvtMsg { val NAME = "GroupChatMessageDeletedEvtMsg" }
case class GroupChatMessageDeletedEvtMsg(header: BbbClientMsgHeader, body: GroupChatMessageDeletedEvtMsgBody) extends BbbCoreMsg
case class GroupChatMessageDeletedEvtMsgBody(chatId: String, messageId: String)

object SendGroupChatMessageReactionReqMsg { val NAME = "SendGroupChatMessageReactionReqMsg" }
case class SendGroupChatMessageReactionReqMsg(header: BbbClientMsgHeader, body: SendGroupChatMessageReactionReqMsgBody) extends StandardMsg
case class SendGroupChatMessageReactionReqMsgBody(chatId: String, messageId: String, reactionEmoji: String)

object GroupChatMessageReactionSentEvtMsg { val NAME = "GroupChatMessageReactionSentEvtMsg" }
case class GroupChatMessageReactionSentEvtMsg(header: BbbClientMsgHeader, body: GroupChatMessageReactionSentEvtMsgBody) extends BbbCoreMsg
case class GroupChatMessageReactionSentEvtMsgBody(chatId: String, messageId: String, reactionEmoji: String)

object DeleteGroupChatMessageReactionReqMsg { val NAME = "DeleteGroupChatMessageReactionReqMsg" }
case class DeleteGroupChatMessageReactionReqMsg(header: BbbClientMsgHeader, body: DeleteGroupChatMessageReactionReqMsgBody) extends StandardMsg
case class DeleteGroupChatMessageReactionReqMsgBody(chatId: String, messageId: String, reactionEmoji: String)

object GroupChatMessageReactionDeletedEvtMsg { val NAME = "GroupChatMessageReactionDeletedEvtMsg" }
case class GroupChatMessageReactionDeletedEvtMsg(header: BbbClientMsgHeader, body: GroupChatMessageReactionDeletedEvtMsgBody) extends BbbCoreMsg
case class GroupChatMessageReactionDeletedEvtMsgBody(chatId: String, messageId: String, reactionEmoji: String)

object UserTypingPubMsg { val NAME = "UserTypingPubMsg" }
case class UserTypingPubMsg(header: BbbClientMsgHeader, body: UserTypingPubMsgBody) extends StandardMsg
case class UserTypingPubMsgBody(chatId: String)

object SetGroupChatVisibleReqMsg { val NAME = "SetGroupChatVisibleReqMsg" }
case class SetGroupChatVisibleReqMsg(header: BbbClientMsgHeader, body: SetGroupChatVisibleReqMsgBody) extends StandardMsg
case class SetGroupChatVisibleReqMsgBody(chatId: String, visible: Boolean)

object SetGroupChatLastSeenReqMsg { val NAME = "SetGroupChatLastSeenReqMsg" }
case class SetGroupChatLastSeenReqMsg(header: BbbClientMsgHeader, body: SetGroupChatLastSeenReqMsgBody) extends StandardMsg
case class SetGroupChatLastSeenReqMsgBody(chatId: String, lastSeenAt: String)
