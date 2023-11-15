package org.bigbluebutton.core.db

import PostgresProfile.api._
import org.bigbluebutton.core.models.PresentationInPod

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}
import spray.json._

import scala.concurrent.Future



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
    val dbRun = DatabaseConnection.db.run(
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

    dbRun.onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on Presentation table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error inserting Presentation: $e")
    }

    dbRun
  }

  def updateConversionStarted(meetingId: String, presentation: PresentationInPod) = {
    val checkAndInsert = DatabaseConnection.db.run(
      TableQuery[PresPresentationDbTableDef]
        .filter(_.presentationId === presentation.id).exists.result).flatMap { exists =>
      if (!exists) {
        insertToken(meetingId, "", "", presentation.id, "", presentation.name)
      } else {
        Future.successful(0)
      }
    }

    checkAndInsert.flatMap { _ =>
      DatabaseConnection.db.run(
        TableQuery[PresPresentationDbTableDef]
          .filter(_.presentationId === presentation.id)
          .map(p => (
            p.name,
            p.filenameConverted,
            p.isDefault,
            p.downloadable,
            p.downloadFileExtension,
            p.removable,
            p.uploadInProgress,
            p.uploadCompleted,
            p.totalPages))
          .update(
            (presentation.name,
              presentation.filenameConverted,
              presentation.default,
              presentation.downloadable,
              presentation.downloadFileExtension match {
                case "" => None
                case downloadFileExtension => Some(downloadFileExtension)
              },
              presentation.removable,
              !presentation.uploadCompleted,
              presentation.uploadCompleted,
              presentation.numPages
            ))
      )
    }.onComplete {
      case Success(rowAffected) => DatabaseConnection.logger.debug(s"$rowAffected row(s) updated basicData on PresPresentation table")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating basicData on PresPresentation: $e")
    }
  }


  def updatePages(presentation: PresentationInPod) = {
    DatabaseConnection.db.run(
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
    ).onComplete {
      case Success(rowsAffected) => {
        DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated on PresPresentation table!")

        DatabaseConnection.db.run(DBIO.sequence(
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
                  uploadCompleted = page._2.converted
                )
              )
            }
          ).transactionally)
          .onComplete {
            case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated on PresentationPage table!")
            case Failure(e) => DatabaseConnection.logger.debug(s"Error updating PresentationPage: $e")
          }

        //Set current
        if (presentation.current) {
          setCurrentPres(presentation.id)
        }

      }
      case Failure(e) => DatabaseConnection.logger.debug(s"Error updating user: $e")
    }
  }

  def setCurrentPres(presentationId: String) = {
    DatabaseConnection.db.run(
      sqlu"""UPDATE pres_presentation SET
                "current" = (case when "presentationId" = ${presentationId} then true else false end)
                WHERE "meetingId" = (select "meetingId" from pres_presentation where "presentationId" = ${presentationId})
                AND exists (select 1 from pres_page where "presentationId" = ${presentationId} AND "current" IS true)"""
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated current on PresPresentation table")
        case Failure(e)            => DatabaseConnection.logger.error(s"Error updating current on PresPresentation: $e")
      }
  }

  def updateDownloadable(presentationId: String, downloadable : Boolean, downloadableExtension: String) = {
    DatabaseConnection.db.run(
      TableQuery[PresPresentationDbTableDef]
        .filter(_.presentationId === presentationId)
        .map(p => (p.downloadable, p.downloadFileExtension))
        .update((downloadable, Some(downloadableExtension)))
    ).onComplete {
      case Success(rowAffected) => DatabaseConnection.logger.debug(s"$rowAffected row(s) updated downloadable on PresPresentation table")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating downloadable on PresPresentation: $e")
    }
  }

  def updateDownloadUri(presentationId: String, downloadFileUri: String) = {
    DatabaseConnection.db.run(
      TableQuery[PresPresentationDbTableDef]
        .filter(_.presentationId === presentationId)
        .map(p => p.downloadFileUri)
        .update(Some(downloadFileUri))
    ).onComplete {
        case Success(rowAffected) => DatabaseConnection.logger.debug(s"$rowAffected row(s) updated originalFileURI on PresPresentation table")
        case Failure(e)           => DatabaseConnection.logger.error(s"Error updating originalFileURI on PresPresentation: $e")
      }
  }

  def updateErrors(presentationId: String, errorMsgKey: String, errorDetails: scala.collection.immutable.Map[String, String]) = {
    DatabaseConnection.db.run(
      TableQuery[PresPresentationDbTableDef]
        .filter(_.presentationId === presentationId)
        .map(p => (p.uploadErrorMsgKey, p.uploadErrorDetailsJson))
        .update(Some(errorMsgKey), Some(errorDetails.toJson))
    ).onComplete {
        case Success(rowAffected) => DatabaseConnection.logger.debug(s"$rowAffected row(s) updated errorMsgKey on PresPresentation table")
        case Failure(e)           => DatabaseConnection.logger.error(s"Error updating errorMsgKey on PresPresentation: $e")
      }
  }

  def updateExportToChat(presentationId: String, exportToChatStatus: String, exportToChatCurrentPage: Int, exportToChatHasError: Boolean) = {
    DatabaseConnection.db.run(
      TableQuery[PresPresentationDbTableDef]
        .filter(_.presentationId === presentationId)
        .map(p => (p.exportToChatStatus, p.exportToChatCurrentPage, p.exportToChatHasError))
        .update(Some(exportToChatStatus), Some(exportToChatCurrentPage), Some(exportToChatHasError))
    ).onComplete {
      case Success(rowAffected) => DatabaseConnection.logger.debug(s"$rowAffected row(s) updated exportToChat on PresPresentation table")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating exportToChat on PresPresentation: $e")
    }
  }

  def updateExportToChatStatus(presentationId: String, exportToChatStatus: String) = {
    DatabaseConnection.db.run(
      TableQuery[PresPresentationDbTableDef]
        .filter(_.presentationId === presentationId)
        .map(p => p.exportToChatStatus)
        .update(Some(exportToChatStatus))
    ).onComplete {
      case Success(rowAffected) => DatabaseConnection.logger.debug(s"$rowAffected row(s) updated exportToChatStatus on PresPresentation table")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating exportToChatStatus on PresPresentation: $e")
    }
  }

  def delete(presentationId: String) = {
    DatabaseConnection.db.run(
      TableQuery[PresPresentationDbTableDef]
        .filter(_.presentationId === presentationId)
        .delete
    ).onComplete {
        case Success(rowAffected) => DatabaseConnection.logger.debug(s"$rowAffected row(s) deleted presentation on PresPresentation table")
        case Failure(e)           => DatabaseConnection.logger.error(s"Error deleting presentation on PresPresentation: $e")
      }
  }

}
