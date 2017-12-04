package org.bigbluebutton.core.apps

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.core.apps.users.UsersApp
import org.bigbluebutton.core.models.{ OldPresenter, Roles, UserState, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.{ MsgBuilder, Sender }
import org.bigbluebutton.core.models.SystemUser

trait RightsManagementTrait extends SystemConfiguration {
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
  def permissionFailed(permissionLevel: Int, roleLevel: Int, users: Users2x, userId: String): Boolean = {
    if (applyPermissionCheck) {
      !PermissionCheck.isAllowed(permissionLevel, roleLevel, users, userId)
    } else {
      false
    }
  }

  def filterPresentationMessage(users: Users2x, userId: String): Boolean = {
    // Check if the message are delayed presentation messages from the previous presenter
    // after a switch presenter has been made. ralam nov 22, 2017
    users.purgeOldPresenters()
    val now = System.currentTimeMillis()
    users.findOldPresenter(userId) match {
      case Some(op) => now - op.changedPresenterOn < 5000
      case None     => false
    }
  }
}

object PermissionCheck {

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

  private def roleToLevel(users: Users2x, user: UserState): Int = {
    if (Users2x.userIsInPresenterGroup(users, user.intId) || user.presenter) PRESENTER_LEVEL else VIEWER_LEVEL
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
        val permLevelCheck = permissionToLevel(user) >= permissionLevel
        val roleLevelCheck = roleToLevel(users, user) >= roleLevel
        permLevelCheck && roleLevelCheck
      case None => false
    }

  }

  def ejectUserForFailedPermission(meetingId: String, userId: String, reason: String,
                                   outGW: OutMsgRouter, liveMeeting: LiveMeeting): Unit = {
    val ejectedBy = SystemUser.ID

    UsersApp.ejectUserFromMeeting(outGW, liveMeeting, userId, ejectedBy, reason)
    // send a system message to force disconnection
    Sender.sendDisconnectClientSysMsg(meetingId, userId, ejectedBy, outGW)
  }

  def addOldPresenter(users: Users2x, userId: String): OldPresenter = {
    users.addOldPresenter(userId)
  }

  def removeOldPresenter(users: Users2x, userId: String): Option[OldPresenter] = {
    users.removeOldPresenter(userId)
  }

}
