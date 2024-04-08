package org.bigbluebutton.core.db

import org.bigbluebutton.core.apps.breakout.BreakoutHdlrHelpers
import org.bigbluebutton.core.domain.BreakoutRoom2x
import org.bigbluebutton.core.models.{RegisteredUsers, Roles}
import org.bigbluebutton.core.running.LiveMeeting
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

case class BreakoutRoomUserDbModel(
      breakoutRoomId:     String,
      userId:             String,
      joinURL:            String,
      joinedAt:           Option[java.sql.Timestamp],
      assignedAt:         Option[java.sql.Timestamp],
)

class BreakoutRoomUserDbTableDef(tag: Tag) extends Table[BreakoutRoomUserDbModel](tag, None, "breakoutRoom_user") {
  val breakoutRoomId = column[String]("breakoutRoomId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val joinURL = column[String]("joinURL")
  val joinedAt = column[Option[java.sql.Timestamp]]("joinedAt")
  val assignedAt = column[Option[java.sql.Timestamp]]("assignedAt")
  override def * = (breakoutRoomId, userId, joinURL, joinedAt, assignedAt) <> (BreakoutRoomUserDbModel.tupled, BreakoutRoomUserDbModel.unapply)
}

object BreakoutRoomUserDAO {

  def prepareInsert(breakoutRoomId: String, userId: String, joinURL: String) = {
    TableQuery[BreakoutRoomUserDbTableDef].insertOrUpdate(
      BreakoutRoomUserDbModel(
        breakoutRoomId = breakoutRoomId,
        userId = userId,
        joinURL = joinURL,
        joinedAt = None,
        assignedAt = Some(new java.sql.Timestamp(System.currentTimeMillis())),
      )
    )
  }

  def prepareDelete(breakoutRoomId: String, userId: String) = {
    var query = TableQuery[BreakoutRoomUserDbTableDef]
                .filter(_.userId === userId)

    //Sometimes the user is moved before he joined in any room, in this case remove all assignments
    if (breakoutRoomId.nonEmpty) {
      query = query.filter(_.breakoutRoomId === breakoutRoomId)
    }
    query.delete
  }

  def updateRoomChanged(userId: String, fromBreakoutRoomId: String, toBreakoutRoomId: String, joinUrl: String) = {
    DatabaseConnection.db.run(DBIO.seq(
      BreakoutRoomUserDAO.prepareDelete(fromBreakoutRoomId, userId),
      BreakoutRoomUserDAO.prepareInsert(toBreakoutRoomId, userId, joinUrl)
    ).transactionally)
      .onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) changed on breakoutRoom_user table!")
        case Failure(e) => DatabaseConnection.logger.debug(s"Error changing breakoutRoom_user: $e")
      }
  }

  def updateUserJoined(usersInRoom: Vector[String], breakoutRoom: BreakoutRoom2x) = {
    DatabaseConnection.db.run(
      TableQuery[BreakoutRoomUserDbTableDef]
        .filter(_.userId inSet usersInRoom)
        .filter(_.breakoutRoomId === breakoutRoom.id)
        .filter(_.joinedAt.isEmpty)
        .map(u_bk => u_bk.joinedAt)
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated joinedAt=now() on breakoutRoom_user table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating joinedAt=now() on breakoutRoom_user: $e")
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

  def insertBreakoutRoom(userId: String, room: BreakoutRoom2x, liveMeeting: LiveMeeting) = {
      for {
        (redirectToHtml5JoinURL, redirectJoinURL) <- BreakoutHdlrHelpers.getRedirectUrls(liveMeeting, userId, room.externalId, room.sequence.toString)
      } yield {
        DatabaseConnection.db.run(BreakoutRoomUserDAO.prepareInsert(room.id, userId, redirectToHtml5JoinURL))
          .onComplete {
            case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on breakoutRoom_user table!")
            case Failure(e) => DatabaseConnection.logger.debug(s"Error inserting breakoutRoom_user: $e")
          }
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