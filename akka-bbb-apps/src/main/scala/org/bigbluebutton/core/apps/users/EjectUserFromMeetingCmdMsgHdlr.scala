package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.Sender
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.models.{ EjectReasonCode, RegisteredUsers }

trait EjectUserFromMeetingCmdMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleEjectUserFromMeetingCmdMsg(msg: EjectUserFromMeetingCmdMsg) {
    val meetingId = liveMeeting.props.meetingProp.intId
    val userId = msg.body.userId
    val ejectedBy = msg.body.ejectedBy
    val banUser = msg.body.banUser

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
      for {
        registeredUser <- RegisteredUsers.findWithUserId(userId, liveMeeting.registeredUsers)
        ejectedByUser <- RegisteredUsers.findWithUserId(ejectedBy, liveMeeting.registeredUsers)
      } yield {
        if (registeredUser.externId != ejectedByUser.externId) {
          val ban = banUser

          // Eject users
          //println("****************** User " + ejectedBy + " ejecting user " + userId)
          // User might have joined using multiple browsers.
          // Hunt down all registered users based on extern userid and eject them all.
          // ralam april 21, 2020
          RegisteredUsers.findAllWithExternUserId(registeredUser.externId, liveMeeting.registeredUsers) foreach { ru =>
            //println("****************** User " + ejectedBy + " ejecting other user " + ru.id)
            UsersApp.ejectUserFromMeeting(
              outGW,
              liveMeeting,
              ru.id,
              ejectedBy,
              reason,
              EjectReasonCode.EJECT_USER,
              ban
            )

            log.info("Eject userId=" + userId + " by " + ejectedBy + " and ban=" + banUser)

            // send a system message to force disconnection
            Sender.sendDisconnectClientSysMsg(meetingId, ru.id, ejectedBy, EjectReasonCode.EJECT_USER, outGW)
          }
        } else {
          // User is ejecting self, so just eject this userid not all sessions if joined using multiple
          // browsers. ralam april 23, 2020
          //println("****************** User " + ejectedBy + " ejecting self " + userId)
          UsersApp.ejectUserFromMeeting(
            outGW,
            liveMeeting,
            userId,
            ejectedBy,
            reason,
            EjectReasonCode.EJECT_USER,
            ban = false
          )
          // send a system message to force disconnection
          Sender.sendDisconnectClientSysMsg(meetingId, userId, ejectedBy, EjectReasonCode.EJECT_USER, outGW)
        }

      }
    }
  }
}

trait EjectUserFromMeetingSysMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleEjectUserFromMeetingSysMsg(msg: EjectUserFromMeetingSysMsg) {
    val meetingId = liveMeeting.props.meetingProp.intId
    val userId = msg.body.userId
    val ejectedBy = msg.body.ejectedBy

    val reason = "user ejected by a component on system"
    UsersApp.ejectUserFromMeeting(
      outGW,
      liveMeeting,
      userId,
      ejectedBy,
      reason,
      EjectReasonCode.SYSTEM_EJECT_USER,
      ban = false
    )
    // send a system message to force disconnection
    Sender.sendDisconnectClientSysMsg(meetingId, userId, ejectedBy, EjectReasonCode.SYSTEM_EJECT_USER, outGW)
  }
}
