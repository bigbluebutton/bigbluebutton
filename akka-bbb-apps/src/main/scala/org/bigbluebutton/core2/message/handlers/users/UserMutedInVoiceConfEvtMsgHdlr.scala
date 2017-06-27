package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.messages.VoiceConf.{ UserMutedEvtMsg, UserMutedEvtMsgBody, UserMutedInVoiceConfEvtMsg }
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.{ VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.MeetingActor

trait UserMutedInVoiceConfEvtMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handle(msg: UserMutedInVoiceConfEvtMsg): Unit = {

    def broadcastEvent(vu: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId,
        vu.intId)
      val envelope = BbbCoreEnvelope(UserMutedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserMutedEvtMsg.NAME, props.meetingProp.intId, vu.intId)

      val body = UserMutedEvtMsgBody(intId = vu.intId, voiceUserId = vu.intId, vu.muted)

      val event = UserMutedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      record(event)
    }

    for {
      mutedUser <- VoiceUsers.userMuted(liveMeeting.voiceUsers, msg.body.voiceUserId, msg.body.muted)
    } yield {
      broadcastEvent(mutedUser)
    }
  }
}
