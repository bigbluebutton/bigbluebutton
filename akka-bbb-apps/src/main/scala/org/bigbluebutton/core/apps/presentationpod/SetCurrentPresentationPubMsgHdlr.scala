package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait SetCurrentPresentationPubMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

  def handle(
    msg: SetCurrentPresentationPubMsg, state: MeetingState2x,
    liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    if (filterPresentationMessage(liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to change current presentation."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else {
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
      val userId = msg.header.userId

      val newState = for {
        pod <- PresentationPodsApp.getPresentationPodIfPresenter(state, podId, userId)
        updatedPod <- pod.setCurrentPresentation(presId)
      } yield {
        broadcastSetCurrentPresentationEvent(podId, userId, presId)

        val pods = state.presentationPodManager.addPod(updatedPod)
        state.update(pods)
      }

      newState match {
        case Some(ns) => ns
        case None     => state
      }
    }

  }
}
