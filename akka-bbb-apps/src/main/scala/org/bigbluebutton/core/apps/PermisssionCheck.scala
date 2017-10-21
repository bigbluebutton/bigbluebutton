package org.bigbluebutton.core.apps

import org.bigbluebutton.core.models.{ Roles, UserState, Users2x }
import org.bigbluebutton.core.running.OutMsgRouter
import org.bigbluebutton.core2.message.senders.{ MsgBuilder, Sender }

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
    if (user.presenter) PRESENTER_LEVEL else VIEWER_LEVEL
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
      case Some(user) =>
        println("permissionToLevel = " + permissionToLevel(user) + " permissionLevel=" + permissionLevel)
        val permLevelCheck = permissionToLevel(user) >= permissionLevel
        println("roleToLevel = " + roleToLevel(user) + " roleLevel=" + roleLevel)
        val roleLevelCheck = roleToLevel(user) >= roleLevel

        println("PERMLEVELCHECK = " + permLevelCheck + " ROLELEVELCHECK=" + roleLevelCheck)
        permLevelCheck && roleLevelCheck
        false
      case None => false
    }

  }

  def ejectUserForFailedPermission(meetingId: String, userId: String, reason: String, outGW: OutMsgRouter): Unit = {
    val ejectedBy = "SYSTEM"

    Sender.sendUserEjectedFromMeetingClientEvtMsg(meetingId, userId, ejectedBy, reason, outGW)
    // send a system message to force disconnection
    Sender.sendUserEjectedFromMeetingSystemMsg(meetingId, userId, ejectedBy, outGW)
  }
}
