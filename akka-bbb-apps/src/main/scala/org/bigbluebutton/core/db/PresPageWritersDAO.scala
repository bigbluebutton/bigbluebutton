package org.bigbluebutton.core.db

import org.bigbluebutton.core.apps.whiteboard.Whiteboard
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

case class PresPageWritersDbModel(
        pageId:  String,
        userId:        String,
        changedModeOn: Long,
)

class PresPageWritersDbTableDef(tag: Tag) extends Table[PresPageWritersDbModel](tag, None, "pres_page_writers") {
  override def * = (
    pageId, userId, changedModeOn) <> (PresPageWritersDbModel.tupled, PresPageWritersDbModel.unapply)
  def pk = primaryKey("pres_page_writers_pkey", (pageId, userId))
  val pageId = column[String]("pageId")
  val userId = column[String]("userId")
  val changedModeOn = column[Long]("changedModeOn")
}

object PresPageWritersDAO {

  def updateMultiuser(whiteboard: Whiteboard) = {

    val deleteQuery = TableQuery[PresPageWritersDbTableDef]
      .filter(_.pageId === whiteboard.id)
    
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
        TableQuery[PresPageWritersDbTableDef].insertOrUpdate(
          PresPageWritersDbModel(
            pageId = whiteboard.id,
            userId = userId,
            changedModeOn = whiteboard.changedModeOn
          )
        )
      ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on pres_page_writers table!")
        }
        case Failure(e) => DatabaseConnection.logger.error(s"Error inserting pres_page_writers: $e")
      }
    }
  }

}
