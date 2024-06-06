package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.{ VoiceUserState }
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success }

case class UserVoiceConfStateDbModel(
    meetingId:              String,
    userId:                 String,
    voiceConf:              String,
    voiceConfCallSession:   String,
    voiceConfClientSession: String,
    voiceConfCallState:     String,
)

class UserVoiceConfStateDbTableDef(tag: Tag) extends Table[UserVoiceConfStateDbModel](tag, None, "user_voice") {
  override def * = (
    meetingId, userId, voiceConf, voiceConfCallSession, voiceConfClientSession, voiceConfCallState
  ) <> (UserVoiceConfStateDbModel.tupled, UserVoiceConfStateDbModel.unapply)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val voiceConf = column[String]("voiceConf")
  val voiceConfCallSession = column[String]("voiceConfCallSession")
  val voiceConfClientSession = column[String]("voiceConfClientSession")
  val voiceConfCallState = column[String]("voiceConfCallState")
}

object UserVoiceConfStateDAO {
  def insertOrUpdate(meetingId: String, userId: String, voiceConf: String, voiceConfCallSession: String, clientSession: String, callState: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserVoiceConfStateDbTableDef].insertOrUpdate(
        UserVoiceConfStateDbModel(
          meetingId = meetingId,
          userId = userId,
          voiceConf = voiceConf,
          voiceConfCallSession = voiceConfCallSession,
          voiceConfClientSession = clientSession,
          voiceConfCallState = callState,
        )
      )
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on user_voice table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting voice: $e")
      }
  }


}
