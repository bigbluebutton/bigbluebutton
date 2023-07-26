package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.PresentationInPod
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class PresPageDbModel(
    pageId:         String,
    presentationId: String,
    podId:          String,
    num:            Int,
    urls:           String,
    slideRevealed:  Boolean,
    current:        Boolean,
    xOffset:        Double,
    yOffset:        Double,
    widthRatio:     Double,
    heightRatio:    Double,
    width:          Double,
    height:         Double
)

class PresPageDbTableDef(tag: Tag) extends Table[PresPageDbModel](tag, None, "pres_page") {
  val pageId = column[String]("pageId", O.PrimaryKey)
  val presentationId = column[String]("presentationId")
  val podId = column[String]("podId")
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
  //  val presentation = foreignKey("presentation_fk", presentationId, Presentations)(_.presentationId, onDelete = ForeignKeyAction.Cascade)
  def * = (pageId, presentationId, podId, num, urls, slideRevealed, current, xOffset, yOffset, widthRatio, heightRatio, width, height) <> (PresPageDbModel.tupled, PresPageDbModel.unapply)
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

  def resizeAndMovePage(presentation: PresentationInPod) = {

  }
}