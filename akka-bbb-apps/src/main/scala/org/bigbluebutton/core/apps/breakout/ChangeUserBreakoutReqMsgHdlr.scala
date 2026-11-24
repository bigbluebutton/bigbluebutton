package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.UpdateBreakoutUserAccessInternalMsg
import org.bigbluebutton.core.apps.breakout.BreakoutHdlrHelpers.getRedirectUrls
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.BigBlueButtonEvent
import org.bigbluebutton.core.db.{ BreakoutRoomUserDAO, NotificationDAO }
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ RegisteredUsers, Users2x }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait ChangeUserBreakoutReqMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleChangeUserBreakoutReqMsg(msg: ChangeUserBreakoutReqMsg, state: MeetingState2x): MeetingState2x = {

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to move user among breakout rooms."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
      state
    } else {
      val meetingId = liveMeeting.props.meetingProp.intId
      val userSessions = RegisteredUsers.findAllSessionsWithUserId(msg.body.userId, liveMeeting.registeredUsers)

      val restoreUserIds = userSessions
        .filter(ru => Users2x.findWithIntId(liveMeeting.users2x, ru.id).nonEmpty)
        .map(_.id)

      val breakoutModelOpt = state.breakout
      val roomToOpt = breakoutModelOpt.flatMap(_.find(msg.body.toBreakoutId))

      if (roomToOpt.isEmpty) {
        log.warning("Ignoring ChangeUserBreakoutReqMsg. Room {} not found in meeting {}", msg.body.toBreakoutId, meetingId)
      }

      for {
        breakoutModel <- breakoutModelOpt
        roomTo <- roomToOpt
      } yield {
        //Eject user from room From
        for {
          roomFrom <- breakoutModel.rooms.get(msg.body.fromBreakoutId)
        } yield {
          BreakoutHdlrHelpers.ejectUserFromBreakoutRoom(eventBus, meetingId, roomFrom, msg.body.userId, msg.header.userId, "User moved to another room")
        }

        BreakoutHdlrHelpers.revokeUserAccessToBreakoutRooms(
          liveMeeting,
          eventBus,
          breakoutModel.rooms.values.filter(room => room.id != roomTo.id),
          msg.body.userId
        )

        restoreUserIds.foreach(userId => {
          eventBus.publish(BigBlueButtonEvent(roomTo.id, UpdateBreakoutUserAccessInternalMsg(meetingId, roomTo.id, userId + "-" + roomTo.sequence, revoked = false)))
        })

        //Get join URL for room To
        val redirectToHtml5JoinURL = getRedirectUrls(liveMeeting, msg.body.userId, roomTo.externalId, roomTo.sequence.toString)
          .map { case (redirectToHtml5JoinURL, redirectJoinURL) => redirectToHtml5JoinURL }
          .getOrElse("")

        BreakoutHdlrHelpers.sendChangeUserBreakoutMsg(
          outGW,
          meetingId,
          msg.body.userId,
          msg.body.fromBreakoutId,
          msg.body.toBreakoutId,
          redirectToHtml5JoinURL,
        )

        //Update database
        BreakoutRoomUserDAO.updateUserMovedToRoom(
          meetingId,
          msg.body.userId,
          msg.body.toBreakoutId,
          redirectToHtml5JoinURL)

        //Send notification to moved User
        for {
          _ <- breakoutModel.rooms.get(msg.body.fromBreakoutId)
        } yield {
          val notifyUserEvent = MsgBuilder.buildNotifyUserInMeetingEvtMsg(
            msg.body.userId,
            liveMeeting.props.meetingProp.intId,
            "info",
            "promote",
            "app.updateBreakoutRoom.userChangeRoomNotification",
            "Notification to warn user was moved to another room",
            Map("roomName" -> roomTo.shortName)
          )
          outGW.send(notifyUserEvent)
          NotificationDAO.insert(notifyUserEvent)
        }
      }

      state
    }
  }

}
