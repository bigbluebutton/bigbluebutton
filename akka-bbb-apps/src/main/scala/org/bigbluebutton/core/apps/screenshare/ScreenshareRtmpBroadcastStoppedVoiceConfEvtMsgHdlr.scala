package org.bigbluebutton.core.apps.screenshare

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.ScreenshareModel
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsgHdlr {
  this: ScreenshareApp2x =>

  def handle(msg: ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    log.info("handleScreenshareRTMPBroadcastStoppedRequest: isBroadcastingRTMP=" +
      ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel) + " URL:" +
      ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel))

    // only valid if currently broadcasting
    if (ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel)) {
      log.info("STOP broadcast ALLOWED when isBroadcastingRTMP=true")
      ScreenshareModel.broadcastingRTMPStopped(liveMeeting.screenshareModel)

      // notify viewers that RTMP broadcast stopped
      val msgEvent = MsgBuilder.buildStopScreenshareRtmpBroadcastEvtMsg(
        liveMeeting.props.meetingProp.intId,
        msg.body.voiceConf, msg.body.screenshareConf, msg.body.stream,
        msg.body.vidWidth, msg.body.vidHeight, msg.body.timestamp
      )

      bus.outGW.send(msgEvent)
    } else {
      log.info("STOP broadcast NOT ALLOWED when isBroadcastingRTMP=false")
    }
  }

}
