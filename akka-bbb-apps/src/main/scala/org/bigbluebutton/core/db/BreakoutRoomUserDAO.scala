package org.bigbluebutton.core.db

import org.bigbluebutton.core.apps.BreakoutModel
import org.bigbluebutton.core.apps.breakout.BreakoutHdlrHelpers
import org.bigbluebutton.core.db.BreakoutRoomDAO.prepareInsertOrUpdate
import org.bigbluebutton.core.models.{RegisteredUsers, Roles}
import org.bigbluebutton.core.models.Users2x.findAll
import org.bigbluebutton.core.running.LiveMeeting
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

case class BreakoutRoomUserDbModel(
      breakoutRoomId:     String,
      userId:    String,
      redirectToHtml5JoinURL:    String,
      insertedAt:          Option[java.sql.Timestamp],
      joinedAt:          Option[java.sql.Timestamp],
      inviteDismissedAt:          Option[java.sql.Timestamp],
)

class BreakoutRoomUserDbTableDef(tag: Tag) extends Table[BreakoutRoomUserDbModel](tag, None, "breakoutRoom_user") {
  val breakoutRoomId = column[String]("breakoutRoomId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val redirectToHtml5JoinURL = column[String]("redirectToHtml5JoinURL")
  val insertedAt = column[Option[java.sql.Timestamp]]("insertedAt")
  val joinedAt = column[Option[java.sql.Timestamp]]("joinedAt")
  val inviteDismissedAt = column[Option[java.sql.Timestamp]]("inviteDismissedAt")
  override def * = (breakoutRoomId, userId, redirectToHtml5JoinURL, insertedAt, joinedAt, inviteDismissedAt) <> (BreakoutRoomUserDbModel.tupled, BreakoutRoomUserDbModel.unapply)
}

object BreakoutRoomUserDAO {

  def prepareInsert(breakoutRoomId: String, userId: String, redirectToHtml5JoinURL: String) = {
    TableQuery[BreakoutRoomUserDbTableDef].insertOrUpdate(
      BreakoutRoomUserDbModel(
        breakoutRoomId = breakoutRoomId,
        userId = userId,
        redirectToHtml5JoinURL = redirectToHtml5JoinURL,
        insertedAt = Some(new java.sql.Timestamp(System.currentTimeMillis())),
        joinedAt = None,
        inviteDismissedAt = None
      )
    )
  }

  def prepareDelete(breakoutRoomId: String, userId: String) = {
    TableQuery[BreakoutRoomUserDbTableDef]
      .filter(_.breakoutRoomId === breakoutRoomId)
      .filter(_.userId === userId)
      .delete
  }

  def updateRoomChanged(userId: String, fromBreakoutRoomId: String, toBreakoutRoomId: String, redirectToHtml5JoinURL: String) = {
    DatabaseConnection.db.run(DBIO.seq(
      BreakoutRoomUserDAO.prepareDelete(fromBreakoutRoomId, userId),
      BreakoutRoomUserDAO.prepareInsert(toBreakoutRoomId, userId, redirectToHtml5JoinURL)
    ).transactionally)
      .onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) changed on breakoutRoom_user table!")
        case Failure(e) => DatabaseConnection.logger.debug(s"Error changing breakoutRoom_user: $e")
      }
  }

  def updateUserEjected(userId: String, breakoutRoomId: String) = {
    DatabaseConnection.db.run(DBIO.seq(
      BreakoutRoomUserDAO.prepareDelete(userId, breakoutRoomId),
    ).transactionally)
      .onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) deleted on breakoutRoom_user table!")
        case Failure(e) => DatabaseConnection.logger.debug(s"Error deleting breakoutRoom_user: $e")
      }
  }

  def insertBreakoutRooms(userId: String, breakout: BreakoutModel, liveMeeting: LiveMeeting) = {
    //Insert users
    DatabaseConnection.db.run(DBIO.sequence(
      for {
        (_, room) <- breakout.rooms
        ru <- RegisteredUsers.findWithUserId(userId, liveMeeting.registeredUsers)
        if room.freeJoin || ru.role == Roles.MODERATOR_ROLE || room.assignedUsers.contains(ru.id)
        //TODO add users who joined after
        (redirectToHtml5JoinURL, redirectJoinURL) <- BreakoutHdlrHelpers.getRedirectUrls(liveMeeting, ru.id, room.externalId, room.sequence.toString())
      } yield {
        BreakoutRoomUserDAO.prepareInsert(room.id, ru.id, redirectToHtml5JoinURL)
      }
    ).transactionally)
      .onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on breakoutRoom_user table!")
        case Failure(e) => DatabaseConnection.logger.debug(s"Error inserting breakoutRoom_user: $e")
      }
  }

//  def updateUserJoined(userId: String, breakoutRoomId: String) = {
//    DatabaseConnection.db.run(
//      TableQuery[BreakoutRoomUserDbTableDef]
//        .filter(_.breakoutRoomId === breakoutRoomId)
//        .filter(_.userId === userId)
//        .map(u => u.joinedAt)
//        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
//    ).onComplete {
//      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated joinedAt on breakoutRoom_user table!")
//      case Failure(e) => DatabaseConnection.logger.error(s"Error updating joinedAt breakoutRoom_user: $e")
//    }
//  }

}