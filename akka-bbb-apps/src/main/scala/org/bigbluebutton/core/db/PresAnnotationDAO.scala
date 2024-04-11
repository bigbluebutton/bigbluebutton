package org.bigbluebutton.core.db

import org.bigbluebutton.common2.msgs.AnnotationVO
import scala.util.{ Failure, Success }
import slick.jdbc.PostgresProfile.api._
import scala.concurrent.ExecutionContext.Implicits.global

case class PresAnnotationDbModel(
    annotationId:        String,
    pageId:              String,
    userId:              String,
    annotationInfo:      String,
    lastHistorySequence: Int,
    lastUpdatedAt:       java.sql.Timestamp = new java.sql.Timestamp(System.currentTimeMillis())
)

class PresAnnotationDbTableDef(tag: Tag) extends Table[PresAnnotationDbModel](tag, None, "pres_annotation") {
  val annotationId = column[String]("annotationId", O.PrimaryKey)
  val pageId = column[String]("pageId")
  val userId = column[String]("userId")
  val annotationInfo = column[String]("annotationInfo")
  val lastHistorySequence = column[Int]("lastHistorySequence")
  val lastUpdatedAt = column[java.sql.Timestamp]("lastUpdatedAt")
  //  def whiteboard = foreignKey("whiteboard_fk", whiteboardId, Whiteboards)(_.whiteboardId, onDelete = ForeignKeyAction.Cascade)
  def * = (annotationId, pageId, userId, annotationInfo, lastHistorySequence, lastUpdatedAt) <> (PresAnnotationDbModel.tupled, PresAnnotationDbModel.unapply)
}

object PresAnnotationDAO {
  def insertOrUpdate(annotation: AnnotationVO, annotationDiff: AnnotationVO) = {
    PresAnnotationHistoryDAO.insert(annotationDiff).onComplete {
      case Success(sequence) => {
        DatabaseConnection.logger.debug(s"Sequence generated to PresAnnotationHistory record: $sequence")
        DatabaseConnection.db.run(
          TableQuery[PresAnnotationDbTableDef].insertOrUpdate(
            PresAnnotationDbModel(
              annotationId = annotation.id,
              pageId = annotation.wbId,
              userId = annotation.userId,
              annotationInfo = JsonUtils.mapToJson(annotation.annotationInfo).compactPrint,
              lastHistorySequence = sequence.getOrElse(0),
              lastUpdatedAt = new java.sql.Timestamp(System.currentTimeMillis())
            )
          )
        ).onComplete {
            case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted or updated on PresAnnotation table!")
            case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting or updating PresAnnotation: $e")
          }

      }
      case Failure(e) => DatabaseConnection.logger.error(s"Error inserting PresAnnotationHistory: $e")
    }
  }

  def prepareInsertOrUpdate(annotation: AnnotationVO) = {
    TableQuery[PresAnnotationDbTableDef].insertOrUpdate(
      PresAnnotationDbModel(
        annotationId = annotation.id,
        pageId = annotation.wbId,
        userId = annotation.userId,
        annotationInfo = JsonUtils.mapToJson(annotation.annotationInfo).compactPrint,
        lastHistorySequence = 0,
        lastUpdatedAt = new java.sql.Timestamp(System.currentTimeMillis())
      )
    )
  }

  def insertOrUpdateMap(annotations: Map[String, AnnotationVO]) = {
    DatabaseConnection.db.run(
      DBIO.sequence(
        annotations.map { annotation =>
          prepareInsertOrUpdate(annotation._2)
        }
      ).transactionally
    )
      .onComplete {
        case Success(rowsAffected) =>
          DatabaseConnection.logger.debug(s"${rowsAffected.sum} row(s) inserted or updated on PresAnnotation table!")
        case Failure(e) =>
          DatabaseConnection.logger.debug(s"Error inserting or updating PresAnnotation: $e")
      }
  }

  def delete(wbId: String, userId: String, annotationId: String) = {
    PresAnnotationHistoryDAO.delete(wbId, userId, annotationId).onComplete {
      case Success(sequence) => {
        DatabaseConnection.db.run(
          TableQuery[PresAnnotationDbTableDef]
            .filter(_.annotationId === annotationId)
            .map(a => (a.annotationInfo, a.lastHistorySequence, a.lastUpdatedAt))
            .update("", sequence.getOrElse(0), new java.sql.Timestamp(System.currentTimeMillis()))
        ).onComplete {
            case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated annotationInfo=null on PresAnnotation table!")
            case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating annotationInfo=null PresAnnotation: $e")
          }
      }
      case Failure(e) => DatabaseConnection.logger.error(s"Error inserting PresAnnotationHistory: $e")
    }
  }

  def delete(annotationIds: Array[String]) = {
    DatabaseConnection.db.run(
      TableQuery[PresAnnotationDbTableDef]
        .filter(_.annotationId inSet annotationIds)
        .map(a => (a.annotationInfo, a.lastHistorySequence, a.lastUpdatedAt))
        .update("", 0, new java.sql.Timestamp(System.currentTimeMillis()))
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated annotationInfo=null on PresAnnotation table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating annotationInfo=null PresAnnotation: $e")
      }
  }

}