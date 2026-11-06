package org.bigbluebutton.core.db

import slick.jdbc.PostgresProfile.api._

case class SharedNotesRevDbModel(
    meetingId:        String,
    sharedNotesExtId: String,
    rev:              Int,
    userId:           String,
    createdAt:        java.sql.Timestamp
)

class SharedNotesRevDbTableDef(tag: Tag) extends Table[SharedNotesRevDbModel](tag, None, "sharedNotes_rev") {
  val meetingId = column[String]("meetingId", O.PrimaryKey)
  val sharedNotesExtId = column[String]("sharedNotesExtId", O.PrimaryKey)
  val rev = column[Int]("rev", O.PrimaryKey)
  val userId = column[String]("userId")
  val createdAt = column[java.sql.Timestamp]("createdAt")
  val * = (meetingId, sharedNotesExtId, rev, userId, createdAt) <> (SharedNotesRevDbModel.tupled, SharedNotesRevDbModel.unapply)
}

object SharedNotesRevDAO {
  def insertNextRev(meetingId: String, sharedNotesExtId: String, userId: String) = {
    DatabaseConnection.enqueue(
      sqlu"""
          insert into "sharedNotes_rev"("meetingId", "sharedNotesExtId", "userId", "rev", "createdAt")
           select
             ${meetingId} as "meetingId",
             ${sharedNotesExtId} as "sharedNotesExtId",
             ${userId} as "userId",
             coalesce((  select max(rev)
                from "sharedNotes_rev"
                where "meetingId" = ${meetingId}
                and "sharedNotesExtId" = ${sharedNotesExtId}
             ),0) + 1 as "rev",
             current_timestamp as "createdAt"
          """
    )
  }
}