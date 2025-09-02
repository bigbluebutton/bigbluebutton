package org.bigbluebutton.core.db
import org.bigbluebutton.core.models.{RegisteredUser, UserLockSettings, VoiceUserState}
import slick.jdbc.PostgresProfile.api._

case class UserNameColumnsDbModel(
    name:                   String,
    firstName:              Option[String],
    lastName:               Option[String],
)

case class UserDbModel(
    meetingId:              String,
    userId:                 String,
    extId:                  String,
    nameColumns:            UserNameColumnsDbModel,
    role:                   String,
    avatar:                 String = "",
    webcamBackground:       String = "",
    color:                  String = "",
    authToken:              String = "",
    authed:                 Boolean = false,
    joined:                 Boolean = false,
    joinErrorMessage:       Option[String],
    joinErrorCode:          Option[String],
    banned:                 Boolean = false,
    loggedOut:              Boolean = false,
    bot:                    Boolean,
    guest:                  Boolean,
    guestStatus:            String,
    registeredOn:           Long,
    excludeFromDashboard:   Boolean,
    enforceLayout:          Option[String],
    logoutUrl:              String = "",
)



class UserDbTableDef(tag: Tag) extends Table[UserDbModel](tag, None, "user") {
  override def * = (
    meetingId,userId,extId,nameColumns,role,avatar,webcamBackground,color, authToken, authed,joined,joinErrorCode,
    joinErrorMessage, banned,loggedOut,bot, guest,guestStatus,registeredOn,excludeFromDashboard, enforceLayout, logoutUrl) <> (UserDbModel.tupled, UserDbModel.unapply)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val extId = column[String]("extId")
  val name = column[String]("name")
  val firstName = column[Option[String]]("firstName")
  val lastName = column[Option[String]]("lastName")
  val nameColumns = (name, firstName, lastName) <> (UserNameColumnsDbModel.tupled, UserNameColumnsDbModel.unapply)
  val role = column[String]("role")
  val avatar = column[String]("avatar")
  val webcamBackground = column[String]("webcamBackground")
  val color = column[String]("color")
  val authToken = column[String]("authToken")
  val authed = column[Boolean]("authed")
  val joined = column[Boolean]("joined")
  val joinErrorCode = column[Option[String]]("joinErrorCode")
  val joinErrorMessage = column[Option[String]]("joinErrorMessage")
  val banned = column[Boolean]("banned")
  val loggedOut = column[Boolean]("loggedOut")
  val bot = column[Boolean]("bot")
  val guest = column[Boolean]("guest")
  val guestStatus = column[String]("guestStatus")
  val registeredOn = column[Long]("registeredOn")
  val excludeFromDashboard = column[Boolean]("excludeFromDashboard")
  val enforceLayout = column[Option[String]]("enforceLayout")
  val logoutUrl = column[String]("logoutUrl")
}

object UserDAO {
  def insert(meetingId: String, regUser: RegisteredUser) = {
    DatabaseConnection.enqueue(
      TableQuery[UserDbTableDef].forceInsert(
        UserDbModel(
          userId = regUser.id,
          extId = regUser.externId,
          authToken = regUser.authToken,
          meetingId = meetingId,
          nameColumns = UserNameColumnsDbModel(
            name = regUser.name,
            firstName = regUser.firstName match {
              case "" => None
              case firstName: String => Some(firstName)
            },
            lastName = regUser.lastName match {
              case "" => None
              case lastName: String => Some(lastName)
            },
          ),
          role = regUser.role,
          avatar = regUser.avatarURL,
          webcamBackground = regUser.webcamBackgroundURL,
          color = regUser.color,
          authed = regUser.authed,
          joined = regUser.joined,
          joinErrorCode = None,
          joinErrorMessage = None,
          banned = regUser.banned,
          loggedOut = regUser.loggedOut,
          bot = regUser.bot,
          guest = regUser.guest,
          guestStatus = regUser.guestStatus,
          registeredOn = regUser.registeredOn,
          excludeFromDashboard = regUser.excludeFromDashboard,
          enforceLayout = regUser.enforceLayout match {
            case "" => None
            case enforceLayout: String => Some(enforceLayout)
          },
          logoutUrl = regUser.logoutUrl
        )
      )
    )

    UserMetadataDAO.insert(meetingId, regUser.id, "", regUser.userMetadata)
    UserLockSettingsDAO.insertOrUpdate(meetingId, regUser.id, UserLockSettings())
    UserClientSettingsDAO.insertOrUpdate(meetingId, regUser.id, JsonUtils.stringToJson("{}"))
    ChatUserDAO.insertUserPublicChat(meetingId, regUser.id)
    UserSessionTokenDAO.insert(regUser.meetingId, regUser.id, regUser.sessionToken.head, sessionName = "", regUser.enforceLayout)
  }

  def update(regUser: RegisteredUser) = {
    DatabaseConnection.enqueue(
      TableQuery[UserDbTableDef]
        .filter(_.meetingId === regUser.meetingId)
        .filter(_.userId === regUser.id)
        .map(u => (u.guest, u.guestStatus, u.role, u.authed, u.joined, u.banned, u.loggedOut))
        .update((regUser.guest, regUser.guestStatus, regUser.role, regUser.authed, regUser.joined, regUser.banned, regUser.loggedOut))
    )
  }

  def updateVoiceUserJoined(voiceUserState: VoiceUserState) = {
    DatabaseConnection.enqueue(
      TableQuery[UserDbTableDef]
        .filter(_.meetingId === voiceUserState.meetingId)
        .filter(_.userId === voiceUserState.intId)
        .map(u => (u.guest, u.guestStatus, u.authed, u.joined))
        .update((false, "ALLOW", true, true))
    )
  }

  def updateJoinError(meetingId: String, userId: String, joinErrorCode: String, joinErrorMessage: String) = {
    DatabaseConnection.enqueue(
      TableQuery[UserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .map(u => (u.joined, u.joinErrorCode, u.joinErrorMessage))
        .update((false, Some(joinErrorCode), Some(joinErrorMessage)))
    )
  }

  def softDelete(meetingId: String, userId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[UserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .filter(_.loggedOut =!= true)
        .map(u => (u.loggedOut))
        .update((true))
    )
  }

  def softDeleteAllFromMeeting(meetingId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[UserDbTableDef]
        .filter(_.meetingId === meetingId)
        .map(u => (u.loggedOut))
        .update((true))
    )
  }

  def transferUserToBreakoutRoomAsAudioOnly(userId: String, meetingIdFrom: String, meetingIdTo: String) = {

    //Create a copy of the user using the same userId, but with the meetingId of the breakoutRoom
    //The user will be flagged by `transferredFromParentMeeting=true`
    DatabaseConnection.enqueue(
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
    )

    //Set user as loggedOut in the old meeting (if it is from transferred origin)
    DatabaseConnection.enqueue(
      sqlu"""update "user"
             set "loggedOut" = true
              where "userId" = ${userId}
              and "meetingId" = ${meetingIdFrom}
              and "transferredFromParentMeeting" is true
              """
    )
  }

  def permanentlyDeleteAllFromMeeting(meetingId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[UserDbTableDef]
        .filter(_.meetingId === meetingId)
        .delete
    )
  }


}
