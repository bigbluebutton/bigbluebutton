package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.{ WebcamStream}
import slick.jdbc.PostgresProfile.api._

case class UserCameraDbModel(
        streamId:      String,
        meetingId:     String,
        userId:        String,
        contentType:   String,
        hasAudio:      Boolean,
        showAsContent: Boolean,
)

class UserCameraDbTableDef(tag: Tag) extends Table[UserCameraDbModel](tag, None, "user_camera") {
  override def * = (
    streamId, meetingId, userId, contentType, hasAudio, showAsContent) <> (UserCameraDbModel.tupled, UserCameraDbModel.unapply)
  val streamId = column[String]("streamId", O.PrimaryKey)
  val meetingId = column[String]("meetingId")
  val userId = column[String]("userId")
  val contentType = column[String]("contentType")
  val hasAudio = column[Boolean]("hasAudio")
  val showAsContent = column[Boolean]("showAsContent")
}

object UserCameraDAO {

  private def unsetShowAsContentExcept(meetingId: String, streamId: String) = {
    TableQuery[UserCameraDbTableDef]
      .filter(_.meetingId === meetingId)
      .filter(_.streamId =!= streamId)
      .filter(_.showAsContent)
      .map(cam => cam.showAsContent)
      .update(false)
  }

  def insert(meetingId: String, webcam: WebcamStream) = {
    val insertAction = TableQuery[UserCameraDbTableDef].forceInsert(
      UserCameraDbModel(
        streamId = webcam.streamId,
        meetingId = meetingId,
        userId = webcam.userId,
        contentType = webcam.contentType,
        hasAudio = webcam.hasAudio,
        showAsContent = webcam.showAsContent,
      )
    )

    val action =
      if (webcam.showAsContent) DBIO.seq(unsetShowAsContentExcept(meetingId, webcam.streamId), insertAction)
      else insertAction

    DatabaseConnection.enqueue(action)
  }

  def updateShowAsContent(meetingId: String, streamId: String, showAsContent: Boolean) = {
    val updateAction =
      TableQuery[UserCameraDbTableDef]
        .filter(_.meetingId === meetingId)
        .filter(_.streamId === streamId)
        .map(cam => cam.showAsContent)
        .update(showAsContent)

    val action =
      if (showAsContent) DBIO.seq(unsetShowAsContentExcept(meetingId, streamId), updateAction)
      else updateAction

    DatabaseConnection.enqueue(action)
  }

  def delete(streamId: String) = {
    DatabaseConnection.enqueue(
      TableQuery[UserCameraDbTableDef]
        .filter(_.streamId === streamId)
        .delete
    )
  }

}
