package org.bigbluebutton.core.db

import org.bigbluebutton.common2.msgs.AnnotationVO
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

//object PresPageDAO {
//  def insert(meetingId: String, annotation: AnnotationVO) = {
//    DatabaseConnection.db.run(
//      TableQuery[PresPageDbTableDef].insertOrUpdate(
//        PresPageDbModel(
//          annotationId = annotation.id,
//          whiteboardId = annotation.wbId,
//          userId = annotation.userId,
//          annotationInfo = annotation.annotationInfo.toString(),
//          lastUpdatedAt = new java.sql.Timestamp(System.currentTimeMillis())
//        )
//      )
//    ).onComplete {
//        case Success(rowsAffected) => println(s"$rowsAffected row(s) inserted on PresPage table!")
//        case Failure(e)            => println(s"Error inserting PresPage: $e")
//      }
//  }
//}