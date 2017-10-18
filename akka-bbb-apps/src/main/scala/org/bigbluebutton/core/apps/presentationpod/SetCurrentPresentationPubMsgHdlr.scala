package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait SetCurrentPresentationPubMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(
    msg: SetCurrentPresentationPubMsg, state: MeetingState2x,
    liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    def broadcastSetCurrentPresentationEvent(podId: String, userId: String, presentationId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, userId)
      val envelope = BbbCoreEnvelope(SetCurrentPresentationEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SetCurrentPresentationEvtMsg.NAME, liveMeeting.props.meetingProp.intId, userId)

      val body = SetCurrentPresentationEvtMsgBody(podId, presentationId)
      val event = SetCurrentPresentationEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val podId = msg.body.podId
    val presId = msg.body.presentationId

    val newState = for {
      pod <- PresentationPodsApp.getPresentationPod(state, podId)
      //      presentation <- setCurrentPresentation(liveMeeting, pod.id, presId)
    } yield {

      // unset old current
      PresentationPodsApp.getPresentationPod(state, podId)
      // TODO

      // set new current
      // TODO

      broadcastSetCurrentPresentationEvent(podId, msg.header.userId, presId)
    }
    state

  }
}
