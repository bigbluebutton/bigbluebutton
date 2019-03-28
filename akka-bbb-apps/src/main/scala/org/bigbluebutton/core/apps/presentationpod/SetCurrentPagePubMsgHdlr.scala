package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait SetCurrentPagePubMsgHdlr extends RightsManagementTrait {

  this: PresentationPodHdlrs =>

  def handle(
      msg: SetCurrentPagePubMsg, state: MeetingState2x,
      liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    if (filterPresentationMessage(liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to set current presentation page."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else {
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
        pod <- PresentationPodsApp.getPresentationPodIfPresenter(state, podId, userId)
        updatedPod <- pod.setCurrentPage(presentationId, pageId)
      } yield {

        if (pod.currentPresenter == userId) {
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
}
