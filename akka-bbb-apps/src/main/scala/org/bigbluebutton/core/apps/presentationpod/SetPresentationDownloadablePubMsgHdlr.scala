package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait SetPresentationDownloadablePubMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

  def handle(
    msg: SetPresentationDownloadablePubMsg, state: MeetingState2x,
    liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    if (filterPresentationMessage(liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to remove presentation from meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else {
      def broadcastSetPresentationDownloadableEvtMsg(podId: String, userId: String, presentationId: String, downloadable: Boolean): Unit = {
        val routing = Routing.addMsgToClientRouting(
          MessageTypes.BROADCAST_TO_MEETING,
          liveMeeting.props.meetingProp.intId, userId
        )
        val envelope = BbbCoreEnvelope(SetPresentationDownloadableEvtMsg.NAME, routing)
        val header = BbbClientMsgHeader(SetPresentationDownloadableEvtMsg.NAME, liveMeeting.props.meetingProp.intId, userId)

        val body = SetPresentationDownloadableEvtMsgBody(podId, presentationId, downloadable)
        val event = SetPresentationDownloadableEvtMsg(header, body)
        val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
        bus.outGW.send(msgEvent)
      }

      val podId = msg.body.podId
      val presentationId = msg.body.presentationId
      val downloadable = msg.body.downloadable

      val newState = for {
        pod <- PresentationPodsApp.getPresentationPod(state, podId)
      } yield {
        broadcastSetPresentationDownloadableEvtMsg(pod.id, msg.header.userId, presentationId, downloadable)

        val pods = state.presentationPodManager.setPresentationDownloadableInPod(pod.id, presentationId, downloadable)
        state.update(pods)
      }

      newState match {
        case Some(ns) => ns
        case None     => state

      }
    }

  }
}