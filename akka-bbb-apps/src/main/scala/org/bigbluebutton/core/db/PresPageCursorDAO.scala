package org.bigbluebutton.core.db

import org.bigbluebutton.core.apps.whiteboard.Whiteboard
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class PresPageCursorDbModel(
    pageId:        String,
    userId:        String,
    xPercent:      Double,
    yPercent:      Double,
    lastUpdatedAt: java.sql.Timestamp = new java.sql.Timestamp(System.currentTimeMillis())
)

class PresPageCursorDbTableDef(tag: Tag) extends Table[PresPageCursorDbModel](tag, None, "pres_page_cursor") {
  override def * = (
    pageId, userId, xPercent, yPercent, lastUpdatedAt
  ) <> (PresPageCursorDbModel.tupled, PresPageCursorDbModel.unapply)
  def pk = primaryKey("pres_page_cursor_pkey", (pageId, userId))
  val pageId = column[String]("pageId")
  val userId = column[String]("userId")
  val xPercent = column[Double]("xPercent")
  val yPercent = column[Double]("yPercent")
  val lastUpdatedAt = column[java.sql.Timestamp]("lastUpdatedAt")
}

object PresPageCursorDAO {

  def insertOrUpdate(pageId: String, userId: String, xPercent: Double, yPercent: Double) = {
    DatabaseConnection.db.run(
      TableQuery[PresPageCursorDbTableDef].insertOrUpdate(
        PresPageCursorDbModel(
          pageId = pageId,
          userId = userId,
          xPercent = xPercent,
          yPercent = yPercent,
          lastUpdatedAt = new java.sql.Timestamp(System.currentTimeMillis(),
        )
      )
    )).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on pres_page_cursor table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error inserting pres_page_cursor: $e")
    }
  }

}
