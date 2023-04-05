package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.{ WelcomeProp }
import slick.jdbc.PostgresProfile.api._
import slick.lifted.{ ProvenShape }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class MeetingWelcomeDbModel(
    meetingId:          String,
    welcomeMsgTemplate: String,
    welcomeMsg:         String,
    modOnlyMessage:     String
)

class MeetingWelcomeDbTableDef(tag: Tag) extends Table[MeetingWelcomeDbModel](tag, "meeting_welcome") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val welcomeMsgTemplate = column[String]("welcomeMsgTemplate")
  val welcomeMsg = column[String]("welcomeMsg")
  val modOnlyMessage = column[String]("modOnlyMessage")

  //  def fk_meetingId: ForeignKeyQuery[MeetingDbTableDef, MeetingDbModel] = foreignKey("fk_meetingId", meetingId, TableQuery[MeetingDbTableDef])(_.meetingId)

  override def * : ProvenShape[MeetingWelcomeDbModel] = (meetingId, welcomeMsgTemplate, welcomeMsg, modOnlyMessage) <> (MeetingWelcomeDbModel.tupled, MeetingWelcomeDbModel.unapply)
}

object MeetingWelcomeDAO {
  def insert(meetingId: String, welcomeProp: WelcomeProp) = {
    DatabaseConnection.db.run(
      TableQuery[MeetingWelcomeDbTableDef].forceInsert(
        MeetingWelcomeDbModel(
          meetingId = meetingId,
          welcomeMsgTemplate = welcomeProp.welcomeMsgTemplate,
          welcomeMsg = welcomeProp.welcomeMsg,
          modOnlyMessage = welcomeProp.modOnlyMessage
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted in MeetingWelcome table!")
        }
        case Failure(e) => DatabaseConnection.logger.error(s"Error inserting MeetingWelcome: $e")
      }
  }
}