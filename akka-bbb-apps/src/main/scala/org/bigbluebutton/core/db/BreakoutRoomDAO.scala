package org.bigbluebutton.core.db

import org.bigbluebutton.core.apps.BreakoutModel
import org.bigbluebutton.core.apps.breakout.BreakoutHdlrHelpers
import org.bigbluebutton.core.domain.BreakoutRoom2x
import org.bigbluebutton.core.models.{RegisteredUser, Roles, Users2x}
import org.bigbluebutton.core.running.LiveMeeting
import slick.jdbc.PostgresProfile.api._

import scala.util.Random

case class BreakoutRoomDbModel(
                                breakoutRoomId:               String,
                                parentMeetingId:              String,
                                externalId:                   String,
                                sequence:                     Int,
                                name:                         String,
                                shortName:                    String,
                                isDefaultName:                Boolean,
                                freeJoin:                     Boolean,
                                createdAt:                    java.sql.Timestamp,
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
  val createdAt = column[java.sql.Timestamp]("createdAt")
  val startedAt = column[Option[java.sql.Timestamp]]("startedAt")
  val endedAt = column[Option[java.sql.Timestamp]]("endedAt")
  val durationInSeconds = column[Int]("durationInSeconds")
  val sendInvitationToModerators = column[Boolean]("sendInvitationToModerators")
  val captureNotes = column[Boolean]("captureNotes")
  val captureSlides = column[Boolean]("captureSlides")
  override def * = (
    breakoutRoomId, parentMeetingId, externalId, sequence, name, shortName, isDefaultName, freeJoin,
    createdAt, startedAt, endedAt, durationInSeconds, sendInvitationToModerators, captureNotes, captureSlides
  ) <> (BreakoutRoomDbModel.tupled, BreakoutRoomDbModel.unapply)
}

object BreakoutRoomDAO {
  def insert(breakout: BreakoutModel, liveMeeting: LiveMeeting) = {
    val roomsCreatedAt = new java.sql.Timestamp(System.currentTimeMillis())

    DatabaseConnection.enqueue(DBIO.sequence(
      for {
        (_, room) <- breakout.rooms
      } yield {
        prepareInsertOrUpdate(room, breakout.durationInSeconds, breakout.sendInviteToModerators, roomsCreatedAt)
      }
    ).transactionally)

    //Insert assigned users
    DatabaseConnection.enqueue(DBIO.sequence(
      for {
        (_, room) <- breakout.rooms
        userId <- room.assignedUsers
        (redirectToHtml5JoinURL, redirectJoinURL) <- BreakoutHdlrHelpers.getRedirectUrls(liveMeeting, userId, room.externalId, room.sequence.toString())
      } yield {
        BreakoutRoomUserDAO.prepareInsert(room.id, liveMeeting.props.meetingProp.intId, userId, redirectToHtml5JoinURL, wasAssignedByMod = true)
      }
    ).transactionally)

    //Assign left users to a random room in case it is freeJoin
    val freeJoin = breakout.rooms.exists(r => r._2.freeJoin)
    if(freeJoin) {
      val assignedUsers = (for {
        (_, room) <- breakout.rooms
        userId <- room.assignedUsers
      } yield {
        userId
      }).toVector

      val nonAssignedUsers = Users2x.findAll(liveMeeting.users2x)
        .filterNot(user => assignedUsers.contains(user.intId))
        .filterNot(user => user.presenter)
        .filter(user => user.role != Roles.MODERATOR_ROLE || breakout.sendInviteToModerators)
        .map(_.intId)

      val roomsSeq = breakout.rooms.values.toSeq

      DatabaseConnection.enqueue(DBIO.sequence(
        for {
          userId <- nonAssignedUsers
          randomIndex = Random.nextInt(roomsSeq.length)
          room <- Some(roomsSeq(randomIndex))
          (redirectToHtml5JoinURL, redirectJoinURL) <- BreakoutHdlrHelpers.getRedirectUrls(liveMeeting, userId, room.externalId, room.sequence.toString())
        } yield {
          BreakoutRoomUserDAO.prepareInsert(room.id, liveMeeting.props.meetingProp.intId, userId, redirectToHtml5JoinURL, wasAssignedByMod = true)
        }
      ).transactionally)
    }

    //Insert all rooms that is visible for users
    BreakoutRoomUserDAO.refreshBreakoutRoomsVisibleForUsers(liveMeeting.props.meetingProp.intId)
  }

  def assignUserToRandomRoom(regUser: RegisteredUser, breakoutModel: BreakoutModel, liveMeeting: LiveMeeting): Unit = {
    if(breakoutModel.rooms.values.nonEmpty) {

      //Check if it should assign the user to a room
      if (breakoutModel.rooms.exists(r => r._2.freeJoin) &&
        (regUser.role != Roles.MODERATOR_ROLE || breakoutModel.sendInviteToModerators)
      ) {
        val rooms = breakoutModel.rooms.values.toSeq
        val room = rooms(Random.nextInt(rooms.length))

        for {
          (redirectToHtml5JoinURL, _) <- BreakoutHdlrHelpers.getRedirectUrls(liveMeeting, regUser.id, room.externalId, room.sequence.toString)
        } yield {
          DatabaseConnection.enqueue(
            BreakoutRoomUserDAO.prepareInsert(room.id, liveMeeting.props.meetingProp.intId, regUser.id, redirectToHtml5JoinURL, wasAssignedByMod = true)
          )
        }
      }

      //Insert all rooms that is visible for users
      BreakoutRoomUserDAO.refreshBreakoutRoomsVisibleForUsers(liveMeeting.props.meetingProp.intId, regUser.id)
    }
  }

  def prepareInsertOrUpdate(room: BreakoutRoom2x, durationInSeconds: Int, sendInvitationToModerators: Boolean, createdAt: java.sql.Timestamp) = {
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
        createdAt = createdAt,
        startedAt = None,
        endedAt = None,
        durationInSeconds = durationInSeconds,
        sendInvitationToModerators = sendInvitationToModerators,
        captureNotes = room.captureNotes,
        captureSlides = room.captureSlides,
      )
    )
  }

  def deletePermanently(meetingId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[BreakoutRoomDbTableDef]
        .filter(_.parentMeetingId === meetingId)
        .delete
    )
  }

  def updateRoomsStarted(meetingId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[BreakoutRoomDbTableDef]
        .filter(_.parentMeetingId === meetingId)
        .filter(_.startedAt.isEmpty)
        .map(u => u.startedAt)
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    )
  }

  def updateRoomsEnded(meetingId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[BreakoutRoomDbTableDef]
        .filter(_.parentMeetingId === meetingId)
        .filter(_.endedAt.isEmpty)
        .map(u => u.endedAt)
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    )
  }

  def updateRoomsDuration(parentMeetingId: String, newDurationInSeconds: Int) = {
    DatabaseConnection.enqueue(
      TableQuery[BreakoutRoomDbTableDef]
        .filter(_.parentMeetingId === parentMeetingId)
        .filter(_.endedAt.isEmpty)
        .map(u => u.durationInSeconds)
        .update(newDurationInSeconds)
    )
  }
}