package org.bigbluebutton.core.db
import org.bigbluebutton.core.models.{RegisteredUser, UserState, VoiceUserState}
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success, Try}

case class UserDbModel(
    userId:       String,
    extId:        String,
    meetingId:    String,
    name:         String,
    avatar:       String = "",
    color:        String = "",
    emoji:        String = "",
    guest:        Boolean,
    guestStatus:  String = "",
    mobile:       Boolean,
    clientType:   String,
//    excludeFromDashboard: Boolean,
    role:         String,
    authed:       Boolean = false,
    joined:       Boolean = false,
    leftFlag:     Boolean = false,
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
    leftFlag, banned, loggedOut, registeredOn, presenter, pinned, locked) <> (UserDbModel.tupled, UserDbModel.unapply)
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
  val leftFlag = column[Boolean]("leftFlag")
//  val ejected = column[Boolean]("ejected")   -- user is being removed when ejected, so this column is not useful
//  val ejectReason = column[String]("ejectReason")
  val banned = column[Boolean]("banned")
  val loggedOut = column[Boolean]("loggedOut")
  val registeredOn = column[Long]("registeredOn")
  val presenter = column[Boolean]("presenter")
  val pinned = column[Boolean]("pinned")
  val locked = column[Boolean]("locked")
//  val registeredOn: Rep[Option[Long]] = column[Option[Long]]("registeredOn")
  //  val registeredOn: Rep[Option[LocalDate]] = column[Option[LocalDate]]("registeredOn")
}

object UserDAO {
  //  val usersTable = TableQuery[UserTableDef]

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
//          excludeFromDashboard = regUser.excludeFromDashboard,
          role = regUser.role,
          authed = regUser.authed,
          registeredOn = regUser.registeredOn
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          println(s"$rowsAffected row(s) inserted in User table!")
        }
        case Failure(e)            => println(s"Error inserting user: $e")
      }
  }

  def update(regUser: RegisteredUser) = {
    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef]
        .filter(_.userId === regUser.id)
        .map(u => (u.guest, u.guestStatus, u.role, u.authed, u.joined, u.banned, u.loggedOut))
        .update((regUser.guest, regUser.guestStatus, regUser.role, regUser.authed, regUser.joined, regUser.banned, regUser.loggedOut))
    ).onComplete {
        case Success(rowsAffected) => println(s"$rowsAffected row(s) updated on user table!")
        case Failure(e)            => println(s"Error updating user: $e")
      }
  }

  def update(userState: UserState) = {
    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef]
        .filter(_.userId === userState.intId)
        .map(u => (u.presenter, u.pinned, u.locked, u.emoji, u.mobile, u.clientType, u.leftFlag))
        .update((userState.presenter, userState.pin, userState.locked, userState.emoji, userState.mobile, userState.clientType, userState.userLeftFlag.left))
//    "ejected" bool null
//    "eject_reason" varchar (255)
//    ,
    ).onComplete {
      case Success(rowsAffected) => println(s"$rowsAffected row(s) updated")
      case Failure(e) => println(s"Error updating user: $e")
    }
  }

  def delete(regUser: RegisteredUser) = {
    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef]
        .filter(_.userId === regUser.id)
        .delete
    ).onComplete {
        case Success(rowsAffected) => println(s"User ${regUser.id} deleted")
        case Failure(e)            => println(s"Error deleting user ${regUser.id}: $e")
      }
  }

  def delete(intId: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef]
        .filter(_.userId === intId)
        .delete
    ).onComplete {
      case Success(rowsAffected) => println(s"User ${intId} deleted")
      case Failure(e) => println(s"Error deleting user ${intId}: $e")
    }
  }

  def deleteAllFromMeeting(meetingId: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef]
        .filter(_.meetingId === meetingId)
        .delete
    ).onComplete {
      case Success(rowsAffected) => println(s"User from meeting ${meetingId} deleted")
      case Failure(e) => println(s"Error deleting user from meeting ${meetingId}: $e")
    }
  }

  def insert(user: UserDbModel) = {
    DatabaseConnection.db.run(
      TableQuery[UserDbTableDef].forceInsert(user)
    ).onComplete {
        case Success(rowsAffected) => println(s"$rowsAffected row(s) updated")
        case Failure(e)            => println(s"Error updating user: $e")
      }
  }


}
