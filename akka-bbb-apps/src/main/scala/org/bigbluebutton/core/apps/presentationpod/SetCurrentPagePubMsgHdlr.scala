package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

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

    //    if (Users2x.isPresenter(msg.header.userId, liveMeeting.users2x)) {
    //      if (setCurrentPage(liveMeeting, msg.body.presentationId, msg.body.pageId)) {
    //        broadcastEvent(msg)
    //      }
    //    }

    val podId = msg.body.podId
    val userId = msg.header.userId
    val presentationId = msg.body.presentationId
    val pageId = msg.body.pageId

    val newState = for {
      pod <- PresentationPodsApp.getPresentationPod(state, podId)
      presenter <- PresentationPodsApp.verifyPresenterStatus(state, pod.id, userId)
      presentationToModify <- pod.getPresentation(presentationId)
      updatedPod <- pod.setCurrentPage(presentationId, pageId)
    } yield {

      // if user is in the presenter group // TODO
      // if (Users2x.isPresenter(userId, liveMeeting.users2x)) {
      broadcastSetCurrentPageEvtMsg(pod.id, presentationId, pageId, userId)

      val pods = state.presentationPodManager.addPod(updatedPod)
      state.update(pods)
    }

    newState match {
      case Some(ns) => ns
      case None     => state
    }
  }
}
