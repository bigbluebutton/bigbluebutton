package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

trait GetGroupChatMsgsReqMsgHdlr {
  this: GroupChatsApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleGetGroupChatMsgsReqMsg(msg: GetGroupChatMsgsReqMsg, state: MeetingState2x): MeetingState2x = {
    state.groupChats.find(msg.body.chatId) foreach { gc =>
      if (gc.access == GroupChatAccess.PUBLIC || gc.isUserMemberOf(msg.body.requesterId)) {
        val respMsg = buildGetGroupChatMsgsRespMsg(
          liveMeeting.props.meetingProp.intId,
          msg.body.requesterId, gc.msgs.values.toVector
        )
        outGW.send(respMsg)
      }
    }

    state
  }

  def buildGetGroupChatMsgsRespMsg(meetingId: String, userId: String,
                                   msgs: Vector[GroupChatMessage]): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GetGroupChatMsgsRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(GetGroupChatMsgsRespMsg.NAME, meetingId, userId)

    val body = GetGroupChatMsgsRespMsgBody(userId, msgs)
    val event = GetGroupChatMsgsRespMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }
}
