package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationPod
import org.bigbluebutton.core.running.LiveMeeting

trait CreateNewPresentationPodPubMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

  def handle(msg: CreateNewPresentationPodPubMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    if (permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId
    )) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to create new presentation pod."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else {
      def buildCreateNewPresentationPodEvtMsg(meetingId: String, currentPresenterId: String, podId: String): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, msg.header.userId)
        val envelope = BbbCoreEnvelope(CreateNewPresentationPodEvtMsg.NAME, routing)
        val header = BbbClientMsgHeader(CreateNewPresentationPodEvtMsg.NAME, meetingId, msg.header.userId)

        val body = CreateNewPresentationPodEvtMsgBody(currentPresenterId, podId)
        val event = CreateNewPresentationPodEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val resultPod: PresentationPod = PresentationPodsApp.createPresentationPod(msg.header.userId)

      val respMsg = buildCreateNewPresentationPodEvtMsg(
        liveMeeting.props.meetingProp.intId,
        resultPod.currentPresenter, resultPod.id
      )
      bus.outGW.send(respMsg)

      val pods = state.presentationPodManager.addPod(resultPod)

      state.update(pods)
    }

  }
}
