package org.bigbluebutton.core.db

import org.bigbluebutton.core.apps.BreakoutModel
import org.bigbluebutton.core.domain.BreakoutRoom2x
import slick.jdbc.PostgresProfile.api._

import scala.util.{Failure, Success}
import scala.concurrent.ExecutionContext.Implicits.global


case class BreakoutRoomDbModel(
          breakoutRoomId:               String,
          parentMeetingId:              String,
          externalId:                   String,
          sequence:                     Int,
          name:                         String,
          shortName:                    String,
          isDefaultName:                Boolean,
          freeJoin:                     Boolean,
//        startedOn:                    Long,
          startedAt:                    Option[java.sql.Timestamp],
          endedAt:                      Option[java.sql.Timestamp],
          durationInSeconds:            Int,
          sendInvitationToModerators:   Boolean,
          captureNotes:                 Boolean,
          captureSlides:                Boolean,
)

class BreakoutRoomDbTableDef(tag: Tag) extends Table[BreakoutRoomDbModel](tag, None, "breakoutRoom") {
  val breakoutRoomId = column[String]("breakoutRoomId", O.PrimaryKey)
  val parentMeetingId = column[String]("parentMeetingId")
  val externalId = column[String]("externalId")
  val sequence = column[Int]("sequence")
  val name = column[String]("name")
  val shortName = column[String]("shortName")
  val isDefaultName = column[Boolean]("isDefaultName")
  val freeJoin = column[Boolean]("freeJoin")
  val startedAt = column[Option[java.sql.Timestamp]]("startedAt")
  val endedAt = column[Option[java.sql.Timestamp]]("endedAt")
  val durationInSeconds = column[Int]("durationInSeconds")
  val sendInvitationToModerators = column[Boolean]("sendInvitationToModerators")
  val captureNotes = column[Boolean]("captureNotes")
  val captureSlides = column[Boolean]("captureSlides")
  override def * = (breakoutRoomId, parentMeetingId, externalId, sequence, name, shortName, isDefaultName, freeJoin, startedAt, endedAt, durationInSeconds, sendInvitationToModerators, captureNotes, captureSlides) <> (BreakoutRoomDbModel.tupled, BreakoutRoomDbModel.unapply)
}

object BreakoutRoomDAO {

  def insert(breakout: BreakoutModel) = {
    DatabaseConnection.db.run(DBIO.sequence(
      for {
        (_, room) <- breakout.rooms
      } yield {
        prepareInsertOrUpdate(room, breakout.durationInSeconds, breakout.sendInviteToModerators)
      }
    ).transactionally)
      .onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on BreakoutRoom table!")

          //Insert users
          DatabaseConnection.db.run(DBIO.sequence(
            for {
              (_, room) <- breakout.rooms
              userId <- room.assignedUsers
            } yield {
              BreakoutRoomUserDAO.prepareInsert(room.id, userId)
            }
          ).transactionally)
            .onComplete {
              case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on breakoutRoom_user table!")
              case Failure(e) => DatabaseConnection.logger.debug(s"Error inserting breakoutRoom_user: $e")
            }
        }
        case Failure(e) => DatabaseConnection.logger.debug(s"Error inserting BreakoutRoom: $e")
      }
  }

//  def update(room: BreakoutRoom2x) = {
//    DatabaseConnection.db.run(
//      prepareInsertOrUpdate(room)
//    ).onComplete {
//      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated on BreakoutRoom table!")
//      case Failure(e) => DatabaseConnection.logger.error(s"Error updating BreakoutRoom: $e")
//    }
//  }

  def prepareInsertOrUpdate(room: BreakoutRoom2x, durationInSeconds: Int, sendInvitationToModerators: Boolean) = {
    TableQuery[BreakoutRoomDbTableDef].insertOrUpdate(
      BreakoutRoomDbModel(
        breakoutRoomId = room.id,
        parentMeetingId = room.parentId,
        externalId = room.externalId,
        sequence = room.sequence,
        name = room.name,
        shortName = room.shortName,
        isDefaultName = room.isDefaultName,
        freeJoin = room.freeJoin,
        startedAt = None,
        endedAt = None,
        durationInSeconds = durationInSeconds,
        sendInvitationToModerators = sendInvitationToModerators,
        captureNotes = room.captureNotes,
        captureSlides = room.captureSlides,
      )
    )
  }

