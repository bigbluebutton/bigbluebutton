package org.bigbluebutton.core.apps.screenshare

import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.ScreenshareModel
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Screenshares

trait GetScreenshareStatusReqMsgHdlr {
  this: ScreenshareApp2x =>

  def handle(msg: GetScreenshareStatusReqMsg, liveMeeting: LiveMeeting, bus: MessageBus) {

    def buildBroadcastEvent(meetingId: String, requestedBy: String, voiceConf: String, screenshareConf: String,
                            ownerUserId: String, stream: String, vidWidth: Int, vidHeight: Int,
                            timestamp: String, hasAudio: Boolean, contentType: String): BbbCommonEnvCoreMsg = {

      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, requestedBy)
      val envelope = BbbCoreEnvelope(ScreenshareRtmpBroadcastStartedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        ScreenshareRtmpBroadcastStartedEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, "not-used"
      )

      val body = ScreenshareRtmpBroadcastStartedEvtMsgBody(voiceConf, screenshareConf, ownerUserId,
        stream, vidWidth, vidHeight, timestamp, hasAudio, contentType)
      val event = ScreenshareRtmpBroadcastStartedEvtMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }

    val isLiveKit = liveMeeting.props.meetingProp.screenShareBridge == "livekit"

    if (isLiveKit) {
      val allStreams = Screenshares.findAll(liveMeeting.screenshares)
      log.info("handleGetScreenshareStatusReqMsg (LiveKit): activeStreams={}", allStreams.size)
      allStreams.foreach { stream =>
        val msgEvent = buildBroadcastEvent(
          liveMeeting.props.meetingProp.intId,
          msg.body.requestedBy,
          stream.voiceConf,
          stream.screenshareConf,
          stream.userId,
          stream.streamId,
          stream.vidWidth,
          stream.vidHeight,
          stream.timestamp,
          stream.hasAudio,
          stream.contentType
        )
        bus.outGW.send(msgEvent)
      }
    } else {
      log.info("handleGetScreenshareStatusReqMsg: isBroadcastingRTMP=" +
        ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel) +
        " URL:" + ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel))

      // only reply if there is an ongoing stream
      if (ScreenshareModel.isBroadcastingRTMP(liveMeeting.screenshareModel)) {
        val msgEvent = buildBroadcastEvent(
          liveMeeting.props.meetingProp.intId,
          msg.body.requestedBy,
          ScreenshareModel.getVoiceConf(liveMeeting.screenshareModel),
          ScreenshareModel.getScreenshareConf(liveMeeting.screenshareModel),
          ScreenshareModel.getUserId(liveMeeting.screenshareModel),
          ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel),
          ScreenshareModel.getScreenshareVideoWidth(liveMeeting.screenshareModel),
          ScreenshareModel.getScreenshareVideoHeight(liveMeeting.screenshareModel),
          ScreenshareModel.getTimestamp(liveMeeting.screenshareModel),
          ScreenshareModel.getHasAudio(liveMeeting.screenshareModel),
          ScreenshareModel.getContentType(liveMeeting.screenshareModel)
        )
        bus.outGW.send(msgEvent)
      }
    }
  }
}
