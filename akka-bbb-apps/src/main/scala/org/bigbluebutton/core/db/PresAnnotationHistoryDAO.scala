package org.bigbluebutton.core.db

import org.bigbluebutton.common2.msgs.AnnotationVO
import PostgresProfile.api._
import spray.json.JsValue

case class PresAnnotationHistoryDbModel(
    annotationId:   String,
    pageId:         String,
    meetingId:      String,
    userId:         String,
    annotationInfo: Option[JsValue],
    updatedAt:      java.sql.Timestamp
)

class PresAnnotationHistoryDbTableDef(tag: Tag) extends Table[PresAnnotationHistoryDbModel](tag, None, "pres_annotation_history") {
  val annotationId = column[String]("annotationId")
  val pageId = column[String]("pageId")
  val meetingId = column[String]("meetingId")
  val userId = column[String]("userId")
  val annotationInfo = column[Option[JsValue]]("annotationInfo")
  val updatedAt = column[java.sql.Timestamp]("updatedAt")
  def * = (annotationId, pageId, meetingId, userId, annotationInfo, updatedAt) <> (PresAnnotationHistoryDbModel.tupled, PresAnnotationHistoryDbModel.unapply)
}

object PresAnnotationHistoryDAO {

  def insertOrUpdateMap(meetingId: String, annotations: Array[AnnotationVO], annotationUpdatedAt: Long) = {
    val dbModels = annotations.map { annotation =>
      PresAnnotationHistoryDbModel(
        annotationId = annotation.id,
        pageId = annotation.wbId,
        meetingId = meetingId,
        userId = annotation.userId,
        annotationInfo = Some(JsonUtils.mapToJson(annotation.annotationInfo)),
        updatedAt = new java.sql.Timestamp(annotationUpdatedAt)
      )
    }
    DatabaseConnection.enqueue(
      TableQuery[PresAnnotationHistoryDbTableDef] ++= dbModels
    )
  }

  def deleteAnnotations(meetingId: String, pageId: String, userId: String, annotations: Array[String], annotationUpdatedAt: Long) = {
    val dbModels = annotations.map { annotationId =>
      PresAnnotationHistoryDbModel(
        annotationId = annotationId,
        pageId = pageId,
        meetingId = meetingId,
        userId = userId,
        annotationInfo = None,
        updatedAt = new java.sql.Timestamp(annotationUpdatedAt)
      )
    }

    DatabaseConnection.enqueue(
      TableQuery[PresAnnotationHistoryDbTableDef] ++= dbModels
    )

  }
}