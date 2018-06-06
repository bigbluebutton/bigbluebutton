package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait RemovePresentationPubMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

  def handle(
    msg: RemovePresentationPubMsg, state: MeetingState2x,
    liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    if (filterPresentationMessage(liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to remove presentation from meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else {
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
        state.update(pods)
      }

      newState match {
        case Some(ns) => ns
        case None     => state
      }
    }

  }

}
