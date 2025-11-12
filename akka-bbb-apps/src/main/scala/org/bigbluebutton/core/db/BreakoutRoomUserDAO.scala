package org.bigbluebutton.core.db

import org.bigbluebutton.core.apps.breakout.BreakoutHdlrHelpers
import org.bigbluebutton.core.domain.{BreakoutRoom2x, BreakoutUser}
import org.bigbluebutton.core.models.RegisteredUser
import org.bigbluebutton.core.running.LiveMeeting
import slick.jdbc.PostgresProfile.api._

case class BreakoutRoomUserDbModel(
      breakoutRoomMeetingId:  String,
      breakoutRoomUserId:     String,
      meetingId:              String,
      userId:                 String,
      joinURL:                String,
      assignedAt:             Option[java.sql.Timestamp],
      inviteDismissedAt:      Option[java.sql.Timestamp],
)

class BreakoutRoomUserDbTableDef(tag: Tag) extends Table[BreakoutRoomUserDbModel](tag, None, "breakoutRoom_user") {
  val breakoutRoomMeetingId = column[String]("breakoutRoomMeetingId", O.PrimaryKey)
  val breakoutRoomUserId = column[String]("breakoutRoomUserId")
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val joinURL = column[String]("joinURL")
  val assignedAt = column[Option[java.sql.Timestamp]]("assignedAt")
  val inviteDismissedAt = column[Option[java.sql.Timestamp]]("inviteDismissedAt")
  override def * = (breakoutRoomMeetingId, breakoutRoomUserId, meetingId, userId, joinURL, assignedAt, inviteDismissedAt) <> (BreakoutRoomUserDbModel.tupled, BreakoutRoomUserDbModel.unapply)
}

object BreakoutRoomUserDAO {
  def prepareInsert(breakoutRoomMeetingId: String, meetingId: String, userId: String, joinURL: String, wasAssignedByMod: Boolean) = {
    TableQuery[BreakoutRoomUserDbTableDef].insertOrUpdate(
      BreakoutRoomUserDbModel(
        breakoutRoomMeetingId = breakoutRoomMeetingId,
        breakoutRoomUserId = "",
        meetingId = meetingId,
        userId = userId,
        joinURL = joinURL,
        assignedAt = wasAssignedByMod match {
          case true => Some(new java.sql.Timestamp(System.currentTimeMillis()))
          case false => None
        },
        inviteDismissedAt = None,
      )
    )
  }

  def updateUserMovedToRoom(meetingId: String, userId: String, tobreakoutRoomMeetingId: String, joinUrl: String) = {
    DatabaseConnection.enqueue(
      DBIO.seq(
        BreakoutRoomUserDAO.prepareInsert(tobreakoutRoomMeetingId, meetingId, userId, joinUrl, wasAssignedByMod = true)
      )
    )

    //it will remove previous rooms if necessary
    this.refreshBreakoutRoomsVisibleForUsers(meetingId, userId)
  }

  def updateUserJoined(breakoutRoomUser: BreakoutUser, parentMeetingUser: RegisteredUser, breakoutRoom: BreakoutRoom2x) = {
      DatabaseConnection.enqueue(
        sqlu"""UPDATE "breakoutRoom_user" SET
                "joinedAt" = current_timestamp
                "breakoutRoomUserId" = ${breakoutRoomUser.id}
                WHERE "meetingId" = ${parentMeetingUser.meetingId}
                AND "userId" = ${parentMeetingUser.id}
                AND "breakoutRoomMeetingId" = ${breakoutRoom.id}"""
      )
  }

  def insertBreakoutRoom(userId: String, room: BreakoutRoom2x, liveMeeting: LiveMeeting) = {
      for {
        (redirectToHtml5JoinURL, redirectJoinURL) <- BreakoutHdlrHelpers.getRedirectUrls(liveMeeting, userId, room.externalId, room.sequence.toString)
      } yield {
        DatabaseConnection.enqueue(BreakoutRoomUserDAO.prepareInsert(room.id, liveMeeting.props.meetingProp.intId, userId, redirectToHtml5JoinURL, wasAssignedByMod = false))
      }
  }

  def updateInviteDismissedAt(meetingId: String, userId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[BreakoutRoomUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .map(u => (u.inviteDismissedAt))
        .update(Some(new java.sql.Timestamp(System.currentTimeMillis())))
    )
  }

  def refreshBreakoutRoomsVisibleForUsers(meetingId: String, userId: String = "") = {
    val userCriteria: String = {
      if (userId.nonEmpty) {
        s"""AND u."userId" = '${userId}'"""
      } else {
        ""
      }
    }

    //Insert all rooms visible to the user into "breakoutRoom_user", as it will improve performance
    //Also remove all rooms that is visible to the user but should no longer be visible
    DatabaseConnection.enqueue(
      sqlu"""
        INSERT INTO "breakoutRoom_user" ("breakoutRoomMeetingId", "meetingId", "userId")
        SELECT b."breakoutRoomMeetingId", u."meetingId", u."userId"
        FROM "user" u
        JOIN "breakoutRoom" b ON b."parentMeetingId" = u."meetingId"
        WHERE u."meetingId" = ${meetingId} #${userCriteria}
        AND ( b."freeJoin" IS TRUE OR u."role" = 'MODERATOR')
        AND b."endedAt" IS NULL
        ON CONFLICT ("breakoutRoomMeetingId", "meetingId", "userId") DO NOTHING;

        DELETE FROM "breakoutRoom_user"
            WHERE ("breakoutRoomMeetingId", "meetingId", "userId")
            IN (
                select bu."breakoutRoomMeetingId", bu."meetingId", bu."userId"
                from "breakoutRoom_user" bu
                join "breakoutRoom" b using("breakoutRoomMeetingId")
                join "user" u using("userId")
                where u."meetingId" = ${meetingId} #${userCriteria}
                and bu."isLastAssignedRoom" is false
                and b."freeJoin" is not true
                and u."isModerator" is not true
            )
        """
    )

    }
}