package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import org.bigbluebutton.core.models.{ PresentationInPod }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }
import spray.json._

case class PresPresentationDbModel(presentationId: String, meetingId: String, current: Boolean, downloadable: Boolean, removable: Boolean)

class PresPresentationDbTableDef(tag: Tag) extends Table[PresPresentationDbModel](tag, None, "pres_presentation") {
  val presentationId = column[String]("presentationId", O.PrimaryKey)
  val meetingId = column[String]("meetingId")
  val current = column[Boolean]("current")
  val downloadable = column[Boolean]("downloadable")
  val removable = column[Boolean]("removable")
  //  val meeting = foreignKey("meeting_fk", meetingId, Meetings)(_.meetingId, onDelete = ForeignKeyAction.Cascade)

  def * = (presentationId, meetingId, current, downloadable, removable) <> (PresPresentationDbModel.tupled, PresPresentationDbModel.unapply)
}

object PresPresentationDAO {
  implicit val mapFormat: JsonWriter[Map[String, String]] = new JsonWriter[Map[String, String]] {
    def write(m: Map[String, String]): JsValue = {
      JsObject(m.map { case (k, v) => k -> JsString(v) })
    }
  }

  def insert(meetingId: String, presentation: PresentationInPod) = {
    DatabaseConnection.db.run(
      TableQuery[PresPresentationDbTableDef].insertOrUpdate(
        PresPresentationDbModel(
          presentationId = presentation.id,
          meetingId = meetingId,
          current = false, //Set after pages were inserted
          downloadable = presentation.downloadable,
          removable = presentation.removable
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
                  urls = page._2.urls.toJson.asJsObject.prettyPrint,
                  current = page._2.current,
                  xOffset = page._2.xOffset,
                  yOffset = page._2.yOffset,
                  widthRatio = page._2.widthRatio,
                  heightRatio = page._2.heightRatio,
                )
              )
            }
          ).transactionally)
            .onComplete {
              case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on PresentationPage table!")
              case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting PresentationPage: $e")
            }

          //Set current
          if(presentation.current) {
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
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating current on PresPresentation: $e")
    }
  }

}