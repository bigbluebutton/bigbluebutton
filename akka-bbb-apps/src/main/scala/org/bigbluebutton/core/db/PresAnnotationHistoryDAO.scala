package org.bigbluebutton.core.db

import org.bigbluebutton.common2.msgs.AnnotationVO
import slick.jdbc.PostgresProfile.api._
import spray.json.{ JsValue, _ }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class PresAnnotationHistoryDbModel(
    sequence:       Option[Int] = None,
    annotationId:   String,
    pageId:         String,
    userId:         String,
    annotationInfo: String
//    lastUpdatedAt:  java.sql.Timestamp = new java.sql.Timestamp(System.currentTimeMillis())
)

class PresAnnotationHistoryDbTableDef(tag: Tag) extends Table[PresAnnotationHistoryDbModel](tag, None, "pres_annotation_history") {
  val sequence = column[Option[Int]]("sequence", O.PrimaryKey, O.AutoInc)
  val annotationId = column[String]("annotationId")
  val pageId = column[String]("pageId")
  val userId = column[String]("userId")
  val annotationInfo = column[String]("annotationInfo")
  //  val lastUpdatedAt = column[java.sql.Timestamp]("lastUpdatedAt")
  //  def whiteboard = foreignKey("whiteboard_fk", whiteboardId, Whiteboards)(_.whiteboardId, onDelete = ForeignKeyAction.Cascade)
  def * = (sequence, annotationId, pageId, userId, annotationInfo) <> (PresAnnotationHistoryDbModel.tupled, PresAnnotationHistoryDbModel.unapply)
}

object PresAnnotationHistoryDAO {
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

  def insert(annotationDiff: AnnotationVO) = {
    DatabaseConnection.db.run(
      TableQuery[PresAnnotationHistoryDbTableDef].returning(
        TableQuery[PresAnnotationHistoryDbTableDef].map(_.sequence)
      ) += PresAnnotationHistoryDbModel(
          None,
          annotationId = annotationDiff.id,
          pageId = annotationDiff.wbId,
          userId = annotationDiff.userId,
          annotationInfo = annotationDiff.annotationInfo.toJson.compactPrint
        )
    )
  }

  def delete(wbId: String, userId: String, annotationId: String) = {
    DatabaseConnection.db.run(
      TableQuery[PresAnnotationHistoryDbTableDef].returning(
        TableQuery[PresAnnotationHistoryDbTableDef].map(_.sequence)
      ) += PresAnnotationHistoryDbModel(
          None,
          annotationId = annotationId,
          pageId = wbId,
          userId = userId,
          annotationInfo = ""
        )
    )
    //    DatabaseConnection.db.run(
    //      TableQuery[PresAnnotationDbTableDef]
    //        .filter(_.annotationId === annotationId)
    //        .map(a => (a.annotationInfo, a.lastUpdatedAt))
    //        .update("", new java.sql.Timestamp(System.currentTimeMillis()))
    //    ).onComplete {
    //        case Success(rowsAffected) => println(s"$rowsAffected row(s) updated annotationInfo=null on PresAnnotation table!")
    //        case Failure(e)            => println(s"Error updating annotationInfo=null PresAnnotation: $e")
    //      }
  }

  //  def insertOrUpdate(annotation: AnnotationVO) = {
  //    DatabaseConnection.db.run(
  //      TableQuery[PresAnnotationHistoryDbTableDef].insertOrUpdate(
  //        PresAnnotationHistoryDbModel(
  //          sequence = None,
  //          annotationId = annotation.id,
  //          pageId = annotation.wbId,
  //          userId = annotation.userId,
  //          annotationInfo = annotation.annotationInfo.toJson.compactPrint
  //        )
  //      )
  //    ).onComplete {
  //        case Success(rowsAffected) => println(s"$rowsAffected row(s) inserted on PresAnnotationHistory table!")
  //        case Failure(e)            => println(s"Error inserting PresAnnotationHistory: $e")
  //      }
  //  }

  //  def delete(annotationId: String) = {
  //    DatabaseConnection.db.run(
  //      TableQuery[PresAnnotationHistoryDbTableDef]
  //        .filter(_.annotationId === annotationId)
  //        .map(a => (a.annotationInfo))
  //        .update(""))
  //    ).onComplete {
  //        case Success(rowsAffected) => println(s"$rowsAffected row(s) updated annotationInfo=null on PresAnnotationHistory table!")
  //        case Failure(e)            => println(s"Error updating annotationInfo=null PresAnnotationHistory: $e")
  //      }
  //  }

}