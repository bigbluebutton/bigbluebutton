package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import org.bigbluebutton.core.models.{ PresentationInPod }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }
import spray.json._
//import DefaultJsonProtocol._

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

//  implicit object AnyJsonFormat extends JsonFormat[Any] {
//    def write(x: Any) = x match {
//      case n: Int => JsNumber(n)
//      case s: String => JsString(s)
//      case b: Boolean if b == true => JsTrue
//      case b: Boolean if b == false => JsFalse
//      case v: Double => JsNumber(v)
//      case v: Long => JsNumber(v)
//      case v: Map[_, _] => write(v.asInstanceOf[Map[String, Any]])
//      case _ => JsNull
//    }
//
//    def read(value: JsValue) = value match {
//      case JsNumber(n) => n.intValue
//      case JsString(s) => s
//      case JsTrue => true
//      case JsFalse => false
//    }
//  }

//  implicit val mapWriter: JsonWriter[Map[String, String]] = new JsonWriter[Map[String, String]] {
//    def write(map: Map[String, String]): JsValue = {
//      JsObject(map.mapValues(JsString(_)))
//    }
//  }

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
          current = presentation.current,
          downloadable = presentation.downloadable,
          removable = presentation.removable
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          println(s"$rowsAffected row(s) inserted on Presentation table!")

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
              case Success(rowsAffected) => println(s"$rowsAffected row(s) inserted on PresentationPage table!")
              case Failure(e)            => println(s"Error inserting PresentationPage: $e")
            }
        }
        case Failure(e) => println(s"Error inserting Presentation: $e")
      }
  }
}