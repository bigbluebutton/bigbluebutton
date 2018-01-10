package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait GetGroupChatsReqMsgHdlr {
  this: GroupChatHdlrs =>

  def handle(msg: GetGroupChatsReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    log.debug("RECEIVED GetGroupChatsReqMsg")

    def buildGetGroupChatsRespMsg(meetingId: String, userId: String,
                                  allChats: Vector[GroupChatInfo]): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
      val envelope = BbbCoreEnvelope(GetGroupChatsRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetGroupChatsRespMsg.NAME, meetingId, userId)

      val body = GetGroupChatsRespMsgBody(allChats)
      val event = GetGroupChatsRespMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val publicChats = state.groupChats.findAllPublicChats()
    val privateChats = state.groupChats.findAllPrivateChatsForUser(msg.header.userId)
    val pubChats = publicChats map (pc => GroupChatInfo(pc.id, pc.name, pc.access, pc.createdBy, pc.users))
    val privChats = privateChats map (pc => GroupChatInfo(pc.id, pc.name, pc.access, pc.createdBy, pc.users))

    val allChats = pubChats ++ privChats

    val respMsg = buildGetGroupChatsRespMsg(liveMeeting.props.meetingProp.intId, msg.header.userId, allChats)

    bus.outGW.send(respMsg)

    state
  }
}
