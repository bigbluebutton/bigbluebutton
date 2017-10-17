package org.bigbluebutton.core.apps

import org.bigbluebutton.core.models.{ Roles, UserState, Users2x }
import org.bigbluebutton.core.running.OutMsgRouter
import org.bigbluebutton.core2.message.senders.MsgBuilder

object PermisssionCheck {

  val MOD_LEVEL = 100
  val AUTHED_LEVEL = 50
  val GUEST_LEVEL = 0

  val PRESENTER_LEVEL = 100
  val VIEWER_LEVEL = 0

  private def permissionToLevel(user: UserState): Int = {
    if (user.role == Roles.MODERATOR_ROLE) {
      MOD_LEVEL
    } else if (user.authed) {
      AUTHED_LEVEL
    } else {
      GUEST_LEVEL
    }
  }

  private def roleToLevel(user: UserState): Int = {
    if (user.role == Roles.PRESENTER_ROLE) PRESENTER_LEVEL else VIEWER_LEVEL
  }

  /**
   * This method will check if the user that issued the command has the correct permissions.
   *
   * Example of the permissions level are "AUTHENTICATED", "MODERATOR" and "GUEST". Example of roles
   * are "VIEWER" and "PRESENTER".
   *
   * @param permissionLevel Lowest permission needed to have access.
   * @param roleLevel Lowest role needed to have access.
   * @return true allows API to execute, false denies executing API
   */
  def isAllowed(permissionLevel: Int, roleLevel: Int, users: Users2x, userId: String): Boolean = {
    Users2x.findWithIntId(users, userId) match {
      case Some(user) => (permissionToLevel(user) >= permissionLevel && roleToLevel(user) >= roleLevel)
      case None       => false
    }

  }

  def ejectUserForFailedPermission(meetingId: String, userId: String, reason: String, outGW: OutMsgRouter): Unit = {
    // send a system message to force disconnection
    val ejectFromMeetingSystemEvent = MsgBuilder.buildDisconnectClientSysMsg(meetingId, userId, reason)
    outGW.send(ejectFromMeetingSystemEvent)
  }
}
