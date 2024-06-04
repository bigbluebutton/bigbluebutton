package org.bigbluebutton.core.db
import org.bigbluebutton.core.models.{RegisteredUser, VoiceUserState}
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

case class UserDbModel(
    meetingId:              String,
    userId:                 String,
    extId:                  String,
    name:                   String,
    role:                   String,
    avatar:                 String = "",
    color:                  String = "",
    sessionToken:           String = "",
    authToken:              String = "",
    authed:                 Boolean = false,
    joined:                 Boolean = false,
    joinErrorMessage:       Option[String],
    joinErrorCode:          Option[String],
    banned:                 Boolean = false,
    loggedOut:              Boolean = false,
    guest:                  Boolean,
    guestStatus:            String,
    registeredOn:           Long,
    excludeFromDashboard:   Boolean,
    enforceLayout:          Option[String],
)



class UserDbTableDef(tag: Tag) extends Table[UserDbModel](tag, None, "user") {
  override def * = (
    meetingId,userId,extId,name,role,avatar,color, sessionToken, authToken, authed,joined,joinErrorCode,
    joinErrorMessage, banned,loggedOut,guest,guestStatus,registeredOn,excludeFromDashboard, enforceLayout) <> (UserDbModel.tupled, UserDbModel.unapply)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val extId = column[String]("extId")
  val name = column[String]("name")
  val role = column[String]("role")
  val avatar = column[String]("avatar")
  val color = column[String]("color")
  val sessionToken = column[String]("sessionToken")
  val authToken = column[String]("authToken")
  val authed = column[Boolean]("authed")
  val joined = column[Boolean]("joined")
  val joinErrorCode = column[Option[String]]("joinErrorCode")
  val joinErrorMessage = column[Option[String]]("joinErrorMessage")
  val banned = column[Boolean]("banned")
  val loggedOut = column[Boolean]("loggedOut")
  val guest = column[Boolean]("guest")
  val guestStatus = column[String]("guestStatus")
  val registeredOn = column[Long]("registeredOn")
  val excludeFromDashboard = column[Boolean]("excludeFromDashboard")
  val enforceLayout = column[Option[String]]("enforceLayout")
}

object UserDAO {
  def insert(meetingId: String, regUser: RegisteredUser) = {
    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef].forceInsert(
        UserDbModel(
          userId = regUser.id,
          extId = regUser.externId,
          authToken = regUser.authToken,
          meetingId = meetingId,
          name = regUser.name,
          role = regUser.role,
          avatar = regUser.avatarURL,
          color = regUser.color,
          sessionToken = regUser.sessionToken,
          authed = regUser.authed,
          joined = regUser.joined,
          joinErrorCode = None,
          joinErrorMessage = None,
          banned = regUser.banned,
          loggedOut = regUser.loggedOut,
          guest = regUser.guest,
          guestStatus = regUser.guestStatus,
          registeredOn = regUser.registeredOn,
          excludeFromDashboard = regUser.excludeFromDashboard,
          enforceLayout = regUser.enforceLayout match {
            case "" => None
            case enforceLayout: String => Some(enforceLayout)
          }
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted in User table!")
          UserConnectionStatusDAO.insert(meetingId, regUser.id)
          UserCustomParameterDAO.insert(meetingId, regUser.id, regUser.customParameters)
          UserClientSettingsDAO.insert(regUser.id, meetingId)
          ChatUserDAO.insertUserPublicChat(meetingId, regUser.id)
        }
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting user: $e")
      }
  }

  def update(regUser: RegisteredUser) = {
    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef]
        .filter(_.meetingId === regUser.meetingId)
        .filter(_.userId === regUser.id)
        .map(u => (u.guest, u.guestStatus, u.role, u.authed, u.joined, u.banned, u.loggedOut))
        .update((regUser.guest, regUser.guestStatus, regUser.role, regUser.authed, regUser.joined, regUser.banned, regUser.loggedOut))
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated on user table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating user: $e")
      }
  }

  def updateVoiceUserJoined(voiceUserState: VoiceUserState) = {

    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef]
        .filter(_.meetingId === voiceUserState.meetingId)
        .filter(_.userId === voiceUserState.intId)
        .map(u => (u.guest, u.guestStatus, u.authed, u.joined))
        .update((false, "ALLOW", true, true))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated on user table!")
      case Failure(e) => DatabaseConnection.logger.debug(s"Error updating user table: $e")
    }
  }

  def updateJoinError(meetingId: String, userId: String, joinErrorCode: String, joinErrorMessage: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .map(u => (u.joined, u.joinErrorCode, u.joinErrorMessage))
        .update((false, Some(joinErrorCode), Some(joinErrorMessage)))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated on user (Joined) table!")
      case Failure(e) => DatabaseConnection.logger.debug(s"Error updating user (Joined): $e")
    }
  }

  def softDelete(meetingId: String, userId: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .filter(_.loggedOut =!= true)
        .map(u => (u.loggedOut))
        .update((true))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated loggedOut=true on user table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating loggedOut=true user: $e")
    }
  }

  def softDeleteAllFromMeeting(meetingId: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef]
        .filter(_.meetingId === meetingId)
        .map(u => (u.loggedOut))
        .update((true))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated loggedOut=true on user table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating loggedOut=true user: $e")
    }
  }

  def transferUserToBreakoutRoomAsAudioOnly(userId: String, meetingIdFrom: String, meetingIdTo: String) = {

    //Create a copy of the user using the same userId, but with the meetingId of the breakoutRoom
    //The user will be flagged by `transferredFromParentMeeting=true`
    DatabaseConnection.db.run(
      sqlu"""
        WITH upsert AS (
            UPDATE "user"
            SET "loggedOut"=false
            where "userId" = ${userId}
            and "meetingId" = ${meetingIdTo}
          RETURNING *)
            insert into "user"("meetingId","userId","extId","name","role","guest","authed","guestStatus","locked",
            "color","loggedOut","expired","ejected","joined","registeredOn","transferredFromParentMeeting","clientType")
             select
               ${meetingIdTo} as "meetingId",
               "userId",
               "extId",
               "name",
               "role",
               true as "guest",
               true as "authed",
               'ALLOW' as "guestStatus",
               false as "locked",
               "color",
               "loggedOut",
               "expired",
               "ejected",
               "joined",
               "registeredOn",
               true as "transferredFromParentMeeting",
               'dial-in-user' as "clientType"
              from "user"
              where "userId" = ${userId}
              and "meetingId" = ${meetingIdFrom}
              and NOT EXISTS (SELECT * FROM upsert)
          """
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted in user (transferredFromParentMeeting) table")
      case Failure(e)            => DatabaseConnection.logger.error(s"Error inserting user (transferredFromParentMeeting): $e")
    }

    //Set user as loggedOut in the old meeting (if it is from transferred origin)
    DatabaseConnection.db.run(
      sqlu"""update "user"
             set "loggedOut" = true
              where "userId" = ${userId}
              and "meetingId" = ${meetingIdFrom}
              and "transferredFromParentMeeting" is true
              """
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated in user (transferredFromParentMeeting) table")
      case Failure(e)            => DatabaseConnection.logger.error(s"Error updating user (transferredFromParentMeeting): $e")
    }
  }

  def permanentlyDeleteAllFromMeeting(meetingId: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef]
        .filter(_.meetingId === meetingId)
        .delete
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"User from meeting ${meetingId} deleted")
      case Failure(e) => DatabaseConnection.logger.error(s"Error deleting user from meeting ${meetingId}: $e")
    }
  }


}
