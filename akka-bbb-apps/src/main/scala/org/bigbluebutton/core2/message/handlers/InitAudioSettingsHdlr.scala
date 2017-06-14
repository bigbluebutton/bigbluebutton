package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{InitAudioSettings, MuteAllExceptPresenterRequest}
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.MeetingStatus2x

trait InitAudioSettingsHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleInitAudioSettings(msg: InitAudioSettings) {
    if (!MeetingStatus2x.audioSettingsInitialized(liveMeeting.status)) {
      MeetingStatus2x.initializeAudioSettings(liveMeeting.status)

      if (MeetingStatus2x.isMeetingMuted(liveMeeting.status) != msg.muted) {
        handleMuteAllExceptPresenterRequest(
          new MuteAllExceptPresenterRequest(props.meetingProp.intId,
            msg.requesterID, msg.muted));
      }
    }
  }
}
