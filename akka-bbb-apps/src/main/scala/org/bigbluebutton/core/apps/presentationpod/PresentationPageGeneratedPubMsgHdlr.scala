package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait PresentationPageGeneratedPubMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(msg: PresentationPageGeneratedSysPubMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def broadcastEvent(msg: PresentationPageGeneratedSysPubMsg): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )
      val envelope = BbbCoreEnvelope(PresentationPageGeneratedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(
        PresentationPageGeneratedEvtMsg.NAME,
        liveMeeting.props.meetingProp.intId, msg.header.userId
      )

      val body = PresentationPageGeneratedEvtMsgBody(msg.body.podId, msg.body.messageKey, msg.body.code, msg.body.presentationId, msg.body.numberOfPages, msg.body.pagesCompleted, msg.body.presName)
      val event = PresentationPageGeneratedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    broadcastEvent(msg)
    state
  }
}
