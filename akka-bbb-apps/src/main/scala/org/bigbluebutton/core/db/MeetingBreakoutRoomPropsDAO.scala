package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.{ BreakoutProps }
import slick.lifted.ProvenShape
import PostgresProfile.api._

case class MeetingBreakoutRoomPropsDbModel(
    meetingId:             String,
    parentMeetingId:       String,
    sequence:              Int,
    freeJoin:              Boolean,
    breakoutRooms:         List[String],
    record:                Boolean,
    privateChatEnabled:    Boolean,
    captureNotes:          Boolean,
    captureSlides:         Boolean,
    captureNotesFilename:  String,
    captureSlidesFilename: String
)

class MeetingBreakoutRoomPropsDbTableDef(tag: Tag) extends Table[MeetingBreakoutRoomPropsDbModel](tag, "meeting_breakoutRoomProps") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val parentMeetingId = column[String]("parentMeetingId")
  val sequence = column[Int]("sequence")
  val freeJoin = column[Boolean]("freeJoin")
  val breakoutRooms = column[List[String]]("breakoutRooms")
  val record = column[Boolean]("record")
  val privateChatEnabled = column[Boolean]("privateChatEnabled")
  val captureNotes = column[Boolean]("captureNotes")
  val captureSlides = column[Boolean]("captureSlides")
  val captureNotesFilename = column[String]("captureNotesFilename")
  val captureSlidesFilename = column[String]("captureSlidesFilename")

  //  def fk_meetingId: ForeignKeyQuery[MeetingDbTableDef, MeetingDbModel] = foreignKey("fk_meetingId", meetingId, TableQuery[MeetingDbTableDef])(_.meetingId)

  override def * : ProvenShape[MeetingBreakoutRoomPropsDbModel] = (
    meetingId, parentMeetingId, sequence, freeJoin, breakoutRooms,
    record, privateChatEnabled, captureNotes, captureSlides,
    captureNotesFilename, captureSlidesFilename
  ) <> (MeetingBreakoutRoomPropsDbModel.tupled, MeetingBreakoutRoomPropsDbModel.unapply)
}

object MeetingBreakoutRoomPropsDAO {
  def insert(meetingId: String, breakoutProps: BreakoutProps) = {
    DatabaseConnection.enqueue(
      TableQuery[MeetingBreakoutRoomPropsDbTableDef].forceInsert(
        MeetingBreakoutRoomPropsDbModel(
          meetingId = meetingId,
          parentMeetingId = breakoutProps.parentId,
          sequence = breakoutProps.sequence,
          freeJoin = breakoutProps.freeJoin,
          //          breakoutRooms = breakoutProps.breakoutRooms.toList,
          breakoutRooms = List(),
          record = breakoutProps.record,
          privateChatEnabled = breakoutProps.privateChatEnabled,
          captureNotes = breakoutProps.captureNotes,
          captureSlides = breakoutProps.captureSlides,
          captureNotesFilename = breakoutProps.captureNotesFilename,
          captureSlidesFilename = breakoutProps.captureSlidesFilename
        )
      )
    )
  }
}