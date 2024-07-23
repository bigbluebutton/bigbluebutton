package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.{PresentationInPod, PresentationPage}
import PostgresProfile.api._
import spray.json.JsValue
import spray.json._
import scala.util.{Success, Failure}
import scala.concurrent.ExecutionContext

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
    uploadCompleted: Boolean,
    infiniteWhiteboard:  Boolean,
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
  val infiniteWhiteboard = column[Boolean]("infiniteWhiteboard")

  def * = (
    pageId, presentationId, num, urlsJson, content, slideRevealed, current, xOffset, yOffset, widthRatio, heightRatio, width, height, viewBoxWidth, viewBoxHeight, maxImageWidth, maxImageHeight, uploadCompleted, infiniteWhiteboard
  ) <> (PresPageDbModel.tupled, PresPageDbModel.unapply)
}

object PresPageDAO {
  implicit val ec: ExecutionContext = scala.concurrent.ExecutionContext.global

  implicit val mapFormat: JsonWriter[Map[String, String]] = new JsonWriter[Map[String, String]] {
    def write(m: Map[String, String]): JsValue = {
      JsObject(m.map { case (k, v) => k -> JsString(v) })
    }
  }

  def insert(presentationId: String, page: PresentationPage) = {
    DatabaseConnection.enqueue(
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
          uploadCompleted = page.converted,
          infiniteWhiteboard = page.infiniteWhiteboard,
        )
      )
    )
  }

  def setCurrentPage(presentation: PresentationInPod, pageId: String) = {
    DatabaseConnection.enqueue(
      sqlu"""UPDATE pres_page SET
                "current" = (case when "pageId" = $pageId then true else false end),
                "slideRevealed" = (case when "pageId" = $pageId then true else "slideRevealed" end)
                WHERE "presentationId" = ${presentation.id}"""
    )
  }

  def resizeAndMovePage(presentation: PresentationPage) = {
    DatabaseConnection.enqueue(
      TableQuery[PresPageDbTableDef]
        .filter(_.pageId === presentation.id)
        .map(p => (p.xOffset, p.yOffset, p.widthRatio, p.heightRatio))
        .update((presentation.xOffset, presentation.yOffset, presentation.widthRatio, presentation.heightRatio))
    )
  }

  def updateSlidePosition(pageId: String, width: Double, height: Double, xOffset: Double, yOffset: Double,
                          widthRatio: Double, heightRatio: Double) = {
    DatabaseConnection.enqueue(
      TableQuery[PresPageDbTableDef]
        .filter(_.pageId === pageId)
        .map(p => (p.width, p.height, p.xOffset, p.yOffset, p.viewBoxWidth, p.viewBoxHeight))
        .update((width, height, xOffset, yOffset, widthRatio, heightRatio))
    )
  }

  def updateInfiniteWhiteboard(pageId: String, infiniteWhiteboard: Boolean) = {
    DatabaseConnection.db.run(
      TableQuery[PresPageDbTableDef]
        .filter(_.pageId === pageId)
        .map(p => p.infiniteWhiteboard)
        .update(infiniteWhiteboard)
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated infiniteWhiteboard on PresPage table")
      case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating infiniteWhiteboard on PresPage: $e")
    }
  }
}
