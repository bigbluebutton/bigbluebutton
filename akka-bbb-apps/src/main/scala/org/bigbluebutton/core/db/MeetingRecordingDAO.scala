package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.{ RecordProp }
import slick.jdbc.PostgresProfile.api._
import slick.lifted.{ ProvenShape }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success }

case class MeetingRecordingDbModel(
    meetingId:               String,
    record:                  Boolean,
    autoStartRecording:      Boolean,
    allowStartStopRecording: Boolean,
    keepEvents:              Boolean
)

class MeetingRecordingDbTableDef(tag: Tag) extends Table[MeetingRecordingDbModel](tag, "meeting_recording") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val record = column[Boolean]("record")
  val autoStartRecording = column[Boolean]("autoStartRecording")
  val allowStartStopRecording = column[Boolean]("allowStartStopRecording")
  val keepEvents = column[Boolean]("keepEvents")

  //  def fk_meetingId: ForeignKeyQuery[MeetingDbTableDef, MeetingDbModel] = foreignKey("fk_meetingId", meetingId, TableQuery[MeetingDbTableDef])(_.meetingId)

  override def * : ProvenShape[MeetingRecordingDbModel] = (meetingId, record, autoStartRecording, allowStartStopRecording, keepEvents) <> (MeetingRecordingDbModel.tupled, MeetingRecordingDbModel.unapply)
}

object MeetingRecordingDAO {
  def insert(meetingId: String, recordProp: RecordProp) = {
    DatabaseConnection.db.run(
      TableQuery[MeetingRecordingDbTableDef].forceInsert(
        MeetingRecordingDbModel(
          meetingId = meetingId,
          record = recordProp.record,
          autoStartRecording = recordProp.autoStartRecording,
          allowStartStopRecording = recordProp.allowStartStopRecording,
          keepEvents = recordProp.keepEvents
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted in MeetingRecording table!")
        }
        case Failure(e) => DatabaseConnection.logger.error(s"Error inserting MeetingRecording: $e")
      }
  }
}