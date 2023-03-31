package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import org.bigbluebutton.core.apps.whiteboard.Whiteboard

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class WhiteboardDbModel(whiteboardId: String, meetingId: String)

class WhiteboardDbTableDef(tag: Tag) extends Table[WhiteboardDbModel](tag, None, "whiteboard") {
  val whiteboardId = column[String]("whiteboardId", O.PrimaryKey)
  val meetingId = column[String]("meetingId")
  //  def meeting = foreignKey("meeting_fk", meetingId, Meetings)(_.meetingId, onDelete = ForeignKeyAction.Cascade)
  def * = (whiteboardId, meetingId) <> (WhiteboardDbModel.tupled, WhiteboardDbModel.unapply)
}

object WhiteboardDAO {
  def insert(meetingId: String, whiteboard: Whiteboard) = {
    DatabaseConnection.db.run(
      TableQuery[WhiteboardDbTableDef].insertOrUpdate(
        WhiteboardDbModel(
          whiteboardId = whiteboard.id,
          meetingId = meetingId
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          println(s"$rowsAffected row(s) inserted on Whiteboard table!")

          //          for {
          //            user <- whiteboard.multiUser
          //          } yield {
          //            WhiteboardUserDAO.insert(meetingId, groupWhiteboard.id, user)
          //          }

        }
        case Failure(e) => println(s"Error inserting Whiteboard: $e")
      }
  }
}