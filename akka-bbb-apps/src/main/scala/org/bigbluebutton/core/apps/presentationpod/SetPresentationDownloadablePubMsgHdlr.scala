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

    val meetingId = liveMeeting.props.meetingProp.intId

    if (filterPresentationMessage(liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(
        PermissionCheck.GUEST_LEVEL,
        PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId
      )) {
      val reason = "No permission to make presentation downloadable for meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else if (liveMeeting.props.meetingProp.disabledFeatures.contains("downloadPresentationOriginalFile")
      && msg.body.fileStateType == "Original") {
      val reason = "Download original presentation is disabled for meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else if (liveMeeting.props.meetingProp.disabledFeatures.contains("downloadPresentationConvertedToPdf")
      && msg.body.fileStateType == "Converted") {
      val reason = "Download converted presentation is disabled for meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else {

      val podId = msg.body.podId
      val presentationId = msg.body.presentationId
      val downloadable = msg.body.downloadable

      val newState = for {
        pod <- PresentationPodsApp.getPresentationPod(state, podId)
        pres <- pod.getPresentation(presentationId)
      } yield {
        val downloadableExtension = if (msg.body.fileStateType == "Original")
          pres.name.split("\\.").last else pres.filenameConverted.split("\\.").last

        PresentationSender.broadcastSetPresentationDownloadableEvtMsg(bus, meetingId, pod.id,
          msg.header.userId, presentationId, downloadable, pres.name, downloadableExtension)

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
