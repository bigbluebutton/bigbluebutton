package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.{ RecordProp }
import slick.jdbc.PostgresProfile.api._
import slick.lifted.{ ProvenShape }

case class MeetingRecordingPoliciesDbModel(
    meetingId:               String,
    record:                  Boolean,
    autoStartRecording:      Boolean,
    allowStartStopRecording: Boolean,
    keepEvents:              Boolean
)

class MeetingRecordingPoliciesDbTableDef(tag: Tag) extends Table[MeetingRecordingPoliciesDbModel](tag, "meeting_recordingPolicies") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val record = column[Boolean]("record")
  val autoStartRecording = column[Boolean]("autoStartRecording")
  val allowStartStopRecording = column[Boolean]("allowStartStopRecording")
  val keepEvents = column[Boolean]("keepEvents")
  //  def fk_meetingId: ForeignKeyQuery[MeetingDbTableDef, MeetingDbModel] = foreignKey("fk_meetingId", meetingId, TableQuery[MeetingDbTableDef])(_.meetingId)

  override def * : ProvenShape[MeetingRecordingPoliciesDbModel] = (meetingId, record, autoStartRecording, allowStartStopRecording, keepEvents) <> (MeetingRecordingPoliciesDbModel.tupled, MeetingRecordingPoliciesDbModel.unapply)
}

object MeetingRecordingPoliciesDAO {
  def insert(meetingId: String, recordProp: RecordProp) = {
    DatabaseConnection.enqueue(
      TableQuery[MeetingRecordingPoliciesDbTableDef].forceInsert(
        MeetingRecordingPoliciesDbModel(
          meetingId = meetingId,
          record = recordProp.record,
          autoStartRecording = recordProp.autoStartRecording,
          allowStartStopRecording = recordProp.allowStartStopRecording,
          keepEvents = recordProp.keepEvents
        )
      )
    )
  }

}