package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.LockSettingsProps
import org.bigbluebutton.core2.Permissions
import slick.jdbc.PostgresProfile.api._
import slick.lifted.ProvenShape

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class MeetingLockSettingsDbModel(
    meetingId:              String,
    disableCam:             Boolean,
    disableMic:             Boolean,
    disablePrivateChat:     Boolean,
    disablePublicChat:      Boolean,
    disableNotes:           Boolean,
    hideUserList:           Boolean,
    lockOnJoin:             Boolean,
    lockOnJoinConfigurable: Boolean,
    hideViewersCursor:      Boolean
)

class MeetingLockSettingsDbTableDef(tag: Tag) extends Table[MeetingLockSettingsDbModel](tag, "meeting_lockSettings") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val disableCam = column[Boolean]("disableCam")
  val disableMic = column[Boolean]("disableMic")
  val disablePrivateChat = column[Boolean]("disablePrivateChat")
  val disablePublicChat = column[Boolean]("disablePublicChat")
  val disableNotes = column[Boolean]("disableNotes")
  val hideUserList = column[Boolean]("hideUserList")
  val lockOnJoin = column[Boolean]("lockOnJoin")
  val lockOnJoinConfigurable = column[Boolean]("lockOnJoinConfigurable")
  val hideViewersCursor = column[Boolean]("hideViewersCursor")

  //  def fk_meetingId: ForeignKeyQuery[MeetingDbTableDef, MeetingDbModel] = foreignKey("fk_meetingId", meetingId, TableQuery[MeetingDbTableDef])(_.meetingId)

  override def * : ProvenShape[MeetingLockSettingsDbModel] = (meetingId, disableCam, disableMic, disablePrivateChat, disablePublicChat, disableNotes, hideUserList, lockOnJoin, lockOnJoinConfigurable, hideViewersCursor) <> (MeetingLockSettingsDbModel.tupled, MeetingLockSettingsDbModel.unapply)
}

object MeetingLockSettingsDAO {
  def insert(meetingId: String, lockSettingsProps: LockSettingsProps) = {
    DatabaseConnection.db.run(
      TableQuery[MeetingLockSettingsDbTableDef].forceInsert(
        MeetingLockSettingsDbModel(
          meetingId = meetingId,
          disableCam = lockSettingsProps.disableCam,
          disableMic = lockSettingsProps.disableMic,
          disablePrivateChat = lockSettingsProps.disablePrivateChat,
          disablePublicChat = lockSettingsProps.disablePublicChat,
          disableNotes = lockSettingsProps.disableNotes,
          hideUserList = lockSettingsProps.hideUserList,
          lockOnJoin = lockSettingsProps.lockOnJoin,
          lockOnJoinConfigurable = lockSettingsProps.lockOnJoinConfigurable,
          hideViewersCursor = lockSettingsProps.hideViewersCursor
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted in MeetingLockSettings table!")
        }
        case Failure(e) => DatabaseConnection.logger.error(s"Error inserting MeetingLockSettings: $e")
      }
  }

  def update(meetingId: String, permissions: Permissions) = {
    DatabaseConnection.db.run(
      TableQuery[MeetingLockSettingsDbTableDef].insertOrUpdate(
        MeetingLockSettingsDbModel(
          meetingId = meetingId,
          disableCam = permissions.disableCam,
          disableMic = permissions.disableMic,
          disablePrivateChat = permissions.disablePrivChat,
          disablePublicChat = permissions.disablePubChat,
          disableNotes = permissions.disableNotes,
          hideUserList = permissions.hideUserList,
          lockOnJoin = permissions.lockOnJoin,
          lockOnJoinConfigurable = permissions.lockOnJoinConfigurable,
          hideViewersCursor = permissions.hideViewersCursor
        ),
      )
    ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated in MeetingLockSettings table!")
        }
        case Failure(e) => DatabaseConnection.logger.error(s"Error updating MeetingLockSettings: $e")
      }
  }

}