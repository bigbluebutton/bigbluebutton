package org.bigbluebutton.core.db
import org.bigbluebutton.core.models.{RegisteredUser}
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

case class UserDbModel(
    userId:       String,
    extId:        String,
    meetingId:    String,
    name:         String,
    role:         String,
    avatar:       String = "",
    color:        String = "",
    authed: Boolean = false,
    joined: Boolean = false,
    banned:       Boolean = false,
    loggedOut:    Boolean = false,
    guest: Boolean,
    guestStatus: String,
    registeredOn: Long,
    excludeFromDashboard: Boolean,
)



class UserDbTableDef(tag: Tag) extends Table[UserDbModel](tag, None, "user") {
  override def * = (
    userId,extId,meetingId,name,role,avatar,color,authed,joined,banned,loggedOut,guest,guestStatus,registeredOn,excludeFromDashboard) <> (UserDbModel.tupled, UserDbModel.unapply)
  val userId = column[String]("userId", O.PrimaryKey)
  val extId = column[String]("extId")
  val meetingId = column[String]("meetingId")
  val name = column[String]("name")
  val role = column[String]("role")
  val avatar = column[String]("avatar")
  val color = column[String]("color")
  val authed = column[Boolean]("authed")
  val joined = column[Boolean]("joined")
  val banned = column[Boolean]("banned")
  val loggedOut = column[Boolean]("loggedOut")
  val guest = column[Boolean]("guest")
  val guestStatus = column[String]("guestStatus")
  val registeredOn = column[Long]("registeredOn")
  val excludeFromDashboard = column[Boolean]("excludeFromDashboard")
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
          role = regUser.role,
          avatar = regUser.avatarURL,
          color = regUser.color,
          authed = regUser.authed,
          joined = regUser.joined,
          banned = regUser.banned,
          loggedOut = regUser.loggedOut,
          guest = regUser.guest,
          guestStatus = regUser.guestStatus,
          registeredOn = regUser.registeredOn,
          excludeFromDashboard = regUser.excludeFromDashboard
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted in User table!")
          ChatUserDAO.insertUserPublicChat(meetingId, regUser.id)
          UserConnectionStatusdDAO.insert(meetingId, regUser.id)
          UserCustomParameterDAO.insert(regUser.id, regUser.customParameters)
          UserLocalSettingsDAO.insert(regUser.id, meetingId)
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
