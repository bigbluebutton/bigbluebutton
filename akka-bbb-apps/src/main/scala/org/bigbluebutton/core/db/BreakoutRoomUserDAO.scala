package org.bigbluebutton.core.db

import org.bigbluebutton.core.apps.breakout.BreakoutHdlrHelpers
import org.bigbluebutton.core.domain.{BreakoutRoom2x, BreakoutUser}
import org.bigbluebutton.core.models.RegisteredUser
import org.bigbluebutton.core.running.LiveMeeting
import slick.jdbc.PostgresProfile.api._
import scala.concurrent.ExecutionContext.Implicits.global

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
    val assignedAt: Option[java.sql.Timestamp] = if (wasAssignedByMod) Some(new java.sql.Timestamp(System.currentTimeMillis())) else None

    sqlu"""
        INSERT INTO "breakoutRoom_user" ("breakoutRoomMeetingId", "meetingId", "userId", "joinURL", "assignedAt", "inviteDismissedAt")
        VALUES (
       ${breakoutRoomMeetingId},
       ${meetingId},
       ${userId},
       ${joinURL},
       $assignedAt,
       null
    )
        ON CONFLICT ("breakoutRoomMeetingId", "meetingId", "userId")
        DO UPDATE SET
        "assignedAt" = coalesce($assignedAt, "breakoutRoom_user"."assignedAt"),
        "joinURL" = ${joinURL},
        "inviteDismissedAt" = null
        """
  }

  def updateUserMovedToRoom(meetingId: String, userId: String, toBreakoutRoomMeetingId: String, joinUrl: String) = {
    DatabaseConnection.enqueue(
      DBIO.seq(
        BreakoutRoomUserDAO.prepareInsert(toBreakoutRoomMeetingId, meetingId, userId, joinUrl, wasAssignedByMod = true)
      )
    )

    //it will remove previous rooms if necessary
    this.refreshBreakoutRoomsVisibleForUsers(meetingId, userId)
  }

  def updateUserJoined(breakoutRoomUser: BreakoutUser, parentMeetingUser: RegisteredUser, breakoutRoom: BreakoutRoom2x) = {
      // Single source of presence truth, computed once per audit tick and reused below for both the
      // self-correcting presence UPDATE and the buid-set log (avoids re-evaluating the same EXISTS).
      val presenceCheck =
        sql"""select exists (
                select 1
                from "user"
                where "user"."meetingId" = ${breakoutRoom.id}
                and "user"."userId" = ${breakoutRoomUser.userId}
                and "currentlyInMeeting" is true
              )""".as[Boolean].head

      // (a) ALWAYS-RUNNING presence update: self-corrects in_room if the join-time read race locked it
      //     wrong. Guarded so it writes ONLY when the stored value actually differs from the computed
      //     truth: in steady state (already correct) IS DISTINCT FROM is false -> no match, no write, no
      //     trigger, no dead-tuple churn; when stuck wrong it matches and corrects on the next tick.
      def presenceUpdate(presenceExists: Boolean) =
        sqlu"""UPDATE "breakoutRoom_user" SET
                "isUserCurrentlyInRoom" = ${presenceExists}
                WHERE "meetingId" = ${parentMeetingUser.meetingId}
                AND "userId" = ${parentMeetingUser.id}
                AND "breakoutRoomMeetingId" = ${breakoutRoom.id}
                AND "isUserCurrentlyInRoom" IS DISTINCT FROM ${presenceExists}"""

      // (b) ONE-SHOT breakoutRoomUserId/joinedAt update: keeps the optimization (runs once), guarded by
      //     the stale-write check. No longer touches isUserCurrentlyInRoom - that is (a)'s job now.
      val buidUpdate =
        sqlu"""UPDATE "breakoutRoom_user" SET
                "breakoutRoomUserId" = ${breakoutRoomUser.userId},
                "joinedAt" = current_timestamp
                WHERE "meetingId" = ${parentMeetingUser.meetingId}
                AND "userId" = ${parentMeetingUser.id}
                AND "breakoutRoomMeetingId" = ${breakoutRoom.id}
                AND "breakoutRoomUserId" is distinct from ${breakoutRoomUser.userId}"""

      DatabaseConnection.enqueue(
        (for {
          presenceExists <- presenceCheck
          _ <- presenceUpdate(presenceExists)
          rowsAffected <- buidUpdate
        } yield {
          // Fires once, at buid-set: a presenceExists=false here IS the join-time read race firing.
          if (rowsAffected != 0) {
            DatabaseConnection.logger.info(
              "breakoutAudit: presence at buid-set parentUserId={} breakoutRoomId={} breakoutUserId={} presenceExists={}",
              parentMeetingUser.id, breakoutRoom.id, breakoutRoomUser.userId, presenceExists.toString
            )
          }
        })
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
    //Insert all rooms visible to the user into "breakoutRoom_user", as it will improve performance
    //Also remove all rooms that is visible to the user but should no longer be visible
    DatabaseConnection.enqueue(
      sqlu"""
        INSERT INTO "breakoutRoom_user" ("breakoutRoomMeetingId", "meetingId", "userId")
        SELECT b."breakoutRoomMeetingId", u."meetingId", u."userId"
        FROM "user" u
        JOIN "breakoutRoom" b ON b."meetingId" = u."meetingId" AND b."endedAt" IS NULL
        WHERE u."meetingId" = $meetingId
        AND ($userId = '' OR u."userId" = $userId)
        AND ( b."freeJoin" IS TRUE OR u."role" = 'MODERATOR')
        ON CONFLICT ("breakoutRoomMeetingId", "meetingId", "userId") DO NOTHING;

        DELETE FROM "breakoutRoom_user"
            WHERE ("breakoutRoomMeetingId", "meetingId", "userId")
            IN (
                select bu."breakoutRoomMeetingId", bu."meetingId", bu."userId"
                from "breakoutRoom_user" bu
                join "breakoutRoom" b using("breakoutRoomMeetingId")
                join "user" u using("userId")
                where u."meetingId" = $meetingId
                and ($userId = '' OR u."userId" = $userId)
                and bu."isLastAssignedRoom" is false
                and b."freeJoin" is not true
                and u."isModerator" is not true
            )
        """
    )

    }
}
