package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait RemovePresentationPodPubMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

  def handle(msg: RemovePresentationPodPubMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    if (filterPresentationMessage(liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to remove presentation pod from meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else {
      def buildRemovePresentationPodEvtMsg(meetingId: String, podId: String): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, msg.header.userId)
        val envelope = BbbCoreEnvelope(RemovePresentationPodEvtMsg.NAME, routing)
        val header = BbbClientMsgHeader(RemovePresentationPodEvtMsg.NAME, meetingId, msg.header.userId)

        val body = RemovePresentationPodEvtMsgBody(podId)
        val event = RemovePresentationPodEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val newState = for {
        pod <- PresentationPodsApp.getPresentationPod(state, msg.body.podId)
      } yield {
        val event = buildRemovePresentationPodEvtMsg(liveMeeting.props.meetingProp.intId, pod.id)

        bus.outGW.send(event)

        val pods = state.presentationPodManager.removePod(pod.id)
        state.update(pods)
      }

      newState match {
        case Some(ns) => ns
        case None     => state
      }

    }

  }
}