//  def update(breakout: BreakoutModel): Unit = {
//    for (room <- breakout.rooms) {
//      insert(room._2)
//    }
//  }
//
//  def insert(room : BreakoutRoom2x) = {
//    DatabaseConnection.db.run(
//      TableQuery[BreakoutRoomDbTableDef].insertOrUpdate(
//        BreakoutRoomDbModel(
//          breakoutRoomId = room.id,
//          parentMeetingId = room.parentId,
//          externalId = room.externalId,
//          sequence = room.sequence,
//          name = room.name,
//          shortName = room.shortName,
//          isDefaultName = room.isDefaultName,
//          freeJoin = room.freeJoin,
//          startedOn = room.startedOn.getOrElse(0),
//          durationInSeconds = 0,
//          captureNotes = room.captureNotes,
//          captureSlides = room.captureSlides,
//        )
//      )
//    ).onComplete {
//        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on BreakoutRoom table!")
//        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting BreakoutRoom: $e")
//      }
//  }

  def deletePermanently(meetingId: String) = {
    DatabaseConnection.db.run(
      TableQuery[BreakoutRoomDbTableDef]
        .filter(_.parentMeetingId === meetingId)
        .delete
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) delete of meeting ${meetingId} on BreakoutRooms table!")
      case Failure(e) => DatabaseConnection.logger.debug(s"Error deleting BreakoutRoom of meeting ${meetingId}: $e")
    }
  }

  def updateRoomsStarted(meetingId: String) = {
    DatabaseConnection.db.run(
      TableQuery[BreakoutRoomDbTableDef]
        .filter(_.parentMeetingId === meetingId)
//        .filter(_.breakoutRoomId === breakoutRoomId)
        .map(u => u.startedAt)
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated startedAt on BreakoutRoom table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating startedAt BreakoutRoom: $e")
    }
  }

  def updateRoomsEnded(meetingId: String) = {
    DatabaseConnection.db.run(
      TableQuery[BreakoutRoomDbTableDef]
        .filter(_.parentMeetingId === meetingId)
        .map(u => u.endedAt)
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated endedAt on BreakoutRoom table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating endedAt BreakoutRoom: $e")
    }
  }

  def updateRoomsDuration(meetingId: String, newDurationInSeconds: Int) = {
    DatabaseConnection.db.run(
      TableQuery[BreakoutRoomDbTableDef]
        .filter(_.parentMeetingId === meetingId)
        .map(u => u.durationInSeconds)
        .update(newDurationInSeconds)
    ).onComplete {
      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated endedAt on BreakoutRoom table!")
      case Failure(e) => DatabaseConnection.logger.error(s"Error updating endedAt BreakoutRoom: $e")
    }
  }

//  def update(meetingId: String, breakoutRoomModel: BreakoutRoomModel) = {
//    DatabaseConnection.db.run(
//      TableQuery[BreakoutRoomDbTableDef]
//        .filter(_.meetingId === meetingId)
//        .map(t => (t.stopwatch, t.running, t.active, t.time, t.accumulated, t.startedAt, t.endedAt, t.songTrack))
//        .update((getStopwatch(breakoutRoomModel), getRunning(breakoutRoomModel), getIsACtive(breakoutRoomModel), getTime(breakoutRoomModel), getAccumulated(breakoutRoomModel), getStartedAt(breakoutRoomModel), getEndedAt(breakoutRoomModel), getTrack(breakoutRoomModel))
//        )
//    ).onComplete {
//      case Success(rowsAffected) => DatabaseConnection.logger.debug(s"$rowsAffected row(s) updated on BreakoutRoom table!")
//      case Failure(e) => DatabaseConnection.logger.debug(s"Error updating BreakoutRoom: $e")
//    }
//  }
}