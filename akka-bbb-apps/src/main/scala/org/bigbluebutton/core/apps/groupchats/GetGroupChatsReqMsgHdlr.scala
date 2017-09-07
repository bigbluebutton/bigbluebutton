package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait GetGroupChatsReqMsgHdlr {
  this: GroupChatsApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGetGroupChatsReqMsg(msg: GetGroupChatsReqMsg, state: MeetingState2x): MeetingState2x = {
    val publicChats = state.groupChats.findAllPublicChats()
    val privateChats = state.groupChats.findAllPrivateChatsForUser(msg.header.userId)
    val pubChats = publicChats map (pc => GroupChatInfo(pc.id, pc.name, pc.publicChat, pc.createdBy))
    val privChats = privateChats map (pc => GroupChatInfo(pc.id, pc.name, pc.publicChat, pc.createdBy))

    val respMsg = buildGetGroupChatsRespMsg(liveMeeting.props.meetingProp.intId, msg.header.userId, pubChats, privChats)

    outGW.send(respMsg)

    state
  }

  def buildGetGroupChatsRespMsg(meetingId: String, userId: String,
                                publicChats: Vector[GroupChatInfo], privateChats: Vector[GroupChatInfo]): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GetGroupChatsRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(GetGroupChatsRespMsg.NAME, meetingId, userId)

    val body = GetGroupChatsRespMsgBody(userId, publicChats, privateChats)
    val event = GetGroupChatsRespMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }
}
