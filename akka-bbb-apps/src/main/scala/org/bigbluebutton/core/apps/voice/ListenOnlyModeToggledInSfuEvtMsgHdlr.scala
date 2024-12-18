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
      // Do not execute if the command is asking for the channel to be HELD
      // and the channel is already HELD. This is an edge case with the uuid_hold
      // command being used through FSESL or fsapi where holding only works via
      // the uuid_hold <toggle> subcommand, which may cause the channel to be the
      // opposite of what we want.
      // The unhold (uuid_hold off) command is not affected by this, but we don't
      // want to send it if the channel is already unheld.
      if ((msg.body.enabled && !vu.hold) || !msg.body.enabled) {
        VoiceApp.holdChannelInVoiceConf(
          liveMeeting,
          outGW,
          vu.uuid,
          msg.body.enabled
        )
      }

      // If the channel is already in the desired state, just make sure
      // any pending mute or unmute commands are sent.
      VoiceApp.handleChannelHoldChanged(
        liveMeeting,
        outGW,
        msg.body.userId,
        vu.uuid,
        msg.body.enabled
      )
    }
  }
}
