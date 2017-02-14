package org.bigbluebutton.core.running.handlers

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ DeskShareStartRTMPBroadcast, DeskShareStartedRequest }
import org.bigbluebutton.core.running.{ MeetingActor, MeetingStateModel }

trait DeskShareStartedRequestMsgHdlr {
  this: MeetingActor =>

  val state: MeetingStateModel
  val outGW: OutMessageGateway

  def handle(msg: DeskShareStartedRequest): Unit = {
    log.info("handleDeskShareStartedRequest: dsStarted=" + state.meetingModel.getDeskShareStarted())

    if (!state.meetingModel.getDeskShareStarted()) {
      val timestamp = System.currentTimeMillis().toString
      val streamPath = "rtmp://" + state.mProps.red5DeskShareIP + "/" + state.mProps.red5DeskShareApp +
        "/" + state.mProps.meetingID + "/" + state.mProps.meetingID + "-" + timestamp
      log.info("handleDeskShareStartedRequest: streamPath=" + streamPath)

      // Tell FreeSwitch to broadcast to RTMP
      outGW.send(new DeskShareStartRTMPBroadcast(msg.conferenceName, streamPath))

      state.meetingModel.setDeskShareStarted(true)
    }
  }
}
