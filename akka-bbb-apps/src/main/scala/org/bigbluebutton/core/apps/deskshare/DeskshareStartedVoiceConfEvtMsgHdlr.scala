package org.bigbluebutton.core.apps.deskshare

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.DeskshareModel

trait DeskshareStartedVoiceConfEvtMsgHdlr {
  this: DeskshareApp2x =>

  val outGW: OutMessageGateway

  def handleDeskshareStartedVoiceConfEvtMsg(msg: DeskshareStartedVoiceConfEvtMsg): Unit = {

    def broadcastEvent(voiceConf: String, deskshareConf: String, url: String, timestamp: String): BbbCommonEnvCoreMsg = {

      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(DeskshareStartRtmpBroadcastVoiceConfMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(DeskshareStartRtmpBroadcastVoiceConfMsg.NAME,
        liveMeeting.props.meetingProp.intId)

      val body = DeskshareStartRtmpBroadcastVoiceConfMsgBody(voiceConf: String, deskshareConf: String, url: String, timestamp: String)
      val event = DeskshareStartRtmpBroadcastVoiceConfMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }

    log.info("handleDeskShareStartedRequest: dsStarted=" + DeskshareModel.getDeskShareStarted(liveMeeting.deskshareModel))

    if (!DeskshareModel.getDeskShareStarted(liveMeeting.deskshareModel)) {
      val timestamp = System.currentTimeMillis().toString
      val streamPath = "rtmp://" + liveMeeting.props.screenshareProps.red5ScreenshareIp + "/" +
        liveMeeting.props.screenshareProps.red5ScreenshareApp +
        "/" + liveMeeting.props.meetingProp.intId + "/" + liveMeeting.props.meetingProp.intId + "-" + timestamp
      log.info("handleDeskShareStartedRequest: streamPath=" + streamPath)

      // Tell FreeSwitch to broadcast to RTMP
      val msgEvent = broadcastEvent(msg.body.voiceConf, msg.body.deskshareConf, streamPath, timestamp)
      outGW.send(msgEvent)

      DeskshareModel.setDeskShareStarted(liveMeeting.deskshareModel, true)
    }
  }

}
