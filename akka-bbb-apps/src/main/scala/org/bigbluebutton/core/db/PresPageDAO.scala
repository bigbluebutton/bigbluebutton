package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.{ PresentationInPod, PresentationPage }

import org.bigbluebutton.core.models.PresentationInPod
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class PresPageDbModel(
    pageId:         String,
    presentationId: String,
    podId:          String,
    slideId:        String,
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
    viewBoxHeight:  Double
)

class PresPageDbTableDef(tag: Tag) extends Table[PresPageDbModel](tag, None, "pres_page") {
  val pageId = column[String]("pageId", O.PrimaryKey)
  val presentationId = column[String]("presentationId")
  val podId = column[String]("podId")
  val slideId = column[String]("slideId")
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
  //  val presentation = foreignKey("presentation_fk", presentationId, Presentations)(_.presentationId, onDelete = ForeignKeyAction.Cascade)
  def * = (pageId, presentationId, podId, slideId, num, urls, slideRevealed, current, xOffset, yOffset, widthRatio, heightRatio, width, height, viewBoxWidth, viewBoxHeight) <> (PresPageDbModel.tupled, PresPageDbModel.unapply)
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

  def resizeAndMovePage(presentation: PresentationPage, presentationId: String) = {
    DatabaseConnection.db.run(
      sqlu"""UPDATE pres_page SET
            "xOffset" = ${presentation.xOffset},
            "yOffset" = ${presentation.yOffset},
            "widthRatio" = ${presentation.widthRatio},
            "heightRatio" = ${presentation.heightRatio}
            WHERE "presentationId" = $presentationId"""
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated size on PresPage table")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating size on PresPage: $e")
      }
  }

  def addSlidePosition(presentationId: String, slideId: String, width: Double, height: Double,
                       viewBoxWidth: Double, viewBoxHeight: Double) = {
    DatabaseConnection.db.run(
      sqlu"""UPDATE pres_page SET
             "slideId" = $slideId,
             "width" = $width,
             "height" = $height,
             "viewBoxWidth" = $viewBoxWidth,
             "viewBoxHeight" = $viewBoxHeight
             WHERE "presentationId" = $presentationId"""
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) added slide position on PresPage table")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating slide position on PresPage: $e")
      }
  }

  def updateSlidePosition(presentationId: String, width: Double, height: Double, x: Double, y: Double,
                          viewBoxWidth: Double, viewBoxHeight: Double) = {
    DatabaseConnection.db.run(
      sqlu"""UPDATE pres_page SET
             "width" = $width,
             "height" = $height,
             "xOffset" = $x,
             "yOffset" = $y,
             "viewBoxWidth" = $viewBoxWidth,
             "viewBoxHeight" = $viewBoxHeight
             WHERE "presentationId" = $presentationId"""
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated slide position on PresPage table")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating slide position on PresPage: $e")
      }
  }
}