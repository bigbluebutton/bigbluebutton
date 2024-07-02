package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._

case class PresPageCursorDbModel(
    pageId:        String,
    meetingId:     String,
    userId:        String,
    xPercent:      Double,
    yPercent:      Double,
    lastUpdatedAt: java.sql.Timestamp = new java.sql.Timestamp(System.currentTimeMillis())
)

class PresPageCursorDbTableDef(tag: Tag) extends Table[PresPageCursorDbModel](tag, None, "pres_page_cursor") {
  override def * = (
    pageId, meetingId, userId, xPercent, yPercent, lastUpdatedAt
  ) <> (PresPageCursorDbModel.tupled, PresPageCursorDbModel.unapply)
  val pageId = column[String]("pageId", O.PrimaryKey)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val xPercent = column[Double]("xPercent")
  val yPercent = column[Double]("yPercent")
  val lastUpdatedAt = column[java.sql.Timestamp]("lastUpdatedAt")
}

object PresPageCursorDAO {

  def insertOrUpdate(pageId: String, meetingId: String, userId: String, xPercent: Double, yPercent: Double) = {
    DatabaseConnection.enqueue(
      TableQuery[PresPageCursorDbTableDef].insertOrUpdate(
        PresPageCursorDbModel(
          pageId = pageId,
          meetingId = meetingId,
          userId = userId,
          xPercent = xPercent,
          yPercent = yPercent,
          lastUpdatedAt = new java.sql.Timestamp(System.currentTimeMillis()),
        )
      )
    )
  }

  def clearUnusedCursors(meetingId: String, pageId: String, enabledUsers: Array[String]): Unit = {
    val deleteQuery = TableQuery[PresPageCursorDbTableDef]
      .filter(_.pageId === pageId)

    if(enabledUsers.length > 0) {
      deleteQuery.filter(_.meetingId === meetingId)
      deleteQuery.filterNot(_.userId inSet enabledUsers)
    }

    DatabaseConnection.enqueue(deleteQuery.delete)
  }

}
