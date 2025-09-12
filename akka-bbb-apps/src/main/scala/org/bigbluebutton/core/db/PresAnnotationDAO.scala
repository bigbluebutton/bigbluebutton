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
          WITH upsert AS (
            UPDATE pres_annotation
            SET
              "annotationInfo" = ${JsonUtils.mapToJson(infoWithSyncedFlag).compactPrint},
              "lastUpdatedAt"  = ${new java.sql.Timestamp(annotationUpdatedAt)}
            WHERE "annotationId" = ${annotation.id}
            RETURNING *
          )
          INSERT INTO pres_annotation
            ("annotationId", "pageId", "meetingId", "userId", "annotationInfo", "lastUpdatedAt")
          SELECT
            ${annotation.id},
            ${annotation.wbId},
            $meetingId,
            ${annotation.userId},
            ${JsonUtils.mapToJson(infoWithSyncedFlag).compactPrint},
            ${new java.sql.Timestamp(annotationUpdatedAt)}
          WHERE NOT EXISTS (SELECT * FROM upsert)
        """
      )
    }
  }

  def deleteAnnotations(meetingId: String, userId: String, annotationIds: Array[String], annotationUpdatedAt: Long) = {
    DatabaseConnection.enqueue(
      TableQuery[PresAnnotationDbTableDef]
        .filter(_.annotationId inSet annotationIds)
        .map(a => (a.annotationInfo, a.meetingId, a.userId, a.lastUpdatedAt))
        .update("", meetingId, userId, new java.sql.Timestamp(annotationUpdatedAt))
    )
  }
}