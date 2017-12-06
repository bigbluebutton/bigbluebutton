package org.bigbluebutton.core.apps.screenshare

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.ScreenshareModel
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting

trait ScreenshareRtmpBroadcastStartedVoiceConfEvtMsgHdlr {
  this: ScreenshareApp2x =>

  def handle(msg: ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    def broadcastEvent(voiceConf: String, screenshareConf: String, stream: String, vidWidth: Int, vidHeight: Int,
                       timestamp: String): BbbCommonEnvCoreMsg = {

      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, "not-used"
      )
      val envelope = BbbCoreEnvelope(ScreenshareRtmpBroadcastStartedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        ScreenshareRtmpBroadcastStartedEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, "not-used"
      )

      val body = ScreenshareRtmpBroadcastStartedEvtMsgBody(voiceConf, screenshareConf,
        stream, vidWidth, vidHeight, timestamp)
      val event = ScreenshareRtmpBroadcastStartedEvtMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }

    log.info("handleScreenshareRTMPBroadcastStartedRequest: isBroadcastingRTMP=" +
      ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel) +
      " URL:" + ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel))

    // only valid if not broadcasting yet
    if (!ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel)) {
      ScreenshareModel.setRTMPBroadcastingUrl(liveMeeting.screenshareModel, msg.body.stream)
      ScreenshareModel.broadcastingRTMPStarted(liveMeeting.screenshareModel)
      ScreenshareModel.setScreenshareVideoWidth(liveMeeting.screenshareModel, msg.body.vidWidth)
      ScreenshareModel.setScreenshareVideoHeight(liveMeeting.screenshareModel, msg.body.vidHeight)
      ScreenshareModel.setVoiceConf(liveMeeting.screenshareModel, msg.body.voiceConf)
      ScreenshareModel.setScreenshareConf(liveMeeting.screenshareModel, msg.body.screenshareConf)
      ScreenshareModel.setTimestamp(liveMeeting.screenshareModel, msg.body.timestamp)

      log.info("START broadcast ALLOWED when isBroadcastingRTMP=false")

      // Notify viewers in the meeting that there's an rtmp stream to view
      val msgEvent = broadcastEvent(msg.body.voiceConf, msg.body.screenshareConf, msg.body.stream,
        msg.body.vidWidth, msg.body.vidHeight, msg.body.timestamp)
      bus.outGW.send(msgEvent)
    } else {
      log.info("START broadcast NOT ALLOWED when isBroadcastingRTMP=true")
    }
  }

}
