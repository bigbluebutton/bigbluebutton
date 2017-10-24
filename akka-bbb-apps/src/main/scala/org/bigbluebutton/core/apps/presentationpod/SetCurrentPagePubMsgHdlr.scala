package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.models.Users2x

trait SetCurrentPagePubMsgHdlr {

  this: PresentationPodHdlrs =>

  def handle(
    msg: SetCurrentPagePubMsg, state: MeetingState2x,
    liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    def broadcastSetCurrentPageEvtMsg(podId: String, presentationId: String, pageId: String, userId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        liveMeeting.props.meetingProp.intId, userId
      )
      val envelope = BbbCoreEnvelope(SetCurrentPageEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SetCurrentPageEvtMsg.NAME, liveMeeting.props.meetingProp.intId, userId)

      val body = SetCurrentPageEvtMsgBody(podId, presentationId, pageId)
      val event = SetCurrentPageEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    val podId = msg.body.podId
    val userId = msg.header.userId
    val presentationId = msg.body.presentationId
    val pageId = msg.body.pageId

    val newState = for {
      pod <- PresentationPodsApp.getPresentationPod(state, podId)
      presentationToModify <- pod.getPresentation(presentationId)
      updatedPod <- pod.setCurrentPage(presentationId, pageId)
    } yield {

      if (Users2x.userIsInPresenterGroup(liveMeeting.users2x, userId)) {
        broadcastSetCurrentPageEvtMsg(pod.id, presentationId, pageId, userId)

        val pods = state.presentationPodManager.addPod(updatedPod)
        state.update(pods)
      } else {
        state
      }
    }

    newState match {
      case Some(ns) => ns
      case None     => state
    }
  }
}
