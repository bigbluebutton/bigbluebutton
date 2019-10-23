package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ Users2x, VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait UserConnectedToGlobalAudioMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleUserConnectedToGlobalAudioMsg(msg: UserConnectedToGlobalAudioMsg) {
    log.info("Handling UserConnectedToGlobalAudio: meetingId=" + props.meetingProp.intId + " userId=" + msg.body.userId)

    def broadcastEvent(vu: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, props.meetingProp.intId,
        vu.intId)
      val envelope = BbbCoreEnvelope(UserJoinedVoiceConfToClientEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserJoinedVoiceConfToClientEvtMsg.NAME, props.meetingProp.intId, vu.intId)

      val body = UserJoinedVoiceConfToClientEvtMsgBody(voiceConf = msg.header.voiceConf, intId = vu.intId, voiceUserId = vu.intId,
        callingWith = vu.callingWith, callerName = vu.callerName,
        callerNum = vu.callerNum, muted = true, talking = false, listenOnly = true)
      val event = UserJoinedVoiceConfToClientEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
    } yield {

      val vu = VoiceUserState(
        intId = user.intId,
        voiceUserId = user.intId,
        callingWith = "flash",
        callerName = user.name,
        callerNum = user.name,
        muted = true,
        talking = false,
        listenOnly = true,
        "kms",
        System.currentTimeMillis()
      )

      VoiceUsers.add(liveMeeting.voiceUsers, vu)

      broadcastEvent(vu)
    }

  }

}
