package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.{ WebcamStream}
import slick.jdbc.PostgresProfile.api._

case class UserCameraDbModel(
        streamId:      String,
        meetingId:     String,
        userId:        String,
        contentType:   String,
        hasAudio:      Boolean,
        focused:       Boolean,
)

class UserCameraDbTableDef(tag: Tag) extends Table[UserCameraDbModel](tag, None, "user_camera") {
  override def * = (
    streamId, meetingId, userId, contentType, hasAudio, focused) <> (UserCameraDbModel.tupled, UserCameraDbModel.unapply)
  val streamId = column[String]("streamId", O.PrimaryKey)
  val meetingId = column[String]("meetingId")
  val userId = column[String]("userId")
  val contentType = column[String]("contentType")
  val hasAudio = column[Boolean]("hasAudio")
  val focused = column[Boolean]("focused")
}

object UserCameraDAO {

  def insert(meetingId: String, webcam: WebcamStream) = {
    DatabaseConnection.enqueue(
      TableQuery[UserCameraDbTableDef].forceInsert(
        UserCameraDbModel(
          streamId = webcam.streamId,
          meetingId = meetingId,
          userId = webcam.userId,
          contentType = webcam.contentType,
          hasAudio = webcam.hasAudio,
          focused = webcam.focused,
        )
      )
    )
  }

  def delete(streamId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[UserCameraDbTableDef]
        .filter(_.streamId === streamId)
        .delete
    )
  }


}
