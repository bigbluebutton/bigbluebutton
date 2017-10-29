package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait RemovePresentationPubMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(
    msg: RemovePresentationPubMsg, state: MeetingState2x,
    liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    def broadcastRemovePresentationEvtMsg(podId: String, userId: String, presentationId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, userId
      )
      val envelope = BbbCoreEnvelope(RemovePresentationEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(RemovePresentationEvtMsg.NAME, liveMeeting.props.meetingProp.intId, userId)

      val body = RemovePresentationEvtMsgBody(podId, presentationId)
      val event = RemovePresentationEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val podId = msg.body.podId
    val presentationId = msg.body.presentationId

    val newState = for {
      pod <- PresentationPodsApp.getPresentationPod(state, podId)
    } yield {
      broadcastRemovePresentationEvtMsg(pod.id, msg.header.userId, presentationId)

      val pods = state.presentationPodManager.removePresentationInPod(pod.id, presentationId)
      log.warning("_____ RemovePresentationPubMsgHdlr _ " + pods.printPods())
      state.update(pods)
    }

    newState match {
      case Some(ns) => ns
      case None     => state
    }

  }

}
