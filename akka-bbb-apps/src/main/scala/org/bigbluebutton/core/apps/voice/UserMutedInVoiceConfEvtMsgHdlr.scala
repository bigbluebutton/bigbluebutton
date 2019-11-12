package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ VoiceUsers }
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor, OutMsgRouter }

trait UserMutedInVoiceConfEvtMsgHdlr {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleUserMutedInVoiceConfEvtMsg(msg: UserMutedInVoiceConfEvtMsg): Unit = {

    for {
      vu <- VoiceUsers.findWithVoiceUserId(liveMeeting.voiceUsers, msg.body.voiceUserId)
    } yield {
      VoiceApp.handleUserMutedInVoiceConfEvtMsg(
        liveMeeting,
        outGW,
        msg.body.voiceUserId,
        msg.body.muted
      )
    }
  }
}
