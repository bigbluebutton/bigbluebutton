package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.core.api.BreakoutRoomUsersUpdateInternalMsg
import org.bigbluebutton.core.db.{ BreakoutRoomUserDAO, UserBreakoutRoomDAO }
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
        user <- Users2x.findWithBreakoutRoomId(liveMeeting.users2x, breakoutRoomUser.id)
      } yield Users2x.updateLastUserActivity(liveMeeting.users2x, user)

      //Update lastBreakout in registeredUsers to avoid lose this info when the user leaves
      for {
        breakoutRoomUser <- updatedRoom.users
        u <- RegisteredUsers.findWithBreakoutRoomId(breakoutRoomUser.id, liveMeeting.registeredUsers)
      } yield {
        if (room != null && (u.lastBreakoutRoom == null || u.lastBreakoutRoom.id != room.id)) {
          RegisteredUsers.updateUserLastBreakoutRoom(liveMeeting.registeredUsers, u, room)
        }
      }

      val usersInRoom = for {
        breakoutRoomUser <- updatedRoom.users
        u <- RegisteredUsers.findWithBreakoutRoomId(breakoutRoomUser.id, liveMeeting.registeredUsers)
      } yield u.id
      UserBreakoutRoomDAO.updateLastBreakoutRoom(props.meetingProp.intId, usersInRoom, updatedRoom)
      BreakoutRoomUserDAO.updateUserJoined(props.meetingProp.intId, usersInRoom, updatedRoom)
      model.update(updatedRoom)
    }

    breakoutModel match {
      case Some(model) => state.update(Some(model))
      case None        => state
    }

  }
}
