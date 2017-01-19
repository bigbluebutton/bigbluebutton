package org.bigbluebutton.core.running.handlers

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ DeskShareNotifyViewersRTMP, DeskShareRTMPBroadcastStartedRequest }
import org.bigbluebutton.core.running.{ MeetingActor, MeetingStateModel }

trait DeskShareRTMPBroadcastStartedRequestMsgHdlr {
  this: MeetingActor =>

  val state: MeetingStateModel
  val outGW: OutMessageGateway

  def handle(msg: DeskShareRTMPBroadcastStartedRequest): Unit = {
    log.info("handleDeskShareRTMPBroadcastStartedRequest: isBroadcastingRTMP=" + state.meetingModel.isBroadcastingRTMP() +
      " URL:" + state.meetingModel.getRTMPBroadcastingUrl())

    // only valid if not broadcasting yet
    if (!state.meetingModel.isBroadcastingRTMP()) {
      state.meetingModel.setRTMPBroadcastingUrl(msg.streamname)
      state.meetingModel.broadcastingRTMPStarted()
      state.meetingModel.setDesktopShareVideoWidth(msg.videoWidth)
      state.meetingModel.setDesktopShareVideoHeight(msg.videoHeight)
      log.info("START broadcast ALLOWED when isBroadcastingRTMP=false")

      // Notify viewers in the meeting that there's an rtmp stream to view
      outGW.send(new DeskShareNotifyViewersRTMP(state.mProps.meetingID, msg.streamname, msg.videoWidth, msg.videoHeight, true))
    } else {
      log.info("START broadcast NOT ALLOWED when isBroadcastingRTMP=true")
    }
  }
}
