package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.{ VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.MeetingActor

trait UserTalkingInVoiceConfEvtMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handle(msg: UserTalkingInVoiceConfEvtMsg): Unit = {

    def broadcastEvent(vu: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId,
        vu.intId)
      val envelope = BbbCoreEnvelope(UserTalkingEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserTalkingEvtMsg.NAME, props.meetingProp.intId, vu.intId)

      val body = UserTalkingEvtMsgBody(intId = vu.intId, voiceUserId = vu.intId, vu.talking)

      val event = UserTalkingEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      record(event)
    }

    for {
      mutedUser <- VoiceUsers.userTalking(liveMeeting.voiceUsers, msg.body.voiceUserId, msg.body.talking)
    } yield {
      broadcastEvent(mutedUser)
    }
  }
}
