package org.bigbluebutton.core.apps.screenshare

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.ScreenshareModel

trait ScreenshareStoppedVoiceConfEvtMsgHdlr {
  this: ScreenshareApp2x =>

  val outGW: OutMessageGateway

  def handleScreenshareStoppedVoiceConfEvtMsg(msg: ScreenshareStoppedVoiceConfEvtMsg): Unit = {

    def broadcastEvent(voiceConf: String, screenshareConf: String, url: String, timestamp: String): BbbCommonEnvCoreMsg = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(ScreenshareStopRtmpBroadcastVoiceConfMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(
        ScreenshareStopRtmpBroadcastVoiceConfMsg.NAME,
        liveMeeting.props.meetingProp.intId
      )

      val body = ScreenshareStopRtmpBroadcastVoiceConfMsgBody(voiceConf, screenshareConf, url, timestamp)
      val event = ScreenshareStopRtmpBroadcastVoiceConfMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }

    log.info("handleScreenshareStoppedRequest: dsStarted=" +
      ScreenshareModel.getScreenshareStarted(liveMeeting.screenshareModel) +
      " URL:" + ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel))

    val timestamp = System.currentTimeMillis().toString
    // Tell FreeSwitch to stop broadcasting to RTMP
    val msgEvent = broadcastEvent(msg.body.voiceConf, msg.body.screenshareConf,
      ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel), timestamp)
    outGW.send(msgEvent)

    ScreenshareModel.setScreenshareStarted(liveMeeting.screenshareModel, false)
  }

}
