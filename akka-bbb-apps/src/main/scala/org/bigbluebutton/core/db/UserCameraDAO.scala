package org.bigbluebutton.core.db

import org.bigbluebutton.core.models.{ WebcamStream}
import slick.jdbc.PostgresProfile.api._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.{Failure, Success}

case class UserCameraDbModel(
        streamId:        String,
        userId:        String,
)

class UserCameraDbTableDef(tag: Tag) extends Table[UserCameraDbModel](tag, None, "user_camera") {
  override def * = (
    streamId, userId) <> (UserCameraDbModel.tupled, UserCameraDbModel.unapply)
  val streamId = column[String]("streamId", O.PrimaryKey)
  val userId = column[String]("userId")
}

object UserCameraDAO {

  def insert(webcam: WebcamStream) = {
    DatabaseConnection.db.run(
      TableQuery[UserCameraDbTableDef].forceInsert(
        UserCameraDbModel(
          streamId = webcam.streamId,
            userId = webcam.userId
        )
      )
    ).onComplete {
        case Success(rowsAffected) => {
          DatabaseConnection.logger.debug(s"$rowsAffected row(s) inserted on user_webcam table!")
        }
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error inserting webcam: $e")
      }
  }

  def delete(streamId: String) = {
    DatabaseConnection.db.run(
      TableQuery[UserCameraDbTableDef]
        .filter(_.streamId === streamId)
        .delete
    ).onComplete {
        case Success(rowsAffected) => DatabaseConnection.logger.debug(s"Webcam ${streamId} deleted")
        case Failure(e)            => DatabaseConnection.logger.debug(s"Error deleting webcam: $e")
      }
  }


}
