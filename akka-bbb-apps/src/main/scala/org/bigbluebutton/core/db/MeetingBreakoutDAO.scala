package org.bigbluebutton.core.db

import org.bigbluebutton.common2.domain.{ BreakoutProps }
import slick.lifted.ProvenShape
import PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{ Failure, Success, Try }

case class MeetingBreakoutDbModel(
    meetingId:             String,
    parentId:              String,
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

class MeetingBreakoutDbTableDef(tag: Tag) extends Table[MeetingBreakoutDbModel](tag, "meeting_breakout") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val parentId = column[String]("parentId")
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

  override def * : ProvenShape[MeetingBreakoutDbModel] = (meetingId, parentId, sequence, freeJoin, breakoutRooms, record, privateChatEnabled, captureNotes, captureSlides, captureNotesFilename, captureSlidesFilename) <> (MeetingBreakoutDbModel.tupled, MeetingBreakoutDbModel.unapply)
}

object MeetingBreakoutDAO {
  def insert(meetingId: String, breakoutProps: BreakoutProps) = {
    DatabaseConnection.db.run(
      TableQuery[MeetingBreakoutDbTableDef].forceInsert(
        MeetingBreakoutDbModel(
          meetingId = meetingId,
          parentId = breakoutProps.parentId,
          sequence = breakoutProps.sequence,
          freeJoin = breakoutProps.freeJoin,
          breakoutRooms = breakoutProps.breakoutRooms.toList,
          record = breakoutProps.record,
          privateChatEnabled = breakoutProps.privateChatEnabled,
          captureNotes = breakoutProps.captureNotes,
          captureSlides = breakoutProps.captureSlides,
          captureNotesFilename = breakoutProps.captureNotesFilename,
          captureSlidesFilename = breakoutProps.captureSlidesFilename
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted in MeetingBreakout table!")
        }
        case Failure(e) => DatabaseConnection.logger.error(s"Error inserting MeetingBreakout: $e")
      }
  }
}