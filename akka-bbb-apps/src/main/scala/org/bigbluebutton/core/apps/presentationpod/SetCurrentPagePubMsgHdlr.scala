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
      setCurrentPage(state, liveMeeting, bus, msg.body.podId, msg.header.userId, msg.body.presentationId, msg.body.pageId)
    }
  }

  // Makes pageId the current page when userId presents the pod, and tells the meeting.
  def setCurrentPage(state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus, podId: String,
                     userId: String, presentationId: String, pageId: String): MeetingState2x = {
    val newState = for {
      pod <- PresentationPodsApp.getPresentationPodIfPresenter(state, podId, userId)
      updatedPod <- pod.setCurrentPage(presentationId, pageId)
      page <- updatedPod.getPresentation(presentationId).flatMap(_.pages.get(pageId))
    } yield {
      PresentationSender.broadcastSetCurrentPageEvtMsg(bus, liveMeeting.props.meetingProp.intId, pod.id,
        presentationId, pageId, page.num, userId)
      val pods = state.presentationPodManager.addPod(updatedPod)
      state.update(pods)
    }

    newState.getOrElse(state)
  }
}
