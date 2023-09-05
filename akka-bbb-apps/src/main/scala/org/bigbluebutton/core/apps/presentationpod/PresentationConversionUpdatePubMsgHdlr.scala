package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

import java.util

trait PresentationConversionUpdatePubMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(msg: PresentationConversionUpdateSysPubMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def broadcastEvent(msg: PresentationConversionUpdateSysPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )
      val envelope = BbbCoreEnvelope(PresentationConversionUpdateEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        PresentationConversionUpdateEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )

      log.info("\n\n\n\n\n ----> teste aquii ---> {}", liveMeeting.clientConfiguration.get("public")
        .asInstanceOf[util.LinkedHashMap[String, Object]].get("app")
        .asInstanceOf[util.LinkedHashMap[String, Object]].get("audioCaptions"))
      val body = PresentationConversionUpdateEvtMsgBody(
        msg.body.podId,
        msg.body.messageKey,
        msg.body.code,
        msg.body.presentationId,
        msg.body.presName,
        msg.body.temporaryPresentationId
      )
      val event = PresentationConversionUpdateEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    broadcastEvent(msg)
    state
  }
}
