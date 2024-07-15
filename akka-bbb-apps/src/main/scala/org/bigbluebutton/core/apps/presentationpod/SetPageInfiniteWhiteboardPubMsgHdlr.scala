package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.db.PresPageDAO

trait SetPageInfiniteWhiteboardPubMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

  def handle(
      msg: SetPageInfiniteWhiteboardPubMsg, state: MeetingState2x,
      liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    if (liveMeeting.props.meetingProp.disabledFeatures.contains("infiniteWhiteboard")) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "Infinite whiteboard is disabled for this meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to set infinite whiteboard."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else {
      val pageId = msg.body.pageId
      val infiniteWhiteboard = msg.body.infiniteWhiteboard

      PresPageDAO.updateInfiniteWhiteboard(pageId, infiniteWhiteboard)

      state
    }
  }
}

