package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.messages.VoiceConf.{ UserLeftVoiceConfToClientEvtMsg, UserLeftVoiceConfToClientEvtMsgBody }
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ UserDisconnectedFromGlobalAudio, UserLeft, UserListeningOnly }
import org.bigbluebutton.core.models.{ VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.MeetingActor

trait UserDisconnectedFromGlobalAudioHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserDisconnectedFromGlobalAudio(msg: UserDisconnectedFromGlobalAudio) {
    log.info("Handling UserDisconnectedToGlobalAudio: meetingId=" + props.meetingProp.intId + " userId=" + msg.userid)

    def broadcastEvent(vu: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId,
        vu.intId)
      val envelope = BbbCoreEnvelope(UserLeftVoiceConfToClientEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserLeftVoiceConfToClientEvtMsg.NAME, props.meetingProp.intId, vu.intId)

      val body = UserLeftVoiceConfToClientEvtMsgBody(intId = vu.intId, voiceUserId = vu.intId)

      val event = UserLeftVoiceConfToClientEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      record(event)
    }

    for {
      user <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.userid)
    } yield {
      VoiceUsers.removeWithIntId(liveMeeting.voiceUsers, user.intId)
      broadcastEvent(user)
    }
  }
}
