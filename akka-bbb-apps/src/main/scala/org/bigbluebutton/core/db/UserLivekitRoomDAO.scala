package org.bigbluebutton.core.db

import PostgresProfile.api._
import slick.lifted.{ ProvenShape }
import org.bigbluebutton.core.models.LiveKitMembership

case class UserLivekitRoomDbModel(
    meetingId: String,
    userId:    String,
    roomName:  String,
    purpose:   String,
    token:     Option[String]
)

class UserLivekitRoomDbTableDef(tag: Tag) extends Table[UserLivekitRoomDbModel](tag, "user_livekit_room") {
  val meetingId = column[String]("meetingId")
  val userId = column[String]("userId")
  val roomName = column[String]("roomName")
  val purpose = column[String]("purpose")
  val token = column[Option[String]]("token")

  override def * : ProvenShape[UserLivekitRoomDbModel] = (
    meetingId, userId, roomName, purpose, token
  ) <> (UserLivekitRoomDbModel.tupled, UserLivekitRoomDbModel.unapply)

  def pk = primaryKey("user_livekit_room_pkey", (meetingId, userId, roomName))
}

object UserLivekitRoomDAO {
  private val table = TableQuery[UserLivekitRoomDbTableDef]

  def upsert(model: UserLivekitRoomDbModel): Unit = {
    DatabaseConnection.enqueue(table.insertOrUpdate(model))
  }

  def setToken(
      meetingId: String,
      userId:    String,
      roomName:  String,
      token:     String
  ): Unit = {
    val q = table
      .filter(r => r.meetingId === meetingId && r.userId === userId && r.roomName === roomName)
      .map(r => r.token)
    DatabaseConnection.enqueue(q.update(Some(token)))
  }

  def delete(meetingId: String, userId: String, roomName: String): Unit = {
    DatabaseConnection.enqueue(
      table.filter(r => r.meetingId === meetingId && r.userId === userId && r.roomName === roomName).delete
    )
  }

  def deleteByRoom(meetingId: String, roomName: String): Unit = {
    DatabaseConnection.enqueue(
      table.filter(r => r.meetingId === meetingId && r.roomName === roomName).delete
    )
  }

  def deleteByUser(meetingId: String, userId: String): Unit = {
    DatabaseConnection.enqueue(
      table.filter(r => r.meetingId === meetingId && r.userId === userId).delete
    )
  }

  def toUserLivekitRoomDbModel(meetingId: String, m: LiveKitMembership): UserLivekitRoomDbModel = {
    UserLivekitRoomDbModel(
      meetingId = meetingId,
      userId = m.userId,
      roomName = m.roomName,
      purpose = m.purpose,
      token = m.token
    )
  }
}
