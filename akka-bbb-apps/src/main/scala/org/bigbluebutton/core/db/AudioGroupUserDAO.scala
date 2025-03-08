package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import org.bigbluebutton.common2.msgs.AudioGroupParticipant

case class AudioGroupUserDbModel(
    groupId:         String,
    meetingId:       String,
    userId:          String,
    participantType: String,
    active:          Boolean
)

class AudioGroupUserDbTableDef(tag: Tag) extends Table[AudioGroupUserDbModel](tag, None, "user_audioGroup") {
  val groupId = column[String]("groupId", O.PrimaryKey)
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val participantType = column[String]("participantType")
  val active = column[Boolean]("active")
  override def * = (groupId, meetingId, userId, participantType, active) <>
    (AudioGroupUserDbModel.tupled, AudioGroupUserDbModel.unapply)
}

object AudioGroupUserDAO {
  def insert(meetingId: String, groupId: String, agp: AudioGroupParticipant) = {
    AudioGroupUserDAO.insertUser(meetingId, groupId, agp.id, agp.participantType, agp.active)
  }

  def insertUser(meetingId: String, groupId: String, userId: String, participantType: String, active: Boolean) = {
    DatabaseConnection.enqueue(
      TableQuery[AudioGroupUserDbTableDef].insertOrUpdate(
        AudioGroupUserDbModel(
          userId = userId,
          groupId = groupId,
          meetingId = meetingId,
          participantType = participantType,
          active = active
        )
      )
    )
  }

  def update(meetingId: String, groupId: String, agp: AudioGroupParticipant) = {
    DatabaseConnection.enqueue(
      TableQuery[AudioGroupUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.groupId === groupId)
        .filter(_.userId === agp.id)
        .map(nagp => (nagp.active, nagp.participantType))
        .update((agp.active, agp.participantType))
    )
  }

  def delete(meetingId: String, groupId: String, userId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[AudioGroupUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.groupId === groupId)
        .filter(_.userId === userId)
        .delete
    )
  }

  def deleteAll(meetingId: String, groupId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[AudioGroupUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.groupId === groupId)
        .delete
    )
  }

  def deleteAll(meetingId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[AudioGroupUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .delete
    )
  }

  def deleteAll() = {
    DatabaseConnection.enqueue(
      TableQuery[AudioGroupUserDbTableDef].delete
    )
  }

  def getActiveUsers(meetingId: String, groupId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[AudioGroupUserDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.groupId === groupId)
        .filter(_.active === true)
        .result
    )
  }
}
