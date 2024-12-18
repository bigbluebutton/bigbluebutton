package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.{ WelcomeProp }
import slick.jdbc.PostgresProfile.api._
import slick.lifted.{ ProvenShape }

case class MeetingWelcomeDbModel(
    meetingId:               String,
    welcomeMsg:              Option[String],
    welcomeMsgForModerators: Option[String]
)

class MeetingWelcomeDbTableDef(tag: Tag) extends Table[MeetingWelcomeDbModel](tag, "meeting_welcome") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val welcomeMsg = column[Option[String]]("welcomeMsg")
  val welcomeMsgForModerators = column[Option[String]]("welcomeMsgForModerators")

  //  def fk_meetingId: ForeignKeyQuery[MeetingDbTableDef, MeetingDbModel] = foreignKey("fk_meetingId", meetingId, TableQuery[MeetingDbTableDef])(_.meetingId)

  override def * : ProvenShape[MeetingWelcomeDbModel] = (meetingId, welcomeMsg, welcomeMsgForModerators) <> (MeetingWelcomeDbModel.tupled, MeetingWelcomeDbModel.unapply)
}

object MeetingWelcomeDAO {
  def insert(meetingId: String, welcomeProp: WelcomeProp) = {
    DatabaseConnection.enqueue(
      TableQuery[MeetingWelcomeDbTableDef].forceInsert(
        MeetingWelcomeDbModel(
          meetingId = meetingId,
          welcomeMsg = welcomeProp.welcomeMsg match {
            case "" => None
            case m  => Some(m)
          },
          welcomeMsgForModerators = welcomeProp.welcomeMsgForModerators match {
            case "" => None
            case m  => Some(m)
          }
        )
      )
    )
  }
}