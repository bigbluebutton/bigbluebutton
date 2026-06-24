package org.bigbluebutton.core.db
import org.bigbluebutton.core.models.VoiceUserState
import slick.jdbc.PostgresProfile.api._

case class UserVoiceDbModel(
    meetingId:                 String,
    userId:                 String,
    voiceUserId:            String,
    callerName:             String,
    callerNum:              String,
    callingWith:            String,
    joined:                 Boolean,
    listenOnly:             Boolean,
    muted:                  Boolean,
    listenOnlyInputDevice:  Boolean,
    deafened:               Boolean,
    spoke:                  Boolean,
    talking:                Boolean,
    floor:                  Boolean,
    lastFloorTime:          String,
    startTime:              Option[Long],
    endTime:                Option[Long],
)

class UserVoiceDbTableDef(tag: Tag) extends Table[UserVoiceDbModel](tag, None, "user_voice") {
  override def * = (
    meetingId, userId, voiceUserId, callerName, callerNum, callingWith, joined, listenOnly,
    muted, listenOnlyInputDevice, deafened, spoke, talking, floor, lastFloorTime, startTime, endTime
  ) <> (UserVoiceDbModel.tupled, UserVoiceDbModel.unapply)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val voiceUserId = column[String]("voiceUserId")
  val callerName = column[String]("callerName")
  val callerNum = column[String]("callerNum")
  val callingWith = column[String]("callingWith")
  val joined = column[Boolean]("joined")
  val listenOnly = column[Boolean]("listenOnly")
  val muted = column[Boolean]("muted")
  val listenOnlyInputDevice = column[Boolean]("listenOnlyInputDevice")
  val deafened = column[Boolean]("deafened")
  val spoke = column[Boolean]("spoke")
  val talking = column[Boolean]("talking")
  val floor = column[Boolean]("floor")
  val lastFloorTime = column[String]("lastFloorTime")
  val voiceConf = column[String]("voiceConf")
  val voiceConfCallSession = column[String]("voiceConfCallSession")
  val voiceConfClientSession = column[String]("voiceConfClientSession")
  val voiceConfCallState = column[String]("voiceConfCallState")
  val startTime = column[Option[Long]]("startTime")
  val endTime = column[Option[Long]]("endTime")
}


object UserVoiceDAO {
  def insert(voiceUserState: VoiceUserState) = {
    DatabaseConnection.enqueue(
      TableQuery[UserVoiceDbTableDef].insertOrUpdate(
        UserVoiceDbModel(
          meetingId = voiceUserState.meetingId,
          userId = voiceUserState.intId,
          voiceUserId = voiceUserState.voiceUserId,
          callerName = voiceUserState.callerName,
          callerNum = voiceUserState.callerNum,
          callingWith = voiceUserState.callingWith,
          joined = true,
          listenOnly = voiceUserState.listenOnly,
          muted = voiceUserState.muted,
          listenOnlyInputDevice = voiceUserState.listenOnlyInputDevice,
          deafened = voiceUserState.deafened,
          spoke = false,
          talking = voiceUserState.talking,
          floor = voiceUserState.floor,
          lastFloorTime = voiceUserState.lastFloorTime,
          startTime = None,
          endTime = None
        )
      )
    )
  }

  def update(voiceUserState: VoiceUserState) = {
    DatabaseConnection.enqueue(
      TableQuery[UserVoiceDbTableDef]
        .filter(_.userId === voiceUserState.intId)
        .map(u => (u.listenOnly, u.muted, u.listenOnlyInputDevice, u.deafened, u.floor, u.lastFloorTime))
        .update((voiceUserState.listenOnly, voiceUserState.muted, voiceUserState.listenOnlyInputDevice, voiceUserState.deafened, voiceUserState.floor, voiceUserState.lastFloorTime))
    )
  }

  def updateTalking(voiceUserState: VoiceUserState) = {
    val now = System.currentTimeMillis()

    val updateSql = if(voiceUserState.talking) {
      sqlu"""UPDATE user_voice SET
             "talking" = true,
             "spoke" = true,
             "endTime" = null,
            "startTime" = (case when "talking" is false then $now else "startTime" end)
            WHERE "meetingId" = ${voiceUserState.meetingId}
            AND "userId" = ${voiceUserState.intId}"""
    } else {
      sqlu"""UPDATE user_voice SET
            "talking" = false,
            "startTime" = null,
            "endTime" = (case when "talking" is true then $now else "endTime" end)
            WHERE "meetingId" = ${voiceUserState.meetingId}
            AND "userId" = ${voiceUserState.intId}"""
    }

    DatabaseConnection.enqueue(updateSql)
  }

  def deleteUserVoice(meetingId: String,userId: String) = {
    //Meteor sets this props instead of removing
    //    muted: false
    //    talking: false
    //    listenOnly: false
    //    joined: false
    //    spoke: false

    DatabaseConnection.enqueue(
      TableQuery[UserVoiceDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .map(u => (u.muted, u.deafened, u.talking, u.listenOnly, u.joined, u.spoke, u.startTime, u.endTime))
        .update((true, false, false, false, false, false, None, None))
    )
  }
}
