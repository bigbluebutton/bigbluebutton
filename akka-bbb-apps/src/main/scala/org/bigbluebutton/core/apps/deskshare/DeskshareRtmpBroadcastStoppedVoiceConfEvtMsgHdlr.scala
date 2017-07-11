package org.bigbluebutton.core.apps.deskshare

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.DeskshareModel

trait DeskshareRtmpBroadcastStoppedVoiceConfEvtMsgHdlr {
  this: DeskshareApp2x =>

  val outGW: OutMessageGateway

  def handleDeskshareRtmpBroadcastStoppedVoiceConfEvtMsg(msg: DeskshareRtmpBroadcastStoppedVoiceConfEvtMsg): Unit = {
    def broadcastEvent(msg: DeskshareRtmpBroadcastStoppedVoiceConfEvtMsg): Unit = {
      /*
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(ClearPublicChatHistoryEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(ClearPublicChatHistoryEvtMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = ClearPublicChatHistoryEvtMsgBody()
      val event = ClearPublicChatHistoryEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
      */
      //record(event)
    }

    log.info("handleDeskShareRTMPBroadcastStoppedRequest: isBroadcastingRTMP=" +
      DeskshareModel.isBroadcastingRTMP(liveMeeting.deskshareModel) + " URL:" +
      DeskshareModel.getRTMPBroadcastingUrl(liveMeeting.deskshareModel))

    // only valid if currently broadcasting
    if (DeskshareModel.isBroadcastingRTMP(liveMeeting.deskshareModel)) {
      log.info("STOP broadcast ALLOWED when isBroadcastingRTMP=true")
      DeskshareModel.broadcastingRTMPStopped(liveMeeting.deskshareModel)

      // notify viewers that RTMP broadcast stopped
      //outGW.send(new DeskShareNotifyViewersRTMP(props.meetingProp.intId,
      //  DeskshareModel.getRTMPBroadcastingUrl(liveMeeting.deskshareModel),
      //  msg.videoWidth, msg.videoHeight, false))
      broadcastEvent(msg)
    } else {
      log.info("STOP broadcast NOT ALLOWED when isBroadcastingRTMP=false")
    }
  }

}
