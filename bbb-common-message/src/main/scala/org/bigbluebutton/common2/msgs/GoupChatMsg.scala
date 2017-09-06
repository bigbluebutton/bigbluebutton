package org.bigbluebutton.common2.msgs

object GetGroupChatsReqMsg { val NAME = "GetGroupChatsReqMsg"}
case class GetGroupChatsReqMsg(header: BbbClientMsgHeader, body: GetGroupChatsReqMsgBody) extends StandardMsg
case class GetGroupChatsReqMsgBody()

object GetGroupChatsRespMsg { val NAME = "GetGroupChatsRespMsg"}
case class GetGroupChatsRespMsg(header: BbbClientMsgHeader, body: GetGroupChatsRespMsgBody) extends BbbCoreMsg
case class GetGroupChatsRespMsgBody(requesterId: String, chats: Vector[String])

object CreateGroupChatReqMsg { val NAME = "CreateGroupChatReqMsg"}
case class CreateGroupChatReqMsg(header: BbbClientMsgHeader, body: CreateGroupChatReqMsgBody) extends StandardMsg
case class CreateGroupChatReqMsgBody(open: Boolean, requesterId: String, name: String, correlationId: String)

object CreateGroupChatRespMsg { val NAME = "CreateGroupChatRespMsg"}
case class CreateGroupChatRespMsg(header: BbbClientMsgHeader, body: CreateGroupChatRespMsgBody) extends BbbCoreMsg
case class CreateGroupChatRespMsgBody(correlationId: String, chatId: String, name: String, open: Boolean)

object RemoveGroupChatReqMsg { val NAME = "RemoveGroupChatReqMsg"}
case class RemoveGroupChatReqMsg(header: BbbClientMsgHeader, body: RemoveGroupChatReqMsgBody) extends StandardMsg
case class RemoveGroupChatReqMsgBody(requesterId: String, chats: Vector[String])

object GroupChatRemovedEvtMsg { val NAME = "GroupChatRemovedEvtMsg"}
case class GroupChatRemovedEvtMsg(header: BbbClientMsgHeader, body: GroupChatRemovedEvtMsgBody) extends BbbCoreMsg
case class GroupChatRemovedEvtMsgBody(requesterId: String, chats: Vector[String])

object ChangeGroupChatAccessReqMsg { val NAME = "ChangeGroupChatAccessReqMsg"}
case class ChangeGroupChatAccessReqMsg(header: BbbClientMsgHeader, body: ChangeGroupChatAccessReqMsgBody) extends StandardMsg
case class ChangeGroupChatAccessReqMsgBody(requesterId: String, chats: Vector[String])

object GroupChatAccessChangedEvtMsg { val NAME = "GroupChatAccessChangedEvtMsg"}
case class GroupChatAccessChangedEvtMsg(header: BbbClientMsgHeader, body: GroupChatAccessChangedEvtMsgBody) extends BbbCoreMsg
case class GroupChatAccessChangedEvtMsgBody(requesterId: String, chats: Vector[String])

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
case class SendGroupChatMessageMsgBody(requesterId: String, chats: Vector[String])

object GroupChatMessageBroadcastEvtMsg { val NAME = "GroupChatMessageBroadcastEvtMsg"}
case class GroupChatMessageBroadcastEvtMsg(header: BbbClientMsgHeader, body: GroupChatMessageBroadcastEvtMsgBody) extends BbbCoreMsg
case class GroupChatMessageBroadcastEvtMsgBody(requesterId: String, chats: Vector[String])
