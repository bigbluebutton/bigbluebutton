package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.VoiceUsers
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }

trait ListenOnlyModeToggledInSfuEvtMsgHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleListenOnlyModeToggledInSfuEvtMsg(msg: ListenOnlyModeToggledInSfuEvtMsg): Unit = {
    for {
      vu <- VoiceUsers.findWithIntIdAndCallerNum(
        liveMeeting.voiceUsers,
        msg.body.userId,
        msg.body.callerNum
      )
    } yield {
      VoiceApp.holdChannelInVoiceConf(
        liveMeeting,
        outGW,
        vu.uuid,
        msg.body.enabled
      )
    }
  }
}
