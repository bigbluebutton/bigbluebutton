package org.bigbluebutton.core.running.handlers

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ DeskShareGetDeskShareInfoRequest, DeskShareNotifyASingleViewer }
import org.bigbluebutton.core.running.{ MeetingActor, MeetingStateModel }

trait DeskShareGetDeskShareInfoRequestMsgHdlr {
  this: MeetingActor =>

  val state: MeetingStateModel
  val outGW: OutMessageGateway

  def handle(msg: DeskShareGetDeskShareInfoRequest): Unit = {

    log.info("handleDeskShareGetDeskShareInfoRequest: " + msg.conferenceName + "isBroadcasting="
      + state.meetingModel.isBroadcastingRTMP() + " URL:" + state.meetingModel.getRTMPBroadcastingUrl())
    if (state.meetingModel.isBroadcastingRTMP()) {
      // if the meeting has an ongoing WebRTC Deskshare session, send a notification
      outGW.send(new DeskShareNotifyASingleViewer(state.mProps.meetingID, msg.requesterID, state.meetingModel.getRTMPBroadcastingUrl(),
        state.meetingModel.getDesktopShareVideoWidth(), state.meetingModel.getDesktopShareVideoHeight(), true))
    }
  }
}
