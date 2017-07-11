package org.bigbluebutton.core.apps.deskshare

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.DeskshareModel

trait DeskshareRtmpBroadcastStartedVoiceConfEvtMsgHdlr {
  this: DeskshareApp2x =>

  val outGW: OutMessageGateway

  def handleDeskshareRtmpBroadcastStartedVoiceConfEvtMsg(msg: DeskshareRtmpBroadcastStartedVoiceConfEvtMsg): Unit = {
    def broadcastEvent(msg: DeskshareRtmpBroadcastStartedVoiceConfEvtMsg): Unit = {
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
      //outGW.send(new DeskShareNotifyViewersRTMP(props.meetingProp.intId, msg.streamname, msg.videoWidth, msg.videoHeight, true))
      broadcastEvent(msg)
    } else {
      log.info("START broadcast NOT ALLOWED when isBroadcastingRTMP=true")
    }
  }

}
