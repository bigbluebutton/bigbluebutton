package org.bigbluebutton.core.apps.deskshare

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.DeskshareModel

trait DeskshareRtmpBroadcastStartedVoiceConfEvtMsgHdlr {
  this: DeskshareApp2x =>

  val outGW: OutMessageGateway

  def handleDeskshareRtmpBroadcastStartedVoiceConfEvtMsg(msg: DeskshareRtmpBroadcastStartedVoiceConfEvtMsg): Unit = {
    def broadcastEvent(voiceConf: String, deskshareConf: String, stream: String, vidWidth: Int, vidHeight: Int,
      timestamp: String): BbbCommonEnvCoreMsg = {

      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, "not-used")
      val envelope = BbbCoreEnvelope(ScreenshareRtmpBroadcastStartedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(ScreenshareRtmpBroadcastStartedEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, "not-used")

      val body = ScreenshareRtmpBroadcastStartedEvtMsgBody(voiceConf, deskshareConf,
        stream, vidWidth, vidHeight, timestamp)
      val event = ScreenshareRtmpBroadcastStartedEvtMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }

    log.info("handleDeskShareRTMPBroadcastStartedRequest: isBroadcastingRTMP=" +
      DeskshareModel.isBroadcastingRTMP(liveMeeting.deskshareModel) +
      " URL:" + DeskshareModel.getRTMPBroadcastingUrl(liveMeeting.deskshareModel))

    // only valid if not broadcasting yet
    if (!DeskshareModel.isBroadcastingRTMP(liveMeeting.deskshareModel)) {
      DeskshareModel.setRTMPBroadcastingUrl(liveMeeting.deskshareModel, msg.body.stream)
      DeskshareModel.broadcastingRTMPStarted(liveMeeting.deskshareModel)
      DeskshareModel.setDesktopShareVideoWidth(liveMeeting.deskshareModel, msg.body.vidWidth)
      DeskshareModel.setDesktopShareVideoHeight(liveMeeting.deskshareModel, msg.body.vidHeight)
      log.info("START broadcast ALLOWED when isBroadcastingRTMP=false")

      // Notify viewers in the meeting that there's an rtmp stream to view
      val msgEvent = broadcastEvent(msg.body.voiceConf, msg.body.deskshareConf, msg.body.stream,
        msg.body.vidWidth, msg.body.vidHeight, msg.body.timestamp)
      outGW.send(msgEvent)
    } else {
      log.info("START broadcast NOT ALLOWED when isBroadcastingRTMP=true")
    }
  }

}
