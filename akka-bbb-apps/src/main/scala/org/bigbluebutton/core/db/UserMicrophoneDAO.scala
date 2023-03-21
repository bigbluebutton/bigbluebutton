package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.{RegisteredUser, UserState, VoiceUserState, WebcamStream}
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success, Try}

case class UserMicrophoneDbModel(
    voiceUserId:        String,
    userId:             String,
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

class UserMicrophoneDbTableDef(tag: Tag) extends Table[UserMicrophoneDbModel](tag, None, "user_microphone") {
  override def * = (
    voiceUserId, userId, callerName, callerNum, callingWith, joined, listenOnly,
    muted, spoke, talking, floor, lastFloorTime, voiceConf, color, startTime, endTime
  ) <> (UserMicrophoneDbModel.tupled, UserMicrophoneDbModel.unapply)
  val voiceUserId = column[String]("voiceUserId", O.PrimaryKey)
  val userId = column[String]("userId")
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


object UserMicrophoneDAO {
  //  val usersTable = TableQuery[UserTableDef]

  def insert(voiceUserState: VoiceUserState) = {
    DatabaseConnection.db.run(
      TableQuery[UserMicrophoneDbTableDef].forceInsert(
        UserMicrophoneDbModel(
          voiceUserId = voiceUserState.voiceUserId,
          userId = voiceUserState.intId,
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
          println(s"$rowsAffected row(s) inserted on user_microphone table!")
        }
        case Failure(e)            => println(s"Error inserting voice: $e")
      }
  }

  def update(voiceUserState: VoiceUserState) = {
    DatabaseConnection.db.run(
      TableQuery[UserMicrophoneDbTableDef]
        .filter(_.voiceUserId === voiceUserState.voiceUserId)
        .map(u => (u.listenOnly, u.muted, u.floor, u.lastFloorTime))
        .update((voiceUserState.listenOnly, voiceUserState.muted, voiceUserState.floor, voiceUserState.lastFloorTime))
    ).onComplete {
      case Success(rowsAffected) => println(s"$rowsAffected row(s) updated on user_microphone table!")
      case Failure(e) => println(s"Error updating user: $e")
    }
  }

  def updateTalking(voiceUserState: VoiceUserState) = {
//    DatabaseConnection.db.run(sql"SELECT * FROM $users".as[(Int, Double, String)]).onComplete {
    val now = System.currentTimeMillis()

    val updateSql = if(voiceUserState.talking) {
      sqlu"""UPDATE user_microphone SET
             "talking" = true,
             "spoke" = true,
             "endTime" = null,
            "startTime" = (case when "talking" is false then $now else "startTime" end)
            WHERE "voiceUserId" = ${voiceUserState.voiceUserId}"""
    } else {
      sqlu"""UPDATE user_microphone SET
            "talking" = false,
            "startTime" = null,
            "endTime" = (case when "talking" is true then $now else "endTime" end)
            WHERE "voiceUserId" = ${voiceUserState.voiceUserId}"""
    }

    DatabaseConnection.db.run(updateSql).onComplete {
      case Success(rowsAffected) => println(s"$rowsAffected row(s) updated with talking: ${voiceUserState.talking}")
      case Failure(e) => println(s"Error updating voice talking: $e")
    }
  }

  def delete(voiceUserId: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserMicrophoneDbTableDef]
        .filter(_.voiceUserId === voiceUserId)
        .delete
    ).onComplete {
        case Success(rowsAffected) => println(s"Voice ${voiceUserId} deleted")
        case Failure(e)            => println(s"Error deleting voice: $e")
      }
  }

  def deleteUser(userId: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserMicrophoneDbTableDef]
        .filter(_.userId === userId)
        .delete
    ).onComplete {
      case Success(rowsAffected) => println(s"Voice of user ${userId} deleted")
      case Failure(e) => println(s"Error deleting voice: $e")
    }
  }


}
