package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.Sender
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.models.EjectReasonCode

trait EjectUserFromMeetingCmdMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleEjectUserFromMeetingCmdMsg(msg: EjectUserFromMeetingCmdMsg) {
    val meetingId = liveMeeting.props.meetingProp.intId
    val userId = msg.body.userId
    val ejectedBy = msg.body.ejectedBy

    if (permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL,
      liveMeeting.users2x,
      msg.header.userId
    )) {

      val reason = "No permission to eject user from meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      val reason = "user ejected by another user"
      UsersApp.ejectUserFromMeeting(outGW, liveMeeting, userId, ejectedBy, reason, EjectReasonCode.EJECT_USER)
      // send a system message to force disconnection
      Sender.sendDisconnectClientSysMsg(meetingId, userId, ejectedBy, EjectReasonCode.EJECT_USER, outGW)
    }
  }

}
