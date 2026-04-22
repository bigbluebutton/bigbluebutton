package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.core.api.BreakoutRoomUsersUpdateInternalMsg
import org.bigbluebutton.core.db.BreakoutRoomUserDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ RegisteredUsers, Users2x }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait BreakoutRoomUsersUpdateMsgHdlr {
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
        user <- Users2x.findWithBreakoutRoomId(liveMeeting.users2x, breakoutRoomUser.extId)
      } yield Users2x.updateLastUserActivity(liveMeeting.users2x, user)

      //Update lastBreakout in registeredUsers to avoid lose this info when the user leaves
      for {
        breakoutRoomUser <- updatedRoom.users
        u <- RegisteredUsers.findWithBreakoutRoomId(breakoutRoomUser.extId, liveMeeting.registeredUsers)
      } yield {
        if (room != null && (u.lastBreakoutRoom == null || u.lastBreakoutRoom.id != room.id)) {
          RegisteredUsers.updateUserLastBreakoutRoom(liveMeeting.registeredUsers, u, room)
        }
      }

      for {
        breakoutRoomUser <- updatedRoom.users
        parentMeetingUser <- RegisteredUsers.findWithBreakoutRoomId(breakoutRoomUser.extId, liveMeeting.registeredUsers)
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
