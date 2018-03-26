package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationPod
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core2.message.senders.MsgBuilder

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

      val resultPod: PresentationPod = PresentationPodsApp.createPresentationPod(msg.header.userId)

      val respMsg = MsgBuilder.buildCreateNewPresentationPodEvtMsg(
        liveMeeting.props.meetingProp.intId,
        resultPod.currentPresenter,
        resultPod.id,
        msg.header.userId
      )

      bus.outGW.send(respMsg)

      val pods = state.presentationPodManager.addPod(resultPod)

      state.update(pods)
    }

  }
}
