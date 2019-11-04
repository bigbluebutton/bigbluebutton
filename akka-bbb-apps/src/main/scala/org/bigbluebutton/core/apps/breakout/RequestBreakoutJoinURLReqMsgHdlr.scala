package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait RequestBreakoutJoinURLReqMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleRequestBreakoutJoinURLReqMsg(msg: RequestBreakoutJoinURLReqMsg, state: MeetingState2x): MeetingState2x = {
    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to request breakout room URL for meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      for {
        model <- state.breakout
        room <- model.find(msg.body.breakoutId)
      } yield {
        BreakoutHdlrHelpers.sendJoinURL(
          liveMeeting,
          outGW,
          msg.body.userId,
          room.externalId,
          room.sequence.toString(),
          room.id
        )
      }
    }

    state
  }
}
