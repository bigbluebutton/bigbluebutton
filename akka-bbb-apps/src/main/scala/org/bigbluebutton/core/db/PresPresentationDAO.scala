package org.bigbluebutton.core.db

import PostgresProfile.api._
import org.bigbluebutton.core.models.PresentationInPod

import scala.concurrent.ExecutionContext.Implicits.global
import spray.json._

case class PresPresentationDbModel(
    presentationId:         String,
    meetingId:              String,
    uploadUserId:           Option[String],
    uploadTemporaryId:      Option[String],
    uploadToken:            Option[String],
    name:                   String,
    filenameConverted:      String,
    isDefault:              Boolean,
    current:                Boolean,
    downloadable:           Boolean,
    downloadFileExtension:  Option[String],
    downloadFileUri:        Option[String],
    removable:              Boolean,
    uploadInProgress:       Boolean,
    uploadCompleted:        Boolean,
    uploadErrorMsgKey:      Option[String],
    uploadErrorDetailsJson: Option[JsValue],
    totalPages:             Int,
    exportToChatStatus:     Option[String],
    exportToChatCurrentPage: Option[Int],
    exportToChatHasError:   Option[Boolean]
)

class PresPresentationDbTableDef(tag: Tag) extends Table[PresPresentationDbModel](tag, None, "pres_presentation") {
  val presentationId = column[String]("presentationId", O.PrimaryKey)
  val meetingId = column[String]("meetingId")
  val uploadUserId = column[Option[String]]("uploadUserId")
  val uploadTemporaryId = column[Option[String]]("uploadTemporaryId")
  val uploadToken = column[Option[String]]("uploadToken")
  val name = column[String]("name")
  val filenameConverted = column[String]("filenameConverted")
  val isDefault = column[Boolean]("isDefault")
  val current = column[Boolean]("current")
  val downloadable = column[Boolean]("downloadable")
  val downloadFileExtension = column[Option[String]]("downloadFileExtension")
  val downloadFileUri = column[Option[String]]("downloadFileUri")
  val removable = column[Boolean]("removable")
  val uploadInProgress = column[Boolean]("uploadInProgress")
  val uploadCompleted = column[Boolean]("uploadCompleted")
  val uploadErrorMsgKey = column[Option[String]]("uploadErrorMsgKey")
  val uploadErrorDetailsJson = column[Option[JsValue]]("uploadErrorDetailsJson")
  val totalPages = column[Int]("totalPages")
  val exportToChatStatus = column[Option[String]]("exportToChatStatus")
  val exportToChatCurrentPage = column[Option[Int]]("exportToChatCurrentPage")
  val exportToChatHasError = column[Option[Boolean]]("exportToChatHasError")

  //  val meeting = foreignKey("meeting_fk", meetingId, Meetings)(_.meetingId, onDelete = ForeignKeyAction.Cascade)

  def * = (
    presentationId, meetingId, uploadUserId, uploadTemporaryId, uploadToken,  name, filenameConverted, isDefault, current, downloadable, downloadFileExtension, downloadFileUri, removable,
    uploadInProgress, uploadCompleted, uploadErrorMsgKey, uploadErrorDetailsJson, totalPages,
    exportToChatStatus, exportToChatCurrentPage, exportToChatHasError
  ) <> (PresPresentationDbModel.tupled, PresPresentationDbModel.unapply)
}

object PresPresentationDAO {
  implicit val mapFormat: JsonWriter[Map[String, String]] = new JsonWriter[Map[String, String]] {
    def write(m: Map[String, String]): JsValue = {
      JsObject(m.map { case (k, v) => k -> JsString(v) })
    }
  }

  def insertToken(meetingId: String, userId: String, temporaryId: String, presentationId: String, uploadToken: String, filename: String) = {
    DatabaseConnection.enqueue(
      TableQuery[PresPresentationDbTableDef].forceInsert(
        PresPresentationDbModel(
          presentationId = presentationId,
          meetingId = meetingId,
          uploadUserId = Some(userId),
          uploadTemporaryId = Some(temporaryId),
          uploadToken = Some(uploadToken),
          name = filename,
          filenameConverted = "",
          isDefault = false,
          current = false, //Set after pages were inserted
          downloadable = false,
          downloadFileExtension = None,
          downloadFileUri = None,
          removable = false,
          uploadInProgress = false,
          uploadCompleted = false,
          totalPages = 0,
          uploadErrorMsgKey = None,
          uploadErrorDetailsJson = None,
          exportToChatStatus = None,
          exportToChatCurrentPage = None,
          exportToChatHasError = None,
        )
      )
    )
  }

