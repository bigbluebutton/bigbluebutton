package org.bigbluebutton.core.db

import org.bigbluebutton.common2.msgs.AnnotationVO
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class WhiteboardAnnotationDbModel(
    annotationId:   String,
    whiteboardId:   String,
    userId:         String,
    annotationInfo: String,
    lastUpdatedAt:  java.sql.Timestamp = new java.sql.Timestamp(System.currentTimeMillis())
)

class WhiteboardAnnotationDbTableDef(tag: Tag) extends Table[WhiteboardAnnotationDbModel](tag, None, "whiteboard") {
  val annotationId = column[String]("annotationId", O.PrimaryKey)
  val whiteboardId = column[String]("whiteboardId")
  val userId = column[String]("userId")
  val annotationInfo = column[String]("annotationInfo")
  val lastUpdatedAt = column[java.sql.Timestamp]("lastUpdatedAt")
  //  def whiteboard = foreignKey("whiteboard_fk", whiteboardId, Whiteboards)(_.whiteboardId, onDelete = ForeignKeyAction.Cascade)
  def * = (annotationId, whiteboardId, userId, annotationInfo, lastUpdatedAt) <> (WhiteboardAnnotationDbModel.tupled, WhiteboardAnnotationDbModel.unapply)

}

object WhiteboardAnnotationDAO {
  def insert(meetingId: String, annotation: AnnotationVO) = {
    DatabaseConnection.db.run(
      TableQuery[WhiteboardAnnotationDbTableDef].insertOrUpdate(
        WhiteboardAnnotationDbModel(
          annotationId = annotation.id,
          whiteboardId = annotation.wbId,
          userId = annotation.userId,
          annotationInfo = annotation.annotationInfo.toString(),
          lastUpdatedAt = new java.sql.Timestamp(System.currentTimeMillis())
        )
      )
    ).onComplete {
        case Success(rowsAffected) => println(s"$rowsAffected row(s) inserted on WhiteboardAnnotation table!")
        case Failure(e)            => println(s"Error inserting WhiteboardAnnotation: $e")
      }
  }
}