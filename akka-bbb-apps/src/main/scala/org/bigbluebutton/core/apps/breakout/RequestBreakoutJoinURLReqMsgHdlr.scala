package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.models.Users2x

import org.bigbluebutton.core.domain.AssignedUser;

trait RequestBreakoutJoinURLReqMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleRequestBreakoutJoinURLReqMsg(msg: RequestBreakoutJoinURLReqMsg, state: MeetingState2x): MeetingState2x = {
    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to request breakout room URL for meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
      state
    } else {

      val breakoutModel = for {
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

        val updatedAssignedUsers = Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId) match {
          case Some(value) => room.assignedUsers.:+(AssignedUser(msg.body.userId, value.name, value.email))
          case None        => room.assignedUsers
        }
        model.update(room.copy(assignedUsers = updatedAssignedUsers))
      }

      breakoutModel match {
        case Some(model) => state.update(Some(model))
        case None        => state
      }
    }
  }
}
