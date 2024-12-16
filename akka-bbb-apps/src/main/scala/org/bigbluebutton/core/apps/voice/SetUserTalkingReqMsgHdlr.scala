package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ VoiceUsers }
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor, OutMsgRouter }

trait SetUserTalkingReqMsgHdlr {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSetUserTalkingReqMsg(msg: SetUserTalkingReqMsg): Unit = {
    for {
      vu <- VoiceUsers.findWIthIntId(liveMeeting.voiceUsers, msg.header.userId)
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
