package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.users.AssignPresenterActionHandler
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.models.{ PresentationPod, Users2x }

trait SetPresenterInPodReqMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(
    msg: SetPresenterInPodReqMsg, state: MeetingState2x,
    liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {
    if (msg.body.podId == PresentationPod.DEFAULT_PRESENTATION_POD) {
      // Swith presenter as default presenter pod has changed.
      AssignPresenterActionHandler.handleAction(liveMeeting, bus.outGW, msg.header.userId, msg.body.nextPresenterId)
    }
    SetPresenterInPodActionHandler.handleAction(state, liveMeeting, bus.outGW, msg.header.userId, msg.body.podId, msg.body.nextPresenterId)
  }
}

object SetPresenterInPodActionHandler extends RightsManagementTrait {
  def handleAction(
    state:          MeetingState2x,
    liveMeeting:    LiveMeeting,
    outGW:          OutMsgRouter,
    assignedBy:     String,
    podId:          String,
    newPresenterId: String
  ): MeetingState2x = {

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, assignedBy)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to set presenter in presentation pod."
      PermissionCheck.ejectUserForFailedPermission(meetingId, assignedBy, reason, outGW, liveMeeting)
      state
    } else {
      def broadcastSetPresenterInPodRespMsg(podId: String, nextPresenterId: String, requesterId: String): Unit = {
        val routing = Routing.addMsgToClientRouting(
          MessageTypes.BROADCAST_TO_MEETING,
          liveMeeting.props.meetingProp.intId, requesterId
        )
        val envelope = BbbCoreEnvelope(SetPresenterInPodRespMsg.NAME, routing)
        val header = BbbClientMsgHeader(SetPresenterInPodRespMsg.NAME, liveMeeting.props.meetingProp.intId, requesterId)

        val body = SetPresenterInPodRespMsgBody(podId, nextPresenterId)
        val event = SetPresenterInPodRespMsg(header, body)
        val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
        outGW.send(msgEvent)
      }

      val newState = for {
        user <- Users2x.findWithIntId(liveMeeting.users2x, newPresenterId)
        pod <- PresentationPodsApp.getPresentationPod(state, podId)
      } yield {
        if (pod.currentPresenter != "") {
          Users2x.removeUserFromPresenterGroup(liveMeeting.users2x, pod.currentPresenter)
          liveMeeting.users2x.addOldPresenter(pod.currentPresenter)
        }
        Users2x.addUserToPresenterGroup(liveMeeting.users2x, newPresenterId)
        val updatedPod = pod.setCurrentPresenter(newPresenterId)
        broadcastSetPresenterInPodRespMsg(pod.id, newPresenterId, assignedBy)
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