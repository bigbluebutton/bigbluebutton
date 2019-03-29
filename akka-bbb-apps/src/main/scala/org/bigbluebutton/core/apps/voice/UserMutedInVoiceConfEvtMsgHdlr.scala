package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }

trait UserMutedInVoiceConfEvtMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserMutedInVoiceConfEvtMsg(msg: UserMutedInVoiceConfEvtMsg): Unit = {

    def broadcastEvent(vu: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        vu.intId
      )
      val envelope = BbbCoreEnvelope(UserMutedVoiceEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        UserMutedVoiceEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, vu.intId
      )

      val body = UserMutedVoiceEvtMsgBody(voiceConf = msg.header.voiceConf, intId = vu.intId, voiceUserId = vu.intId, vu.muted)

      val event = UserMutedVoiceEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      mutedUser <- VoiceUsers.userMuted(liveMeeting.voiceUsers, msg.body.voiceUserId, msg.body.muted)
    } yield {
      broadcastEvent(mutedUser)
    }
  }
}
