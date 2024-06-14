package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.db.PresPageDAO

trait SetPageInfiniteCanvasPubMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

  def handle(
      msg: SetPageInfiniteCanvasPubMsg, state: MeetingState2x,
      liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to set infinite canvas."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else {
      val pageId = msg.body.pageId
      val infiniteCanvas = msg.body.infiniteCanvas

      PresPageDAO.updateInfiniteCanvas(pageId, infiniteCanvas)

      state
    }
  }
}

