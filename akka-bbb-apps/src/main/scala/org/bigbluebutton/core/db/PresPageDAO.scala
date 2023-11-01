package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.{ PresentationInPod, PresentationPage }
import PostgresProfile.api._
import spray.json.JsValue
import spray.json._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class PresPageDbModel(
    pageId:          String,
    presentationId:  String,
    num:             Int,
    urlsJson:        JsValue,
    content:         String,
    slideRevealed:   Boolean,
    current:         Boolean,
    xOffset:         Double,
    yOffset:         Double,
    widthRatio:      Double,
    heightRatio:     Double,
    width:           Double,
    height:          Double,
    viewBoxWidth:    Double,
    viewBoxHeight:   Double,
    maxImageWidth:   Int,
    maxImageHeight:  Int,
    uploadCompleted: Boolean
)

class PresPageDbTableDef(tag: Tag) extends Table[PresPageDbModel](tag, None, "pres_page") {
  val pageId = column[String]("pageId", O.PrimaryKey)
  val presentationId = column[String]("presentationId")
  val num = column[Int]("num")
  val urlsJson = column[JsValue]("urlsJson")
  val content = column[String]("content")
  val slideRevealed = column[Boolean]("slideRevealed")
  val current = column[Boolean]("current")
  val xOffset = column[Double]("xOffset")
  val yOffset = column[Double]("yOffset")
  val widthRatio = column[Double]("widthRatio")
  val heightRatio = column[Double]("heightRatio")
  val width = column[Double]("width")
  val height = column[Double]("height")
  val viewBoxWidth = column[Double]("viewBoxWidth")
  val viewBoxHeight = column[Double]("viewBoxHeight")
  val maxImageWidth = column[Int]("maxImageWidth")
  val maxImageHeight = column[Int]("maxImageHeight")
  val uploadCompleted = column[Boolean]("uploadCompleted")
  //  val presentation = foreignKey("presentation_fk", presentationId, Presentations)(_.presentationId, onDelete = ForeignKeyAction.Cascade)
  def * = (pageId, presentationId, num, urlsJson, content, slideRevealed, current, xOffset, yOffset, widthRatio, heightRatio, width, height, viewBoxWidth, viewBoxHeight, maxImageWidth, maxImageHeight, uploadCompleted) <> (PresPageDbModel.tupled, PresPageDbModel.unapply)
}

object PresPageDAO {
  implicit val mapFormat: JsonWriter[Map[String, String]] = new JsonWriter[Map[String, String]] {
    def write(m: Map[String, String]): JsValue = {
      JsObject(m.map { case (k, v) => k -> JsString(v) })
    }
  }
  def insert(presentationId: String, page: PresentationPage) = {
    DatabaseConnection.db.run(
      TableQuery[PresPageDbTableDef].insertOrUpdate(
        PresPageDbModel(
          pageId = page.id,
          presentationId = presentationId,
          num = page.num,
          urlsJson = page.urls.toJson,
          content = page.content,
          slideRevealed = page.current,
          current = page.current,
          xOffset = page.xOffset,
          yOffset = page.yOffset,
          widthRatio = page.widthRatio,
          heightRatio = page.heightRatio,
          width = page.width,
          height = page.height,
          viewBoxWidth = 1,
          viewBoxHeight = 1,
          maxImageWidth = 1440,
          maxImageHeight = 1080,
          uploadCompleted = page.converted
        )
      )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on PresentationPage table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting PresentationPage: $e")
      }
  }

  def setCurrentPage(presentation: PresentationInPod, pageId: String) = {
    DatabaseConnection.db.run(
      sqlu"""UPDATE pres_page SET
                "current" = (case when "pageId" = ${pageId} then true else false end),
                "slideRevealed" = (case when "pageId" = ${pageId} then true else "slideRevealed" end)
                WHERE "presentationId" = ${presentation.id}"""
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated current on PresPage table")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating current on PresPage: $e")
      }
  }

  def resizeAndMovePage(presentation: PresentationPage) = {
    DatabaseConnection.db.run(
      TableQuery[PresPageDbTableDef]
        .filter(_.pageId === presentation.id)
        .map(p => (p.xOffset, p.yOffset, p.widthRatio, p.heightRatio))
        .update((presentation.xOffset, presentation.yOffset, presentation.widthRatio, presentation.heightRatio))
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated size on PresPage table")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating size on PresPage: $e")
      }
  }

  def updateSlidePosition(pageId: String, width: Double, height: Double, xOffset: Double, yOffset: Double,
                          widthRatio: Double, heightRatio: Double) = {
    DatabaseConnection.db.run(
      TableQuery[PresPageDbTableDef]
        .filter(_.pageId === pageId)
        .map(p => (p.width, p.height, p.xOffset, p.yOffset, p.viewBoxWidth, p.viewBoxHeight))
        .update((width, height, xOffset, yOffset, widthRatio, heightRatio))
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated slide position on PresPage table")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating slide position on PresPage: $e")
      }
  }
}