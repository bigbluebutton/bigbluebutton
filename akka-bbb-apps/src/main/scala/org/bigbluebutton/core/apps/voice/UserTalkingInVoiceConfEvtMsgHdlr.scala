package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.{ VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, MeetingActor }

trait UserTalkingInVoiceConfEvtMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleUserTalkingInVoiceConfEvtMsg(msg: UserTalkingInVoiceConfEvtMsg): Unit = {

    def broadcastEvent(vu: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        vu.intId)
      val envelope = BbbCoreEnvelope(UserTalkingToClientEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserTalkingToClientEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, vu.intId)

      val body = UserTalkingToClientEvtMsgBody(intId = vu.intId, voiceUserId = vu.intId, vu.talking)

      val event = UserTalkingToClientEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      mutedUser <- VoiceUsers.userTalking(liveMeeting.voiceUsers, msg.body.voiceUserId, msg.body.talking)
    } yield {
      broadcastEvent(mutedUser)
    }
  }
}
