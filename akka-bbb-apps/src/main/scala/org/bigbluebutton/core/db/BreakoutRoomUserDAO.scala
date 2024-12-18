package org.bigbluebutton.core.db

import org.bigbluebutton.core.apps.breakout.BreakoutHdlrHelpers
import org.bigbluebutton.core.domain.BreakoutRoom2x
import org.bigbluebutton.core.running.LiveMeeting
import slick.jdbc.PostgresProfile.api._

case class BreakoutRoomUserDbModel(
      breakoutRoomId:     String,
      meetingId:          String,
      userId:             String,
      joinURL:            String,
      assignedAt:         Option[java.sql.Timestamp],
      inviteDismissedAt: Option[java.sql.Timestamp],
)

class BreakoutRoomUserDbTableDef(tag: Tag) extends Table[BreakoutRoomUserDbModel](tag, None, "breakoutRoom_user") {
  val breakoutRoomId = column[String]("breakoutRoomId", O.PrimaryKey)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val joinURL = column[String]("joinURL")
  val assignedAt = column[Option[java.sql.Timestamp]]("assignedAt")
  val inviteDismissedAt = column[Option[java.sql.Timestamp]]("inviteDismissedAt")
  override def * = (breakoutRoomId, meetingId, userId, joinURL, assignedAt, inviteDismissedAt) <> (BreakoutRoomUserDbModel.tupled, BreakoutRoomUserDbModel.unapply)
}

object BreakoutRoomUserDAO {

  def prepareInsert(breakoutRoomId: String, meetingId: String, userId: String, joinURL: String, wasAssignedByMod: Boolean) = {
    TableQuery[BreakoutRoomUserDbTableDef].insertOrUpdate(
      BreakoutRoomUserDbModel(
        breakoutRoomId = breakoutRoomId,
        meetingId = meetingId,
        userId = userId,
        joinURL = joinURL,
        assignedAt = wasAssignedByMod match {
          case true => Some(new java.sql.Timestamp(System.currentTimeMillis()))
          case false => None
        },
        inviteDismissedAt = None,
      )
    )
  }

  def prepareDelete(breakoutRoomId: String, meetingId: String, userId: String, exceptBreakoutRooomId: String) = {
    var query = TableQuery[BreakoutRoomUserDbTableDef]
                .filter(_.meetingId === meetingId)
                .filter(_.userId === userId)

    //Sometimes the user is moved before he joined in any room, in this case remove all assignments
    if (breakoutRoomId.nonEmpty) {
      query = query.filter(_.breakoutRoomId === breakoutRoomId)
    }

    if (exceptBreakoutRooomId.nonEmpty) {
      query = query.filter(_.breakoutRoomId =!= exceptBreakoutRooomId)
    }

    query.delete
  }

  def updateRoomChanged(meetingId: String, userId: String, fromBreakoutRoomId: String,
                        toBreakoutRoomId: String, joinUrl: String, removePreviousRoom: Boolean) = {
    DatabaseConnection.enqueue(
      if (removePreviousRoom) {
        DBIO.seq(
          BreakoutRoomUserDAO.prepareDelete(fromBreakoutRoomId, meetingId, userId, exceptBreakoutRooomId = toBreakoutRoomId),
          BreakoutRoomUserDAO.prepareInsert(toBreakoutRoomId, meetingId, userId, joinUrl, wasAssignedByMod = true)
        )
      } else {
        DBIO.seq(
          BreakoutRoomUserDAO.prepareInsert(toBreakoutRoomId, meetingId, userId, joinUrl, wasAssignedByMod = true)
        )
      }
    )
  }

  def updateUserJoined(meetingId: String, usersInRoom: Vector[String], breakoutRoom: BreakoutRoom2x) = {
    for {
      userInRoom <- usersInRoom
    } yield {
      DatabaseConnection.enqueue(
        sqlu"""UPDATE "breakoutRoom_user" SET
                "joinedAt" = current_timestamp
                WHERE "meetingId" = ${meetingId}
                AND "userId" = ${userInRoom}
                AND "breakoutRoomId" = ${breakoutRoom.id}
                AND "joinedAt" is null"""
      )
    }
  }

  def insertBreakoutRoom(userId: String, room: BreakoutRoom2x, liveMeeting: LiveMeeting) = {
      for {
        (redirectToHtml5JoinURL, redirectJoinURL) <- BreakoutHdlrHelpers.getRedirectUrls(liveMeeting, userId, room.externalId, room.sequence.toString)
      } yield {
        DatabaseConnection.enqueue(BreakoutRoomUserDAO.prepareInsert(room.id, liveMeeting.props.meetingProp.intId, userId, redirectToHtml5JoinURL, wasAssignedByMod = false))
      }
  }


  def updateInviteDismissedAt(meetingId: String, userId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[BreakoutRoomUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .map(u => (u.inviteDismissedAt))
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    )
  }

//  def updateUserJoined(meetingId: String, userId: String, breakoutRoomId: String) = {
//    DatabaseConnection.db.run(
//      TableQuery[BreakoutRoomUserDbTableDef]
//        .filter(_.breakoutRoomId === breakoutRoomId)
//        .filter(_.meetingId === meetingId)
//        .filter(_.userId === userId)
//        .map(u => u.joinedAt)
//        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
//    ).onComplete {
//      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated joinedAt on breakoutRoom_user table!")
//      case Failure(e) => DatabaseConnection.logger.error(s"Error updating joinedAt breakoutRoom_user: $e")
//    }
//  }

}