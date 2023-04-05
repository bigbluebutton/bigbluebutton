package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.PresentationInPod
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class PresPageDbModel(
    pageId:         String,
    presentationId: String,
    num:            Int,
    urls:           String,
    current:        Boolean,
    xOffset:        Double,
    yOffset:        Double,
    widthRatio:     Double,
    heightRatio:    Double
)

class PresPageDbTableDef(tag: Tag) extends Table[PresPageDbModel](tag, None, "pres_page") {
  val pageId = column[String]("pageId", O.PrimaryKey)
  val presentationId = column[String]("presentationId")
  val num = column[Int]("num")
  val urls = column[String]("urls")
  val current = column[Boolean]("current")
  val xOffset = column[Double]("xOffset")
  val yOffset = column[Double]("yOffset")
  val widthRatio = column[Double]("widthRatio")
  val heightRatio = column[Double]("heightRatio")
  //  val presentation = foreignKey("presentation_fk", presentationId, Presentations)(_.presentationId, onDelete = ForeignKeyAction.Cascade)
  def * = (pageId, presentationId, num, urls, current, xOffset, yOffset, widthRatio, heightRatio) <> (PresPageDbModel.tupled, PresPageDbModel.unapply)
}

object PresPageDAO {

  def setCurrentPage(presentation: PresentationInPod, pageId: String) = {
    DatabaseConnection.db.run(
      sqlu"""UPDATE pres_page SET
                "current" = (case when "pageId" = ${pageId} then true else false end)
                WHERE "presentationId" = ${presentation.id}"""
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated current on PresPage table")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating current on PresPage: $e")
      }
  }
}