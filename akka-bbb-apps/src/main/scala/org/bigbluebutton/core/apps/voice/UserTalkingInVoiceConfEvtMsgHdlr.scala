package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ VoiceUsers }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }

trait UserTalkingInVoiceConfEvtMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserTalkingInVoiceConfEvtMsg(msg: UserTalkingInVoiceConfEvtMsg): Unit = {
    for {
      vu <- VoiceUsers.findWithVoiceUserId(liveMeeting.voiceUsers, msg.body.voiceUserId)
    } yield {
      VoiceApp.handleUserTalking(
        liveMeeting,
        outGW,
        vu.voiceUserId,
        msg.body.talking
      )
    }
  }
}
