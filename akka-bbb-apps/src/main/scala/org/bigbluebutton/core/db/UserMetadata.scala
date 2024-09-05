package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import slick.lifted.{ ProvenShape }

case class UserMetadataDbModel(
    meetingId: String,
    userId:    String,
    parameter: String,
    value:     String
)

class UserMetadataDbTableDef(tag: Tag) extends Table[UserMetadataDbModel](tag, "user_metadata") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val parameter = column[String]("parameter", O.PrimaryKey)
  val value = column[String]("value")

  override def * : ProvenShape[UserMetadataDbModel] = (meetingId, userId, parameter, value) <> (UserMetadataDbModel.tupled, UserMetadataDbModel.unapply)
}

object UserMetadataDAO {
  def insert(meetingId: String, userId: String, userMetadata: Map[String, String]) = {
    DatabaseConnection.enqueue(DBIO.sequence(
      for {
        metadata <- userMetadata
      } yield {
        TableQuery[UserMetadataDbTableDef].insertOrUpdate(
          UserMetadataDbModel(
            meetingId = meetingId,
            userId = userId,
            parameter = metadata._1,
            value = metadata._2
          )
        )
      }
    ).transactionally)
  }
}
