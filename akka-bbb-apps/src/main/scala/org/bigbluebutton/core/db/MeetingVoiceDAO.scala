package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.{ VoiceProp }
import slick.jdbc.PostgresProfile.api._
import slick.lifted.{ ProvenShape }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class MeetingVoiceDbModel(
    meetingId:   String,
    telVoice:    String,
    voiceConf:   String,
    dialNumber:  String,
    muteOnStart: Boolean
)

class MeetingVoiceDbTableDef(tag: Tag) extends Table[MeetingVoiceDbModel](tag, "meeting_voice") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val telVoice = column[String]("telVoice")
  val voiceConf = column[String]("voiceConf")
  val dialNumber = column[String]("dialNumber")
  val muteOnStart = column[Boolean]("muteOnStart")

  //  def fk_meetingId: ForeignKeyQuery[MeetingDbTableDef, MeetingDbModel] = foreignKey("fk_meetingId", meetingId, TableQuery[MeetingDbTableDef])(_.meetingId)

  override def * : ProvenShape[MeetingVoiceDbModel] = (meetingId, telVoice, voiceConf, dialNumber, muteOnStart) <> (MeetingVoiceDbModel.tupled, MeetingVoiceDbModel.unapply)
}

object MeetingVoiceDAO {
  def insert(meetingId: String, voiceProp: VoiceProp) = {
    DatabaseConnection.db.run(
      TableQuery[MeetingVoiceDbTableDef].forceInsert(
        MeetingVoiceDbModel(
          meetingId = meetingId,
          telVoice = voiceProp.telVoice,
          voiceConf = voiceProp.voiceConf,
          dialNumber = voiceProp.dialNumber,
          muteOnStart = voiceProp.muteOnStart
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted in MeetingVoice table!")
        }
        case Failure(e) => DatabaseConnection.logger.error(s"Error inserting MeetingVoice: $e")
      }
  }
}