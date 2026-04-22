package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import slick.lifted.{ ProvenShape }

case class UserLivekitDbModel(
    meetingId:         String,
    userId:            String,
    livekitToken:      String,
)

class UserLivekitDbTableDef(tag: Tag) extends Table[UserLivekitDbModel](tag, "user_livekit") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val livekitToken = column[String]("livekitToken")

  override def * : ProvenShape[UserLivekitDbModel] = (
    meetingId,
    userId,
    livekitToken
  ) <> (UserLivekitDbModel.tupled, UserLivekitDbModel.unapply)
}

object UserLivekitDAO {
  def insert(meetingId: String, userId: String, livekitToken: String) = {
    DatabaseConnection.enqueue(
      TableQuery[UserLivekitDbTableDef].insertOrUpdate(
        UserLivekitDbModel(
          meetingId = meetingId,
          userId = userId,
          livekitToken = livekitToken
        )
      )
    )
  }
}
