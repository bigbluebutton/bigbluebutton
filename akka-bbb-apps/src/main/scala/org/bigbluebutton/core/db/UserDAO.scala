package org.bigbluebutton.core.db
import org.bigbluebutton.core.models.{RegisteredUser, UserState}
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

case class UserDbModel(
    userId:       String,
    extId:        String,
    meetingId:    String,
    name:         String,
    avatar:       String = "",
    color:        String = "",
    emoji:        String = "none",
    //emojiTime:    Option[java.sql.Timestamp],
    guest:        Boolean,
    guestStatus:  String = "",
    mobile:       Boolean,
    clientType:   String,
//    excludeFromDashboard: Boolean,
    role:         String,
    authed:       Boolean = false,
    joined:       Boolean = false,
    disconnected: Boolean = false,
    expired:      Boolean = false,
//    ejected:      Boolean = false, -- user is being removed when ejected, so this column is not useful
//    ejectReason:  String = "",
    banned:       Boolean = false,
    loggedOut:    Boolean = false,
    registeredOn: Long,
    presenter:    Boolean = false,
    pinned:       Boolean = false,
    locked:       Boolean = false,
//    registeredOn: Option[Long]
//    registeredOn: Option[LocalDate]
)

class UserDbTableDef(tag: Tag) extends Table[UserDbModel](tag, None, "user") {
  override def * = (
    userId, extId, meetingId, name, avatar, color, emoji, guest, guestStatus, mobile, clientType, role, authed, joined,
    disconnected, expired, banned, loggedOut, registeredOn, presenter, pinned, locked) <> (UserDbModel.tupled, UserDbModel.unapply)
  val userId = column[String]("userId", O.PrimaryKey)
  val extId = column[String]("extId")
  val meetingId = column[String]("meetingId")
  val name = column[String]("name")
  val avatar = column[String]("avatar")
  val color = column[String]("color")
  val emoji = column[String]("emoji")
  val guest = column[Boolean]("guest")
  val guestStatus = column[String]("guestStatus")
  val mobile = column[Boolean]("mobile")
  val clientType = column[String]("clientType")
//  val excludeFromDashboard = column[Boolean]("excludeFromDashboard")
  val role = column[String]("role")
  val authed = column[Boolean]("authed")
  val joined = column[Boolean]("joined")
  val disconnected = column[Boolean]("disconnected")
  val expired = column[Boolean]("expired")
//  val ejected = column[Boolean]("ejected")   -- user is being removed when ejected, so this column is not useful
//  val ejectReason = column[String]("ejectReason")
  val banned = column[Boolean]("banned")
  val loggedOut = column[Boolean]("loggedOut")
  val registeredOn = column[Long]("registeredOn")
  val presenter = column[Boolean]("presenter")
  val pinned = column[Boolean]("pinned")
  val locked = column[Boolean]("locked")
//  val registeredOn = column[Option[Long]]("registeredOn")
  //  val registeredOn = column[Option[LocalDate]]("registeredOn")
}

object UserDAO {
  def insert(meetingId: String, regUser: RegisteredUser) = {
    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef].forceInsert(
        UserDbModel(
          userId = regUser.id,
          extId = regUser.externId,
          meetingId = meetingId,
          name = regUser.name,
          avatar = regUser.avatarURL,
          color = regUser.color,
          guest = regUser.guest,
          guestStatus = regUser.guestStatus,
          mobile = false,
          clientType = "",
//          emojiTime = None,
//          excludeFromDashboard = regUser.excludeFromDashboard,
          role = regUser.role,
          authed = regUser.authed,
          registeredOn = regUser.registeredOn
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted in User table!")
          ChatUserDAO.insertUserPublicChat(meetingId, regUser.id)
          UserConnectionStatusdDAO.insert(meetingId, regUser.id)
        }
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting user: $e")
      }
  }

  def update(regUser: RegisteredUser) = {
    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef]
        .filter(_.userId === regUser.id)
        .map(u => (u.guest, u.guestStatus, u.role, u.authed, u.joined, u.banned, u.loggedOut))
        .update((regUser.guest, regUser.guestStatus, regUser.role, regUser.authed, regUser.joined, regUser.banned, regUser.loggedOut))
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated on user table!")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error updating user: $e")
      }
  }

  def update(userState: UserState) = {
    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef]
        .filter(_.userId === userState.intId)
        .map(u => (u.presenter, u.pinned, u.locked, u.emoji, u.mobile, u.clientType, u.disconnected))
        .update((userState.presenter, userState.pin, userState.locked, userState.emoji, userState.mobile, userState.clientType, userState.userLeftFlag.left))
//    "ejected" bool null
//    "eject_reason" varchar (255)
//    ,
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated on user table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating user: $e")
    }
  }

  def updateExpired(intId: String, expired: Boolean) = {
    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef]
        .filter(_.userId === intId)
        .map(u => (u.expired))
        .update((expired))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated loggedOut=true on user table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating loggedOut=true user: $e")
    }
  }
  
  def delete(intId: String) = {
//    DatabaseConnection.db.run(
//      TableQuery[UserDbTableDef]
//        .filter(_.userId === intId)
//        .delete
//    ).onComplete {
//      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"User ${intId} deleted")
//      case Failure(e) => DatabaseConnection.logger.error(s"Error deleting user ${intId}: $e")
//    }

    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef]
        .filter(_.userId === intId)
        .map(u => (u.loggedOut))
        .update((true))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated loggedOut=true on user table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating loggedOut=true user: $e")
    }
  }

  def deleteAllFromMeeting(meetingId: String) = {
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
