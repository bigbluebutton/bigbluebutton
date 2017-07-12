package org.bigbluebutton.core.apps.deskshare

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.DeskshareModel

trait DeskshareStoppedVoiceConfEvtMsgHdlr {
  this: DeskshareApp2x =>

  val outGW: OutMessageGateway

  def handleDeskshareStoppedVoiceConfEvtMsg(msg: DeskshareStoppedVoiceConfEvtMsg): Unit = {

    def broadcastEvent(voiceConf: String, deskshareConf: String, url: String, timestamp: String): BbbCommonEnvCoreMsg = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(DeskshareStopRtmpBroadcastVoiceConfMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(DeskshareStopRtmpBroadcastVoiceConfMsg.NAME,
        liveMeeting.props.meetingProp.intId)

      val body = DeskshareStopRtmpBroadcastVoiceConfMsgBody(voiceConf, deskshareConf, url, timestamp)
      val event = DeskshareStopRtmpBroadcastVoiceConfMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }

    log.info("handleDeskShareStoppedRequest: dsStarted=" +
      DeskshareModel.getDeskShareStarted(liveMeeting.deskshareModel) +
      " URL:" + DeskshareModel.getRTMPBroadcastingUrl(liveMeeting.deskshareModel))

    val timestamp = System.currentTimeMillis().toString
    // Tell FreeSwitch to stop broadcasting to RTMP
    val msgEvent = broadcastEvent(msg.body.voiceConf, msg.body.deskshareConf,
      DeskshareModel.getRTMPBroadcastingUrl(liveMeeting.deskshareModel), timestamp)
    outGW.send(msgEvent)

    DeskshareModel.setDeskShareStarted(liveMeeting.deskshareModel, false)
  }

}
