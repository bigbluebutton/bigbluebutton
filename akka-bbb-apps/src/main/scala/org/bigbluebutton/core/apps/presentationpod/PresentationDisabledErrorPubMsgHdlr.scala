package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs.{ BbbClientMsgHeader, BbbCommonEnvCoreMsg, BbbCoreEnvelope, MessageTypes, PresentationDisabledErrorEvtMsg, PresentationDisabledErrorEvtMsgBody, PresentationDisabledErrorSysPubMsg, Routing }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait PresentationDisabledErrorPubMsgHdlr {

  this: PresentationPodHdlrs =>

  def handle(
      msg: PresentationDisabledErrorSysPubMsg, state: MeetingState2x,
      liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    def broadcastEvent(msg: PresentationDisabledErrorSysPubMsg): Unit = {

      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )
      val envelope = BbbCoreEnvelope(PresentationDisabledErrorEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        PresentationDisabledErrorEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )

      val body = PresentationDisabledErrorEvtMsgBody(
        msg.body.meetingId,
        msg.body.presentationName, msg.body.temporaryPresentationId, msg.body.messageKey,
        msg.body.message
      )

      val event = PresentationDisabledErrorEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    broadcastEvent(msg)
    state
  }
}
