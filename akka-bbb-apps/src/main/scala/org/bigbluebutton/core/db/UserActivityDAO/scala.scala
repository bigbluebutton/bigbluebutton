package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._
import slick.lifted.ProvenShape

case class UserActivityDbModel(
                                meetingId:    String,
                                userId:       String,
                                bucketTime:   java.sql.Timestamp,
                                activityName: String,
                                count:        Int,
                              )

class UserActivityDbTableDef(tag: Tag) extends Table[UserActivityDbModel](tag, "user_metadata") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val userId = column[String]("userId", O.PrimaryKey)
  val bucketTime = column[java.sql.Timestamp]("bucketTime", O.PrimaryKey)
  val activityName = column[String]("activityName", O.PrimaryKey)
  val count = column[Int]("count")

  override def * : ProvenShape[UserActivityDbModel] = (meetingId, userId, bucketTime, activityName, count) <> (UserActivityDbModel.tupled, UserActivityDbModel.unapply)
}

object UserActivityDAO {
  def insert(meetingId: String, userId: String, activityName: String) = {

    DatabaseConnection.enqueue(
      sqlu"""
       INSERT INTO "user_activity" (
        "meetingId",
        "userId",
        "bucketTime",
        "activityName",
        "count"
    )
    VALUES (
       ${meetingId},
       ${userId},
       date_trunc('minute',current_timestamp),
       ${activityName},
       1
    )
    ON CONFLICT ("meetingId", "userId", "bucketTime", "activityName")
    DO UPDATE SET
        "count" = "user_activity"."count" + 1;
        """
    )
  }
}