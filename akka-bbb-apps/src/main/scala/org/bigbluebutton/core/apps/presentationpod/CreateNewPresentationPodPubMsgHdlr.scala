package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationPod
import org.bigbluebutton.core.running.LiveMeeting

trait CreateNewPresentationPodPubMsgHdlr extends SystemConfiguration {
  this: PresentationPodHdlrs =>

  def handle(msg: CreateNewPresentationPodPubMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    if (applyPermissionCheck && !PermissionCheck.isAllowed(PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to create new presentation pods."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW)
      state
    } else {
      def buildCreateNewPresentationPodEvtMsg(meetingId: String, ownerId: String, podId: String): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, ownerId)
        val envelope = BbbCoreEnvelope(CreateNewPresentationPodEvtMsg.NAME, routing)
        val header = BbbClientMsgHeader(CreateNewPresentationPodEvtMsg.NAME, meetingId, ownerId)

        val body = CreateNewPresentationPodEvtMsgBody(ownerId, podId)
        val event = CreateNewPresentationPodEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val ownerId = msg.body.ownerId

      val resultPod: PresentationPod = PresentationPodsApp.getPresentationPod(state, "DEFAULT_PRESENTATION_POD") match {
        case None => PresentationPodsApp.createDefaultPresentationPod(ownerId)
        case Some(pod) => {
          if (pod.ownerId == "") {
            PresentationPodsApp.changeOwnershipOfDefaultPod(state, ownerId).get
          } else {
            PresentationPodsApp.createPresentationPod(ownerId)
          }
        }
      }

      val respMsg = buildCreateNewPresentationPodEvtMsg(
        liveMeeting.props.meetingProp.intId,
        ownerId, resultPod.id
      )
      bus.outGW.send(respMsg)

      val pods = state.presentationPodManager.addPod(resultPod)

      state.update(pods)
    }

  }
}
