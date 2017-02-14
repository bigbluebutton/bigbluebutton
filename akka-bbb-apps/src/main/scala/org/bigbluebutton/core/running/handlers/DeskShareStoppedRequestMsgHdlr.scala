package org.bigbluebutton.core.running.handlers

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ DeskShareStopRTMPBroadcast, DeskShareStoppedRequest }
import org.bigbluebutton.core.running.{ MeetingActor, MeetingStateModel }

trait DeskShareStoppedRequestMsgHdlr {
  this: MeetingActor =>

  val state: MeetingStateModel
  val outGW: OutMessageGateway

  def handle(msg: DeskShareStoppedRequest): Unit = {
    log.info("handleDeskShareStoppedRequest: dsStarted=" + state.meetingModel.getDeskShareStarted() +
      " URL:" + state.meetingModel.getRTMPBroadcastingUrl())

    // Tell FreeSwitch to stop broadcasting to RTMP
    outGW.send(new DeskShareStopRTMPBroadcast(msg.conferenceName, state.meetingModel.getRTMPBroadcastingUrl()))

    state.meetingModel.setDeskShareStarted(false)
  }

}
