package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.{ PresentationInPod, PresentationPage }

import org.bigbluebutton.core.models.PresentationInPod
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class PresPageDbModel(
    pageId:         String,
    presentationId: String,
    num:            Int,
    urls:           String,
    slideRevealed:  Boolean,
    current:        Boolean,
    xOffset:        Double,
    yOffset:        Double,
    widthRatio:     Double,
    heightRatio:    Double,
    width:          Double,
    height:         Double,
    viewBoxWidth:   Double,
    viewBoxHeight:  Double,
    maxImageWidth:  Int,
    maxImageHeight: Int
)

class PresPageDbTableDef(tag: Tag) extends Table[PresPageDbModel](tag, None, "pres_page") {
  val pageId = column[String]("pageId", O.PrimaryKey)
  val presentationId = column[String]("presentationId")
  val num = column[Int]("num")
  val urls = column[String]("urls")
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
  //  val presentation = foreignKey("presentation_fk", presentationId, Presentations)(_.presentationId, onDelete = ForeignKeyAction.Cascade)
  def * = (pageId, presentationId, num, urls, slideRevealed, current, xOffset, yOffset, widthRatio, heightRatio, width, height, viewBoxWidth, viewBoxHeight, maxImageWidth, maxImageHeight) <> (PresPageDbModel.tupled, PresPageDbModel.unapply)
}

object PresPageDAO {

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

  def addSlidePosition(slideId: String, width: Double, height: Double,
                       viewBoxWidth: Double, viewBoxHeight: Double) = {
    DatabaseConnection.db.run(
      TableQuery[PresPageDbTableDef]
        .filter(_.pageId === slideId)
        .map(p => (p.width, p.height, p.viewBoxWidth, p.viewBoxHeight))
        .update((width, height, viewBoxWidth, viewBoxHeight))
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) added slide position on PresPage table")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating slide position on PresPage: $e")
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