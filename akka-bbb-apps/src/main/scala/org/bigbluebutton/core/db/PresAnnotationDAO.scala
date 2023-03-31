package org.bigbluebutton.core.db

import org.bigbluebutton.common2.msgs.AnnotationVO
import slick.jdbc.PostgresProfile.api._
import spray.json.{ JsValue, _ }

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration
import scala.util.{ Failure, Success }

case class PresAnnotationDbModel(
    annotationId:        String,
    pageId:              String,
    userId:              String,
    annotationInfo:      String,
    lastHistorySequence: Int,
    lastUpdatedAt:       java.sql.Timestamp = new java.sql.Timestamp(System.currentTimeMillis())
)

class PresAnnotationDbTableDef(tag: Tag) extends Table[PresAnnotationDbModel](tag, None, "pres_annotation") {
  val annotationId = column[String]("annotationId", O.PrimaryKey)
  val pageId = column[String]("pageId")
  val userId = column[String]("userId")
  val annotationInfo = column[String]("annotationInfo")
  val lastHistorySequence = column[Int]("lastHistorySequence")
  val lastUpdatedAt = column[java.sql.Timestamp]("lastUpdatedAt")
  //  def whiteboard = foreignKey("whiteboard_fk", whiteboardId, Whiteboards)(_.whiteboardId, onDelete = ForeignKeyAction.Cascade)
  def * = (annotationId, pageId, userId, annotationInfo, lastHistorySequence, lastUpdatedAt) <> (PresAnnotationDbModel.tupled, PresAnnotationDbModel.unapply)
}

object PresAnnotationDAO {
  implicit object AnyJsonWriter extends JsonWriter[Any] {
    def write(x: Any): JsValue = x match {
      case n: Int       => JsNumber(n)
      case s: String    => JsString(s)
      case b: Boolean   => JsBoolean(b)
      case f: Float     => JsNumber(f)
      case d: Double    => JsNumber(d)
      case m: Map[_, _] => JsObject(m.asInstanceOf[Map[String, Any]].map { case (k, v) => k -> write(v) })
      case l: List[_]   => JsArray(l.map(write).toVector)
      case _            => throw new IllegalArgumentException(s"Unsupported type: ${x.getClass.getName}")
      //      case _            => JsNull
    }
  }

  // Cria um JsonWriter implícito para o tipo Map[String, Any]
  implicit val mapFormat: JsonWriter[Map[String, Any]] = new JsonWriter[Map[String, Any]] {
    def write(m: Map[String, Any]): JsValue = {
      JsObject(m.map { case (k, v) => k -> AnyJsonWriter.write(v) })
    }
  }

  //  def insertOrUpdate(annotation: AnnotationVO) = {
  //    DatabaseConnection.db.run(
  //      TableQuery[PresAnnotationDbTableDef].insertOrUpdate(
  //        PresAnnotationDbModel(
  //          annotationId = annotation.id,
  //          pageId = annotation.wbId,
  //          userId = annotation.userId,
  //          annotationInfo = annotation.annotationInfo.toMap.toJson.compactPrint,
  //          //          annotationInfo = annotation.annotationInfo.toString(),
  //          lastUpdatedAt = new java.sql.Timestamp(System.currentTimeMillis())
  //        )
  //      )
  //    ).onComplete {
  //        case Success(rowsAffected) => println(s"$rowsAffected row(s) inserted on PresAnnotation table!")
  //        case Failure(e)            => println(s"Error inserting PresAnnotation: $e")
  //      }
  //  }

  def insertOrUpdate(annotation: AnnotationVO, annotationDiff: AnnotationVO) = {
    PresAnnotationHistoryDAO.insert(annotationDiff).onComplete {
      case Success(sequence) => {
        println(s"Sequence generated to PresAnnotationHistory record: $sequence")
        DatabaseConnection.db.run(
          TableQuery[PresAnnotationDbTableDef].insertOrUpdate(
            PresAnnotationDbModel(
              annotationId = annotation.id,
              pageId = annotation.wbId,
              userId = annotation.userId,
              annotationInfo = annotation.annotationInfo.toJson.compactPrint,
              lastHistorySequence = sequence.getOrElse(0),
              lastUpdatedAt = new java.sql.Timestamp(System.currentTimeMillis())
            )
          )
        ).onComplete {
            case Success(rowsAffected) => println(s"$rowsAffected row(s) inserted on PresAnnotation table!")
            case Failure(e)            => println(s"Error inserting PresAnnotation: $e")
          }

      }
      case Failure(e) => println(s"Error inserting PresAnnotationHistory: $e")
    }
  }

  def delete(wbId: String, userId: String, annotationId: String) = {

    PresAnnotationHistoryDAO.delete(wbId, userId, annotationId).onComplete {
      case Success(sequence) => {
        DatabaseConnection.db.run(
          TableQuery[PresAnnotationDbTableDef]
            .filter(_.annotationId === annotationId)
            .map(a => (a.annotationInfo, a.lastHistorySequence, a.lastUpdatedAt))
            .update("", sequence.getOrElse(0), new java.sql.Timestamp(System.currentTimeMillis()))
        ).onComplete {
            case Success(rowsAffected) => println(s"$rowsAffected row(s) updated annotationInfo=null on PresAnnotation table!")
            case Failure(e)            => println(s"Error updating annotationInfo=null PresAnnotation: $e")
          }
      }
      case Failure(e) => println(s"Error inserting PresAnnotationHistory: $e")
    }
  }

}