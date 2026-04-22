package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.common2.msgs.SetUserListenOnlyInputCmdMsg
import org.bigbluebutton.core.apps.{ RightsManagementTrait }
import org.bigbluebutton.core.models.{ VoiceUsers }
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting, OutMsgRouter }

trait SetUserListenOnlyInputCmdMsgHdlr extends RightsManagementTrait {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleSetUserListenOnlyInputCmdMsg(msg: SetUserListenOnlyInputCmdMsg) {
    val meetingId = liveMeeting.props.meetingProp.intId

    log.info("Received listen only input device change for user request. meetingId=" + meetingId + " userId="
      + msg.header.userId + " listenOnlyInputDevice=" + msg.body.listenOnlyInputDevice)

    for {
      u <- VoiceUsers.findWithIntId(
        liveMeeting.voiceUsers,
        msg.header.userId
      )
    } yield {
      if (u.listenOnlyInputDevice != msg.body.listenOnlyInputDevice) {
        log.info("Send set listen only input device user request. meetingId=" + meetingId + " userId=" + u.intId + " listenOnlyInputDevice=" + msg.body.listenOnlyInputDevice)
        VoiceApp.setListenOnlyInputInVoiceConf(
          liveMeeting,
          outGW,
          u.intId,
          msg.body.listenOnlyInputDevice
        )
      }
    }
  }
}
