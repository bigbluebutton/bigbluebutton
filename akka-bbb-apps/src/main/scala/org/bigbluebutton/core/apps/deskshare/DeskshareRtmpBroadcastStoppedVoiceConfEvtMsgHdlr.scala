package org.bigbluebutton.core.apps.deskshare

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.DeskshareModel

trait DeskshareRtmpBroadcastStoppedVoiceConfEvtMsgHdlr {
  this: DeskshareApp2x =>

  val outGW: OutMessageGateway

  def handleDeskshareRtmpBroadcastStoppedVoiceConfEvtMsg(msg: DeskshareRtmpBroadcastStoppedVoiceConfEvtMsg): Unit = {

    def broadcastEvent(voiceConf: String, deskshareConf: String,
      stream: String, vidWidth: Int, vidHeight: Int,
      timestamp: String): BbbCommonEnvCoreMsg = {

      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, "not-used")
      val envelope = BbbCoreEnvelope(ScreenshareRtmpBroadcastStoppedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(ScreenshareRtmpBroadcastStoppedEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, "not-used")

      val body = ScreenshareRtmpBroadcastStoppedEvtMsgBody(voiceConf, deskshareConf,
        stream, vidWidth, vidHeight, timestamp)
      val event = ScreenshareRtmpBroadcastStoppedEvtMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }

    log.info("handleDeskShareRTMPBroadcastStoppedRequest: isBroadcastingRTMP=" +
      DeskshareModel.isBroadcastingRTMP(liveMeeting.deskshareModel) + " URL:" +
      DeskshareModel.getRTMPBroadcastingUrl(liveMeeting.deskshareModel))

    // only valid if currently broadcasting
    if (DeskshareModel.isBroadcastingRTMP(liveMeeting.deskshareModel)) {
      log.info("STOP broadcast ALLOWED when isBroadcastingRTMP=true")
      DeskshareModel.broadcastingRTMPStopped(liveMeeting.deskshareModel)

      // notify viewers that RTMP broadcast stopped
      val msgEvent = broadcastEvent(msg.body.voiceConf, msg.body.deskshareConf, msg.body.stream,
        msg.body.vidWidth, msg.body.vidHeight, msg.body.timestamp)
      outGW.send(msgEvent)
    } else {
      log.info("STOP broadcast NOT ALLOWED when isBroadcastingRTMP=false")
    }
  }

}
