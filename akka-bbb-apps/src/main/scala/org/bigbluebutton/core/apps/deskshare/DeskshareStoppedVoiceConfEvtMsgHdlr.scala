package org.bigbluebutton.core.apps.deskshare

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.DeskshareModel

trait DeskshareStoppedVoiceConfEvtMsgHdlr {
  this: DeskshareApp2x =>

  val outGW: OutMessageGateway

  def handleDeskshareStoppedVoiceConfEvtMsg(msg: DeskshareStoppedVoiceConfEvtMsg): Unit = {
    def broadcastEvent(msg: DeskshareStoppedVoiceConfEvtMsg): Unit = {
      /*
      val routing = Routing.addMsgToClientRouting(MessageTypes.SYSTEM, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(DeskshareStopRtmpBroadcastVoiceConfMsg.NAME, routing)
      val header = BbbClientMsgHeader(DeskshareStopRtmpBroadcastVoiceConfMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = DeskshareStopRtmpBroadcastVoiceConfMsgBody()
      val event = DeskshareStopRtmpBroadcastVoiceConfMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
      */
      //record(event)
    }

    log.info("handleDeskShareStoppedRequest: dsStarted=" +
      DeskshareModel.getDeskShareStarted(liveMeeting.deskshareModel) +
      " URL:" + DeskshareModel.getRTMPBroadcastingUrl(liveMeeting.deskshareModel))

    // Tell FreeSwitch to stop broadcasting to RTMP
    broadcastEvent(msg)
    //outGW.send(new DeskShareStopRTMPBroadcast(msg.conferenceName,
    //  DeskshareModel.getRTMPBroadcastingUrl(liveMeeting.deskshareModel)))

    DeskshareModel.setDeskShareStarted(liveMeeting.deskshareModel, false)
  }

}
