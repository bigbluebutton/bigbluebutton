package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.UserState
import slick.jdbc.PostgresProfile.api._

case class UserEjectColumnsDbModel(
    ejected:                      Boolean = false,
    ejectReason:                  Option[String],
    ejectReasonCode:              Option[String],
    ejectedByModerator:           Option[String],
)
case class UserStateDbModel(
    meetingId:                    String,
    userId:                       String,
    away:                         Boolean = false,
    raiseHand:                    Boolean = false,
    guestStatus:                  String,
    guestStatusSetByModerator:    Option[String],
    guestLobbyMessage:            Option[String],
    mobile:                       Boolean,
    clientType:                   String,
    disconnected:                 Boolean = false,
    expired:                      Boolean = false,
    ejectColumns:                 UserEjectColumnsDbModel,
    presenter:                    Boolean = false,
    pinned:                       Boolean = false,
    locked:                       Boolean = false,
    speechLocale:                 String,
    captionLocale:                String,
    inactivityWarningDisplay:     Boolean = false,
    inactivityWarningTimeoutSecs: Option[Long],
    echoTestRunningAt:            Option[java.sql.Timestamp],
)

class UserStateDbTableDef(tag: Tag) extends Table[UserStateDbModel](tag, None, "user") {
  override def * = (
    meetingId, userId,away,raiseHand,guestStatus,guestStatusSetByModerator,guestLobbyMessage,mobile,clientType,disconnected,
    expired,ejectColumns,presenter,pinned,locked,speechLocale, captionLocale,
    inactivityWarningDisplay, inactivityWarningTimeoutSecs, echoTestRunningAt) <> (UserStateDbModel.tupled, UserStateDbModel.unapply)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
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
  val ejectColumns = (ejected, ejectReason, ejectReasonCode, ejectedByModerator) <> (UserEjectColumnsDbModel.tupled, UserEjectColumnsDbModel.unapply)
  val presenter = column[Boolean]("presenter")
  val pinned = column[Boolean]("pinned")
  val locked = column[Boolean]("locked")
  val speechLocale = column[String]("speechLocale")
  val captionLocale = column[String]("captionLocale")
  val inactivityWarningDisplay = column[Boolean]("inactivityWarningDisplay")
  val inactivityWarningTimeoutSecs = column[Option[Long]]("inactivityWarningTimeoutSecs")
  val echoTestRunningAt = column[Option[java.sql.Timestamp]]("echoTestRunningAt")
}

object UserStateDAO {
  def update(userState: UserState) = {
    DatabaseConnection.enqueue(
      TableQuery[UserStateDbTableDef]
        .filter(_.meetingId === userState.meetingId)
        .filter(_.userId === userState.intId)
        .map(u => (u.presenter, u.pinned, u.locked, u.speechLocale, u.captionLocale, u.away, u.raiseHand, u.mobile, u.clientType, u.disconnected))
        .update((
          userState.presenter,
          userState.pin,
          userState.locked,
          userState.speechLocale,
          userState.captionLocale,
          userState.away,
          userState.raiseHand,
          userState.mobile,
          userState.clientType,
          userState.userLeftFlag.left
        ))
    )
  }

  def updateEjected(meetingId: String, userId: String, ejectReason: String, ejectReasonCode: String, ejectedByModerator: String) = {
    DatabaseConnection.enqueue(
      TableQuery[UserStateDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .map(u => (u.ejected, u.ejectReason, u.ejectReasonCode, u.ejectedByModerator))
        .update((true, Some(ejectReason), Some(ejectReasonCode), Some(ejectedByModerator)))
    )
  }

  def updateExpired(meetingId: String, userId: String, expired: Boolean) = {
    DatabaseConnection.enqueue(
      TableQuery[UserStateDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .map(u => (u.expired))
        .update((expired))
    )
  }

  def updateGuestStatus(meetingId: String, userId: String, guestStatus: String, guestStatusSetByModerator: String) = {
    DatabaseConnection.enqueue(
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
    )
  }

  def updateGuestLobbyMessage(meetingId: String, userId: String, guestLobbyMessage: String) = {
    DatabaseConnection.enqueue(
      TableQuery[UserStateDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .map(u => u.guestLobbyMessage)
        .update(Some(guestLobbyMessage))
    )
  }

  def updateInactivityWarning(meetingId: String, userId: String, inactivityWarningDisplay: Boolean, inactivityWarningTimeoutSecs: Long) = {
    DatabaseConnection.enqueue(
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
    )
  }

  def updateEchoTestRunningAt(meetingId: String, userId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[UserStateDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .map(u => (u.echoTestRunningAt))
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    )
  }

}
