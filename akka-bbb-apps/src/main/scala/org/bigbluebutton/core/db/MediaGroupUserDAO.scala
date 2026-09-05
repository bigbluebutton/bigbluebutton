package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import org.bigbluebutton.common2.msgs.MediaGroupParticipant

case class MediaGroupUserDbModel(
    groupId:   String,
    meetingId: String,
    userId:    String,
    sender:    Boolean,
    receiver:  Boolean,
    active:    Boolean
)

class MediaGroupUserDbTableDef(tag: Tag) extends Table[MediaGroupUserDbModel](tag, None, "user_mediaGroup") {
  val groupId = column[String]("groupId", O.PrimaryKey)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val sender = column[Boolean]("sender")
  val receiver = column[Boolean]("receiver")
  val active = column[Boolean]("active")
  override def * = (groupId, meetingId, userId, sender, receiver, active) <>
    (MediaGroupUserDbModel.tupled, MediaGroupUserDbModel.unapply)
}

object MediaGroupUserDAO {
  def insert(meetingId: String, groupId: String, mgp: MediaGroupParticipant) = {
    MediaGroupUserDAO.insertUser(meetingId, groupId, mgp.userId, mgp.sender, mgp.receiver, mgp.active)
  }

  def insertUser(meetingId: String, groupId: String, userId: String, sender: Boolean, receiver: Boolean, active: Boolean) = {
    DatabaseConnection.enqueue(
      TableQuery[MediaGroupUserDbTableDef].insertOrUpdate(
        MediaGroupUserDbModel(
          userId = userId,
          groupId = groupId,
          meetingId = meetingId,
          sender = sender,
          receiver = receiver,
          active = active
        )
      )
    )
  }

  // insertUser that no-ops when the group row does not exist yet (public
  // groups are created lazily)
  def insertUserIfGroupExists(meetingId: String, groupId: String, userId: String, sender: Boolean, receiver: Boolean, active: Boolean) = {
    DatabaseConnection.enqueue(
      sqlu"""
        INSERT INTO "user_mediaGroup" ("meetingId", "userId", "groupId", "sender", "receiver", "active")
        SELECT ${meetingId}, ${userId}, ${groupId}, ${sender}, ${receiver}, ${active}
        WHERE EXISTS (
          SELECT 1 FROM "mediaGroup"
          WHERE "meetingId" = ${meetingId} AND "groupId" = ${groupId}
        )
        AND EXISTS (
          SELECT 1 FROM "user"
          WHERE "meetingId" = ${meetingId} AND "userId" = ${userId}
        )
        ON CONFLICT ("meetingId", "userId", "groupId")
        DO UPDATE SET "sender" = EXCLUDED."sender", "receiver" = EXCLUDED."receiver", "active" = EXCLUDED."active"
      """
    )
  }

  // DB-side enrollment for audio-only transferred listeners (postgres-only
  // users, absent from Users2x) once lazily-created public groups appear.
  def insertTransferredUsersIntoGroup(meetingId: String, groupId: String) = {
    DatabaseConnection.enqueue(
      sqlu"""
        INSERT INTO "user_mediaGroup" ("meetingId", "userId", "groupId", "sender", "receiver", "active")
        SELECT "meetingId", "userId", ${groupId}, true, true, true
        FROM "user"
        WHERE "meetingId" = ${meetingId}
          AND "transferredFromParentMeeting" IS TRUE
          AND "loggedOut" IS FALSE
        ON CONFLICT ("meetingId", "userId", "groupId") DO NOTHING
      """
    )
  }

  def update(meetingId: String, groupId: String, mgp: MediaGroupParticipant) = {
    DatabaseConnection.enqueue(
      TableQuery[MediaGroupUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.groupId === groupId)
        .filter(_.userId === mgp.userId)
        .map(nmgp => (nmgp.sender, nmgp.receiver, nmgp.active))
        .update((mgp.sender, mgp.receiver, mgp.active))
    )
  }

  def delete(meetingId: String, groupId: String, userId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[MediaGroupUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.groupId === groupId)
        .filter(_.userId === userId)
        .delete
    )
  }

  def deleteAllForUser(meetingId: String, userId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[MediaGroupUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.userId === userId)
        .delete
    )
  }

  def deleteAll(meetingId: String, groupId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[MediaGroupUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.groupId === groupId)
        .delete
    )
  }

  def deleteAll(meetingId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[MediaGroupUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .delete
    )
  }

  def deleteAll() = {
    DatabaseConnection.enqueue(
      TableQuery[MediaGroupUserDbTableDef].delete
    )
  }

  def getActiveUsers(meetingId: String, groupId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[MediaGroupUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.groupId === groupId)
        .filter(_.active === true)
        .result
    )
  }
}
