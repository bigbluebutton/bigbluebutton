package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.models.Users2x

trait SetPresenterInPodReqMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

  def handle(
    msg: SetPresenterInPodReqMsg, state: MeetingState2x,
    liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to set presenter in presentation pod."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
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
        bus.outGW.send(msgEvent)
      }

      val podId: String = msg.body.podId
      val requesterId: String = msg.header.userId
      val nextPresenterId: String = msg.body.nextPresenterId

      val newState = for {
        user <- Users2x.findWithIntId(liveMeeting.users2x, nextPresenterId)
        pod <- PresentationPodsApp.getPresentationPod(state, podId)
      } yield {
        if (pod.currentPresenter != "") {
          liveMeeting.users2x.addOldPresenter(pod.currentPresenter)
        }
        val updatedPod = pod.setCurrentPresenter(nextPresenterId)
        broadcastSetPresenterInPodRespMsg(pod.id, nextPresenterId, requesterId)
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