  def updateConversionStarted(meetingId: String, presentation: PresentationInPod) = {
    val presentationQuery = TableQuery[PresPresentationDbTableDef].filter(_.presentationId === presentation.id)
      DatabaseConnection.db.run(presentationQuery.exists.result).map { exists =>
        if (!exists) {
          insertToken(meetingId, "", "", presentation.id, "", presentation.name)
        }

        DatabaseConnection.enqueue(
          presentationQuery.map(p => (
          p.name,
          p.filenameConverted,
          p.isDefault,
          p.downloadable,
          p.downloadFileExtension,
          p.removable,
          p.uploadInProgress,
          p.uploadCompleted,
          p.totalPages,
          p.uploadErrorMsgKey,
          p.uploadErrorDetailsJson
        ))
        .update(
          presentation.name,
          presentation.filenameConverted,
          presentation.default,
          presentation.downloadable,
          if (presentation.downloadFileExtension.isEmpty) None else Some(presentation.downloadFileExtension),
          presentation.removable,
          !presentation.uploadCompleted,
          presentation.uploadCompleted,
          presentation.numPages,
          if (presentation.errorMsgKey.isEmpty) None else Some(presentation.errorMsgKey),
          if (presentation.errorDetails.isEmpty) None else Some(presentation.errorDetails.toJson)
        ))
    }
  }


  def updatePages(presentation: PresentationInPod) = {
    DatabaseConnection.enqueue(
      TableQuery[PresPresentationDbTableDef]
        .filter(_.presentationId === presentation.id)
        .map(p => (p.downloadFileExtension, p.uploadInProgress, p.uploadCompleted, p.totalPages))
        .update((
          presentation.downloadFileExtension match {
            case "" => None
            case downloadFileExtension => Some(downloadFileExtension)
          },
          !presentation.uploadCompleted,
          presentation.uploadCompleted,
          presentation.numPages,
        ))
    )

    DatabaseConnection.enqueue(DBIO.sequence(
        for {
          page <- presentation.pages
        } yield {
          TableQuery[PresPageDbTableDef].insertOrUpdate(
            PresPageDbModel(
              pageId = page._2.id,
              presentationId = presentation.id,
              num = page._2.num,
              urlsJson = page._2.urls.toJson,
              content = page._2.content,
              slideRevealed = page._2.current,
              current = page._2.current,
              xOffset = page._2.xOffset,
              yOffset = page._2.yOffset,
              widthRatio = page._2.widthRatio,
              heightRatio = page._2.heightRatio,
              width = page._2.width,
              height = page._2.height,
              viewBoxWidth = 1,
              viewBoxHeight = 1,
              maxImageWidth = 1440,
              maxImageHeight = 1080,
              uploadCompleted = page._2.converted,
              infiniteCanvas = page._2.infiniteCanvas,
            )
          )
        }
      ).transactionally)

    //Set current
    if (presentation.current) {
      setCurrentPres(presentation.id)
    }
  }

  def setCurrentPres(presentationId: String) = {
    DatabaseConnection.enqueue(
      sqlu"""UPDATE pres_presentation SET
                "current" = (case when "presentationId" = ${presentationId} then true else false end)
                WHERE "meetingId" = (select "meetingId" from pres_presentation where "presentationId" = ${presentationId})
                AND exists (select 1 from pres_page where "presentationId" = ${presentationId} AND "current" IS true)"""
    )
  }

  def updateDownloadable(presentationId: String, downloadable : Boolean, downloadableExtension: String) = {
    DatabaseConnection.enqueue(
      TableQuery[PresPresentationDbTableDef]
        .filter(_.presentationId === presentationId)
        .map(p => (p.downloadable, p.downloadFileExtension))
        .update((downloadable, Some(downloadableExtension)))
    )
  }

  def updateDownloadUri(presentationId: String, downloadFileUri: String) = {
    DatabaseConnection.enqueue(
      TableQuery[PresPresentationDbTableDef]
        .filter(_.presentationId === presentationId)
        .map(p => p.downloadFileUri)
        .update(Some(downloadFileUri))
    )
  }

  def updateErrors(presentationId: String, errorMsgKey: String, errorDetails: scala.collection.immutable.Map[String, String]) = {
    DatabaseConnection.enqueue(
      TableQuery[PresPresentationDbTableDef]
        .filter(_.presentationId === presentationId)
        .map(p => (p.uploadErrorMsgKey, p.uploadErrorDetailsJson))
        .update(Some(errorMsgKey), Some(errorDetails.toJson))
    )
  }

  def updateExportToChat(presentationId: String, exportToChatStatus: String, exportToChatCurrentPage: Int, exportToChatHasError: Boolean) = {
    DatabaseConnection.enqueue(
      TableQuery[PresPresentationDbTableDef]
        .filter(_.presentationId === presentationId)
        .map(p => (p.exportToChatStatus, p.exportToChatCurrentPage, p.exportToChatHasError))
        .update(Some(exportToChatStatus), Some(exportToChatCurrentPage), Some(exportToChatHasError))
    )
  }

  def updateExportToChatStatus(presentationId: String, exportToChatStatus: String) = {
    DatabaseConnection.enqueue(
      TableQuery[PresPresentationDbTableDef]
        .filter(_.presentationId === presentationId)
        .map(p => p.exportToChatStatus)
        .update(Some(exportToChatStatus))
    )
  }

  def delete(presentationId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[PresPresentationDbTableDef]
        .filter(_.presentationId === presentationId)
        .delete
    )
  }

}