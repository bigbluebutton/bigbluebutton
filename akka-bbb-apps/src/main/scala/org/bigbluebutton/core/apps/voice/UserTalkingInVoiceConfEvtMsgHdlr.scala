package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.LockSettingsUtil
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ VoiceUserState, VoiceUsers }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }

trait UserTalkingInVoiceConfEvtMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserTalkingInVoiceConfEvtMsg(msg: UserTalkingInVoiceConfEvtMsg): Unit = {

    def broadcastEvent(vu: VoiceUserState): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId,
        vu.intId
      )
      val envelope = BbbCoreEnvelope(UserTalkingVoiceEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        UserTalkingVoiceEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, vu.intId
      )

      val body = UserTalkingVoiceEvtMsgBody(voiceConf = msg.header.voiceConf, intId = vu.intId, voiceUserId = vu.intId, vu.talking)

      val event = UserTalkingVoiceEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    for {
      talkingUser <- VoiceUsers.userTalking(liveMeeting.voiceUsers, msg.body.voiceUserId, msg.body.talking)
    } yield {
      // Make sure lock settings are in effect (ralam dec 6, 2019)
      LockSettingsUtil.enforceLockSettingsForVoiceUser(
        talkingUser,
        liveMeeting,
        outGW
      )
      broadcastEvent(talkingUser)
    }
  }
}
