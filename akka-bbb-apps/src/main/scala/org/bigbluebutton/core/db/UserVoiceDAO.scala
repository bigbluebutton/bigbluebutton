package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.{ VoiceUserState }
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success }

case class UserVoiceDbModel(
    userId:             String,
    voiceUserId:        String,
    callerName:         String,
    callerNum:          String,
    callingWith:        String,
    joined:             Boolean,
    listenOnly:         Boolean,
    muted:              Boolean,
    spoke:              Boolean,
    talking:            Boolean,
    floor:              Boolean,
    lastFloorTime:      String,
    voiceConf:          String,
    color:              String,
    startTime:          Option[Long],
    endTime:            Option[Long],
)

class UserVoiceDbTableDef(tag: Tag) extends Table[UserVoiceDbModel](tag, None, "user_voice") {
  override def * = (
    userId, voiceUserId, callerName, callerNum, callingWith, joined, listenOnly,
    muted, spoke, talking, floor, lastFloorTime, voiceConf, color, startTime, endTime
  ) <> (UserVoiceDbModel.tupled, UserVoiceDbModel.unapply)
  val userId = column[String]("userId", O.PrimaryKey)
  val voiceUserId = column[String]("voiceUserId")
  val callerName = column[String]("callerName")
  val callerNum = column[String]("callerNum")
  val callingWith = column[String]("callingWith")
  val joined = column[Boolean]("joined")
  val listenOnly = column[Boolean]("listenOnly")
  val muted = column[Boolean]("muted")
  val spoke = column[Boolean]("spoke")
  val talking = column[Boolean]("talking")
  val floor = column[Boolean]("floor")
  val lastFloorTime = column[String]("lastFloorTime")
  val voiceConf = column[String]("voiceConf")
  val color = column[String]("color")
  val startTime = column[Option[Long]]("startTime")
  val endTime = column[Option[Long]]("endTime")
}


object UserVoiceDAO {
  def insert(voiceUserState: VoiceUserState) = {
    DatabaseConnection.db.run(
      TableQuery[UserVoiceDbTableDef].insertOrUpdate(
        UserVoiceDbModel(
          userId = voiceUserState.intId,
          voiceUserId = voiceUserState.voiceUserId,
          callerName = voiceUserState.callerName,
          callerNum = voiceUserState.callerNum,
          callingWith = voiceUserState.callingWith,
          joined = true,
          listenOnly = voiceUserState.listenOnly,
          muted = voiceUserState.muted,
          spoke = false,
          talking = voiceUserState.talking,
          floor = voiceUserState.floor,
          lastFloorTime = voiceUserState.lastFloorTime,
          voiceConf = "",
          color = "",
          startTime = None,
          endTime = None
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on user_voice table!")
        }
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting voice: $e")
      }
  }

  def update(voiceUserState: VoiceUserState) = {
    DatabaseConnection.db.run(
      TableQuery[UserVoiceDbTableDef]
        .filter(_.userId === voiceUserState.intId)
        .map(u => (u.listenOnly, u.muted, u.floor, u.lastFloorTime))
        .update((voiceUserState.listenOnly, voiceUserState.muted, voiceUserState.floor, voiceUserState.lastFloorTime))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated on user_voice table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating user: $e")
    }
  }

  def updateTalking(voiceUserState: VoiceUserState) = {
    val now = System.currentTimeMillis()

    val updateSql = if(voiceUserState.talking) {
      sqlu"""UPDATE user_voice SET
             "talking" = true,
             "spoke" = true,
             "endTime" = null,
            "startTime" = (case when "talking" is false then $now else "startTime" end)
            WHERE "userId" = ${voiceUserState.intId}"""
    } else {
      sqlu"""UPDATE user_voice SET
            "talking" = false,
            "startTime" = null,
            "endTime" = (case when "talking" is true then $now else "endTime" end)
            WHERE "userId" = ${voiceUserState.intId}"""
    }

    DatabaseConnection.db.run(updateSql).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated with talking: ${voiceUserState.talking}")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating voice talking: $e")
    }
  }

  def deleteUser(userId: String) = {
    //Meteor sets this props instead of removing
    //    muted: false
    //    talking: false
    //    listenOnly: false
    //    joined: false
    //    spoke: false

    DatabaseConnection.db.run(
      TableQuery[UserVoiceDbTableDef]
        .filter(_.userId === userId)
        .delete
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"Voice of user ${userId} deleted")
      case Failure(e) => DatabaseConnection.logger.error(s"Error deleting voice: $e")
    }
  }


}
