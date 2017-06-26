package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.common2.messages.voiceconf.{ UserJoinedVoiceConfToClientEvtMsg, UserJoinedVoiceConfToClientEvtMsgBody }
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ UserConnectedToGlobalAudio, UserListeningOnly }
import org.bigbluebutton.core.models.{ Users, Users2x, VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x

trait UserConnectedToGlobalAudioHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserConnectedToGlobalAudio(msg: UserConnectedToGlobalAudio) {
    log.info("Handling UserConnectedToGlobalAudio: meetingId=" + props.meetingProp.intId + " userId=" + msg.userid)

    def broadcastEvent(vu: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId,
        vu.intId)
      val envelope = BbbCoreEnvelope(UserJoinedVoiceConfToClientEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserJoinedVoiceConfToClientEvtMsg.NAME, props.meetingProp.intId, vu.intId)

      val body = UserJoinedVoiceConfToClientEvtMsgBody(intId = vu.intId, voiceUserId = vu.intId,
        callingWith = vu.callingWith, callerName = vu.callerName,
        callerNum = vu.callerNum, muted = true, talking = false, listenOnly = true)
      val event = UserJoinedVoiceConfToClientEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)

      record(event)
    }

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.userid)
    } yield {
      val vu = VoiceUserState(intId = user.intId, voiceUserId = user.intId, callingWith = "flash", callerName = user.name,
        callerNum = user.name, muted = true, talking = false, listenOnly = true)
      VoiceUsers.add(liveMeeting.voiceUsers, vu)

      broadcastEvent(vu)
    }

  }

}
