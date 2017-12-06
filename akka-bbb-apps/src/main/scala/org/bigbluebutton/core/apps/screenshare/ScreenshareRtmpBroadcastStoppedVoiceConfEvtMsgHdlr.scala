package org.bigbluebutton.core.apps.screenshare

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.ScreenshareModel
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting

trait ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsgHdlr {
  this: ScreenshareApp2x =>

  def handle(msg: ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {

    def broadcastEvent(voiceConf: String, screenshareConf: String,
                       stream: String, vidWidth: Int, vidHeight: Int,
                       timestamp: String): BbbCommonEnvCoreMsg = {

      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, "not-used"
      )
      val envelope = BbbCoreEnvelope(ScreenshareRtmpBroadcastStoppedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        ScreenshareRtmpBroadcastStoppedEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, "not-used"
      )

      val body = ScreenshareRtmpBroadcastStoppedEvtMsgBody(voiceConf, screenshareConf,
        stream, vidWidth, vidHeight, timestamp)
      val event = ScreenshareRtmpBroadcastStoppedEvtMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }

    log.info("handleScreenshareRTMPBroadcastStoppedRequest: isBroadcastingRTMP=" +
      ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel) + " URL:" +
      ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel))

    // only valid if currently broadcasting
    if (ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel)) {
      log.info("STOP broadcast ALLOWED when isBroadcastingRTMP=true")
      ScreenshareModel.broadcastingRTMPStopped(liveMeeting.screenshareModel)

      // notify viewers that RTMP broadcast stopped
      val msgEvent = broadcastEvent(msg.body.voiceConf, msg.body.screenshareConf, msg.body.stream,
        msg.body.vidWidth, msg.body.vidHeight, msg.body.timestamp)
      bus.outGW.send(msgEvent)
    } else {
      log.info("STOP broadcast NOT ALLOWED when isBroadcastingRTMP=false")
    }
  }

}
