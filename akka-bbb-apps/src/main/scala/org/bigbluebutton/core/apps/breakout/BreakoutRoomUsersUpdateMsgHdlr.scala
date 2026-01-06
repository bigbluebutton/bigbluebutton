package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.core.api.BreakoutRoomUsersUpdateInternalMsg
import org.bigbluebutton.core.db.BreakoutRoomUserDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ RegisteredUsers, Users2x }
import org.bigbluebutton.core.running.{ HandlerHelpers, MeetingActor, OutMsgRouter }

trait BreakoutRoomUsersUpdateMsgHdlr extends HandlerHelpers {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleBreakoutRoomUsersUpdateInternalMsg(msg: BreakoutRoomUsersUpdateInternalMsg, state: MeetingState2x): MeetingState2x = {

    val breakoutModel = for {
      model <- state.breakout
      room <- model.find(msg.breakoutId)
    } yield {
      val updatedRoom = room.copy(users = msg.users, voiceUsers = msg.voiceUsers)

      //Update user lastActivityTime in parent room (to avoid be ejected while is in Breakout room)
      for {
        breakoutRoomUser <- updatedRoom.users
        user <- matchByBreakoutRoomId(liveMeeting.users2x, breakoutRoomUser.extId)
      } yield Users2x.updateLastUserActivity(liveMeeting.users2x, user)

      //Update lastBreakout in registeredUsers to avoid lose this info when the user leaves
      for {
        breakoutRoomUser <- updatedRoom.users
        user <- matchByBreakoutRoomId(liveMeeting.registeredUsers, breakoutRoomUser.extId)
      } yield {
        if (room != null && (user.lastBreakoutRoom == null || user.lastBreakoutRoom.id != room.id)) {
          RegisteredUsers.updateUserLastBreakoutRoom(liveMeeting.registeredUsers, user, room)
        }
      }

      for {
        breakoutRoomUser <- updatedRoom.users
        parentMeetingUser <- matchByBreakoutRoomId(liveMeeting.registeredUsers, breakoutRoomUser.extId)
      } yield {
        BreakoutRoomUserDAO.updateUserJoined(breakoutRoomUser, parentMeetingUser, updatedRoom)
      }
      model.update(updatedRoom)
    }

    breakoutModel match {
      case Some(model) => state.update(Some(model))
      case None        => state
    }

  }
}
