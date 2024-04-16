package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.{UserState}
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

case class UserStateDbModel(
    meetingId:                    String,
    userId:                       String,
    emoji:                        String = "none",
    away:                         Boolean = false,
    raiseHand:                    Boolean = false,
    guestStatus:                  String,
    guestStatusSetByModerator:    Option[String],
    guestLobbyMessage:            Option[String],
    mobile:                       Boolean,
    clientType:                   String,
    disconnected:                 Boolean = false,
    expired:                      Boolean = false,
    ejected:                      Boolean = false,
    ejectReason:                  Option[String],
    ejectReasonCode:              Option[String],
    ejectedByModerator:           Option[String],
    presenter:                    Boolean = false,
    pinned:                       Boolean = false,
    locked:                       Boolean = false,
    speechLocale:                 String,
    inactivityWarningDisplay:     Boolean = false,
    inactivityWarningTimeoutSecs: Option[Long],
)

class UserStateDbTableDef(tag: Tag) extends Table[UserStateDbModel](tag, None, "user") {
  override def * = (
    meetingId, userId,emoji,away,raiseHand,guestStatus,guestStatusSetByModerator,guestLobbyMessage,mobile,clientType,disconnected,
    expired,ejected,ejectReason,ejectReasonCode,ejectedByModerator,presenter,pinned,locked,speechLocale,
    inactivityWarningDisplay, inactivityWarningTimeoutSecs) <> (UserStateDbModel.tupled, UserStateDbModel.unapply)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val emoji = column[String]("emoji")
  val away = column[Boolean]("away")
  val raiseHand = column[Boolean]("raiseHand")
  val guestStatus = column[String]("guestStatus")
  val guestStatusSetByModerator = column[Option[String]]("guestStatusSetByModerator")
  val guestLobbyMessage = column[Option[String]]("guestLobbyMessage")
  val mobile = column[Boolean]("mobile")
  val clientType = column[String]("clientType")
  val disconnected = column[Boolean]("disconnected")
  val expired = column[Boolean]("expired")
  val ejected = column[Boolean]("ejected")
  val ejectReason = column[Option[String]]("ejectReason")
  val ejectReasonCode = column[Option[String]]("ejectReasonCode")
  val ejectedByModerator = column[Option[String]]("ejectedByModerator")
  val presenter = column[Boolean]("presenter")
  val pinned = column[Boolean]("pinned")
  val locked = column[Boolean]("locked")
  val speechLocale = column[String]("speechLocale")
  val inactivityWarningDisplay = column[Boolean]("inactivityWarningDisplay")
  val inactivityWarningTimeoutSecs = column[Option[Long]]("inactivityWarningTimeoutSecs")
}

object UserStateDAO {
  def update(userState: UserState) = {
    DatabaseConnection.db.run(
      TableQuery[UserStateDbTableDef]
        .filter(_.meetingId === userState.meetingId)
        .filter(_.userId === userState.intId)
        .map(u => (u.presenter, u.pinned, u.locked, u.speechLocale, u.emoji, u.away, u.raiseHand, u.mobile, u.clientType, u.disconnected))
        .update((userState.presenter, userState.pin, userState.locked, userState.speechLocale, userState.emoji, userState.away, userState.raiseHand, userState.mobile, userState.clientType, userState.userLeftFlag.left))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated on user table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating user: $e")
    }
  }

  def updateEjected(meetingId: String, userId: String, ejectReason: String, ejectReasonCode: String, ejectedByModerator: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserStateDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .map(u => (u.ejected, u.ejectReason, u.ejectReasonCode, u.ejectedByModerator))
        .update((true, Some(ejectReason), Some(ejectReasonCode), Some(ejectedByModerator)))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated ejected=true on user table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating ejected=true user: $e")
    }
  }

  def updateExpired(meetingId: String, userId: String, expired: Boolean) = {
    DatabaseConnection.db.run(
      TableQuery[UserStateDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .map(u => (u.expired))
        .update((expired))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated expired=true on user table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating expired=true user: $e")
    }
  }

  def updateGuestStatus(meetingId: String, userId: String, guestStatus: String, guestStatusSetByModerator: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserStateDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .map(u => (u.guestStatus, u.guestStatusSetByModerator))
        .update((guestStatus,
          guestStatusSetByModerator match {
            case "SYSTEM" => None
            case moderatorUserId : String => Some(moderatorUserId)
            case _ => None
          }
        ))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated guestStatus on user table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating guestStatus user: $e")
    }
  }

  def updateGuestLobbyMessage(meetingId: String, userId: String, guestLobbyMessage: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserStateDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .map(u => u.guestLobbyMessage)
        .update(Some(guestLobbyMessage))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated guestLobbyMessage on user table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating guestLobbyMessage user: $e")
    }
  }

  def updateInactivityWarning(meetingId: String, userId: String, inactivityWarningDisplay: Boolean, inactivityWarningTimeoutSecs: Long) = {
    DatabaseConnection.db.run(
      TableQuery[UserStateDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .map(u => (u.inactivityWarningDisplay, u.inactivityWarningTimeoutSecs))
        .update((inactivityWarningDisplay,
          inactivityWarningTimeoutSecs match {
            case 0 => None
            case timeout: Long => Some(timeout)
            case _ => None
        }))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated inactivityWarningDisplay on user table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating inactivityWarningDisplay user: $e")
    }
  }

}
