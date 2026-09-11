package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.PresPageDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait SlideResizedPubMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

  def handle(msg: SlideResizedPubMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus) = {
    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to resize a slide."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else if (PresentationPodsApp.pageBelongsToMeeting(state, msg.body.pageId)) {
      PresPageDAO.updateSlidePosition(msg.body.pageId, msg.body.width, msg.body.height,
        msg.body.xOffset, msg.body.yOffset, msg.body.widthRatio, msg.body.heightRatio)
    }
    state
  }
}
