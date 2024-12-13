package org.bigbluebutton.core.apps.screenshare

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.ScreenshareModel
import org.bigbluebutton.core.apps.ScreenshareModel.getRTMPBroadcastingUrl
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.screenshare.ScreenshareApp2x.broadcastStopped
import org.bigbluebutton.core.db.ScreenshareDAO

trait ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsgHdlr {
  this: ScreenshareApp2x =>

  def handle(msg: ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.info("handleScreenshareRTMPBroadcastStoppedRequest: isBroadcastingRTMP=" +
      ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel) + " URL:" +
      ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel))

    ScreenshareDAO.updateStopped(liveMeeting.props.meetingProp.intId, getRTMPBroadcastingUrl(liveMeeting.screenshareModel))

    broadcastStopped(bus.outGW, liveMeeting)
  }
}
