package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.{ EjectUserFromBreakoutInternalMsg }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.Sender
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.BigBlueButtonEvent
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ EjectReasonCode, RegisteredUsers }

trait EjectUserFromMeetingCmdMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleEjectUserFromMeetingCmdMsg(msg: EjectUserFromMeetingCmdMsg, state: MeetingState2x) {
    val meetingId = liveMeeting.props.meetingProp.intId
    val userId = msg.body.userId
    val ejectedBy = msg.body.ejectedBy
    val banUser = msg.body.banUser

    if (permissionFailed(
      PermissionCheck.MOD_LEVEL,
      PermissionCheck.VIEWER_LEVEL,
      liveMeeting.users2x,
      msg.header.userId
    ) || liveMeeting.props.meetingProp.isBreakout) {

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

            //Eject from Breakouts
            for {
              breakoutModel <- state.breakout
            } yield {
              breakoutModel.rooms.values.foreach { room =>
                room.users.filter(u => u.id == ru.externId + "-" + room.sequence).foreach(user => {
                  eventBus.publish(BigBlueButtonEvent(room.id, EjectUserFromBreakoutInternalMsg(meetingId, room.id, user.id, ejectedBy, reason, EjectReasonCode.EJECT_USER, ban)))
                })
              }
            }

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

            log.info("Eject user {} userId={} by {} and ban=" + banUser + " in meeting {}", registeredUser.name, userId, ejectedBy, meetingId)

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
