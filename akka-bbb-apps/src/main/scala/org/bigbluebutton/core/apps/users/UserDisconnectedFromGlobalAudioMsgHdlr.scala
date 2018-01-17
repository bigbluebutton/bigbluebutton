package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait UserDisconnectedFromGlobalAudioMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleUserDisconnectedFromGlobalAudioMsg(msg: UserDisconnectedFromGlobalAudioMsg) {
    log.info("Handling UserDisconnectedToGlobalAudio: meetingId=" + props.meetingProp.intId + " userId=" + msg.body.userId)

    def broadcastEvent(vu: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId,
        vu.intId)
      val envelope = BbbCoreEnvelope(UserLeftVoiceConfToClientEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserLeftVoiceConfToClientEvtMsg.NAME, props.meetingProp.intId, vu.intId)

      val body = UserLeftVoiceConfToClientEvtMsgBody(voiceConf = msg.header.voiceConf, intId = vu.intId, voiceUserId = vu.intId)

      val event = UserLeftVoiceConfToClientEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      user <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.body.userId)
    } yield {
      VoiceUsers.removeWithIntId(liveMeeting.voiceUsers, user.intId)
      broadcastEvent(user)
    }
  }
}
