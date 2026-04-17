package org.bigbluebutton.core.db
import slick.jdbc.PostgresProfile.api._
import org.bigbluebutton.core.models.MediaGroup

case class MediaGroupDbModel(
    meetingId: String,
    groupId:   String,
    mediaType: String,
    locked:    Boolean,
    record:    Boolean,
    createdBy: String
)

class MediaGroupDbTableDef(tag: Tag) extends Table[MediaGroupDbModel](tag, None, "mediaGroup") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val groupId = column[String]("groupId", O.PrimaryKey)
  val mediaType = column[String]("mediaType")
  val locked = column[Boolean]("locked")
  val record = column[Boolean]("record")
  val createdBy = column[String]("createdBy")

  val * = (meetingId, groupId, mediaType, locked, record, createdBy) <> (MediaGroupDbModel.tupled, MediaGroupDbModel.unapply)
}

object MediaGroupDAO {
  def insert(meetingId: String, mediaGroup: MediaGroup) = {
    DatabaseConnection.enqueue(
      TableQuery[MediaGroupDbTableDef].forceInsert(
        MediaGroupDbModel(
          meetingId = meetingId,
          groupId = mediaGroup.id,
          mediaType = mediaGroup.mediaType,
          locked = mediaGroup.locked,
          record = mediaGroup.record,
          createdBy = mediaGroup.createdBy
        )
      )
    )
  }

  def delete(meetingId: String, groupId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[MediaGroupDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.groupId === groupId)
        .delete
    )
  }
}
