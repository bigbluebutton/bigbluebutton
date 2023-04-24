package org.bigbluebutton.core.db

import org.bigbluebutton.core.apps.whiteboard.Whiteboard
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

case class UserWhiteboardDbModel(
        whiteboardId:  String,
        userId:        String,
        changedModeOn: Long,
)

class UserWhiteboardDbTableDef(tag: Tag) extends Table[UserWhiteboardDbModel](tag, None, "user_whiteboard") {
  override def * = (
    whiteboardId, userId, changedModeOn) <> (UserWhiteboardDbModel.tupled, UserWhiteboardDbModel.unapply)
  def pk = primaryKey("user_whiteboard_pkey", (whiteboardId, userId))
  val whiteboardId = column[String]("whiteboardId")
  val userId = column[String]("userId")
  val changedModeOn = column[Long]("changedModeOn")
}

object UserWhiteboardDAO {

  def updateMultiuser(whiteboard: Whiteboard) = {

    val deleteQuery = TableQuery[UserWhiteboardDbTableDef]
      .filter(_.whiteboardId === whiteboard.id)
    
    if(whiteboard.multiUser.length > 0) {
      deleteQuery.filterNot(_.userId inSet whiteboard.multiUser)
    }

    DatabaseConnection.db.run(deleteQuery.delete).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"Users deleted from Whiteboard ${whiteboard.id}")
      case Failure(e) => DatabaseConnection.logger.error(s"Error deleting users from whiteboard: $e")
    }

    for {
      userId <- whiteboard.multiUser
    } yield {
      DatabaseConnection.db.run(
        TableQuery[UserWhiteboardDbTableDef].insertOrUpdate(
          UserWhiteboardDbModel(
            whiteboardId = whiteboard.id,
            userId = userId,
            changedModeOn = whiteboard.changedModeOn
          )
        )
      ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on user_whiteboard table!")
        }
        case Failure(e) => DatabaseConnection.logger.error(s"Error inserting user_whiteboard: $e")
      }
    }
  }

}
