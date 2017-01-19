package org.bigbluebutton.core.running.handlers

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ DeskShareNotifyViewersRTMP, DeskShareRTMPBroadcastStoppedRequest }
import org.bigbluebutton.core.running.{ MeetingActor, MeetingStateModel }

trait DeskShareRTMPBroadcastStoppedRequestMsgHdlr {
  this: MeetingActor =>

  val state: MeetingStateModel
  val outGW: OutMessageGateway

  def handle(msg: DeskShareRTMPBroadcastStoppedRequest): Unit = {
    log.info("handleDeskShareRTMPBroadcastStoppedRequest: isBroadcastingRTMP=" + state.meetingModel
      .isBroadcastingRTMP() + " URL:" + state.meetingModel.getRTMPBroadcastingUrl())

    // only valid if currently broadcasting
    if (state.meetingModel.isBroadcastingRTMP()) {
      log.info("STOP broadcast ALLOWED when isBroadcastingRTMP=true")
      state.meetingModel.broadcastingRTMPStopped()

      // notify viewers that RTMP broadcast stopped
      outGW.send(new DeskShareNotifyViewersRTMP(state.mProps.meetingID, state.meetingModel.getRTMPBroadcastingUrl(),
        msg.videoWidth, msg.videoHeight, false))
    } else {
      log.info("STOP broadcast NOT ALLOWED when isBroadcastingRTMP=false")
    }
  }
}
