package org.bigbluebutton.core.apps.screenshare

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.ScreenshareModel
import org.bigbluebutton.core.running.OutMsgRouter

trait ScreenshareStartedVoiceConfEvtMsgHdlr {
  this: ScreenshareApp2x =>

  val outGW: OutMsgRouter

  def handleScreenshareStartedVoiceConfEvtMsg(msg: ScreenshareStartedVoiceConfEvtMsg): Unit = {

    def broadcastEvent(voiceConf: String, screenshareConf: String, url: String, timestamp: String): BbbCommonEnvCoreMsg = {

      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(ScreenshareStartRtmpBroadcastVoiceConfMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(
        ScreenshareStartRtmpBroadcastVoiceConfMsg.NAME,
        liveMeeting.props.meetingProp.intId
      )

      val body = ScreenshareStartRtmpBroadcastVoiceConfMsgBody(voiceConf: String, screenshareConf: String, url: String, timestamp: String)
      val event = ScreenshareStartRtmpBroadcastVoiceConfMsg(header, body)
      BbbCommonEnvCoreMsg(envelope, event)
    }

    log.info("handleScreenshareStartedRequest: dsStarted=" + ScreenshareModel.getScreenshareStarted(liveMeeting.screenshareModel))

    if (!ScreenshareModel.getScreenshareStarted(liveMeeting.screenshareModel)) {
      val timestamp = System.currentTimeMillis().toString
      val streamPath = "rtmp://" + liveMeeting.props.screenshareProps.red5ScreenshareIp + "/" +
        liveMeeting.props.screenshareProps.red5ScreenshareApp +
        "/" + liveMeeting.props.meetingProp.intId + "/" + liveMeeting.props.meetingProp.intId + "-" + timestamp

      log.info("handleScreenshareStartedRequest: streamPath=" + streamPath)

      // Tell FreeSwitch to broadcast to RTMP
      val msgEvent = broadcastEvent(msg.body.voiceConf, msg.body.screenshareConf, streamPath, timestamp)
      outGW.send(msgEvent)

      ScreenshareModel.setScreenshareStarted(liveMeeting.screenshareModel, true)
    }
  }

}
