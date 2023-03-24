package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.{ LockSettingsProps }
import slick.jdbc.PostgresProfile.api._
import slick.lifted.{ ProvenShape }

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
          println(s"$rowsAffected row(s) inserted in MeetingLockSettings table!")
        }
        case Failure(e) => println(s"Error inserting MeetingLockSettings: $e")
      }
  }
}