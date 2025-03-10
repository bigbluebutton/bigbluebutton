package org.bigbluebutton.core.db
import slick.jdbc.PostgresProfile.api._
import org.bigbluebutton.core.models.AudioGroup

case class AudioGroupDbModel(
    meetingId: String,
    groupId:   String,
    createdBy: String
)

class AudioGroupDbTableDef(tag: Tag) extends Table[AudioGroupDbModel](tag, None, "audioGroup") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val groupId = column[String]("groupId", O.PrimaryKey)
  val createdBy = column[String]("createdBy")

  val * = (meetingId, groupId, createdBy) <> (AudioGroupDbModel.tupled, AudioGroupDbModel.unapply)
}

object AudioGroupDAO {
  def insert(meetingId: String, audioGroup: AudioGroup) = {
    DatabaseConnection.enqueue(
      TableQuery[AudioGroupDbTableDef].forceInsert(
        AudioGroupDbModel(
          meetingId = meetingId,
          groupId = audioGroup.id,
          createdBy = audioGroup.createdBy
        )
      )
    )
  }

  def delete(meetingId: String, groupId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[AudioGroupDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.groupId === groupId)
        .delete
    )
  }
}
