package org.bigbluebutton.core.apps.deskshare

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.DeskshareModel

trait DeskshareStartedVoiceConfEvtMsgHdlr {
  this: DeskshareApp2x =>

  val outGW: OutMessageGateway

  def handleDeskshareStartedVoiceConfEvtMsg(msg: DeskshareStartedVoiceConfEvtMsg): Unit = {
    def broadcastEvent(msg: DeskshareStartedVoiceConfEvtMsg): Unit = {
      /*
      val routing = Routing.addMsgToClientRouting(MessageTypes.SYSTEM, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(DeskshareStartRtmpBroadcastVoiceConfMsg.NAME, routing)
      val header = BbbClientMsgHeader(DeskshareStartRtmpBroadcastVoiceConfMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = DeskshareStartRtmpBroadcastVoiceConfMsgBody()
      val event = DeskshareStartRtmpBroadcastVoiceConfMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
      */
      //record(event)
    }

    log.info("handleDeskShareStartedRequest: dsStarted=" + DeskshareModel.getDeskShareStarted(liveMeeting.deskshareModel))

    if (!DeskshareModel.getDeskShareStarted(liveMeeting.deskshareModel)) {
      val timestamp = System.currentTimeMillis().toString
      val streamPath = "rtmp://" + liveMeeting.props.screenshareProps.red5ScreenshareIp + "/" + liveMeeting.props.screenshareProps.red5ScreenshareApp +
        "/" + liveMeeting.props.meetingProp.intId + "/" + liveMeeting.props.meetingProp.intId + "-" + timestamp
      log.info("handleDeskShareStartedRequest: streamPath=" + streamPath)

      // Tell FreeSwitch to broadcast to RTMP
      broadcastEvent(msg)
      //outGW.send(new DeskShareStartRTMPBroadcast(msg.conferenceName, streamPath))

      DeskshareModel.setDeskShareStarted(liveMeeting.deskshareModel, true)
    }
  }

}
