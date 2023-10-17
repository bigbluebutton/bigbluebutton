package org.bigbluebutton.core.db

import PostgresProfile.api._
import org.bigbluebutton.core.models.{ PresentationInPod }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }
import spray.json._

case class PresPresentationDbModel(
    presentationId:         String,
    meetingId:              String,
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
    uploadErrorMsgKey:      String,
    uploadErrorDetailsJson: JsValue,
    totalPages:             Int,
    exportToChatStatus:     Option[String],
    exportToChatCurrentPage: Option[Int],
    exportToChatHasError:   Option[Boolean]
)

class PresPresentationDbTableDef(tag: Tag) extends Table[PresPresentationDbModel](tag, None, "pres_presentation") {
  val presentationId = column[String]("presentationId", O.PrimaryKey)
  val meetingId = column[String]("meetingId")
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
  val uploadErrorMsgKey = column[String]("uploadErrorMsgKey")
  val uploadErrorDetailsJson = column[JsValue]("uploadErrorDetailsJson")
  val totalPages = column[Int]("totalPages")
  val exportToChatStatus = column[Option[String]]("exportToChatStatus")
  val exportToChatCurrentPage = column[Option[Int]]("exportToChatCurrentPage")
  val exportToChatHasError = column[Option[Boolean]]("exportToChatHasError")

  //  val meeting = foreignKey("meeting_fk", meetingId, Meetings)(_.meetingId, onDelete = ForeignKeyAction.Cascade)

  def * = (
    presentationId, meetingId, name, filenameConverted, isDefault, current, downloadable, downloadFileExtension, downloadFileUri, removable,
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

  def insertOrUpdate(meetingId: String, presentation: PresentationInPod) = {
    DatabaseConnection.db.run(
      TableQuery[PresPresentationDbTableDef].insertOrUpdate(
        PresPresentationDbModel(
          presentationId = presentation.id,
          meetingId = meetingId,
          name = presentation.name,
          filenameConverted = presentation.filenameConverted,
          isDefault = presentation.default,
          current = false, //Set after pages were inserted
          downloadable = presentation.downloadable,
          downloadFileExtension = presentation.downloadFileExtension match {
            case ""                    => None
            case downloadFileExtension => Some(downloadFileExtension)
          },
          downloadFileUri = None,
          removable = presentation.removable,
          uploadInProgress = !presentation.uploadCompleted,
          uploadCompleted = presentation.uploadCompleted,
          totalPages = presentation.numPages,
          uploadErrorMsgKey = presentation.errorMsgKey,
          uploadErrorDetailsJson = presentation.errorDetails.toJson,
          exportToChatStatus = None,
          exportToChatCurrentPage = None,
          exportToChatHasError = None,
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on Presentation table!")

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
                  content = "Slide Content TODO", //TODO Get content from slide.txtUri (bbb-web should send its content)
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
              case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on PresentationPage table!")
              case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting PresentationPage: $e")
            }

          //Set current
          if (presentation.current) {
            setCurrentPres(presentation.id)
          }
        }
        case Failure(e) => DatabaseConnection.logger.error(s"Error inserting Presentation: $e")
      }
  }

  def setCurrentPres(presentationId: String) = {
    DatabaseConnection.db.run(
      sqlu"""UPDATE pres_presentation SET
                "current" = (case when "presentationId" = ${presentationId} then true else false end)
                WHERE "meetingId" = (select "meetingId" from pres_presentation where "presentationId" = ${presentationId})"""
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated current on PresPresentation table")
        case Failure(e)            => DatabaseConnection.logger.error(s"Error updating current on PresPresentation: $e")
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
        .update(errorMsgKey, errorDetails.toJson)
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
