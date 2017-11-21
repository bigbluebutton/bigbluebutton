package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ Roles, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }

trait RemoveUserFromPresenterGroupCmdMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleRemoveUserFromPresenterGroupCmdMsg(msg: RemoveUserFromPresenterGroupCmdMsg) {

    if (permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL,
      liveMeeting.users2x,
      msg.header.userId
    )) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to remove user from presenter group."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      val userId = msg.body.userId
      val requesterId = msg.body.requesterId

      for {
        requester <- Users2x.findWithIntId(liveMeeting.users2x, requesterId)
      } yield {
        if (requester.role == Roles.MODERATOR_ROLE) {
          Users2x.removeUserFromPresenterGroup(liveMeeting.users2x, userId)
          outGW.send(buildRemoveUserFromPresenterGroup(liveMeeting.props.meetingProp.intId, userId, requesterId))
        }
      }
    }
  }

}
