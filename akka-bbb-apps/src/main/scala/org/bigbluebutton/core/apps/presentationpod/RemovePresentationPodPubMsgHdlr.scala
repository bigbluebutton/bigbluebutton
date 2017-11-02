package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait RemovePresentationPodPubMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(msg: RemovePresentationPodPubMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    if (applyPermissionCheck && !PermissionCheck.isAllowed(PermissionCheck.MOD_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to remove presentation pod from meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW)
      state
    } else {
      def buildRemovePresentationPodEvtMsg(meetingId: String, ownerId: String, podId: String): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, ownerId)
        val envelope = BbbCoreEnvelope(RemovePresentationPodEvtMsg.NAME, routing)
        val header = BbbClientMsgHeader(RemovePresentationPodEvtMsg.NAME, meetingId, ownerId)

        val body = RemovePresentationPodEvtMsgBody(ownerId, podId)
        val event = RemovePresentationPodEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val requesterId = msg.body.requesterId // TODO -- use it

      val newState = for {
        pod <- PresentationPodsApp.getPresentationPod(state, msg.body.podId)
      } yield {

        val ownerId = pod.ownerId

        val event = buildRemovePresentationPodEvtMsg(
          liveMeeting.props.meetingProp.intId,
          ownerId, pod.id
        )

        bus.outGW.send(event)

        val pods = state.presentationPodManager.removePod(pod.id)
        state.update(pods)
      }

      newState match {
        case Some(ns) => ns
        case None     => state
      }

      // TODO check if requesterId == ownerId
      // TODO check about notifying only the list of authorized?

      //    val respMsg = buildRemovePresentationPodEvtMsg(
      //      liveMeeting.props.meetingProp.intId,
      //      ownerId, pod.id
      //    )
      //    bus.outGW.send(respMsg)
      //
      //    log.warning("RemovePresentationPodPubMsgHdlr new podId=" + pod.id)
      //
      //    val pods = state.presentationPodManager.removePod(pod)
      //    state.update(pods)
    }

  }
}
