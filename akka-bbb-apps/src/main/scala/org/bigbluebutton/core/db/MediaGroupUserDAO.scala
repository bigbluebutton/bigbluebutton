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
