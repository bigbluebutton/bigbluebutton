package org.bigbluebutton.core.db

import org.bigbluebutton.common2.msgs.AnnotationVO
import slick.jdbc.PostgresProfile.api._

case class PresAnnotationDbModel(
    annotationId:   String,
    pageId:         String,
    meetingId:      String,
    userId:         String,
    annotationInfo: String,
    lastUpdatedAt:  java.sql.Timestamp = new java.sql.Timestamp(System.currentTimeMillis())
)

class PresAnnotationDbTableDef(tag: Tag) extends Table[PresAnnotationDbModel](tag, None, "pres_annotation") {
  val annotationId = column[String]("annotationId", O.PrimaryKey)
  val pageId = column[String]("pageId")
  val meetingId = column[String]("meetingId")
  val userId = column[String]("userId")
  val annotationInfo = column[String]("annotationInfo")
  val lastUpdatedAt = column[java.sql.Timestamp]("lastUpdatedAt")
  def * = (annotationId, pageId, meetingId, userId, annotationInfo, lastUpdatedAt) <> (PresAnnotationDbModel.tupled, PresAnnotationDbModel.unapply)
}

object PresAnnotationDAO {
  // Helper method adds the synced flag into the meta field of annotations.
  def addSynced(info: Map[String, Any]): Map[String, Any] = {
    val currentMeta = info.get("meta") match {
      case Some(meta: Map[String, Any] @unchecked) => meta
      case _                                       => Map.empty[String, Any]
    }
    val newMeta = currentMeta ++ Map("synced" -> true)
    info.updated("meta", newMeta)
  }

  def insertOrUpdateMap(meetingId: String, annotations: Array[AnnotationVO], annotationUpdatedAt: Long): Unit = {
    for (annotation <- annotations) {
      val infoWithSyncedFlag = addSynced(annotation.annotationInfo)

      DatabaseConnection.enqueue(
        sqlu"""
          INSERT INTO pres_annotation
            ("annotationId", "pageId", "meetingId", "userId", "annotationInfo", "lastUpdatedAt")
          SELECT
            ${annotation.id},
            pres_page."pageId",
            pres_presentation."meetingId",
            ${annotation.userId},
            ${JsonUtils.mapToJson(infoWithSyncedFlag).compactPrint},
            ${new java.sql.Timestamp(annotationUpdatedAt)}
          FROM pres_page
          JOIN pres_presentation ON pres_presentation."presentationId" = pres_page."presentationId"
          WHERE pres_page."pageId" = ${annotation.wbId}
            AND pres_presentation."meetingId" = $meetingId
          ON CONFLICT ("annotationId") DO UPDATE
            SET
              "annotationInfo" = EXCLUDED."annotationInfo",
              "lastUpdatedAt"  = EXCLUDED."lastUpdatedAt"
            WHERE pres_annotation."pageId" = ${annotation.wbId}
        """
      )
    }
  }

  def deleteAnnotations(meetingId: String, pageId: String, userId: String, annotationIds: Array[String], annotationUpdatedAt: Long) = {
    DatabaseConnection.enqueue(
      deleteAnnotationsQuery(meetingId, pageId, annotationIds)
        .map(a => (a.annotationInfo, a.meetingId, a.userId, a.lastUpdatedAt))
        .update("", meetingId, userId, new java.sql.Timestamp(annotationUpdatedAt))
    )
  }

  private[db] def deleteAnnotationsQuery(meetingId: String, pageId: String, annotationIds: Array[String]) = {
    TableQuery[PresAnnotationDbTableDef]
      .filter(_.annotationId inSet annotationIds)
      .filter(_.pageId === pageId)
      .filter(_.meetingId === meetingId)
  }
}