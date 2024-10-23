package org.bigbluebutton.core.db

import org.bigbluebutton.common2.msgs.AnnotationVO
import PostgresProfile.api._

case class PresAnnotationHistoryDbModel(
    annotationId:   String,
    pageId:         String,
    meetingId:      String,
    userId:         String,
    annotationInfo: String,
    updatedAt:      java.sql.Timestamp
)

class PresAnnotationHistoryDbTableDef(tag: Tag) extends Table[PresAnnotationHistoryDbModel](tag, None, "pres_annotation_history") {
  val annotationId = column[String]("annotationId")
  val pageId = column[String]("pageId")
  val meetingId = column[String]("meetingId")
  val userId = column[String]("userId")
  val annotationInfo = column[String]("annotationInfo")
  val updatedAt = column[java.sql.Timestamp]("updatedAt")
  def * = (annotationId, pageId, meetingId, userId, annotationInfo, updatedAt) <> (PresAnnotationHistoryDbModel.tupled, PresAnnotationHistoryDbModel.unapply)
}

object PresAnnotationHistoryDAO {

  def delete(wbId: String, meetingId: String, userId: String, annotationId: String, annotationUpdatedAt: Long) = {
    DatabaseConnection.enqueue(
      TableQuery[PresAnnotationHistoryDbTableDef].forceInsert(
        PresAnnotationHistoryDbModel(
          //          None,
          annotationId = annotationId,
          pageId = wbId,
          meetingId = meetingId,
          userId = userId,
          annotationInfo = "",
          updatedAt = new java.sql.Timestamp(annotationUpdatedAt)
        )
      )
    )
  }

  def prepareInsertOrUpdate(meetingId: String, annotation: AnnotationVO, annotationUpdatedAt: Long) = {
    TableQuery[PresAnnotationHistoryDbTableDef].forceInsert(
      PresAnnotationHistoryDbModel(
        annotationId = annotation.id,
        pageId = annotation.wbId,
        meetingId = meetingId,
        userId = annotation.userId,
        annotationInfo = JsonUtils.mapToJson(annotation.annotationInfo).compactPrint,
        updatedAt = new java.sql.Timestamp(annotationUpdatedAt)
      )
    )
  }

  def insertOrUpdateMap(meetingId: String, annotations: Array[AnnotationVO], annotationUpdatedAt: Long) = {
    DatabaseConnection.enqueue(
      DBIO.sequence(
        annotations.map { annotation =>
          prepareInsertOrUpdate(meetingId, annotation, annotationUpdatedAt)
        }.toVector
      ).transactionally
    )
  }

  def prepareDelete(meetingId: String, pageId: String, annotationId: String, userId: String, annotationUpdatedAt: Long) = {
    TableQuery[PresAnnotationHistoryDbTableDef].forceInsert(
      PresAnnotationHistoryDbModel(
        annotationId = annotationId,
        pageId = pageId,
        meetingId = meetingId,
        userId = userId,
        annotationInfo = "",
        updatedAt = new java.sql.Timestamp(annotationUpdatedAt)
      )
    )
  }

  def deleteAnnotations(meetingId: String, pageId: String, userId: String, annotations: Array[String], annotationUpdatedAt: Long) = {
    DatabaseConnection.enqueue(
      DBIO.sequence(
        annotations.map { annotationId =>
          prepareDelete(meetingId, pageId, annotationId, userId, annotationUpdatedAt)
        }.toVector
      ).transactionally
    )
  }
}